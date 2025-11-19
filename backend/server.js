require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// Modelo Pedido
const Pedido = require('./src/models/pedido');

// Rutas API
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Socket.IO
const allowedOrigins = [
  "http://localhost:4200",            // Tu entorno local
  //"https://pa4-frontend.onrender.com" // FRONTEND EN RENDER
  "https://restaurantepa4.netlify.app"  // FRONTEND EN NETLIFYcd
];

// 1. Configuración Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// 2. Configuración Express
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Conexión a MongoDB
// mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/restaurante")
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Conectado a MongoDB");

    server.listen(PORT, () => {
      console.log(`Servidor en puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Error de conexión:", err);
  });

// Usar rutas
app.use('/api', apiRoutes);

// Socket.IO Eventos
io.on('connection', async (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Enviar todos los pedidos actuales
  const pedidos = await Pedido.find();
  socket.emit("pedidos-actuales", pedidos);

  // Crear pedido
  socket.on("nuevo-pedido", async (data) => {
    try {
      const nuevoPedido = await Pedido.create({
        mesa: data.mesa,
        platos: data.platos,
        mozo: data.mozo,
        estado: "Pendiente"
      });

      console.log("Pedido guardado:", nuevoPedido);

      io.emit("pedido-creado", nuevoPedido);

    } catch (error) {
      console.error("Error guardando pedido:", error);
    }
  });

  // Actualizar estado
  socket.on("actualizar-estado", async (data) => {
    try {
      const pedido = await Pedido.findByIdAndUpdate(
        data.pedidoId,
        { estado: data.nuevoEstado },
        { new: true }
      );
  
      if (pedido) {
        io.emit("estado-actualizado", {
          pedidoId: pedido._id,
          estado: pedido.estado,
          mesa: pedido.mesa
        });
      }
  
    } catch (error) {
      console.error("Error actualizando estado:", error);
    }
  });

  // Eliminar pedido
  socket.on("eliminar-pedido", async (id) => {
    try {
      await Pedido.findByIdAndDelete(id);
      io.emit("pedido-eliminado", id);
    } catch (error) {
      console.error("Error eliminando pedido:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

