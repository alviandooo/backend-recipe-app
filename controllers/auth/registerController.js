const users = require('../../models/users')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const bcrypt = require('bcrypt')
const { checkSizeUpload, moveFileUpload } = require('../../utils/uploadFile')

// register users
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body
    const saltRounds = 10

    // validating email is exist
    const checkEmail = await users.getUsers({ email })
    if (checkEmail.length > 0) {
      throw { statusCode: 409, message: 'Email is already exist!' }
    }

    // hash password
    const hash = await bcrypt.hash(password, saltRounds)
    if (hash) {
      throw { statusCode: 400, message: 'Authentication is failed!' }
    }

    // deklarasi file image
    let file = req.files?.photo

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

      // move file
      const moveFile = await moveFileUpload(file)
      if (!moveFile.success) {
        throw { statusCode: 400, message: 'Upload file error!' }
      } else {
        // store database if upload image success
        await users.createUsers({
          name,
          email,
          password: hash,
          phone,
          photo: `/images/profiles/${moveFile.filename}`
        })
      }
    } else {
      await users.createUsers({ name, email, password: hash, phone })
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

module.exports = { register }
