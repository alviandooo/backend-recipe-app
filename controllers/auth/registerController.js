const users = require('../../models/users')
const bcrypt = require('bcrypt')
const { checkSizeUpload, moveFileUpload } = require('../../utils/uploadFile')

// extension file upload allowed
const extFile = ['jpeg', 'JPEG', 'jpg', 'JPG', 'PNG', 'png', 'webp', 'WEBP']

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
      const mimeType = file.mimetype.split('/')[1]
      const allowedFile = extFile.includes(mimeType)
      if (!allowedFile) {
        throw {
          statusCode: 400,
          message: `File is not support! please select image ${extFile.join(
            ', '
          )}`
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
