// main.tsx
// Входная точка фронтенда.
// Создает ReactDOM и монтирует компонент App.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Точка входа в React‑приложение.
// Создаем корневой ReactDOM и монтируем компонент App.
ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode помогает выявлять потенциальные проблемы в приложении
  <React.StrictMode>
    {/* Основной компонент приложения */}
    <App />
  </React.StrictMode>,
);