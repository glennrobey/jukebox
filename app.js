import express from "express";
import tracksRouter from "./routes/tracks.js";
import playlistsRouter from "./routes/playlists.js";

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Route handlers
app.use("/tracks", tracksRouter);
app.use("/playlists", playlistsRouter); // ✅ register playlists routes

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
