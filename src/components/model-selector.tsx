import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getAllModels, getModelById, ModelProvider } from "@/lib/models"

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
  const selectedModel = getModelById(selectedModelId)
  const models = getAllModels()
  const availableModels = isSignedIn ? models : models.filter((model) => model.id === "google/gemini-2.0-flash-exp")

  return (
    <Select value={selectedModelId} onValueChange={onModelSelect} disabled={disabled}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select Model">
          {selectedModel?.name || "Select Model"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-64">
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
            <div className="px-2 py-1.5 text-sm font-semibold text-primary-foreground">{company}</div>
            {companyModels.map((model) => (
              <SelectItem key={model.id} value={model.id} className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{model.name}</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{model.description}</span>
                <Badge variant="secondary" className="text-xs bg-muted-foreground/30">
                  {model.provider === "openrouter" ? "OpenRouter" : "Google"}
                </Badge>
              </SelectItem>
            ))}
          </div>
        ))}
        {!isSignedIn && (
          <div className="p-2 text-xs text-muted-foreground border-t">Sign in to access more models</div>
        )}
      </SelectContent>
    </Select>
  )
}