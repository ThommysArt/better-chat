import { useEffect, useState } from "react"
import { MODELS, getModelById } from "@/lib/models"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

interface ModelSelectorProps {
  selectedModelId: string
  onModelSelect: (modelId: string) => void
  disabled?: boolean
  isSignedIn: boolean
}

export function ModelSelector({
  selectedModelId = "google/gemini-2.0-flash",
  onModelSelect,
  disabled = false,
  isSignedIn,
}: ModelSelectorProps) {
  const [enabledModels, setEnabledModels] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("enabled-models")
    if (stored) {
      setEnabledModels(JSON.parse(stored))
    } else {
      setEnabledModels(MODELS.map(m => m.id))
    }
  }, [])

  const availableModels = MODELS.filter(m => enabledModels.includes(m.id))
  const selectedModel = getModelById(selectedModelId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-64 justify-between"
          disabled={disabled}
        >
          <div className="flex flex-col items-start">
            <span className="font-medium text-left">
              {selectedModel?.name || "Select Model"}
            </span>
            {/* <span className="text-xs text-muted-foreground">
              {selectedModel?.company}
            </span> */}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Command shouldFilter={true}>
          <CommandInput placeholder="Search models..." />
          <CommandList>
            <CommandEmpty>No models found.</CommandEmpty>
            <CommandGroup heading="Models">
              {availableModels.map(model => (
                <CommandItem
                  key={model.id}
                  value={model.name + ' ' + model.company + ' ' + model.codeName}
                  onSelect={() => {
                    onModelSelect(model.id)
                    setOpen(false)
                  }}
                  className="flex flex-col items-start gap-0.5 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{model.name}</span>
                    <Badge variant="secondary" className="text-xs bg-muted-foreground/30">
                      {model.provider}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{model.company} &mdash; {model.codeName}</span>
                  <span className="text-xs text-muted-foreground line-clamp-2">{model.description}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}