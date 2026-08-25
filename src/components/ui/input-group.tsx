"use client"

import * as React from "react"
import * as stylex from "@stylexjs/stylex"

import { stylexProps } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type StyledProps<T> = T & { stylexStyle?: stylex.StyleXStyles }

function InputGroup({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<"div">>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      {...stylexProps([styles.group, stylex.defaultMarker(), stylexStyle], className, style)}
      {...props}
    />
  )
}

type InputGroupAlign = "inline-start" | "inline-end" | "block-start" | "block-end"

function InputGroupAddon({
  className,
  style,
  stylexStyle,
  align = "inline-start",
  ...props
}: StyledProps<React.ComponentProps<"div">> & { align?: InputGroupAlign | null }) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      {...stylexProps(
        [styles.addon, addonStyles[align ?? "inline-start"], stylex.defaultMarker(), stylexStyle],
        className,
        style
      )}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

type InputGroupButtonSize = "xs" | "sm" | "icon-xs" | "icon-sm"

function InputGroupButton({
  className,
  style,
  stylexStyle,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  {
    size?: InputGroupButtonSize | null
    type?: "button" | "submit" | "reset"
  }) {
  return (
    <Button
      type={type}
      data-input-group-button=""
      data-size={size}
      variant={variant}
      className={className}
      style={style}
      stylexStyle={[styles.groupButton, groupButtonStyles[size ?? "xs"], stylexStyle]}
      {...props}
    />
  )
}

function InputGroupText({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<"span">>) {
  return (
    <span
      data-slot="input-group-text"
      {...stylexProps(
        [styles.text, stylexStyle],
        className,
        style
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<"input">>) {
  return (
    <Input
      data-slot="input-group-control"
      className={className}
      style={style}
      stylexStyle={[styles.control, styles.inputControl, stylexStyle]}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<"textarea">>) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={className}
      style={style}
      stylexStyle={[styles.control, styles.textareaControl, stylexStyle]}
      {...props}
    />
  )
}

const styles = stylex.create({
  group: {
    position: "relative",
    display: "flex",
    width: "100%",
    minWidth: 0,
    height: {
      default: "2.25rem",
      ":has(> [data-align='block-end'])": "auto",
      ":has(> [data-align='block-start'])": "auto",
      ":has(> textarea)": "auto",
    },
    flexDirection: {
      default: "row",
      ":has(> [data-align='block-end'])": "column",
      ":has(> [data-align='block-start'])": "column",
    },
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "var(--input)",
      ":has([data-slot='input-group-control']:focus-visible)": "var(--ring)",
      ":has([data-slot][aria-invalid='true'])": "var(--destructive)",
      ":is([data-slot='combobox-content'] *):focus-within": "inherit",
    },
    borderRadius: {
      default: "var(--radius-4xl)",
      ":has([data-align='block-end'])": "var(--radius-2xl)",
      ":has([data-align='block-start'])": "var(--radius-2xl)",
      ":has(textarea)": "var(--radius-xl)",
    },
    backgroundColor: "color-mix(in oklab, var(--input) 30%, transparent)",
    outline: "none",
    boxShadow: {
      default: "none",
      ":has([data-slot='input-group-control']:focus-visible)": "0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)",
      ":has([data-slot][aria-invalid='true'])": "0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent)",
      ":is(.dark *):has([data-slot][aria-invalid='true'])": "0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent)",
      ":is([data-slot='combobox-content'] *):focus-within": "none",
    },
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke",
    transitionDuration: "150ms",
  },
  addon: {
    display: "flex",
    height: "auto",
    cursor: "text",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    paddingTop: "0.5rem",
    paddingBottom: "0.5rem",
    color: "var(--muted-foreground)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 500,
    userSelect: "none",
    opacity: {
      default: 1,
      [stylex.when.ancestor('[data-disabled="true"]')]: 0.5,
    },
  },
  groupButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    borderRadius: "var(--radius-4xl)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    boxShadow: {
      default: "none",
      ":focus-visible": "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
  },
  text: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "var(--muted-foreground)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  control: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
    boxShadow: "none",
    paddingRight: {
      default: null,
      [stylex.when.ancestor(":has(> [data-align='inline-end'])")]: "0.375rem",
    },
    paddingLeft: {
      default: null,
      [stylex.when.ancestor(":has(> [data-align='inline-start'])")]: "0.375rem",
    },
    outline: "none",
  },
  inputControl: {
    paddingTop: {
      default: null,
      [stylex.when.ancestor(":has(> [data-align='block-end'])")]: "0.75rem",
    },
    paddingBottom: {
      default: null,
      [stylex.when.ancestor(":has(> [data-align='block-start'])")]: "0.75rem",
    },
  },
  textareaControl: {
    resize: "none",
    paddingBlock: "0.5rem",
  },
})

const addonStyles = stylex.create({
  "inline-start": {
    order: -9999,
    paddingLeft: "0.75rem",
    marginLeft: { default: 0, ":has(> button)": "-0.25rem", ":has(> kbd)": "-0.15rem" },
  },
  "inline-end": {
    order: 9999,
    paddingRight: "0.75rem",
    marginRight: { default: 0, ":has(> button)": "-0.25rem", ":has(> kbd)": "-0.15rem" },
  },
  "block-start": {
    order: -9999,
    width: "100%",
    justifyContent: "flex-start",
    paddingInline: "0.75rem",
    paddingTop: "0.75rem",
    paddingBottom: {
      default: "0.5rem",
      ":is(.border-b *)": "0.75rem",
    },
  },
  "block-end": {
    order: 9999,
    width: "100%",
    justifyContent: "flex-start",
    paddingInline: "0.75rem",
    paddingBottom: "0.75rem",
    paddingTop: {
      default: "0.5rem",
      ":is(.border-t *)": "0.75rem",
    },
  },
})

const groupButtonStyles = stylex.create({
  xs: {
    height: "1.5rem",
    gap: "0.25rem",
    paddingInline: "0.375rem",
  },
  sm: {},
  "icon-xs": {
    width: "1.5rem",
    height: "1.5rem",
    padding: 0,
  },
  "icon-sm": {
    width: "2rem",
    height: "2rem",
    padding: 0,
  },
})

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
