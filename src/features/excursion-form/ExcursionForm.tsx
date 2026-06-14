import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { companyKeys, listCompanies } from '../../entities/company/company.api';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUSES,
  type ExcursionInput,
} from '../../entities/excursion/excursion.types';
import {
  GUIDE_LEVEL_LABELS,
  GUIDE_LEVELS,
} from '../../entities/guide/guide.types';
import { getErrorMessage } from '../../shared/lib/errors';

const excursionSchema = z.object({
  title: z.string().trim().min(1, 'Укажите название.').max(200),
  companyId: z.string().min(1, 'Выберите компанию.'),
  startDate: z.string().min(1, 'Укажите дату начала.'),
  endDate: z.string().min(1, 'Укажите дату окончания.'),
  route: z.string().trim().min(1, 'Укажите маршрут.').max(1000),
  meetingPlace: z.string().trim().min(1, 'Укажите место встречи.').max(500),
  requiredGuides: z.number().int().min(1, 'Нужен хотя бы один гид.'),
  requiredLevels: z.array(z.enum(GUIDE_LEVELS)).min(1, 'Выберите хотя бы один уровень.'),
  maxParticipants: z.number().int().min(1, 'Укажите число участников больше нуля.'),
  hasLunch: z.boolean(),
  hasMasterclass: z.boolean(),
  excursionType: z.string().trim().min(1, 'Укажите тип экскурсии.').max(120),
  paymentStatus: z.enum(PAYMENT_STATUSES),
}).superRefine((values, context) => {
  const start = new Date(values.startDate);
  const end = new Date(values.endDate);

  if (Number.isNaN(start.getTime())) {
    context.addIssue({ code: 'custom', path: ['startDate'], message: 'Некорректная дата начала.' });
  }
  if (Number.isNaN(end.getTime())) {
    context.addIssue({ code: 'custom', path: ['endDate'], message: 'Некорректная дата окончания.' });
  }
  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
    context.addIssue({ code: 'custom', path: ['endDate'], message: 'Окончание должно быть позже начала.' });
  }
});

export type ExcursionFormValues = z.infer<typeof excursionSchema>;

interface ExcursionFormProps {
  initialValues?: ExcursionFormValues;
  mode: 'create' | 'edit';
  pending?: boolean;
  serverError?: string | null;
  onSubmit: (values: ExcursionInput) => Promise<void>;
}

const emptyValues: ExcursionFormValues = {
  title: '',
  companyId: '',
  startDate: '',
  endDate: '',
  route: '',
  meetingPlace: '',
  requiredGuides: 1,
  requiredLevels: [],
  maxParticipants: 1,
  hasLunch: false,
  hasMasterclass: false,
  excursionType: '',
  paymentStatus: 'unpaid',
};

export function ExcursionForm({
  initialValues,
  mode,
  onSubmit,
  pending = false,
  serverError,
}: ExcursionFormProps) {
  const companiesQuery = useQuery({ queryKey: companyKeys.all, queryFn: listCompanies });
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ExcursionFormValues>({
    resolver: zodResolver(excursionSchema),
    defaultValues: initialValues ?? emptyValues,
  });

  async function submit(values: ExcursionFormValues) {
    await onSubmit({
      ...values,
      title: values.title.trim(),
      startDate: new Date(values.startDate),
      endDate: new Date(values.endDate),
      route: values.route.trim(),
      meetingPlace: values.meetingPlace.trim(),
      excursionType: values.excursionType.trim(),
    });
  }

  return (
    <form className="entity-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="form-grid">
        <div className="field field-wide">
          <label htmlFor="title">Название</label>
          <input id="title" {...register('title')} />
          {errors.title && <span className="field-error">{errors.title.message}</span>}
        </div>

        <div className="field field-wide">
          <label htmlFor="companyId">Компания</label>
          <select id="companyId" {...register('companyId')} disabled={companiesQuery.isPending}>
            <option value="">Выберите компанию</option>
            {(companiesQuery.data ?? []).map((company) => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
          {errors.companyId && <span className="field-error">{errors.companyId.message}</span>}
          {companiesQuery.isError && <span className="field-error">{getErrorMessage(companiesQuery.error)}</span>}
          {companiesQuery.isSuccess && companiesQuery.data.length === 0 && (
            <span className="field-error">Сначала создайте компанию.</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="startDate">Начало</label>
          <input id="startDate" type="datetime-local" {...register('startDate')} />
          {errors.startDate && <span className="field-error">{errors.startDate.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="endDate">Окончание</label>
          <input id="endDate" type="datetime-local" {...register('endDate')} />
          {errors.endDate && <span className="field-error">{errors.endDate.message}</span>}
        </div>

        <div className="field field-wide">
          <label htmlFor="route">Маршрут</label>
          <textarea id="route" rows={4} {...register('route')} />
          {errors.route && <span className="field-error">{errors.route.message}</span>}
        </div>

        <div className="field field-wide">
          <label htmlFor="meetingPlace">Место встречи</label>
          <input id="meetingPlace" {...register('meetingPlace')} />
          {errors.meetingPlace && <span className="field-error">{errors.meetingPlace.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="requiredGuides">Количество гидов</label>
          <input id="requiredGuides" type="number" min="1" step="1" {...register('requiredGuides', { valueAsNumber: true })} />
          {errors.requiredGuides && <span className="field-error">{errors.requiredGuides.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="maxParticipants">Максимум участников</label>
          <input id="maxParticipants" type="number" min="1" step="1" {...register('maxParticipants', { valueAsNumber: true })} />
          {errors.maxParticipants && <span className="field-error">{errors.maxParticipants.message}</span>}
        </div>

        <fieldset className="field field-wide checkbox-fieldset">
          <legend>Допустимые уровни гидов</legend>
          <div className="checkbox-grid">
            {GUIDE_LEVELS.map((level) => (
              <label className="check-option" key={level}>
                <input type="checkbox" value={level} {...register('requiredLevels')} />
                <span>{GUIDE_LEVEL_LABELS[level]}</span>
              </label>
            ))}
          </div>
          {errors.requiredLevels && <span className="field-error">{errors.requiredLevels.message}</span>}
        </fieldset>

        <div className="field">
          <label htmlFor="excursionType">Тип экскурсии</label>
          <input id="excursionType" placeholder="Обзорная, музейная..." {...register('excursionType')} />
          {errors.excursionType && <span className="field-error">{errors.excursionType.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="paymentStatus">Статус оплаты</label>
          <select id="paymentStatus" {...register('paymentStatus')}>
            {PAYMENT_STATUSES.map((status) => (
              <option key={status} value={status}>{PAYMENT_STATUS_LABELS[status]}</option>
            ))}
          </select>
          {errors.paymentStatus && <span className="field-error">{errors.paymentStatus.message}</span>}
        </div>

        <div className="field field-wide boolean-options">
          <label className="check-option">
            <input type="checkbox" {...register('hasLunch')} />
            <span>Предусмотрен обед</span>
          </label>
          <label className="check-option">
            <input type="checkbox" {...register('hasMasterclass')} />
            <span>Предусмотрен мастер-класс</span>
          </label>
        </div>
      </div>

      {serverError && <p className="form-error" role="alert">{serverError}</p>}

      <div className="form-actions">
        <button
          type="submit"
          disabled={pending || companiesQuery.isPending || companiesQuery.data?.length === 0}
        >
          {pending ? 'Сохраняем...' : mode === 'create' ? 'Создать экскурсию' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
  );
}
