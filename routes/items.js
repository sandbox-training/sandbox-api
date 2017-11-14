const controller = require('../controllers/items');

module.exports = app => {
  app
    .route('/items')
    .get(controller.getItems)
    .post(controller.createItem);
  app
    .route('/items/:id')
    .get(controller.getItem)
    .put(controller.updateItem)
    .delete(controller.deleteItem);
  app.get('/sse/items', controller.sse);
};
