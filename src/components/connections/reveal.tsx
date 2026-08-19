import { motion } from "motion/react";
import type { CategoryColor } from "./game";

interface CategoryRevealProps {
  category: {
    name: string;
    color: CategoryColor;
    words: string[];
  };
}

// NYT Connections group colors — fixed in both themes
const colorClass: Record<CategoryColor, string> = {
  yellow: "bg-[#f9df6d] text-[#1a1a1a]",
  green: "bg-[#a0c35a] text-[#1a1a1a]",
  blue: "bg-[#b0c4ef] text-[#1a1a1a]",
  purple: "bg-[#ba81c5] text-[#1a1a1a]",
};

export function CategoryReveal({ category }: CategoryRevealProps) {
  return (
    <motion.div
      className={`w-full mb-2 p-3 rounded-lg ${colorClass[category.color]}`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h3
        className={`text-center font-bold leading-tight ${category.name.length > 25 ? "text-base" : "text-lg"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {category.name}
      </motion.h3>
      <motion.p
        className="text-center mt-1 text-sm opacity-75"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        {category.words.join(", ")}
      </motion.p>
    </motion.div>
  );
}
