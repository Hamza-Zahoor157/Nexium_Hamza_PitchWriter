"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full w-10 h-10 fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50"
        disabled
      />
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50
                 rounded-full w-12 h-12 md:w-10 md:h-10 transition-all duration-300
                 border-2 border-gray-200 hover:border-gray-300 
                 dark:border-gray-700 dark:hover:border-gray-600
                 bg-background/80 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-gray-800/90
                 shadow-lg hover:shadow-xl dark:shadow-gray-900/40
                 flex items-center justify-center`}
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
