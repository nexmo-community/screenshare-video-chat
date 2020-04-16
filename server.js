const express = require("express");
const app = express();
const OpenTok = require("opentok");
const OT = new OpenTok(process.env.API_KEY, process.env.API_SECRET);

let sessions = {};

app.use(express.static("public"));

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/landing.html");
});
 
app.get("/session/:room", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.post("/session/:room", (request, response) => {
  const roomName = request.params.room;
  if(sessions[roomName]) {
    generateToken(roomName, response);
  } else {
    OT.createSession((error, session) => {
      if(error) {
        console.log("Error creating session:", error)
      } else {
        sessions[roomName] = session.sessionId;
        generateToken(roomName, response);
      }
    })
  }
})

function generateToken(roomName, response) {
  const tokenOptions = {
    role: "publisher",
    data: `roomname=${roomName}`
  };
  let token = OT.generateToken(sessions[roomName], tokenOptions);
  response.status(200);
  response.send({
    sessionId: sessions[roomName],
    token: token,
    apiKey: process.env.API_KEY
  })
}

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
