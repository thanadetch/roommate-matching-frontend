import * as React from "react"
import { toast as sonnerToast } from "sonner"

export function useToast() {
  const toast = React.useCallback(
    (options: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
      if (options.variant === "destructive") {
        sonnerToast.error(options.title ?? "Error", { description: options.description })
      } else {
        sonnerToast.success(options.title ?? "Success", { description: options.description })
      }
    },
    []
  )

  return { toast }
}
