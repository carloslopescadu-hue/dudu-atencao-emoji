// Fios de luz azul e o circuito dourado, tirados da apresentação do Dudu.
export function Backdrop() {
  return (
    <svg className="backdrop" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="strand" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#2B4BFF" stopOpacity="0" />
          <stop offset="0.45" stopColor="#3D63FF" stopOpacity="0.9" />
          <stop offset="0.7" stopColor="#9AD8FF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#2B4BFF" stopOpacity="0" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g fill="none" stroke="url(#strand)" strokeLinecap="round">
        <g filter="url(#glow)" strokeWidth="10" opacity="0.35">
          <path d="M-80 860 C 320 520, 760 980, 1520 260" />
          <path d="M-40 640 C 420 380, 980 820, 1500 120" />
        </g>
        <g strokeWidth="1.4" opacity="0.7">
          <path d="M-80 860 C 320 520, 760 980, 1520 260" />
          <path d="M-60 880 C 340 560, 780 940, 1520 300" />
          <path d="M-40 640 C 420 380, 980 820, 1500 120" />
          <path d="M-40 680 C 440 420, 1000 800, 1500 160" />
          <path d="M-100 980 C 380 700, 640 1040, 1540 520" />
          <path d="M200 1000 C 520 520, 1120 640, 1500 -40" />
        </g>
      </g>
      <g className="circuit" fill="none" stroke="#E9D8A0" strokeWidth="2" opacity="0.75">
        <path d="M24 70 H120 L150 92 H230" />
        <path d="M24 92 H118 L148 70 H200" />
        <path d="M24 114 H160 L180 100 H260" />
        <circle cx="236" cy="92" r="4" fill="#E9D8A0" />
        <circle cx="206" cy="70" r="4" fill="#E9D8A0" />
        <circle cx="266" cy="100" r="4" fill="#E9D8A0" />
      </g>
    </svg>
  )
}
