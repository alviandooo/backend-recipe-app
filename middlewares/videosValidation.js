const { Validator } = require('node-input-validator')

const validateCreate = async (req, res, next) => {
  const rules = new Validator(req.body, {
    recipeId: 'required',
    video: 'required'
  })

  rules.check().then((matched) => {
    if (matched) {
      next()
    } else {
      res.status(400).json({
        status: false,
        message:
          rules.errors?.recipeId?.message ?? rules.errors?.video?.message,
        data: []
      })
    }
  })
}

module.exports = { validateCreate }
