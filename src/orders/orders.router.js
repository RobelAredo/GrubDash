const router = require("express").Router();
const { list, create, read, update, delete } = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/:orderId")
  .get(read)
  .post(update)
  .delete(delete)
  .all(methodNotAllowed);
  
router.route("/")
  .get(list)
  .post(create)
  .all(methodNotAllowed);
  
module.exports = router;
