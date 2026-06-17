export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background */}
      <rect x="56" y="56" width="400" height="400" rx="48" fill="#FFD60A" stroke="#000000" strokeWidth="16" />
      
      {/* Party Hat */}
      <path d="M256 120L360 320H152L256 120Z" fill="#FF5D8F" stroke="#000000" strokeWidth="16" strokeLinejoin="round" />
      
      {/* Pom Pom */}
      <circle cx="256" cy="96" r="24" fill="#00E5FF" stroke="#000000" strokeWidth="12" />
      
      {/* Navigation Arrow */}
      <path d="M256 180L290 270L256 250L222 270L256 180Z" fill="#FFFFFF" stroke="#000000" strokeWidth="10" strokeLinejoin="round" />
      
      {/* Party Confetti */}
      <rect x="120" y="140" width="20" height="40" rx="4" transform="rotate(-20 120 140)" fill="#00E5FF" stroke="#000000" strokeWidth="6" />
      <rect x="372" y="160" width="20" height="40" rx="4" transform="rotate(25 372 160)" fill="#FF6B00" stroke="#000000" strokeWidth="6" />
      <circle cx="130" cy="240" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
      <circle cx="385" cy="260" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="4" />
    </svg>
  );
}
