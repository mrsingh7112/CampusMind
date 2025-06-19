"use client"
import { useEffect, useState } from 'react'
import { Moon, Sun, Bell, Palette, BellRing, Volume2, Mail, BellDot, Settings, Text, SunMoon, Languages, LayoutDashboard, SlidersHorizontal, Paintbrush, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Toggle } from '@/components/ui/toggle'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const THEMES = [
  { name: 'Default', value: 'theme-default', color: 'bg-blue-600' },
  { name: 'Purple', value: 'theme-purple', color: 'bg-purple-600' },
  { name: 'Green', value: 'theme-green', color: 'bg-green-600' },
  { name: 'Orange', value: 'theme-orange', color: 'bg-orange-500' },
  { name: 'Pink', value: 'theme-pink', color: 'bg-pink-500' },
]

const BACKGROUND_THEMES = [
  { name: 'None', value: 'bg-none', class: '' },
  { name: 'Pattern 1', value: 'bg-pattern-1', class: 'bg-repeat bg-center', style: { backgroundImage: 'url(/patterns/pattern1.svg)' } },
  { name: 'Pattern 2', value: 'bg-pattern-2', class: 'bg-repeat bg-center', style: { backgroundImage: 'url(/patterns/pattern2.svg)' } },
  { name: 'Gradient 1', value: 'bg-gradient-1', class: 'bg-gradient-to-br from-blue-100 to-purple-100' },
  { name: 'Gradient 2', value: 'bg-gradient-2', class: 'bg-gradient-to-br from-green-100 to-yellow-100' },
  { name: 'Image 1', value: 'bg-image-1', class: 'bg-cover bg-center', style: { backgroundImage: 'url(/backgrounds/bg1.jpg)' } },
  { name: 'Image 2', value: 'bg-image-2', class: 'bg-cover bg-center', style: { backgroundImage: 'url(/backgrounds/bg2.jpg)' } },
]

