import React, { useEffect, useState } from 'react';
import SE from 'supervised-emitter';

import './TodoList.scss';
import Todo from '../../components/Todo/Todo';
import TodoFooter from '../../components/TodoFooter/TodoFooter';
import FullScreenIcon from '../../components/FullScreenIcon';
import ExitFullScreenIcon from '../../components/ExitFullScreenIcon';

function sortTodos(todoA, todoB) {
  if (todoA.completed === todoB.completed) return 0;
  if (todoA.completed) return 1;
  return -1;
}

function getPrevState() {
  return JSON.parse(window.localStorage.getItem('todo-list') || '[]');
}

function saveState(data) {
  window.localStorage.setItem('todo-list', JSON.stringify(data));
}

SE.subscribe('todo/save', ({ data }) => {
  saveState(data);
});

export default function TodoList() {
  const [todos, setTodoList] = useState(getPrevState());

  const setTodos = todoList => {
    setTodoList(todoList);
    SE.publish('todo/save', todoList);
  };

  const [fullScreen, setFullScreen] = useState(false);

  // Initialize scope in useState so that new scope is
  // NOT created after each setState() call
  const [{ scope }] = useState({ scope: SE.getScope() });

  useEffect(() => {
    const subscription = SE
      .subscribe(scope('todo/item/change'), handleTodoChange)
      .subscribe(scope('todo/item/add'), handleAddTodo)
      .subscribe(scope('todo/item/remove'), handleTodoRemove);

    return subscription.unsubscribe;
  }, [todos]);

  useEffect(() => {
    document.onfullscreenchange = () => {
      setFullScreen(document.fullscreen);
    };

    return () => document.onfullscreenchange = undefined;
  }, []);

  function handleAddTodo({ data: { todo }, printEventTrace }) {
    printEventTrace();

    setTodos([...todos, {
      title     : todo.title,
      body      : todo.body,
      completed : false,
      id        : todos.length + 1,
    }].sort(sortTodos));
  }

  function handleTodoChange({ data: { todo, index } }) {
    const newTodos = todos.slice();
    newTodos[index] = { ...todo };
    setTodos(newTodos.sort(sortTodos));
  }

  function handleTodoRemove({ data: { index } }) {
    todos.splice(index, 1);
    setTodos(todos.slice());
  }

  function toggleFullScreen() {
    if (!fullScreen) {
      document.body.requestFullscreen();
      setFullScreen(true);
    } else {
      document.exitFullscreen();
      setFullScreen(false);
    }
  }


  return (
    <div className="container">

      <header className="titlebar">
        <h1 className="todo-list_title">Things to do...</h1>

        {!fullScreen
          ? (
            <FullScreenIcon
              style={{
                width       : '2em',
                marginRight : '0.5em',
              }}
              onClick={toggleFullScreen}
            />
          ) : (
            <ExitFullScreenIcon
              style={{
                width       : '2em',
                marginRight : '0.5em',
              }}
              onClick={toggleFullScreen}
            />
          )}
      </header>


      <div className="todo-list" role="main">
        {todos.map((todo, i) => (
          <Todo todo={todo} key={todo.id} index={i} scope={scope} last={i === todos.length - 1} />
        ))}

        <TodoFooter scope={scope} />
      </div>

    </div>
  );
}
