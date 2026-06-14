// LanguageContext.tsx
// Предоставляет функцию t() для локализации интерфейса.
import { createContext, useContext, ReactNode } from 'react';

// Тип контекста: функция t для получения перевода строки
interface LanguageContextType {
  t: (key: string) => string;
}

// Создаем сам контекст
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Словарь переводов (пока только русский язык)
const translations = {
  ru: {
    // Navigation
    'dashboard': 'Панель управления',
    'excursions': 'Экскурсии',
    'users': 'Пользователи',
    'clients': 'Клиенты',
    
    // Calendar
    'calendar': 'Календарь',
    'month': 'Месяц',
    'week': 'Неделя',
    'day': 'День',
    'today': 'Сегодня',
    
    // Tours
    'create_excursion': 'Создать экскурсию',
    'tour_name': 'Название тура',
    'description': 'Описание',
    'date': 'Дата',
    'time': 'Время',
    'venue': 'Место проведения',
    'group_size': 'Размер группы',
    'duration': 'Продолжительность (часы)',
    'price': 'Цена',
    'client': 'Заказчик',
    'status': 'Статус',
    'assigned_guide': 'Назначенный гид',
    
    // Tour statuses
    'pending': 'В ожидании',
    'confirmed': 'Подтвержден',
    'guide_needed': 'Нужен гид',
    'completed': 'Завершен',
    'cancelled': 'Отменен',
    
    // Guides
    'manage_users': 'Управление гидами',
    'add_user': 'Добавить гида',
    'user_name': 'Имя гида',
    'email': 'Email',
    'phone': 'Телефон',
    'telegram': 'Telegram',
    'contact_info': 'Контактная информация',
    'total_earnings': 'Общий доход',
    'total_excursions': 'Всего экскурсий',
    'active': 'Активный',
    'inactive': 'Неактивный',
    
    // Clients
    'client_name': 'Имя клиента',
    'blacklisted': 'В черном списке',
    
    // Actions
    'save': 'Сохранить',
    'cancel': 'Отмена',
    'edit': 'Редактировать',
    'delete': 'Удалить',
    'assign': 'Назначить',
    'create': 'Создать',
    'update': 'Обновить',
    
    // Statistics
    'statistics': 'Статистика',
    'total_excursions_count': 'Всего туров',
    'confirmed_excursions': 'Подтвержденные туры',
    'pending_excursions': 'Туры в ожидании',
    
    // Filters
    'filters': 'Фильтры',
    'show_confirmed': 'Показать подтвержденные',
    'show_pending': 'Показать в ожидании',
    'show_user_needed': 'Показать требующие гида',
    
    // View Mode
    'view_mode': 'Режим просмотра',
    'ban_list': 'Бан лист',
  }
};

// Провайдер контекста, используем его в корне приложения
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Функция для получения перевода по ключу
  const t = (key: string): string => {
    return translations.ru[key as keyof typeof translations.ru] || key;
  };

  return (
    <LanguageContext.Provider value={{ t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Хук для доступа к контексту языка
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};