import type { FreePlaceElementProps } from '../FreePlaceElement/FreePlaceElement.types';

/**
 * Тип параметров компонента TakePlaceModal
 */
export type TakePlaceModalProps = FreePlaceElementProps & {
  onClose: () => void;
  visible?: boolean;
};
