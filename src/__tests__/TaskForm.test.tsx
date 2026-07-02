import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
  it('renders create mode by default', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Nouvelle tâche')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument();
  });

  it('renders edit mode', () => {
    render(<TaskForm onSubmit={vi.fn()} mode="edit" initialValues={{ title: 'Edit me' }} />);
    expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Edit me')).toBeInTheDocument();
  });

  it('shows validation error when title is empty', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(screen.getByText('Le titre est requis')).toBeInTheDocument();
  });

  it('calls onSubmit with trimmed data', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: '  New Task  ' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: '  Desc  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'New Task', description: 'Desc' });
  });

  it('calls onSubmit with undefined description when empty', () => {
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Task' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Task', description: undefined });
  });

  it('clears form after create submit', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'Task' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'Desc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(screen.getByLabelText('Titre')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
  });

  it('does not clear form after edit submit', () => {
    render(<TaskForm onSubmit={vi.fn()} mode="edit" initialValues={{ title: 'Edit' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
    expect(screen.getByDisplayValue('Edit')).toBeInTheDocument();
  });

  it('clears validation error on input change', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(screen.getByText('Le titre est requis')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Titre'), { target: { value: 'A' } });
    expect(screen.queryByText('Le titre est requis')).not.toBeInTheDocument();
  });

  it('shows cancel button when onCancel provided', () => {
    render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
  });

  it('calls onCancel when cancel clicked', () => {
    const onCancel = vi.fn();
    render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
