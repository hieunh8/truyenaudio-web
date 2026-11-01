export default function PageHeader({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="rise mb-8 sm:mb-10">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {children && <div className="mt-3 max-w-2xl text-muted">{children}</div>}
      <div className="ornament mt-6 max-w-xs" />
    </header>
  );
}
