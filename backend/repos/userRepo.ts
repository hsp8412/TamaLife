import {User, validateUser} from "../models/user.js";
import Joi from "joi";
import bcrypt from "bcryptjs";
const {hash, genSalt, compare} = bcrypt;
import _ from "lodash";

export const login = async (req, res) => {
  const {error} = validate(req.body);
  if (error) return res.status(400).json({error: error.details[0].message});

  let user = await User.findOne({email: req.body.email});
  if (!user) return res.status(400).json({error: "Invalid email or password."});

  if (!user.password)
    return res.status(400).json({error: "Invalid email or password."});

  const validPassword = await compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).json({error: "Invalid email or password."});

  const token = user.generateAuthToken();

  res.status(200).json({
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      petName: user.petName,
      healthPoints: user.healthPoints,
      mood: user.mood,
    },
  });
};

export const register = async (req, res) => {
  const {error} = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({email: req.body.email});
  if (user) return res.status(400).send("User already registered.");

  user = new User(
    _.pick(req.body, ["firstName", "lastName", "email", "password", "petName"])
  );
  const salt = await genSalt(10);
  user.password = await hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();

  return res.status(201).json({
    message: "Registration successful",
    token,
    user: _.pick(user, [
      "_id",
      "firstName",
      "lastName",
      "email",
      "petName",
      "healthPoints",
      "mood",
    ]),
  });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  return res.status(200).json({
    user: _.pick(user, [
      "_id",
      "firstName",
      "lastName",
      "email",
      "petName",
      "healthPoints",
      "mood",
    ]),
  });
};

function validate(req) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.object(schema).validate(req.body);
}

export const test = (req, res) => {
  return res.status(200).json({message: "Test route"});
};
