const Joi = require("joi");
const User = require("../model/userModel");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// @desc Get user data
// @route GET /api/users/me
// @access Private

const getMe = asyncHandler(async (req, res) => {
  const { _id, name, email,userRole } = await User.findById(req.user.id);

  res.status(200).json({
    id: _id,
    name,
    email,
    userRole
  });
});

// Get a single User

const getUser = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  const user = await User.findById(id).select("-password");
  if (!user)
    return res.status(404).send("The user with the given id was not found.");

  res.status(200).json(user);
});

// @desc Register new user
// @route POST /api/users
// @access Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, userRole, status } = req.body;

  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check if the user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("user already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //  Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    userRole,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      userRole: user.userRole,
      status: user.status,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc Register new user
// @route POST /api/users/login
// @access Public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.status === "inactive") {
      res.status(401);
      throw new Error("You are not active");
    }
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      userRole: user.userRole,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Update a single User

const patchUser = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  const { error } = validateUserPatch(req.body);

  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user)
    return res.status(404).send("The user with the given id was not found.");

  const { password, ...userWithoutPasword } = user.toObject();
  res.status(200).json(userWithoutPasword);
});

// Get all Users

const getUsers = asyncHandler(async (req, res) => {
  // const filter = { ...req.query };
  const { pageLimit, pageNumber, sort, ...filter } = req.query;
  // Pagination
  const currentPageNumber = parseInt(pageNumber, 10);
  const itemsPerPage = parseInt(pageLimit, 10);

  const users = await User.find(filter)
    .collation({ locale: "en", strength: 2 })
    .sort(sort)
    .select("-password")
    .skip((currentPageNumber - 1) * itemsPerPage)
    .limit(itemsPerPage);

  // Get the total number of Users
  const count = await User.countDocuments();

  // Calculate the total number of pages
  const totalPages = Math.ceil(count / pageLimit);

  res.status(200).json({
    count,
    totalPages,
    currentPage: currentPageNumber,
    users,
  });
});

// Delete a single User

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send("The user with the given id was not found.");

  await User.findByIdAndRemove(req.params.id);

  res.status(200).json({ message: `Delete user ${req.params.id}` });
});

// JOI VALIDATOR

const validateUser = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    userRole: Joi.string().valid("candidate", "admin", "superAdmin").required(),
  });

  return schema.validate(user);
};

const validateUserPatch = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(3).optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    userRole: Joi.string().valid("candidate", "admin", "superAdmin").optional(),
    status: Joi.string()
      .valid("active", "inactive")
      .default("active")
      .optional(),
  });

  return schema.validate(user);
};

module.exports = {
  getMe,
  registerUser,
  loginUser,
  patchUser,
  getUsers,
  deleteUser,
  getUser,
};
