/**
 * Результат запроса, возвращающий только id
 */
export type IdResult = {
  id: number;
}

/**
 * Запрос с одним параметром - id (например, при удалении)
 */
export type IdParams = {
  id: number;
}