"use client"

import { useTheme as useNextTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const themes = [
  { name: "Light", value: "light" },
  { name: "Dark", value: "dark" },
  { name: "System", value: "system" },
]

export function ColorThemeSelector() {
  const { theme, setTheme } = useNextTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          {themes.map((t) => (
            <DropdownMenuRadioItem key={t.value} value={t.value}>
              {t.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
