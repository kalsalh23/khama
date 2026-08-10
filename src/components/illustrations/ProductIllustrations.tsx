import { cn } from "@/lib/utils"

interface IlloProps {
  className?: string
  color?: string
  thread?: string
}

export function ScarfIllustration({ className, color = "#1a2639", thread = "#d4af37" }: IlloProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn("h-auto w-full", className)} fill="none">
      <defs>
        <linearGradient id="scarfGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5878" />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor="#0d1522" />
        </linearGradient>
        <linearGradient id="threadGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d78c" />
          <stop offset="0.5" stopColor={thread} />
          <stop offset="1" stopColor="#a07c1a" />
        </linearGradient>
      </defs>
      {/* shadow */}
      <rect x="42" y="28" width="116" height="148" rx="16" fill="rgba(0,0,0,0.15)" />
      {/* body */}
      <rect x="34" y="20" width="116" height="148" rx="16" fill="url(#scarfGrad)" />
      {/* border */}
      <rect x="41" y="27" width="102" height="134" rx="12" stroke="url(#threadGrad)" strokeWidth="2.5" />
      {/* top band */}
      <rect x="43" y="33" width="98" height="14" rx="5" fill={thread} opacity="0.5" />
      {/* medallion */}
      <rect x="74" y="66" width="36" height="46" rx="4" stroke="url(#threadGrad)" strokeWidth="2" />
      {/* name */}
      <rect x="78" y="78" width="28" height="5" rx="2.5" fill="url(#threadGrad)" />
      <rect x="81" y="88" width="22" height="4" rx="2" fill="url(#threadGrad)" />
      {/* year */}
      <rect x="84" y="56" width="16" height="5" rx="2.5" fill="url(#threadGrad)" />
      {/* bottom band */}
      <rect x="43" y="122" width="98" height="14" rx="5" fill={thread} opacity="0.5" />
      {/* fringe */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={i}
          x1={48 + i * 8}
          y1={168}
          x2={48 + i * 8}
          y2={176 + (i % 3)}
          stroke="url(#threadGrad)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}

export function RobeIllustration({ className, color = "#1a2639", thread = "#d4af37" }: IlloProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn("h-auto w-full", className)} fill="none">
      <defs>
        <linearGradient id="robeGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5878" />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor="#0d1522" />
        </linearGradient>
        <linearGradient id="robeThread" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d78c" />
          <stop offset="0.5" stopColor={thread} />
          <stop offset="1" stopColor="#a07c1a" />
        </linearGradient>
      </defs>
      <rect x="52" y="34" width="96" height="140" rx="14" fill="url(#robeGrad)" />
      <path d="M70 34 L100 70 L130 34 Z" fill="url(#robeGrad)" stroke="url(#robeThread)" strokeWidth="2" />
      <rect x="60" y="40" width="80" height="128" rx="10" stroke="url(#robeThread)" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M100 40 L100 174" stroke="url(#robeThread)" strokeWidth="2" opacity="0.8" />
      {/* collar */}
      <path d="M70 34 Q100 86 130 34" fill="none" stroke="url(#robeThread)" strokeWidth="3" />
      <rect x="80" y="70" width="40" height="8" rx="4" fill="url(#robeThread)" />
    </svg>
  )
}

export function CapIllustration({ className, color = "#1a2639", thread = "#d4af37" }: IlloProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn("h-auto w-full", className)} fill="none">
      <defs>
        <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5878" />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor="#0d1522" />
        </linearGradient>
        <linearGradient id="capThread" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d78c" />
          <stop offset="0.5" stopColor={thread} />
          <stop offset="1" stopColor="#a07c1a" />
        </linearGradient>
      </defs>
      {/* board */}
      <path d="M45 62 L100 45 L155 62 L100 80 Z" fill="url(#capGrad)" stroke="url(#capThread)" strokeWidth="2" />
      <path d="M45 62 L155 62" stroke="url(#capThread)" strokeWidth="2.5" />
      {/* skull */}
      <path d="M78 78 Q78 122 100 130 Q122 122 122 78 Z" fill="url(#capGrad)" stroke="url(#capThread)" strokeWidth="2" />
      {/* button */}
      <circle cx="100" cy="45" r="5" fill="url(#capThread)" />
      {/* tassel */}
      <path d="M100 45 Q100 60 100 64" stroke="url(#capThread)" strokeWidth="2.5" />
      <path d="M92 64 L108 64 L100 76 Z" fill="url(#capThread)" />
      <line x1="100" y1="76" x2="100" y2="88" stroke="url(#capThread)" strokeWidth="2" />
      {/* name */}
      <rect x="88" y="96" width="24" height="5" rx="2.5" fill="url(#capThread)" />
    </svg>
  )
}

export function SetIllustration({ className, color = "#1a2639", thread = "#d4af37" }: IlloProps) {
  return (
    <svg viewBox="0 0 200 200" className={cn("h-auto w-full", className)} fill="none">
      <defs>
        <linearGradient id="setGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5878" />
          <stop offset="0.5" stopColor={color} />
          <stop offset="1" stopColor="#0d1522" />
        </linearGradient>
        <linearGradient id="setThread" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d78c" />
          <stop offset="0.5" stopColor={thread} />
          <stop offset="1" stopColor="#a07c1a" />
        </linearGradient>
      </defs>
      {/* cap on top */}
      <path d="M52 40 L100 27 L148 40 L100 54 Z" fill="url(#setGrad)" stroke="url(#setThread)" strokeWidth="1.5" />
      <path d="M78 54 Q78 84 100 90 Q122 84 122 54 Z" fill="url(#setGrad)" stroke="url(#setThread)" strokeWidth="1.5" />
      <circle cx="100" cy="27" r="3.5" fill="url(#setThread)" />
      <path d="M100 27 Q100 40 100 43" stroke="url(#setThread)" strokeWidth="2" />
      {/* robe */}
      <path d="M62 96 L84 96 L84 70 Q100 52 116 70 L116 96 L138 96 L138 176 L62 176 Z" fill="url(#setGrad)" stroke="url(#setThread)" strokeWidth="1.5" />
      <path d="M84 96 Q84 140 84 176" stroke="url(#setThread)" strokeWidth="1.5" opacity="0.6" />
      <path d="M116 96 Q116 140 116 176" stroke="url(#setThread)" strokeWidth="1.5" opacity="0.6" />
      {/* scarf at neck */}
      <path d="M80 92 Q100 110 120 92" stroke="url(#setThread)" strokeWidth="4" fill="none" />
      <rect x="80" y="118" width="40" height="6" rx="3" fill="url(#setThread)" />
    </svg>
  )
}

export function NoImage({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={cn("h-auto w-full", className)} fill="none">
      <rect width="200" height="200" fill="currentColor" opacity="0.1" rx="16" />
      <path d="M70 130 Q100 90 130 130" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.6" />
      <circle cx="72" cy="84" r="8" fill="currentColor" opacity="0.6" />
      <circle cx="128" cy="84" r="8" fill="currentColor" opacity="0.6" />
    </svg>
  )
}
