import React from 'react'
import './App.scss'
import TodoList from './containers/todo-list/TodoList'

export default function App() {
  return (
    <div className="app-container">
      {/* <img src={require('./assets/images/main_bg.jpg')} alt="background_image" className="app-bg" /> */}
      <TodoList></TodoList>
    </div>
  )
}