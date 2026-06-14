import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import {
  acceptApplication,
  applicationKeys,
  rejectApplication,
} from '../../entities/application/application.api';
import { type Application } from '../../entities/application/application.types';
import { excursionKeys } from '../../entities/excursion/excursion.api';
import { getErrorMessage } from '../../shared/lib/errors';
import { useAuth } from '../auth/AuthProvider';

interface ApplicationDecisionControlsProps {
  application: Application;
}

type Decision = 'accept' | 'reject';

export function ApplicationDecisionControls({ application }: ApplicationDecisionControlsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<Decision | null>(null);
  const [comment, setComment] = useState('');

  async function refreshData() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: applicationKeys.all }),
      queryClient.invalidateQueries({ queryKey: applicationKeys.byExcursion(application.excursionId) }),
      queryClient.invalidateQueries({ queryKey: excursionKeys.all }),
      queryClient.invalidateQueries({ queryKey: excursionKeys.detail(application.excursionId) }),
    ]);
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Сессия администратора недоступна.');
      const input = {
        applicationId: application.id,
        excursionId: application.excursionId,
        comment,
      };

      if (decision === 'accept') await acceptApplication(input, user.uid);
      if (decision === 'reject') await rejectApplication(input, user.uid);
    },
    onSuccess: async () => {
      setDecision(null);
      setComment('');
      await refreshData();
    },
  });

  if (application.status !== 'pending') return null;

  if (!decision) {
    return (
      <div className="decision-actions">
        <button className="accept-button compact-button" type="button" onClick={() => setDecision('accept')}>
          <Check size={16} />
          Принять
        </button>
        <button className="reject-button secondary-button compact-button" type="button" onClick={() => setDecision('reject')}>
          <X size={16} />
          Отклонить
        </button>
      </div>
    );
  }

  return (
    <div className={`decision-panel decision-${decision}`}>
      <strong>{decision === 'accept' ? 'Принять эту заявку?' : 'Отклонить эту заявку?'}</strong>
      <label>
        Комментарий <span>необязательно</span>
        <textarea
          rows={2}
          value={comment}
          maxLength={500}
          placeholder={decision === 'accept' ? 'Например: свяжитесь с координатором' : 'Укажите причину для истории'}
          onChange={(event) => setComment(event.target.value)}
        />
      </label>
      {mutation.isError && <p className="form-error" role="alert">{getErrorMessage(mutation.error)}</p>}
      <div className="decision-confirm-actions">
        <button
          className={decision === 'accept' ? 'accept-button' : 'reject-button'}
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Сохраняем...' : 'Подтвердить'}
        </button>
        <button
          className="secondary-button"
          type="button"
          disabled={mutation.isPending}
          onClick={() => {
            setDecision(null);
            mutation.reset();
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
