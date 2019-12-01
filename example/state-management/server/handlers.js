const Actions = require('./actions');


function createHandler() {
  return (req, res) => {
    console.log('CREATING:', req.body);

    const newEntry = Actions.create(req.body, req.params.collection);

    res.send({
      msg  : 'CREATED',
      data : newEntry,
    });
  };
}

function updateHandler() {
  return (req, res) => {
    console.log('UPDATING:', req.params.id, req.body);

    const updated = Actions.update(req.params.id, req.body, req.params.collection);

    if (updated) {
      return res.send({
        msg: 'ACCEPTED',
      });
    }

    res.status(404).send({
      msg: 'NOT FOUND',
    });
  };
}

function deleteHandler() {
  return (req, res) => {
    console.log('DELETING:', req.params.id);

    const deleted = Actions.remove(req.params.id, req.params.collection);

    if (deleted) {
      return res.send({
        msg: 'SUCCESS',
      });
    }

    res.status(404).send({
      msg: 'NOT FOUND',
    });
  };
}

function getByIdHandler() {
  return (req, res) => {
    console.log('GETTING:', req.params.id);

    const item = Actions.getById(req.params.id, req.params.collection);

    if (item) {
      return res.send({
        msg  : 'SUCCESS',
        data : item,
      });
    }

    res.status(404).send({
      msg: 'NOT FOUND',
    });
  };
}

function getListHandler() {
  return (req, res) => {
    const data = Actions.getList(req.query, req.params.collection);

    res.send({
      msg: 'SUCCESS',
      data,
    });
  };
}

module.exports = {
  createHandler,
  updateHandler,
  deleteHandler,
  getByIdHandler,
  getListHandler,
};
