---
description: Getting started
---

# Basic Usage

## Installation

> npm i supervised-emitter --save

## Usage in ReactJS

**Example 1:** Below example demonstrates a simple use case of a two components next to each other \(sibling components\). It shows how easy it is to establish a communication between components irrespective of where ever it is in the DOM tree.

```jsx
/// index.jsx
import SupervisedEmitter from 'supervised-emitter';

const SE = new SupervisedEmitter();
export default SE;



/// componentA.jsx
import SE from './index.jsx';
import React from 'react'

export default function ComponentA() {
  function handleClick() {
    SE.publish('btn/clicked', 'some-data');
  }

  return <button onClick={handleClick}>Click me!</button>
}



/// componentB.jsx
import SE from './index.jsx';
import React, {useEffect, useState} from 'react'

export default function ComponentB() {
  const [text, setText] = useState('Listening...');

  useEffect(() => {
    const subscription = SE.subscribe('btn/clicked', ({data}) => setText('btn clicked!'))

    return () => subscription.unsubscribe();
  }, [])

  return <span>{text}</span>
}


/// App.jsx
import React from 'react'
import ComponentA from './componentA'
import ComponentB from './componentB'

export default function App() {
  return <div>
    <ComponentA />
    <ComponentB />
  </div>
}
```

**Example 2:** Below example demonstrates how to scope the events between a container and a component, such that no other subscriber can eavesdrop on the published events. This helps in cases where there are multiple instances of the same component with different actions to be performed in different use-cases.

```jsx
/// index.jsx
import SupervisedEmitter from 'supervised-emitter';

const SE = new SupervisedEmitter();
export default SE;




/// container.jsx
import SE from './index.jsx';
import React, {useEffect, useState} from 'react'

export default function Container() {
  const [text, setText] = useState('Listening...');
  
  const [{scope}] = useState({scope: SE.getScope()});

  useEffect(() => {
    const subscription = SE.subscribe(scope('btn/clicked'), ({data}) => setText('btn clicked!'))

    return subscription.unsubscribe;
  }, [])

  return <span scope={scope}>{text}</span>
}




/// component.jsx
import SE from './index.jsx';
import React from 'react'

export default function Component({scope}) {
  function handleClick() {
    SE.publish(scope('btn/clicked'), 'some-data');
  }

  return <button onClick={handleClick}>Click me!</button>
}




/// App.jsx
import React from 'react';
import Container from './container';

export default function App() {
  return <div>
    <Container />
  </div>
}
```

For a sample ReactJS application \(Todo App\) [visit](https://github.com/AkashBabu/supervised-emitter/tree/master/example/todo-app).

