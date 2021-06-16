import { useSelector as nativeUseSelector } from 'react-redux';
import { RootState } from '../store/configureStore';
/**
 * Обертка хука для стора приложения
 * @param  {(state:RootState)=>T} selector
 */
export const useSelector = <T = unknown>(selector: (state: RootState) => T) =>
    nativeUseSelector<RootState, T>(selector);
