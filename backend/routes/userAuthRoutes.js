const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/userControllers");

const {
  protect,
  protectUserAccounts,
} = require("../middleware/authMiddleWare");

router.route("/").post(protectUserAccounts, registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

module.exports = router;
