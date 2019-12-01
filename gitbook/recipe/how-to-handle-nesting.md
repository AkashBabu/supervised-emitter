# How to handle nested components in React

* Say NO need to pass onAction handlers 
* Say NO need to pass data (if needed)

**Talking about a container - component scenario:**
How does one pass props from container to a child component ?
Props ofcourse. Yeah I know that too. 
But in reality you would choose what data the child component would need and would pass only what's needed.
Now let's consider a nested component scenario: How does one pass props to grand child ? 
You would choose all the data that is needed by the child and the grand child and would pass both the props together to the child and the child would forward it to the grand child.
Now let's consider a child for a grand-child:
You would've to pass a lots of props :( and that sounds like a problem.

Now, how does one handle a button click on a child component in a container ?
Props ofcourse. Yeah I know that too. 
You will create a handler in the container and pass it as a prop to a child component.
Now lets consider a grand child scenario:
How do you handle button click (just for the context, in fact it can be any event for that matter) on a grand child ?
You will pass the handler from container to child and child to grand-child
The same as above, if the nesting grows this problem gets a lots bigger.

One may argue that redux can solve this problem (may be), but redux clearly states that the connect must be used only on the container so that it can be replaced with minimum effort, so couldn't really agree with this solution :(

While a few other may argue that passing all the props like `{...props}` can solve it, but NO STANDARD would accept that because you are passing more than what's needed, also you're making it unclear on what the child would need.

So presenting to you, THE SOLUTION - `Supervised-Emitter`

I'm coming up with concept of Smart and Dumb component rather than stateless and stateful components. You may think that both are the same, but NOT from my perspective. 
Well at first lets see the difference between them: 
*stateless and state components*: are more like only a container shall have all the logics and state (literally state & setState) handler, while the stateless components works purely on props (pure components) and NO business logic shall be present in them.
*smart and dumb components*: would express that a container shall have all the business logic, while the dumb component merely represent the visual for the data passed to it.