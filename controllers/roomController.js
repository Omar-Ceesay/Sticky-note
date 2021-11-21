var Room = require('../models/room');
var Note = require('../models/stickyNote');

module.exports = {
    find: function(params, callback) {
        Room.aggregate([
            { "$match": { "name": params.room_id } },
            {
                "$lookup": {
                    "from": "notes",
                    "localField": "notes",
                    "foreignField": "_id",
                    "as": "notes"
                }
            }
        ]).exec((err, room) => {
            if (err) {
                console.log(err);
                return callback(new Error("Something went wrong 😢"), null)
            }
            if (room.length === 0) {
                return callback("Room doesn't exist", null)
            } else {
                return callback("Room found", room[0])
            }
        })
    },

    create: function(params, callback) {
        params.room_id = params.room_id.toString()
        Room.findOne({ name: params.room_id }, (err, room) => {
            if (err) {
                console.log(err);
                return callback(new Error("Something went wrong 😢"), false)
            }

            if (room) {
                return callback(new Error("Room already exists"), false)
            } else {
                const curTime = Date.now()
                
                let note = new Note()
                note.text = "Welcome to room " + params.room_id
                note.created_at = curTime
                note.room_id = params.room_id
                note.position = [0, 0]

                let room = new Room()
                room.name = params.room_id
                room.created_at = curTime
                room.notes = []

                // Add the default note
                note.save((err, noteCreated) => {
                    if (err) {
                        console.log(err);
                        return
                    }
                    room.notes = [noteCreated._id]
                    room.save((err, roomCreated) => {
                        if (err) {
                            console.log(err);
                            return
                        }
                        roomCreated.notes = [noteCreated] // instead of an agg
                        return callback(null, roomCreated)
                    })
                })
            }
        })
    },

    removeAllNotes: function(params, callback) {
        params.room_id = params.room_id.toString()

        Room.findOneAndUpdate({ name: params.room_id }, { notes: [] }, (err, room) => {
            if (err) {
                console.log(err);
                return callback(new Error("Something went wrong 😢"), false)
            }

            if (!room) {
                return callback(new Error("That room doesn't exist"), false)
            } else {
                Note.deleteMany({ room_id: params.room_id }, (err) => {
                    if (err) {
                        console.log(err);
                        return callback(new Error("Something went wrong deleting the notes 😢"), false)
                    }

                    return callback(null, true)
                })
            }
        })
    },

    random: function(callback) {
        Room.aggregate([{ $sample: { size: 1 } }]).exec((err, room) => {
            if (err) {
                return callback(new Error("Something went wrong 😢"), null)
            }

            callback(null, room[0])
        })
    }
}