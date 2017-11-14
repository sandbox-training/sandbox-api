const seneca = require('seneca');
const eventHub = require('../eventHub');

const sseConnections = [];

const getItems = seneca().client({
  host: process.env.GETITEMS_HOST,
  port: process.env.GETITEMS_PORT,
});

const getItem = seneca().client({
  host: process.env.GETITEM_HOST,
  port: process.env.GETITEM_PORT,
});

const createItem = seneca().client({
  host: process.env.CREATEITEM_HOST,
  port: process.env.CREATEITEM_PORT,
});

const updateItem = seneca().client({
  host: process.env.UPDATEITEM_HOST,
  port: process.env.UPDATEITEM_PORT,
});

const deleteItem = seneca().client({
  host: process.env.DELETEITEM_HOST,
  port: process.env.DELETEITEM_PORT,
});

module.exports.getItems = (req, res, next) => {
  getItems.act({ role: 'item', cmd: 'getItems' }, (error, result) => {
    if (error) return next(error);
    if (result.error) return res.status(422).json(result.error);
    res.status(200).json(result.response);
  });
};

module.exports.getItem = (req, res, next) => {
  getItems.act(
    { role: 'item', cmd: 'getItem', id: req.params.id },
    (error, result) => {
      if (error) return next(error);
      if (result.error) return res.status(422).json(result.error);
      res.status(200).json(result.response);
    }
  );
};

module.exports.createItem = (req, res, next) => {
  if (!req.body.label) {
    return res.status(422).json({ error: 'ItemLabelRequired' });
  }
  createItem.act(
    { role: 'item', cmd: 'createItem', label: req.body.label },
    (error, result) => {
      if (error) return next(error);
      if (result.error) return res.status(422).json(result.error);
      eventHub.emit('item_created', result.response);
      res.status(200).json(result.response);
    }
  );
};

module.exports.updateItem = (req, res, next) => {
  if (!req.body.label) {
    return res.status(422).json({ error: 'ItemLabelRequired' });
  }
  updateItem.act(
    {
      role: 'item',
      cmd: 'updateItem',
      id: req.params.id,
      label: req.body.label,
    },
    (error, result) => {
      if (error) return next(error);
      if (result.error) return res.status(422).json(result.error);
      eventHub.emit('item_updated', result.response);
      res.status(200).json(result.response);
    }
  );
};

module.exports.deleteItem = (req, res, next) => {
  deleteItem.act(
    { role: 'item', cmd: 'deleteItem', id: req.params.id },
    (error, result) => {
      if (error) return next(error);
      if (result.error) return res.status(422).json(result.error);
      eventHub.emit('item_deleted', result.response);
      res.status(200).json(result.response);
    }
  );
};

const sendSSEMessage = (key, value, except) => {
  sseConnections.forEach(connection => {
    connection.write('id:' + new Date().getMilliseconds() + '\n');
    connection.write('data:' + JSON.stringify({ key, value }) + '\n\n');
  });
};

module.exports.sse = (req, res, next) => {
  req.socket.setTimeout(Number.MAX_VALUE);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');
  sseConnections.push(res);
  req.on('close', () => {
    const index = sseConnections.indexOf(
      sseConnections.filter(connection => connection === res)[0]
    );
    if (index && index > 0) {
      sseConnections.splice(index, 1);
    }
  });
  eventHub.on('item_created', item => sendSSEMessage('item_created', item));
  eventHub.on('item_updated', item => sendSSEMessage('item_updated', item));
  eventHub.on('item_deleted', id => sendSSEMessage('item_deleted', id));
};
