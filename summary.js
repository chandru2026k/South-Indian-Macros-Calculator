function readUsers(){return JSON.parse(localStorage.getItem('sim_users')||'{}');}
function getCurrentUser(){return localStorage.getItem('sim_current');}
function logout(){localStorage.removeItem('sim_current');window.location.href='index.html';}
document.getElementById('logoutBtn').addEventListener('click',logout);

const profileName=document.getElementById('profileName');
const profileDetails=document.getElementById('profileDetails');
const macrosResult=document.getElementById('macrosResult');
const foodEquiv=document.getElementById('foodEquiv');
const workoutCard=document.getElementById('workoutCard');
const todoForm=document.getElementById('todoForm');
const todoInput=document.getElementById('todoInput');
const todoList=document.getElementById('todoList');
const detailedBreakdown=document.getElementById('detailedBreakdown');

const u=readUsers()[getCurrentUser()];
if(!u){logout();}
profileName.textContent=u.name;
profileDetails.textContent=`${u.age} yrs • ${u.weight} kg • ${u.height} cm • ${u.goal} • ${u.diet}`;

function calcMacros(u){
  const w=u.weight,h=u.height,a=u.age;
  let bmr=u.gender==='male'?10*w+6.25*h-5*a+5:10*w+6.25*h-5*a-161;
  const tdee=Math.round(bmr*1.55);
  let calories=tdee;
  if(u.goal==='lose') calories-=500;
  if(u.goal==='gain') calories+=500;
  const p=((calories*0.3)/4).toFixed(1);
  const f=((calories*0.25)/9).toFixed(1);
  const c=((calories*0.45)/4).toFixed(1);
  return {bmr,tdee,calories,protein:p,fat:f,carbs:c};
}
const mac=calcMacros(u);
macrosResult.innerHTML=`
  <div class="result-head">
    <div><div class="mini-info">Calories</div><div class="big-cal">${mac.calories} kcal</div><div class="mini-info">BMR ${mac.bmr} • TDEE ${mac.tdee}</div></div>
    <div><div>Protein: <b>${mac.protein} g</b></div><div>Fat: <b>${mac.fat} g</b></div><div>Carbs: <b>${mac.carbs} g</b></div></div>
  </div>
`;

foodEquiv.innerHTML=`
  <div class="food-item"><div>Idli (50 kcal)</div><div class="food-count">${Math.round(mac.calories/50)} pcs</div></div>
  <div class="food-item"><div>Dosa (120 kcal)</div><div class="food-count">${Math.round(mac.calories/120)} pcs</div></div>
`;

workoutCard.innerHTML=`
  <h3>Workout Plan</h3>
  <ul>
    <li>${u.goal==='lose'?'Cardio + Strength 5 days':'Strength 4 days + 1 cardio'}</li>
    <li>Focus on ${u.goal==='gain'?'progressive overload':'fat burn'}</li>
  </ul>
`;

todoForm.addEventListener('submit',e=>{
  e.preventDefault();
  const txt=todoInput.value.trim();if(!txt)return;
  u.todos.push(txt);
  localStorage.setItem('sim_users',JSON.stringify({...readUsers(),[u.email]:u}));
  renderTodos();
  todoInput.value='';
});
function renderTodos(){
  todoList.innerHTML='';
  u.todos.forEach((t,i)=>{
    const li=document.createElement('li');
    li.innerHTML=`<span>${t}</span><button onclick="remove(${i})">x</button>`;
    todoList.appendChild(li);
  });
}
window.remove=i=>{
  u.todos.splice(i,1);
  localStorage.setItem('sim_users',JSON.stringify({...readUsers(),[u.email]:u}));
  renderTodos();
}
renderTodos();
detailedBreakdown.innerHTML=`<h3>Summary</h3><p>Based on your goal, maintain ${mac.calories} kcal per day.</p>`;
