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

// TODO: replace by CSV parser instead...

async function readQuizFile (filename) {
  return promisify(fs.readFile)(filename, 'utf8')
}

async function parseQuizFile (filename) {
  // Read a CSV file and return the parsed entries line by line.
  const header = 'Surname,"First name",Institution,Department,"Email address",State,"Started on",Completed,"Time taken",Grade/10.00'
  let data = await readQuizFile(filename)
  let lines = data.split(/\r?\n/)
  console.log(lines)
  return lines
    .filter(line => line !== header)
    .filter(line => line !== '')
    .map(parseQuizFileLine)
}

function parseQuizFileLine (line) {
  if (line.trim() === '') {
    return {}
  }
  let parts = line.split(/,/)
  if (parts.length !== 10) {
    console.log(parts)
    throw Error('Invalid line: ' + line)
  }
  const dateFormat = 'DD MMM YYYY hh:mm a'
  return {
    'person': {
      'lastname': parts[0],
      'firstname': parts[1],
      'email': parts[4]
    },
    'attempt': {
      'state': parts[5],
      'started': moment(parts[6], dateFormat),
      'ended': moment(parts[7], dateFormat),
      'duration': parts[8], // TODO: parse duration?
      'score': parseFloat(parts[9])
    }
  }
}

let quizzes = getQuizFilenames()

function groupAttempts (attempts) {
  // Returns a list of people, where the attempts are added to each person.
  // TODO: Also make sure attempts are sorted by starting time.

  // Start by using e-mail as key, later on we return a list of objects as expected.
  let emails = {}
  for (let attempt of attempts) {
    if (!emails.hasOwnProperty(attempt.person.email)) {
      emails[attempt.email] = {...attempt.person} // clone person object
      emails[attempt.email].attempts = []
    }

    emails[attempt.email].attempts.push(attempt.attempt)
  }

  // Now sort attempts based on starting time.

  // Finally return all attempts (unsorted)
  return Object.values(emails)
}

parseQuizFile(quizzes[0].filename)
  .then(data => console.log(data))
  .catch(e => console.log('Exception:', e))
