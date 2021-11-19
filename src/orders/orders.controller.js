const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
const list = (req, res) => {
  res.json({ data : orders });
};

const validiteDishes = (acc, dishes) => {
  if (!Array.isArray(dishes) || !dishes.length) {
    acc.push("Order must include at least one dish")
    return;
  }
  const errors = dishes.forEach(({quantity}, i) => {
    if (!++quantity || quantity < 0) acc.push(`Dish ${i} must have a quantity that is an integer greater than 0`)
  })
}

const hasAllProperties = (req, res, next) => {
  const { params: { orderId }, body: { data: { id } } } = req
  if(id && !(id == orderId)) return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    })

  const props = ["deliverTo", "mobileNumber", "status", "dishes"];
  res.locals.newOrder = {};
  errors = props.reduce((acc, prop) => {
    const propValue = req.body.data[prop];
    expected = `Order must include `
    if(!propValue) acc.push(expected + `a ${prop}`)
    else if (prop === "dishes") validiteDishes(acc, propValue)
    else res.locals.newOrder[prop] = propValue;
    return acc;
  }, []);

  
  return !errors.length 
    ? next()
    : next({
      status: 400,
      message: errors.join(", ")
    });
}

const create = (req, res) => {
  const { newOrder } = res.locals;
  const id = nextId();
  const order = { ...newOrder, id };
  orders.push(order);
  res.status(201).json({ data: order });
}

const orderExists = (req, res, next) => {
  const { orderId } = req.params;
  const order = orders.find(order => order.id === orderId);
  res.locals.order = order;
  return order
    ? next()
    : next({
      status: 404,
      message: `Order does not exist: ${orderId}.`,
    });
}

const read = (req, res) => {
  const { order } = res.locals;
  res.json({ data: order });
}

const destroy = (req, res) => {
  const { order } = res.locals;
  if (order.status) return next({status: 404, message: "An order cannot be deleted unless it is pending"});

  const { orderId } = req.params;
  const index = orders.indexOf(order => order.id === orderId);
  orders.slice(index, 1);

  res.sendStatus(204);
}
module.exports = {
  list,
  create : [ hasAllProperties, create ],
  read : [ orderExists, read ],
  update : [ orderExists, hasAllProperties, update ],
  delete : [ orderExists, destroy ],
};