import express from "express";
import db from "#db/client";

const router = express.Router();

// GET /playlists - All Playlists
router.get("/", async (req, res, next) => {
  try {
    const { rows: playlists } = await db.query("SELECT * FROM playlists");
    res.json(playlists);
  } catch (err) {
    next(err);
  }
});

// POST /playlists - Create Empty New Playlist
router.post("/", async (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({ error: "Missing request body" });
  }

  const { name, description } = req.body;
  if (!name || !description) {
    return res.status(400).json({ error: "Name and description are required" });
  }

  try {
    const { rows } = await db.query(
      "INSERT INTO playlists(name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /playlists/:id - Get A Single Playlist
router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID must be a number" });
  }

  try {
    const { rows } = await db.query("SELECT * FROM playlists WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET playlists/:id/tracks - Get All Tracks In A Playlist
router.get("/:id/tracks", async (req, res, next) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "ID must be a number" });
  }

  try {
    // check playlist exists
    const playlistCheck = await db.query(
      "SELECT * FROM playlists WHERE id = $1",
      [id]
    );
    if (playlistCheck.rowCount === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const { rows: tracks } = await db.query(
      `SELECT tracks.*
       FROM tracks
       JOIN playlists_tracks ON tracks.id = playlists_tracks.track_id
       WHERE playlists_tracks.playlist_id = $1`,
      [id]
    );
    res.json(tracks);
  } catch (err) {
    next(err);
  }
});

// POST /playlists/:id/tracks - Add A Track To A Playlist
router.post("/:id/tracks", async (req, res, next) => {
  const playlistId = Number(req.params.id);
  if (isNaN(playlistId)) {
    return res.status(400).json({ error: "ID must be a number" });
  }

  if (!req.body) {
    return res.status(400).json({ error: "Missing request body" });
  }

  const trackId = Number(req.body.trackId);
  if (isNaN(trackId)) {
    return res.status(400).json({ error: "trackId must be a number" });
  }

  try {
    // check playlist exists
    const playlistCheck = await db.query(
      "SELECT * FROM playlists WHERE id = $1",
      [playlistId]
    );
    if (playlistCheck.rowCount === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // check track exists
    const trackCheck = await db.query("SELECT * FROM tracks WHERE id = $1", [
      trackId,
    ]);
    if (trackCheck.rowCount === 0) {
      return res.status(400).json({ error: "Track not found" });
    }

    const { rows } = await db.query(
      `INSERT INTO playlists_tracks(playlist_id, track_id)
       VALUES ($1, $2)
       ON CONFLICT (playlist_id, track_id) DO NOTHING
       RETURNING *`,
      [playlistId, trackId]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Track is already in playlist" });
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
