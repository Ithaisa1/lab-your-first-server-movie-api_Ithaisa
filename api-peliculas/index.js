require('dotenv').config()
const express = require('express')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware para parsear JSON
app.use(express.json())

// =====================
// DATOS EN MEMORIA
// =====================
let peliculas = [
  {
    id: 1,
    titulo: 'Inception',
    director: 'Christopher Nolan',
    anio: 2010,
    genero: 'ciencia-ficcion',
    nota: 8.8
  },
  {
    id: 2,
    titulo: 'Pulp Fiction',
    director: 'Quentin Tarantino',
    anio: 1994,
    genero: 'crimen',
    nota: 8.9
  },
  {
    id: 3,
    titulo: 'El Señor de los Anillos',
    director: 'Peter Jackson',
    anio: 2001,
    genero: 'fantasia',
    nota: 8.8
  },
  {
    id: 4,
    titulo: 'Neon Skies',
    director: 'Ava Ramirez',
    anio: 2026,
    genero: 'ciencia-ficcion',
    nota: 8.2
  },
  {
    id: 5,
    titulo: 'ChronoShift',
    director: 'Marcus Lee',
    anio: 2026,
    genero: 'thriller',
    nota: 8.5
  }
]

let nextId = 6 // Contador para asignar IDs únicos

// =====================
// RUTAS (las añadirás abajo)
// =====================


// GET /estadisticas → nota media de todas las películas
app.get('/estadisticas', (req, res) => {
  const conNota = peliculas.filter(p => p.nota !== null)

  if (conNota.length === 0) {
    return res.json({ media: null, total: 0 })
  }

  const suma = conNota.reduce((acc, p) => acc + p.nota, 0)
  const media = (suma / conNota.length).toFixed(2)

  res.json({
    media: Number(media),
    total: peliculas.length,
    conNota: conNota.length
  })
})

// GET /peliculas/:id → devuelve una película por ID
app.get('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id)
  const pelicula = peliculas.find(p => p.id === id)

  if (!pelicula) {
    return res.status(404).json({ error: 'Película no encontrada' })
  }

  res.json(pelicula)
})

// GET /peliculas?genero=crimen → filtra por género
// GET /peliculas?buscar=nolan → filtra por director o título (case-insensitive)
app.get('/peliculas', (req, res) => {
  const { genero, buscar } = req.query

  if (genero) {
    const filtradas = peliculas.filter(p => p.genero === genero)
    return res.json(filtradas)
  }

  if (buscar) {
    const termino = buscar.toLowerCase()
    const filtradas = peliculas.filter(p => 
      p.director.toLowerCase().includes(termino) || 
      p.titulo.toLowerCase().includes(termino)
    )
    return res.json(filtradas)
  }

  res.json(peliculas)
})



// POST /peliculas → crea una nueva película
app.post('/peliculas', (req, res) => {
  const { titulo, director, anio, genero, nota } = req.body

  // Validación: campos obligatorios
  if (!titulo || !director || !anio || !genero) {
    return res.status(400).json({
      error: 'Los campos titulo, director, anio y genero son obligatorios'
    })
  }

  // Validación: nota debe ser entre 0 y 10
  if (nota !== undefined && (nota < 0 || nota > 10)) {
    return res.status(400).json({
      error: 'La nota debe estar entre 0 y 10'
    })
  }

  const nuevaPelicula = {
    id: nextId++,
    titulo,
    director,
    anio: Number(anio),
    genero,
    nota: nota !== undefined ? Number(nota) : null
  }

  peliculas.push(nuevaPelicula)

  // Status 201 = Created
  res.status(201).json(nuevaPelicula)
})

// DELETE /peliculas/:id → elimina una película
app.delete('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = peliculas.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({ error: 'Película no encontrada' })
  }

  const eliminada = peliculas.splice(index, 1)[0]

  res.json({ mensaje: 'Película eliminada', pelicula: eliminada })
})

// PUT /peliculas/:id → actualiza todos los campos de una película
app.put('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id)
  const index = peliculas.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({ error: 'Película no encontrada' })
  }

  const { titulo, director, anio, genero, nota } = req.body

  // Validación: campos obligatorios
  if (!titulo || !director || !anio || !genero) {
    return res.status(400).json({
      error: 'Los campos titulo, director, anio y genero son obligatorios'
    })
  }

  // Validación: nota debe ser entre 0 y 10
  if (nota !== undefined && (nota < 0 || nota > 10)) {
    return res.status(400).json({
      error: 'La nota debe estar entre 0 y 10'
    })
  }

  peliculas[index] = {
    id,
    titulo,
    director,
    anio: Number(anio),
    genero,
    nota: nota !== undefined ? Number(nota) : null
  }

  res.json(peliculas[index])
})

// PATCH /peliculas/:id → actualiza solo los campos enviados en el body
app.patch('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id)
  const pelicula = peliculas.find(p => p.id === id)

  if (!pelicula) {
    return res.status(404).json({ error: 'Película no encontrada' })
  }

  // Validación: nota debe ser entre 0 y 10 si se envía
  if (req.body.nota !== undefined && (req.body.nota < 0 || req.body.nota > 10)) {
    return res.status(400).json({
      error: 'La nota debe estar entre 0 y 10'
    })
  }

  // Usamos spread operator para actualizar solo los campos enviados
  const peliculaActualizada = {
    ...pelicula,
    ...req.body,
    anio: req.body.anio !== undefined ? Number(req.body.anio) : pelicula.anio,
    nota: req.body.nota !== undefined ? Number(req.body.nota) : pelicula.nota
  }

  const index = peliculas.findIndex(p => p.id === id)
  peliculas[index] = peliculaActualizada

  res.json(peliculaActualizada)
})

// Esta ruta atrapa cualquier petición que no coincida con las anteriores
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.url} no encontrada` })
})

// =====================
// INICIAR SERVIDOR
// =====================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})