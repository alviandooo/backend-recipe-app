const recipes = require('../models/recipes')
const users = require('../models/users')
const recipeVideos = require('../models/recipeVideos')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { connectRedis } = require('../middlewares/redis')
const jwt = require('jsonwebtoken')
const { decodeToken } = require('../utils/JWTToken')
const { checkSizeUpload, checkExtensionFile } = require('../utils/uploadFile')
const { uploadCloudinary, deleteCloudinary } = require('../utils/cloudinary')

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

    // store data to redis for 10 seconds
    connectRedis.set('url', req.originalUrl, 'ex', 10)
    connectRedis.set('data', JSON.stringify(dataRecipes), 'ex', 10)
    if (sort) connectRedis.set('sort', sort, 'ex', 10)
    if (typeSort) connectRedis.set('typeSort', typeSort, 'ex', 10)
    if (page) connectRedis.set('page', page ?? 1, 'ex', 10)
    if (limit) connectRedis.set('limit', limit, 'ex', 10)

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
    const { title, ingredients, video, description } = req.body
    const { authorization } = req.headers

    // decode jwt token
    const decoded = decodeToken(authorization)
    // get user id from jwt token
    const userIdToken = decoded?.data?.id

    // validate userId is exist
    const checkUsers = await users.getUsers({ id: userIdToken })
    if (checkUsers.length < 1) {
      throw { statusCode: 400, message: 'User doesnt exist!' }
    }

    // declare file image
    let file = req.files?.photo

    if (file) {
      // check size file upload
      const checkSize = checkSizeUpload(file)
      if (!checkSize) {
        throw {
          statusCode: 400,
          message: 'File upload is too large! only support < 1 MB'
        }
      }

      // check type extension file upload
      const allowedFile = checkExtensionFile(file)
      if (!allowedFile) {
        throw {
          statusCode: 400,
          message: `File is not support! format file must be image`
        }
      }

      // upload file
      const uploadFile = await uploadCloudinary(file)
      if (!uploadFile.success) {
        throw { statusCode: 400, message: 'Upload file error!' }
      } else {
        // store data recipe to table recipes and return id
        const data = await recipes.createRecipes({
          userId: userIdToken,
          photo: uploadFile.urlUpload,
          title,
          ingredients,
          description
        })

        let videos
        // get id data after insert
        const id = data[0].id
        // check video
        if (Array.isArray(video)) {
          // convert array video to array object for query multiple insert
          videos = video.map((item) => {
            return { recipe_id: id, video: item }
          })
        } else {
          videos = { recipe_id: id, video: video }
        }

        // store videos to table recipe_videos
        await recipeVideos.createVideos({ videos })
      }
    } else {
      throw {
        statusCode: 400,
        message: `Photo must be required!`
      }
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
    const { title, description, ingredients } = req.body
    const { authorization } = req.headers

    // decode jwt token
    const decoded = decodeToken(authorization)

    // get user id from jwt token
    const userIdToken = decoded?.data?.id

    // validate userId is exist
    const checkUsers = await users.getUsers({ id: userIdToken })
    if (checkUsers.length < 1) {
      throw { statusCode: 400, message: 'User doesnt exist!' }
    }

    // check data recipe by id is exist
    const getRecipes = await recipes.getRecipes({ id })
    if (getRecipes.length < 1) {
      throw { statusCode: 400, message: 'Data not found, please try again!' }
    }

    // declare file image
    let file = req.files?.photo
    let filename = null

    if (file) {
      // check size file upload
      const checkSize = checkSizeUpload(file)
      if (!checkSize) {
        throw {
          statusCode: 400,
          message: 'File upload is too large! only support < 1 MB'
        }
      }

      // check type extension file upload
      const allowedFile = checkExtensionFile(file)
      if (!allowedFile) {
        throw {
          statusCode: 400,
          message: `File is not support! format file must be image`
        }
      }

      // upload file
      const uploadFile = await uploadCloudinary(file)
      if (!uploadFile.success) {
        throw { statusCode: 400, message: 'Upload file error!' }
      } else {
        filename = uploadFile.urlUpload
      }

      // delete old file
      const deleteFile = await deleteCloudinary(getRecipes[0].photo)
      if (!deleteFile.success) {
        throw { statusCode: 400, message: 'Delete old file error!' }
      }
    }

    // update data
    await recipes.editRecipes({
      id,
      title: title ?? getRecipes[0].title,
      description: description ?? getRecipes[0].description,
      ingredients: ingredients ?? getRecipes[0].ingredients,
      photo: filename ?? getRecipes[0].photo
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
      // delete old photo profil
      const deleteFile = await deleteCloudinary(getRecipes[0].photo)
      if (!deleteFile.success) {
        throw { statusCode: 400, message: 'Delete old photo error!' }
      }

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
