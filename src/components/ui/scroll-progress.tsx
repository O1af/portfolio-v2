"use client";

import { motion, MotionProps, useScroll } from "motion/react";
import * as stylex from "@stylexjs/stylex";

interface ScrollProgressProps
  extends Omit<React.HTMLAttributes<HTMLElement>, keyof MotionProps> {
  ref?: React.Ref<HTMLDivElement>;
  stylexStyle?: stylex.StyleXStyles;
}

export function ScrollProgress({
  className,
  ref,
  stylexStyle,
  ...props
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const compiled = stylex.props(styles.progress, stylexStyle);

  return (
    <motion.div
      ref={ref}
      className={[compiled.className, className].filter(Boolean).join(" ")}
      style={{
        ...compiled.style,
        scaleX: scrollYProgress,
      }}
      {...props}
    />
  );
}

const styles = stylex.create({
  progress: {
    position: "fixed",
    top: "3.5rem",
    right: 0,
    left: 0,
    zIndex: 40,
    height: 1,
    transformOrigin: "left",
    backgroundImage: "linear-gradient(to right, #A97CF8, #F38CB8, #FDCC92)",
  },
});
