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
    type: String,
    required: [true, 'Number of teams is required'],
    trim: true
  },
  format: {
    type: String,
    required: [true, 'Tournament format is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

export default mongoose.model('Tournament', tournamentSchema);