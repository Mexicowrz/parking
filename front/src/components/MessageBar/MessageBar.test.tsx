import { screen, cleanup } from '@testing-library/react';
import { MessageBar } from './MessageBar';
import { act } from 'react-dom/test-utils';
import { renderWithRedux, SampleUser } from 'utils/test';
jest.mock('utils/request');
import { request } from 'utils/request';

afterEach(cleanup);

describe('MessageBar component', () => {
  it('check MessageBar filling', async () => {
    const fetchData = [
      { id: 1, message: 'Error', type: 0 },
      { id: 2, message: 'Warning', type: 1 },
      { id: 3, message: 'Info', type: 2 },
    ];
    (request as any).mockReturnValueOnce(fetchData as any);
    await act(async () => {
      renderWithRedux(<MessageBar />, SampleUser.customer);
    });
    expect(await screen.findByText('Error')).toBeInTheDocument();
  });
});
