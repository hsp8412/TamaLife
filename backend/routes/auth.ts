import {auth} from "./../middleware/auth";
import express from "express";
import {getMe, login, register, test} from "../repos/userRepo";

const router = express.Router();

router.post("/", login);
router.post("/register", register);
router.get("/test", auth, test);
router.get("/me", auth, getMe);

export default router;
