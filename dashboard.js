// dashboard.js
// Integrates with your localStorage-based auth (sim_users, sim_current)
// Provides macros summary, pie chart, todo with progress, water tracker, quick calories, history

// Helpers for user store (consistent with your auth.js / summary.js)
function readUsers(){ return JSON.parse(localStorage.getItem('sim_users')||'{}'); }
function writeUsers(obj){ localStorage.setItem('sim_users', JSON.stringify(obj)); }
function getCurrentUser(){ return localStorage.getItem('sim_current'); }
function logout(){ localStorage.removeItem('sim_current'); window.location.href='auth.html'; }

// page elements
const logoutBtn = document.getElementById('logoutBtn');
const macrosSummary = document.getElementById('macrosSummary');
const macroChartCtx = document.getElementById('macroChart').getContext('2d');
const historyChartCtx = document.getElementById('historyChart')?.getContext('2d');
const todoListEl = document.getElementById('todoList');
const todoAddForm = document.getElementById('todoAddForm');
const todoTextInput = document.getElementById('todoText');
const todoFill = document.getElementById('todoFill');
const todoPercent = document.getElementById('todoPercent');
const calForm = document.getElementById('calForm');
const calVal = document.getElementById('calVal');
const calQuick = document.getElementById('calQuick');
const waterCountEl = document.getElementById('waterCount');
const waterPlus = document.getElementById('waterPlus');
const waterMinus = document.getElementById('waterMinus');
const saveDayBtn = document.getElementById('saveDayBtn');
const clearHistoryBtn = document.getElementById('clearHistory');
const gotoSummary = document.getElementById('gotoSummary');
const editProfileBtn = document.getElementById('editProfileBtn');
const themeToggle = document.getElementById('themeToggle');

// guard
const email = getCurrentUser();
const users = readUsers();
if(!email || !users[email]) {
  // not logged in -> redirect
  window.location.href = 'auth.html';
}
const user = users[email];

// normalize existing todos to objects {text, done}
if(Array.isArray(user.todos)){
  // if items are strings, convert to objects
  user.todos = user.todos.map(t => (typeof t === 'string' ? { text: t, done: false } : t));
} else if(!user.todos) {
  user.todos = [];
}

// Today data (calories consumed, water cups)
// store per-day under sim_daily (keyed by date) or as part of user object
function todayKey(){ const d=new Date(); return d.toISOString().slice(0,10); }
if(!user.daily) user.daily = {}; // daily is an object of date -> { calories, water }
if(!user.daily[todayKey()]) user.daily[todayKey()] = { calories: 0, water: 0 };

// Macro calculation (same formula as summary.js)
function calcMacros(u){
  const w=u.weight, h=u.height, a=u.age;
  let bmr = u.gender==='male' ? 10*w + 6.25*h - 5*a + 5 : 10*w + 6.25*h - 5*a - 161;
  const tdee = Math.round(bmr * 1.55);
  let calories = tdee;
  if(u.goal==='lose') calories -= 500;
  if(u.goal==='gain') calories += 500;
  const p = Number(((calories * 0.3)/4).toFixed(1));
  const f = Number(((calories * 0.25)/9).toFixed(1));
  const c = Number(((calories * 0.45)/4).toFixed(1));
  return { bmr, tdee, calories, protein: p, fat: f, carbs: c };
}

let mac = calcMacros(user);

// render macros summary
function renderMacros(){
  mac = calcMacros(user);
  macrosSummary.innerHTML = `
    <div class="result-head">
      <div>
        <div class="mini-info">Calories target</div>
        <div class="big-cal">${mac.calories} kcal</div>
        <div class="mini-info">BMR ${mac.bmr} • TDEE ${mac.tdee}</div>
      </div>
      <div>
        <div>Protein: <b>${mac.protein} g</b></div>
        <div>Fat: <b>${mac.fat} g</b></div>
        <div>Carbs: <b>${mac.carbs} g</b></div>
      </div>
    </div>
  `;
  updateMacroChart();
  updateQuickCalUI();
}

// Chart.js macros pie
let macroChart;
function updateMacroChart(){
  const data = [mac.protein, mac.fat, mac.carbs];
  const labels = ['Protein (g)', 'Fat (g)', 'Carbs (g)'];
  if(macroChart) {
    macroChart.data.datasets[0].data = data;
    macroChart.update();
    return;
  }
  macroChart = new Chart(macroChartCtx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#ff8a00', '#ffbd4a', '#ffe9c7']
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      maintainAspectRatio: false
    }
  });
}

// quick calories UI
function updateQuickCalUI(){
  const today = user.daily[todayKey()] || { calories:0, water:0 };
  calQuick.innerHTML = `
    <div class="mini-info">Today consumed</div>
    <div class="big-cal">${today.calories} kcal</div>
    <div class="muted">Target: ${mac.calories} kcal</div>
    <div class="progress" style="margin-top:8px;">
      <div class="fill" style="width:${Math.min(100, Math.round((today.calories / mac.calories) * 100))}%"></div>
    </div>
  `;
  waterCountEl.textContent = `${today.water} cups`;
}

// handle adding calories quickly
calForm?.addEventListener('submit', e => {
  e.preventDefault();
  const v = Number(calVal.value);
  if(!v || v <= 0) return;
  if(!user.daily[todayKey()]) user.daily[todayKey()] = { calories:0, water:0 };
  user.daily[todayKey()].calories += v;
  writeUsers({ ...users, [email]: user });
  calVal.value = '';
  updateQuickCalUI();
  renderHistoryChart();
});

