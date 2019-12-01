import React, { useState } from 'react'
import TodoItem from './TodoItem'
import TodoAdd from './TodoAdd/TodoAdd';
import NewTodo from './NewTodo';

export default function Todo() {
  const [todos, setTodos] = useState([{ id: 0, data: 'First todo', completed: false }])
  const [addTodoDisabled, setAddTodoDisabled] = useState(false);
  const [newTodoValue, setNewTodoValue] = useState('')

  function handleTodoChange(i) {
    return (todo) => {
      todos[i].completed = !todos[i].completed
      setTodos([...todos])
    }
  }

  function handleAddTodo() {
    console.log('add new todo');
    setAddTodoDisabled(true)
  }

  function handleNewTodoChange(val) {
    setNewTodoValue(val)
  }

  function handleNewTodoSubmit() {
    setTodos([...todos, {
      completed: false,
      id: todos.length,
      data: newTodoValue
    }])

    setAddTodoDisabled(false),
    setNewTodoValue('')
  }

  return (
    <div style={{
      boxShadow: '1px 2px 10px 2px lightgrey',
    }}>
      <div style={{ textAlign: 'center', margin: '0.5em', marginTop: '1em', borderBottom: '1px solid lightgrey' }}>
        <h1 style={{ margin: '0.5em' }}>Todo App</h1>
      </div>

      <div>
        {todos.map((todo, i) => <TodoItem key={todo.id} index={i} todo={todo} onChange={handleTodoChange(i)} />)}
      </div>

      {addTodoDisabled && <NewTodo value={newTodoValue} onChange={handleNewTodoChange} onSubmit={handleNewTodoSubmit} />}

      <TodoAdd disabled={addTodoDisabled} onClick={handleAddTodo} />
    </div>
  )
}