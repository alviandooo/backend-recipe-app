const comments = require('../models/comments')
const recipes = require('../models/recipes')
const users = require('../models/users')

// create comments
const createComments = async (req, res) => {
  try {
    const { userId, recipeId, comment } = req.body

    // validasi userId is exist
    const checkUsers = await users.getUsers({ id: userId })
    if (checkUsers.length < 1) {
      throw { statusCode: 400, message: 'User doesnt exist!' }
    }

    // check recipe_id is exist
    const checkRecipes = await recipes.getRecipes({ id: recipeId })

    if (checkRecipes.length < 1) {
      throw { statusCode: 400, message: 'Recipe ID doesnt exist!' }
    }

    // store data comment to table comments
    await comments.createComments({ userId, recipeId, comment })

    res.status(201).json({
      status: true,
      message: 'Comment is successfully added'
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error
    })
  }
}

// get comments
const getComments = async (req, res) => {
  try {
    const statusCode = 200
    let message
    let getComments = []

    const { id } = req.params // get parameter id
    const { recipeId, limit, page, sort, typeSort } = req.query // ?limit=&page=&sort=&typeSort=

    if (id) {
      // get by id
      getComments = await comments.getComments({ id })
    } else if (recipeId) {
      // get by user_id
      getComments = await comments.getComments({
        recipeId,
        limit,
        page,
        sort,
        typeSort
      })
    } else {
      getComments = await comments.getComments({ limit, page, sort, typeSort })
    }

    if (getComments.length < 1) {
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
      total: getComments.length,
      data: getComments
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
}

// update comments
const updateComments = async (req, res) => {
  try {
    const { id } = req.params
    const { userId, comment } = req.body

    // get data comment
    const getComment = await comments.getComments({ id })

    // if data doesnt exist
    if (getComment.length < 1) {
      throw { statusCode: 400, message: 'Data doesnt exist!' }
    }

    // validasi users_id === comments.user_id
    if (userId !== getComment[0].user_id) {
      throw { statusCode: 403, message: 'User not allowed!' }
    }

    // update data comment
    await comments.editComments({ id, comment })

    // return response
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

// delete comments
const deleteComments = async (req, res) => {
  try {
    const { id } = req.params
    const { recipeId } = req.query

    // check data is exist
    const getComment = await comments.getComments({ id, recipeId })

    if (getComment < 1) {
      throw { statusCode: 400, message: 'Data doesnt exist!' }
    } else {
      // delete data from database
      await comments.deleteComments({ id, recipeId })
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

module.exports = { createComments, getComments, updateComments, deleteComments }
