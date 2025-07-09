let results = JSON.parse(localStorage.getItem('competitionResults')) || [];

const gradePoints = { A: 5, B: 3, C: 1 };

function submitResult() {
  const category = document.getElementById('category').value;
  const event = document.getElementById('event').value;

  if (!category || !event) {
    alert('Please fill category and event.');
    return;
  }

  const getEntry = (prefix, basePoints) => {
    const team = document.getElementById(`${prefix}-team`).value;
    const name = document.getElementById(`${prefix}-name`).value;
    const chess = document.getElementById(`${prefix}-chess`).value;
    const grade = document.getElementById(`${prefix}-grade`).value;
    const extra = gradePoints[grade] || 0;

    return {
      position: prefix,
      team,
      name,
      chess,
      grade,
      points: basePoints + extra
    };
  };

  const first = getEntry('first', 5);
  const second = getEntry('second', 3);
  const third = getEntry('third', 1);

  const gradeOnly = {
    team: document.getElementById('grade-only-team').value,
    name: document.getElementById('grade-only-name').value,
    chess: document.getElementById('grade-only-chess').value,
    grade: document.getElementById('grade-only-grade').value,
    category: category
  };

  const entry = {
    timestamp: new Date().toISOString(),
    category,
    event,
    results: [first, second, third],
    gradeOnly
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
    const [first, second, third] = entry.results;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${entry.event}</td>
      <td>${entry.category}</td>
      <td>${first.team} (${first.name}, ${first.chess}, Grade: ${first.grade})</td>
      <td>${second.team} (${second.name}, ${second.chess}, Grade: ${second.grade})</td>
      <td>${third.team} (${third.name}, ${third.chess}, Grade: ${third.grade})</td>
    `;
    tbody.appendChild(row);
  });

  container.appendChild(table);
  displayTeamPoints();
  displayTopPerformers();
}

function displayTeamPoints() {
  const map = {};

  results.forEach(r => {
    r.results.forEach(o => {
      if (!o.team) return;
      map[o.team] = (map[o.team] || 0) + o.points;
    });

    const g = r.gradeOnly;
    if (g && g.team && gradePoints[g.grade]) {
      map[g.team] = (map[g.team] || 0) + gradePoints[g.grade];
    }
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

function displayTopPerformers() {
  const studentMap = {};

  results.forEach(entry => {
    const category = entry.category;
    entry.results.forEach(r => {
      const key = `${category}_${r.chess}`;
      if (!r.chess) return;

      if (!studentMap[key]) {
        studentMap[key] = {
          name: r.name,
          chess: r.chess,
          category,
          totalPoints: 0
        };
      }
      studentMap[key].totalPoints += r.points;
    });

    const g = entry.gradeOnly;
    if (g && g.chess && g.category && gradePoints[g.grade]) {
      const key = `${g.category}_${g.chess}`;
      if (!studentMap[key]) {
        studentMap[key] = {
          name: g.name,
          chess: g.chess,
          category: g.category,
          totalPoints: 0
        };
      }
      studentMap[key].totalPoints += gradePoints[g.grade];
    }
  });

  const categoryMap = {};
  Object.values(studentMap).forEach(student => {
    const cat = student.category;
    if (!categoryMap[cat] || student.totalPoints > categoryMap[cat].totalPoints) {
      categoryMap[cat] = student;
    }
  });

  const container = document.getElementById('top-performers-list');
  container.innerHTML = '';

  const ul = document.createElement('ul');
  Object.entries(categoryMap).forEach(([category, s]) => {
    const li = document.createElement('li');
    li.textContent = `${category} → ${s.name} (${s.chess}), ${s.totalPoints} pts`;
    ul.appendChild(li);
  });

  container.appendChild(ul);
}

function getTeamColorClass(team) {
  switch (team.toLowerCase()) {
    case 'basmala': return 'team-blue';
    case 'hamdhala': return 'team-green';
    default: return '';
  }
}

function clearInputs() {
  document.querySelectorAll('input, select').forEach(input => input.value = '');
  document.getElementById('category').value = '';
}

function clearHistory() {
  if (confirm("Are you sure you want to clear all data?")) {
    results = [];
    localStorage.removeItem('competitionResults');
    displayHistory();
    document.getElementById('top-performers-list').innerHTML = '';
  }
}

displayHistory();
