import React, { useState, useEffect, useCallback } from 'react';
import type { Todo } from './types';
import TodoList from './components/TodoList';
import AddTodoForm from './components/AddTodoForm';
import './App.css';

// Make sure this points to your Vercel API endpoint
const API_URL = import.meta.env.VITE_API_BASE_URL + '/api/todos';
console.log('API_URL:', API_URL);

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterDate, setFilterDate] = useState('');

  // Fetch todos with optional date filter
  const fetchTodos = useCallback(async () => {
    try {
      const url = filterDate ? `${API_URL}?filterDate=${filterDate}` : API_URL;
      const response = await fetch(url);
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Add a new todo
  const handleAddTodo = async (text: string) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      fetchTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  // Update an existing todo (send ID in body)
  const handleUpdateTodo = async (id: number, text: string, completed: boolean) => {
    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text, completed }),
      });
      fetchTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  // Delete a todo (send ID in body)
  const handleDeleteTodo = async (id: number) => {
    try {
      await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  return (
    <div className="App">
      <h1>To-Do App</h1>
      <AddTodoForm onAdd={handleAddTodo} />
      <div className="filter-container">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <button onClick={() => setFilterDate('')}>Clear Filter</button>
      </div>
      <TodoList
        todos={todos}
        onDelete={handleDeleteTodo}
        onUpdate={handleUpdateTodo}
      />
    </div>
  );
};

export default App;
