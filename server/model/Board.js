import mongoose from 'mongoose';

const boardSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  pins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pin'
  }]
});

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pin'
  }],
  isSecret: {
    type: Boolean,
    default: false
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sections: [boardSectionSchema]
}, {
  timestamps: true
});

const Board = mongoose.model('Board', boardSchema);
export default Board;
