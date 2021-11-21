const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const RoomController = require("./controllers/roomController")
const NoteController = require("./controllers/noteController")

var http = require('http').Server(app);
var port = process.env.PORT || 8080;
const password = process.env.DBPASSWORD || "none"
const uri = process.env.DBURL || `mongodb+srv://main:${password}@nosana.853l6.mongodb.net/StickyNote?retryWrites=true&w=majority`;

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('index.ejs')
})

app.get("/room/:id", (req, res) => {
    RoomController.find({room_id: req.params.id}, (message, roomFound) => {
        if (roomFound) {
            res.render('room.ejs', {room: roomFound})
        } else {
            RoomController.create({room_id: req.params.id}, (err, room) => {
                if (err) {
                    console.log(err);
                    res.render('room.ejs', {room: null})
                    return
                }

                res.render('room.ejs', {room: room})

            })
        }
    })
})

app.post("/update/note", (req, res) => {
    if (req.body.id) {
        const update = req.body.position ? { position: req.body.position.split(",") } : { text: req.body.text }
        NoteController.update({ id: req.body.id, update }, (err, noteId) => {
            if (err) {
                console.log(err);
                res.json({message: "Something went wrong while updating this note ❌", updated: false})
            } else {
                res.json({message: "Updated note ✔", updated: true})
            }
        })
    } else {
        res.json({message: "You need to send an id along with the update", updated: false})
    }
})

app.post("/create/note", (req, res) => {
    if (req.body && req.body.room_id && req.body.position) {
        NoteController.create({room_id: req.body.room_id, position: req.body.position.split(",")}, (err, note) => {
            if (err) {
                console.log(err);
                res.json({message: "Something went wrong while creating this note ❌", created: false, note: null})
            } else {
                res.json({message: "Created note ✔", created: true, note: note})
            }
        })
    } else {
        res.json({message: "Something didn't go right", created: false, note: null})
    }
})

app.post("/remove/note", (req, res) => {
    if (req.body && req.body.id && req.body.room_id) {
        NoteController.remove({ id: req.body.id, room_id: req.body.room_id }, (err, removed) => {
            if (err) {
                console.log(err);
                res.json({message: "Something went wrong while removing this note ❌", removed: removed})
            } else {
                res.json({message: "Removed note ✔", removed: removed})
            }
        })
    } else {
        res.json({message: "You need to provide the note id ℹ", removed: false})
    }
})

app.post("/remove/note/all", (req, res) => {
    if (req.body && req.body.room_id) {
        RoomController.removeAllNotes({ room_id: req.body.room_id }, (err, removed) => {
            if (err) {
                console.log(err);
                res.json({message: "Something went wrong while removing these notes ❌", removed: removed})
            } else {
                res.json({message: "Removed all notes ✔", removed: removed})
            }
        })
    } else {
        res.json({message: "You need to provide the note id ℹ", removed: false})
    }
})

app.get("/random", (req, res) => {
    RoomController.random((err, room) => {
        if (err) {
            console.log(err);
            res.json({message: "Something went wrong while removing these notes ❌", removed: removed})
        }else {
            res.redirect("/room/" + room.name)
        }
    })
})

mongoose.connect(uri, function(err, response){
    if(err){
        console.log('failed to connect to ' + uri);
        return
    }
    console.log('Connected to ' + uri);
    console.log('Server running on port: ' + port);
    http.listen(port);

});
