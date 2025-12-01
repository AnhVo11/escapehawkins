// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// In-memory room storage
// rooms = { [roomCode]: { hostId, players: { [socketId]: {...} }, phase } }
const rooms = {};

function generateRoomCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 4; i++) {
    const index = Math.floor(Math.random() * letters.length);
    const char = letters[index];
    code += char;
  }

  if (rooms[code]) return generateRoomCode();
  return code;
}

// Health check
app.get("/", (req, res) => {
  res.send("Escape Hawkins server is running 👾");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // HOST: create a new room
  socket.on("createRoom", () => {
    const roomCode = generateRoomCode();

    rooms[roomCode] = {
      hostId: socket.id,
      players: {},
      phase: "lobby",
    };

    socket.join(roomCode);

    console.log("Room created:", roomCode, "by host", socket.id);

    socket.emit("roomCreated", { roomCode });
  });

  // PLAYER: join room (single, correct handler)
  socket.on("joinRoom", ({ roomCode, name }) => {
    const code = String(roomCode || "").trim().toUpperCase();
    const trimmedName = String(name || "").trim().slice(0, 16);

    const room = rooms[code];
    if (!room) {
      socket.emit("joinError", "Room not found.");
      return;
    }

    // max 4 players
    if (Object.keys(room.players).length >= 4) {
      socket.emit("joinError", "This room is full (max 4 players).");
      return;
    }

    if (!trimmedName) {
      socket.emit("joinError", "Name is required.");
      return;
    }

    room.players[socket.id] = {
      id: socket.id,
      name: trimmedName,
      roomCode: code,
      characterId: null,
      locked: false,
    };

    socket.join(code);

    socket.emit("joinedRoom", { roomCode: code });

    io.to(code).emit("roomUpdate", {
      roomCode: code,
      players: Object.values(room.players),
    });

    console.log(`Player joined room ${code}:`, trimmedName);
  });

  // PLAYER: select a character (survivor or Demogorgon)
  socket.on("selectCharacter", ({ roomCode, characterId }) => {
    const code = String(roomCode || "").trim().toUpperCase();
    const room = rooms[code];
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;

    if (player.locked) {
      socket.emit("characterError", "You are already locked in.");
      return;
    }

    const isMonster = characterId === "demogorgon";
    const playerCount = Object.keys(room.players).length;

    // Demogorgon only allowed if 2+ players
    if (isMonster && playerCount < 2) {
      socket.emit(
        "characterError",
        "You need at least 2 players in the room to play as the Demogorgon."
      );
      return;
    }

    // Only one Demogorgon
    if (isMonster) {
      const monsterAlreadyTaken = Object.values(room.players).some(
        (p) => p.characterId === "demogorgon" && p.id !== socket.id
      );
      if (monsterAlreadyTaken) {
        socket.emit("characterError", "Demogorgon is already taken.");
        return;
      }
    }

    // Survivors: unique per room
    if (!isMonster) {
      const takenByOther = Object.values(room.players).some(
        (p) => p.characterId === characterId && p.id !== socket.id
      );
      if (takenByOther) {
        socket.emit("characterError", "That character is already taken.");
        return;
      }
    }

    player.characterId = characterId;

    io.to(code).emit("roomUpdate", {
      roomCode: code,
      players: Object.values(room.players),
    });

    console.log(
      `Player ${player.name} selected ${characterId} in room ${code}`
    );
  });

  // PLAYER: lock in selected character
  socket.on("lockCharacter", ({ roomCode }) => {
    const code = String(roomCode || "").trim().toUpperCase();
    const room = rooms[code];
    if (!room) {
      console.log("lockCharacter: no room for code", code);
      return;
    }

    const player = room.players[socket.id];
    if (!player) {
      console.log("lockCharacter: no player for socket", socket.id);
      return;
    }

    if (!player.characterId) {
      socket.emit("characterError", "Select a character first.");
      return;
    }

    player.locked = true;
    console.log(
      "Player locked in:",
      player.name,
      "as",
      player.characterId,
      "in room",
      code
    );

    io.to(code).emit("roomUpdate", {
      roomCode: code,
      players: Object.values(room.players),
    });
  });

  // DISCONNECT: remove from rooms
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    for (const code in rooms) {
      const room = rooms[code];

      if (room.players[socket.id]) {
        console.log(`Removing player ${socket.id} from room ${code}`);
        delete room.players[socket.id];

        io.to(code).emit("roomUpdate", {
          roomCode: code,
          players: Object.values(room.players),
        });
      }

      // (Optional) if host leaves, you could close the room here later
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Escape Hawkins server listening on http://localhost:${PORT}`);
});
