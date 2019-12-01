const { writeFileSync } = require('fs');
const { resolve } = require('path');
const DB = require('./db.json');


function handleSaveDb() {
  writeFileSync(
    resolve('./db.json'),
    JSON.stringify(DB, null, 2),
  );

  process.exit(0);
}

['SIGINT', 'SIGUSR2', 'SIGTERM'].forEach(sig => {
  process.on(sig, handleSaveDb);
});

const DEFAULT = '__default__';

function getCollection(collection) {
  return DB[collection] = DB[collection] || [];
}

function getById(id, collection = DEFAULT) {
  const coll = getCollection(collection);

  return coll.find(item => String(item.id) === String(id));
}

function getList(query, collection = DEFAULT) {
  const coll = getCollection(collection);

  const { pageSize = 10, pageNo = 1 } = query;

  return {
    totalCount : coll.length,
    pageNo,
    list       : coll.slice((pageNo - 1) * pageSize, pageNo * pageSize),
  };
}

function create(data, collection = DEFAULT) {
  const coll = getCollection(collection);

  const newEntry = {
    id: coll.length,
    ...data,
  };

  coll.push(newEntry);

  return newEntry;
}

function update(id, data, collection = DEFAULT) {
  const coll = getCollection(collection);

  const itemIndex = coll.findIndex(item => String(item.id) === String(id));

  if (itemIndex > -1) {
    coll[itemIndex] = Object.assign(coll[itemIndex], data);

    return coll[itemIndex];
  }

  return null;
}

function remove(id, collection = DEFAULT) {
  const coll = getCollection(collection);

  const itemIndex = coll.findIndex(item => String(item.id) === String(id));

  if (itemIndex > -1) {
    coll.splice(itemIndex, 1);

    return true;
  }

  return false;
}

module.exports = {
  create,
  update,
  remove,
  getById,
  getList,
};
