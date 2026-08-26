import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import * as stylex from "@stylexjs/stylex"

import { stylexProps } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SearchIcon, CheckIcon } from "lucide-react"

type StyledProps<T> = T & { stylexStyle?: stylex.StyleXStyles }

function Command({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof CommandPrimitive>>) {
  return (
    <CommandPrimitive
      data-slot="command"
      {...stylexProps([styles.command, stylexStyle], className, style)}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  stylexStyle,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  className?: string
  stylexStyle?: stylex.StyleXStyles
  showCloseButton?: boolean
  children: React.ReactNode
}) {
  return (
    <Dialog {...props}>
      <DialogHeader stylexStyle={styles.screenReaderOnly}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={className}
        stylexStyle={[styles.dialogContent, stylexStyle]}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof CommandPrimitive.Input>>) {
  return (
    <div
      data-slot="command-input-wrapper"
      {...stylex.props(styles.inputWrapper)}
    >
      <SearchIcon {...stylex.props(styles.searchIcon)} aria-hidden="true" />
      <CommandPrimitive.Input
        data-slot="command-input"
        {...stylexProps([styles.input, stylexStyle], className, style)}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof CommandPrimitive.List>>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      {...stylexProps([styles.list, stylexStyle], className, style)}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof CommandPrimitive.Empty>>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      {...stylexProps([styles.empty, stylexStyle], className, style)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof CommandPrimitive.Group>>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      {...stylexProps(
        [styles.group, stylexStyle],
        className,
        style
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<typeof CommandPrimitive.Separator>>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      {...stylexProps([styles.separator, stylexStyle], className, style)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  style,
  stylexStyle,
  children,
  ...props
}: StyledProps<React.ComponentProps<typeof CommandPrimitive.Item>>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      {...stylexProps(
        [styles.item, stylex.defaultMarker(), stylexStyle],
        className,
        style
      )}
      {...props}
    >
      {children}
      <CheckIcon {...stylex.props(styles.checkIcon)} />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  style,
  stylexStyle,
  ...props
}: StyledProps<React.ComponentProps<"span">>) {
  return (
    <span
      data-slot="command-shortcut"
      {...stylexProps([styles.shortcut, stylex.defaultMarker(), stylexStyle], className, style)}
      {...props}
    />
  )
}

const styles = stylex.create({
  command: {
    display: "flex",
    width: "100%",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: "var(--radius-xl)",
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
  },
  screenReaderOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    margin: -1,
    overflow: "hidden",
    borderWidth: 0,
    padding: 0,
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    clipPath: "inset(50%)",
  },
  dialogContent: {
    top: "18%",
    overflow: "hidden",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "var(--border)",
    borderRadius: "var(--radius-xl)",
    padding: 0,
    boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.1)",
    transform: "translate(-50%, 0)",
  },
  inputWrapper: {
    display: "flex",
    height: "3rem",
    alignItems: "center",
    gap: "0.625rem",
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "var(--border)",
    paddingInline: "1rem",
  },
  searchIcon: {
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    color: "var(--dim)",
  },
  input: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    color: "var(--foreground)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    outline: "none",
    cursor: { default: "auto", ":disabled": "not-allowed" },
    opacity: { default: 1, ":disabled": 0.5 },
    "::placeholder": { color: "var(--dim)" },
  },
  list: {
    maxHeight: "18rem",
    overflowX: "hidden",
    overflowY: "auto",
    scrollPaddingBlock: "0.375rem",
    scrollbarWidth: "none",
    outline: "none",
    "::-webkit-scrollbar": { display: "none" },
  },
  empty: {
    paddingBlock: "2.5rem",
    textAlign: "center",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  group: {
    overflow: "hidden",
    color: "var(--foreground)",
  },
  separator: {
    height: 1,
    marginBlock: "0.25rem",
    backgroundColor: "var(--border)",
  },
  item: {
    position: "relative",
    display: "flex",
    cursor: "default",
    alignItems: "center",
    gap: "0.625rem",
    borderRadius: "var(--radius-lg)",
    paddingInline: "0.625rem",
    paddingBlock: "0.5rem",
    color: {
      default: "inherit",
      ':is([data-selected="true"])': "var(--foreground)",
    },
    backgroundColor: {
      default: "transparent",
      ':is([data-selected="true"])': "var(--secondary)",
    },
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    outline: "none",
    userSelect: "none",
    pointerEvents: {
      default: "auto",
      ':is([data-disabled="true"])': "none",
    },
    opacity: {
      default: 1,
      ':is([data-disabled="true"])': 0.5,
    },
  },
  checkIcon: {
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    marginLeft: "auto",
    pointerEvents: "none",
    display: {
      default: "block",
      [stylex.when.siblingBefore("[data-slot='command-shortcut']")]: "none",
    },
    opacity: {
      default: 0,
      [stylex.when.ancestor('[data-checked="true"]')]: 1,
    },
  },
  shortcut: {
    marginLeft: "auto",
    color: {
      default: "var(--dim)",
      [stylex.when.ancestor('[data-selected="true"]')]: "var(--muted-foreground)",
    },
    fontSize: "0.75rem",
    lineHeight: "1rem",
    letterSpacing: "0.1em",
  },
})

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
