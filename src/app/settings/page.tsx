"use client"

import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Eye, EyeOff, Save, Trash2 } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { MODELS } from "@/lib/models"
import { Switch } from "@/components/ui/switch"

function SettingsPage() {
  const router = useRouter()
  const [apiKeys, setApiKeys] = useState({
    openrouter: "",
    openai: "",
    anthropic: "",
    xai: "",
    google: "",
  })
  const [showApiKeys, setShowApiKeys] = useState({
    openrouter: false,
    openai: false,
    anthropic: false,
    xai: false,
    google: false,
  })
  const [saved, setSaved] = useState(false)
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") as "profile" | "system" | "models" | undefined
  const [enabledModels, setEnabledModels] = useState<string[]>([])

  useEffect(() => {
    // Load saved API keys
    const savedKeys = {
      openrouter: localStorage.getItem("openrouter-api-key") || "",
      openai: localStorage.getItem("openai-api-key") || "",
      anthropic: localStorage.getItem("anthropic-api-key") || "",
      xai: localStorage.getItem("xai-api-key") || "",
      google: localStorage.getItem("google-api-key") || "",
    }
    setApiKeys(savedKeys)

    // Load enabled models from localStorage or default to all
    const stored = localStorage.getItem("enabled-models")
    if (stored) {
      setEnabledModels(JSON.parse(stored))
    } else {
      setEnabledModels(MODELS.map(m => m.id))
    }
  }, [])

  const saveApiKey = (provider: string) => {
    const key = apiKeys[provider as keyof typeof apiKeys]
    if (key.trim()) {
      localStorage.setItem(`${provider}-api-key`, key.trim())
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const removeApiKey = (provider: string) => {
    localStorage.removeItem(`${provider}-api-key`)
    setApiKeys(prev => ({ ...prev, [provider]: "" }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }))
  }

  const toggleShowApiKey = (provider: string) => {
    setShowApiKeys(prev => ({ ...prev, [provider]: !prev[provider as keyof typeof prev] }))
  }

  const handleModelSwitch = (id: string) => {
    setEnabledModels((prev) => {
      let updated: string[]
      if (prev.includes(id)) {
        updated = prev.filter(mid => mid !== id)
      } else {
        updated = [...prev, id]
      }
      localStorage.setItem("enabled-models", JSON.stringify(updated))
      return updated
    })
  }

  return (
    <div className="relative container max-w-2xl mx-auto p-6 pt-20 space-y-6">
      <div className="absolute top-4 left-0 right-0 px-6 flex items-center justify-start w-full">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Chat
        </Button>
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your chat preferences and API keys.</p>
      </div>

      <Separator />

      <Tabs defaultValue={tab || "profile"}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <UserProfile />
        </TabsContent>

        <TabsContent value="system" className="space-y-6" >

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your chat interface.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
                </div>
                <ThemeSwitcher />
              </div>
            </CardContent>
          </Card>

        

          {/* API Key Settings */}
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Use your own API keys to access models directly. Your keys are stored locally and never sent to our servers.
                User-provided keys take priority over environment variables.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OpenRouter */}
              <div className="space-y-2">
                <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="openrouter-key"
                      type={showApiKeys.openrouter ? "text" : "password"}
                      placeholder="sk-or-v1-..."
                      value={apiKeys.openrouter}
                      onChange={(e) => handleApiKeyChange("openrouter", e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleShowApiKey("openrouter")}
                    >
                      {showApiKeys.openrouter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={() => saveApiKey("openrouter")} disabled={!apiKeys.openrouter.trim()} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saved ? "Saved!" : "Save"}
                  </Button>
                  {apiKeys.openrouter && (
                    <Button variant="outline" onClick={() => removeApiKey("openrouter")} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Access all models through OpenRouter. Get your key from{" "}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">
                    OpenRouter
                  </a>
                </p>
              </div>

              {/* OpenAI */}
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="openai-key"
                      type={showApiKeys.openai ? "text" : "password"}
                      placeholder="sk-..."
                      value={apiKeys.openai}
                      onChange={(e) => handleApiKeyChange("openai", e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleShowApiKey("openai")}
                    >
                      {showApiKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={() => saveApiKey("openai")} disabled={!apiKeys.openai.trim()} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saved ? "Saved!" : "Save"}
                  </Button>
                  {apiKeys.openai && (
                    <Button variant="outline" onClick={() => removeApiKey("openai")} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Direct access to OpenAI models. Get your key from{" "}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">
                    OpenAI Platform
                  </a>
                </p>
              </div>

              {/* Anthropic */}
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="anthropic-key"
                      type={showApiKeys.anthropic ? "text" : "password"}
                      placeholder="sk-ant-..."
                      value={apiKeys.anthropic}
                      onChange={(e) => handleApiKeyChange("anthropic", e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleShowApiKey("anthropic")}
                    >
                      {showApiKeys.anthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={() => saveApiKey("anthropic")} disabled={!apiKeys.anthropic.trim()} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saved ? "Saved!" : "Save"}
                  </Button>
                  {apiKeys.anthropic && (
                    <Button variant="outline" onClick={() => removeApiKey("anthropic")} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Direct access to Anthropic models. Get your key from{" "}
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">
                    Anthropic Console
                  </a>
                </p>
              </div>

              {/* xAI */}
              <div className="space-y-2">
                <Label htmlFor="xai-key">xAI API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="xai-key"
                      type={showApiKeys.xai ? "text" : "password"}
                      placeholder="xai-..."
                      value={apiKeys.xai}
                      onChange={(e) => handleApiKeyChange("xai", e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleShowApiKey("xai")}
                    >
                      {showApiKeys.xai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={() => saveApiKey("xai")} disabled={!apiKeys.xai.trim()} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saved ? "Saved!" : "Save"}
                  </Button>
                  {apiKeys.xai && (
                    <Button variant="outline" onClick={() => removeApiKey("xai")} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Direct access to xAI models. Get your key from{" "}
                  <a href="https://console.x.ai/" target="_blank" rel="noopener noreferrer" className="underline">
                    xAI Console
                  </a>
                </p>
              </div>

              {/* Google */}
              <div className="space-y-2">
                <Label htmlFor="google-key">Google API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="google-key"
                      type={showApiKeys.google ? "text" : "password"}
                      placeholder="AIza..."
                      value={apiKeys.google}
                      onChange={(e) => handleApiKeyChange("google", e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleShowApiKey("google")}
                    >
                      {showApiKeys.google ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={() => saveApiKey("google")} disabled={!apiKeys.google.trim()} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saved ? "Saved!" : "Save"}
                  </Button>
                  {apiKeys.google && (
                    <Button variant="outline" onClick={() => removeApiKey("google")} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Direct access to Google models. Get your key from{" "}
                  <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                    Google AI Studio
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Usage Information */}
          <Card>
            <CardHeader>
              <CardTitle>Usage & Billing</CardTitle>
              <CardDescription>Information about your API usage and costs.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                When using your own API keys, you'll be billed directly by the respective providers based on your usage:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• <strong>OpenRouter:</strong> Check your <a href="https://openrouter.ai/activity" target="_blank" rel="noopener noreferrer" className="underline">OpenRouter dashboard</a> for usage statistics</li>
                <li>• <strong>OpenAI:</strong> Check your <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="underline">OpenAI usage dashboard</a></li>
                <li>• <strong>Anthropic:</strong> Check your <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">Anthropic console</a></li>
                <li>• <strong>xAI:</strong> Check your <a href="https://console.x.ai/" target="_blank" rel="noopener noreferrer" className="underline">xAI console</a></li>
                <li>• <strong>Google:</strong> Check your <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud console</a></li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                User-provided API keys take priority over environment variables. If no user key is provided, the system will fall back to environment variables.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Models</CardTitle>
              <CardDescription>Select which models you want to appear in the model selector.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {MODELS.map(model => (
                <div key={model.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.company} &mdash; {model.description}</div>
                  </div>
                  <Switch checked={enabledModels.includes(model.id)} onCheckedChange={() => handleModelSwitch(model.id)} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function page () {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full"/>}>
      <SettingsPage />
    </Suspense>
  )
}
