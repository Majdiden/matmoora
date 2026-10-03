type IconName = 'who' | 'what' | 'how' | 'contact';

export function SectionIcon({ name, size = 28 }: { name: IconName; size?: number }) {
  const c = {
    width: size,
    height: size,
    viewBox: '0 0 32 32',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (name) {
    case 'who':
      return (
        <svg {...c}>
          <path d="M4 24 C 10 20, 22 20, 28 24" strokeDasharray="2 2" />
          <path d="M4 27 C 10 23, 22 23, 28 27" strokeDasharray="2 2" opacity="0.55" />
          <circle cx="16" cy="11" r="3.5" />
          <path d="M9 22 C 10 17, 22 17, 23 22" />
        </svg>
      );
    case 'what':
      return (
        <svg {...c}>
          <path d="M8 4 h12 l4 4 v20 h-16 z" />
          <path d="M20 4 v4 h4" />
          <path d="M11 14 h10 M11 18 h10 M11 22 h6" />
        </svg>
      );
    case 'how':
      return (
        <svg {...c}>
          <path d="M6 22 C 8 12, 24 12, 26 22" />
          <path d="M6 22 C 8 30, 24 30, 26 22" opacity="0.55" strokeDasharray="2 2" />
          <circle cx="16" cy="17" r="1.6" fill="currentColor" />
        </svg>
      );
    case 'contact':
      return (
        <svg {...c}>
          <rect x="4" y="8" width="24" height="16" rx="1.5" />
          <path d="M4 10 L 16 20 L 28 10" />
        </svg>
      );
  }
}
