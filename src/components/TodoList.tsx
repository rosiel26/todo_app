import React, { useState, useRef, useEffect } from 'react';
import type { Todo } from '../types';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: number, title: string, completed: boolean) => void;
  onDelete: (id: number) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onUpdate, onDelete }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const openDeleteConfirmationModal = (todo: Todo) => {
    setTodoToDelete(todo);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteConfirmationModal = () => {
    setIsDeleteModalOpen(false);
    setTodoToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (todoToDelete) {
      onDelete(todoToDelete.id);
      closeDeleteConfirmationModal();
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.title);
  };

  const saveEdit = (todo: Todo) => {
    if (!editingText.trim()) return;
    onUpdate(todo.id, editingText.trim(), todo.completed);
    setEditingId(null);
    setEditingText('');
  };

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  return (
    <div className="todo-list">
      {todos.length === 0 && <p>No todos yet.</p>}

      {todos
        .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
        .map((todo) => (
          <div key={todo.id} className="todo-item" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <input
    type="checkbox"
    checked={todo.completed}
    onChange={() => onUpdate(todo.id, todo.title, !todo.completed)}
  />

  {editingId === todo.id ? (
    <input
      ref={inputRef}
      value={editingText}
      onChange={(e) => setEditingText(e.target.value)}
      onBlur={() => saveEdit(todo)}
      onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo)}
      style={{ flex: 1 }}
    />
  ) : (
    <span
      style={{
        textDecoration: todo.completed ? 'line-through' : 'none',
        flex: 1,        // make span take remaining space
        wordBreak: 'break-word' // wrap long titles
      }}
    >
      {todo.title}
    </span>
  )}

  <button
    onClick={() => startEdit(todo)}
    style={{
      backgroundColor: 'orange',
      color: 'white',
      border: 'none',
      padding: '4px 8px',
      borderRadius: '4px',
      cursor: 'pointer',
    }}
  >
    Edit
  </button>
  <button
    onClick={() => openDeleteConfirmationModal(todo)}
    style={{
      backgroundColor: 'red',
      color: 'white',
      border: 'none',
      padding: '4px 8px',
      borderRadius: '4px',
      cursor: 'pointer',
    }}
  >
    Delete
  </button>
</div>

        ))}

      {todoToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteConfirmationModal}
          onConfirm={handleConfirmDelete}
          todoTitle={todoToDelete.title}
        />
      )}
    </div>
  );
};

export default TodoList;
