import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="centered-page">
      <section className="message-card">
        <p className="eyebrow">404</p>
        <h1>Страница не найдена</h1>
        <Link className="button-link" to="/">Вернуться на главную</Link>
      </section>
    </main>
  );
}
