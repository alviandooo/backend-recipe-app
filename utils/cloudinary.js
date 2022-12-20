require('dotenv').config()
const cloudinary = require('cloudinary')
const { v4: uuidv4 } = require('uuid')

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
})

const uploadCloudinary = async (file) => {
  let res
  const public_id = uuidv4()
  await cloudinary.v2.uploader.upload(
    file.tempFilePath,
    { public_id },
    function (error, result) {
      if (error) {
        res = { success: false }
      } else {
        res = { success: true, urlUpload: result.url }
      }
    }
  )

  return res
}

const deleteCloudinary = async (url) => {
  let res
  const urlSplited = url.split('/')
  const filename = urlSplited[urlSplited.length - 1]
  const public_id = filename.split('.')[0]
  await cloudinary.v2.uploader.destroy(public_id, (error) => {
    if (error) {
      res = { success: false }
    } else {
      res = { success: true }
    }
  })
  return res
}

module.exports = { cloudinary, uploadCloudinary, deleteCloudinary }
