"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

function lireThemeActuel(): Theme {
  if (typeof document === "undefined") return "light";
  const attribut = document.documentElement.getAttribute("data-theme");
  if (attribut === "light" || attribut === "dark") return attribut;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // Lit l'attribut data-theme / la préférence système du navigateur,
    // inaccessibles pendant le rendu serveur — pas de source dérivable au rendu.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(lireThemeActuel());
  }, []);

  const basculer = () => {
    const suivant: Theme = (theme ?? lireThemeActuel()) === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", suivant);
    window.localStorage.setItem("theme", suivant);
    setTheme(suivant);
  };

  return (
    <button
      type="button"
      onClick={basculer}
      aria-label={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
      className="rounded-lg border border-border p-2 text-muted transition-colors hover:text-ink"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
