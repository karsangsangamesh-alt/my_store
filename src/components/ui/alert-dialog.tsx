"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface AlertDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogFooterProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogActionProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface AlertDialogCancelProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface AlertDialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
  className?: string
}

export function AlertDialog({
  children,
  open = false,
  onOpenChange
}: AlertDialogProps) {
  const [isOpen, setIsOpen] = React.useState(open)

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AlertDialogTrigger) {
            return React.cloneElement(child as React.ReactElement<{ onClick?: () => void; className?: string }>, {
              onClick: () => handleOpenChange(true),
              className: (child.props as { className?: string }).className
            })
          }
          if (child.type === AlertDialogContent) {
            return isOpen ? child : null
          }
          if (child.type === AlertDialogCancel || child.type === AlertDialogAction) {
            return React.cloneElement(child as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
              onClick: (e: React.MouseEvent) => {
                (child.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e)
                handleOpenChange(false)
              }
            })
          }
          return child
        }
        return child
      })}
    </>
  )
}

export function AlertDialogTrigger({
  children,
  asChild = false,
  className
}: AlertDialogTriggerProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: (children.props as { onClick?: () => void }).onClick
    })
  }

  return (
    <button className={className} type="button">
      {children}
    </button>
  )
}

export function AlertDialogContent({
  children,
  className
}: AlertDialogContentProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/80"
        onClick={() => {
          // Close on backdrop click - we'll need to handle this via context
        }}
      />
      <div className={cn(
        "relative max-w-lg rounded-lg border bg-background p-6 shadow-lg",
        className
      )}>
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => {
            // Close button - we'll need to handle this via context
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

export function AlertDialogHeader({
  children,
  className
}: AlertDialogHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
      {children}
    </div>
  )
}

export function AlertDialogFooter({
  children,
  className
}: AlertDialogFooterProps) {
  return (
    <div className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}>
      {children}
    </div>
  )
}

export function AlertDialogTitle({
  children,
  className
}: AlertDialogTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold", className)}>
      {children}
    </h3>
  )
}

export function AlertDialogDescription({
  children,
  className
}: AlertDialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  )
}

export function AlertDialogAction({
  children,
  onClick,
  className
}: AlertDialogActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(buttonVariants(), className)}
      type="button"
    >
      {children}
    </button>
  )
}

export function AlertDialogCancel({
  children,
  onClick,
  className
}: AlertDialogCancelProps) {
  return (
    <button
      onClick={onClick}
      className={cn(buttonVariants({ variant: "outline" }), className)}
      type="button"
    >
      {children}
    </button>
  )
}
