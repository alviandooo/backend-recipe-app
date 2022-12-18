require('dotenv').config()
const jwt = require('jsonwebtoken')

const checkToken = async (req, res, next) => {
  try {
    // get token from header authorization
    const { authorization } = req.headers

    if (authorization) {
      // decode jwt token
      jwt.verify(
        authorization.replace('Bearer ', ''),
        process.env.JWT_KEY,
        (err, decoded) => {
          if (err) {
            throw { statusCode: 401, message: 'Token error, please try again!' }
          }

          if (Date.now() >= decoded.exp * 1000) {
            throw {
              statusCode: 401,
              message: 'Token expired!'
            }
          }

          res.status(200).json({
            status: true,
            message: 'Your account has been logged!',
            token: authorization.replace('Bearer ', '')
          })
        }
      )
    }

    next()
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
}

module.exports = { checkToken }
