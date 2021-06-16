import { FreePlace } from 'models/Place';

/**
 * Тип параметров компонента FreePlaceElement
 */
export type FreePlaceElementProps = {
  place: FreePlace;
  setIsLoading?: (isLoading: boolean) => void;
};
