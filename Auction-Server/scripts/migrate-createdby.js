import mongoose from "mongoose";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const teamSchema = new mongoose.Schema({}, { strict: false });
const playerSchema = new mongoose.Schema({}, { strict: false });
const tournamentSchema = new mongoose.Schema({}, { strict: false });

const Team = mongoose.model("Team", teamSchema);
const Player = mongoose.model("Player", playerSchema);
const Tournament = mongoose.model("Tournament", tournamentSchema);

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const tournaments = await Tournament.find({}).select("_id owner");
    const tournamentOwnerMap = {};
    for (const t of tournaments) {
      tournamentOwnerMap[t._id.toString()] = t.owner;
    }
    console.log(`Found ${tournaments.length} tournaments`);

    const teams = await Team.find({ createdBy: { $exists: false } });
    let teamsUpdated = 0;
    for (const team of teams) {
      const ownerId = tournamentOwnerMap[team.tournamentId.toString()];
      if (ownerId) {
        await Team.updateOne({ _id: team._id }, { $set: { createdBy: ownerId } });
        teamsUpdated++;
      }
    }
    console.log(`Updated ${teamsUpdated} teams`);

    const players = await Player.find({ createdBy: { $exists: false } });
    let playersUpdated = 0;
    for (const player of players) {
      const ownerId = tournamentOwnerMap[player.tournamentId.toString()];
      if (ownerId) {
        await Player.updateOne({ _id: player._id }, { $set: { createdBy: ownerId } });
        playersUpdated++;
      }
    }
    console.log(`Updated ${playersUpdated} players`);

    console.log("Migration complete");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
  }
}

migrate();
