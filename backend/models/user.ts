import Joi from "joi";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

interface IUserDocument extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  petName: string;
  healthPoints: number;
  mood: "happy" | "sad" | "neutral";
  generateAuthToken(): string;
}

const userSchema = new mongoose.Schema<IUserDocument>({
  firstName: {
    type: String,
    required: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  petName: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
  },
  healthPoints: {
    type: Number,
    default: 100,
  },
  mood: {
    type: String,
    enum: ["happy", "sad", "neutral"],
    default: "neutral",
  },
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      role: "user",
    },
    process.env.JWT_PRIVATE_KEY || "this is a secret key"
  );
  return token;
};

export const User = mongoose.model("users", userSchema);

export function validateUser(user) {
  const schema = Joi.object({
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
    petName: Joi.string().min(1).max(255).required(),
  });
  return schema.validate(user);
}
