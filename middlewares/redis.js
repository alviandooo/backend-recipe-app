require('dotenv').config()
const Redis = require('ioredis')

const connectRedis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD
})

const useRedis = async (req, res, next) => {
  try {
    const { sort, typeSort, page, limit } = req.query

    const data = await connectRedis.get('data')
    const url = await connectRedis.get('url')
    const sortRedis = await connectRedis.get('sort')
    const typeSortRedis = await connectRedis.get('typeSort')
    const pageRedis = await connectRedis.get('page')
    const limitRedis = await connectRedis.get('limit')
    const total_all_dataRedis = await connectRedis.get('total_all_data')

    const isMatch =
      url === req.originalUrl &&
      (sort ?? null) === sortRedis &&
      (typeSort ?? null) === typeSortRedis &&
      (page ?? null) === pageRedis &&
      (limit ?? null) === limitRedis &&
      data

    if (isMatch) {
      res.status(200).json({
        status: true,
        redis: true,
        message: 'Data successfully retrieved!',
        sort: sort,
        typeSort: typeSort,
        page: parseInt(page) ?? 1,
        limit: parseInt(limit),
        total_all_data: parseInt(total_all_dataRedis),
        total: JSON.parse(data).length,
        data: JSON.parse(data)
      })
    } else {
      next()
    }
  } catch (error) {
    res.status(error?.statusCode ?? 500).json({
      status: false,
      message: error?.message ?? error,
      data: []
    })
  }
}

module.exports = { connectRedis, useRedis }
