import React from 'react'
import SE from '../supervisedEmitter'

export default function TodoItem({todo, index}) {
  let style = {}

  if(todo.completed) {
    style = {
      color: 'grey',
      fontStyle: 'italic',
      textDecoration: 'line-through'
    }
  }

  function handleChange() {
    SE.publish('input/text/todo/item/change', {todo, index})
    // onChange(todo)
  }
  
  const itemId = `todoitem_${todo.id}`

  return (
    <div style={{padding: '0.5em', borderBottom: '1px solid lightgrey'}}>
      <label htmlFor={itemId}>
        <input type="checkbox" name="todo_checkbox" checked={todo.completed} onChange={handleChange} id={itemId} />
        &nbsp;
        <span style={style}>{todo.data}</span>
      </label>
    </div>
  )
}