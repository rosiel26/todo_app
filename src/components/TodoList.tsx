import React from 'react';
import type { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: number, text: string, completed: boolean) => void;
  onDelete: (id: number) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onUpdate, onDelete }) => {
  if (!todos.length) return <p>No todos yet.</p>;

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className={todo.completed ? 'completed' : ''}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onUpdate(todo.id, todo.text, !todo.completed)}
          />
          <input
            type="text"
            value={todo.text}
            onChange={(e) => onUpdate(todo.id, e.target.value, todo.completed)}
          />
          <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