export default function AdminSettingsPage() {
  const [darkMode, setDarkMode] = useState(false)
  const [theme, setTheme] = useState('theme-default')
  const [fontSize, setFontSize] = useState('base')
  const [sidebarCompact, setSidebarCompact] = useState(false)
  const [contrastHigh, setContrastHigh] = useState(false)
  const [dyslexiaFont, setDyslexiaFont] = useState(false)
  const [customPrimary, setCustomPrimary] = useState<string | null>(null)
  const [notifSound, setNotifSound] = useState(false)
  const [notifEmail, setNotifEmail] = useState(false)
  const [notifPush, setNotifPush] = useState(false)
  const [language, setLanguage] = useState('en')
  const [layout, setLayout] = useState('card')
  const [backgroundTheme, setBackgroundTheme] = useState('bg-none')

  const { toast } = useToast()

  useEffect(() => {
    // Load settings from localStorage
    setDarkMode(localStorage.getItem('darkMode') === 'true')
    setTheme(localStorage.getItem('theme') || 'theme-default')
    setFontSize(localStorage.getItem('fontSize') || 'base')
    setSidebarCompact(localStorage.getItem('sidebarCompact') === 'true')
    setContrastHigh(localStorage.getItem('contrastHigh') === 'true')
    setDyslexiaFont(localStorage.getItem('dyslexiaFont') === 'true')
    setCustomPrimary(localStorage.getItem('customPrimary'))
    setNotifSound(localStorage.getItem('notifSound') === 'true')
    setNotifEmail(localStorage.getItem('notifEmail') === 'true')
    setNotifPush(localStorage.getItem('notifPush') === 'true')
    setLanguage(localStorage.getItem('language') || 'en')
    setLayout(localStorage.getItem('layout') || 'card')
    setBackgroundTheme(localStorage.getItem('backgroundTheme') || 'bg-none')
  }, [])

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  useEffect(() => {
    // Theme classes
    const html = document.documentElement
    html.classList.remove(
      ...THEMES.map(t => t.value),
      ...BACKGROUND_THEMES.map(b => b.value),
      'contrast-high',
      'dyslexia-font',
    )
    // Remove any previous background image styles
    html.style.removeProperty('background-image')
    html.style.removeProperty('background-repeat')
    html.style.removeProperty('background-position')
    html.style.removeProperty('background-size')

    html.classList.add(theme)
    
    const selectedBackground = BACKGROUND_THEMES.find(b => b.value === backgroundTheme);
    if (selectedBackground) {
      if (selectedBackground.class) {
        html.classList.add(selectedBackground.class)
      }
      if (selectedBackground.style?.backgroundImage) {
        html.style.setProperty('background-image', selectedBackground.style.backgroundImage)
        html.style.setProperty('background-repeat', selectedBackground.style.backgroundRepeat || 'no-repeat')
        html.style.setProperty('background-position', selectedBackground.style.backgroundPosition || 'center')
        html.style.setProperty('background-size', selectedBackground.style.backgroundSize || 'cover')
      }
    }

    if (contrastHigh) html.classList.add('contrast-high')
    if (dyslexiaFont) html.classList.add('dyslexia-font')

    localStorage.setItem('theme', theme)
    localStorage.setItem('backgroundTheme', backgroundTheme)
    localStorage.setItem('contrastHigh', contrastHigh.toString())
    localStorage.setItem('dyslexiaFont', dyslexiaFont.toString())
  }, [theme, contrastHigh, dyslexiaFont, backgroundTheme])

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = fontSize === 'large' ? '18px' : '16px'
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  useEffect(() => {
    // Sidebar mode (for demo, just store it)
    localStorage.setItem('sidebarCompact', sidebarCompact.toString())
  }, [sidebarCompact])

  useEffect(() => {
    const html = document.documentElement
    if (customPrimary) {
      html.style.setProperty('--primary', customPrimary)
      localStorage.setItem('customPrimary', customPrimary)
    } else {
      html.style.removeProperty('--primary')
      localStorage.removeItem('customPrimary')
    }
  }, [customPrimary])

  useEffect(() => {
    localStorage.setItem('notifSound', notifSound.toString())
    localStorage.setItem('notifEmail', notifEmail.toString())
    localStorage.setItem('notifPush', notifPush.toString())
  }, [notifSound, notifEmail, notifPush])

  useEffect(() => {
    localStorage.setItem('language', language)
  }, [language])

  useEffect(() => {
    localStorage.setItem('layout', layout)
  }, [layout])

  const handleResetSettings = () => {
    setDarkMode(false)
    setTheme('theme-default')
    setFontSize('base')
    setSidebarCompact(false)
    setContrastHigh(false)
    setDyslexiaFont(false)
    setCustomPrimary(null)
    setNotifSound(false)
    setNotifEmail(false)
    setNotifPush(false)
    setLayout('card')
    setBackgroundTheme('bg-none')
    localStorage.clear()
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to their default values.",
      variant: "default",
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-600" /> General Settings
        </h1>

        {/* Appearance Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
              <SunMoon className="w-6 h-6" /> Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of your interface.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="darkModeToggle" className="text-lg font-medium">Dark Mode</Label>
              <Switch
                id="darkModeToggle"
                checked={darkMode}
                onCheckedChange={setDarkMode}
                aria-label="Toggle dark mode"
              />
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2"><Palette className="w-5 h-5" /> Theme</h3>
              <div className="flex gap-3 flex-wrap">
                {THEMES.map(t => (
                  <Button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    variant={theme === t.value ? 'default' : 'outline'}
                    className={`${t.color} ${theme === t.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''} text-white font-semibold transition-all`}
                  >
                    {t.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2"><Text className="w-5 h-5" /> Font Size</h3>
              <div className="flex gap-2">
                <Toggle
                  pressed={fontSize === 'base'}
                  onPressedChange={() => setFontSize('base')}
                  aria-label="Set font size to normal"
                >
                  Normal
                </Toggle>
                <Toggle
                  pressed={fontSize === 'large'}
                  onPressedChange={() => setFontSize('large')}
                  aria-label="Set font size to large"
                >
                  Large
                </Toggle>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sidebarCompactToggle" className="text-lg font-medium">Compact Sidebar</Label>
              <Switch
                id="sidebarCompactToggle"
                checked={sidebarCompact}
                onCheckedChange={setSidebarCompact}
                aria-label="Toggle compact sidebar"
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
              <SlidersHorizontal className="w-6 h-6" /> Accessibility
            </CardTitle>
            <CardDescription>Adjust settings for better readability and interaction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="contrastHighToggle" className="text-lg font-medium">High Contrast Mode</Label>
              <Switch
                id="contrastHighToggle"
                checked={contrastHigh}
                onCheckedChange={setContrastHigh}
                aria-label="Toggle high contrast mode"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dyslexiaFontToggle" className="text-lg font-medium">Dyslexia-Friendly Font</Label>
              <Switch
                id="dyslexiaFontToggle"
                checked={dyslexiaFont}
                onCheckedChange={setDyslexiaFont}
                aria-label="Toggle dyslexia-friendly font"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2"><Paintbrush className="w-5 h-5" /> Custom Primary Color</h3>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={customPrimary || '#3B82F6'} // Default blue from tailwind.config.ts
                  onChange={e => setCustomPrimary(e.target.value)}
                  className="w-16 h-10 rounded-md border-2 border-gray-300 cursor-pointer"
                  aria-label="Pick primary color"
                />
                <span className="text-gray-700">Choose a custom color for primary elements.</span>
                {customPrimary && (
                  <Button variant="outline" onClick={() => setCustomPrimary(null)} className="ml-auto">
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
              <Bell className="w-6 h-6" /> Notifications
            </CardTitle>
            <CardDescription>Manage how you receive alerts and updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifSoundToggle" className="text-lg font-medium">Sound Notifications</Label>
              <Switch
                id="notifSoundToggle"
                checked={notifSound}
                onCheckedChange={setNotifSound}
                aria-label="Toggle sound notifications"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifEmailToggle" className="text-lg font-medium">Email Notifications</Label>
              <Switch
                id="notifEmailToggle"
                checked={notifEmail}
                onCheckedChange={setNotifEmail}
                aria-label="Toggle email notifications"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifPushToggle" className="text-lg font-medium">Push Notifications</Label>
              <Switch
                id="notifPushToggle"
                checked={notifPush}
                onCheckedChange={setNotifPush}
                aria-label="Toggle push notifications"
              />
            </div>
          </CardContent>
        </Card>

        {/* Language & Layout Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
              <Languages className="w-6 h-6" /> Localization & Layout
            </CardTitle>
            <CardDescription>Set your preferred language and dashboard layout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="language-select" className="text-lg font-medium mb-3 block">Choose Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language-select" className="w-[180px]">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="pa">Punjabi</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 mt-2">UI language setting, for future use.</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2"><LayoutDashboard className="w-5 h-5" /> Dashboard Layout</h3>
              <div className="flex gap-2">
                <Toggle
                  pressed={layout === 'card'}
                  onPressedChange={() => setLayout('card')}
                  aria-label="Set dashboard layout to card view"
                >
                  Card View
                </Toggle>
                <Toggle
                  pressed={layout === 'grid'}
                  onPressedChange={() => setLayout('grid')}
                  aria-label="Set dashboard layout to grid view"
                >
                  Grid View
                </Toggle>
                <Toggle
                  pressed={layout === 'list'}
                  onPressedChange={() => setLayout('list')}
                  aria-label="Set dashboard layout to list view"
                >
                  List View
                </Toggle>
              </div>
              <p className="text-sm text-gray-500 mt-2">Affects dashboard widgets and data display style.</p>
            </div>
          </CardContent>
        </Card>

        {/* Background Settings */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-indigo-800 flex items-center gap-2">
              <Palette className="w-6 h-6" /> Background
            </CardTitle>
            <CardDescription>Customize the background of your interface.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2"><Palette className="w-5 h-5" /> Background Theme</h3>
              <div className="flex gap-3 flex-wrap">
                {BACKGROUND_THEMES.map(b => (
                  <Button
                    key={b.value}
                    onClick={() => setBackgroundTheme(b.value)}
                    variant={backgroundTheme === b.value ? 'default' : 'outline'}
                    className={`${b.class} ${backgroundTheme === b.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''} text-white font-semibold transition-all`}
                  >
                    {b.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reset Settings */}
        <Card className="shadow-lg bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-800 flex items-center gap-2">
              <X className="w-6 h-6" /> Reset Settings
            </CardTitle>
            <CardDescription>Revert all settings to their default values. This action cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleResetSettings}>
              Reset All Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 