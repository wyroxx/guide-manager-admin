// ManageUsersModal.tsx
// Modal window for viewing and adding users.
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from 'react-query';
import { X, User as UserIcon, MessageCircle } from 'lucide-react';
import { createUser, CreateUserData, fetchUsers, User } from '../services/api';
import './ManageUsersModal.css';

interface ManageUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManageUsersModal: React.FC<ManageUsersModalProps> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserData>();

  const { data: users = [], isLoading } = useQuery('users', fetchUsers);

  const createUserMutation = useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      reset();
    }
  });

  const onSubmit = (data: CreateUserData) => {
    createUserMutation.mutate({ ...data, excursionsDone: Number(data.excursionsDone || 0) });
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h2>Управление гидами</h2>
          <button onClick={() => onOpenChange(false)} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="users-section">
            <h3>Текущие гиды</h3>
            {isLoading ? (
              <div className="loading">Загружаем гидов...</div>
            ) : (
              <div className="users-list">
                {users.length === 0 ? (
                  <p className="no-users">Ни одного гида в системе не зарешистрировано. Добавьте первого, заполнив форму</p>
                ) : (
                  users.map((user: User) => (
                    <div key={user.id} className="user-item">
                      <div className="user-info">
                        <h4>{user.name}</h4>
                        <div className="user-details">
                          {user.telegram && <span><MessageCircle size={14} /> @{user.telegram}</span>}
                          <span className="excursions-done">{user.excursionsDone} excursions</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="add-user-section">
            <h3>Добавить нового гида</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">ФИО</label>
                  <div className="input-with-icon">
                    <UserIcon size={16} />
                    <input id="name" {...register('name', { required: 'Введите ФИО' })} />
                  </div>
                  {errors.name && <span className="error">{errors.name.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="telegram">Телеграм</label>
                  <div className="input-with-icon">
                    <MessageCircle size={16} />
                    <input id="telegram" {...register('telegram', { required: 'Введите телеграмм контакт гида' })} placeholder="telegram_username" />
                  </div>
                  {errors.telegram && <span className="error">{errors.telegram.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="excursionsDone">Экскурсий проведено</label>
                <input
                  id="excursionsDone"
                  type="number"
                  defaultValue={0}
                  {...register('excursionsDone')}
                />
              </div>

              <div className="form-actions">
                <button type="submit" disabled={createUserMutation.isLoading} className="submit-button">
                  {createUserMutation.isLoading ? 'Добавляем...' : 'Добавить гида'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersModal;
