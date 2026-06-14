interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function PageLoading() {
  return (
    <div className="content-state" aria-live="polite" aria-busy="true">
      <div className="spinner" />
      <span>Загружаем данные...</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="content-state error-state" role="alert">
      <strong>Не удалось загрузить данные</strong>
      <span>{message}</span>
      {onRetry && <button type="button" onClick={onRetry}>Повторить</button>}
    </div>
  );
}
