import db from "#db/client";
import { faker } from "@faker-js/faker";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  // --- Clear existing data ---
  await db.query(`DELETE FROM playlists_tracks`);
  await db.query(`DELETE FROM playlists`);
  await db.query(`DELETE FROM tracks`);

  // --- Seed 20 Tracks ---
  const trackValues = [];
  for (let i = 0; i < 20; i++) {
    const name = faker.music.songName().replace(/'/g, "''"); // escape single quotes
    const duration = faker.number.int({ min: 120000, max: 300000 }); // 2–5 min in ms
    trackValues.push(`('${name}', ${duration})`);
  }
  await db.query(
    `INSERT INTO tracks(name, duration_ms) VALUES ${trackValues.join(",")}`
  );

  // --- Seed 10 Playlists ---
  const playlistValues = [];
  for (let i = 0; i < 10; i++) {
    const name = faker.music.genre() + " Playlist";
    const description = faker.lorem.sentence().replace(/'/g, "''");
    playlistValues.push(`('${name}', '${description}')`);
  }
  await db.query(
    `INSERT INTO playlists(name, description) VALUES ${playlistValues.join(
      ","
    )}`
  );

  // --- Seed 15 Playlist-Track links ---
  const playlistTracks = [];
  for (let i = 0; i < 15; i++) {
    const playlist_id = (i % 10) + 1; // 1–10
    const track_id = (i % 20) + 1; // 1–20
    playlistTracks.push(`(${playlist_id}, ${track_id})`);
  }
  await db.query(
    `INSERT INTO playlists_tracks(playlist_id, track_id) VALUES ${playlistTracks.join(
      ","
    )}`
  );
}
