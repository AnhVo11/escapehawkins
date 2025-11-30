// client/src/pages/Host.jsx
import { useEffect, useState } from "react";
import { socket } from "../socket";

function Host() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // connect when this page mounts
    socket.connect();

    socket.on("connect", () => {
      setConnected(true);
      console.log("Host connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      console.log("Host disconnected");
    });

    // cleanup when leaving page
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#05060b",
        color: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "24px",
          borderRadius: "16px",
          background: "#111827",
          boxShadow: "0 0 24px rgba(0,0,0,0.6)",
          maxWidth: "480px",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
          Escape Hawkins – Host
        </h1>
        <p style={{ opacity: 0.8, marginBottom: "1.5rem" }}>
          This is the TV / PC screen. It will show the map and player details.
        </p>

        <p>
          Status:{" "}
          <span style={{ fontWeight: "bold" }}>
            {connected ? "Connected ✅" : "Connecting..."}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Host;
