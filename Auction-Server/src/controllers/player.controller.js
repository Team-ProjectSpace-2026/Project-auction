import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Player from "../models/Player.js";
import Tournament from "../models/Tournament.js";
import Bid from "../models/Bid.js";
import { sendPlayerRegistrationEmail } from "../services/email.service.js";
import { getCashfreeConfig } from "../config/cashfree.js";

export const getPlayers = async (req, res, next) => {
  try {
    // Sanitize tournamentId — ObjectId validates format, throws on invalid
    const tournamentId = req.query.tournamentId
      ? new mongoose.Types.ObjectId(req.query.tournamentId)
      : undefined;

    // Sanitize role — whitelist lookup returns value from constant array, not user input
    const allowedRoles = ["Batsman", "Bowler", "All Rounder", "Wicket Keeper"];
    const roleIdx = allowedRoles.indexOf(String(req.query.role));
    const validRole = roleIdx >= 0 ? allowedRoles[roleIdx] : undefined;

    // Sanitize search — escape regex metacharacters to prevent injection
    const safeSearch = req.query.search
      ? String(req.query.search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      : "";

    // Build filter: include admin-created players OR registered players for the same tournament
    const filter = {
      deleted: false,
      $or: [
        { createdBy: req.user._id },
        { isRegistered: true },
      ],
    };

    if (tournamentId) {
      filter.tournamentId = tournamentId;
    } else {
      // Without tournamentId scope, only show own players for safety
      filter.$or = [{ createdBy: req.user._id }];
    }

    if (safeSearch) {
      filter.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { mobile: { $regex: safeSearch, $options: "i" } },
      ];
    }

    if (validRole) {
      filter.role = validRole;
    }

    const players = await Player.find(filter).populate("tournamentId", "name");
    res.json(players);
  } catch (error) {
    next(error);
  }
};

export const createPlayer = async (req, res, next) => {
  try {
    const name = String(req.body.name || req.body.playerName || "").trim();
    const role = String(req.body.role || req.body.primaryRole || "").trim();
    let style = String(req.body.style || "").trim();
    const battingStyle = String(req.body.battingStyle || "").trim();
    const bowlingStyle = String(req.body.bowlingStyle || "").trim();

    // Derive style from batting/bowling if not provided
    if (!style && battingStyle) {
      style = bowlingStyle && bowlingStyle !== "Not Applicable"
        ? `${battingStyle} Bat, ${bowlingStyle}`
        : `${battingStyle} Bat`;
    }

    const keeper = req.body.keeper === "true" || req.body.keeper === true || req.body.isKeeper === "Yes";
    const basePrice = Number(req.body.basePrice) || 0;
    const tournamentId = String(req.body.tournamentId || "");
    const jerseyNumber = req.body.jerseyNumber ? Number(req.body.jerseyNumber) : undefined;
    const jerseySize = String(req.body.jerseySize || "").trim() || undefined;
    const jerseyName = String(req.body.jerseyName || "").trim() || undefined;
    const age = req.body.age ? Number(req.body.age) : undefined;
    const mobile = String(req.body.mobile || "").trim() || undefined;
    const email = String(req.body.email || "").trim().toLowerCase() || undefined;

    let photoUrl = req.body.photo || "";
    if (req.file) {
      photoUrl = req.file.path;
    }

    const currentCount = await Player.countDocuments({
      tournamentId,
      deleted: false,
    });
    const registrationNumber = currentCount + 1;

    // Check if tournament is paid to record cash payment
    const tournament = await Tournament.findById(tournamentId);
    let paymentStatus = "free";
    let paymentDetails = {
      paymentCode: "",
      utrNumber: "",
      paymentScreenshot: "",
      amountPaid: 0,
      paidAt: null,
      verifiedAt: null,
      verifiedBy: null,
    };

    if (tournament && tournament.isPaid && tournament.registrationFee > 0) {
      paymentStatus = "verified";
      paymentDetails = {
        paymentCode: "CASH",
        utrNumber: "CASH_PAYMENT",
        paymentScreenshot: "",
        amountPaid: tournament.registrationFee,
        paidAt: new Date(),
        verifiedAt: new Date(),
        verifiedBy: req.user._id,
      };
    }

    const player = new Player({
      name,
      role,
      style,
      battingStyle,
      bowlingStyle,
      keeper,
      basePrice,
      tournamentId,
      jerseyNumber: jerseyNumber || registrationNumber,
      registrationNumber,
      jerseySize,
      jerseyName,
      age,
      mobile,
      email,
      photo: photoUrl,
      paymentStatus,
      paymentDetails,
      isRegistered: false,
      createdBy: req.user._id,
    });
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    next(error);
  }
};

