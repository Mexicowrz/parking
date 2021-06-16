import { cleanup } from '@testing-library/react';
import { Header } from './Header';
import { Role } from 'models/Auth';
import { renderWithRedux, SampleUser } from 'utils/test';

afterEach(cleanup);

describe('Layout component', () => {
  describe('Layout Header component', () => {
    it('check admin header layout', () => {
      const { getByText, getByTitle } = renderWithRedux(
        <Header />,
        SampleUser.admin,
      );
      expect(getByText('Администрирование')).toBeInTheDocument();
      expect(getByText('Места')).toBeInTheDocument();
      expect(getByText('Свободные места')).toBeInTheDocument();
      expect(getByTitle('Личный кабинет')).toBeInTheDocument();
      expect(getByTitle('Выход')).toBeInTheDocument();
    });
    it('check place owner header layout', () => {
      const { getByText, getByTitle, queryByText } = renderWithRedux(
        <Header />,
        SampleUser.owner,
      );
      expect(queryByText('Администрирование')).not.toBeInTheDocument();
      expect(getByText('Места')).toBeInTheDocument();
      expect(getByText('Свободные места')).toBeInTheDocument();
      expect(getByTitle('Личный кабинет')).toBeInTheDocument();
      expect(getByTitle('Выход')).toBeInTheDocument();
    });
    it('check customer header layout', () => {
      const { getByText, getByTitle, queryByText } = renderWithRedux(
        <Header />,
        SampleUser.customer,
      );
      expect(queryByText('Администрирование')).not.toBeInTheDocument();
      expect(queryByText('Места')).not.toBeInTheDocument();
      expect(getByText('Свободные места')).toBeInTheDocument();
      expect(getByTitle('Личный кабинет')).toBeInTheDocument();
      expect(getByTitle('Выход')).toBeInTheDocument();
    });
  });
});
