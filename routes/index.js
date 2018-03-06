const db = require('../db')
const express = require('express')
const path = require('path')

module.exports = (app, rootFsPath) => {
  app.get('/', async (req, res) => {
    let data = await db.data()
    res.render('index', {
      course: 'EITA25',
      people: data
    })
  })

  app.get('/api/data', async (req, res) => {
    let data = await db.data()
    res.send({
      data: data
    })
  })

  app.use('/static', express.static(path.join(rootFsPath, 'static')))
  app.use('/static/jquery', express.static(path.join(rootFsPath, 'node_modules/jquery/dist')))
}
