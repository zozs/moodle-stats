const moodleParser = require('./moodle-parser')

// Parse data once and for all upon loading.
let moodleData = moodleParser.quizData()

module.exports = {
  data: async () => moodleData
}
