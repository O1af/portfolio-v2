import * as stylex from "@stylexjs/stylex"
import type { CSSProperties } from "react"

export function stylexProps(
  styles: stylex.StyleXStyles,
  className?: string,
  style?: CSSProperties
): { className: string; style: CSSProperties }
export function stylexProps<State>(
  styles: stylex.StyleXStyles,
  className: string | ((state: State) => string | undefined) | undefined,
  style: CSSProperties | ((state: State) => CSSProperties | undefined) | undefined
): {
  className: string | ((state: State) => string)
  style: CSSProperties | ((state: State) => CSSProperties)
}
export function stylexProps<State>(
  styles: stylex.StyleXStyles,
  className?: string | ((state: State) => string | undefined),
  style?: CSSProperties | ((state: State) => CSSProperties | undefined)
) {
  const compiled = stylex.props(styles)
  const mergeClassName = (value?: string) =>
    [compiled.className, value].filter(Boolean).join(" ")
  const mergeStyle = (value?: CSSProperties): CSSProperties => ({ ...compiled.style, ...value })

  return {
    className:
      typeof className === "function"
        ? (state: State) => mergeClassName(className(state))
        : mergeClassName(className),
    style:
      typeof style === "function"
        ? (state: State) => mergeStyle(style(state))
        : mergeStyle(style),
  }
}
