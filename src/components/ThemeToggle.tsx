import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [currentTheme, setCurrentTheme] = useState(resolvedTheme || "light");

    // Sincroniza com resolvedTheme (incluindo preferência do sistema)
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
            aria-label={currentTheme === "light" ? "Tema claro ativado" : "Tema escuro ativado"}
            aria-live="polite"
            className="relative flex items-center justify-center w-8 h-8
                 hover:bg-orange-500 dark:hover:bg-orange-500 transition-colors
                 active:scale-95 transition-transform
                 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
            <Sun
                aria-hidden="true"
                className={`absolute h-5 w-5 transition-all duration-200
                    ${currentTheme === "light" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"}`}
            />
            <Moon
                aria-hidden="true"
                className={`absolute h-5 w-5 transition-all duration-200
                    ${currentTheme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-0"}`}
            />
        </Button>
    );
}