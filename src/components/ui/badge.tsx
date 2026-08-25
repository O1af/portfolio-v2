import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import * as stylex from "@stylexjs/stylex"

import { stylexProps } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
type BadgeVariantOptions = { variant?: BadgeVariant | null }

const badgeVariants = ({
  variant = "default",
}: BadgeVariantOptions = {}): stylex.StyleXStyles => [
  styles.base,
  styles[variant ?? "default"],
]

type BadgeProps = useRender.ComponentProps<"span"> &
  BadgeVariantOptions & {
    stylexStyle?: stylex.StyleXStyles
  }

function Badge({
  className,
  style,
  stylexStyle,
  variant = "default",
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      stylexProps(
        [badgeVariants({ variant }), stylexStyle],
        className,
        style
      ),
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

const styles = stylex.create({
  base: {
    display: "inline-flex",
    width: "fit-content",
    height: "1.25rem",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    overflow: "hidden",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: "9999px",
    paddingTop: "0.125rem",
    paddingBottom: "0.125rem",
    paddingRight: { default: "0.625rem", ":has([data-icon='inline-end'])": "0.375rem" },
    paddingLeft: { default: "0.625rem", ":has([data-icon='inline-start'])": "0.375rem" },
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 500,
    whiteSpace: "nowrap",
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
  },
  default: {
    color: "var(--primary-foreground)",
    backgroundColor: {
      default: "var(--primary)",
      ":is(a):hover": "color-mix(in oklab, var(--primary) 90%, transparent)",
    },
  },
  secondary: {
    color: "var(--secondary-foreground)",
    backgroundColor: {
      default: "var(--secondary)",
      ":is(a):hover": "color-mix(in oklab, var(--secondary) 80%, transparent)",
    },
  },
  destructive: {
    color: "var(--destructive)",
    backgroundColor: {
      default: "color-mix(in oklab, var(--destructive) 10%, transparent)",
      ":is(a):hover": "color-mix(in oklab, var(--destructive) 20%, transparent)",
      ":is(.dark *)": "color-mix(in oklab, var(--destructive) 20%, transparent)",
    },
  },
  outline: {
    color: "var(--foreground)",
    borderColor: "var(--border)",
    backgroundColor: {
      default: "var(--background)",
      ":is(a):hover": "color-mix(in oklab, var(--secondary) 50%, transparent)",
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
  link: {
    color: "var(--primary)",
    textUnderlineOffset: "4px",
    textDecorationLine: {
      default: "none",
      ":hover": "underline",
    },
  },
})

export { Badge, badgeVariants }