export const getPlayer = async (req, res, next) => {
  try {
    const playerId = new mongoose.Types.ObjectId(req.params.id);
    const player = await Player.findById(playerId).populate('tournamentId', 'name').populate('soldTo', 'name short logo primaryColor');
    if (!player || player.deleted) {
      return res.status(404).json({ message: 'Player not found' });
    }

    if (player.createdBy && player.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(player);
  } catch (error) {
    next(error);
  }
};

export const updatePlayer = async (req, res, next) => {
  try {
    const playerId = new mongoose.Types.ObjectId(req.params.id);
    const player = await Player.findById(playerId);

    if (!player || player.deleted) {
      return res.status(404).json({ message: 'Player not found' });
    }

    if (player.createdBy && player.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {};

    if (req.body.name !== undefined || req.body.playerName !== undefined) updateData.name = String(req.body.name || req.body.playerName || "").trim();
    if (req.body.role !== undefined || req.body.primaryRole !== undefined) updateData.role = String(req.body.role || req.body.primaryRole || "").trim();
    if (req.body.style !== undefined) updateData.style = String(req.body.style);
    if (req.body.keeper !== undefined || req.body.isKeeper !== undefined) {
      updateData.keeper = req.body.keeper === "true" || req.body.keeper === true || req.body.isKeeper === "Yes";
    }
    if (req.body.basePrice !== undefined) updateData.basePrice = Number(req.body.basePrice) || 0;
    if (req.body.age !== undefined) updateData.age = Number(req.body.age) || undefined;
    if (req.body.mobile !== undefined) updateData.mobile = String(req.body.mobile);
    if (req.body.countryCode !== undefined) updateData.countryCode = String(req.body.countryCode);
    if (req.body.battingStyle !== undefined) updateData.battingStyle = String(req.body.battingStyle);
    if (req.body.bowlingStyle !== undefined) updateData.bowlingStyle = String(req.body.bowlingStyle);
    if (req.body.jerseyNumber !== undefined) updateData.jerseyNumber = req.body.jerseyNumber ? Number(req.body.jerseyNumber) : undefined;
    if (req.body.jerseySize !== undefined) updateData.jerseySize = String(req.body.jerseySize) || undefined;
    if (req.body.jerseyName !== undefined) updateData.jerseyName = String(req.body.jerseyName) || undefined;

    if (req.file) {
      if (player.photo) {
        try {
          const photoUrl = new URL(player.photo);
          if (photoUrl.hostname.endsWith(".cloudinary.com")) {
            const parts = photoUrl.pathname.split("/");
            const publicId = parts.slice(parts.indexOf("upload") + 1, -1).join("/");
            await cloudinary.uploader.destroy(publicId).catch(() => {});
          }
        } catch {
          // Not a valid URL, skip deletion
        }
      }
      updateData.photo = req.file.path;
    }

    const updatedPlayer = await Player.findByIdAndUpdate(
      playerId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json(updatedPlayer);
  } catch (error) {
    next(error);
  }
};

export const deletePlayer = async (req, res, next) => {
  try {
    const playerId = new mongoose.Types.ObjectId(req.params.id);
    const player = await Player.findById(playerId);

    if (!player || player.deleted) {
      return res.status(404).json({ message: 'Player not found' });
    }

    if (player.createdBy && player.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    player.deleted = true;
    await player.save();

    await Bid.updateMany(
      { playerId: player._id, status: "Active" },
      { $set: { status: "Cancelled" } }
    );

    res.json({ message: 'Player deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPublicTournament = async (req, res, next) => {
  try {
    const tournamentId = req.params.tournamentId;

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid tournament ID format' });
    }

    const tournament = await Tournament.findById(tournamentId).select('name registrationEndDate isPaid registrationFee currency payoutUpiId logo venue date');
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    next(error);
  }
};

export const initiatePlayerRegistration = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;
    const { mobile } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid tournament ID format' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.registrationEndDate && new Date() > new Date(tournament.registrationEndDate)) {
      return res.status(403).json({ message: 'Registration deadline has passed' });
    }

    if (mobile) {
      const existing = await Player.findOne({ mobile, tournamentId, deleted: false });
      if (existing) {
        return res.status(409).json({ message: 'This mobile number is already registered for this tournament' });
      }
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const paymentCode = `PAY-${randomSuffix}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes reservation

    res.json({
      success: true,
      paymentCode,
      expiresAt,
      tournamentFee: tournament.registrationFee || 0,
      isPaid: tournament.isPaid && (tournament.registrationFee > 0),
      organizerUpiId: tournament.payoutUpiId || "",
      organizerUpiName: tournament.payoutUpiName || tournament.name || "Tournament Organizer"
    });
  } catch (error) {
    next(error);
  }
};

export const registerPlayer = async (req, res, next) => {
  try {
    const tournamentId = req.params.tournamentId;

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid tournament ID format' });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check registration deadline
    if (tournament.registrationEndDate && new Date() > new Date(tournament.registrationEndDate)) {
      return res.status(403).json({ message: 'Registration deadline has passed' });
    }

    const playerName = String(req.body.playerName || "").trim();
    const age = Number(req.body.age) || 0;
    const mobile = String(req.body.mobile || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const countryCode = String(req.body.countryCode || "+91").trim();
    const primaryRole = String(req.body.primaryRole || "").trim();
    const battingStyle = String(req.body.battingStyle || "").trim();
    const bowlingStyle = String(req.body.bowlingStyle || "").trim();
    const isKeeper = String(req.body.isKeeper || "").trim();
    const jerseyNumber = req.body.jerseyNumber ? Number(req.body.jerseyNumber) : undefined;
    const jerseySize = String(req.body.jerseySize || "").trim();
    const jerseyName = String(req.body.jerseyName || "").trim();

    // Email is required for confirmation
    if (!email) {
      return res.status(400).json({ message: 'Email address is required for registration confirmation' });
    }

    const existing = await Player.findOne({ mobile, tournamentId, deleted: false });
    if (existing) {
      return res.status(409).json({ message: 'This mobile number is already registered for this tournament' });
    }

    // Reservation timer validation
    const reservedAt = req.body.reservedAt ? new Date(req.body.reservedAt) : new Date();
    const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : new Date(Date.now() + 5 * 60 * 1000);
    
    if (Date.now() > new Date(expiresAt).getTime()) {
      return res.status(408).json({ message: 'Registration session expired (5-minute limit exceeded). Please try again.' });
    }

    // Payment status tracking if tournament is paid
    let paymentStatus = 'free';
    let paymentDetailsObj = {};

    if (tournament.isPaid && tournament.registrationFee > 0) {
      const utrNumber = String(req.body.utrNumber || req.body.utrLast4 || "").trim();
      const paymentCode = String(req.body.paymentCode || "").trim();

      if (!utrNumber || !/^\d{12}$/.test(utrNumber)) {
        return res.status(400).json({ message: 'Valid 12-digit numeric UPI UTR / Transaction ID is required for payment verification' });
      }

      // 1. Check duplicate UTR
      const duplicateUtr = await Player.findOne({
        "paymentDetails.utrNumber": utrNumber,
        deleted: false
      });
      if (duplicateUtr) {
        return res.status(409).json({ message: 'This UTR / Transaction ID has already been submitted for another registration' });
      }

      let screenshotUrl = "";
      let imageHash = "";

      if (req.files && req.files.paymentScreenshot && req.files.paymentScreenshot.length > 0) {
        const fileObj = req.files.paymentScreenshot[0];
        screenshotUrl = fileObj.path || "";
        // Hash screenshot path or filename to prevent re-uploading identical file
        const hashSeed = fileObj.path || fileObj.filename || fileObj.originalname;
        if (hashSeed) {
          const crypto = await import('crypto');
          imageHash = crypto.createHash('sha256').update(hashSeed).digest('hex');
          
          // 2. Check duplicate image hash
          const duplicateHash = await Player.findOne({
            "paymentDetails.imageHash": imageHash,
            deleted: false
          });
          if (duplicateHash) {
            return res.status(409).json({ message: 'This payment screenshot image has already been submitted for another registration' });
          }
        }
      }

      paymentStatus = 'pending_verification';
      paymentDetailsObj = {
        paymentCode: paymentCode || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
        utrNumber,
        utrLast4: utrNumber.slice(-4),
        paymentScreenshot: screenshotUrl || "",
        imageHash: imageHash || "",
        amountPaid: Number(tournament.registrationFee) || 0,
        paidAt: new Date(),
        reservedAt,
        expiresAt
      };
    }

    // Calculate sequential registration number for this tournament
    const currentRegisteredCount = await Player.countDocuments({
      tournamentId,
      deleted: false,
    });
    const registrationNumber = currentRegisteredCount + 1;

    let photoUrl = null;
    if (req.files && req.files.photo && req.files.photo.length > 0) {
      photoUrl = req.files.photo[0].path;
    } else if (req.file) {
      photoUrl = req.file.path;
    }

    const player = new Player({
      name: playerName,
      role: primaryRole,
      style: battingStyle,
      keeper: isKeeper === 'Yes',
      age: Number(age),
      mobile,
      email,
      countryCode: countryCode || '+91',
      battingStyle,
      bowlingStyle,
      jerseyNumber: jerseyNumber || registrationNumber,
      registrationNumber,
      jerseySize: jerseySize || undefined,
      jerseyName: jerseyName || undefined,
      photo: photoUrl,
      tournamentId,
      isRegistered: true,
      paymentStatus,
      paymentDetails: paymentDetailsObj,
      basePrice: tournament.playerBasePrice || 0,
    });

    await player.save();

    // Trigger automated registration confirmation email in background
    console.log(`📧 Sending registration confirmation email to: ${email}`);
    sendPlayerRegistrationEmail({ player, tournament }).catch((err) =>
      console.error("Error sending registration email:", err)
    );

    res.status(201).json({ message: 'Registration successful', player });
  } catch (error) {
    next(error);
  }
};

export const getRegisteredPlayers = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
      return res.status(400).json({ message: 'Invalid tournament ID format' });
    }

    const players = await Player.find({
      tournamentId,
      isRegistered: true,
      deleted: false,
    })
      .select("name role style battingStyle bowlingStyle keeper isRegistered jerseyNumber registrationNumber jerseySize jerseyName age mobile photo basePrice isSold soldTo soldPrice paymentStatus paymentDetails")
      .populate("tournamentId", "name");

    res.json(players);
  } catch (error) {
    next(error);
  }
};

export const verifyPlayerPayment = async (req, res, next) => {
  try {
    const { playerId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(playerId)) {
      return res.status(400).json({ message: 'Invalid player ID format' });
    }

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be verified or rejected' });
    }

    const player = await Player.findById(playerId);
    if (!player || player.deleted) {
      return res.status(404).json({ message: 'Player not found' });
    }

    const tournament = await Tournament.findById(player.tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (
      tournament.owner.toString() !== req.user._id.toString() &&
      (!tournament.createdBy || tournament.createdBy.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied. Only the tournament owner can verify payments.' });
    }

    player.paymentStatus = status;
    if (!player.paymentDetails) {
      player.paymentDetails = {};
    }
    player.paymentDetails.verifiedAt = new Date();
    player.paymentDetails.verifiedBy = req.user._id;

    await player.save();
    res.json({ success: true, message: `Player payment ${status} successfully`, player });
  } catch (error) {
    next(error);
  }
};
