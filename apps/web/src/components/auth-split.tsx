import Image from "next/image";
import type { ReactNode } from "react";
import { Logo } from "./logo";

const CITATIONS = [
  "Le fichier ne quitte jamais le périmètre de l'entreprise sans que ce soit tracé.",
  "La même simplicité qu'un outil grand public — avec la maîtrise en plus.",
];

export function AuthSplit({ children, citation = 0 }: { children: ReactNode; citation?: 0 | 1 }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-6xl lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-4 overflow-hidden rounded-2xl border border-border shadow-sm">
          <Image
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80"
            alt="Deux collègues échangent autour d'un document dans un bureau lumineux"
            fill
            sizes="45vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--brand-start)_75%,transparent),transparent_45%)]" />
          <div className="absolute inset-x-0 bottom-0 p-8">
            <Logo size={26} />
            <p className="mt-4 max-w-xs text-balance font-display text-lg font-semibold text-white">
              {CITATIONS[citation]}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
