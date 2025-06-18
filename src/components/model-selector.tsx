import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { getAllModels, getModelById, ModelProvider } from "@/lib/models"

interface ModelSelectorProps {
  selectedModelId: string
  onModelSelect: (modelId: string) => void
  disabled?: boolean
  isSignedIn: boolean
}

export function ModelSelector({
  selectedModelId,
  onModelSelect,
  disabled = false,
  isSignedIn,
}: ModelSelectorProps) {
  const selectedModel = getModelById(selectedModelId)
  const models = getAllModels()
  const availableModels = isSignedIn ? models : models.filter((model) => model.id === "google/gemini-2.0-flash-exp")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="shrink-0 rounded-lg gap-2 font-medium" disabled={disabled}>
          {selectedModel?.name || "Select Model"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {Object.entries(
          availableModels.reduce(
            (acc, model) => {
              if (!acc[model.company]) acc[model.company] = []
              acc[model.company].push(model)
              return acc
            },
            {} as Record<string, typeof availableModels>,
          ),
        ).map(([company, companyModels]) => (
          <div key={company}>
            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">{company}</div>
            {companyModels.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelSelect(model.id)}
                className="flex flex-col items-start gap-1 p-3"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{model.name}</span>
                  {selectedModelId === model.id && <div className="h-2 w-2 bg-primary rounded-full" />}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{model.description}</span>
                <Badge variant="secondary" className="text-xs bg-muted-foreground/30">
                  {model.provider === "openrouter" ? "OpenRouter" : "Google"}
                </Badge>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </div>
        ))}
        {!isSignedIn && (
          <div className="p-2 text-xs text-muted-foreground border-t">Sign in to access more models</div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 