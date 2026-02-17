// backend/socket.js
const { Server } = require("socket.io");

let io;
const userSocketMap = new Map(); // Mappa ID Utente -> Socket ID

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", 
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Nuovo client connesso:", socket.id);

    socket.on("identity", (userId) => {
      if (userId) {
        userSocketMap.set(userId, socket.id);
        console.log(`👤 Utente mappato: ${userId} -> ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      // Rimuovi utente dalla mappa
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          break;
        }
      }
      console.log("🔴 Client disconnesso:", socket.id);
    });
  });

  return io;
};

const sendNotification = (destinatarioId, notifica) => {
  if (!io) return;
  
  const socketId = userSocketMap.get(destinatarioId.toString());
  
  if (socketId) {
    io.to(socketId).emit("nuova_notifica", notifica);
    console.log(`📡 Notifica inviata realtime a ${destinatarioId}`);
  }
};

module.exports = { initSocket, sendNotification };