#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const nodeCrypto = require("crypto");
const { EN_STOP_WORDS } = require("./en/stop-words");
const { ES_STOP_WORDS } = require("./es/stop-words");
const { PT_STOP_WORDS } = require("./pt/stop-words");

type Language = "en" | "es" | "pt";

// Multilingual stop words
const STOP_WORDS: Record<Language, Set<string>> = {
  en: EN_STOP_WORDS,
  es: ES_STOP_WORDS,
  pt: PT_STOP_WORDS,
};

// Extract language from file path
function extractLanguageFromPath(filePath: string) {
  const pathParts = filePath.split("/");
  const contentIndex = pathParts.findIndex((part) => part === "content");

  if (contentIndex !== -1 && contentIndex + 1 < pathParts.length) {
    const lang = pathParts[contentIndex + 1] as Language;
    // Return the language if it's supported, otherwise default to English
    return STOP_WORDS[lang] ? lang : "en";
  }

  // Fallback to English
  return "en";
}

// Extract headings from markdown content
function extractHeadings(content: string) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: { level: number; text: string; slug: string }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    headings.push({
      level,
      text,
      slug: text
        .toLowerCase()
        .replace(/[^a-z0-9\u00C0-\u017F]+/g, "-") // Support accented characters
        .replace(/^-|-$/g, ""),
    });
  }

  return headings;
}

// Extract keywords with frequency and filtering (now language-aware)
function extractKeywords(
  text: string,
  title = "",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headings: any[] = [],
  language: Language = "en"
) {
  // Get stop words for the detected language
  const stopWords = STOP_WORDS[language] || STOP_WORDS.en;

  // Combine title (3x weight), headings (2x weight), and content (1x weight)
  let weightedText = "";
  weightedText += (title + " ").repeat(3);
  weightedText +=
    headings
      .map((h) => h.text)
      .join(" ")
      .repeat(2) + " ";
  weightedText += text;

  // Extract single words
  const singleWords = extractSingleWords(weightedText, stopWords);

  // Extract important phrases (2-grams and 3-grams)
  const phrases = extractImportantPhrases(weightedText, language);

  // Extract technical terms and proper nouns
  const technicalTerms = extractTechnicalTerms(weightedText);

  // Combine all keywords and remove duplicates
  const allKeywords = [...singleWords, ...phrases, ...technicalTerms];
  const uniqueKeywords = [...new Set(allKeywords)] as string[];

  // Sort by relevance (phrases and technical terms get priority)
  const sortedKeywords = uniqueKeywords.sort((a, b) => {
    const aIsPhrase = a.includes(" ") || a.includes("-");
    const bIsPhrase = b.includes(" ") || b.includes("-");
    const aIsTechnical =
      /^[A-Z][a-z]*(?:[A-Z][a-z]*)*$/.test(a) || a.includes("-");
    const bIsTechnical =
      /^[A-Z][a-z]*(?:[A-Z][a-z]*)*$/.test(b) || b.includes("-");

    if (aIsPhrase && !bIsPhrase) return -1;
    if (!aIsPhrase && bIsPhrase) return 1;
    if (aIsTechnical && !bIsTechnical) return -1;
    if (!aIsTechnical && bIsTechnical) return 1;
    return 0;
  });

  return sortedKeywords.slice(0, 100); // Increased from 50 to capture more terms
}

// Extract single words with improved filtering
function extractSingleWords(text: string, stopWords: Set<string>) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u00C0-\u017F-]/g, " ") // Keep accented characters and hyphens
    .split(/\s+/)
    .filter((word) => {
      return (
        word.length > 2 &&
        !stopWords.has(word) &&
        !/^\d+$/.test(word) && // Remove pure numbers
        !/^[a-z\u00C0-\u017F]$/.test(word) && // Remove single letters
        !isCommonTechnicalNoise(word) // Remove technical noise
      );
    });

  // Count word frequency
  const wordCount: Record<string, number> = {};
  words.forEach((word: string) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Return top words by frequency
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 40) // Reduced to make room for phrases
    .map(([word]) => word);
}

