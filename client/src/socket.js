import { io } from "socket.io-client";

const host = window.location.hostname;

const URL =
  host === "localhost" || host === "127.0.0.1"
    ? "http://localhost:4000"
    : `http://${host}:4000`;

export const socket = io(URL, {
  autoConnect: false,
});
