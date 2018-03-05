const csvParser = require('csv-parse')
const fs = require('fs')
const moment = require('moment')
const { promisify } = require('util')

function getQuizFilenames () {
  // Read all quiz filenames from environmental variables QUIZ1, QUIZ2, and QUIZ3.
  // TODO: hard-coded to three quizes and a single file for each.
  const quizVars = [process.env.QUIZ1, process.env.QUIZ2, process.env.QUIZ3]
  return quizVars
    .map((f, i) => ({'quiz': i + 1, 'filename': f}))
    .filter(q => q.filename !== undefined)
}

function groupAttempts (attempts) {
  // Returns a list of people, where the attempts are added to each person.
  // Start by using e-mail as key, later on we return a list of objects as expected.
  let emails = {}
  for (let attempt of attempts) {
    const email = attempt.person.email
    if (email) {
      if (!emails.hasOwnProperty(email)) {
        emails[email] = {...attempt.person} // clone person object
        emails[email].attempts = []
      }

      // Also sort attempts based on starting time.
      emails[email].attempts.push(attempt.attempt)
      emails[email].attempts.sort((a, b) => a.started.unix() - b.started.unix())
    } else {
      // No e-mail address for this user.
      throw Error('No email for person: ' + JSON.stringify(attempt.person))
    }
  }

  // Finally return all attempts (not sorted by person)
  return Object.values(emails)
}

async function parseQuizFile (filename) {
  const parseOptions = {
    columns: true,
    delimiter: ','
  }

  let input = await promisify(fs.readFile)(filename, 'utf8')
  let data = await promisify(csvParser)(input, parseOptions)
  return data
    .map(transformCsvEntry)
    .filter(a => a.person.lastname !== 'Overall average')
}

function transformCsvEntry (entry) {
  const dateFormat = 'DD MMM YYYY hh:mm a'
  return {
    'person': {
      'lastname': entry['Surname'],
      'firstname': entry['First name'],
      'email': entry['Email address']
    },
    'attempt': {
      'state': entry['State'],
      'started': moment(entry['Started on'], dateFormat),
      'ended': moment(entry['Completed'], dateFormat),
      'duration': entry['Time taken'], // TODO: parse duration?
      'score': parseFloat(entry['Grade/10.00'])
    }
  }
}

let quizzes = getQuizFilenames()

parseQuizFile(quizzes[0].filename)
  .then(groupAttempts)
  .then(data => console.log(data))
  .catch(e => console.log('Exception:', e))
