import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
  id: 1,
  title: 'Ma tâche',
  description: 'Description',
  completed: false,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-15T10:00:00Z',
};

const completedTask: Task = { ...mockTask, completed: true, description: null };

describe('TaskItem', () => {
  it('renders task title and description', () => {
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText('Ma tâche')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders without description', () => {
    render(<TaskItem task={completedTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByText('Ma tâche')).toBeInTheDocument();
    expect(screen.queryByText('Description')).not.toBeInTheDocument();
  });

  it('calls onToggle when checkbox clicked', () => {
    const onToggle = vi.fn();
    render(<TaskItem task={mockTask} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it('enters edit mode on edit button click', () => {
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Modifier'));
    expect(screen.getByDisplayValue('Ma tâche')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Description')).toBeInTheDocument();
  });

  it('saves edit and calls onEdit', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText('Modifier'));
    fireEvent.change(screen.getByLabelText('Modifier le titre'), { target: { value: 'Updated' } });
    fireEvent.change(screen.getByLabelText('Modifier la description'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(onEdit).toHaveBeenCalledWith(1, { title: 'Updated', description: undefined });
  });

  it('cancels edit and restores original values', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText('Modifier'));
    fireEvent.change(screen.getByLabelText('Modifier le titre'), { target: { value: 'Changed' } });
    fireEvent.click(screen.getByText('Annuler'));
    expect(screen.getByText('Ma tâche')).toBeInTheDocument();
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('does not save edit with empty title', () => {
    const onEdit = vi.fn();
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />);
    fireEvent.click(screen.getByLabelText('Modifier'));
    fireEvent.change(screen.getByLabelText('Modifier le titre'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Enregistrer'));
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('shows confirm delete on first click, calls onDelete on second', () => {
    const onDelete = vi.fn();
    render(<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByLabelText('Supprimer'));
    expect(screen.getByText('⚠️')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Supprimer'));
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('shows completed style for completed task', () => {
    render(<TaskItem task={completedTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />);
    expect(screen.getByTestId('task-item').className).toContain('task-completed');
  });
});
