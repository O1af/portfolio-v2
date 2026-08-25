import * as React from "react"
import * as stylex from "@stylexjs/stylex"

import { stylexProps } from "@/lib/utils"

type TextareaProps = React.ComponentProps<"textarea"> & {
  stylexStyle?: stylex.StyleXStyles
}

function Textarea({ className, style, stylexStyle, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      {...stylexProps([styles.textarea, stylexStyle], className, style)}
      {...props}
    />
  )
}

const styles = stylex.create({
  textarea: {
    display: "flex",
    fieldSizing: "content",
    width: "100%",
    minHeight: "4rem",
    resize: "none",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "var(--input)",
      ":focus-visible": "var(--ring)",
      ':is([aria-invalid="true"])': "var(--destructive)",
    },
    borderRadius: "var(--radius-xl)",
    backgroundColor: "color-mix(in oklab, var(--input) 30%, transparent)",
    padding: "0.75rem",
    fontSize: {
      default: "1rem",
      "@media (min-width: 768px)": "0.875rem",
    },
    lineHeight: {
      default: "1.5rem",
      "@media (min-width: 768px)": "1.25rem",
    },
    outline: "none",
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)",
      ':is([aria-invalid="true"])': "0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent)",
      ':is(.dark *)[aria-invalid="true"]': "0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent)",
    },
    cursor: {
      default: "auto",
      ":disabled": "not-allowed",
    },
    opacity: {
      default: 1,
      ":disabled": 0.5,
    },
    "::placeholder": {
      color: "var(--muted-foreground)",
    },
  },
})

export { Textarea }
