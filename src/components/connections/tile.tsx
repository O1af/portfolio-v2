import { motion } from "motion/react";

interface WordTileProps {
  word: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function getWordSizeClass(word: string): string {
  if (word.length >= 9) {
    return "text-[10px] sm:text-xs";
  }

  if (word.length >= 7) {
    return "text-[11px] sm:text-sm";
  }

  return "text-xs sm:text-base";
}

export function WordTile({ word, selected, onClick, disabled = false }: WordTileProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`${selected ? "Deselect" : "Select"} ${word}`}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={selected ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      className={[
        "w-full aspect-square rounded-md border px-1 py-1 font-bold transition-colors duration-200 touch-manipulation",
        "flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        selected
          ? "bg-accent text-accent-foreground border-accent-foreground/20"
          : "bg-card text-card-foreground border-border hover:bg-accent/50 hover:text-accent-foreground",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
      ].join(" ")}
    >
      <div
        className={`flex h-full w-full items-center justify-center overflow-hidden text-center leading-tight ${getWordSizeClass(word)}`}
      >
        {word}
      </div>
    </motion.button>
  );
}
