import { Switch } from "./ui/switch"
import { Label } from "./ui/label"

interface ThinkingToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function ThinkingToggle({ enabled, onToggle }: ThinkingToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="thinking-mode"
        checked={enabled}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="thinking-mode">Thinking</Label>
    </div>
  )
} 