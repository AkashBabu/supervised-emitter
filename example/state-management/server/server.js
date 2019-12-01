const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const Handlers = require('./handlers');

const app = express();
const PORT = process.argv.slice(2)[0] || process.env.PORT || 8080;

app.use(bodyParser.json());

app.use(morgan('dev'));

app.post('/:collection/', Handlers.createHandler());
app.put('/:collection/:id', Handlers.updateHandler());
app.delete('/:collection/:id', Handlers.deleteHandler());
app.get('/:collection/:id', Handlers.getByIdHandler());
app.get('/:collection/', Handlers.getListHandler());


app.listen(PORT, err => {
  if (err) {
    return console.error('Mock-Server failed to start:', err);
  }

  console.log('Mock-Server is running on port:', PORT);
});
