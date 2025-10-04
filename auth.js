/* auth.js — handles signup & login with localStorage */
function readUsers(){ return JSON.parse(localStorage.getItem('sim_users')||'{}'); }
function writeUsers(u){ localStorage.setItem('sim_users', JSON.stringify(u)); }
function setCurrentUser(email){ localStorage.setItem('sim_current', email); }

document.getElementById('signupForm').addEventListener('submit', e=>{
  e.preventDefault();
  const email=document.getElementById('su_email').value.toLowerCase();
  const users=readUsers();
  if(users[email]) return alert('Account already exists. Please login.');
  users[email]={
    name:document.getElementById('su_name').value,
    email,
    pass:document.getElementById('su_pass').value,
    gender:document.getElementById('su_gender').value,
    age:+document.getElementById('su_age').value,
    weight:+document.getElementById('su_weight').value,
    height:+document.getElementById('su_height').value,
    goal:document.getElementById('su_goal').value,
    diet:document.getElementById('su_diet').value,
    todos:[]
  };
  writeUsers(users);
  setCurrentUser(email);
  window.location.href = 'dashboard.html';  
});

document.getElementById('loginForm').addEventListener('submit', e=>{
  e.preventDefault();
  const email=document.getElementById('li_email').value.toLowerCase();
  const pass=document.getElementById('li_pass').value;
  const users=readUsers();
  if(!users[email]||users[email].pass!==pass) return alert('Invalid credentials');
  setCurrentUser(email);
  window.location.href = 'dashboard.html';  
});
