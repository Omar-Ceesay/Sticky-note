var mongoose = require('mongoose');

var roomSchema = mongoose.Schema({
    name: String,
    created_at: Date,
    notes: Array,
});

module.exports = mongoose.model('Room', roomSchema);