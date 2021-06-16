import { MyPlace } from 'models/Place';

/**
 * Тип параметров компонента MyPlaceElement
 */
export type MyPlaceElementProps = {
  place: MyPlace;
  setIsLoading?: (isLoading: boolean) => void;
};
