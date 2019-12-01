import React from 'react'

export default function TodoItem({todo, index, onChange}) {
  let style = {}

  if(todo.completed) {
    style = {
      color: 'grey',
      fontStyle: 'italic',
      textDecoration: 'line-through'
    }
  }
  
  const itemId = `todoitem_${todo.id}`

  return (
    <div style={{padding: '0.5em', borderBottom: '1px solid lightgrey'}}>
      <label htmlFor={itemId}>
        <input type="checkbox" name="todo_checkbox" checked={todo.completed} onChange={onChange} id={itemId} />
        &nbsp;
        <span style={style}>{todo.data}</span>
      </label>
    </div>
  )
}