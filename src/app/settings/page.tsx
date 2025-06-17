"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Save, Trash2 } from "lucide-react"
import { ThemeSelector } from "@/components/theme-selector"

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load saved API key
    const savedKey = localStorage.getItem("openrouter-api-key")
    if (savedKey) {
      setApiKey(savedKey)
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

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your chat preferences and API keys.</p>
      </div>

      <Separator />

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
            <ThemeSelector />
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
    </div>
  )
}
