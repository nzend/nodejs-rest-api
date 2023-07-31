const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { HttpError, ctrlWrapper } = require("../helpers");
const { User } = require("../models/user");
const Joi = require("joi");
const gravatar = require("gravatar");
const path = require("path");
const fs = require("fs/promises");
const Jimp = require("jimp");

// const emailRegexp = new RegExp("/^[^s@]+@[^s@]+.[^s@]+$/");

const { SECRET_KEY } = process.env;
const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw HttpError(409, "Email already in use");
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
  });

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
  });
};
const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password invalid");
  }
  const payload = { id: user.id };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });

  res.status(201).json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
};
const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  res.status(200).json({ email, subscription });
};
const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: "" });
  res.status(204).json();
};
const updateSubscription = async (req, res) => {
  const user = req.user;
  const { subscription } = req.body;

  await User.findByIdAndUpdate(
    user._id,
    { subscription },
    { runValidators: true }
  );
  res.status(200).json({ subscription });
};
const updateAvatar = async (req, res) => {
  const { _id } = req.user;

  const { path: tempUpload, originalname } = req.file;

  Jimp.read(tempUpload, (error, image) => {
    if (error) throw HttpError(404, "Not found");
    console.log(avatarsDir);
    image.resize(250, 250).write(`${avatarsDir}/${_id}_${originalname}`);
  });

  const fileName = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, fileName);
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", fileName);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.json({ avatarURL });
};

module.exports = {
  register: ctrlWrapper(register),
  login: ctrlWrapper(login),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
  updateSubscription: ctrlWrapper(updateSubscription),
  updateAvatar: ctrlWrapper(updateAvatar),
};
