
import React, { useState, useEffect, useCallback } from 'react';
import type { Todo } from './types';
import TodoList from './components/TodoList';
import AddTodoForm from './components/AddTodoForm';
import './App.css';

const API_URL = 'https://your-backend-url.up.railway.app/api/todos';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterDate, setFilterDate] = useState('');

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

  const handleAddTodo = async (text: string) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      // After adding, refetch the list to get the latest sorted data
      fetchTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    }
  };

  const handleUpdateTodo = async (id: number, text: string, completed: boolean) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, completed }),
      });
      // After updating, refetch the list to get the correct sorted order
      fetchTodos();
    } catch (error) {
      console.error('Failed to update todo:', error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      // After deleting, refetch the list
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

