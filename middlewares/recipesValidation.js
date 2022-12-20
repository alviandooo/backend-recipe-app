const { Validator } = require('node-input-validator')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const db = require('../db')

const validateCreate = async (req, res, next) => {
  const rules = new Validator(req.body, {
    // userId: 'required',
    title: 'required|minLength:3|maxLength:30',
    // photo: 'required',
    ingredients: 'required|minLength:5',
    video: 'required',
    description: 'required|minLength:5'
  })

  rules.check().then((matched) => {
    if (matched) {
      next()
    } else {
      res.status(400).json({
        status: false,
        message:
          // rules.errors?.userId?.message ??
          // rules.errors?.photo?.message ??
          rules.errors?.ingredients?.message ??
          rules.errors?.description?.message ??
          rules.errors?.title?.message ??
          rules.errors?.video?.message,
        data: []
      })
    }
  })
}

const validateSearch = async (req, res, next) => {
  const rules = new Validator(req.query, {
    keyword: 'required',
    searchBy: 'required'
  })

  rules.check().then((matched) => {
    if (matched) {
      next()
    } else {
      res.status(400).json({
        status: false,
        message:
          rules.errors?.keyword?.message ?? rules.errors?.searchBy?.message,
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
    const data = await db`SELECT * FROM recipes WHERE id=${id}`

    // check is match
    if (userIdToken === data[0]?.user_id) {
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

module.exports = { validateCreate, validateSearch, checkUser }
