import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { actions } from 'store/app/actions';
import { request, RequestMethod } from '../utils/request';

/**
 * Определяет функцию-запрос на сервер
 */
export type RequestFn<P> = (body?: P) => Promise<void>;

/**
 * Результат хука useRequest
 */
type UseRequestResult<P, R> = [
  /** данный запроса */
  {
    data?: R;
    isLoading?: boolean;
    error?: string;
  },
  /** функция инициализации запроса */
  RequestFn<P>,
  /** функция сброса данных запроса (возврат к дефолтным значениям) */
  () => void,
];

/**
 * Хук выполнения запроса на сервере
 *
 * @param  {boolean=true} isSecure флаг безопасности запроса (для авторизованных пользователей)
 * @returns UseRequestResult
 */
export const useRequest = <P, R>(
  url: string,
  method: RequestMethod = 'GET',
  isSecure: boolean = true,
): UseRequestResult<P, R> => {
  const [data, setData] = useState<R | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const dispatch = useDispatch();

  // определяем функцию запроса на сервер
  const requestData = useCallback(
    async (body?: P) => {
      setIsLoading(true);
      try {
        const init = {
          method,
          body: JSON.stringify(body),
        };
        setData(await request<R>(url, isSecure, init));
      } catch (error) {
        // в случае неавторизованного запроса (например, стух токен), выбрасывать в логин
        if (error.status === 401) {
          dispatch(actions.logout);
        }
        if (error.messages) setError(error.messages.join(', '));
        else setError(error.toString());
      } finally {
        setIsLoading(false);
      }
    },
    [url, method, isSecure, dispatch],
  );
  // функция сброса состояния хука
  const reset = useCallback(() => {
    setData(undefined);
    setIsLoading(false);
    setError(undefined);
  }, []);

  return [{ data, isLoading, error }, requestData, reset];
};
