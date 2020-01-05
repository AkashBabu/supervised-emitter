import React from 'react'
import Button from './Button/Button'
import SE from '../../supervisedEmitter'

export default function TodoAdd({disabled, /* onClick */}) {
  return (
    <div style={{padding: '0.5em'}}>
      <Button 
        disabled={disabled} 
        onClick={() => SE.publish('button/click/todo-add')}
      >
        Add Todo
      </Button>
    </div>
  )
}