const { Server } = require("socket.io");
const { generateSudokuBoard } = require("../services/boardGenerator");
const { LEGAL_TLS_SOCKET_OPTIONS } = require("mongodb");
const rooms = {};

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: '*', // später sicherer machen
        },
    });

    io.on("connection", (socket) => {
        const { roomId, userId, level, username } = socket.handshake.query;
        console.log("🔁 Reconnect erkannt:", { roomId, userId, level, username });

        if (roomId && userId && level && username ) {
            console.log("🔁 Reconnect erkannt:", { roomId, userId, username });

            // Spieler manuell wieder dem Raum hinzufügen
            socket.join(roomId);

            // Spieler in die rooms-Struktur einfügen, falls nicht vorhanden
            if (!rooms[roomId]) {
                const { initialBoard, solvedBoard } = generateSudokuBoard(level);
                rooms[roomId] = {
                    players: [],
                    board: { initialBoard, solvedBoard }
                };
            }

            // Falls Spieler schon drin ist, nicht doppelt einfügen
            const alreadyInRoom = rooms[roomId].players.some(p => p.userId === userId);

            if (rooms[roomId]?.board) {
                socket.emit("sudokuboard", rooms[roomId].board);
              }

            if (!alreadyInRoom) {
                const newPlayer = {
                    userId,
                    socketId: socket.id,
                    name: username
                };

                rooms[roomId].players.push(newPlayer);
                console.log("🔄 Reconnect Spieler hinzugefügt:", newPlayer);
            }

            // Optional: Spieler informieren
            socket.emit("reconnected", { success: true });
        }
        console.log("🔌 Socket connected:", socket.id);

        socket.on("join-room", (roomId, userId, level, username) => {
            console.log("test:", level);
            if (!rooms[roomId]) {
                const { initialBoard, solvedBoard } = generateSudokuBoard(level);
                rooms[roomId] = {
                    players: [],
                    board: { initialBoard, solvedBoard },
                };
            }

            const newPlayer = {
                userId: userId,
                socketId: socket.id,
                name: username
            }

            if (rooms[roomId].players.length < 2) {
                rooms[roomId].players.push(newPlayer);
                socket.join(roomId);
                socket.emit("joined-room", { success: true });
                console.log("Neuer Spieler:", newPlayer);

                if (rooms[roomId].players.length === 2) {
                    io.to(roomId).emit("start-game");
                    io.to(roomId).emit("sudokuboard", rooms[roomId].board);
                }
            } else {
                io.to(socket.id).emit("joined-room", { success: false, reason: "Room full" });
            }
        });
        socket.on("disconnect", () => {
            console.log("disconnect......");
            for (const roomId in rooms) {
                const room = rooms[roomId];

                if (room || room.players) {
                    const disconnectedPlayer = room.players.find(player => player.socketId === socket.id);
                    console.log("disconnected: ", disconnectedPlayer);
                    room.players = room.players.filter(player => player.socketId !== socket.id);
                    console.log("alle players: ", room.players);
                    if (rooms[roomId].players.length === 0) {
                        delete rooms[roomId];
                        console.log(`❌ Raum ${roomId} gelöscht`);
                    } else if (disconnectedPlayer) {
                        // Andere Spieler im Raum informieren
                        io.to(roomId).emit("player-left", disconnectedPlayer.name);
                    }
                }
            }
            console.log("🔌 Socket disconnected:", socket.id);
        });
    });

}

module.exports = setupSocket;