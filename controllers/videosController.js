const router = require('express').Router()
const recipeVideos = require('../models/recipeVideos')
const recipes = require('../models/recipes')

// create videos
const createRecipeVideos = async (req, res) => {
  try {
    const { recipeId, video } = req.body

    // check recipe_id is exist
    const checkRecipes = await recipes.getRecipes({ id: recipeId })

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
    const { recipeId, video } = req.body

    // check data recipe by id is exist
    const getVideos = await recipeVideos.getVideos({ id })
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

    // check data is exist
    const getVideos = await recipeVideos.getVideos({ id, recipeId })

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
