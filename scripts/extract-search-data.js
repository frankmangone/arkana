#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const crypto = require("crypto");

// Multilingual stop words
const STOP_WORDS = {
  en: new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "up",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "among",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
    "my",
    "your",
    "his",
    "her",
    "its",
    "our",
    "their",
    "myself",
    "yourself",
    "himself",
    "herself",
    "itself",
    "ourselves",
    "yourselves",
    "themselves",
    "what",
    "which",
    "who",
    "whom",
    "whose",
    "where",
    "when",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "just",
    "now",
    "here",
    "there",
    "then",
    "also",
    "well",
    "back",
    "even",
    "still",
    "way",
    "get",
    "go",
    "know",
    "take",
    "see",
    "come",
    "think",
    "look",
    "want",
    "give",
    "use",
    "find",
    "tell",
    "ask",
    "work",
    "seem",
    "feel",
    "try",
    "leave",
    "call",
    "good",
    "new",
    "first",
    "last",
    "long",
    "great",
    "little",
    "own",
    "other",
    "old",
    "right",
    "big",
    "high",
    "different",
    "small",
    "large",
    "next",
    "early",
    "young",
    "important",
    "few",
    "public",
    "bad",
    "same",
    "able",
  ]),
  es: new Set([
    "el",
    "la",
    "de",
    "que",
    "y",
    "a",
    "en",
    "un",
    "es",
    "se",
    "no",
    "te",
    "lo",
    "le",
    "da",
    "su",
    "por",
    "son",
    "con",
    "para",
    "al",
    "una",
    "ser",
    "del",
    "los",
    "las",
    "mi",
    "tu",
    "si",
    "yo",
    "él",
    "ella",
    "nos",
    "han",
    "hay",
    "fue",
    "muy",
    "más",
    "sin",
    "pero",
    "sus",
    "todo",
    "esta",
    "este",
    "como",
    "donde",
    "cuando",
    "quien",
    "porque",
    "sobre",
    "desde",
    "hasta",
    "entre",
    "durante",
    "antes",
    "después",
    "arriba",
    "abajo",
    "dentro",
    "fuera",
    "aquí",
    "allí",
    "ahora",
    "entonces",
    "también",
    "bien",
    "así",
    "sólo",
    "solo",
    "otro",
    "otra",
    "otros",
    "otras",
    "mismo",
    "misma",
    "algunos",
    "algunas",
    "tanto",
    "tanta",
    "todos",
    "todas",
    "nada",
    "algo",
    "alguien",
    "nadie",
    "ningún",
    "ninguna",
    "cualquier",
    "cada",
    "tal",
    "cual",
    "cuál",
    "cuales",
    "cuáles",
    "qué",
    "cómo",
    "dónde",
    "cuándo",
    "por qué",
    "sí",
    "no",
    "ni",
    "o",
    "u",
    "pero",
    "mas",
    "sino",
    "aunque",
    "como si",
    "tan",
    "tanto como",
  ]),
  pt: new Set([
    "o",
    "a",
    "de",
    "que",
    "e",
    "do",
    "da",
    "em",
    "um",
    "para",
    "é",
    "com",
    "não",
    "uma",
    "os",
    "no",
    "se",
    "na",
    "por",
    "mais",
    "as",
    "dos",
    "como",
    "mas",
    "foi",
    "ao",
    "ele",
    "das",
    "tem",
    "à",
    "seu",
    "sua",
    "ou",
    "ser",
    "quando",
    "muito",
    "há",
    "nos",
    "já",
    "está",
    "eu",
    "também",
    "só",
    "pelo",
    "pela",
    "até",
    "isso",
    "ela",
    "entre",
    "era",
    "depois",
    "sem",
    "mesmo",
    "aos",
    "ter",
    "seus",
    "suas",
    "numa",
    "pelos",
    "pelas",
    "esse",
    "esses",
    "essa",
    "essas",
    "meu",
    "minha",
    "meus",
    "minhas",
    "nosso",
    "nossa",
    "nossos",
    "nossas",
    "dele",
    "dela",
    "deles",
    "delas",
    "este",
    "esta",
    "estes",
    "estas",
    "esse",
    "essa",
    "esses",
    "essas",
    "aquele",
    "aquela",
    "aqueles",
    "aquelas",
    "isto",
    "isso",
    "aquilo",
    "aqui",
    "aí",
    "ali",
    "lá",
    "cá",
    "onde",
    "quando",
    "como",
    "porque",
    "porquê",
    "qual",
    "quais",
    "quem",
    "quanto",
    "quanta",
    "quantos",
    "quantas",
    "que",
    "qué",
    "sim",
    "não",
    "nem",
    "ou",
    "mas",
    "porém",
    "contudo",
    "todavia",
    "entretanto",
    "então",
    "assim",
    "antes",
    "depois",
    "durante",
    "sobre",
    "sob",
    "dentro",
    "fora",
    "através",
    "mediante",
    "segundo",
    "conforme",
    "enquanto",
    "embora",
    "ainda",
    "apenas",
    "somente",
    "tanto",
    "tão",
    "muito",
    "pouco",
    "bem",
    "mal",
    "melhor",
    "pior",
    "primeiro",
    "último",
    "outro",
    "outra",
    "outros",
    "outras",
    "mesmo",
    "mesma",
    "próprio",
    "própria",
    "todo",
    "toda",
    "todos",
    "todas",
    "algum",
    "alguma",
    "alguns",
    "algumas",
    "nenhum",
    "nenhuma",
    "qualquer",
    "cada",
    "tal",
    "tais",
  ]),
};

