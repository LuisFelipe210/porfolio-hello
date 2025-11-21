import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [currentTheme, setCurrentTheme] = useState(resolvedTheme || "light");

    useEffect(() => {
        setCurrentTheme(resolvedTheme || "light");
    }, [resolvedTheme]);

    const handleToggle = () => {
        const nextTheme = currentTheme === "light" ? "dark" : "light";
        setTheme(nextTheme);
        setCurrentTheme(nextTheme);
    };

    return (
        <Button
            onClick={handleToggle}
            title="Alternar tema claro/escuro"
            aria-label={resolvedTheme === "light" ? "Tema claro ativado" : "Tema escuro ativado"}
            aria-live="polite"
            className="relative flex items-center justify-center w-8 h-8 rounded-full
                 bg-white/10 dark:bg-black/50
                 text-neutral-900 dark:text-white
                 backdrop-blur-sm
                 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white
                 transition-all duration-300
                 active:scale-95
                 focus:outline-none focus:ring-2 focus:ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-black"
        >
            <Sun
                aria-hidden="true"
                className={`absolute h-5 w-5 transition-all duration-300
                    ${resolvedTheme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"}`}
            />
            <Moon
                aria-hidden="true"
                className={`absolute h-5 w-5 transition-all duration-300
                    ${resolvedTheme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"}`}
            />
        </Button>
    );
}