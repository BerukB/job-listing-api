const express = require("express");
const router = express.Router();
const {
  patchUser,
  getUsers,
  deleteUser,
  getUser,
} = require("../controllers/userControllers");

const { protectUserAccounts } = require("../middleware/authMiddleWare");

router.route("/").get(protectUserAccounts, getUsers);
router
  .route("/:id")
  .patch(protectUserAccounts, patchUser)
  .delete(protectUserAccounts, deleteUser)
  .get(protectUserAccounts, getUser);

module.exports = router;
