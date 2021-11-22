const path = require("path");

const dishes = require(path.resolve("src/data/dishes-data"));

const nextId = require("../utils/nextId");

function list (req, res) {
  res.json({ data: dishes });
}

function hasAllProperties (req, res, next) {
  const { params: { dishId }, body: { data: { id } } } = req
  if(id && !(id == dishId)) return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });

  const props = ["name", "description", "price", "image_url"];
  res.locals.newDish = {};
  errors = props.reduce((acc, prop) => {
    const propValue = req.body.data[prop];
    expected = `Dish must `
    if(!propValue) acc.push(expected + `include a ${prop}`)
    else if (prop === "price" && (!Number.isInteger(propValue) || propValue <= 0)) {
      acc.push(expected + `have a price that is an integer greater than 0`)
    } 
    else res.locals.newDish[prop] = propValue;
    return acc;
  }, []);

  return !errors.length 
    ? next()
    : next({
      status: 400,
      message: errors.join(", ")
    });
}

function create (req, res) {
  const { newDish } = res.locals;
  const id = nextId();
  const dish = { ...newDish, id };
  dishes.push(dish);
  res.status(201).json({ data: dish });
}

function dishExists (req, res, next) {
  const { dishId } = req.params;
  const dish = dishes.find(dish => dish.id === dishId);
  res.locals.dish = dish;
  return dish
    ? next()
    : next({
      status: 404,
      message: `Dish does not exist: ${dishId}.`,
    });
}

function read (req, res) {
  const { dish } = res.locals;
  res.json({ data: dish });
}

function update (req, res) {
  const { dish, newDish } = res.locals;
  Object.assign(dish, newDish);
  res.json({ data: dish });
}

module.exports = {
  list,
  create: [ hasAllProperties, create ],
  read : [ dishExists, read ],
  update : [ dishExists, hasAllProperties, update ],
}