import { CalendarDays, ExternalLink, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  APPLICATION_STATUS_LABELS,
  type Application,
} from '../../entities/application/application.types';
import { formatTimestamp } from '../../shared/lib/format';
import { ApplicationDecisionControls } from './ApplicationDecisionControls';

interface ApplicationCardProps {
  application: Application;
  excursionTitle?: string;
  guideName?: string;
  showExcursion?: boolean;
}

export function ApplicationCard({
  application,
  excursionTitle,
  guideName,
  showExcursion = true,
}: ApplicationCardProps) {
  return (
    <article className={`moderation-card moderation-${application.status}`}>
      <div className="moderation-main">
        <div className="moderation-title-row">
          <div className="moderation-guide">
            <span className="moderation-avatar"><UserRound size={18} /></span>
            <div>
              <strong>{guideName || application.guideName || application.guideEmail || 'Гид без имени'}</strong>
              <span>{application.guideEmail}</span>
            </div>
          </div>
        </div>

        {showExcursion && (
          <Link className="moderation-excursion" to={`/excursions/${application.excursionId}`}>
            <CalendarDays size={15} />
            {excursionTitle || application.excursionTitle || 'Экскурсия'}
            <ExternalLink size={13} />
          </Link>
        )}

        <div className="moderation-meta">
          <span>Подана: {formatTimestamp(application.createdAt)}</span>
          {application.decidedAt && <span>Решение: {formatTimestamp(application.decidedAt)}</span>}
        </div>

        {application.decisionComment && (
          <p className="decision-comment">{application.decisionComment}</p>
        )}
      </div>

      <div className="moderation-side">
        <span className={`application-badge application-${application.status}`}>
          {APPLICATION_STATUS_LABELS[application.status]}
        </span>
        <ApplicationDecisionControls application={application} />
      </div>
    </article>
  );
}
