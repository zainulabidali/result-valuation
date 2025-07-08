let results = JSON.parse(localStorage.getItem('competitionResults')) || [];

function submitResult() {
  const category = document.getElementById('category').value;
  const event = document.getElementById('event').value;

  const first = {
    position: 'First',
    team: document.getElementById('first-team').value,
    name: document.getElementById('first-name').value,
    chess: document.getElementById('first-chess').value,
    points: 10
  };

  const second = {
    position: 'Second',
    team: document.getElementById('second-team').value,
    name: document.getElementById('second-name').value,
    chess: document.getElementById('second-chess').value,
    points: 6
  };

  const third = {
    position: 'Third',
    team: document.getElementById('third-team').value,
    name: document.getElementById('third-name').value,
    chess: document.getElementById('third-chess').value,
    points: 3
  };

  if (!category || !event) {
    alert('Please fill category and event.');
    return;
  }

  const entry = {
    timestamp: new Date().toISOString(),
    category,
    event,
    results: [first, second, third]
  };

  results.push(entry);
  localStorage.setItem('competitionResults', JSON.stringify(results));
  displayHistory();
  clearInputs();
}

function displayHistory() {
  const container = document.getElementById('history-list');
  container.innerHTML = '';

  if (results.length === 0) {
    container.innerHTML = "<p>No results yet.</p>";
    return;
  }

  const table = document.createElement('table');
  table.border = '1';
  table.cellPadding = '6';
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.innerHTML = `
    <thead>
      <tr style="background:#f0f0f0;">
        <th>Event</th>
        <th>Category</th>
        <th>🥇 First</th>
        <th>🥈 Second</th>
        <th>🥉 Third</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector('tbody');

  results.forEach(entry => {
    const row = document.createElement('tr');

    const first = entry.results[0];
    const second = entry.results[1];
    const third = entry.results[2];

    row.innerHTML = `
      <td>${entry.event}</td>
      <td>${entry.category}</td>
      <td>${first.team} (${first.name}, ${first.chess})</td>
      <td>${second.team} (${second.name}, ${second.chess})</td>
      <td>${third.team} (${third.name}, ${third.chess})</td>
    `;

    tbody.appendChild(row);
  });

  container.appendChild(table);
  displayTeamPoints();
}


function displayTeamPoints() {
  const map = {};
  results.forEach(r => {
    r.results.forEach(o => {
      map[o.team] = (map[o.team] || 0) + o.points;
    });
  });

  const c = document.getElementById('team-points');
  c.innerHTML = '';

  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .forEach(([team, pts]) => {
      const div = document.createElement('div');
      div.className = 'team-card ' + getTeamColorClass(team);
      div.textContent = `${team}: ${pts} pts`;
      c.appendChild(div);
    });
}

function getTeamColorClass(team) {
  switch (team.toLowerCase()) {
    case 'basmala': return 'team-blue';
    case 'hamdhala': return 'team-green';
    default: return '';
  }
}




function clearInputs() {
  document.querySelectorAll('input').forEach(input => input.value = '');
  document.getElementById('category').value = '';
}

function clearHistory() {
  if (confirm("Are you sure you want to clear all data?")) {
    results = [];
    localStorage.removeItem('competitionResults');
    displayHistory();
  }
}

displayHistory();
