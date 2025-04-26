
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

// Define interface for the user_preferences table data
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

  // Apply theme to DOM
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

  // Load user preferences from database
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Using explicit typing to avoid type errors
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('profile_id', user.id)
          .single<UserPreferencesData>();

        if (error && error.code !== "PGRST116") { // PGRST116 means no rows returned
          throw error;
        }

        if (data) {
          // User has preferences
          setPreferences({
            theme: data.theme as Theme,
            fontSize: data.font_size,
            colorBlindMode: data.color_blind_mode,
            reducedMotion: data.reduced_motion,
          });
          setThemeState(data.theme as Theme);
          localStorage.setItem(storageKey, data.theme);
        } else {
          // Create default preferences
          const defaultPreferences = {
            theme,
            fontSize: "medium",
            colorBlindMode: false,
            reducedMotion: false,
          };

          // Using any type here to bypass TypeScript checking since the table exists in the database
          // but not in the generated types
          const { error: insertError } = await supabase
            .from('user_preferences')
            .insert({
              profile_id: user.id,
              theme,
              font_size: defaultPreferences.fontSize,
              color_blind_mode: defaultPreferences.colorBlindMode,
              reduced_motion: defaultPreferences.reducedMotion,
            } as any);

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

  // Update theme and save to database
  const setTheme = async (newTheme: Theme) => {
    try {
      // Update local state and localStorage
      setThemeState(newTheme);
      localStorage.setItem(storageKey, newTheme);
      
      // Update database if user is logged in
      if (user) {
        // Using any type to bypass TypeScript checking for the same reason
        const { error } = await supabase
          .from('user_preferences')
          .upsert({
            profile_id: user.id,
            theme: newTheme,
            font_size: preferences?.fontSize || "medium",
            color_blind_mode: preferences?.colorBlindMode || false,
            reduced_motion: preferences?.reducedMotion || false,
          } as any, { onConflict: "profile_id" });

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

  // Update user preferences
  const updatePreferences = async (newPreferences: Partial<UserThemePreferences>) => {
    try {
      if (!user) return;

      const updatedPreferences = { 
        ...preferences,
        ...newPreferences 
      } as UserThemePreferences;

      // Update theme if it changed
      if (newPreferences.theme && newPreferences.theme !== theme) {
        setThemeState(newPreferences.theme);
        localStorage.setItem(storageKey, newPreferences.theme);
      }

      // Update database
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          profile_id: user.id,
          theme: updatedPreferences.theme,
          font_size: updatedPreferences.fontSize,
          color_blind_mode: updatedPreferences.colorBlindMode,
          reduced_motion: updatedPreferences.reducedMotion,
        } as any, { onConflict: "profile_id" });

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
