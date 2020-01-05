import React, { useState, useEffect } from 'react'
import TodoItem from './TodoItem'
import TodoAdd from './TodoAdd/TodoAdd';
import NewTodo from './NewTodo';
import SE from '../supervisedEmitter';

export default function Todo() {
  const [todos, setTodos] = useState([])
  const [addTodoDisabled, setAddTodoDisabled] = useState(true);
  const [newTodoValue, setNewTodoValue] = useState('')

  useEffect(() => {
    const subscription = SE.subscribe('input/text/todo/item/change', ({ data: { index, todo } }) => handleTodoChange(index, todo))
      .subscribe('input/text/new-todo/change', ({ data }) => handleNewTodoChange(data))
      .subscribe('form/submit/new-todo', handleNewTodoSubmit)
      .subscribe('button/click/todo-add', handleAddTodo)

    return subscription.unsubscribe;
  }, [todos, newTodoValue])

  function handleTodoChange(index, todo) {
    todo.completed = !todo.completed;
    todos[index] = todo;

    setTodos([...todos])
  }

  function handleAddTodo() {
    setAddTodoDisabled(true)
  }

  function handleNewTodoChange(val) {
    setNewTodoValue(val)
  }

  function handleNewTodoSubmit(val) {
    setTodos([...todos, {
      completed: false,
      id: todos.length,
      data: newTodoValue
    }])

    setAddTodoDisabled(false)
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
        {todos.map((todo, i) => <TodoItem key={todo.id} index={i} todo={todo}
        //  onChange={handleTodoChange(i)} 
        />)}
      </div>

      {addTodoDisabled && <NewTodo value={newTodoValue} 
      // onChange={handleNewTodoChange} onSubmit={handleNewTodoSubmit} 
      />}

      <TodoAdd disabled={addTodoDisabled} 
      // onClick={handleAddTodo} 
      />
    </div>
  )
}