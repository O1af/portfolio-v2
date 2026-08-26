import { Button as ButtonPrimitive } from "@base-ui/react/button"
import * as stylex from "@stylexjs/stylex"

import { stylexProps } from "@/lib/utils"

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"

type ButtonVariantOptions = {
  variant?: ButtonVariant | null
  size?: ButtonSize | null
}

const buttonVariants = ({
  variant = "default",
  size = "default",
}: ButtonVariantOptions = {}): stylex.StyleXStyles => [
  styles.base,
  styles[variant ?? "default"],
  sizeStyles[size ?? "default"],
]

type ButtonProps = ButtonPrimitive.Props &
  ButtonVariantOptions & {
    stylexStyle?: stylex.StyleXStyles
  }

function Button({
  className,
  style,
  stylexStyle,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-size={size}
      {...stylexProps(
        [buttonVariants({ variant, size }), stylexStyle],
        className,
        style
      )}
      {...props}
    />
  )
}

const styles = stylex.create({
  base: {
    display: "inline-flex",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: "9999px",
    outline: "none",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
    userSelect: "none",
    transitionProperty: "background-color, color, border-color, box-shadow, transform",
    transitionDuration: "200ms",
    pointerEvents: {
      default: "auto",
      ":disabled": "none",
    },
    opacity: {
      default: 1,
      ":disabled": 0.5,
    },
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  default: {
    color: "var(--primary-foreground)",
    backgroundColor: {
      default: "var(--primary)",
      ":hover": "color-mix(in oklab, var(--primary) 90%, transparent)",
    },
    boxShadow: {
      default: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      ":hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring), 0 1px 2px 0 rgb(0 0 0 / 0.05)",
    },
  },
  outline: {
    color: {
      default: "inherit",
      ":hover": "var(--foreground)",
    },
    borderColor: "var(--border)",
    backgroundColor: {
      default: "var(--background)",
      ":hover": "color-mix(in oklab, var(--secondary) 50%, transparent)",
    },
  },
  secondary: {
    color: "var(--secondary-foreground)",
    backgroundColor: {
      default: "var(--secondary)",
      ":hover": "color-mix(in oklab, var(--secondary) 80%, transparent)",
    },
  },
  ghost: {
    color: {
      default: "inherit",
      ":hover": "var(--foreground)",
    },
    backgroundColor: {
      default: "transparent",
      ":hover": "color-mix(in oklab, var(--secondary) 50%, transparent)",
    },
  },
  destructive: {
    color: "var(--destructive-foreground)",
    backgroundColor: {
      default: "var(--destructive)",
      ":hover": "color-mix(in oklab, var(--destructive) 90%, transparent)",
    },
    boxShadow: {
      default: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      ":focus-visible":
        "0 0 0 2px var(--background), 0 0 0 4px var(--ring), 0 1px 2px 0 rgb(0 0 0 / 0.05)",
    },
  },
  link: {
    color: "var(--primary)",
    textUnderlineOffset: "4px",
    textDecorationLine: {
      default: "none",
      ":hover": "underline",
    },
  },
})

const sizeStyles = stylex.create({
  default: {
    height: "2.25rem",
    gap: "0.375rem",
    paddingRight: { default: "1rem", ":has([data-icon='inline-end'])": "0.75rem" },
    paddingLeft: { default: "1rem", ":has([data-icon='inline-start'])": "0.75rem" },
  },
  xs: {
    height: "1.5rem",
    gap: "0.25rem",
    paddingRight: { default: "0.625rem", ":has([data-icon='inline-end'])": "0.5rem" },
    paddingLeft: { default: "0.625rem", ":has([data-icon='inline-start'])": "0.5rem" },
    fontSize: "0.75rem",
    lineHeight: "1rem",
  },
  sm: {
    height: "2rem",
    gap: "0.25rem",
    paddingRight: { default: "0.75rem", ":has([data-icon='inline-end'])": "0.625rem" },
    paddingLeft: { default: "0.75rem", ":has([data-icon='inline-start'])": "0.625rem" },
  },
  lg: {
    height: "2.5rem",
    gap: "0.5rem",
    paddingRight: { default: "1.25rem", ":has([data-icon='inline-end'])": "1rem" },
    paddingLeft: { default: "1.25rem", ":has([data-icon='inline-start'])": "1rem" },
  },
  icon: { width: "2.25rem", height: "2.25rem" },
  "icon-xs": { width: "1.5rem", height: "1.5rem" },
  "icon-sm": { width: "2rem", height: "2rem" },
  "icon-lg": { width: "2.5rem", height: "2.5rem" },
})

export { Button, buttonVariants }
