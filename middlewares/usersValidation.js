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

module.exports = { validateCreate }
