import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
    maxlength: [50, 'Team name cannot exceed 50 characters']
  },
  short: {
    type: String,
    required: [true, 'Team abbreviation is required'],
    trim: true,
    maxlength: [3, 'Team abbreviation cannot exceed 3 characters'],
    uppercase: true
  },
  players: {
    type: Number,
    default: 0,
    min: [0, 'Player count cannot be negative']
  },
  budget: {
    type: String,
    required: [true, 'Budget is required'],
    trim: true
  },
  maxPlayers: {
    type: Number,
    default: 18,
    min: [1, 'Max players must be at least 1']
  },
  totalBudget: {
    type: Number,
    required: [true, 'Total budget is required'],
    min: [0, 'Total budget cannot be negative']
  },
  remainingBudget: {
    type: Number,
    required: [true, 'Remaining budget is required'],
    min: [0, 'Remaining budget cannot be negative']
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Team', teamSchema);