const WORDS_PER_MINUTE = 250;

export function countWords(content: string): number {
  const prose = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ");

  return prose.trim().split(/\s+/).filter(Boolean).length;
}

export function estimateReadingMinutes(content: string): number {
  return Math.max(1, Math.round(countWords(content) / WORDS_PER_MINUTE));
}
