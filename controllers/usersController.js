const users = require('../models/users')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

// get users
const getUsers = async (req, res) => {
  try {
    let statusCode = 200
    let message
    let dataUsers = []

    const { id } = req.params // get parameter id
    const { limit, page, sort, typeSort } = req.query // ?limit=&page=&sort=&typeSort=

    if (id) {
      dataUsers = await users.getUsers({ id })
    } else {
      dataUsers = await users.getUsers({ limit, page, sort, typeSort })
    }

    if (dataUsers.length < 1) {
      statusCode = 400 // no content
      message = 'Data not found!'
    }

    res.status(statusCode ?? 200).json({
      status: true,
      message: message ?? 'Data successfully retrieved!',
      sort: sort ?? null,
      typeSort: typeSort ?? null,
      page: parseInt(page) ?? 1,
      limit: parseInt(limit) ?? null,
      total: dataUsers.length,
      data: dataUsers
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
}

// create users
const create = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    // validating email is exist
    const checkEmail = await users.getUsers({ email })
    if (checkEmail.length > 0) {
      throw { statusCode: 409, message: 'Email is already exist!' }
    }

    // deklarasi file image
    let file = req.files?.photo

    if (file) {
      // if file upload exist
      // get root folder
      let root = path.dirname(require.main.filename)

      let filename = `${uuidv4()}-${file.name}`

      // upload images path
      uploadPath = `${root}/public/images/${filename}`

      // Use the mv() method to place the file server
      file.mv(uploadPath, async (err) => {
        if (err) {
          throw { statusCode: 400, message: 'Authentication is failed!' }
        } else {
          await users.createUsers({
            name,
            email,
            password,
            phone,
            photo: `/images/${filename}`
          })
        }
      })
    } else {
      await users.createUsers({ name, email, password, phone })
    }

    // return response
    res.status(201).json({
      status: true,
      message: 'Register is successfully!'
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
}

// edit users
const editUsers = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, password, photo } = req.body

    // get data users
    const getUser = await users.getUsers({ id })

    // if id doesnt exist
    if (getUser.length < 1) {
      throw { statusCode: 400, message: 'Data doesnt exist!' }
    }

    // check email is already exist
    if (email) {
      const checkEmail = await users.getUsers({ email })
      if (checkEmail.length > 0) {
        throw { statusCode: 409, message: 'Email is already exist!' }
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
      uploadPath = `${root}/public/images/${filename}`

      // Use the mv() method to place the file server
      file.mv(uploadPath, async (err) => {
        if (err) {
          throw { statusCode: 400, message: 'Authentication is failed!' }
        }
      })
    }

    // update data users
    await users.editUsers({
      id,
      name: name ?? getUser[0].name,
      email: email ?? getUser[0].email,
      phone: phone ?? getUser[0].phone,
      password: password ?? getUser[0].password,
      photo: file ? `/images/${filename}` : getUser[0].photo
    })

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

// delete users
const deleteUsers = async (req, res) => {
  try {
    const { id } = req.params

    // check data is exist
    const checkUser = await users.getUsers({ id })

    if (checkUser < 1) {
      throw { statusCode: 400, message: 'Data doesnt exist!' }
    } else {
      // delete data from database
      await users.deleteUsers({ id })
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

module.exports = { getUsers, create, editUsers, deleteUsers }
