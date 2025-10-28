import express from "express";
import db from "#db/client";

const router = express.Router();

// GET /tracks - All Tracks
router.get("/", async (req, res, next) => {
  try {
    const { rows: tracks } = await db.query("SELECT * FROM tracks");
    res.json(tracks);
  } catch (err) {
    next(err);
  }
});

// GET /tracks/:id - Single Track
router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID must be a number" });
  }

  try {
    const { rows } = await db.query("SELECT * FROM tracks WHERE id = $1", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Track not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
