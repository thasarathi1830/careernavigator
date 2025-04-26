import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type Theme = "dark" | "light" | "system";

interface UserThemePreferences {
  theme: Theme;
  fontSize: string;
  colorBlindMode: boolean;
  reducedMotion: boolean;
}

interface ThemeContextType {
  theme: Theme;
  preferences: UserThemePreferences | null;
  setTheme: (theme: Theme) => Promise<void>;
  updatePreferences: (preferences: Partial<UserThemePreferences>) => Promise<void>;
  isLoading: boolean;
}

interface UserPreferencesData {
  id: string;
  profile_id: string;
  theme: Theme;
  font_size: string;
  color_blind_mode: boolean;
  reduced_motion: boolean;
  created_at: string;
  updated_at: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  preferences: null,
  setTheme: async () => {},
  updatePreferences: async () => {},
  isLoading: true,
});

export const ThemeProvider = ({ children, defaultTheme = "system", storageKey = "vite-ui-theme" }: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [theme, setThemeState] = useState<Theme>(() => 
    (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );
  const [preferences, setPreferences] = useState<UserThemePreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('profile_id', user.id)
          .single() as { 
            data: UserPreferencesData | null, 
            error: any 
          };

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          const userPreferences: UserThemePreferences = {
            theme: data.theme as Theme,
            fontSize: data.font_size,
            colorBlindMode: data.color_blind_mode,
            reducedMotion: data.reduced_motion,
          };

          setPreferences(userPreferences);
          setThemeState(data.theme as Theme);
          localStorage.setItem(storageKey, data.theme);
        } else {
          const defaultPreferences = {
            theme,
            fontSize: "medium",
            colorBlindMode: false,
            reducedMotion: false,
          };

          const { error: insertError } = await supabase
            .from('user_preferences')
            .insert({
              profile_id: user.id,
              theme,
              font_size: defaultPreferences.fontSize,
              color_blind_mode: defaultPreferences.colorBlindMode,
              reduced_motion: defaultPreferences.reducedMotion,
            });

          if (insertError) throw insertError;
          
          setPreferences(defaultPreferences);
        }
      } catch (error) {
        console.error("Error fetching user preferences:", error);
        toast({
          title: "Error",
          description: "Failed to load user preferences",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPreferences();
  }, [user, storageKey, theme, toast]);

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      localStorage.setItem(storageKey, newTheme);
      
      if (user) {
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            profile_id: user.id,
            theme: newTheme,
            font_size: preferences?.fontSize || "medium",
            color_blind_mode: preferences?.colorBlindMode || false,
            reduced_motion: preferences?.reducedMotion || false,
          }, { onConflict: "profile_id" });

        if (error) throw error;
        
        setPreferences(prev => prev ? { ...prev, theme: newTheme } : null);
      }
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        title: "Error",
        description: "Failed to save theme preference",
        variant: "destructive",
      });
    }
  };

  const updatePreferences = async (newPreferences: Partial<UserThemePreferences>) => {
    try {
      if (!user) return;

      const updatedPreferences = { 
        ...preferences,
        ...newPreferences 
      } as UserThemePreferences;

      if (newPreferences.theme && newPreferences.theme !== theme) {
        setThemeState(newPreferences.theme);
        localStorage.setItem(storageKey, newPreferences.theme);
      }

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          profile_id: user.id,
          theme: updatedPreferences.theme,
          font_size: updatedPreferences.fontSize,
          color_blind_mode: updatedPreferences.colorBlindMode,
          reduced_motion: updatedPreferences.reducedMotion,
        }, { onConflict: "profile_id" });

      if (error) throw error;
      
      setPreferences(updatedPreferences);
      
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      preferences,
      setTheme, 
      updatePreferences,
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
};
