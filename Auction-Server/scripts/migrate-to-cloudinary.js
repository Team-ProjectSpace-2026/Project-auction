import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.join(__dirname, "../.env") });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB\n");

// Import models
const Player = (await import("../src/models/Player.js")).default;
const Tournament = (await import("../src/models/Tournament.js")).default;

const UPLOADS_DIR = path.join(__dirname, "../uploads/photos");

async function migrateExistingPhotos() {
  console.log("=== Starting photo migration to Cloudinary ===\n");

  // 1. Upload all local files to Cloudinary
  const files = await fs.readdir(UPLOADS_DIR);
  const urlMap = {}; // old filename -> new Cloudinary URL

  for (const file of files) {
    const filePath = path.join(UPLOADS_DIR, file);
    console.log(`Uploading: ${file}`);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "cricauction/players",
      public_id: file.split(".")[0], // keep original ID part
    });

    urlMap[file] = result.secure_url;
    console.log(`  -> ${result.secure_url}`);
  }

  console.log(`\nUploaded ${Object.keys(urlMap).length} files to Cloudinary.\n`);

  // 2. Update Player.photo fields (stores just filename)
  const players = await Player.find({ photo: { $ne: null, $ne: "" } });
  console.log(`Updating ${players.length} player photos in DB...`);

  for (const player of players) {
    const newUrl = urlMap[player.photo];
    if (newUrl) {
      await Player.findByIdAndUpdate(player._id, { photo: newUrl });
      console.log(`  [OK] ${player.name}: ${player.photo} -> ${newUrl}`);
    } else {
      console.log(`  [SKIP] ${player.name} - photo "${player.photo}" not found in uploads`);
    }
  }

  // 3. Update Tournament.logo fields (stores /uploads/photos/filename)
  const tournaments = await Tournament.find({ logo: { $ne: null, $ne: "" } });
  console.log(`\nUpdating ${tournaments.length} tournament logos in DB...`);

  for (const tournament of tournaments) {
    // Extract filename from /uploads/photos/filename or full URL
    const filename = tournament.logo.split("/").pop();
    const newUrl = urlMap[filename];
    if (newUrl) {
      await Tournament.findByIdAndUpdate(tournament._id, { logo: newUrl });
      console.log(`  [OK] ${tournament.name}: ${tournament.logo} -> ${newUrl}`);
    } else {
      console.log(`  [SKIP] ${tournament.name} - logo "${tournament.logo}" not found in uploads`);
    }
  }

  console.log("\n=== Migration complete ===");
  console.log("Verify records in MongoDB, then you can delete uploads/photos/");
}

migrateExistingPhotos()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
