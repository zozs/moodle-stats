/* global $ */

function formatDetails (d) {
  let detailsTbl = $('<table/>').addClass('detailed')
  let emailRow = $('<tr/>')
  emailRow.append($('<td/>').text('E-mail'))
  emailRow.append($('<td/>').text(d.email))
  detailsTbl.append(emailRow)
  return detailsTbl
}

const twoFixed = func => (data, type) => type === 'display' || type === 'filter' ? func(data).toFixed(2) : func(data)
const onlyPositive = func => (data, type) => type === 'display' || type === 'filter' ? (!isNaN(func(data)) ? func(data).toString() : 'N/A') : (!isNaN(func(data)) ? func(data) : 6000)

const quizAttemptsCount = attempts => attempts ? attempts.length : 0
const quizAttemptsBeforePass = attempts => attempts && attempts.findIndex(a => a.passed) >= 0 ? attempts.findIndex(a => a.passed) + 1 : NaN
const quizAttemptsBeforePassCount = onlyPositive(quizAttemptsBeforePass)
const quizMaxScore = attempts => attempts ? Math.max(0, ...attempts.map(a => a.score)) : 0
const quizMaxScoreFmt = twoFixed(quizMaxScore)

const allQuizAttemptsCount = quizzes => Object.values(quizzes).map(quizAttemptsCount).reduce((a, b) => a + b)
const allQuizAttemptsBeforePassCount = onlyPositive(quizzes => Object.values(quizzes).map(quizAttemptsBeforePass).reduce((a, b) => a + b))
const allQuizMaxScoreSumFmt = twoFixed(quizzes => Object.values(quizzes).map(quizMaxScore).reduce((a, b) => a + b))

$(document).ready(function () {
  let table = $('#quizTable').DataTable({
    ajax: '/api/data',
    columns: [
      {
        className: 'details-control',
        orderable: false,
        data: null,
        defaultContent: ''
      },
      { data: 'firstname' },
      { data: 'lastname' },

      { className: 'dt-right', data: 'quizzes.1', render: quizAttemptsCount },
      { className: 'dt-right', data: 'quizzes.1', render: quizAttemptsBeforePassCount },
      { className: 'dt-right', data: 'quizzes.1', render: quizMaxScoreFmt },

      { className: 'dt-right', data: 'quizzes.2', render: quizAttemptsCount },
      { className: 'dt-right', data: 'quizzes.2', render: quizAttemptsBeforePassCount },
      { className: 'dt-right', data: 'quizzes.2', render: quizMaxScoreFmt },

      { className: 'dt-right', data: 'quizzes.3', render: quizAttemptsCount },
      { className: 'dt-right', data: 'quizzes.3', render: quizAttemptsBeforePassCount },
      { className: 'dt-right', data: 'quizzes.3', render: quizMaxScoreFmt },

      { className: 'dt-right', data: 'quizzes', render: allQuizAttemptsCount },
      { className: 'dt-right', data: 'quizzes', render: allQuizAttemptsBeforePassCount },
      { className: 'dt-right', data: 'quizzes', render: allQuizMaxScoreSumFmt }
    ],
    order: [[1, 'asc']],
    lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, 'All']]
  })

  // Open/close details event handler.
  $('#quizTable tbody').on('click', 'td.details-control', function () {
    let tr = $(this).closest('tr')
    let row = table.row(tr)

    if (row.child.isShown()) {
      row.child.hide()
      tr.removeClass('shown')
    } else {
      row.child(formatDetails(row.data())).show()
      tr.addClass('shown')
    }
  })
})
