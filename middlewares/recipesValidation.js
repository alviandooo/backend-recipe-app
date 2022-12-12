const { Validator } = require('node-input-validator')

const validateCreate = async (req, res, next) => {
  const rules = new Validator(req.body, {
    userId: 'required',
    title: 'required|minLength:3|maxLength:30',
    photo: 'required|url',
    ingredients: 'required|minLength:5',
    video: 'required|array',
    description: 'required|minLength:5'
  })

  rules.check().then((matched) => {
    if (matched) {
      next()
    } else {
      res.status(400).json({
        status: false,
        message:
          rules.errors?.userId?.message ??
          rules.errors?.photo?.message ??
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

module.exports = { validateCreate, validateSearch }
