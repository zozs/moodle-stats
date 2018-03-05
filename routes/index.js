const db = require('../db')

module.exports = app => {
  app.get('/', async (req, res) => {
    let data = await db.data()
    res.render('index', {
      course: 'EITA25',
      people: data
    })
  })
}
