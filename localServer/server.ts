const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
import {
  Application
} from 'express'
import {
  authRoutes
} from './auth.route'

const app: Application = express()

app.use(cors({
  origin: true
}))
app.use(bodyParser.json())

app.route('/api/auth/login').post(authRoutes.login)

const port = 9000
app.listen(port, () => {
  console.log(`HTTP REST API Server running at http://localhost: ${port}`)
})
