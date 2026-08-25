"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import * as stylex from "@stylexjs/stylex"

import { stylexProps } from "@/lib/utils"

type SeparatorProps = SeparatorPrimitive.Props & {
  stylexStyle?: stylex.StyleXStyles
}

function Separator({
  className,
  style,
  stylexStyle,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      {...stylexProps(
        [styles.base, orientation === "horizontal" ? styles.horizontal : styles.vertical, stylexStyle],
        className,
        style
      )}
      {...props}
    />
  )
}

const styles = stylex.create({
  base: {
    flexShrink: 0,
    backgroundColor: "var(--border)",
  },
  horizontal: {
    width: "100%",
    height: 1,
  },
  vertical: {
    width: 1,
    alignSelf: "stretch",
  },
})

export { Separator }
