import { Switch } from "./ui/switch"
import { Label } from "./ui/label"

interface SearchToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export function SearchToggle({ enabled, onToggle }: SearchToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="search-mode"
        checked={enabled}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="search-mode">Search</Label>
    </div>
  )
} 