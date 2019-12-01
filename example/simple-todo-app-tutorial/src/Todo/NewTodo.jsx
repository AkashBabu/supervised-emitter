import React from 'react'

export default function NewTodo({value, onChange, onSubmit}) {
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit();
  }

  function handleChange(e) {
    onChange(e.target.value)
  }

  return (
    <form style={{
      padding: '0.5em'
    }} onSubmit={handleSubmit}>
      <input type="text" style={{
        width: '100%',
        border: 'none',
        borderBottom: '1px solid blue',
        outline: 'none',
        fontSize: '0.75em'
      }}
      value={value}
      onChange={handleChange}
      autoFocus
       />
    </form>
  )
}