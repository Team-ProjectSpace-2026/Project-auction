import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Player name is required'],
    trim: true,
    maxlength: [50, 'Player name cannot exceed 50 characters']
  },
  role: {
    type: String,
    required: [true, 'Player role is required'],
    enum: ['Batsman', 'Bowler', 'All Rounder', 'Wicket Keeper'],
  },
  style: {
    type: String,
    required: [true, 'Playing style is required'],
    trim: true,
    maxlength: [100, 'Playing style cannot exceed 100 characters']
  },
  keeper: {
    type: Boolean,
    default: false
  },
  basePrice: {
    type: Number,
    default: 0,
    min: [0, 'Base price cannot be negative']
  },
  isSold: {
    type: Boolean,
    default: false
  },
  soldTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },
  soldPrice: {
    type: Number,
    default: null,
    min: [0, 'Sold price cannot be negative']
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Player', playerSchema);