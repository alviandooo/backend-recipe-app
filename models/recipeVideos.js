const db = require('../db')

const updatedAt = new Date()

// get videos
const getVideos = async (params) => {
  const { id, recipeId, limit, page, sort, typeSort } = params

  // get data by id
  if (id) {
    return await db`SELECT * FROM recipe_videos WHERE id = ${id}`
  }

  if (recipeId) {
    // get data by recipe_id with sort
    if (sort) {
      return typeSort && typeSort === 'desc'
        ? await db`SELECT * FROM recipe_videos WHERE recipe_id = ${recipeId} ORDER BY ${db(
            sort
          )} DESC LIMIT ${limit ?? null} OFFSET ${
            page ? limit * (page - 1) : 0
          }`
        : await db`SELECT * FROM recipe_videos WHERE recipe_id = ${recipeId} ORDER BY ${db(
            sort
          )} ASC LIMIT ${limit ?? null} OFFSET ${page ? limit * (page - 1) : 0}`
    } else {
      // get all data without sort
      return await db`SELECT * FROM recipe_videos WHERE recipe_id = ${recipeId} LIMIT ${
        limit ?? null
      } OFFSET ${page ? limit * (page - 1) : 0}`
    }
  }

  // get all data with sort
  if (sort) {
    return typeSort && typeSort === 'desc'
      ? await db`SELECT * FROM recipe_videos ORDER BY ${db(sort)} DESC LIMIT ${
          limit ?? null
        } OFFSET ${page ? limit * (page - 1) : 0}`
      : await db`SELECT * FROM recipe_videos ORDER BY ${db(sort)} ASC LIMIT ${
          limit ?? null
        } OFFSET ${page ? limit * (page - 1) : 0}`
  } else {
    // get all data without sort
    return await db`SELECT * FROM recipe_videos LIMIT ${limit ?? null} OFFSET ${
      page ? limit * (page - 1) : 0
    }`
  }
}

// create videos
const createVideos = async (params) => {
  const { videos } = params
  return await db`INSERT INTO recipe_videos ${db(videos, 'recipe_id', 'video')}`
}

// update videos
const editVideos = async (params) => {
  const { id, video } = params
  return await db`UPDATE recipe_videos SET "video"=${video} WHERE id=${id}`
}

// delete Videos
const deleteVideos = async (params) => {
  const { id, recipeId } = params

  if (recipeId) {
    return await db`DELETE FROM recipe_videos WHERE recipe_id = ${recipeId}`
  } else {
    return await db`DELETE FROM recipe_videos WHERE id = ${id}`
  }
}

module.exports = { createVideos, getVideos, editVideos, deleteVideos }
