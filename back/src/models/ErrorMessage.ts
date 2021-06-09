/**
 * Сообщение об ошибке
 *
 * @export
 * @class
 */
export default class ErrorMessage {
  /** идентификатор ошибки */
  key!: string;
  /** текст ошибки (или код) */
  messages!: string[];
  /** сопутствующие данные */
  data?: any;

  constructor(key: string, messages: string[], data?: any) {
    this.key = key;
    this.messages = messages;
    this.data = data;
  }

  toString() {
    return `${this.key} - ${this.messages.join('; ')}`;
  }
}
