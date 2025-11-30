// client/src/App.jsx
import { Routes, Route, Link } from "react-router-dom";
import Host from "./pages/host";
import Join from "./pages/join";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <div
            style={{
              minHeight: "100vh",
              background: "#020617",
              color: "#f9fafb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              padding: "16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                padding: "24px",
                borderRadius: "16px",
                background: "#0f172a",
                boxShadow: "0 0 24px rgba(0,0,0,0.6)",
                maxWidth: "480px",
                width: "100%",
              }}
            >
              <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                Escape Hawkins
              </h1>
              <p style={{ opacity: 0.85, marginBottom: "1.5rem" }}>
                Choose how you want to join the game.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to="/host"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "999px",
                    border: "1px solid #f97316",
                    textDecoration: "none",
                    color: "#f97316",
                    fontWeight: 600,
                  }}
                >
                  Host (TV / PC)
                </Link>
                <Link
                  to="/join"
                  style={{
                    padding: "10px 18px",
                    borderRadius: "999px",
                    border: "1px solid #22c55e",
                    textDecoration: "none",
                    color: "#22c55e",
                    fontWeight: 600,
                  }}
                >
                  Join (Phone)
                </Link>
              </div>
            </div>
          </div>
        }
      />
      <Route path="/host" element={<Host />} />
      <Route path="/join" element={<Join />} />
    </Routes>
  );
}

export default App;