// water handlers
waterPlus.addEventListener('click', () => {
  if(!user.daily[todayKey()]) user.daily[todayKey()] = { calories:0, water:0 };
  user.daily[todayKey()].water = (user.daily[todayKey()].water || 0) + 1;
  writeUsers({ ...users, [email]: user });
  updateQuickCalUI();
});
waterMinus.addEventListener('click', () => {
  if(!user.daily[todayKey()]) user.daily[todayKey()] = { calories:0, water:0 };
  user.daily[todayKey()].water = Math.max(0, (user.daily[todayKey()].water || 0) - 1);
  writeUsers({ ...users, [email]: user });
  updateQuickCalUI();
});

// To-do functionality (persist per user)
function renderTodos(){
  todoListEl.innerHTML = '';
  user.todos.forEach((t, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="left">
        <input type="checkbox" ${t.done ? 'checked' : ''} data-i="${i}" />
        <span style="${t.done ? 'text-decoration:line-through;opacity:0.7' : ''}">${escapeHtml(t.text)}</span>
      </div>
      <div>
        <button data-r="${i}" class="ghost-btn">Delete</button>
      </div>
    `;
    todoListEl.appendChild(li);
  });
  attachTodoEvents();
  updateTodoProgress();
}

function attachTodoEvents(){
  todoListEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const idx = Number(cb.getAttribute('data-i'));
      user.todos[idx].done = cb.checked;
      writeUsers({ ...users, [email]: user });
      renderTodos();
    });
  });
  todoListEl.querySelectorAll('button[data-r]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-r'));
      user.todos.splice(idx, 1);
      writeUsers({ ...users, [email]: user });
      renderTodos();
    });
  });
}

todoAddForm.addEventListener('submit', e => {
  e.preventDefault();
  const txt = todoTextInput.value.trim();
  if(!txt) return;
  user.todos.push({ text: txt, done: false });
  writeUsers({ ...users, [email]: user });
  todoTextInput.value = '';
  renderTodos();
});

// todo progress
function updateTodoProgress(){
  const total = user.todos.length || 0;
  const done = user.todos.filter(t=>t.done).length;
  const percent = total === 0 ? 0 : Math.round((done/total)*100);
  todoFill.style.width = percent + '%';
  todoPercent.textContent = percent + '%';
}

// History / timeline using Chart.js
let historyChart;
function renderHistoryChart(){
  if(!historyChartCtx) return;
  // collect last 7 days
  const days = [];
  for(let i=6;i>=0;i--){
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0,10));
  }
  const labels = days.map(d => d.slice(5)); // MM-DD
  const caloriesData = days.map(d => (user.daily && user.daily[d] && user.daily[d].calories) || 0);

  if(historyChart){
    historyChart.data.labels = labels;
    historyChart.data.datasets[0].data = caloriesData;
    historyChart.update();
    return;
  }

  historyChart = new Chart(historyChartCtx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Calories',
        data: caloriesData,
        backgroundColor: 'rgba(255, 111, 0, 0.7)'
      }]
    },
    options: {
      scales: {
        y: { beginAtZero: true }
      },
      plugins: { legend: { display: false } },
      maintainAspectRatio: false
    }
  });
}

saveDayBtn?.addEventListener('click', () => {
  // ensure daily entry exists - it's already updated live
  writeUsers({ ...users, [email]: user });
  renderHistoryChart();
  alert("Saved today's macros (calories) to history.");
});

clearHistoryBtn?.addEventListener('click', () => {
  if(!confirm('Clear all saved daily history?')) return;
  user.daily = {};
  writeUsers({ ...users, [email]: user });
  renderHistoryChart();
  updateQuickCalUI();
});

// small helpers
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }

// initial render
renderMacros();
renderTodos();
renderHistoryChart();
updateQuickCalUI();

// logout
logoutBtn.addEventListener('click', logout);
gotoSummary.addEventListener('click', () => window.location.href = 'summary.html');

// navigation mobile
document.getElementById('navSummary')?.addEventListener('click', ()=> window.location.href='summary.html');
document.getElementById('navHome')?.addEventListener('click', ()=> {});
document.getElementById('navProfile')?.addEventListener('click', ()=> { alert('Profile editing will be added next (step 2)'); });

// edit profile -- simple in-page prompt (we'll expand this in step 2)
editProfileBtn.addEventListener('click', ()=>{
  const newWeight = parseFloat(prompt('Enter weight (kg):', user.weight));
  if(!isNaN(newWeight) && newWeight > 0) {
    user.weight = newWeight;
    writeUsers({ ...users, [email]: user });
    renderMacros();
    alert('Weight updated and macros recalculated.');
  }
});

// Theme toggle (light/dark)
const THEME_KEY = 'sim_theme';
function applyTheme(t){
  if(t === 'dark'){
    document.documentElement.style.setProperty('--bg-1', 'linear-gradient(135deg,#1f1f1f,#121212)');
    document.documentElement.style.setProperty('--accent-text', '#f3e9e0');
    document.documentElement.style.setProperty('--muted', '#c9b6a8');
  } else {
    // reset to default by reloading style variables or setting known values
    document.documentElement.style.removeProperty('--bg-1');
    document.documentElement.style.removeProperty('--accent-text');
    document.documentElement.style.removeProperty('--muted');
  }
  localStorage.setItem(THEME_KEY, t);
}
themeToggle.addEventListener('click', ()=>{
  const current = localStorage.getItem(THEME_KEY) || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
});

// on load apply saved theme
applyTheme(localStorage.getItem(THEME_KEY) || 'light');
