const express = require('express')
const mountRoutes = require('./routes')

const app = express()
const rootFsPath = __dirname
mountRoutes(app, rootFsPath)

let port = process.env.PORT || 3000

app.set('view engine', 'hbs')
app.listen(port, () => console.log('Moodle stats listening on port', port))
