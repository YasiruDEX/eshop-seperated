import express, { Router } from "express";
import { saveProfile, getProfile } from "../controller/profile.controller";

const router: Router = express.Router();

router.post("/profiles", saveProfile);
router.get("/profiles/:userId", getProfile);

export default router;
