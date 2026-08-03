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
    email: {
      type: String,
      trim: true,
      default: "",
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
    jerseyNumber: {
      type: Number,
      min: [0, "Jersey number cannot be negative"],
    },
    registrationNumber: {
      type: Number,
    },
    jerseySize: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL", "XXXL", ""],
      trim: true,
    },
    jerseyName: {
      type: String,
      trim: true,
      maxlength: [30, "Jersey name cannot exceed 30 characters"],
    },
    photo: {
      type: String,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["free", "pending", "pending_verification", "completed", "verified", "rejected", "failed"],
      default: "free",
    },
    paymentDetails: {
      razorpayOrderId: { type: String, default: "" },
      razorpayPaymentId: { type: String, default: "" },
      razorpaySignature: { type: String, default: "" },
      utrLast4: { type: String, default: "" },
      paymentScreenshot: { type: String, default: "" },
      amountPaid: { type: Number, default: 0 },
      paidAt: { type: Date, default: null },
      verifiedAt: { type: Date, default: null },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
playerSchema.index({ createdBy: 1 });
playerSchema.index({ tournamentId: 1, createdBy: 1 });

export default mongoose.model("Player", playerSchema);
