// ✅ Works even when opened as file:/// (no fetch)
const localMeals = [
  {
    name: "Idli with Sambar",
    type: "veg",
    meal: "Breakfast",
    calories: 280,
    protein: 10,
    carbs: 50,
    fat: 5,
    image: "data:image/jpeg;base64,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"
  },
  {
    name: "Dosa with Chutney",
    type: "veg",
    meal: "Breakfast",
    calories: 350,
    protein: 8,
    carbs: 55,
    fat: 7,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf1MaAmh3S-lP_BlTFaTgWaoMTYACN0Mc4sA&s"
  },
  {
    name: "Chicken Curry with Rice",
    type: "non-veg",
    meal: "Lunch",
    calories: 600,
    protein: 35,
    carbs: 65,
    fat: 18,
    image: "https://www.foodiaq.com/wp-content/uploads/2024/02/chicken-curry-and-rice-scaled.jpg"
  },
  {
    name: "Curd Rice",
    type: "veg",
    meal: "Dinner",
    calories: 420,
    protein: 12,
    carbs: 55,
    fat: 10,
    image: "https://rakskitchen.net/wp-content/uploads/2012/06/curd-rice-feat.jpg"
  },
  {
    name: "Fish Fry with Lemon",
    type: "non-veg",
    meal: "Dinner",
    calories: 480,
    protein: 30,
    carbs: 10,
    fat: 25,
    image: "https://previews.123rf.com/images/vm2002/vm20021610/vm2002161000364/65649194-marinated-fried-fish-spicy-fish-fry-with-spices-n-lemon-juice-on-iron-skillet-griddle-selective.jpg"
  }
];

document.getElementById("recommendBtn").addEventListener("click", () => {
  const diet = document.getElementById("dietSelect").value;
  const target = parseInt(document.getElementById("calTarget").value || 0);
  const container = document.getElementById("mealResults");
  container.innerHTML = "<p>Loading recommendations...</p>";

  let filtered = diet === "all" ? localMeals : localMeals.filter(m => m.type === diet);

  if (target > 0)
    filtered = filtered.filter(m => Math.abs(m.calories - target) <= 100);

  if (filtered.length === 0) {
    container.innerHTML = "<p>No meals found. Try adjusting filters!</p>";
    return;
  }

  container.innerHTML = filtered
    .map(
      m => `
      <div class="meal-card">
        <img src="${m.image}" alt="${m.name}">
        <div class="content">
          <h3>${m.name}</h3>
          <p><strong>Calories:</strong> ${m.calories}</p>
          <p><strong>Protein:</strong> ${m.protein} g | <strong>Carbs:</strong> ${m.carbs} g | <strong>Fat:</strong> ${m.fat} g</p>
          <p><strong>Meal Type:</strong> ${m.meal}</p>
        </div>
      </div>`
    )
    .join("");
});
