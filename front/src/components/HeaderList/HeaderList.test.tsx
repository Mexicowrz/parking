import { render, cleanup, fireEvent, within } from '@testing-library/react';
import { HeaderList } from './HeaderList';

afterEach(cleanup);

describe('Headerlist component', () => {
  it('with default props', () => {
    const { asFragment } = render(<HeaderList />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('with disabled state', () => {
    const { asFragment } = render(<HeaderList isDisabled={true} />);
    expect(asFragment()).toMatchSnapshot();
  });
  it('check add button click', () => {
    const onAdd = jest.fn();
    const { getByTestId } = render(<HeaderList onAdd={onAdd} />);
    fireEvent.click(getByTestId('add-button'));
    expect(onAdd).toBeCalled();
  });
  it('check edit button click', () => {
    const onEdit = jest.fn();
    const { getByTestId } = render(<HeaderList onEdit={onEdit} />);
    fireEvent.click(getByTestId('edit-button'));
    expect(onEdit).toBeCalled();
  });
  it('check delete button click', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(<HeaderList onDelete={onDelete} />);
    const { getByText: getByBodyText } = within(document.body);
    fireEvent.click(getByTestId('delete-button'));
    const yesButton = getByBodyText('Да');
    expect(yesButton).toBeInTheDocument();
    fireEvent.click(yesButton);
    expect(onDelete).toBeCalled();
  });
  it('check search by text', () => {
    const onSearch = jest.fn();
    const { getByTestId } = render(<HeaderList onSearch={onSearch} />);
    const input = getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter', keyCode: 13 });
    expect(onSearch).toBeCalled();
    expect(onSearch.mock.calls[0][0]).toBe('test');
  });
});
