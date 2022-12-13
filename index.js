const express = require('express')
const db = require('./db')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const port = 3000

const helmet = require('helmet')
const xss = require('xss-clean')

const userRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')
const recipeRoutes = require('./routes/recipes')
const videosRoutes = require('./routes/recipeVideos')
const commentsRoutes = require('./routes/comments')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// use xss-clean
app.use(xss())

// use helmet
app.use(helmet())

// use cors
app.use(cors())

// ================== ENDPOINT AUTHENTICATION ==================
// auth route
app.use('/auth', authRoutes)

// ================== ENDPOINT USERS ==================
// users route
app.use('/users', userRoutes)

// ================== ENDPOINT RECIPES ==================
// recipes route
app.use('/recipes', recipeRoutes)

// ================== ENDPOINT RECiPE_VIDEOS ==================
// videos recipe routes
app.use('/recipe-videos', videosRoutes)

// ================== ENDPOINT COMMENTS ==================
app.use('/comments', commentsRoutes)

// running express port 3000
app.listen(port, () => {
  console.log(`App is running on port ${port}`)
})
