export const getApiUrl = (url: string) =>
  `${window.location.protocol}//${window.location.hostname}${process.env
    .REACT_APP_API_URL!}${process.env.REACT_APP_API_VERSION!}/${url}`;

/**
 * доступные методы запросов на сервер
 */
export type RequestMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';
/**
 * Организация запросов на серве
 * @param  {string} url
 * @param  {boolean} isSecure безопасный запрос (для авторизованного пользователя)
 * @param  {RequestInit} init
 * @returns Promise<T>
 */
export const request = async <T>(
  url: string,
  isSecure?: boolean,
  init?: RequestInit,
): Promise<T> => {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  if (isSecure) {
    const token = localStorage.getItem('token');
    // если запрос безопасный, а пользователь ниразу не авторизовывался, то сразу его выкидывать без запроса
    if (!token) {
      throw {
        messages: 'unauthorized',
        status: 401,
        key: new Date().getTime(),
      };
    }
    headers.set('token', token!);
  }
  init = {
    ...init,
    headers,
  };
  init.headers = headers;
  const response = await fetch(getApiUrl(url), init);
  // обработать ошибки
  if (response.status < 200 || response.status >= 400) {
    const dt = await response.json();
    if (dt.messages) {
      throw { ...dt, status: response.status };
    }
    throw {
      messages: ['unkown error'],
      key: new Date().getTime(),
      status: response.status,
    };
  }
  if (isSecure) {
    // сохранить обновленный токен
    const newToken = response.headers.get('token');
    if (newToken) localStorage.setItem('token', newToken);
  }
  const data = (await response.json()) as T;
  return data;
};