// Extract important phrases (2-grams and 3-grams)
function extractImportantPhrases(text: string, language: Language) {
  const phrases = new Set();

  // Preserve case for proper nouns and technical terms
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  sentences.forEach((sentence) => {
    // Extract 2-grams and 3-grams
    const words = sentence.split(/\s+/).filter((w) => w.length > 0);

    // 2-grams
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (isImportantPhrase(bigram, language)) {
        phrases.add(bigram.toLowerCase());
      }
    }

    // 3-grams
    for (let i = 0; i < words.length - 2; i++) {
      const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (isImportantPhrase(trigram, language)) {
        phrases.add(trigram.toLowerCase());
      }
    }

    // 4-grams for very specific technical terms
    for (let i = 0; i < words.length - 3; i++) {
      const fourgram = `${words[i]} ${words[i + 1]} ${words[i + 2]} ${
        words[i + 3]
      }`;
      if (isVerySpecificTerm(fourgram)) {
        phrases.add(fourgram.toLowerCase());
      }
    }
  });

  return Array.from(phrases);
}

// Check if a phrase is important enough to index
function isImportantPhrase(phrase: string, language: Language) {
  const lowerPhrase = phrase.toLowerCase();
  const words = lowerPhrase.split(/\s+/);

  // Skip if contains too many stop words
  const stopWords = STOP_WORDS[language] || STOP_WORDS.en;
  const stopWordCount = words.filter((w) => stopWords.has(w)).length;
  if (stopWordCount > words.length / 2) return false;

  // Skip very short phrases
  if (words.every((w) => w.length < 3)) return false;

  // Important technical patterns
  const technicalPatterns = [
    // Blockchain & Crypto
    /proof of \w+/,
    /consensus \w+/,
    /smart contract/,
    /private key/,
    /public key/,
    /hash function/,
    /merkle tree/,
    /block chain/,
    /distributed ledger/,
    /cryptocurrency/,
    /digital signature/,
    /elliptic curve/,

    // Mathematics
    /swinnerton[\s-]*dyer/,
    /birch[\s-]*swinnerton[\s-]*dyer/,
    /riemann hypothesis/,
    /millennium problem/,
    /prime number/,
    /number theory/,
    /algebraic geometry/,
    /differential equation/,
    /linear algebra/,
    /field theory/,
    /group theory/,
    /galois theory/,
    /diophantine equation/,

    // Computer Science
    /machine learning/,
    /artificial intelligence/,
    /neural network/,
    /deep learning/,
    /data structure/,
    /algorithm analysis/,
    /computational complexity/,
    /big o notation/,
    /dynamic programming/,
    /graph theory/,
    /binary search/,
    /bubble sort/,
    /merge sort/,
    /quick sort/,

    // Programming
    /object oriented/,
    /functional programming/,
    /design pattern/,
    /test driven/,
    /dependency injection/,
    /observer pattern/,
    /factory pattern/,
    /single responsibility/,
    /open closed/,

    // Physics
    /quantum \w+/,
    /special relativity/,
    /general relativity/,
    /electromagnetic field/,
    /wave function/,
    /uncertainty principle/,

    // Economics
    /supply chain/,
    /market cap/,
    /economic growth/,
    /inflation rate/,
    /central bank/,

    // General academic terms
    /peer review/,
    /research paper/,
    /case study/,
    /empirical evidence/,
    /statistical significance/,
  ];

  // Check against technical patterns
  if (technicalPatterns.some((pattern) => pattern.test(lowerPhrase))) {
    return true;
  }

  // Capitalized terms (likely proper nouns or technical terms)
  if (/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/.test(phrase)) {
    return true;
  }

  // Terms with hyphens (often technical)
  if (/-/.test(phrase) && words.length <= 3) {
    return true;
  }

  // Mathematical expressions
  if (
    /\b\w+\s+(?:theorem|conjecture|hypothesis|lemma|corollary|axiom|formula|equation|inequality)\b/.test(
      lowerPhrase
    )
  ) {
    return true;
  }

  return false;
}

