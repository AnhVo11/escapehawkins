// client/src/pages/Host.jsx
import { useEffect, useState } from "react";
import { socket } from "../socket";

function Host() {
  const [connected, setConnected] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      console.log("Host connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      setRoomCode("");
      setPlayers([]);
      setMessage("Disconnected from server.");
      console.log("Host disconnected");
    });

    socket.on("roomCreated", ({ roomCode }) => {
      setRoomCode(roomCode);
      setMessage("Room created. Tell players to join with this code.");
      setCreating(false);
    });

    socket.on("roomUpdate", ({ roomCode, players }) => {
      setRoomCode(roomCode);
      setPlayers(players || []);
    });

    socket.on("roomClosed", (msg) => {
      setMessage(msg || "Room closed.");
      setRoomCode("");
      setPlayers([]);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("roomCreated");
      socket.off("roomUpdate");
      socket.off("roomClosed");
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = () => {
    if (!connected) return;
    if (roomCode) return; // already have a room
    setCreating(true);
    setMessage("");
    socket.emit("createRoom");
  };

  const monsterPlayer = players.find((p) => p.characterId === "demogorgon");
  const monsterLabel = monsterPlayer
    ? `Demogorgon – ${monsterPlayer.name}`
    : "Demogorgon – BOT (if no player chooses it)";

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #7f1d1d 0, #020617 45%, #000 100%)",
        color: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "820px",
          padding: "24px 28px 28px",
          borderRadius: "18px",
          background:
            "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(10,10,15,0.98))",
          boxShadow:
            "0 0 40px rgba(0,0,0,0.9), 0 0 60px rgba(220,38,38,0.45)",
          border: "1px solid rgba(248,113,113,0.4)",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "18px" }}>
          <div
            style={{
              letterSpacing: "0.25em",
              fontSize: "0.8rem",
              textTransform: "uppercase",
              color: "#fca5a5",
              marginBottom: "4px",
            }}
          >
            Hawkins, Indiana
          </div>
          <h1
            style={{
              fontSize: "2.2rem",
              margin: 0,
              color: "#fecaca",
              textShadow:
                "0 0 10px rgba(248,113,113,0.8), 0 0 25px rgba(220,38,38,0.7)",
            }}
          >
            Escape Hawkins
          </h1>
          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              opacity: 0.8,
              fontSize: "0.95rem",
            }}
          >
            Host Screen – TV / PC only. Players join on their phones.
          </p>
        </div>

        {/* Connection status */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "14px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              border: "1px solid rgba(248,113,113,0.5)",
              fontSize: "0.8rem",
              background: "rgba(15,23,42,0.8)",
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
            {connected ? "Connected to Upside Down server" : "Connecting..."}
          </span>
        </div>

        {/* Room + button */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "14px",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(248,113,113,0.6)",
              background:
                "radial-gradient(circle at top, rgba(127,29,29,0.5), rgba(15,23,42,0.95))",
              minWidth: "190px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                color: "#fecaca",
                opacity: 0.85,
              }}
            >
              Room Code
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "1.9rem",
                fontWeight: "700",
                fontFamily: "monospace",
                color: "#fef2f2",
              }}
            >
              {roomCode || "----"}
            </div>
          </div>

          <button
            onClick={handleCreateRoom}
            disabled={!connected || !!roomCode || creating}
            style={{
              padding: "10px 22px",
              borderRadius: "999px",
              border: "none",
              cursor: !connected || roomCode || creating ? "default" : "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              background: roomCode
                ? "rgba(31,41,55,0.9)"
                : "linear-gradient(135deg,#b91c1c,#f97316)",
              color: "#f9fafb",
              boxShadow: roomCode
                ? "none"
                : "0 0 14px rgba(248,113,113,0.9)",
              opacity: !connected || creating ? 0.7 : 1,
            }}
          >
            {roomCode
              ? "Room active"
              : creating
                ? "Summoning Hawkins..."
                : "Create Room"}
          </button>
        </div>

        {message && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.9rem",
              color: "#fecaca",
              marginBottom: "16px",
            }}
          >
            {message}
          </p>
        )}

        {/* Monster status */}
        <div
          style={{
            marginBottom: "16px",
            padding: "10px 12px",
            borderRadius: "12px",
            border: "1px solid rgba(248,113,113,0.55)",
            background:
              "radial-gradient(circle at top, rgba(127,29,29,0.55), rgba(15,23,42,0.95))",
          }}
        >
          <div
            style={{
              fontSize: "0.8rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#fecaca",
              marginBottom: "4px",
            }}
          >
            Monster
          </div>
          <div
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
            }}
          >
            {monsterLabel}
          </div>
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "0.8rem",
              opacity: 0.8,
            }}
          >
            If no player chooses Demogorgon before the game starts, a bot will
            hunt survivors instead.
          </p>
        </div>

        {/* Players list */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "8px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "#fca5a5",
                  margin: 0,
                }}
              >
                Players in Hawkins
              </h2>
              <p
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.7,
                  margin: "2px 0 0 0",
                }}
              >
                Game supports 1–4 players. You can start even if you&apos;re
                alone.
              </p>
            </div>
            <span
              style={{
                fontSize: "0.8rem",
                opacity: 0.8,
              }}
            >
              {players.length} / 4 players
            </span>
          </div>

          <div
            style={{
              minHeight: "80px",
              borderRadius: "12px",
              border: "1px solid rgba(55,65,81,0.9)",
              background:
                "repeating-linear-gradient(90deg, #020617 0, #020617 2px, #030712 2px, #030712 4px)",
              padding: "10px 12px",
            }}
          >
            {players.length === 0 ? (
              <p
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.7,
                  margin: "6px 0 0 0",
                }}
              >
                Waiting for players to join from their phones...
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                  gap: "10px",
                }}
              >
                {players.map((p, index) => {
                  const isMonster = p.characterId === "demogorgon";
                  const isLocked = p.locked;
                  const charName = (() => {
                    if (!p.characterId) return "Not selected";
                    if (p.characterId === "eleven") return "Eleven";
                    if (p.characterId === "mike") return "Mike";
                    if (p.characterId === "will") return "Will";
                    if (p.characterId === "lucas") return "Lucas";
                    if (p.characterId === "dustin") return "Dustin";
                    if (p.characterId === "max") return "Max";
                    if (p.characterId === "steve") return "Steve";
                    if (p.characterId === "nancy") return "Nancy";
                    if (p.characterId === "jonathan") return "Jonathan";
                    if (p.characterId === "robin") return "Robin";
                    if (p.characterId === "hopper") return "Hopper";
                    if (p.characterId === "eddie") return "Eddie";
                    if (p.characterId === "demogorgon") return "Demogorgon";
                    return p.characterId;
                  })();

                  return (
                    <div
                      key={p.id}
                      style={{
                        borderRadius: "10px",
                        padding: "8px 10px",
                        border: isMonster
                          ? "1px solid rgba(248,113,113,0.9)"
                          : "1px solid rgba(148,163,184,0.8)",
                        background: isMonster
                          ? "radial-gradient(circle at top, rgba(127,29,29,0.8), rgba(15,23,42,0.95))"
                          : "radial-gradient(circle at top, rgba(30,64,175,0.6), rgba(15,23,42,0.95))",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.16em",
                            color: "#fecaca",
                            opacity: 0.85,
                          }}
                        >
                          Player {index + 1}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "2px 8px",
                            borderRadius: "999px",
                            border: "1px solid rgba(148,163,184,0.6)",
                            backgroundColor: isLocked
                              ? "rgba(22,163,74,0.15)"
                              : "rgba(30,64,175,0.2)",
                            color: isLocked ? "#bbf7d0" : "#bfdbfe",
                          }}
                        >
                          {isLocked ? "READY" : "Choosing..."}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.95rem",
                          color: "#fef2f2",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginBottom: "2px",
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          opacity: 0.9,
                        }}
                      >
                        {isMonster ? "Monster: " : "Survivor: "}
                        {charName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom note */}
        <p
          style={{
            marginTop: "12px",
            fontSize: "0.8rem",
            textAlign: "center",
            opacity: 0.7,
          }}
        >
          Ask players to open{" "}
          <span style={{ fontFamily: "monospace" }}>/join</span> on their
          phones and enter the room code. Then they&apos;ll pick a character.
        </p>
      </div>
    </div>
  );
}

export default Host;
