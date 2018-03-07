const csvParser = require('csv-parse')
const fs = require('fs')
const moment = require('moment')
const { promisify } = require('util')

const QUIZ_PASS_LIMIT = 8.0 // TODO: do not hard code limit...

function getQuizFilenames () {
  // Read all quiz filenames from environmental variables QUIZ1, QUIZ2, and QUIZ3.
  // TODO: hard-coded to three quizes and a single file for each.
  const quizVars = [process.env.QUIZ1, process.env.QUIZ2, process.env.QUIZ3]
  return quizVars
    .map((f, i) => ({quiz: i + 1, filename: f}))
    .filter(q => q.filename !== undefined)
}

function groupAttempts (quizzes, attempts) {
  // Returns a list of people, where the attempts are added to each person and quiz.
  // Make sure that all quizzes (even if no attempts) exists on all users.
  // Start by using e-mail as key, later on we return a list of objects as expected.
  const quizBase = {}
  for (let quiz of quizzes) {
    quizBase[quiz.quiz] = 0
  }
  let emails = {}
  for (let attempt of attempts) {
    const email = attempt.person.email
    if (email) {
      if (!emails.hasOwnProperty(email)) {
        emails[email] = {...attempt.person} // clone person object
        emails[email].quizzes = {...quizBase}
        for (let quiz of quizzes) {
          emails[email].quizzes[quiz.quiz] = []
        }
      }

      // Also sort attempts based on starting time.
      emails[email].quizzes[attempt.attempt.quiz].push(attempt.attempt)
      emails[email].quizzes[attempt.attempt.quiz].sort((a, b) => a.started.unix() - b.started.unix())
    } else {
      // No e-mail address for this user.
      throw Error('No email for person: ' + JSON.stringify(attempt.person))
    }
  }

  // Finally return all attempts (not sorted by person)
  return Object.values(emails)
}

async function parseQuiz (quiz) {
  const parseOptions = {
    columns: true,
    delimiter: ','
  }

  let input = await promisify(fs.readFile)(quiz.filename, 'utf8')
  let csvData = await promisify(csvParser)(input, parseOptions)
  // TODO: filter on finished attempts?
  let data = csvData
    .map(row => transformCsvEntry(row, quiz.quiz))
    .filter(a => a.person.lastname !== 'Overall average')
  return data
}

function transformCsvEntry (entry, quiz) {
  const dateFormat = 'DD MMM YYYY hh:mm a'
  return {
    person: {
      lastname: entry['Surname'],
      firstname: entry['First name'],
      email: entry['Email address']
    },
    attempt: {
      quiz: quiz,
      state: entry['State'],
      started: moment(entry['Started on'], dateFormat),
      ended: moment(entry['Completed'], dateFormat),
      // 'duration': entry['Time taken'], // TODO: parse duration?
      score: parseFloat(entry['Grade/10.00']),
      passed: parseFloat(entry['Grade/10.00']) >= QUIZ_PASS_LIMIT
    }
  }
}

module.exports = {
  quizData: async () => {
    try {
      let quizzes = getQuizFilenames()
      let quizData = await Promise.all(quizzes.map(parseQuiz))
      let groupedData = groupAttempts(quizzes, [].concat(...quizData))
      return groupedData
    } catch (e) {
      console.log('Exception in parser:', e)
      throw Error('Exception in parser: ' + JSON.stringify(e))
    }
  }
}
