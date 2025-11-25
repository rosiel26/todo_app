import React, { useState, useEffect, useCallback } from 'react';
import type { Todo } from './types';
import TodoList from './components/TodoList';
import AddTodoForm from './components/AddTodoForm';
import './App.css';

// For deployment
const API_URL = 'https://rosiel26-todoapp.vercel.app//api/index';


const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterDate, setFilterDate] = useState('');

  const fetchTodos = useCallback(async () => {
    try {
      const url = filterDate ? `${API_URL}?filterDate=${filterDate}` : API_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (title: string) => {
    if (!title.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        return;
      }

      const newTodo = await res.json();
      setTodos((prev) => [...prev, newTodo]);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const handleUpdateTodo = async (id: number, title: string, completed: boolean) => {
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, completed }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('API Error:', data);
        return;
      }

      const updatedTodo = await res.json();
      setTodos((prev) => prev.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (err) {
      console.error('Failed to update todo:', err);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      const res = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('API Error:', data);
        return;
      }

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error('Failed to delete todo:', err);
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
