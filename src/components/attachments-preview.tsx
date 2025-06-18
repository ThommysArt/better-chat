import { Button } from "@/components/ui/button"
import { Paperclip } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AttachmentsPreviewProps {
  attachments: File[]
  onRemove: (index: number) => void
}

export function AttachmentsPreview({ attachments, onRemove }: AttachmentsPreviewProps) {
  if (attachments.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-4 flex flex-wrap gap-2"
      >
        {attachments.map((file, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 bg-muted px-3 py-2 text-sm"
          >
            <Paperclip className="h-4 w-4 shrink-0" />
            <span className="truncate max-w-32">{file.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onRemove(index)}
            >
              ×
            </Button>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
} 