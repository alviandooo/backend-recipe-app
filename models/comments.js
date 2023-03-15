const db = require('../db')

const updatedAt = new Date()

// get comments
const getComments = async (params) => {
  const { id, recipeId, limit, page, sort, typeSort } = params

  // get data by id
  if (id) {
    return await db`SELECT * FROM comments WHERE id = ${id}`
  }

  if (recipeId) {
    // get data by recipe_id with sort
    if (sort) {
      return typeSort && typeSort === 'desc'
        ? await db`SELECT * FROM comments WHERE recipe_id = ${recipeId} ORDER BY ${db(
            sort
          )} DESC LIMIT ${limit ?? null} OFFSET ${
            page ? limit * (page - 1) : 0
          }`
        : await db`SELECT * FROM comments WHERE recipe_id = ${recipeId} ORDER BY ${db(
            sort
          )} ASC LIMIT ${limit ?? null} OFFSET ${page ? limit * (page - 1) : 0}`
    } else {
      // get all data without sort
      return await db`SELECT * FROM comments WHERE recipe_id = ${recipeId} ORDER BY created_at DESC LIMIT ${
        limit ?? null
      } OFFSET ${page ? limit * (page - 1) : 0}`
    }
  }

  // get all data with sort
  if (sort) {
    return typeSort && typeSort === 'desc'
      ? await db`SELECT * FROM comments ORDER BY ${db(sort)} DESC LIMIT ${
          limit ?? null
        } OFFSET ${page ? limit * (page - 1) : 0}`
      : await db`SELECT * FROM comments ORDER BY ${db(sort)} ASC LIMIT ${
          limit ?? null
        } OFFSET ${page ? limit * (page - 1) : 0}`
  } else {
    // get all data without sort
    return await db`SELECT * FROM comments LIMIT ${limit ?? null} OFFSET ${
      page ? limit * (page - 1) : 0
    }`
  }
}

// create comments
const createComments = async (params) => {
  const { userId, recipeId, comment } = params
  return await db`INSERT INTO comments( user_id, recipe_id, comment ) VALUES(${userId}, ${recipeId}, ${comment})`
}

// update comments
const editComments = async (params) => {
  const { id, comment } = params
  return await db`UPDATE comments SET "comment"=${comment}, "updated_at"=${updatedAt} WHERE id=${id}`
}

// delete Comments
const deleteComments = async (params) => {
  const { id, recipeId } = params

  if (recipeId) {
    return await db`DELETE FROM comments WHERE recipe_id = ${recipeId}`
  } else {
    return await db`DELETE FROM comments WHERE id = ${id}`
  }
}

module.exports = { createComments, getComments, editComments, deleteComments }
