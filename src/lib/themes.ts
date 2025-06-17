export interface Theme {
  name: string
  label: string
  cssVars: {
    light: Record<string, string>
    dark: Record<string, string>
  }
}

export const themes: Theme[] = [
  {
    name: "default",
    label: "Default",
    cssVars: {
      light: {
        background: "0 0% 100%",
        foreground: "0 0% 3.9%",
        card: "0 0% 100%",
        "card-foreground": "0 0% 3.9%",
        popover: "0 0% 100%",
        "popover-foreground": "0 0% 3.9%",
        primary: "0 0% 9%",
        "primary-foreground": "0 0% 98%",
        secondary: "0 0% 96.1%",
        "secondary-foreground": "0 0% 9%",
        muted: "0 0% 96.1%",
        "muted-foreground": "0 0% 45.1%",
        accent: "0 0% 96.1%",
        "accent-foreground": "0 0% 9%",
        destructive: "0 84.2% 60.2%",
        "destructive-foreground": "0 0% 98%",
        border: "0 0% 89.8%",
        input: "0 0% 89.8%",
        ring: "0 0% 3.9%",
        radius: "0.5rem",
      },
      dark: {
        background: "0 0% 3.9%",
        foreground: "0 0% 98%",
        card: "0 0% 3.9%",
        "card-foreground": "0 0% 98%",
        popover: "0 0% 3.9%",
        "popover-foreground": "0 0% 98%",
        primary: "0 0% 98%",
        "primary-foreground": "0 0% 9%",
        secondary: "0 0% 14.9%",
        "secondary-foreground": "0 0% 98%",
        muted: "0 0% 14.9%",
        "muted-foreground": "0 0% 63.9%",
        accent: "0 0% 14.9%",
        "accent-foreground": "0 0% 98%",
        destructive: "0 62.8% 30.6%",
        "destructive-foreground": "0 0% 98%",
        border: "0 0% 14.9%",
        input: "0 0% 14.9%",
        ring: "0 0% 83.1%",
        radius: "0.5rem",
      },
    },
  },
  {
    name: "claude",
    label: "Claude",
    cssVars: {
      light: {
        background: "oklch(0.9818 0.0054 95.0986)",
        foreground: "oklch(0.3438 0.0269 95.7226)",
        card: "oklch(0.9818 0.0054 95.0986)",
        "card-foreground": "oklch(0.1908 0.0020 106.5859)",
        popover: "oklch(1.0000 0 0)",
        "popover-foreground": "oklch(0.2671 0.0196 98.9390)",
        primary: "oklch(0.6171 0.1375 39.0427)",
        "primary-foreground": "oklch(1.0000 0 0)",
        secondary: "oklch(0.9245 0.0138 92.9892)",
        "secondary-foreground": "oklch(0.4334 0.0177 98.6048)",
        muted: "oklch(0.9341 0.0153 90.2390)",
        "muted-foreground": "oklch(0.6059 0.0075 97.4233)",
        accent: "oklch(0.9245 0.0138 92.9892)",
        "accent-foreground": "oklch(0.2671 0.0196 98.9390)",
        destructive: "oklch(0.1908 0.0020 106.5859)",
        "destructive-foreground": "oklch(1.0000 0 0)",
        border: "oklch(0.8847 0.0069 97.3627)",
        input: "oklch(0.7621 0.0156 98.3528)",
        ring: "oklch(0.5937 0.1673 253.0630)",
        radius: "1rem",
      },
      dark: {
        background: "oklch(0.2679 0.0036 106.6427)",
        foreground: "oklch(0.8074 0.0142 93.0137)",
        card: "oklch(0.2679 0.0036 106.6427)",
        "card-foreground": "oklch(0.9818 0.0054 95.0986)",
        popover: "oklch(0.3085 0.0035 106.6039)",
        "popover-foreground": "oklch(0.9211 0.0040 106.4781)",
        primary: "oklch(0.6724 0.1308 38.7559)",
        "primary-foreground": "oklch(1.0000 0 0)",
        secondary: "oklch(0.9818 0.0054 95.0986)",
        "secondary-foreground": "oklch(0.3085 0.0035 106.6039)",
        muted: "oklch(0.2213 0.0038 106.7070)",
        "muted-foreground": "oklch(0.7713 0.0169 99.0657)",
        accent: "oklch(0.2130 0.0078 95.4245)",
        "accent-foreground": "oklch(0.9663 0.0080 98.8792)",
        destructive: "oklch(0.6368 0.2078 25.3313)",
        "destructive-foreground": "oklch(1.0000 0 0)",
        border: "oklch(0.3618 0.0101 106.8928)",
        input: "oklch(0.4336 0.0113 100.2195)",
        ring: "oklch(0.5937 0.1673 253.0630)",
        radius: "1rem",
      },
    },
  },
]

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark = root.classList.contains("dark")
  const vars = isDark ? theme.cssVars.dark : theme.cssVars.light

  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })
}

export function getStoredTheme(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("selected-theme") || "default"
  }
  return "default"
}

export function setStoredTheme(themeName: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("selected-theme", themeName)
  }
}
