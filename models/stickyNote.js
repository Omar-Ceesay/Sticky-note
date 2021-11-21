var mongoose = require('mongoose');

var noteSchema = mongoose.Schema({
    text: String,
    created_at: Date,
    room_id: String,
    position: [Number, Number]
});

module.exports = mongoose.model('Note', noteSchema);