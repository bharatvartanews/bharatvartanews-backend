import express from "express";
import {
  getHoroscopeByDob,
  getAllRashiGeneral,
  getByRashi
} from "../controllers/astrology.controller";

const router = express.Router();

router.post("/by-dob", getHoroscopeByDob);
router.get("/all", getAllRashiGeneral);
router.get("/:rashi", getByRashi);

export default router;
