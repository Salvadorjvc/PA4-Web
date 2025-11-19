const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Esquema de Usuario
const usuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['mozo', 'cocinero'], required: true }
});

const Usuario = mongoose.model('Usuario', usuarioSchema, 'usuarios');

// Esquema de Plato
const platoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true }
});

const Plato = mongoose.model('Plato', platoSchema, 'platos');

// Ruta de login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario en MongoDB
    const usuario = await Usuario.findOne({ username, password });

    if (!usuario) {
      return res.status(401).json({ 
        mensaje: 'Credenciales incorrectas' 
      });
    }

    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        username: usuario.username,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Obtener platos disponibles
router.get('/platos', async (req, res) => {
  try {
    const platos = await Plato.find();
    res.json(platos);
  } catch (error) {
    console.error('Error al obtener platos:', error);
    res.status(500).json({ mensaje: 'Error al obtener platos' });
  }
});

// Crear nuevo plato (opcional)
router.post('/platos', async (req, res) => {
  try {
    const nuevoPlato = new Plato(req.body);
    await nuevoPlato.save();
    res.status(201).json(nuevoPlato);
  } catch (error) {
    console.error('Error al crear plato:', error);
    res.status(500).json({ mensaje: 'Error al crear plato' });
  }
});

module.exports = router;