import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { type CompanyInput } from '../../entities/company/company.types';

const companySchema = z.object({
  name: z.string().trim().min(2, 'Название должно содержать минимум 2 символа.').max(160),
  contactName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  telegramAlias: z.string().trim().max(64).optional(),
  notes: z.string().trim().max(2000, 'Заметка слишком длинная.').optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyFormProps {
  initialValues?: CompanyInput;
  mode: 'create' | 'edit';
  pending?: boolean;
  serverError?: string | null;
  onSubmit: (values: CompanyInput) => Promise<void>;
}

const emptyValues: CompanyFormValues = {
  name: '',
  contactName: '',
  phone: '',
  telegramAlias: '',
  notes: '',
};

export function CompanyForm({
  initialValues,
  mode,
  onSubmit,
  pending = false,
  serverError,
}: CompanyFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: initialValues ?? emptyValues,
  });

  return (
    <form className="entity-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid">
        <div className="field field-wide">
          <label htmlFor="name">Название компании</label>
          <input id="name" {...register('name')} />
          {errors.name && <span className="field-error">{errors.name.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="contactName">Контактное лицо</label>
          <input id="contactName" {...register('contactName')} autoComplete="name" />
          {errors.contactName && <span className="field-error">{errors.contactName.message}</span>}
        </div>

        <div className="field">
          <label htmlFor="phone">Телефон</label>
          <input id="phone" {...register('phone')} autoComplete="tel" />
          {errors.phone && <span className="field-error">{errors.phone.message}</span>}
        </div>

        <div className="field field-wide">
          <label htmlFor="telegramAlias">Telegram</label>
          <input id="telegramAlias" placeholder="@company" {...register('telegramAlias')} />
          {errors.telegramAlias && <span className="field-error">{errors.telegramAlias.message}</span>}
        </div>

        <div className="field field-wide">
          <label htmlFor="notes">Заметки</label>
          <textarea id="notes" rows={6} {...register('notes')} />
          {errors.notes && <span className="field-error">{errors.notes.message}</span>}
        </div>
      </div>

      {serverError && <p className="form-error" role="alert">{serverError}</p>}

      <div className="form-actions">
        <button type="submit" disabled={pending}>
          {pending ? 'Сохраняем...' : mode === 'create' ? 'Создать компанию' : 'Сохранить изменения'}
        </button>
      </div>
    </form>
  );
}
