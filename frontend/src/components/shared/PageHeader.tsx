interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode; // optional (for buttons or actions)
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          {title}
        </h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}
