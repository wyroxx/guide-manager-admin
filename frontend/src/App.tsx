// App.tsx
// Главный компонент всего приложения.
// Здесь подключаем провайдеры переводов и react-query,
// а также определяем маршруты через React Router.
// import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LanguageProvider } from './contexts/LanguageContext';
import Dashboard from './pages/Dashboard';
import './App.css';
import './components/GlobalStyles.css';

// Клиент react-query для управления запросами к серверу
const queryClient = new QueryClient();

// Основной компонент приложения
function App() {
  return (
    // Провайдер переводов. Позволяет использовать функцию t() во всех компонентах
    <LanguageProvider>
      {/* Провайдер react-query делает клиент доступным вложенным компонентам */}
      <QueryClientProvider client={queryClient}>
        {/* Router управляет навигацией по страницам */}
        <Router>
          <div className="App">
            {/* Определяем маршруты нашего приложения */}
            <Routes>
              {/* Главная страница с дашбордом */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;