const users = require('../models/users')

// register users
const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    // validating email is exist
    const checkEmail = await users.getUsers({ email })
    if (checkEmail.length > 0) {
      throw { statusCode: 409, message: 'Email is already exist!' }
    }

    // query store data to database
    await users.createUsers({ name, email, password, phone })

    // return response
    res.status(201).json({
      status: true,
      message: 'Data successfully registered!',
      data: []
    })
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
}

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

module.exports = { register, login }