// Check for very specific technical terms (4+ words)
function isVerySpecificTerm(phrase: string) {
  const lowerPhrase = phrase.toLowerCase();

  const specificTerms = [
    /birch and swinnerton[\s-]*dyer conjecture/,
    /riemann zeta function hypothesis/,
    /millennium prize problem/,
    /proof of work consensus/,
    /proof of stake consensus/,
    /elliptic curve digital signature/,
    /advanced encryption standard/,
    /secure hash algorithm/,
    /public key infrastructure/,
  ];

  return specificTerms.some((pattern) => pattern.test(lowerPhrase));
}

// Extract technical terms and proper nouns
function extractTechnicalTerms(text: string) {
  const terms = new Set<string>();

  // Find capitalized words and phrases (proper nouns, technical terms)
  const capitalizedMatches =
    text.match(/\b[A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*\b/g) || [];
  capitalizedMatches.forEach((match: string) => {
    if (match.length > 3 && !isCommonWord(match.toLowerCase())) {
      terms.add(match.toLowerCase());
    }
  });

  // Find hyphenated technical terms
  const hyphenatedMatches =
    text.match(/\b[a-zA-Z]+-[a-zA-Z]+(?:-[a-zA-Z]+)*\b/g) || [];
  hyphenatedMatches.forEach((match: string) => {
    if (match.length > 4 && !isCommonWord(match.toLowerCase())) {
      terms.add(match.toLowerCase());
    }
  });

  // Find mathematical notation and formulas (preserve some special cases)
  const mathMatches = text.match(/\b[A-Z]+(?:\([^)]+\))?\b/g) || [];
  mathMatches.forEach((match: string) => {
    if (match.length >= 2 && match.length <= 10 && /[A-Z]/.test(match)) {
      terms.add(match.toLowerCase());
    }
  });

  return Array.from(terms);
}

// Check if a word is common and should be filtered out
function isCommonWord(word: string) {
  const commonWords = new Set([
    "the",
    "and",
    "for",
    "are",
    "but",
    "not",
    "you",
    "all",
    "can",
    "had",
    "her",
    "was",
    "one",
    "our",
    "out",
    "day",
    "get",
    "has",
    "him",
    "his",
    "how",
    "man",
    "new",
    "now",
    "old",
    "see",
    "two",
    "way",
    "who",
    "boy",
    "did",
    "its",
    "let",
    "put",
    "say",
    "she",
    "too",
    "use",
  ]);
  return commonWords.has(word);
}

// Check if a word is technical noise
function isCommonTechnicalNoise(word: string) {
  const noiseWords = new Set([
    "img",
    "src",
    "alt",
    "div",
    "span",
    "class",
    "style",
    "href",
    "http",
    "https",
    "www",
    "com",
    "org",
    "net",
    "edu",
    "jpg",
    "png",
    "gif",
    "pdf",
    "html",
    "css",
    "js",
    "jsx",
    "tsx",
    "json",
    "xml",
    "svg",
    "webp",
  ]);
  return noiseWords.has(word);
}

// Extract key sentences for summary
function extractSummary(content: string) {
  // Split into paragraphs
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p: string) => p.replace(/\n/g, " ").trim())
    .filter((p: string) => p.length > 50); // Filter out short paragraphs

  if (paragraphs.length === 0) return "";

  let summary = "";

  // First paragraph (introduction)
  if (paragraphs[0]) {
    summary += paragraphs[0] + "\n\n";
  }

  // If there are multiple paragraphs, add the last one (conclusion)
  if (paragraphs.length > 1) {
    summary += paragraphs[paragraphs.length - 1];
  }

  // If we have many paragraphs, add one from the middle
  if (paragraphs.length > 4) {
    const middleIndex = Math.floor(paragraphs.length / 2);
    summary += "\n\n" + paragraphs[middleIndex];
  }

  // Trim to reasonable length (~300 words)
  const words = summary.split(/\s+/);
  if (words.length > 300) {
    summary = words.slice(0, 300).join(" ") + "...";
  }

  return summary;
}

