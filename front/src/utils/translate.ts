const INTERNAL_ERROR = 'internal_error';
const UNAUTHORIZED = 'unauthorized';
const LOGIN_AND_PASSWORD_REQUIRED = 'login_and_password_required';
const FORBIDDEN = 'forbidden';
const FREE_PLACE = 'free_place';
const ALREADY_TAKEN = 'already_taken';
const CANT_RELEASE = 'cant_release';
const DUPLICATE_USER_LOGIN = `duplicate key value violates unique constraint "User_username_key"`;
const DUPLICATE_FLAT =
  'duplicate key value violates unique constraint "User_flat_key"';

const translateText: { [key: string]: string } = {
  [INTERNAL_ERROR]: 'Ошибка сервера',
  [UNAUTHORIZED]: 'Пожалуйста, авторизуйтесь',
  [LOGIN_AND_PASSWORD_REQUIRED]: 'Необходимо указать логин и пароль',
  [FORBIDDEN]: 'Доступ запрещен',
  [FREE_PLACE]: 'Сначала освободите занимаемое место',
  [ALREADY_TAKEN]: 'Место уже занято',
  [CANT_RELEASE]: 'Невозможно освободить место',
  [DUPLICATE_USER_LOGIN]: 'Пользователь с таким логином уже существует',
  [DUPLICATE_FLAT]: 'Пользователь с такой квартирой уже существует',
};

// export const translate11 = (key: string): string => {
//   return translateText[key] || key;
// };

/**
 * Перевод ошибок из ключей в человеческий формат
 * @param  {string} key
 * @returns string
 */
export const translateError = (key: string): string => {
  return translateText[key] || `Неизвестная ошибка ${key}`;
};
