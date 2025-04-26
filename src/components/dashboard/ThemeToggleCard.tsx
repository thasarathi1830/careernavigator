
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeContext } from "@/contexts/ThemeContext";

export function ThemeToggleCard() {
  const { theme, setTheme, isLoading } = useThemeContext();
  const [savingState, setSavingState] = useState<string | null>(null);

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    if (isLoading) return;
    
    setSavingState(newTheme);
    await setTheme(newTheme);
    setTimeout(() => {
      setSavingState(null);
    }, 1000);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-md">Appearance Settings</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className={`flex flex-col items-center justify-center h-16 ${isLoading ? "opacity-50" : ""}`}
              disabled={isLoading}
              onClick={() => handleThemeChange("light")}
              aria-label="Light theme"
            >
              <Sun className="h-4 w-4 mb-1" />
              <span className="text-xs">
                {savingState === "light" ? "Saved!" : "Light"}
              </span>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className={`flex flex-col items-center justify-center h-16 ${isLoading ? "opacity-50" : ""}`}
              disabled={isLoading}
              onClick={() => handleThemeChange("dark")}
              aria-label="Dark theme"
            >
              <Moon className="h-4 w-4 mb-1" />
              <span className="text-xs">
                {savingState === "dark" ? "Saved!" : "Dark"}
              </span>
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              className={`flex flex-col items-center justify-center h-16 ${isLoading ? "opacity-50" : ""}`}
              disabled={isLoading}
              onClick={() => handleThemeChange("system")}
              aria-label="System theme"
            >
              <Monitor className="h-4 w-4 mb-1" />
              <span className="text-xs">
                {savingState === "system" ? "Saved!" : "System"}
              </span>
            </Button>
          </div>
          <Button 
            variant="link" 
            size="sm" 
            onClick={() => window.location.href = "/settings?tab=appearance"}
            className="ml-auto mr-0"
          >
            More settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
