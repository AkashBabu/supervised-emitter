import React, { useState } from 'react';
import SE from 'supervised-emitter';

import './Todo.scss';

function isFocused(elem) {
  return elem === document.activeElement;
}

export default function Todo({
  todo, index, scope, last,
}) {
  const [actionsVisible, setActionsVisibility] = useState(false);
  const [editable, setEditablity] = useState(false);
  let titleRef,
    bodyRef;

  function handleStateChange(e) {
    handleChange({ completed: e.target.checked });
  }

  function handleChange(changedTodo) {
    SE.publish(scope('todo/item/change'), {
      todo: {
        ...todo,
        ...changedTodo,
      },
      index,
    });
  }

  function handleRemove() {
    SE.publish(scope('/todo/item/remove'), {
      todo,
      index,
    });
  }

  function handleEdit() {
    setEditablity(true);
    setTitle(todo.title);
    setBody(todo.body);
  }


  const [title, setTitle] = useState(todo.title);
  const [body, setBody] = useState(todo.body || '');
  function handleSubmit(e) {
    e && e.preventDefault();
    handleChange({
      title,
      body,
    });

    setEditablity(false);
  }

  function handleInputChange(e) {
    if (e.target.name === 'title') {
      setTitle(e.target.value);
    } else {
      setBody(e.target.value);
    }
  }

  function handleBlur(e) {
    switch (e.target.name) {
      case 'title':
        setTimeout(() => {
          if (!isFocused(bodyRef)) {
            handleSubmit();
          }
        }, 100);
        break;

      case 'body':
        setTimeout(() => {
          if (!isFocused(titleRef)) {
            handleSubmit();
          }
        }, 100);
        break;

      default:
    }
  }

  return (
    <div
      className={`todo-item ${last ? 'last' : ''}`}
      id={`todo_item_${todo.id}`}
      onMouseEnter={() => setActionsVisibility(true)}
      onMouseLeave={() => setActionsVisibility(false)}
    >
      {editable ? (
        <form className="todo-item_edit" onSubmit={handleSubmit}>
          <div className="inputs">
            <div className="input-group">
              <label htmlFor="todo-item_edit-title">
                <input
                  id="todo-item_edit-title"
                  type="text"
                  name="title"
                  aria-label="Edit todo title"
                  className="title"
                  placeholder="Title"
                  value={title}
                  onChange={handleInputChange}
                  ref={r => titleRef = r}
                  onBlur={handleBlur}
                  autoFocus // eslint-disable-line
                />
              </label>
            </div>

            <div className="input-group">
              <label htmlFor="todo-item_edit-body">
                <input
                  id="todo-item_edit-body"
                  type="text"
                  name="body"
                  className="body"
                  aria-label="Edit todo description"
                  placeholder="Description"
                  value={body}
                  onChange={handleInputChange}
                  ref={r => bodyRef = r}
                  onBlur={handleBlur}
                />
              </label>
            </div>
          </div>

          <div className="buttons">
            <button hidden type="submit" className="accept-btn" onClick={handleSubmit}>✔</button>
          </div>
        </form>
      ) : (
        <>
          <div className="todo-item_chbx">
            <label
              htmlFor={`todo_item_checkbox_${todo.id}`}
            >
              {/* Toggle Completion */}
              <input
                aria-label="toggle todo"
                id={`todo_item_checkbox_${todo.id}`}
                type="checkbox"
                name="toggle_todo"
                checked={todo.completed}
                onChange={handleStateChange}
              />
            </label>
          </div>

          <div className="todo-item_main" onClick={handleEdit} role="button" tabIndex="0" aria-label={todo.title} onKeyPress={handleEdit}>
            <span
              className={`todo-item_title ${todo.completed ? 'completed' : ''}`}
            >
              {todo.title}
            </span>

            {todo.body && <span className={`todo-item_body ${todo.completed ? 'completed' : ''}`}>{todo.body}</span>}
          </div>

          <div className="todo-item_actions">
            <button type="button" className="plain-btn" onClick={handleRemove} title="Remove todo">&times;</button>
          </div>
        </>
      )}

    </div>
  );
}
