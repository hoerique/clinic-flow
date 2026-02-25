import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    accentColor: string;
    setAccentColor: (color: string) => void;
};

const initialState: ThemeProviderState = {
    theme: "system",
    setTheme: () => null,
    accentColor: "hsl(174 72% 45%)",
    setAccentColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
    children,
    defaultTheme = "system",
    storageKey = "clinic-flow-theme",
    accentKey = "clinic-flow-accent",
    ...props
}: {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
    accentKey?: string;
}) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    const [accentColor, setAccentColor] = useState(
        () => localStorage.getItem(accentKey) || "hsl(174 72% 45%)"
    );

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove all theme classes first
        root.classList.remove("light", "dark");

        // "system" is the original Navy theme (no class)
        // "light" is the white theme
        // "dark" is the true black theme
        if (theme !== "system") {
            root.classList.add(theme);
        }
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;

        // Extract H, S, L values from "hsl(H S% L%)"
        const match = accentColor.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/);

        if (match) {
            const [_, h, s, l] = match;
            const hslValue = `${h} ${s}% ${l}%`;

            root.style.setProperty("--primary", hslValue);
            root.style.setProperty("--ring", hslValue);
            root.style.setProperty("--teal", hslValue);
            root.style.setProperty("--sidebar-primary", hslValue);
            root.style.setProperty("--sidebar-ring", hslValue);
            root.style.setProperty("--accent", hslValue);

            // Update shadow/glow based on new primary
            root.style.setProperty("--shadow-teal", `0 0 30px -5px hsl(${hslValue} / 0.35)`);
            root.style.setProperty("--glow-teal", `0 0 20px hsl(${hslValue} / 0.4)`);
        } else {
            // Fallback for solid names or other formats
            root.style.setProperty("--primary", accentColor);
        }

        localStorage.setItem(accentKey, accentColor);
    }, [accentColor, accentKey]);

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(storageKey, theme);
            setTheme(theme);
        },
        accentColor,
        setAccentColor: (color: string) => {
            setAccentColor(color);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
}
