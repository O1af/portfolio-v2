import * as stylex from "@stylexjs/stylex"

import { stylexProps } from "@/lib/utils"

type KbdProps = React.ComponentProps<"kbd"> & {
  stylexStyle?: stylex.StyleXStyles
}

function Kbd({ className, style, stylexStyle, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      {...stylexProps(
        [styles.kbd, stylexStyle],
        className,
        style
      )}
      {...props}
    />
  )
}

type KbdGroupProps = React.ComponentProps<"div"> & {
  stylexStyle?: stylex.StyleXStyles
}

function KbdGroup({ className, style, stylexStyle, ...props }: KbdGroupProps) {
  return (
    <div
      data-slot="kbd-group"
      {...stylexProps([styles.group, stylexStyle], className, style)}
      {...props}
    />
  )
}

const styles = stylex.create({
  kbd: {
    display: "inline-flex",
    width: "fit-content",
    minWidth: "1.25rem",
    height: "1.25rem",
    pointerEvents: "none",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.25rem",
    borderRadius: {
      default: "0.25rem",
      ":is([data-slot='input-group-addon'] *)": "var(--radius-4xl)",
    },
    backgroundColor: {
      default: "var(--muted)",
      ":is([data-slot='tooltip-content'] *)": "color-mix(in oklab, var(--background) 20%, transparent)",
      ":is(.dark [data-slot='tooltip-content'] *)": "color-mix(in oklab, var(--background) 10%, transparent)",
      ":is([data-slot='input-group-addon'] *)": "color-mix(in oklab, var(--muted-foreground) 10%, transparent)",
    },
    paddingInline: {
      default: "0.25rem",
      ":is([data-slot='input-group-addon'] *)": "0.375rem",
    },
    color: {
      default: "var(--muted-foreground)",
      ":is([data-slot='tooltip-content'] *)": "var(--background)",
    },
    fontFamily: '"Geist Variable", system-ui, sans-serif',
    fontSize: "0.75rem",
    lineHeight: "1rem",
    fontWeight: 500,
    userSelect: "none",
  },
  group: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
  },
})

export { Kbd, KbdGroup }
