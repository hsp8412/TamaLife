import {auth} from "./../middleware/auth";
import express from "express";
import {login, register, test} from "../repos/userRepo";
import { getStates } from "../repos/stateRepo";

const router = express.Router();

router.get("/", getStates);

export default router;
