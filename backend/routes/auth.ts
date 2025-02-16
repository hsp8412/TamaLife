import {auth} from "./../middleware/auth";
import express from "express";
import {login, register, test} from "../repos/userRepos";

const router = express.Router();

router.post("/", login);
router.post("/register", register);
router.get("/test", auth, test);

export default router;
