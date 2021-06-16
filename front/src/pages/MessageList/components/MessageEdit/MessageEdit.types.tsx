import { MessageType, MessageElem } from 'models/Message';
/**
 * Типы сообщения (для радиокнопок)
 */
export const Types = [
  { label: 'Информация', value: MessageType.INFO },
  { label: 'Внимание', value: MessageType.WARNING },
  { label: 'Опасность', value: MessageType.ERROR },
];

/**
 * Тип данных, принимаемых диалогом редактирования сообщения
 */
export type EditMessageProps = {
  data?: MessageElem;
  visible: boolean;
  onClose: (isRefresh: boolean) => void;
};
