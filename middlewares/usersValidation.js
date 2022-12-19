require('dotenv').config()
const jwt = require('jsonwebtoken')
const db = require('../db')
const { Validator } = require('node-input-validator')

const validateCreate = async (req, res, next) => {
  const rules = new Validator(req.body, {
    name: 'required|minLength:4|maxLength:30',
    email: 'required|email|maxLength:50',
    password: 'required|minLength:5|maxLength:20',
    phone: 'required|minLength:10|maxLength:15'
  })

  rules.check().then((matched) => {
    if (matched) {
      next()
    } else {
      res.status(400).json({
        status: false,
        message:
          rules.errors?.name?.message ??
          rules.errors?.email?.message ??
          rules.errors?.password?.message ??
          rules.errors?.phone?.message,
        data: []
      })
    }
  })
}

const checkUser = async (req, res, next) => {
  try {
    // get token from header authorization
    const { authorization } = req.headers

    // get data id from params
    const { id } = req.params

    // decode jwt token
    const decoded = jwt.verify(
      authorization.replace('Bearer ', ''),
      process.env.JWT_KEY
    )

    const userIdToken = decoded?.data?.id

    // get data by id data
    const data = await db`SELECT * FROM users WHERE id=${id}`

    // check is match
    if (userIdToken === data[0]?.id) {
      next()
    } else {
      throw { statusCode: 401, message: 'User not allowed!' }
    }
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? `Token error!`
    })
  }
}

module.exports = { validateCreate, checkUser }
