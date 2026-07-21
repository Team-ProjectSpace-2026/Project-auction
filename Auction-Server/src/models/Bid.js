import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    required: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0, 'Bid amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['Active', 'Won', 'Outbid', 'Cancelled'],
    default: 'Active'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isWinningBid: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying
bidSchema.index({ tournamentId: 1, playerId: 1, status: 1, amount: -1, timestamp: 1 });
bidSchema.index({ tournamentId: 1, playerId: 1, createdAt: -1 });

const Bid = mongoose.model('Bid', bidSchema);

// Safe cleanup: drop legacy rigid unique index if present in MongoDB instance
Bid.collection.dropIndex('tournamentId_1_playerId_1').catch(() => {});

export default Bid;