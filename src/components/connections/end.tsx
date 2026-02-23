import { useState } from "react";
import { motion } from "motion/react";
import { CheckIcon, CopyIcon, ShareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryReveal } from "./reveal";
import type { CategoryColor } from "./game";

interface GameOverProps {
  won: boolean;
  allCategories: Array<{ name: string; color: CategoryColor; words: string[] }>;
  solvedCategories: Array<{ name: string; color: CategoryColor; words: string[] }>;
  guessHistory: Array<{ words: string[]; correct: boolean; categoryColor?: CategoryColor }>;
  onReset: () => void;
}

const colorEmoji: Record<CategoryColor, string> = {
  yellow: "🟨",
  green: "🟩",
  blue: "🟦",
  purple: "🟪",
};

export function GameOver({ won, allCategories, guessHistory, onReset }: GameOverProps) {
  const [copied, setCopied] = useState(false);

  function generateEmojiGrid(): string {
    const lines = guessHistory.map((guess) => {
      if (guess.correct && guess.categoryColor) {
        return Array(4).fill(colorEmoji[guess.categoryColor]).join("");
      }
      return guess.words
        .map((word) => {
          const cat = allCategories.find((c) => c.words.includes(word));
          return cat ? colorEmoji[cat.color] : "⬜";
        })
        .join("");
    });
    return `olafdsouza.com/connections\n${lines.join("\n")}`;
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  async function share() {
    const text = generateEmojiGrid();
    if (navigator.share && navigator.canShare?.({ text })) {
      try {
        await navigator.share({ text });
        return;
      } catch {}
    }
    await copyToClipboard(text);
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div
      className="w-full max-w-md mx-auto flex flex-col items-center"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.h2 className="text-2xl font-bold mb-2 text-center" variants={item}>
        {won ? "You won!" : "Game Over"}
      </motion.h2>
      <motion.p className="mb-6 text-center text-muted-foreground" variants={item}>
        {won
          ? "You found all the connections!"
          : "You ran out of attempts. Here are all the connections:"}
      </motion.p>

      <motion.div variants={item} className="w-full mb-6 flex gap-2">
        <Button onClick={share} variant="outline" className="flex-1 gap-2">
          <ShareIcon size={15} />
          Share
        </Button>
        <Button onClick={() => copyToClipboard(generateEmojiGrid())} variant="outline" className="flex-1 gap-2">
          {copied ? <><CheckIcon size={15} /> Copied</> : <><CopyIcon size={15} /> Copy Results</>}
        </Button>
      </motion.div>

      {allCategories.map((cat, i) => (
        <motion.div key={i} variants={item} className="w-full">
          <CategoryReveal category={cat} />
        </motion.div>
      ))}

      <motion.div variants={item} className="mt-2">
        <Button onClick={onReset} size="lg">
          Play Again
        </Button>
      </motion.div>
    </motion.div>
  );
}
