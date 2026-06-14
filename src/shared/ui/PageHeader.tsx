import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  backTo?: string;
  actions?: ReactNode;
}

export function PageHeader({
  actions,
  backTo,
  description,
  eyebrow,
  title,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {backTo && (
          <Link className="back-link" to={backTo}>
            <ArrowLeft size={16} />
            Назад
          </Link>
        )}
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
