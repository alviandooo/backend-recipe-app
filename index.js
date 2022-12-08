const express = require('express')
const db = require('./db')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const port = 3000

const updatedAt = new Date()
const createdAt = new Date()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// use cors
app.use(cors())

// ================== ENDPOINT USERS ==================

// REGISTER (ADD USER)
app.post('/users/store', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body
    let data = []
    let message
    let statusCode = 400
    let error = false

    // validating input
    const inputIsNull =
      name === 'null' ||
      name === '' ||
      email === null ||
      email === '' ||
      phone === null ||
      phone === '' ||
      password === null ||
      password === ''

    const inputIsString =
      typeof name === 'string' &&
      typeof email === 'string' &&
      typeof phone === 'string' &&
      typeof password === 'string'

    // check input is string
    if (!error && !inputIsString) {
      error = true
      message = 'All of input must be string!'
    }

    // check input is null
    if (!error && inputIsNull) {
      error = true
      message = 'Please fill all data!'
    }

    // validating email is exist
    const checkEmail = await db`SELECT * FROM users WHERE email = ${email}`
    if (!error && checkEmail.length > 0) {
      error = true
      statusCode = 500
      message = 'Email has been used, please try again!'
    }

    // query store data to database
    if (!error) {
      data =
        await db`INSERT INTO users (name, email, phone, password, created_at, updated_at) VALUES(${name}, ${email}, ${phone}, ${password}, ${createdAt}, ${updatedAt})`
      message = 'Register is success!'
      statusCode = 201
    }

    // return response
    res.status(statusCode).json({
      status: !error,
      message,
      data
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
})

// LOGIN (LOGIN USER)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    let data = []
    let message
    let statusCode = 400
    let error = false
    const isString = typeof email === 'string' && typeof password === 'string'
    const isNull = email === '' || password === ''

    // check input is string
    if (!error && !isString) {
      error = true
      message = 'Email and password must be string!'
    }

    // check input is null
    if (!error && isNull) {
      error = true
      message = 'Email and password are required!'
    }

    // get data by email
    const checkData = await db`SELECT * FROM users WHERE email = ${email} `

    // check email is exist
    if (!error && checkData.length < 1) {
      error = true
      message = 'Email has not been used, please register!'
    }

    if (!error) {
      const passwordUser = checkData[0]?.password

      if (passwordUser === password && !error) {
        message = 'Login is successfully'
        statusCode = 200
        data = [
          {
            id: checkData[0]?.id,
            name: checkData[0]?.name,
            email: checkData[0]?.email,
            phone: checkData[0]?.phone,
            photo: checkData[0]?.photo,
            created_at: checkData[0]?.created_at,
            updated_at: checkData[0]?.updated_at
          }
        ]
      } else {
        message = 'Password is invalid, please try again!'
      }
    }

    res.status(statusCode).json({
      status: !error,
      message,
      data
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
})

// READ DATA USERS ( SHOW USERS )
// url : /users/:id? <-- optional parameter
app.get('/users/:id?', async (req, res) => {
  try {
    const { id } = req.params // get parameter id
    let getUser
    let message
    let data = []

    if (id) {
      // get user by id
      getUser = await db`SELECT * FROM users WHERE id = ${id}`
    } else {
      // get all users
      getUser = await db`SELECT * FROM users`
    }

    // check data
    if (getUser.length > 0) {
      message = 'Data retrieved successfully!'
      data = getUser
    } else {
      message = 'There is no data, please try again!'
    }

    res.status(200).json({
      status: true,
      message,
      data
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
})

// UPDATE DATA USERS ( UPDATE PROFILE USERS )
app.patch('/users/update/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, password, photo } = req.body

    let message
    let statusCode = 400
    let error = false

    // validating input
    const inputIsNull =
      name === null ||
      name === '' ||
      email === null ||
      email === '' ||
      phone === null ||
      phone === '' ||
      password === null ||
      password === ''

    const inputIsString =
      typeof name === 'string' &&
      typeof email === 'string' &&
      typeof phone === 'string' &&
      typeof password === 'string'

    // check input is string
    if (!inputIsString) {
      error = true
      message = 'Please fill all data!'
    }

    // check input is null
    if (inputIsNull) {
      error = true
      message = 'Please fill all data!'
    }

    // get data user
    const getUser = await db`SELECT * FROM users WHERE id=${id}`

    // if data doesnt exist
    if (!error && getUser.length < 1) {
      error = true
      message = 'Data not found, please try again!'
    }

    // update data user
    if (!error) {
      await db`UPDATE users SET "name"= ${name || getUser[0]?.name}, "email"= ${
        email || getUser[0]?.email
      }, "phone"= ${phone || getUser[0]?.phone}, "password"= ${
        password || getUser[0]?.password
      }, "photo"= ${
        photo || getUser[0]?.photo
      }, "updated_at"= ${updatedAt} WHERE id=${id}`
      statusCode = 200
      message = 'Data is successfully updated!'
    }

    // return response
    res.status(statusCode).json({
      status: !error,
      message
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// DELETE USER
app.delete('/users/delete/:id', async (req, res) => {
  try {
    const { id } = req.params
    let message
    let statuCode = 200
    let error = false

    // check data is exist
    const checkUser = await db`SELECT * FROM users WHERE id = ${id}`

    if (checkUser < 1) {
      message = 'There is no data, please try again!'
      error = true
      statuCode = 400
    } else {
      // query delete data from database
      await db`DELETE FROM users WHERE id=${id}`
      message = 'Data is successfully deleted!'
    }

    // return response
    res.status(statuCode).json({
      status: !error,
      message
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// ================== ENDPOINT RECIPES ==================

// ADD RECIPE
app.post('/recipes/add', async (req, res) => {
  try {
    const { userId, photo, title, ingredients, video, description } = req.body
    let error = false
    let message
    let statuCode = 400

    // check input string
    const isString =
      userId !== 'string' ||
      photo === 'string' ||
      title === 'string' ||
      ingredients === 'string' ||
      description === 'string'

    // check input is null
    const isNull =
      userId === '' ||
      userId === null ||
      photo === '' ||
      photo === null ||
      title === '' ||
      title === null ||
      ingredients === '' ||
      ingredients === null ||
      description === '' ||
      description === null

    // check  video is array
    const isArray = Array.isArray(video)

    if (!isString && !error) {
      error = true
      message = 'Input must be string!'
    }

    if (isNull && !error) {
      error = true
      message = 'Please fill all data!'
    }

    if (!isArray && !error) {
      error = true
      message = 'Video must be array!'
    }

    if (video.length < 1 && !error) {
      error = true
      message = 'Minimum input 1 video!'
    }

    if (!error) {
      // store data recipe to table recipes and return id
      const data =
        await db`INSERT INTO recipes (user_id, title, description, ingredients, photo, created_at, updated_at) VALUES(${userId}, ${title}, ${description}, ${ingredients}, ${photo}, ${createdAt}, ${updatedAt}) RETURNING id`

      // get id data after insert
      const id = data[0].id

      // convert array video to array object for query multiple insert
      const videos = video.map((item, key) => {
        return { recipe_id: id, video: item }
      })

      // store videos to table recipe_videos
      await db`INSERT INTO recipe_videos ${db(videos, 'recipe_id', 'video')}`

      message = 'Recipes is successfully added'
      statuCode = 201
    }

    res.status(statuCode).json({
      status: !error,
      message
      //   data: data,
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// SHOW RECIPE
// parameter id optional
app.get('/recipes/:id?', async (req, res) => {
  try {
    const { id } = req.params // get parameter id
    const { page, limit } = req.query // ?page=&limit= query params pagination
    let getRecipe
    let message
    let data = []

    if (id) {
      // get recipe by id
      getRecipe = await db`SELECT * FROM recipes WHERE id = ${id}`
    } else {
      // get all recipes with pagination
      getRecipe = await db`SELECT * FROM recipes LIMIT ${
        limit || null
      } OFFSET ${page && limit ? limit * (page - 1) : 0}`
    }

    // check data
    const totalData = getRecipe.length
    if (totalData > 0) {
      message = 'Data retrieved successfully!'
      data = getRecipe
    } else {
      message = 'There is no data, please try again!'
    }

    res.status(200).json({
      status: true,
      message,
      total: totalData,
      data
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
})

// UPDATE RECIPE
app.patch('/recipes/update/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, ingredients, photo } = req.body
    let message
    let statusCode = 400
    let error = false

    // validating input
    const isNull =
      title === 'null' ||
      title === '' ||
      description === 'null' ||
      description === '' ||
      ingredients === 'null' ||
      ingredients === '' ||
      photo === 'null' ||
      photo === ''

    const isString =
      typeof title === 'string' &&
      typeof description === 'string' &&
      typeof ingredients === 'string' &&
      typeof photo === 'string'

    // check input is string
    if (!error && !isString) {
      error = true
      message = 'All of input must be string'
    }

    // check input is null
    if (!error && isNull) {
      error = true
      message = 'Please fill all data!'
    }

    // check data recipe by id is exist
    const checkRecipe = await db`SELECT * FROM recipes WHERE id = ${id}`
    if (checkRecipe.length < 1 && !error) {
      error = true
      message = 'Data not found, please try again!'
    }

    if (!error) {
      // update recipe to database
      await db`UPDATE recipes SET "title"=${
        title || checkRecipe[0].title
      }, "description"=${
        description || checkRecipe[0].description
      }, "ingredients"=${ingredients || checkRecipe[0].ingredients}, "photo"=${
        photo || checkRecipe[0].photo
      }, "updated_at"=${updatedAt} WHERE id=${id}`

      message = 'Data is successfully updated!'
      statusCode = 200
    }
    res.status(statusCode).json({
      status: !error,
      message
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// DELETE RECIPE
app.delete('/recipes/delete/:id', async (req, res) => {
  try {
    const { id } = req.params
    let message
    let statuCode = 200
    let error = false

    // check data is exist
    const checkRecipe = await db`SELECT * FROM recipes WHERE id = ${id}`

    if (checkRecipe < 1) {
      message = 'There is no data, please try again!'
      error = true
      statuCode = 400
    } else {
      // query delete recipe by id from table recipes
      await db`DELETE FROM recipes WHERE id=${id}`

      // query delete recipe videos by recipe_id from table recipe_videos
      await db`DELETE FROM recipe_videos WHERE recipe_id=${id}`

      message = 'Data is successfully deleted!'
    }

    // return response
    res.status(statuCode).json({
      status: !error,
      message
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// SEARCH RECIPE by name
app.get('/recipes/data/search', async (req, res) => {
  try {
    const { keyword, page, limit } = req.query // ?keyword=&page=&limit= query params pagination
    let data = []
    let message
    let statuCode = 400
    let error = false
    let totalData = 0

    // check keyword is string
    if (typeof keyword !== 'string') {
      error = true
      message = 'Keyword must be string!'
    }

    // check keyword null
    if (!error && keyword === '') {
      error = true
      message = 'Keyword is reuired!'
    }

    if (!error) {
      const getData = await db`SELECT * FROM recipes WHERE title ILIKE ${
        '%' + keyword + '%'
      } LIMIT ${limit || null} OFFSET ${page ? limit * (page - 1) : 0}`

      statuCode = 200

      totalData = getData.length
      if (totalData < 1) {
        message = 'Data not found!'
      } else {
        message = 'Data retrieved successfully!'
        data = getData
      }
    }

    res.status(statuCode).json({
      status: !error,
      message,
      total: totalData,
      data
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// ORDER RECIPE by name ASC & DESC
app.get('/recipes/data/sort', async (req, res) => {
  try {
    const { columnSort, typeSort, limit, page } = req.query // query param => ?columnSort=&typeSort=

    const ascending = 'asc'
    const descending = 'desc'
    let getRecipe
    let message
    let data = []
    let error = false
    let statuCode = 400

    if (typeSort === ascending) {
      // order all recipes by asc
      getRecipe = await db`SELECT * FROM recipes ORDER BY ${db(
        columnSort
      )} ASC LIMIT ${limit || null} OFFSET ${page ? limit * (page - 1) : 0}`
      message = 'Data successfully sort by ascending'
      statuCode = 200
    } else if (typeSort === descending) {
      // order all recipes by desc
      getRecipe = await db`SELECT * FROM recipes ORDER BY ${db(
        columnSort
      )} DESC LIMIT ${limit || null} OFFSET ${
        page && limit ? limit * (page - 1) : 0
      }`
      message = 'Data successfully sort by descending'
      statuCode = 200
    } else {
      // typeSort parameter is not 1 = ascending or 0 = descending
      error = true
      message = 'Type sort data is unknown, please try again!'
    }

    // check data
    if (!error && getRecipe.length > 0) {
      data = getRecipe
    } else if (!error && getRecipe.length < 0) {
      message = 'There is no data, please try again!'
    }

    res.status(statuCode).json({
      status: true,
      message,
      total: getRecipe.length,
      data
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// ================== ENDPOINT COMMENTS ==================

// ADD COMMENT
app.post('/comments/add', async (req, res) => {
  try {
    const { userId, recipeId, comment } = req.body
    let error = false
    let message
    let statuCode = 400

    const isString =
      typeof userId === 'string' ||
      typeof recipeId === 'string' ||
      typeof comment === 'string'

    const isNull =
      userId === '' ||
      userId === null ||
      recipeId === '' ||
      recipeId === null ||
      comment === '' ||
      comment === null

    // check input string
    if (!isString && !error) {
      error = true
      message = 'Input must be string!'
    }

    // check input is null
    if (isNull && !error) {
      error = true
      message = 'Please fill all data!'
    }

    if (!error) {
      // store data comment to table comments
      await db`INSERT INTO comments (user_id, recipe_id, comment, created_at, updated_at) VALUES(${userId}, ${recipeId}, ${comment}, ${createdAt}, ${updatedAt})`

      message = 'Comment is successfully added'
      statuCode = 201
    }

    res.status(statuCode).json({
      status: !error,
      message
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// SHOW COMMENTS
// parameter id optional
app.get('/comments/:id?', async (req, res) => {
  try {
    const { id } = req.params // get parameter id
    let getComment
    let message
    let data = []

    if (id) {
      // get comment by id
      getComment = await db`SELECT * FROM comments WHERE id = ${id}`
    } else {
      // get all comments
      getComment = await db`SELECT * FROM comments`
    }

    // check data
    if (getComment.length > 0) {
      message = 'Data retrieved successfully!'
      data = getComment
    } else {
      message = 'There is no data, please try again!'
    }

    res.status(200).json({
      status: true,
      message,
      data
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
})

// SHOW COMMENTS by recipe_id
app.get('/comments/recipe/:recipe_id', async (req, res) => {
  try {
    const { recipe_id } = req.params // get parameter recipe_id
    let getComment
    let message
    let data = []

    // get comment by id
    getComment = await db`SELECT * FROM comments WHERE recipe_id = ${recipe_id}`

    // check data
    if (getComment.length > 0) {
      message = 'Data retrieved successfully!'
      data = getComment
    } else {
      message = 'There is no data, please try again!'
    }

    res.status(200).json({
      status: true,
      message,
      data
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
})

// UPDATE COMMENT
app.patch('/comments/update/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { comment } = req.body

    let message
    let statusCode = 400
    let error = false

    const inputIsString = typeof comment === 'string'
    const inputIsNull = comment === null || comment === ''

    // check input is string
    if (!inputIsString) {
      error = true
      message = 'Please fill all data!'
    }

    // check input is null
    if (inputIsNull) {
      error = true
      message = 'Please fill all data!'
    }

    // get data comment
    const getcomment = await db`SELECT * FROM comments WHERE id=${id}`

    // validasi users_id === comments.user_id

    // if data doesnt exist
    if (!error && getcomment.length < 1) {
      error = true
      message = 'Data not found, please try again!'
    }

    // update data comment
    if (!error) {
      await db`UPDATE comments SET "comment"= ${
        comment || getcomment[0]?.comment
      } WHERE id=${id}`
      statusCode = 200
      message = 'Data is successfully updated!'
    }

    // return response
    res.status(statusCode).json({
      status: !error,
      message
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// DELETE COMMENT
app.delete('/comments/delete/:id', async (req, res) => {
  try {
    const { id } = req.params
    let message
    let statuCode = 200
    let error = false

    // check data is exist
    const checkComment = await db`SELECT * FROM comments WHERE id = ${id}`

    if (checkComment < 1) {
      message = 'Id not found, please try again!'
      error = true
      statuCode = 400
    } else {
      // query delete data from database
      await db`DELETE FROM comments WHERE id=${id}`
      message = 'Data is successfully deleted!'
    }

    // return response
    res.status(statuCode).json({
      status: !error,
      message
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// ================== ENDPOINT RECiPE_VIDEOS ==================

// ADD RECiPE_VIDEOS
app.post('/recipe-videos/add', async (req, res) => {
  try {
    const { recipeId, video } = req.body
    let error = false
    let message
    let statuCode = 400

    const isString = typeof recipeId === 'string' || typeof video === 'string'

    const isNull =
      recipeId === '' || recipeId === null || video === '' || video === null

    // check input string
    if (!isString && !error) {
      error = true
      message = 'Input must be string!'
    }

    // check input is null
    if (isNull && !error) {
      error = true
      message = 'Please fill all data!'
    }

    if (!error) {
      // store data video to table recipe_videos
      await db`INSERT INTO recipe_videos (recipe_id, video) VALUES(${recipeId}, ${video})`

      message = 'Recipe video is successfully added'
      statuCode = 201
    }

    res.status(statuCode).json({
      status: !error,
      message
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// SHOW RECiPE_VIDEOS
// parameter id optional
app.get('/recipe-videos/:id?', async (req, res) => {
  try {
    const { id } = req.params // get parameter id
    let getVideo
    let message
    let data = []

    if (id) {
      // get recipe_videos by id
      getVideo = await db`SELECT * FROM recipe_videos WHERE id = ${id}`
    } else {
      // get all recipe_videos
      getVideo = await db`SELECT * FROM recipe_videos`
    }

    // check data
    if (getVideo.length > 0) {
      message = 'Data retrieved successfully!'
      data = getVideo
    } else {
      message = 'There is no data, please try again!'
    }

    res.status(200).json({
      status: true,
      message,
      data
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
})

// SHOW RECiPE_VIDEOS by recipe_id
// parameter id optional
app.get('/recipe-videos/recipe/:recipeId', async (req, res) => {
  try {
    const { recipeId } = req.params // get parameter id
    let getVideo
    let message
    let data = []

    // get recipe_videos by recipe_id
    getVideo =
      await db`SELECT * FROM recipe_videos WHERE recipe_id = ${recipeId}`

    // check data
    if (getVideo.length > 0) {
      message = 'Data retrieved successfully!'
      data = getVideo
    } else {
      message = 'There is no data, please try again!'
    }

    res.status(200).json({
      status: true,
      message,
      data
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
})

// UPDATE RECiPE_VIDEOS
app.patch('/recipe-videos/update/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { video } = req.body

    let message
    let statusCode = 400
    let error = false

    const inputIsString = typeof video === 'string'
    const inputIsNull = video === null || video === ''

    // check input is string
    if (!inputIsString) {
      error = true
      message = 'Please fill all data!'
    }

    // check input is null
    if (inputIsNull) {
      error = true
      message = 'Please fill all data!'
    }

    // get data video
    const getVideo = await db`SELECT * FROM recipe_videos WHERE id=${id}`

    // if data doesnt exist
    if (!error && getVideo.length < 1) {
      error = true
      message = 'Data not found, please try again!'
    }

    // update data video
    if (!error) {
      await db`UPDATE recipe_videos SET "video"= ${
        video || getVideo[0]?.video
      } WHERE id=${id}`
      statusCode = 200
      message = 'Data is successfully updated!'
    }

    // return response
    res.status(statusCode).json({
      status: !error,
      message
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// DELETE RECiPE_VIDEOS
app.delete('/recipe-videos/delete/:id', async (req, res) => {
  try {
    const { id } = req.params
    let message
    let statuCode = 200
    let error = false

    // check data is exist
    const checkComment = await db`SELECT * FROM recipe_videos WHERE id = ${id}`

    if (checkComment < 1) {
      message = 'Id not found, please try again!'
      error = true
      statuCode = 400
    } else {
      // query delete data from database
      await db`DELETE FROM recipe_videos WHERE id=${id}`
      message = 'Data is successfully deleted!'
    }

    // return response
    res.status(statuCode).json({
      status: !error,
      message
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error?.message ?? error
    })
  }
})

// running express port 3000
app.listen(port, () => {
  console.log(`App is running on port ${port}`)
})
