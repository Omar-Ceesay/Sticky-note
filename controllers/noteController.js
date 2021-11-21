var Room = require('../models/room');
var Note = require('../models/stickyNote');

const mongoose = require('mongoose');

module.exports = {
    update: function(params, callback) {
        Note.updateOne({_id: params.id}, params.update, (err, noteId) => {
            if (err) {
                return callback(err, null)
            }
            if (noteId) {
                return callback(null, noteId)
            } else {
                return callback(new Error("Couldn't update the note for some reason..."), null)
            }
        })
    },

    create: function(params, callback) {
        let note = new Note()

        params.room_id = params.room_id.toString()
        note.position = params.position
        note.room_id = params.room_id
        note.created_at = Date.now()
        note.text = "New note 📝"

        // translate(340.781px, 117px)
        note.save((err, note) => {
            if (err) {
                return callback(err, null)
            } else {
                Room.updateOne({name: note.room_id}, { $push: { notes: note._id } }, (err) => {
                    // we really can't have this happen
                    if (err) throw err
                })
                return callback(null, note)
            }
        })
    },

    remove: function(params, callback) {
        params.room_id = params.room_id.toString()
        Note.deleteOne({ _id: params.id }, (err) => {
            if (err) {
                return callback(err, false)
            } else {
                Room.updateOne({ name: params.room_id }, { $pull: { notes: mongoose.Types.ObjectId(params.id) } }, (err) => {
                    if (err) {
                        return callback(err, false)
                    }
                    return callback(null, true)
                })
            }
        })
    }
}