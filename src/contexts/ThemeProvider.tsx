
import React from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // Set the body class to light mode
  React.useEffect(() => {
    document.body.classList.remove("dark");
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    
    localStorage.setItem("vite-ui-theme", "light");
  }, []);

  return <>{children}</>;
};

export const useThemeContext = () => {
  return {
    theme: "light" as const,
    setTheme: () => {},
    preferences: null,
    updatePreferences: async () => {},
    isLoading: false
  };
};
