import { motion } from "motion/react";
import { useState, useEffect, useRef } from "react";

interface WordTileProps {
  word: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function WordTile({ word, selected, onClick, disabled = false }: WordTileProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLButtonElement>(null);
  const [fontSize, setFontSize] = useState("text-lg");

  useEffect(() => {
    const adjustFontSize = () => {
      if (!textRef.current || !tileRef.current) return;

      const sizes = ["text-lg", "text-base", "text-sm", "text-xs"];
      for (const size of sizes) {
        textRef.current.className = `text-center ${size} leading-tight w-full h-full overflow-hidden flex items-center justify-center`;
        const overflowing =
          textRef.current.scrollHeight > textRef.current.clientHeight ||
          textRef.current.scrollWidth > textRef.current.clientWidth;
        if (!overflowing) {
          setFontSize(size);
          return;
        }
      }
      setFontSize("text-xs");
    };

    adjustFontSize();
    const id = setTimeout(adjustFontSize, 50);
    window.addEventListener("resize", adjustFontSize);
    return () => {
      window.removeEventListener("resize", adjustFontSize);
      clearTimeout(id);
    };
  }, [word]);

  return (
    <motion.button
      ref={tileRef}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={selected ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      className={[
        "w-full aspect-square flex items-center justify-center font-bold px-1 py-1 rounded-md transition-colors duration-200 border",
        selected
          ? "bg-accent text-accent-foreground border-accent-foreground/20"
          : "bg-card text-card-foreground border-border hover:bg-accent/50 hover:text-accent-foreground",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
      ].join(" ")}
    >
      <div
        ref={textRef}
        className={`text-center ${fontSize} leading-tight w-full h-full overflow-hidden flex items-center justify-center`}
      >
        {word}
      </div>
    </motion.button>
  );
}