// Extract language from file path
function extractLanguageFromPath(filePath) {
  const pathParts = filePath.split("/");
  const contentIndex = pathParts.findIndex((part) => part === "content");

  if (contentIndex !== -1 && contentIndex + 1 < pathParts.length) {
    const lang = pathParts[contentIndex + 1];
    // Return the language if it's supported, otherwise default to English
    return STOP_WORDS[lang] ? lang : "en";
  }

  // Fallback to English
  return "en";
}

// Extract headings from markdown content
function extractHeadings(content) {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
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
function extractKeywords(text, title = "", headings = [], language = "en") {
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

  // Clean and split text - improved for Spanish/Portuguese
  const words = weightedText
    .toLowerCase()
    .replace(/[^\w\s\u00C0-\u017F-]/g, " ") // Keep accented characters and hyphens
    .split(/\s+/)
    .filter((word) => {
      return (
        word.length > 2 &&
        !stopWords.has(word) &&
        !/^\d+$/.test(word) && // Remove pure numbers
        !/^[a-z\u00C0-\u017F]$/.test(word) // Remove single letters (including accented)
      );
    });

  // Count word frequency
  const wordCount = {};
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Sort by frequency and return top keywords
  const sortedWords = Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50) // Top 50 keywords
    .map(([word]) => word);

  return sortedWords;
}

// Extract key sentences for summary
function extractSummary(content) {
  // Split into paragraphs
  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 50); // Filter out short paragraphs

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
function cleanContent(content) {
  return (
    content
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code
      .replace(/`[^`]+`/g, "")
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove images completely (including alt text)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
      // Remove HTML tags and their attributes (like img, src, alt, etc.)
      .replace(/<[^>]*>/g, " ")
      // Remove HTML-like attributes that might appear in text
      .replace(
        /\b(src|alt|width|height|title|className|class|id)=['"][^'"]*['"]/gi,
        ""
      )
      // Remove standalone HTML attribute names
      .replace(
        /\b(src|alt|width|height|title|className|class|id|webp|png|jpg|jpeg|gif|svg)\b/gi,
        ""
      )
      // Remove headings markdown
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bold/italic
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
      // Remove blockquotes
      .replace(/^>\s+/gm, "")
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // Remove file extensions that might appear in text
      .replace(/\.(webp|png|jpg|jpeg|gif|svg|pdf|doc|docx)\b/gi, "")
      // Clean up extra whitespace
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

// Generate structured output filename from input path
function generateOutputFilename(inputPath) {
  // Parse the input path to extract language, folder, and filename
  const pathParts = inputPath.split("/");

  // Find the content directory index
  const contentIndex = pathParts.findIndex((part) => part === "content");

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
function generateContentHash(content) {
  return crypto.createHash("md5").update(content).digest("hex");
}

// Main processing function
function processMarkdownFile(filePath, supabaseId = null) {
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

    const result = {
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
  } catch (error) {
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

  const result = processMarkdownFile(inputPath, supabaseId);

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
