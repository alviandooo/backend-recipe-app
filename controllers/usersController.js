const users = require('../models/users')
const { connectRedis } = require('../middlewares/redis')
const bcrypt = require('bcrypt')
const { checkSizeUpload, checkExtensionFile } = require('../utils/uploadFile')
const { uploadCloudinary, deleteCloudinary } = require('../utils/cloudinary')

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

    if (password) {
      // hash password
      const hash = await bcrypt.hash(password, saltRounds)
      if (!hash) {
        throw { statusCode: 400, message: 'Authentication is failed!' }
      }
    }

    // deklarasi file image
    let file = req.files?.photo
    let filename = null

    // if file upload exist
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
      const deleteFile = await deleteCloudinary(getUser[0].photo)
      if (!deleteFile.success) {
        throw { statusCode: 400, message: 'Delete old file error!' }
      }
    }

    // update data users
    await users.editUsers({
      id,
      name: name ?? getUser[0].name,
      email: email ?? getUser[0].email,
      phone: phone ?? getUser[0].phone,
      password: password ? hash : getUser[0].password,
      photo: filename ?? getUser[0].photo
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
      // delete old photo profil
      const deleteFile = await deleteCloudinary(checkUser[0].photo)
      if (!deleteFile.success) {
        throw { statusCode: 400, message: 'Delete old photo error!' }
      }

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

module.exports = { getUsers, editUsers, deleteUsers }
