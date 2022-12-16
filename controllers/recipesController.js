const recipes = require('../models/recipes')
const users = require('../models/users')
const recipeVideos = require('../models/recipeVideos')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const getRecipes = async (req, res) => {
  try {
    const statusCode = 200
    let message
    let dataRecipes = []

    const { id } = req.params // get parameter id
    const { userId, limit, page, sort, typeSort } = req.query // ?limit=&page=&sort=&typeSort=

    if (id) {
      // get by id
      dataRecipes = await recipes.getRecipes({ id })
    } else if (userId) {
      // get by user_id
      dataRecipes = await recipes.getRecipes({
        userId,
        limit,
        page,
        sort,
        typeSort
      })
    } else {
      dataRecipes = await recipes.getRecipes({ limit, page, sort, typeSort })
    }

    if (dataRecipes.length < 1) {
      //   statusCode = 204
      message = 'Data not found!'
    }

    res.status(statusCode ?? 200).json({
      status: true,
      message: message ?? 'Data successfully retrieved!',
      sort: sort ?? null,
      typeSort: typeSort ?? null,
      page: parseInt(page) ?? 1,
      limit: parseInt(limit) ?? null,
      total: dataRecipes.length,
      data: dataRecipes
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
}

const createRecipes = async (req, res) => {
  try {
    const { userId, photo, title, ingredients, video, description } = req.body

    // validasi userId is exist
    const checkUsers = await users.getUsers({ id: userId })
    if (checkUsers.length < 1) {
      throw { statusCode: 400, message: 'User doesnt exist!' }
    }

    // deklarasi file image
    let file = req.files?.photo
    let filename = `${uuidv4()}-${file?.name}`

    if (file) {
      // if file upload exist
      // get root folder
      let root = path.dirname(require.main.filename)

      // upload images path
      uploadPath = `${root}/public/images/recipes/${filename}`

      // Use the mv() method to place the file server
      file.mv(uploadPath, async (err) => {
        if (err) {
          throw { statusCode: 400, message: 'Authentication is failed!' }
        }
      })
    } else {
      throw { statusCode: 400, message: 'File photo not found!' }
    }

    // store data recipe to table recipes and return id
    const data = await recipes.createRecipes({
      userId,
      photo: `/images/recipes/${filename}`,
      title,
      ingredients,
      video,
      description
    })

    // check video
    if (video?.length > 0) {
      // get id data after insert
      const id = data[0].id

      // convert array video to array object for query multiple insert
      const videos = video.map((item, key) => {
        return { recipe_id: id, video: item }
      })

      // store videos to table recipe_videos
      await recipeVideos.createVideos({ videos })
    }

    res.status(200).json({
      status: true,
      message: 'Recipe is successfully created!',
      data: []
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
}

const updateRecipes = async (req, res) => {
  try {
    const { id } = req.params
    const { userId, title, description, ingredients, photo } = req.body

    // check data recipe by id is exist
    const getRecipes = await recipes.getRecipes({ id })
    if (getRecipes.length < 1) {
      throw { statusCode: 400, message: 'Data not found, please try again!' }
    }

    // check if userId is allowed
    if (getRecipes[0].user_id !== parseInt(userId)) {
      throw {
        statusCode: 403,
        message: 'User is not allowed to access this content!'
      }
    }

    // deklarasi file image
    let file = req.files?.photo
    let filename = `${uuidv4()}-${file?.name}`

    if (file) {
      // if file upload exist
      // get root folder
      let root = path.dirname(require.main.filename)

      // upload images path
      uploadPath = `${root}/public/images/recipes/${filename}`

      // Use the mv() method to place the file server
      file.mv(uploadPath, async (err) => {
        if (err) {
          throw { statusCode: 400, message: 'Authentication is failed!' }
        }
      })
    }

    // update data
    await recipes.editRecipes({
      id,
      title: title ?? getRecipes[0].title,
      description: description ?? getRecipes[0].description,
      ingredients: ingredients ?? getRecipes[0].ingredients,
      photo: file ? `/images/recipes/${filename}` : getRecipes[0].photo
    })

    res.status(200).json({
      status: true,
      message: 'Data is successfully updated!'
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error
    })
  }
}

// delete recipes
const deleteRecipes = async (req, res) => {
  try {
    const { id } = req.params

    // check data is exist
    const getRecipes = await recipes.getRecipes({ id })

    if (getRecipes < 1) {
      throw { statusCode: 400, message: 'Data doesnt exist!' }
    } else {
      // delete data from database
      await recipes.deleteRecipes({ id })
    }

    // return response
    res.status(200).json({
      status: true,
      message: 'Data successfully deleted!'
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error
    })
  }
}

// search recipes
const searchRecipes = async (req, res) => {
  try {
    const { searchBy, keyword, page, limit, sort, typeSort } = req.query // ?keyword=&page=&limit= query params pagination

    const getData = await recipes.searchRecipes({
      searchBy,
      keyword,
      page,
      limit,
      sort,
      typeSort
    })

    totalData = getData.length
    if (totalData < 1) {
      throw { statusCode: 400, message: 'Data not found!' }
    }

    res.status(200).json({
      status: true,
      message: 'Data retrieved successfully!',
      searchBy,
      keyword,
      limit,
      page,
      total: totalData,
      data: getData
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error
    })
  }
}

module.exports = {
  getRecipes,
  createRecipes,
  updateRecipes,
  deleteRecipes,
  searchRecipes
}
