"use client";

import { cn } from "@/lib/utils";

/** Corona de laurel decorativa en SVG. */
export function Laurel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" className={cn("h-8 w-14", className)} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M50 44 C30 44 16 34 12 18" />
        <path d="M50 44 C70 44 84 34 88 18" />
        {[0, 1, 2, 3, 4].map((i) => {
          const t = i / 4;
          const x1 = 12 + 26 * t;
          const y1 = 18 + 20 * t;
          const x2 = 88 - 26 * t;
          const y2 = y1;
          return (
            <g key={i}>
              <path d={`M${x1} ${y1} q -7 -6 -12 -1 q 6 6 12 1`} fill="currentColor" opacity="0.85" />
              <path d={`M${x2} ${y2} q 7 -6 12 -1 q -6 6 -12 1`} fill="currentColor" opacity="0.85" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** Anillo de progreso SVG. */
export function Ring({
  value,
  size = 72,
  stroke = 8,
  label,
  className,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  label?: React.ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(Math.max(value, 0), 100) / 100);
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="stroke-secondary" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="stroke-primary transition-[stroke-dashoffset] duration-700"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">{label ?? `${value}%`}</div>
    </div>
  );
}

/** Chip pequeño con texto en latín. */
export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-xs text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}

/** Separador con línea dorada. */
export function Divider({ className }: { className?: string }) {
  return <div className={cn("divider-laurel py-4", className)}>
    <span className="text-gold text-sm">✦</span>
  </div>;
}
