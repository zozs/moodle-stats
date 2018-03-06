function formatDetails (d) {
  let detailsTbl = $('<table/>').addClass('detailed')
  let emailRow = $('<tr/>')
  emailRow.append($('<td/>').text('E-mail'))
  emailRow.append($('<td/>').text(d.email))
  detailsTbl.append(emailRow)
  return detailsTbl
}

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

      { data: row => row.attempts.length },
      { data: row => 0 },
      { data: row => 0 },

      { data: row => row.attempts.length },
      { data: row => 0 },
      { data: row => 0 },

      { data: row => row.attempts.length },
      { data: row => 0 },
      { data: row => 0 },

      { data: row => row.attempts.length },
      { data: row => 0 },
      { data: row => 0 }
    ],
    order: [[1, 'asc']]
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
