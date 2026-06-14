// CreateExcursionModal.tsx
// Modal window for creating a new excursion.
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import { X } from 'lucide-react';
import { createExcursion, CreateExcursionData } from '../services/api';
import './CreateExcursionModal.css';

interface CreateExcursionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateExcursionModal: React.FC<CreateExcursionModalProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateExcursionData>();

  const createExcursionMutation = useMutation(createExcursion, {
    onSuccess: () => {
      queryClient.invalidateQueries('excursions');
      reset();
      onOpenChange(false);
    }
  });

  const onSubmit = (data: CreateExcursionData) => {
    createExcursionMutation.mutate({ ...data, people: Number(data.people) });
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Добавить экскурсию</h2>
          <button onClick={() => onOpenChange(false)} className="close-button">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="excursion-form">
          <div className="form-group">
            <label htmlFor="assignedTo">Заказчик</label>
            <input id="assignedTo" {...register('assignedTo', { required: 'Выберите заказчика' })} />
          </div>
          {errors.assignedTo && <span className="error">{errors.assignedTo.message}</span>}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Дата</label>
              <input id="date" type="date" {...register('date', { required: 'Введите дату' })} />
            </div>
            {errors.date && <span className="error">{errors.date.message}</span>}
            <div className="form-group">
              <label htmlFor="time">Время</label>
              <input id="time" type="time" {...register('time', { required: 'Введите время' })} />
            </div>
            {errors.time && <span className="error">{errors.time.message}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="meetingPlace">Место начала</label>
            <input id="meetingPlace" {...register('meetingPlace', { required: 'Введите место начала' })} />
          </div>
          {errors.meetingPlace && <span className="error">{errors.meetingPlace.message}</span>}
          <div className="form-group">
            <label htmlFor="route">Маршрут</label>
            <input id="route" {...register('route',{ required: 'Введите маршрут' })} />
          </div>
          {errors.route && <span className="error">{errors.route.message}</span>}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="people">Количество человек</label>
              <input id="people" type="number" {...register('people',{ required: 'Введите количество людей' })} />
            </div>
            {errors.people && <span className="error">{errors.people.message}</span>}
            <div className="form-group">
              <label htmlFor="type">Тип экскурсии</label>
              <input id="type" {...register('type',{ required: 'Выберите тип экскурсии' })} />
            </div>
            {errors.type && <span className="error">{errors.type.message}</span>}
          </div>
          <div className="form-row">
            <div className="form-group checkbox">
              <label>
                <input type="checkbox" {...register('lunch')} /> Еда включена
              </label>
            </div>
            <div className="form-group checkbox">
              <label>
                <input type="checkbox" {...register('masterClass')} /> Мастер класс включен
              </label>
            </div>
          </div>
          <div className="select_level">
            <h3>Выберите гидов какого уровня уведомить</h3>
            <div className="form-row">
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" {...register('lunch')} /> Стажер
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" {...register('lunch')} /> Джуниор
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" {...register('masterClass')} /> Миддл
                </label>
              </div>
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" {...register('lunch')} /> Сеньор
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => onOpenChange(false)} className="cancel-button">Отмена</button>
            <button type="submit" disabled={createExcursionMutation.isLoading} className="submit-button">
              {createExcursionMutation.isLoading ? 'Добавляем...' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExcursionModal;
