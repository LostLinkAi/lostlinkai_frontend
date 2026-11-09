export function BrandIdentity({ className = '' }: { className?: string }) {
  return (
    <a className={`brand-identity ${className}`} href="/" aria-label="LostLink AI — Find What Matters">
      <img src="/lostlink-ai-logo.webp" alt="" />
      <span className="brand-copy">
        <strong>LostLink AI</strong>
        <small>Find What Matters</small>
      </span>
    </a>
  )
}
