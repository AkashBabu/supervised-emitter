import React from 'react'
import Button from './Button/Button'

export default function TodoAdd({disabled, onClick}) {
  return (
    <div style={{padding: '0.5em'}}>
      <Button disabled={disabled} onClick={onClick}>Add Todo</Button>
    </div>
  )
}