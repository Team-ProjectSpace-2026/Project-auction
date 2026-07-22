import mongoose from 'mongoose';

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tournament name is required'],
    trim: true,
    maxlength: [100, 'Tournament name cannot exceed 100 characters']
  },
  status: {
    type: String,
    enum: ['Active', 'Upcoming', 'Completed'],
    default: 'Upcoming'
  },
  date: {
    type: Date,
    required: [true, 'Tournament date is required']
  },
  teams: {
    type: Number,
    required: [true, 'Number of teams is required'],
    min: [1, 'At least one team is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue is required'],
    trim: true,
    maxlength: [200, 'Venue cannot exceed 200 characters']
  },
  budgetPerTeam: {
    type: Number,
    required: [true, 'Budget per team is required'],
    min: [0, 'Budget per team cannot be negative']
  },
  maxPlayersPerTeam: {
    type: Number,
    required: [true, 'Maximum players per team is required'],
    min: [1, 'At least 1 player per team is required']
  },
  playerBasePrice: {
    type: Number,
    required: [true, 'Player base price is required'],
    min: [0, 'Player base price cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  currentPlayerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player',
    default: null
  },
  auctionStatus: {
    type: String,
    enum: ['idle', 'bidding', 'sold', 'unsold'],
    default: 'idle'
  },
  unsoldPlayerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Player'
  }],
  registrationEndDate: {
    type: Date,
    default: null
  },
  logo: {
    type: String,
    default: ''
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  registrationFee: {
    type: Number,
    default: 0,
    min: [0, 'Registration fee cannot be negative']
  },
  payoutUpiId: {
    type: String,
    trim: true,
    default: ''
  },
  currency: {
    type: String,
    default: 'INR'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Tournament owner is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Tournament', tournamentSchema);