const users = require('../models/users')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const { connectRedis } = require('../middlewares/redis')
const bcrypt = require('bcrypt')

const extFile = ['jpeg', 'JPEG', 'jpg', 'JPG', 'PNG', 'png', 'webp', 'WEBP']
const saltRounds = 10

// get users
const getUsers = async (req, res) => {
  try {
    let statusCode = 200
    let message
    let dataUsers = []
    let url

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

    // store data to redis for 10 seconds
    connectRedis.set('url', req.originalUrl, 'ex', 10)
    connectRedis.set('data', JSON.stringify(dataUsers), 'ex', 10)
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

    // hash password
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        throw { statusCode: 500, message: 'Authenticate is Failed!' }
      }

      // deklarasi file image
      let file = req.files?.photo

      if (file) {
        // if file upload exist

        //if file extension is allowed
        const mimeType = file.mimetype.split('/')[1]
        const allowedFile = extFile.includes(mimeType)
        if (!allowedFile) {
          throw {
            statusCode: 400,
            message: 'File is not support! please select image file'
          }
        }

        // get root folder
        let root = path.dirname(require.main.filename)

        let filename = `${uuidv4()}-${file?.name}`

        // upload images path
        uploadPath = `${root}/public/images/profiles/${filename}`

        // Use the mv() method to place the file server
        file.mv(uploadPath, async (err) => {
          if (err) {
            throw { statusCode: 400, message: 'Authentication is failed!' }
          } else {
            await users.createUsers({
              name,
              email,
              password: hash,
              phone,
              photo: `/images/profiles/${filename}`
            })
          }
        })
      } else {
        await users.createUsers({ name, email, password: hash, phone })
      }
    })

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
    const { name, email, phone, password } = req.body

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

    // hash password
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        throw { statusCode: 500, message: 'Authenticate is Failed!' }
      }

      // deklarasi file image
      let file = req.files?.photo

      let filename = `${uuidv4()}-${file?.name}`

      if (file) {
        // if file upload exist

        //if file extension is allowed
        const mimeType = file.mimetype.split('/')[1]
        const allowedFile = extFile.includes(mimeType)
        if (!allowedFile) {
          throw {
            statusCode: 400,
            message: 'File is not support! please select image file'
          }
        }

        // get root folder
        let root = path.dirname(require.main.filename)

        // upload images path
        uploadPath = `${root}/public/images/profiles/${filename}`

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
        password: hash ?? getUser[0].password,
        photo: file ? `/images/profiles/${filename}` : getUser[0].photo
      })
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
