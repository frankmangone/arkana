export function processContent(content: string): string {
    return content
        // First, convert :::big-quote::: syntax to a special HTML tag we can catch later
        .replace(
            /:::\s*big-quote\s*([\s\S]*?)\s*:::/g,
            (_, content) => `<big-quote>${content}</big-quote>`
        )
        .replace(/<quiz\s+src="([^"]+)"\s*(?:lang="([^"]+)")?\s*\/>/g, (_, src, lang) => {
            // Use data attributes to store quiz configuration
            return `<div class="quiz-embed" data-src="${src}" data-lang="${lang || 'en'}"></div>`;
        })
        .replace(/<video-embed\s+src="([^"]+)"\s*\/>/g, (_, src) => {
            return `<div class="video-embed" data-src="${src}"></div>`;
        })
        // This regex looks for ASCII tables and converts them to GFM tables
        .replace(/\+-+\+[\s\S]*?\+-+\+/g, (match) => {
            // Extract rows from the ASCII table
            const rows = match.split("\n").filter((row) => row.trim().length > 0);
            let gfmTable = "";

            rows.forEach((row, index) => {
            if (row.startsWith("|")) {
                // This is a content row
                const cells = row
                .split("|")
                .filter((cell) => cell.trim() !== "")
                .map((cell) => cell.trim());

                gfmTable += "| " + cells.join(" | ") + " |\n";

                // If this is the header row, add the separator row
                if (index === 0) {
                gfmTable += "| " + cells.map(() => "---").join(" | ") + " |\n";
                }
            }
            });

            return gfmTable;
        })
        // Fix minus signs in LaTeX expressions - replace hyphens/em dashes with proper LaTeX minus
        .replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$\n]*?\$)/g, (match) => {
            // Replace em dashes and hyphens that act as minus signs with proper LaTeX minus
            return match
            .replace(/—/g, '-') // First normalize em dashes to regular hyphens
            .replace(/(\s)-(\s)/g, '$1{-}$2') // Replace spaced hyphens with proper LaTeX minus
            .replace(/(\(|\[|^)-/g, '$1{-}') // Replace hyphens at start of expressions
            .replace(/-(\)|]|$)/g, '{-}$1'); // Replace hyphens at end of expressions
        })
}