// Clean content by removing markdown syntax
function cleanContent(content: string) {
  return (
    content
      // Remove code blocks but preserve their content for keyword extraction
      .replace(/```[\s\S]*?```/g, " ")
      // Remove inline code but keep the content
      .replace(/`([^`]+)`/g, "$1 ")
      // Remove links but keep text and preserve important URLs
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove images completely (including alt text)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
      // Remove HTML tags and their attributes but preserve content
      .replace(/<[^>]*>/g, " ")
      // Remove standalone HTML attribute names and values more carefully
      .replace(
        /\b(src|alt|width|height|title|className|class|id)=['"][^'"]*['"]/gi,
        ""
      )
      // Remove standalone file extensions that appear as noise
      .replace(/\.(webp|png|jpg|jpeg|gif|svg|pdf|doc|docx)\b/gi, "")
      // Preserve mathematical notation and equations (don't break LaTeX-like content)
      // Remove headings markdown but preserve the text
      .replace(/^#{1,6}\s+(.+)$/gm, "$1 ")
      // Remove bold/italic markdown but keep content
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
      // Remove underline markdown but keep content
      .replace(/_{1,3}([^_]+)_{1,3}/g, "$1")
      // Remove blockquotes but keep content
      .replace(/^>\s+(.+)$/gm, "$1 ")
      // Remove list markers but keep content
      .replace(/^[\s]*[-*+]\s+(.+)$/gm, "$1 ")
      .replace(/^[\s]*\d+\.\s+(.+)$/gm, "$1 ")
      // Preserve important punctuation in mathematical expressions
      // Clean up extra whitespace but preserve sentence structure
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      // Preserve line breaks between paragraphs
      .replace(/\n/g, " ")
      .trim()
  );
}

// Generate structured output filename from input path
function generateOutputFilename(inputPath: string) {
  // Parse the input path to extract language, folder, and filename
  const pathParts = inputPath.split("/");

  // Find the content directory index
  const contentIndex = pathParts.findIndex(
    (part: string) => part === "content"
  );

  if (contentIndex === -1 || contentIndex + 3 >= pathParts.length) {
    // Fallback: use the original filename with timestamp if path doesn't match expected structure
    const baseName = path.basename(inputPath, path.extname(inputPath));
    return `${baseName}-${Date.now()}.json`;
  }

  const lang = pathParts[contentIndex + 1]; // en, es, pt, etc
  const folder = pathParts[contentIndex + 2]; // blockchain-101, cryptography-101, etc
  const filename = path.basename(inputPath, path.extname(inputPath)); // a-primer-on-consensus

  return `${folder}.${filename}.${lang}.json`;
}

// Generate content hash for change detection
function generateContentHash(content: string) {
  return nodeCrypto.createHash("md5").update(content).digest("hex");
}

// Main processing function
function processMarkdownFile(
  filePath: string,
  supabaseId: string | null = null
) {
  try {
    // Read and parse the markdown file
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { data: frontMatter, content } = matter(fileContent);

    // Detect language from file path
    const language = extractLanguageFromPath(filePath);

    // Extract basic info
    const title = frontMatter.title || "";
    const tags = frontMatter.tags || [];
    const author = frontMatter.author || "";
    const date = frontMatter.date || "";
    const description = frontMatter.description || frontMatter.excerpt || "";
    const thumbnail =
      frontMatter.thumbnail || frontMatter.image || frontMatter.cover || "";

    // Process content
    const cleanedContent = cleanContent(content);
    const headings = extractHeadings(content);
    const keywords = extractKeywords(cleanedContent, title, headings, language);
    const summary = extractSummary(cleanedContent);
    const contentHash = generateContentHash(fileContent);

    // Create expanded tags (original tags + related terms) - now language-aware
    const expandedTags = [...tags];

    // Add language-specific tag expansion based on content
    if (language === "en") {
      if (keywords.includes("blockchain") || keywords.includes("crypto")) {
        expandedTags.push("cryptocurrency", "web3", "decentralized");
      }
      if (keywords.includes("ethereum")) {
        expandedTags.push("smart-contracts", "defi", "blockchain");
      }
      if (keywords.includes("javascript") || keywords.includes("typescript")) {
        expandedTags.push("programming", "web-development", "coding");
      }
    } else if (language === "es") {
      if (
        keywords.includes("blockchain") ||
        keywords.includes("crypto") ||
        keywords.includes("criptografía")
      ) {
        expandedTags.push("criptomoneda", "web3", "descentralizado");
      }
      if (keywords.includes("ethereum")) {
        expandedTags.push("contratos-inteligentes", "defi", "blockchain");
      }
      if (
        keywords.includes("javascript") ||
        keywords.includes("typescript") ||
        keywords.includes("programación")
      ) {
        expandedTags.push("programacion", "desarrollo-web", "codigo");
      }
    } else if (language === "pt") {
      if (
        keywords.includes("blockchain") ||
        keywords.includes("crypto") ||
        keywords.includes("criptografia")
      ) {
        expandedTags.push("criptomoeda", "web3", "descentralizado");
      }
      if (keywords.includes("ethereum")) {
        expandedTags.push("contratos-inteligentes", "defi", "blockchain");
      }
      if (
        keywords.includes("javascript") ||
        keywords.includes("typescript") ||
        keywords.includes("programação")
      ) {
        expandedTags.push("programacao", "desenvolvimento-web", "codigo");
      }
    }

    // Remove duplicates
    const uniqueExpandedTags = [...new Set(expandedTags)];

    const result: Record<string, unknown> = {
      // Original metadata
      title,
      author,
      date,
      description,
      tags,
      thumbnail,

      // Search-optimized fields
      search_keywords: keywords.join(" "),
      search_summary: summary,
      search_headings: headings.map((h) => h.text).join(" "),
      search_tags_expanded: uniqueExpandedTags.join(" "),

      // Additional metadata
      headings_structure: headings,
      word_count: cleanedContent.split(/\s+/).length,
      content_hash: contentHash,
      language: language, // Include detected language in output

      // Processing metadata
      processed_at: new Date().toISOString(),
      source_file: path.basename(filePath),
    };

    // Add Supabase ID if provided
    if (supabaseId) {
      result.supabaseId = supabaseId;
    }

    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return null;
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(
      "Usage: node extract-search-data.js <markdown-file-path> [output-file-path] [supabase-id]"
    );
    console.log(
      "Example: node extract-search-data.js ./src/content/en/blockchain-101/my-article.md"
    );
    console.log(
      "         → Outputs to: ./search/blockchain-101.my-article.en.json"
    );
    console.log(
      "Example with custom output: node extract-search-data.js ./src/content/en/blog/my-article.md ./custom/path.json"
    );
    console.log(
      "Example with Supabase ID: node extract-search-data.js ./src/content/es/blog/my-article.md ./search/my-article.json f47ac10b-58cc-4372-a567-0e02b2c3d479"
    );
    process.exit(1);
  }

  const inputPath = args[0];
  // Generate structured filename: folder.file-name.lang.json
  const generatedFilename = generateOutputFilename(inputPath);
  const defaultOutputPath = `./search/${generatedFilename}`;
  // Use default if second argument is empty string or not provided
  const outputPath =
    args[1] && args[1].trim() !== "" ? args[1] : defaultOutputPath;
  const supabaseId = args[2] || null;

  // Check if input file exists
  if (!fs.existsSync(inputPath)) {
    console.error(`Error: File ${inputPath} does not exist`);
    process.exit(1);
  }

  console.log(`Processing: ${inputPath}`);
  if (args[1]) {
    console.log(`Custom output: ${outputPath}`);
  } else {
    console.log(`Generated filename: ${generatedFilename}`);
  }
  if (supabaseId) {
    console.log(`Supabase ID: ${supabaseId}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> | null = processMarkdownFile(
    inputPath,
    supabaseId
  );

  if (!result) {
    console.error("Failed to process the file");
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}`);
  }

  // Write the result to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log(`✅ Successfully processed ${inputPath}`);
  console.log(`🌍 Language: ${result.language.toUpperCase()}`);
  console.log(`📄 Output written to: ${outputPath}`);
  console.log(
    `📊 Extracted ${result.search_keywords.split(" ").length} keywords`
  );
  console.log(`📝 Summary: ${result.search_summary.length} characters`);
  console.log(`🏷️  Headings: ${result.headings_structure.length} found`);
  console.log(`💬 Word count: ${result.word_count} words`);
  if (result.supabaseId) {
    console.log(`🔗 Supabase ID: ${result.supabaseId}`);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  processMarkdownFile,
  extractKeywords,
  extractSummary,
  extractHeadings,
};
