if (process.env.NODE_ENV !== 'production') {
    require ('dotenv').config()
}


let MONGODB_URI = process.env.MONGODB_URI

let JWT_SECRET = "Hypersalainen salalause"

module.exports = {
    MONGODB_URI,
    JWT_SECRET
}