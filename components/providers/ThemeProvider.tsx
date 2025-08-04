"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

// Theme data interface
interface ThemeData {
  customPrimary: string;
  customSecondary: string;
  customTertiary: string;
}

interface ThemeContextType {
  theme: ThemeData | null;
  loading: boolean;
  refreshTheme: () => Promise<void>;
  updateTheme: (colors: Partial<ThemeData>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<ThemeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply custom color variables to CSS
  const applyCustomColors = useCallback((themeData: ThemeData) => {
    if (themeData) {
      document.documentElement.style.setProperty("--custom-primary", themeData.customPrimary);
      document.documentElement.style.setProperty("--custom-secondary", themeData.customSecondary);
      document.documentElement.style.setProperty("--custom-tertiary", themeData.customTertiary);
    }
  }, []);

  // Fetch theme from API
  const fetchTheme = useCallback(async () => {
    try {
      const response = await fetch("/api/theme");
      const result = await response.json();
      
      if (result.success && result.data) {
        setTheme(result.data);
        applyCustomColors(result.data);
      }
    } catch (error) {
      console.error("Error fetching theme:", error);
    } finally {
      setLoading(false);
    }
  }, [applyCustomColors]);

  // Update theme colors
  const updateTheme = useCallback(async (colors: Partial<ThemeData>) => {
    try {
      const response = await fetch("/api/theme", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(colors),
      });
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setTheme(result.data);
        applyCustomColors(result.data);
        // Trigger theme update event for other components
        window.dispatchEvent(new CustomEvent("theme-updated"));
      }
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  }, [applyCustomColors]);

  // Refresh theme (re-fetch from API)
  const refreshTheme = useCallback(async () => {
    setLoading(true);
    await fetchTheme();
  }, [fetchTheme]);

  // Initialize theme on mount
  useEffect(() => {
    fetchTheme();

    // Listen for theme updates from other parts of the app
    const handleThemeUpdate = () => {
      fetchTheme();
    };

    window.addEventListener("theme-updated", handleThemeUpdate);
    
    return () => {
      window.removeEventListener("theme-updated", handleThemeUpdate);
    };
  }, [fetchTheme]);

  const value: ThemeContextType = {
    theme,
    loading,
    refreshTheme,
    updateTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Utility function to trigger theme update event
export const triggerThemeUpdate = () => {
  window.dispatchEvent(new CustomEvent("theme-updated"));
};

export default ThemeProvider;