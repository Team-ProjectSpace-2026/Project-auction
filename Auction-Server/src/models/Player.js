import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Player name is required"],
      trim: true,
      maxlength: [50, "Player name cannot exceed 50 characters"],
    },
    role: {
      type: String,
      required: [true, "Player role is required"],
      enum: ["Batsman", "Bowler", "All Rounder", "Wicket Keeper"],
    },
    style: {
      type: String,
      trim: true,
      maxlength: [100, "Playing style cannot exceed 100 characters"],
      default: "",
    },
    keeper: {
      type: Boolean,
      default: false,
    },
    basePrice: {
      type: Number,
      default: 0,
      min: [0, "Base price cannot be negative"],
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    soldPrice: {
      type: Number,
      default: null,
      min: [0, "Sold price cannot be negative"],
    },
    tournamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    // Registration fields (for public player registration)
    age: {
      type: Number,
      min: [10, "Age must be at least 10"],
      max: [60, "Age cannot exceed 60"],
    },
    mobile: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      default: "+91",
      trim: true,
    },
    battingStyle: {
      type: String,
      enum: ["Right Hand", "Left Hand", ""],
    },
    bowlingStyle: {
      type: String,
      enum: [
        "Right Arm Fast",
        "Right Arm Medium",
        "Right Arm Spin",
        "Left Arm Fast",
        "Left Arm Medium",
        "Left Arm Spin",
        "Not Applicable",
        "",
      ],
    },
    photo: {
      type: String,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes for common query patterns
playerSchema.index({ tournamentId: 1, deleted: 1 });
playerSchema.index({ tournamentId: 1, isSold: 1, deleted: 1 });
playerSchema.index({ mobile: 1, tournamentId: 1 }, { unique: true, partialFilterExpression: { deleted: false } });

export default mongoose.model("Player", playerSchema);
