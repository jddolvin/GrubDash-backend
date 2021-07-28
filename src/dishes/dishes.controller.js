const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

function list(req, res) {
  res.json({ data: dishes });
}

function dishExists(req, res) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish ID '${dishId}' Doesn't Exist`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

function checkDishId(req, res, next) {
  const dishId = req.params.dishId;
  const id = req.body.data.id;
  if (dishId !== id && id !== undefined && (id !== "") & (id !== null)) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    });
  }
  return next();
}

function update(req, res) {
  const dishId = req.params.dishId;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  const { data: { name, description, price, image_url } = {} } = req.body;

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}

function isValidDish(req, res, next) {
  const { data } = req.body;
  if (!data) {
    return next({
      status: 400,
      message: "Please include a request body with the dish's attributes.",
    });
  }
  if (!data.name || data.name.trim().length === 0) {
    return next({ status: 400, message: "Dish must include a name" });
  }
  if (!data.description || data.description.trim().length === 0) {
    return next({ status: 400, message: "Dish must include a description" });
  }
  if (!data.price) {
    return next({ status: 400, message: "Dish must include a price" });
  }
  if (
    typeof data.price !== "number" ||
    data.price - Math.floor(data.price) !== 0 ||
    data.price <= 0
  ) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  if (!data.image_url || data.image_url.trim().length === 0) {
    return next({ status: 400, message: "Dish must include a image_url" });
  }
  return next();
}

function create(req, res) {
  let { data: { name, description, price, image_url } = {} } = req.body;

  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

module.exports = {
  create: [isValidDish, create],
  list: [list],
  read: [dishExists, read],
  update: [dishExists, checkDishId, isValidDish, update],
};
