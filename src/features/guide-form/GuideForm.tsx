import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  GUIDE_LEVEL_LABELS,
  GUIDE_LEVELS,
  type GuideInput,
} from '../../entities/guide/guide.types';

const guideSchema = z.object({
  email: z.string().trim().min(1, 'Укажите email.').email('Укажите корректный email.'),
  name: z.string().trim().min(2, 'Имя должно содержать минимум 2 символа.').max(120),
  phone: z.string().trim().max(40).optional(),
  telegramAlias: z.string().trim().max(64).optional(),
  level: z.enum(GUIDE_LEVELS),
});

type GuideFormValues = z.infer<typeof guideSchema>;

interface GuideFormProps {
  initialValues?: GuideInput;
  pending?: boolean;
  serverError?: string | null;
  onSubmit: (values: GuideInput) => Promise<void>;
}

const emptyValues: GuideFormValues = {
  email: '',
  name: '',
  phone: '',
  telegramAlias: '',
  level: 'trainee',
};

export function GuideForm({
  initialValues,
  onSubmit,
  pending = false,
  serverError,
}: GuideFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<GuideFormValues>({
    resolver: zodResolver(guideSchema),
    defaultValues: initialValues ?? emptyValues,
  });

  return (
    <form className="entity-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Имя</label>
          <input id="name" {...register('name')} autoComplete="name" />
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" {...register('email')} autoComplete="email" />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="phone">Телефон</label>
          <input id="phone" {...register('phone')} autoComplete="tel" />
          {errors.phone && <span className="field-error">{errors.phone.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="telegramAlias">Telegram</label>
          <input id="telegramAlias" placeholder="@username" {...register('telegramAlias')} />
          {errors.telegramAlias && <span className="field-error">{errors.telegramAlias.message}</span>}
        </div>

        <div className="field field-wide">
          <label htmlFor="level">Уровень</label>
          <select id="level" {...register('level')}>
            {GUIDE_LEVELS.map((level) => (
              <option key={level} value={level}>{GUIDE_LEVEL_LABELS[level]}</option>
            ))}
          </select>
          {errors.level && <span className="field-error">{errors.level.message}</span>}
        </div>
      </div>

      {serverError && <p className="form-error" role="alert">{serverError}</p>}

      <div className="form-actions">
        <button type="submit" disabled={pending}>
          {pending ? 'Сохраняем...' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
  );
}
