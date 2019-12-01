import React from 'react'

export default function Button({children, disabled, onClick}) {
  return (
      <button type="button" style={{
        border: '1px solid grey',
        borderRadius: '3px',
        width: '100%',
        padding: '0.5em',
        fontSize: '1em'
      }}
      onClick={onClick}
      disabled={disabled}
      >{children}</button>
  )
}