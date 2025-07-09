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

  const first = getEntry('first', 10);
  const second = getEntry('second', 6);
  const third = getEntry('third', 3);

  const gradeOnlyEntries = Array.from(document.querySelectorAll('.grade-only-entry')).map(div => {
    const [teamSel, nameInput, chessInput, gradeSel] = div.querySelectorAll('select, input');
    return {
      team: teamSel.value,
      name: nameInput.value,
      chess: chessInput.value,
      grade: gradeSel.value,
      category
    };
  });

  const entry = {
    timestamp: new Date().toISOString(),
    category,
    event,
    results: [first, second, third],
    gradeOnly: gradeOnlyEntries
  };

  results.push(entry);
  localStorage.setItem('competitionResults', JSON.stringify(results));
  displayHistory();
  clearInputs();
}

function addGradeOnlyEntry() {
  const container = document.getElementById('grade-only-container');
  const div = document.createElement('div');
  div.className = 'grade-only-entry';
  div.innerHTML = `
    <label>Team:</label>
    <select>
      <option value="">-- Select Team --</option>
      <option>Hamdhala</option>
      <option>Basmala</option>
    </select>
    <input type="text" placeholder="Student Name" />
    <input type="text" placeholder="Chess No." />
    <label>Grade:</label>
    <select>
      <option value="">-- Grade --</option>
      <option>A</option>
      <option>B</option>
      <option>C</option>
    </select><br>
  `;
  container.appendChild(div);
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

    (r.gradeOnly || []).forEach(g => {
      if (g.team && gradePoints[g.grade]) {
        map[g.team] = (map[g.team] || 0) + gradePoints[g.grade];
      }
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

function displayTopPerformers() {
  const studentMap = {};

  results.forEach(entry => {
    const category = entry.category;
    entry.results.forEach(r => {
      if (!r.chess) return;
      const key = `${category}_${r.chess}`;
      if (!studentMap[key]) {
        studentMap[key] = {
          name: r.name,
          chess: r.chess,
          category: category,
          totalPoints: 0
        };
      }
      studentMap[key].totalPoints += r.points;
    });

    (entry.gradeOnly || []).forEach(g => {
      const key = `${g.category}_${g.chess}`;
      if (!studentMap[key]) {
        studentMap[key] = {
          name: g.name,
          chess: g.chess,
          category: g.category,
          totalPoints: 0
        };
      }
      studentMap[key].totalPoints += gradePoints[g.grade] || 0;
    });
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

  if (Object.keys(categoryMap).length === 0) {
    container.innerHTML = '<p>No performers yet.</p>';
    return;
  }

  const ul = document.createElement('ul');
  Object.entries(categoryMap).forEach(([category, student]) => {
    const li = document.createElement('li');
    li.textContent = `${category} → ${student.name} (${student.chess}), ${student.totalPoints} pts`;
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
  document.getElementById('grade-only-container').innerHTML = '';
}

function clearHistory() {
  if (confirm("Are you sure you want to clear all data?")) {
    results = [];
    localStorage.removeItem('competitionResults');
    displayHistory();
  }
}

displayHistory();
