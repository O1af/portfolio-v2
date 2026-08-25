import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CheckIcon, CopyIcon, ShareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryReveal } from "./reveal";
import type { CategoryColor } from "./game";

interface GameOverProps {
  won: boolean;
  allCategories: Array<{ name: string; color: CategoryColor; words: string[] }>;
  guessHistory: Array<{ words: string[]; correct: boolean; categoryColor?: CategoryColor }>;
  onReset: () => void;
}

const colorEmoji: Record<CategoryColor, string> = {
  yellow: "🟨",
  green: "🟩",
  blue: "🟦",
  purple: "🟪",
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

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
    } catch {
      toast.error("Could not copy results");
    }
  }

  async function share() {
    const text = generateEmojiGrid();
    if (navigator.share && navigator.canShare?.({ text })) {
      try {
        await navigator.share({ text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }
    await copyToClipboard(text);
  }

  return (
    <motion.div
      {...stylex.props(styles.container)}
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.h2 {...stylex.props(styles.heading)} variants={item}>
        {won ? "You won!" : "Game Over"}
      </motion.h2>
      <motion.p {...stylex.props(styles.description)} variants={item}>
        {won
          ? "You found all the connections!"
          : "You ran out of attempts. Here are all the connections:"}
      </motion.p>

      <motion.div variants={item} {...stylex.props(styles.actions)}>
        <Button onClick={share} variant="outline" stylexStyle={styles.actionButton}>
          <ShareIcon size={15} />
          Share
        </Button>
        <Button
          onClick={() => copyToClipboard(generateEmojiGrid())}
          variant="outline"
          stylexStyle={styles.actionButton}
        >
          {copied ? <><CheckIcon size={15} /> Copied</> : <><CopyIcon size={15} /> Copy Results</>}
        </Button>
      </motion.div>

      {allCategories.map((cat) => (
        <motion.div key={cat.name} variants={item} {...stylex.props(styles.fullWidth)}>
          <CategoryReveal category={cat} />
        </motion.div>
      ))}

      <motion.div variants={item} {...stylex.props(styles.reset)}>
        <Button onClick={onReset} size="lg" stylexStyle={styles.rounded}>
          Play Again
        </Button>
      </motion.div>
    </motion.div>
  );
}

const styles = stylex.create({
  container: {
    width: "100%",
    maxWidth: "28rem",
    marginInline: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heading: {
    marginBottom: "0.5rem",
    textAlign: "center",
    fontSize: "1.5rem",
    lineHeight: "2rem",
    fontWeight: 700,
  },
  description: {
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "var(--muted-foreground)",
  },
  actions: {
    width: "100%",
    marginBottom: "1.5rem",
    display: "flex",
    gap: "0.5rem",
  },
  actionButton: {
    flex: 1,
    gap: "0.5rem",
    borderRadius: "9999px",
  },
  fullWidth: {
    width: "100%",
  },
  reset: {
    marginTop: "0.5rem",
  },
  rounded: {
    borderRadius: "9999px",
  },
});
