import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import * as stylex from "@stylexjs/stylex"

import { stylexProps } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  stylexStyle?: stylex.StyleXStyles
}

function Input({ className, style, stylexStyle, type, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      {...stylexProps([styles.input, stylexStyle], className, style)}
      {...props}
    />
  )
}

const styles = stylex.create({
  input: {
    width: "100%",
    minWidth: 0,
    height: "2.25rem",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "var(--input)",
      ":focus-visible": "var(--ring)",
      ':is([aria-invalid="true"])': "var(--destructive)",
    },
    borderRadius: "var(--radius-4xl)",
    backgroundColor: "color-mix(in oklab, var(--input) 30%, transparent)",
    paddingBlock: "0.25rem",
    paddingInline: "0.75rem",
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
    pointerEvents: {
      default: "auto",
      ":disabled": "none",
    },
    opacity: {
      default: 1,
      ":disabled": 0.5,
    },
    "::placeholder": {
      color: "var(--muted-foreground)",
    },
    "::file-selector-button": {
      display: "inline-flex",
      height: "1.75rem",
      borderWidth: 0,
      backgroundColor: "transparent",
      color: "var(--foreground)",
      fontSize: "0.875rem",
      lineHeight: "1.25rem",
      fontWeight: 500,
    },
  },
})

export { Input }
