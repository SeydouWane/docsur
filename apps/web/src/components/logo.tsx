import { AegisMark } from "./aegis-mark";

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <AegisMark size={size} />
      <span className="font-display text-lg font-extrabold leading-none tracking-tight">
        <span className="text-ink">aegis</span>
        <span className="text-accent">-num</span>
      </span>
    </span>
  );
}
