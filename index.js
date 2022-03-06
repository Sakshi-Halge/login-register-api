const express = require('express')
const db = require('./db')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 6038 

app.use(cors())

const AuthController = require('./auth/authController')
const OtpController = require('./otp/otpController');

app.use('/api/auth', AuthController)
app.use('/otp', OtpController)

app.listen(port, (err) => {
    if(err) throw err
    console.log(`Listening to port ${port}`)
})