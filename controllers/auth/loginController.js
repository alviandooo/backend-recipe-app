const path = require('path')
const users = require('../../models/users')

// login users
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const getUsers = await users.getUsers({ email })

    const isMatched =
      email === getUsers[0]?.email && password === getUsers[0]?.password

    if (!isMatched) {
      throw { statusCode: 400, message: 'Email or Password is incorrect!' }
    }

    // delete password
    delete getUsers[0].password

    res.status(200).json({
      status: true,
      message: 'Login is successfully!',
      data: getUsers
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
