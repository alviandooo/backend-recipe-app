const router = require('express').Router()
const recipeVideos = require('../models/recipeVideos')
const recipes = require('../models/recipes')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// get user_id from token jwt session
const getUserId = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_KEY)
  return decoded?.data?.id
}

// create videos
const createRecipeVideos = async (req, res) => {
  try {
    const { recipeId, video } = req.body
    const { authorization } = req.headers

    // get user id from token session
    const userId = getUserId(authorization.replace('Bearer ', ''))

    // check recipe_id is exist
    const checkRecipes = await recipes.getRecipes({ id: recipeId })

    if (userId !== checkRecipes[0]?.user_id) {
      throw { statusCode: 401, message: 'User not allowed!' }
    }

    if (checkRecipes.length < 1) {
      throw { statusCode: 400, message: 'Recipe ID doesnt exist!' }
    }

    // store data recipe to table recipes and return id
    await recipeVideos.createVideos({
      videos: { recipe_id: recipeId, video }
    })

    res.status(200).json({
      status: true,
      message: 'Recipe Videos is successfully created!',
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

// get videos
const getRecipeVideos = async (req, res) => {
  try {
    const statusCode = 200
    let message
    let videos = []

    const { id } = req.params // get parameter id
    const { recipeId, limit, page, sort, typeSort } = req.query // ?limit=&page=&sort=&typeSort=

    if (id) {
      // get by id
      videos = await recipeVideos.getVideos({ id })
    } else if (recipeId) {
      // get by user_id
      videos = await recipeVideos.getVideos({
        recipeId,
        limit,
        page,
        sort,
        typeSort
      })
    } else {
      videos = await recipeVideos.getVideos({ limit, page, sort, typeSort })
    }

    if (videos.length < 1) {
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
      total: videos.length,
      data: videos
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
}

const updateRecipeVideos = async (req, res) => {
  try {
    const { id } = req.params
    const { video } = req.body
    const { authorization } = req.headers

    // get user id from token session
    const userId = getUserId(authorization.replace('Bearer ', ''))

    // check data recipe by id is exist
    const getVideos = await recipeVideos.getVideos({ id })

    if (userId !== getVideos[0]?.user_id) {
      throw { statusCode: 401, message: 'User not allowed!' }
    }

    if (getVideos.length < 1) {
      throw { statusCode: 400, message: 'Data not found, please try again!' }
    }

    // update data
    await recipeVideos.editVideos({
      id,
      video: video ?? getVideos[0].video
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

// delete videos
const deleteRecipeVideos = async (req, res) => {
  try {
    const { id } = req.params
    const { recipeId } = req.query
    const { authorization } = req.headers

    // get user id from token session
    const userId = getUserId(authorization.replace('Bearer ', ''))

    // check data is exist
    const getVideos = await recipeVideos.getVideos({ id, recipeId })

    if (userId !== getVideos[0]?.user_id) {
      throw { statusCode: 401, message: 'User not allowed!' }
    }

    if (getVideos < 1) {
      throw { statusCode: 400, message: 'Data doesnt exist!' }
    } else {
      // delete data from database
      await recipeVideos.deleteVideos({ id, recipeId })
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

module.exports = {
  getRecipeVideos,
  deleteRecipeVideos,
  createRecipeVideos,
  updateRecipeVideos
}
