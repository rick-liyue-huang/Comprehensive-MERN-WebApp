const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const NoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // user is typeof objectId(xxx)
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

NoteSchema.plugin(AutoIncrement, {
  inc_field: 'ticket',
  id: 'ticketNums',
  start_seq: 500,
});

const NoteModel = mongoose.model('Note', NoteSchema);

module.exports = { NoteModel };
