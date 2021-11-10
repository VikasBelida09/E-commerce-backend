const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
router.get("/", async (req, res) => {
  const userList = await User.find().select(["-passwordHash"]);
  if (!userList) return res.status(500).send("Server Error");
  res.send(userList);
});
router.get("/:id", async (req, res) => {
  console.log(req.params.id);
  const user = await User.findById(req.params.id).select(["-passwordHash"]);
  if (!user) return res.status(400).send("User not found");
  res.send(user);
});
router.post("/register", async (req, res) => {
  const {
    name,
    email,
    phone,
    city,
    street,
    apartment,
    password,
    zip,
    country,
    isAdmin,
  } = req.body;
  const user = new User({
    name,
    email,
    phone,
    city,
    street,
    apartment,
    passwordHash: bcrypt.hashSync(password, 10),
    zip,
    country,
    isAdmin,
  });
  const result = await user.save();
  if (!result) return res.status(404).json({ success: false });
  return res.send(result);
});
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User not found");
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.send({ user: user.email, token: token });
  }
  return res.status(400).send("Invalid password");
});

router.get("/get/count", async (req, res) => {
  const count = await User.countDocuments();
  if (!count) return res.status(500).send("Server Error");
  res.send({ count });
});

router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).send("Invalid id");
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user)
        return res.status(200).json({ success: true, message: "User deleted" });
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, message: "Server error" });
    });
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ success: false, message: "invalid user id" });
  const user = await User.findById(req.params.id);
  let newPassword = !!req.body.password
    ? bcrypt.hashSync(req.body.password, 10)
    : user.passwordHash;
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );
  if (!updatedUser) return res.status(400).send("User not found");
  return res.send(updatedUser);
});
module.exports = router;
