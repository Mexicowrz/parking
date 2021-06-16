import { render } from '@testing-library/react';
import { Preloader } from './Preloader';


describe('Preloader component', () => {
  it('check spin in preloader', () => {
    const { getByTestId } = render(<Preloader />);
    expect(getByTestId('preloader-spin')).toBeInTheDocument();
  });
})