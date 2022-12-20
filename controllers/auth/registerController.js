const users = require('../../models/users')
const bcrypt = require('bcrypt')
const {
  checkSizeUpload,
  checkExtensionFile
} = require('../../utils/uploadFile')
const { uploadCloudinary } = require('../../utils/cloudinary')

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
    if (!hash) {
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
        // store database if upload image success
        await users.createUsers({
          name,
          email,
          password: hash,
          phone,
          photo: uploadFile.urlUpload
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
