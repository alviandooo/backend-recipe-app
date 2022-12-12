const { Validator } = require('node-input-validator')

const validateLogin = async (req, res, next) => {
  const rules = new Validator(req.body, {
    email: 'required|email|maxLength:50',
    password: 'required|minLength:5'
  })

  rules.check().then((matched) => {
    if (matched) {
      next()
    } else {
      console.log(rules.errors)
      res.status(400).json({
        status: false,
        message:
          rules.errors?.email?.message ?? rules.errors?.password?.message,
        data: []
      })
    }
  })
}

module.exports = { validateLogin }
