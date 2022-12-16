const users = require('../../models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

// login users
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // get usersdata by email
    const getUsers = await users.getUsers({ email })

    // compare password
    const match = await bcrypt.compare(password, getUsers[0]?.password ?? '')

    if (!match) {
      throw { statusCode: 400, message: 'Email or Password is incorrect!' }
    }

    // delete password
    delete getUsers[0].password

    var token = jwt.sign({ data: getUsers[0] }, process.env.JWT_KEY, {
      expiresIn: '1h'
    })

    res.status(200).json({
      status: true,
      message: 'Login is successfully!',
      jwt_token: token
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
}

module.exports = { login }
