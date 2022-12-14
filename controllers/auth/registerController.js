const users = require('../../models/users')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

// register users
const register = async (req, res) => {
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

module.exports = { register }
