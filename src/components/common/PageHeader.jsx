const PageHeader = ({ eyebrow, title, description, actions }) => (
  <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && <p className="mb-1 text-sm font-medium text-cyan-300">{eyebrow}</p>}
      <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
  </header>
);

export default PageHeader;
