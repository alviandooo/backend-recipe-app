const db = require('../db')
const updatedAt = new Date()
const createdAt = new Date()

// get recipes
const getRecipes = async (params) => {
  const { id, userId, limit, page, sort, typeSort } = params

  // get data by id
  if (id) {
    return await db`SELECT recipes.*, users.* FROM recipes LEFT JOIN users ON users.id = recipes.user_id WHERE recipes.id = ${id}`
  }

  if (userId) {
    // get data by user_id with sort
    if (sort) {
      return typeSort && typeSort === 'desc'
        ? await db`SELECT (
      SELECT COUNT(*)
      FROM   recipes
      ) AS total_recipes, recipes.*, users.* FROM recipes LEFT JOIN users ON users.id = recipes.user_id WHERE recipes.user_id = ${userId} ORDER BY ${db(
            sort
          )} DESC LIMIT ${limit ?? null} OFFSET ${
            page ? limit * (page - 1) : 0
          }`
        : await db`SELECT (
      SELECT COUNT(*)
      FROM   recipes
      ) AS total_recipes, recipes.*, users.* FROM recipes LEFT JOIN users ON users.id = recipes.user_id WHERE recipes.user_id = ${userId} ORDER BY ${db(
            sort
          )} ASC LIMIT ${limit ?? null} OFFSET ${page ? limit * (page - 1) : 0}`
    } else {
      // get all data without sort
      return await db`SELECT (
      SELECT COUNT(*)
      FROM   recipes
      ) AS total_recipes, recipes.*, users.* FROM recipes LEFT JOIN users ON users.id = recipes.user_id WHERE recipes.user_id = ${userId} LIMIT ${
        limit ?? null
      } OFFSET ${page ? limit * (page - 1) : 0}`
    }
  }

  // get all data with sort
  if (sort) {
    return typeSort && typeSort === 'desc'
      ? await db`SELECT (
      SELECT COUNT(*)
      FROM   recipes
      ) AS total_recipes, recipes.*, users.* FROM recipes LEFT JOIN users ON users.id = recipes.user_id ORDER BY ${db(
        sort
      )} DESC LIMIT ${limit ?? null} OFFSET ${page ? limit * (page - 1) : 0}`
      : await db`SELECT (
      SELECT COUNT(*)
      FROM   recipes
      ) AS total_recipes, recipes.*, users.* FROM recipes LEFT JOIN users ON users.id = recipes.user_id ORDER BY ${db(
        sort
      )} ASC LIMIT ${limit ?? null} OFFSET ${page ? limit * (page - 1) : 0}`
  } else {
    // get all data without sort
    return await db`SELECT (
      SELECT COUNT(*)
      FROM   recipes
      ) AS total_recipes, recipes.*, users.* FROM recipes LEFT JOIN users ON users.id = recipes.user_id LIMIT ${
        limit ?? null
      } OFFSET ${page ? limit * (page - 1) : 0}`
  }
}

// create recipes
const createRecipes = async (params) => {
  const { userId, photo, title, ingredients, description } = params
  return await db`INSERT INTO recipes (user_id, title, description, ingredients, photo, created_at, updated_at) VALUES(${userId}, ${title}, ${description}, ${ingredients}, ${photo}, ${createdAt}, ${updatedAt}) RETURNING id`
}

// update recipes
const editRecipes = async (params) => {
  const { id, title, description, ingredients, photo } = params
  return await db`UPDATE recipes SET "title"=${title}, "description"=${description}, "ingredients"=${ingredients}, "photo"=${photo}, "updated_at"=${updatedAt} WHERE id=${id}`
}

// delete recipes
const deleteRecipes = async (params) => {
  const { id } = params
  return await db`DELETE FROM recipes WHERE id=${id}`
}

// search recipes
const searchRecipes = async (params) => {
  const { searchBy, keyword, limit, page, sort, typeSort } = params

  // search data with sort
  if (sort) {
    return typeSort && typeSort === 'desc'
      ? await db`SELECT (
      SELECT COUNT(*)
      FROM recipes WHERE
      ) AS total_recipes, recipes.*, users.* FROM recipes LEFT JOIN users ON users.id = recipes.user_id WHERE ${db(
        `recipes.${searchBy}`
      )} ILIKE ${'%' + keyword + '%'} ORDER BY ${db(sort)} DESC LIMIT ${
          limit ?? null
        } OFFSET ${page ? limit * (page - 1) : 0}`
      : await db`SELECT (
      SELECT COUNT(*)
      FROM recipes WHERE 
      ) AS total_recipes, recipes.*, users.* FROM recipes LEFT JOIN users ON users.id = recipes.user_id WHERE ${db(
        `recipes.${searchBy}`
      )} ILIKE ${'%' + keyword + '%'} ORDER BY ${db(sort)} ASC LIMIT ${
          limit ?? null
        } OFFSET ${page ? limit * (page - 1) : 0}`
  } else {
    // search data without
    return await db`SELECT (
      SELECT COUNT(*)
      FROM recipes WHERE ${db(`recipes.${searchBy}`)} ILIKE ${
      '%' + keyword + '%'
    }
      ) AS total_recipes, recipes.*, users.* FROM recipes LEFT JOIN users ON users.id = recipes.user_id WHERE ${db(
        `recipes.${searchBy}`
      )} ILIKE ${'%' + keyword + '%'} LIMIT ${limit ?? null} OFFSET ${
      page ? limit * (page - 1) : 0
    }`
  }
}

module.exports = {
  getRecipes,
  createRecipes,
  editRecipes,
  deleteRecipes,
  searchRecipes
}
