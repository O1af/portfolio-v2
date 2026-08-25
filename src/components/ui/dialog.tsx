import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import * as stylex from "@stylexjs/stylex"

import { stylexProps } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  style,
  stylexStyle,
  ...props
}: DialogPrimitive.Backdrop.Props & { stylexStyle?: stylex.StyleXStyles }) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      {...stylexProps([styles.overlay, stylexStyle], className, style)}
      {...props}
    />
  )
}

function DialogContent({
  className,
  style,
  stylexStyle,
  children,
  showCloseButton = true,
  ...props
}: DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean
  stylexStyle?: stylex.StyleXStyles
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        {...stylexProps([styles.content, stylexStyle], className, style)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                stylexStyle={styles.closeButton}
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span {...stylex.props(styles.screenReaderOnly)}>Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({
  className,
  style,
  stylexStyle,
  ...props
}: React.ComponentProps<"div"> & { stylexStyle?: stylex.StyleXStyles }) {
  return (
    <div
      data-slot="dialog-header"
      {...stylexProps([styles.header, stylexStyle], className, style)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  style,
  stylexStyle,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
  stylexStyle?: stylex.StyleXStyles
}) {
  return (
    <div
      data-slot="dialog-footer"
      {...stylexProps([styles.footer, stylexStyle], className, style)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  style,
  stylexStyle,
  ...props
}: DialogPrimitive.Title.Props & { stylexStyle?: stylex.StyleXStyles }) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      {...stylexProps([styles.title, stylexStyle], className, style)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  style,
  stylexStyle,
  ...props
}: DialogPrimitive.Description.Props & { stylexStyle?: stylex.StyleXStyles }) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      {...stylexProps(
        [styles.description, stylexStyle],
        className,
        style
      )}
      {...props}
    />
  )
}

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

const fadeOut = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
})

const zoomIn = stylex.keyframes({
  from: { opacity: 0, scale: 0.95 },
  to: { opacity: 1, scale: 1 },
})

const zoomOut = stylex.keyframes({
  from: { opacity: 1, scale: 1 },
  to: { opacity: 0, scale: 0.95 },
})

const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    isolation: "isolate",
    zIndex: 50,
    backgroundColor: "rgb(0 0 0 / 0.3)",
    backdropFilter: {
      default: null,
      "@supports (backdrop-filter: blur(0))": "blur(2px)",
    },
    animationName: {
      default: null,
      ":is([data-open])": fadeIn,
      ":is([data-closed])": fadeOut,
    },
    animationDuration: "100ms",
    animationFillMode: "both",
  },
  content: {
    position: "fixed",
    top: "50%",
    left: "50%",
    zIndex: 50,
    display: "grid",
    width: "100%",
    maxWidth: {
      default: "calc(100% - 2rem)",
      "@media (min-width: 640px)": "28rem",
    },
    transform: "translate(-50%, -50%)",
    gap: "1.5rem",
    borderRadius: "var(--radius-4xl)",
    backgroundColor: "var(--background)",
    padding: "1.5rem",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    outline: "none",
    boxShadow: "0 0 0 1px color-mix(in oklab, var(--foreground) 5%, transparent)",
    animationName: {
      default: null,
      ":is([data-open])": zoomIn,
      ":is([data-closed])": zoomOut,
    },
    animationDuration: "100ms",
    animationFillMode: "both",
  },
  closeButton: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  footer: {
    display: "flex",
    flexDirection: {
      default: "column-reverse",
      "@media (min-width: 640px)": "row",
    },
    justifyContent: {
      default: "normal",
      "@media (min-width: 640px)": "flex-end",
    },
    gap: "0.5rem",
  },
  title: {
    fontSize: "1rem",
    lineHeight: 1,
    fontWeight: 500,
  },
  description: {
    color: "var(--muted-foreground)",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
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
})

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
