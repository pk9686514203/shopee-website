// Premium luxury Shopee Mania monogram
// Gold + black, minimal "S" + "M" interlock inside a thin gold frame.
export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-flex items-center justify-center w-10 h-10">
        <svg viewBox="0 0 48 48" className="w-10 h-10" aria-hidden>
          <defs>
            <linearGradient id="lux-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F7E7B5" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#8E6E1F" />
            </linearGradient>
          </defs>
          {/* outer frame */}
          <rect x="2" y="2" width="44" height="44" rx="10" fill="#0A0A0A" />
          <rect x="3.5" y="3.5" width="41" height="41" rx="9" fill="none" stroke="url(#lux-gold)" strokeWidth="1.2" />
          {/* Stylized S/M monogram */}
          <path
            d="M16 17.5c0-2.4 2.1-4 5-4h6c3 0 5 1.5 5 3.6 0 2-1.5 3.1-4.4 3.6-3.2.6-5 1.4-5 3.1 0 1.4 1.2 2.2 3.4 2.2h6.4"
            fill="none"
            stroke="url(#lux-gold)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M15 34V25.5l4.5 6 4.5-6V34M28.5 34V25.5l4.5 6 4.5-6V34"
            fill="none"
            stroke="url(#lux-gold)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
          {/* small luxe dot */}
          <circle cx="24" cy="40" r="0.9" fill="url(#lux-gold)" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-xl md:text-[22px] font-bold tracking-[0.18em] uppercase">
            Shopee<span className="gold-text">Mania</span>
          </span>
          <span className="text-[9px] tracking-[0.4em] uppercase text-muted-foreground mt-1">
            Luxury · Fashion · AI
          </span>
        </span>
      )}
    </span>
  );
}
