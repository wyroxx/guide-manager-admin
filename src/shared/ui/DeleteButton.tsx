import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteButtonProps {
  label: string;
  pending?: boolean;
  onConfirm: () => Promise<void> | void;
}

export function DeleteButton({ label, onConfirm, pending = false }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  function handleConfirm() {
    void Promise.resolve(onConfirm()).catch(() => undefined);
  }

  if (!confirming) {
    return (
      <button className="danger-button secondary-button" type="button" onClick={() => setConfirming(true)}>
        <Trash2 size={17} />
        Удалить
      </button>
    );
  }

  return (
    <div className="delete-confirm">
      <span>{label}</span>
      <button className="danger-button" type="button" disabled={pending} onClick={handleConfirm}>
        {pending ? 'Удаляем...' : 'Да, удалить'}
      </button>
      <button className="secondary-button" type="button" disabled={pending} onClick={() => setConfirming(false)}>
        Отмена
      </button>
    </div>
  );
}
