/* lang.js — handles English/Tamil translations for all pages */

const LANG = {
  en: {
    hero_title: "Discover your personalised macros — South Indian style",
    hero_sub: "Enter your details, get macros, meal & workout plans, and a to-do list.",
    signup_title: "Create Account",
    login_title: "Login",
    todo_title: "To-Do List",
    card_macros: "Accurate Macros",
    card_macros_desc: "BMR → TDEE based daily calories & split (Protein/Fat/Carbs).",
    card_meal: "Meal Plans",
    card_meal_desc: "South Indian meals tailored for veg / non-veg preferences.",
    card_workout: "Workouts",
    card_workout_desc: "Simple home & gym workouts based on your goal.",
    male: "Male",
    female: "Female",
    btn_login: "Login / Sign Up",
    btn_home: "Home",
    summary_title: "Summary",
    summary_logout: "Logout"
  },
  ta: {
    hero_title: "உங்கள் தனிப்பயன் மாக்ரோ்களை கண்டறியுங்கள் — தென்னிந்திய ஶைலியில்",
    hero_sub: "உங்கள் விவரங்களை உள்ளிடுங்கள், மாக்ரோ, உணவுத் திட்டம் மற்றும் உடற்பயிற்சி மற்றும் டு-டூ பட்டியலை பெறுங்கள்.",
    signup_title: "கணக்கு உருவாக்கு",
    login_title: "உள்நுழைவு",
    todo_title: "செய்ய வேண்டியவை",
    card_macros: "கணக்கான மாக்ரோக்கள்",
    card_macros_desc: "BMR → TDEE அடிப்படையிலான தினசரி காலோரிகள் மற்றும் பிரிப்பு (Protein/Fat/Carbs).",
    card_meal: "உணவுத் திட்டங்கள்",
    card_meal_desc: "தென்னிந்திய சைவ / அசைவ உணவுத் திட்டங்கள்.",
    card_workout: "உடற்பயிற்சி திட்டங்கள்",
    card_workout_desc: "உங்கள் இலக்கிற்கு ஏற்ப வீட்டிலும் ஜிம்மிலும் செய்யலாம்.",
    male: "ஆண்",
    female: "பெண்",
    btn_login: "உள்நுழை / பதிவு செய்",
    btn_home: "முகப்பு",
    summary_title: "சுருக்கம்",
    summary_logout: "வெளியேறு"
  }
};

function translateAll(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (LANG[lang] && LANG[lang][key]) {
      el.textContent = LANG[lang][key];
    }
  });
  localStorage.setItem("sim_lang", lang);
}

function loadLanguage() {
  const saved = localStorage.getItem("sim_lang") || "en";
  const select = document.getElementById("langSelect");
  if (select) select.value = saved;
  translateAll(saved);
  if (select) {
    select.addEventListener("change", () => translateAll(select.value));
  }
}

document.addEventListener("DOMContentLoaded", loadLanguage);
