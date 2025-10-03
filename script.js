function round(n, d=0){ return Math.round(n * Math.pow(10,d)) / Math.pow(10,d); }

// Mifflin-St Jeor BMR
function calcBMR({gender, weight, height, age}){
  if(gender === 'male'){
    return 10*weight + 6.25*height - 5*age + 5;
  } else if(gender === 'female'){
    return 10*weight + 6.25*height - 5*age - 161;
  } else {
    return ( (10*weight + 6.25*height - 5*age + 5) + 
             (10*weight + 6.25*height - 5*age -161) )/2;
  }
}

function calcMacros({weight, tdee, goal}){
  let protPerKg = 1.8;
  if(goal === 'cut') protPerKg = 2.0;
  if(goal === 'bulk') protPerKg = 1.6;

  const protein_g = round(protPerKg * weight, 1);
  const protein_kcal = protein_g * 4;

  const fat_kcal = round(tdee * 0.25, 0);
  const fat_g = round(fat_kcal / 9, 1);

  const remaining_kcal = round(tdee - (protein_kcal + fat_kcal), 0);
  const carb_g = round(remaining_kcal / 4, 1);

  return {protein_g, fat_g, carb_g, protein_kcal, fat_kcal, carb_kcal: remaining_kcal};
}

function adjustForGoal(tdee, goal){
  if(goal === 'cut') return round(tdee * 0.8, 0);
  if(goal === 'bulk') return round(tdee * 1.15, 0);
  return round(tdee, 0);
}

const els = {
  calcBtn: document.getElementById('calcBtn'),
  resetBtn: document.getElementById('resetBtn'),
  resultsPlaceholder: document.getElementById('resultsPlaceholder'),
  mealPlan: document.getElementById('mealPlan'),
  workoutPlan: document.getElementById('workoutPlan'),
  todoInput: document.getElementById('todoInput'),
  addTodo: document.getElementById('addTodo'),
  todoList: document.getElementById('todoList')
};

function readInputs(){
  return {
    name: document.getElementById('name').value.trim(),
    age: Number(document.getElementById('age').value) || 22,
    gender: document.getElementById('gender').value,
    height: Number(document.getElementById('height').value) || 170,
    weight: Number(document.getElementById('weight').value) || 70,
    activity: Number(document.getElementById('activity').value) || 1.55,
    goal: document.getElementById('goal').value,
    foodpref: document.getElementById('foodpref').value
  };
}

function renderResults(data){
  const {bmr, tdee, tdeeAdjusted, macros} = data;
  els.resultsPlaceholder.innerHTML = `
    <div class="kpi">
      <div>
        <div class="value">${tdeeAdjusted} kcal</div>
        <div class="label">Daily calories (adjusted)</div>
      </div>
    </div>
    <div class="small">BMR: ${round(bmr)} kcal · TDEE: ${round(tdee)} kcal</div>
    <div style="margin-top:8px">
      <div>Protein: <strong>${macros.protein_g} g</strong></div>
      <div class="bar"><i class="protein" style="width:${(macros.protein_g*4/tdeeAdjusted)*100}%"></i></div>
      <div>Carbs: <strong>${macros.carb_g} g</strong></div>
      <div class="bar"><i class="carb" style="width:${(macros.carb_kcal/tdeeAdjusted)*100}%"></i></div>
      <div>Fats: <strong>${macros.fat_g} g</strong></div>
      <div class="bar"><i class="fat" style="width:${(macros.fat_kcal/tdeeAdjusted)*100}%"></i></div>
    </div>
  `;
}

function suggestMealPlan(inputs){
  const p = inputs.foodpref;
  const lines = [];
  lines.push('<ul>');
  lines.push('<li><strong>Breakfast:</strong> 3 Idlis + Sambar + 1 cup curd</li>');
  if(p !== 'veg') lines.push('<li><strong>Snack:</strong> 2 boiled eggs / banana</li>');
  lines.push('<li><strong>Lunch:</strong> 1 cup rice + sambar + veg curry' + (p==='nonveg' ? ' + chicken/fish' : '') + '</li>');
  lines.push('<li><strong>Evening:</strong> Sundal / roasted chana</li>');
  lines.push('<li><strong>Dinner:</strong> 2 dosas or chapati + veg curry' + (p==='nonveg' ? ' + egg/fish' : '') + '</li>');
  lines.push('</ul>');
  els.mealPlan.innerHTML = lines.join('\n');
}

function suggestWorkout(inputs){
  const g = inputs.goal;
  let html = '';
  if(g === 'cut'){
    html = `<strong>3-day Cut Plan</strong>
      <ol><li>Day1: Full body + 20 min cardio</li><li>Day2: HIIT 25 min</li><li>Day3: Strength + core</li></ol>`;
  } else if(g === 'bulk'){
    html = `<strong>4-day Bulk Plan</strong>
      <ol><li>Day1: Push</li><li>Day2: Pull</li><li>Day3: Legs</li><li>Day4: Full-body</li></ol>`;
  } else {
    html = `<strong>3-day Maintenance Plan</strong>
      <ol><li>Day1: Upper body</li><li>Day2: Cardio + core</li><li>Day3: Lower body</li></ol>`;
  }
  els.workoutPlan.innerHTML = html;
}

els.calcBtn.addEventListener('click', ()=>{
  const inputs = readInputs();
  const bmr = calcBMR(inputs);
  const tdee = round(bmr * inputs.activity, 0);
  const tdeeAdjusted = adjustForGoal(tdee, inputs.goal);
  const macros = calcMacros({weight: inputs.weight, tdee: tdeeAdjusted, goal: inputs.goal});

  renderResults({bmr, tdee, tdeeAdjusted, macros});
  suggestMealPlan(inputs);
  suggestWorkout(inputs);
});

// Reset
els.resetBtn.addEventListener('click', ()=>{
  document.getElementById('name').value = '';
  document.getElementById('age').value = 22;
  document.getElementById('gender').value = 'male';
  document.getElementById('height').value = 170;
  document.getElementById('weight').value = 70;
  document.getElementById('activity').value = 1.55;
  document.getElementById('goal').value = 'maintain';
  document.getElementById('foodpref').value = 'nonveg';
  els.resultsPlaceholder.innerHTML = '<p class="small">No calculation yet — click <strong>Calculate</strong>.</p>';
  els.mealPlan.innerHTML = '<p class="small">After calculation, meals will appear here.</p>';
  els.workoutPlan.innerHTML = '<p class="small">After calculation, workouts will appear here.</p>';
  els.todoList.innerHTML = '';
});

// To-do list
els.addTodo.addEventListener('click', ()=>{
  const task = els.todoInput.value.trim();
  if(task){
    const li = document.createElement('li');
    li.textContent = task;
    li.addEventListener('click', ()=> li.classList.toggle('done'));
    els.todoList.appendChild(li);
    els.todoInput.value = '';
  }
});
