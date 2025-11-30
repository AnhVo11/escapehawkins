// client/src/socket.js
import { io } from "socket.io-client";

const URL = "http://localhost:4000"; // Node server

export const socket = io(URL, {
  autoConnect: false,
});
