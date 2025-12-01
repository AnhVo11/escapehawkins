// client/src/pages/Join.jsx
import { useEffect, useState } from "react";
import { socket } from "../socket";

const SURVIVORS = [
  { id: "eleven", name: "Eleven" },
  { id: "mike", name: "Mike" },
  { id: "will", name: "Will" },
  { id: "lucas", name: "Lucas" },
  { id: "dustin", name: "Dustin" },
  { id: "max", name: "Max" },
  { id: "steve", name: "Steve" },
  { id: "nancy", name: "Nancy" },
  { id: "jonathan", name: "Jonathan" },
  { id: "robin", name: "Robin" },
  { id: "hopper", name: "Hopper" },
  { id: "eddie", name: "Eddie" },
];

const MONSTER = { id: "demogorgon", name: "Demogorgon" };

function Join() {
  const [connected, setConnected] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [joined, setJoined] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [characterError, setCharacterError] = useState("");
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      console.log("Player connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setJoined(false);
      setPlayers([]);
      setRoomCode("");
      console.log("Player disconnected");
    });

    socket.on("joinedRoom", ({ roomCode }) => {
      setJoining(false);
      setJoined(true);
      setRoomCode(roomCode);
      setError("");
    });

    socket.on("joinError", (msg) => {
      setJoining(false);
      setError(msg || "Unable to join room.");
    });

    socket.on("roomUpdate", ({ roomCode, players }) => {
      setRoomCode(roomCode);
      setPlayers(players || []);
    });

    socket.on("roomClosed", (msg) => {
      setError(msg || "Room closed by host.");
      setJoined(false);
      setPlayers([]);
      setRoomCode("");
    });

    socket.on("characterError", (msg) => {
      setCharacterError(msg || "Unable to select character.");
      setLocking(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("joinedRoom");
      socket.off("joinError");
      socket.off("roomUpdate");
      socket.off("roomClosed");
      socket.off("characterError");
      socket.disconnect();
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!connected) return;

    const trimmedRoom = roomCodeInput.trim().toUpperCase();
    const trimmedName = nameInput.trim();

    if (!trimmedRoom || !trimmedName) {
      setError("Enter room code and name.");
      return;
    }

    setError("");
    setJoining(true);

    socket.emit("joinRoom", {
      roomCode: trimmedRoom,
      name: trimmedName,
    });
  };

  const myPlayer = players.find((p) => p.id === socket.id);
  const myLocked = myPlayer?.locked || false;

  const playerCount = players.length;
  const canPickMonster = playerCount >= 2;

  const takenByOthers = (characterId) =>
    players.some(
      (p) =>
        p.characterId === characterId &&
        p.id !== socket.id
    );

  const isMonsterTakenByOther = players.some(
    (p) =>
      p.characterId === MONSTER.id && p.id !== socket.id
  );

  const handleSelectCharacter = (characterId) => {
    if (!joined || !connected) return;
    if (myLocked) {
      setCharacterError("You are already locked in.");
      return;
    }

    setCharacterError("");

    // Local UI update
    setSelectedCharacterId(characterId);

    socket.emit("selectCharacter", {
      roomCode,
      characterId,
    });
  };

  const handleLockIn = () => {
    if (!joined || !connected) return;
    if (myLocked) {
      setCharacterError("You are already locked in.");
      return;
    }
    if (!selectedCharacterId) {
      setCharacterError("Select a character first.");
      return;
    }

    setCharacterError("");
    setLocking(true);

    socket.emit("lockCharacter", {
      roomCode,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #7f1d1d 0, #020617 45%, #000 100%)",
        color: "#f9fafb",
        display: "flex",
        alignItems: "stretch",
        justifyContent: "center",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "20px 20px 24px",
          borderRadius: "18px",
          background:
            "linear-gradient(150deg, rgba(15,23,42,0.98), rgba(10,10,15,0.98))",
          boxShadow:
            "0 0 40px rgba(0,0,0,0.85), 0 0 40px rgba(248,113,113,0.45)",
          border: "1px solid rgba(248,113,113,0.45)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "16px", textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "#fca5a5",
            }}
          >
            Hawkins, 1980s
          </div>
          <h1
            style={{
              fontSize: "1.6rem",
              margin: "4px 0 0",
              color: "#fee2e2",
              textShadow:
                "0 0 10px rgba(248,113,113,0.8), 0 0 18px rgba(220,38,38,0.7)",
            }}
          >
            Escape Hawkins
          </h1>
          <p
            style={{
              marginTop: "6px",
              marginBottom: 0,
              opacity: 0.8,
              fontSize: "0.9rem",
            }}
          >
            Join a room and choose your character.
          </p>
        </div>

        {/* Connection status */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid rgba(148,163,184,0.8)",
              fontSize: "0.75rem",
              background: "rgba(15,23,42,0.9)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                backgroundColor: connected ? "#22c55e" : "#f97316",
                boxShadow: connected
                  ? "0 0 8px rgba(34,197,94,0.7)"
                  : "0 0 8px rgba(249,115,22,0.7)",
              }}
            ></span>
            {connected ? "Linked to Hawkins network" : "Connecting..."}
          </span>
        </div>

        {/* Join form OR character select */}
        {!joined ? (
          <form onSubmit={handleJoin} style={{ marginBottom: "14px" }}>
            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#e5e7eb",
                }}
              >
                Room Code
              </label>
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) =>
                  setRoomCodeInput(e.target.value.toUpperCase())
                }
                placeholder="ABCD"
                maxLength={4}
                style={{
                  marginTop: "4px",
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid rgba(75,85,99,0.9)",
                  background: "#020617",
                  color: "#f9fafb",
                  fontFamily: "monospace",
                  fontSize: "1rem",
                }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label
                style={{
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#e5e7eb",
                }}
              >
                Your Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Dustin, Max, Hopper..."
                style={{
                  marginTop: "4px",
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "10px",
                  border: "1px solid rgba(75,85,99,0.9)",
                  background: "#020617",
                  color: "#f9fafb",
                  fontSize: "0.95rem",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!connected || joining}
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "9px 12px",
                borderRadius: "999px",
                border: "none",
                cursor: !connected || joining ? "default" : "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: "0.75rem",
                fontWeight: 600,
                background: "linear-gradient(135deg,#b91c1c,#f97316)",
                color: "#f9fafb",
                boxShadow: "0 0 14px rgba(248,113,113,0.8)",
                opacity: !connected || joining ? 0.7 : 1,
              }}
            >
              {joining ? "Joining Hawkins..." : "Join Room"}
            </button>
          </form>
        ) : (
          <>
            {/* Room info */}
            <div
              style={{
                marginBottom: "10px",
                padding: "8px 10px",
                borderRadius: "12px",
                border: "1px solid rgba(75,85,99,0.9)",
                background:
                  "repeating-linear-gradient(90deg,#020617 0,#020617 2px,#030712 2px,#030712 4px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "#fca5a5",
                    }}
                  >
                    Room
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "1.3rem",
                      color: "#fee2e2",
                    }}
                  >
                    {roomCode || "----"}
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "0.8rem",
                    opacity: 0.8,
                  }}
                >
                  Players: {players.length} / 4
                  <br />
                  {myLocked ? "You are locked in." : "Pick your character."}
                </div>
              </div>
            </div>

            {/* Character selection */}
            <div
              style={{
                marginBottom: "10px",
                padding: "8px 10px 10px",
                borderRadius: "12px",
                border: "1px solid rgba(55,65,81,0.9)",
                background:
                  "radial-gradient(circle at top, rgba(15,23,42,0.98), #020617)",
              }}
            >
              <div
                style={{
                  fontSize: "0.78rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#e5e7eb",
                  marginBottom: "6px",
                }}
              >
                Survivors
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
                  gap: "6px",
                }}
              >
                {SURVIVORS.map((char) => {
                  const isSelected = selectedCharacterId === char.id;
                  const isTakenByOther = takenByOthers(char.id);
                  const isMyCurrent = myPlayer?.characterId === char.id;

                  const disabled = isTakenByOther && !isMyCurrent;

                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => handleSelectCharacter(char.id)}
                      disabled={disabled || myLocked}
                      style={{
                        textAlign: "left",
                        padding: "6px 8px",
                        borderRadius: "10px",
                        border: isSelected || isMyCurrent
                          ? "1px solid rgba(248,113,113,0.9)"
                          : "1px solid rgba(75,85,99,0.9)",
                        background: disabled
                          ? "rgba(15,23,42,0.6)"
                          : "linear-gradient(135deg,#020617,#020617)",
                        color: "#f9fafb",
                        opacity: disabled ? 0.4 : 1,
                        cursor:
                          disabled || myLocked ? "default" : "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.86rem",
                          fontWeight: 600,
                          marginBottom: "2px",
                        }}
                      >
                        {char.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          opacity: 0.8,
                        }}
                      >
                        {disabled
                          ? "Taken"
                          : isSelected || isMyCurrent
                          ? "Selected"
                          : "Tap to choose"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monster section (only if 2+ players) */}
            {canPickMonster && (
              <div
                style={{
                  marginBottom: "10px",
                  padding: "8px 10px",
                  borderRadius: "12px",
                  border: "1px solid rgba(248,113,113,0.7)",
                  background:
                    "radial-gradient(circle at top, rgba(127,29,29,0.85), rgba(15,23,42,0.98))",
                }}
              >
                <div
                  style={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#fee2e2",
                    marginBottom: "4px",
                  }}
                >
                  Monster
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectCharacter(MONSTER.id)}
                  disabled={isMonsterTakenByOther || myLocked}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border:
                      selectedCharacterId === MONSTER.id ||
                      myPlayer?.characterId === MONSTER.id
                        ? "1px solid rgba(248,250,252,0.9)"
                        : "1px solid rgba(248,113,113,0.9)",
                    background: isMonsterTakenByOther
                      ? "rgba(15,23,42,0.7)"
                      : "linear-gradient(135deg,#7f1d1d,#b91c1c)",
                    color: "#fee2e2",
                    cursor:
                      isMonsterTakenByOther || myLocked
                        ? "default"
                        : "pointer",
                    opacity: isMonsterTakenByOther ? 0.5 : 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                    }}
                  >
                    {MONSTER.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      opacity: 0.9,
                    }}
                  >
                    Play as the monster and hunt down the others.
                  </div>
                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "0.75rem",
                      opacity: 0.8,
                    }}
                  >
                    {isMonsterTakenByOther
                      ? "Already taken by another player."
                      : "Only one player can be the Demogorgon."}
                  </div>
                </button>
              </div>
            )}

            {/* Lock-in button */}
            <button
              type="button"
              onClick={handleLockIn}
              disabled={!joined || !connected || myLocked}
              style={{
                width: "100%",
                marginTop: "2px",
                padding: "9px 12px",
                borderRadius: "999px",
                border: "none",
                cursor:
                  !joined || !connected || myLocked ? "default" : "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                fontSize: "0.75rem",
                fontWeight: 600,
                background: myLocked
                  ? "rgba(22,163,74,0.2)"
                  : "linear-gradient(135deg,#b91c1c,#f97316)",
                color: "#f9fafb",
                boxShadow: myLocked
                  ? "none"
                  : "0 0 14px rgba(248,113,113,0.8)",
                opacity: !joined || !connected ? 0.7 : 1,
              }}
            >
              {myLocked
                ? "Locked In"
                : locking
                ? "Locking In..."
                : "Lock In Character"}
            </button>
          </>
        )}

        {/* Error messages */}
        {error && (
          <p
            style={{
              marginTop: "4px",
              marginBottom: "0",
              fontSize: "0.8rem",
              color: "#fecaca",
            }}
          >
            {error}
          </p>
        )}
        {characterError && (
          <p
            style={{
              marginTop: "4px",
              marginBottom: "0",
              fontSize: "0.8rem",
              color: "#fecaca",
            }}
          >
            {characterError}
          </p>
        )}

        <p
          style={{
            marginTop: "auto",
            fontSize: "0.78rem",
            opacity: 0.75,
            textAlign: "center",
          }}
        >
          Keep this tab open while playing. The host TV shows the map and
          monster.
        </p>
      </div>
    </div>
  );
}

export default Join;
