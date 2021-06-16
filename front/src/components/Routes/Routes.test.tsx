import { Routes } from './Routes';
import { screen, cleanup } from '@testing-library/react';
import { renderWithRedux, SampleUser } from 'utils/test';
jest.mock('utils/request');
import { request } from 'utils/request';
import { act } from 'react-dom/test-utils';

afterEach(cleanup);
beforeAll(() => (request as any).mockReturnValue(null));

describe('Routes component', () => {
  it('check 404 error for place owner on trying to access to admin page', async () => {
    renderWithRedux(<Routes />, SampleUser.owner, '/admin/users');
    expect(await screen.findByText(/404/)).toBeInTheDocument();
  });
  it('check 404 error for customer on trying to access to my place page', async () => {
    renderWithRedux(<Routes />, SampleUser.customer, '/place/mylist');
    expect(await screen.findByText(/404/)).toBeInTheDocument();
  });
});
