import React from 'react';
import './App.scss';
import TodoList from './containers/todo-list/TodoList';

export default function App() {
  return (
    <div className="app-container">
      <TodoList />
    </div>
  );
}
