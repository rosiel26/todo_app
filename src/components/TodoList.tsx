
import React from 'react';
import type { Todo } from '../types';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, text: string, completed: boolean) => void;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onDelete, onUpdate }) => {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
};

export default TodoList;
