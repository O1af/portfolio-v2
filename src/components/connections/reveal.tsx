import { motion } from "motion/react";
import type { CategoryColor } from "./game";

interface CategoryRevealProps {
  category: {
    name: string;
    color: CategoryColor;
    words: string[];
  };
}

const colorClass: Record<CategoryColor, string> = {
  yellow: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-900 dark:text-yellow-100",
  green: "bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100",
  blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100",
  purple: "bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100",
};

export function CategoryReveal({ category }: CategoryRevealProps) {
  return (
    <motion.div
      className={`w-full mb-3 p-4 rounded-xl ${colorClass[category.color]}`}
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
