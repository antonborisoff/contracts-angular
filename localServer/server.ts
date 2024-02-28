const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
import {
  Application
} from 'express'
import {
  authRoutes
} from './auth.route'
import {
  checkAuth
} from './auth.middleware'

const app: Application = express()

app.use(cors({
  origin: true
}))
app.use(bodyParser.json())

app.use(checkAuth)

app.route('/api/auth/login').post(authRoutes.login)
app.route('/api/auth/logout').post(authRoutes.logout)

const port = 9000
app.listen(port, () => {
  console.log(`HTTP REST API Server running at http://localhost: ${port}`)
})
