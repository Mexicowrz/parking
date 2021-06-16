import type { MyPlaceElementProps } from '../MyPlaceElement/MyPlaceElement.types';

/**
 * Тип параметров компонента ToFreeModalProps
 */
export type ToFreeModalProps = MyPlaceElementProps & {
  onClose: () => void;
  visible: boolean;
}