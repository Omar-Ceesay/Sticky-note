setTimeout(() => {
  M.toast({html: 'Try double clicking the board to add a sticky note! 📝'})
}, 3000)

// helper functions
function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
}

function addListensToChildrenOfRoom() {
    const array = document.getElementsByClassName("draggable")
    for (let i = 0; i < array.length; i++) {
        const element = array[i];
        element.addEventListener('dblclick', function (e) {
            e.stopPropagation();
        });
    }
}

// Remove all notes
document.getElementById("remove-all").addEventListener("click", (e) => {
    e.preventDefault()
    fetch("/remove/note/all", {
        method: "POST",
        // Having a JSON parsing error with the bodyparser middleware so I use the URL encoded version. 
        body: new URLSearchParams({
            room_id: document.getElementById("room").getAttribute("name")
        })
        })
        .then(res => {
            return res.json()
        })
        .then(data => {
            if (data.removed) {
                let node = document.getElementById("room")

                while (node.firstChild) {
                    node.removeChild(node.lastChild);
                }
            }
    });
})

function initDeleteBtn(btn) {
    btn.addEventListener("click", function(e) {
        const noteId = e.target.getAttribute("name")
        document.getElementById(noteId).remove()

        fetch("/remove/note", {
            method: "POST",
            // Having a JSON parsing error with the bodyparser middleware so I use the URL encoded version. 
            body: new URLSearchParams({
                id: noteId,
                room_id: document.getElementById("room").getAttribute("name")
            })
            })
            .then(res => {
                return res.json()
            })
            .then(data => {
                console.log(data);
        });
    })
}

function addNote(e) {
    var newNote = document.createElement("DIV");
    var p = document.createElement("TEXTAREA");
    p.value = "New note 📝";
    newNote.appendChild(p);
    newNote.className = "draggable drag-1"
    document.getElementById("room").appendChild(newNote)
    addListensToChildrenOfRoom()
    const offset = getOffset(newNote)
    const x = (e) ? e.layerX - offset.left - (newNote.clientWidth/2) : 0
    const y = (e) ? e.layerY - offset.top - (newNote.clientHeight/2) : 0
    newNote.setAttribute("data-x", x)
    newNote.setAttribute("data-y", y)
    newNote.style.transform = `translate(${x}px, ${y}px)`

    fetch("/create/note", {
        method: "POST",
        // Having a JSON parsing error with the bodyparser middleware so I use the URL encoded version. 
        body: new URLSearchParams({
            position: [x, y],
            room_id: document.getElementById("room").getAttribute("name")
        })
        })
        .then(res => {
            return res.json()
        })
        .then(data => {
            if (data.created) {
                newNote.setAttribute("note-id", data.note._id)
                newNote.setAttribute("id", data.note._id)
                
                p.setAttribute("id", data.note._id)

                // fixed action button
                var actionBtns = document.createElement("DIV");
                actionBtns.className = "fixed-action-btn"

                var edit = document.createElement("A");
                edit.className = "btn-floating btn-small red"
                var editIcon = document.createElement("I");
                editIcon.className = "medium material-icons"
                editIcon.innerHTML = "mode_edit"
                edit.appendChild(editIcon)
                actionBtns.appendChild(edit)

                var list = document.createElement("UL");
                var li1 = document.createElement("LI");
                var a1 = document.createElement("A");
                a1.className = "btn-floating btn-small red deleteBtn"
                var i1 = document.createElement("I");
                i1.className = "material-icons"
                i1.innerHTML = "clear"
                i1.setAttribute("name", data.note._id)
                a1.appendChild(i1)
                initDeleteBtn(a1)
                li1.appendChild(a1)
                var li2 = document.createElement("LI");
                var a2 = document.createElement("A");
                a2.className = "btn-floating btn-small yellow darken-1"
                var i2 = document.createElement("I");
                i2.className = "material-icons"
                i2.innerHTML = "color_lens"
                a2.appendChild(i2)
                li2.appendChild(a2)
                list.appendChild(li1)
                list.appendChild(li2)
                actionBtns.appendChild(list)

                newNote.appendChild(actionBtns)
                var instances = M.FloatingActionButton.init(actionBtns, {
                    direction: 'right',
                    hoverEnabled: false,
                });
                var instance = M.FloatingActionButton.getInstance(actionBtns);

                document.getElementById(data.note._id).addEventListener('input', (e) => {
                    fetch("/update/note", {
                    method: "POST",
                    // Having a JSON parsing error with the bodyparser middleware so I use the URL encoded version. 
                    body: new URLSearchParams({
                        id: data.note._id,
                        text: e.target.value
                    })
                    })
                    .then(res => {
                        return res.json()
                    })
                    .then(data => {
                        console.log(data);
                    });

                });
            }
    });
}

document.getElementById("add-note").addEventListener("click", (e) => {
    e.preventDefault()
    addNote(null)
})

// Add a sticky note anywhere on the screen 
document.getElementById("room").addEventListener('dblclick', function (e) {
    addNote(e)
});

addListensToChildrenOfRoom()


// draggable stuff
import interact from 'https://cdn.interactjs.io/v1.10.11/interactjs/index.js'

interact('.item').draggable({
    listeners: {
        move (event) {
            console.log(event.pageX,
                        event.pageY)
        }
    }
})

interact('.draggable')
  .draggable({
    // enable inertial throwing
    inertia: false,
    // keep the element within the area of it's parent
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ],
    // enable autoScroll
    autoScroll: true,

    listeners: {
      // call this function on every dragmove event
      move: dragMoveListener,

      // call this function on every dragend event
      end (event) {
        var id = event.target.getAttribute('note-id')
        var target = event.target
        var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
        var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
        fetch("/update/note", {
          method: "POST",
          // Having a JSON parsing error with the bodyparser middleware so I use the URL encoded version. 
          body: new URLSearchParams({
              id: id,
              position: [x, y]
          })
          })
          .then(res => {
              return res.json()
          })
          .then(data => {
              console.log("drag-end ", data);
        });
      }
    }
  })

function dragMoveListener (event) {
  var target = event.target
  // keep the dragged position in the data-x/data-y attributes
  var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
  var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

  // translate the element
  target.style.transform = 'translate(' + x + 'px, ' + y + 'px)'

  // update the posiion attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

// this function is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener