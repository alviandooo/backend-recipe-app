const db = require('../db')

const updatedAt = new Date()
const createdAt = new Date()

// Get Users by id
const getUsers = async (params) => {
  const { id, email, limit, page, sort, typeSort } = params
  // get data by id
  if (id) {
    return await db`SELECT * FROM users WHERE id = ${id}`
  }

  // get data by email
  if (email) {
    return await db`SELECT * FROM users WHERE email = ${email}`
  }

  // get all data with sort
  if (sort) {
    return typeSort && typeSort === 'desc'
      ? await db`SELECT * FROM users ORDER BY ${db(sort)} DESC LIMIT ${
          limit ?? null
        } OFFSET ${page ? limit * (page - 1) : 0}`
      : await db`SELECT * FROM users ORDER BY ${db(sort)} ASC LIMIT ${
          limit ?? null
        } OFFSET ${page ? limit * (page - 1) : 0}`
  } else {
    return await db`SELECT * FROM users LIMIT ${limit ?? null} OFFSET ${
      page ? limit * (page - 1) : 0
    }`
  }
}

const createUsers = async (params) => {
  const { name, email, password, phone, photo } = params

  if (photo) {
    return await db`INSERT INTO users (name, email, phone, password, photo, created_at, updated_at) VALUES(${name}, ${email}, ${phone}, ${password}, ${photo}, ${createdAt}, ${updatedAt})`
  } else {
    return await db`INSERT INTO users (name, email, phone, password, created_at, updated_at) VALUES(${name}, ${email}, ${phone}, ${password}, ${createdAt}, ${updatedAt})`
  }
}

const editUsers = async (params) => {
  const { id, name, email, password, phone, photo } = params
  return await db`UPDATE users SET "name"= ${name}, "email"= ${email}, "phone"= ${phone}, "password"= ${password}, "photo"= ${photo}, "updated_at"= ${updatedAt} WHERE id=${id} RETURNING *`
}

const deleteUsers = async (params) => {
  const { id } = params
  return await db`DELETE FROM users WHERE id=${id}`
}

module.exports = { getUsers, createUsers, editUsers, deleteUsers }
