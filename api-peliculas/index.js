require('dotenv').config()
const express = require('express')

const app = express()
const PORT = process.env.PORT || 3000

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
    titulo: 'Interstellar',
    director: 'Christopher Nolan',
    anio: 2014,
    genero: 'ciencia-ficcion',
    nota: 8.6
  },
  {
    id: 5,
    titulo: 'La La Land',
    director: 'Damien Chazelle',
    anio: 2016,
    genero: 'musical',
    nota: 8.0
  }
]

let nextId = 6

// =====================
// RUTAS
// =====================

// GET todas (con filtro por género)
app.get('/peliculas', (req, res) => {
  const { genero } = req.query

  if (genero) {
    const filtradas = peliculas.filter(p => p.genero === genero)
    return res.json(filtradas)
  }

  res.json(peliculas)
})

// GET por ID
app.get('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id)

  const pelicula = peliculas.find(p => p.id === id)

  if (!pelicula) {
    return res.status(404).json({ error: 'Película no encontrada' })
  }

  res.json(pelicula)
})

// POST crear película
app.post('/peliculas', (req, res) => {
  const { titulo, director, anio, genero, nota } = req.body

  if (!titulo || !director || !anio || !genero) {
    return res.status(400).json({
      error: 'titulo, director, anio y genero son obligatorios'
    })
  }

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

  res.status(201).json(nuevaPelicula)
})

// DELETE película
app.delete('/peliculas/:id', (req, res) => {
  const id = Number(req.params.id)

  const index = peliculas.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({ error: 'Película no encontrada' })
  }

  const eliminada = peliculas.splice(index, 1)[0]

  res.json({
    mensaje: 'Película eliminada',
    pelicula: eliminada
  })
})

// ESTADÍSTICAS (media)
app.get('/estadisticas', (req, res) => {
  const conNota = peliculas.filter(p => p.nota !== null)

  if (conNota.length === 0) {
    return res.json({ media: null, total: peliculas.length })
  }

  const suma = conNota.reduce((acc, p) => acc + p.nota, 0)
  const media = (suma / conNota.length).toFixed(2)

  res.json({
    media: Number(media),
    total: peliculas.length,
    conNota: conNota.length
  })
})

// 404 rutas no existentes
app.use((req, res) => {
  res.status(404).json({
    error: `Ruta ${req.method} ${req.url} no encontrada`
  })
})

// =====================
// INICIAR SERVIDOR
// =====================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})