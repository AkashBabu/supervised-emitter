import React, { useState } from 'react';
import SE from '../../lib/supervisedEmitter'

import './TodoFooter.scss';

export default function TodoFooter({ scope }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  let titleRef;

  function handleSubmit(e) {
    e.preventDefault();

    if (!title) {
      titleRef.focus();
      return;
    }

    SE.publish(scope('todo/item/add'), {
      todo: {
        title,
        body,
      },
    });

    handleClear();
    titleRef.focus();
  }

  function handleClear() {
    setTitle('');
    setBody('');
  }

  function handleChange(e) {
    if (e.target.name === 'title') {
      setTitle(e.target.value);
    } else {
      setBody(e.target.value);
    }
  }

  return (
    <form className="todo-footer" onSubmit={handleSubmit}>

      <div className="inputs">
        <div className="input-group">
          <label htmlFor="todo_footer-title">
            <input
              id="todo_footer-title"
              type="text"
              name="title"
              className="title"
              aria-label="New todo title"
              placeholder="Title"
              value={title}
              onChange={handleChange}
              ref={r => titleRef = r}
            />
          </label>
        </div>

        <div className="input-group">
          <label htmlFor="todo-footer_body">
            <input
              id="todo-footer_body"
              type="text"
              name="body"
              className="body"
              aria-label="New todo's description"
              placeholder="Description"
              value={body}
              onChange={handleChange}
            />
          </label>
        </div>
      </div>

      <div className="buttons">
        <button type="submit" className="add-btn">
          <span role="img" aria-label="Add">➕</span>
        </button>
      </div>
    </form>
  );
}
