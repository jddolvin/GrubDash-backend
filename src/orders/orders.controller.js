const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

const list = (req, res) => {
  res.json({ data: orders });
};

const create = (req, res) => {
  const id = nextId();
  const newOrder = { ...res.locals.validOrder.data, id };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
};

const isValid = (req, res) => {
  const {
    data: { dishes },
  } = req.body;
  const requiredFields = ["deliverTo", "mobileNumber", "dishes"];
  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({ status: 400, message: `Order must include a ${field}` });
    }
  }
  if (dishes.length === 0 || !Array.isArray(dishes))
    return next({
      status: 400,
      message: "Order must include at least one dish",
    });
  res.locals.validOrder = req.body;
  next();
};

const checkDishes = (req, res, next) => {
  const dishes = res.locals.validOrder.data.dishes;
  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      typeof dish.quantity !== "number"
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });
  next();
};

const read = (req, res) => {
  res.json({ data: res.locals.order });
};

const isFound = (req, res, next) => {
  const found = orders.find((order) => order.id === req.params.orderId);
  if (!found)
    return next({
      status: 404,
      message: `Order id: ${req.params.orderId} not found.`,
    });
  res.locals.order = found;
  next();
};

const checkStatus = (req, res, next) => {
  const {
    data: { status },
  } = req.body;
  if (!status || status === "invalid")
    return next({
      status: 400,
      message:
        "Order must have a status of pending, preparing, out-for-delivery, delivered",
    });
  if (status === "delivered")
    return next({
      status: 400,
      message: "A delivered order cannot be changed",
    });
  next();
};

const update = (req, res, next) => {
  let index = orders.indexOf(res.locals.order);
  if (req.body.data.id && req.body.data.id !== orders[index].id)
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${req.body.data.id}, Route: ${orders[index].id}`,
    });
  orders[index] = { ...req.body.data, id: orders[index].id };
  res.json({ data: orders[index] });
};

function destroy(req, res, next) {
  const foundOrder = res.locals.order;
  if (foundOrder.status !== "pending") {
    return next({
      status: 400,
      message: `order must be pending to cancel`,
    });
  }
  const { orderId } = req.params;
  const index = orders.findIndex((order) => orderId === order.id);
  orders.splice(index, 1);
  res.sendStatus(204);
};

module.exports = {
  list,
  create: [isValid, checkDishes, create],
  read: [isFound, read],
  update: [isFound, isValid, checkDishes, checkStatus, update],
  delete: [isFound, destroy],
};
