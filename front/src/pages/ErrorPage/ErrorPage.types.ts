import { ResultStatusType } from 'antd/lib/result';
/**
 * Тип данных, принимаемых компонентом Ошибок
 */
export type ErrorPageProps = {
  code: 403 | 404 | 500;
};

/**
 * список заготовленных параметров для компонента Result в зависимости от ошибки
 */
export const ERRORS = {
  403: {
    status: '403' as ResultStatusType,
    title: '403',
    subTitle: 'У вас не достаточно прав для посещения этой страницы',
  },
  404: {
    status: '404' as ResultStatusType,
    title: '404',
    subTitle: 'Такой страницы не найдено',
  },
  500: {
    status: '500' as ResultStatusType,
    title: '500',
    subTitle: 'Всё пропало! У нас что то сломалось.',
  },
};
