const mongoose = require("mongoose");

const PedidoSchema = new mongoose.Schema({
  mesa: Number,
  platos: Array,
  estado: {
    type: String,
    default: "Pendiente"
  },
  mozo: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Pedido", PedidoSchema);
