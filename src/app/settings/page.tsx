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
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") as "profile" | "system" | "models" | undefined
  const [enabledModels, setEnabledModels] = useState<string[]>([])

  useEffect(() => {
    // Load saved API key
    const savedKey = localStorage.getItem("openrouter-api-key")
    if (savedKey) {
      setApiKey(savedKey)
    }

    // Load enabled models from localStorage or default to all
    const stored = localStorage.getItem("enabled-models")
    if (stored) {
      setEnabledModels(JSON.parse(stored))
    } else {
      setEnabledModels(MODELS.map(m => m.id))
    }
  }, [])

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("openrouter-api-key", apiKey.trim())
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const removeApiKey = () => {
    localStorage.removeItem("openrouter-api-key")
    setApiKey("")
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
              <CardTitle>Bring Your Own Key</CardTitle>
              <CardDescription>
                Use your own OpenRouter API key to access all models. Your key is stored locally and never sent to our
                servers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">OpenRouter API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      placeholder="sk-or-v1-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button onClick={saveApiKey} disabled={!apiKey.trim()} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saved ? "Saved!" : "Save"}
                  </Button>
                  {apiKey && (
                    <Button variant="outline" onClick={removeApiKey} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">
                    OpenRouter
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
                When using your own API key, you'll be billed directly by OpenRouter based on your usage. Check your{" "}
                <a href="https://openrouter.ai/activity" target="_blank" rel="noopener noreferrer" className="underline">
                  OpenRouter dashboard
                </a>{" "}
                for detailed usage statistics.
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
