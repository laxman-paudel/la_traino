const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PASSWORD_HASH = bcrypt.hashSync("Password123", 10);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgoWithTime(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const DEMO = {
  admin: { name: "Demo Admin", email: "admin@latraino.demo" },
  trainer: { name: "Alex Trainer", email: "trainer@latraino.demo" },
  trainee1: { name: "John Trainee", email: "trainee1@latraino.demo" },
  trainee2: { name: "Jane Trainee", email: "trainee2@latraino.demo" },
};

// ---------------------------------------------------------------------------
// Food Items
// ---------------------------------------------------------------------------
const foodItems = [
  // Proteins
  { name: "Chicken Breast", category: "protein", servingSize: "100g", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Salmon Fillet", category: "protein", servingSize: "100g", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "Turkey Breast", category: "protein", servingSize: "100g", calories: 135, protein: 30, carbs: 0, fat: 1 },
  { name: "Lean Beef", category: "protein", servingSize: "100g", calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: "Eggs", category: "protein", servingSize: "2 eggs", calories: 140, protein: 12, carbs: 1, fat: 10 },
  { name: "Whey Protein", category: "protein", servingSize: "1 scoop", calories: 120, protein: 24, carbs: 3, fat: 1 },
  { name: "Greek Yogurt", category: "protein", servingSize: "200g", calories: 140, protein: 20, carbs: 8, fat: 2 },
  { name: "Cottage Cheese", category: "protein", servingSize: "100g", calories: 98, protein: 11, carbs: 3, fat: 4 },
  { name: "Tofu", category: "protein", servingSize: "100g", calories: 76, protein: 8, carbs: 2, fat: 4.8 },
  // Carbs
  { name: "Oatmeal", category: "carbs", servingSize: "100g", calories: 389, protein: 17, carbs: 66, fat: 7 },
  { name: "Brown Rice", category: "carbs", servingSize: "100g", calories: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: "Sweet Potato", category: "carbs", servingSize: "100g", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: "Quinoa", category: "carbs", servingSize: "100g", calories: 120, protein: 4.4, carbs: 21, fat: 1.9 },
  { name: "Whole Wheat Bread", category: "carbs", servingSize: "2 slices", calories: 140, protein: 6, carbs: 24, fat: 2 },
  // Fruits & Veggies
  { name: "Banana", category: "fruits", servingSize: "1 medium", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Mixed Berries", category: "fruits", servingSize: "100g", calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { name: "Apple", category: "fruits", servingSize: "1 medium", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Avocado", category: "fruits", servingSize: "100g", calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: "Broccoli", category: "vegetables", servingSize: "100g", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { name: "Spinach", category: "vegetables", servingSize: "100g", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { name: "Mixed Salad Greens", category: "vegetables", servingSize: "100g", calories: 17, protein: 1.5, carbs: 3, fat: 0.2 },
  // Fats & Dairy
  { name: "Almonds", category: "fats", servingSize: "30g", calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: "Olive Oil", category: "fats", servingSize: "1 tbsp", calories: 119, protein: 0, carbs: 0, fat: 13.5 },
  { name: "Peanut Butter", category: "fats", servingSize: "2 tbsp", calories: 188, protein: 8, carbs: 6, fat: 16 },
  { name: "Almond Milk", category: "dairy", servingSize: "1 cup", calories: 30, protein: 1, carbs: 1, fat: 2.5 },
  // Misc
  { name: "Mixed Nuts", category: "snacks", servingSize: "30g", calories: 173, protein: 5, carbs: 6, fat: 16 },
  { name: "Dark Chocolate", category: "snacks", servingSize: "30g", calories: 170, protein: 2, carbs: 13, fat: 12 },
];

// ---------------------------------------------------------------------------
// Workout Templates
// ---------------------------------------------------------------------------
const workoutTemplates = [
  {
    name: "Beginner Strength",
    description: "A foundational strength program using compound exercises. Perfect for building basic strength and proper form.",
    difficulty: "Beginner",
    estimatedDuration: 45,
    exercises: [
      { name: "Barbell Bench Press", sets: 3, reps: 10, restTime: "90s", weight: "40 kg", notes: "Focus on controlled negative" },
      { name: "Barbell Row", sets: 3, reps: 10, restTime: "90s", weight: "35 kg", notes: "Keep back straight" },
      { name: "Overhead Press", sets: 3, reps: 10, restTime: "90s", weight: "25 kg" },
      { name: "Barbell Back Squat", sets: 3, reps: 10, restTime: "120s", weight: "50 kg" },
      { name: "Deadlift", sets: 3, reps: 8, restTime: "120s", weight: "60 kg", notes: "Warm up properly" },
      { name: "Plank", sets: 3, reps: 30, restTime: "60s" },
    ],
  },
  {
    name: "Fat Loss Program",
    description: "High-intensity circuit training designed to maximize calorie burn and improve conditioning.",
    difficulty: "Intermediate",
    estimatedDuration: 35,
    exercises: [
      { name: "Burpee", sets: 3, reps: 12, restTime: "45s" },
      { name: "Kettlebell Swing", sets: 3, reps: 15, restTime: "45s", weight: "16 kg" },
      { name: "Box Jump", sets: 3, reps: 10, restTime: "45s" },
      { name: "Mountain Climber", sets: 3, reps: 30, restTime: "30s" },
      { name: "Battle Ropes", sets: 3, reps: 30, restTime: "45s" },
      { name: "Russian Twist", sets: 3, reps: 20, restTime: "30s" },
    ],
  },
  {
    name: "Muscle Building Program",
    description: "Progressive overload program for muscle hypertrophy with moderate to heavy weights.",
    difficulty: "Intermediate",
    estimatedDuration: 55,
    exercises: [
      { name: "Barbell Bench Press", sets: 4, reps: 8, restTime: "120s", weight: "60 kg" },
      { name: "Barbell Row", sets: 4, reps: 8, restTime: "120s", weight: "50 kg" },
      { name: "Barbell Back Squat", sets: 4, reps: 8, restTime: "150s", weight: "70 kg" },
      { name: "Overhead Press", sets: 3, reps: 10, restTime: "90s", weight: "30 kg" },
      { name: "Deadlift", sets: 4, reps: 6, restTime: "150s", weight: "80 kg" },
      { name: "Pull-up", sets: 3, reps: 8, restTime: "90s" },
      { name: "Barbell Curl", sets: 3, reps: 12, restTime: "60s", weight: "20 kg" },
      { name: "Tricep Pushdown", sets: 3, reps: 12, restTime: "60s", weight: "15 kg" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Diet Templates
// ---------------------------------------------------------------------------
const dietTemplates = [
  {
    name: "Weight Loss",
    description: "Calorie-controlled meal plan designed for sustainable fat loss while maintaining muscle mass.",
    meals: {
      breakfast: [
        { name: "Eggs", quantity: "2 scrambled", calories: 140, protein: 12, carbs: 1, fat: 10 },
        { name: "Whole Wheat Bread", quantity: "1 slice", calories: 70, protein: 3, carbs: 12, fat: 1 },
        { name: "Mixed Berries", quantity: "100g", calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
      ],
      lunch: [
        { name: "Chicken Breast", quantity: "150g grilled", calories: 248, protein: 47, carbs: 0, fat: 5 },
        { name: "Mixed Salad Greens", quantity: "200g", calories: 34, protein: 3, carbs: 6, fat: 0.4 },
        { name: "Olive Oil", quantity: "1 tbsp", calories: 119, protein: 0, carbs: 0, fat: 13.5 },
      ],
      snack: [
        { name: "Greek Yogurt", quantity: "150g", calories: 105, protein: 15, carbs: 6, fat: 1.5 },
        { name: "Almonds", quantity: "20g", calories: 109, protein: 4, carbs: 4, fat: 9 },
      ],
      dinner: [
        { name: "Salmon Fillet", quantity: "150g baked", calories: 312, protein: 30, carbs: 0, fat: 19.5 },
        { name: "Broccoli", quantity: "150g steamed", calories: 51, protein: 4, carbs: 10, fat: 0.6 },
        { name: "Sweet Potato", quantity: "150g", calories: 129, protein: 2, carbs: 30, fat: 0.2 },
      ],
    },
  },
  {
    name: "Muscle Gain",
    description: "High-protein, calorie-surplus meal plan optimized for muscle growth and recovery.",
    meals: {
      breakfast: [
        { name: "Oatmeal", quantity: "100g", calories: 389, protein: 17, carbs: 66, fat: 7 },
        { name: "Whey Protein", quantity: "1 scoop", calories: 120, protein: 24, carbs: 3, fat: 1 },
        { name: "Banana", quantity: "1 medium", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
      ],
      lunch: [
        { name: "Lean Beef", quantity: "200g grilled", calories: 500, protein: 52, carbs: 0, fat: 30 },
        { name: "Brown Rice", quantity: "200g cooked", calories: 222, protein: 5, carbs: 46, fat: 1.8 },
        { name: "Avocado", quantity: "half", calories: 80, protein: 1, carbs: 4.5, fat: 7.5 },
      ],
      snack: [
        { name: "Cottage Cheese", quantity: "200g", calories: 196, protein: 22, carbs: 6, fat: 8 },
        { name: "Mixed Nuts", quantity: "30g", calories: 173, protein: 5, carbs: 6, fat: 16 },
      ],
      dinner: [
        { name: "Turkey Breast", quantity: "200g", calories: 270, protein: 60, carbs: 0, fat: 2 },
        { name: "Quinoa", quantity: "150g cooked", calories: 180, protein: 7, carbs: 32, fat: 2.9 },
        { name: "Spinach", quantity: "100g sautéed", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
      ],
    },
  },
  {
    name: "Balanced Nutrition",
    description: "Well-rounded meal plan with balanced macros for general health and sustained energy.",
    meals: {
      breakfast: [
        { name: "Greek Yogurt", quantity: "200g", calories: 140, protein: 20, carbs: 8, fat: 2 },
        { name: "Oatmeal", quantity: "50g", calories: 195, protein: 8.5, carbs: 33, fat: 3.5 },
        { name: "Mixed Berries", quantity: "100g", calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
      ],
      lunch: [
        { name: "Chicken Breast", quantity: "150g", calories: 248, protein: 47, carbs: 0, fat: 5 },
        { name: "Quinoa", quantity: "150g cooked", calories: 180, protein: 7, carbs: 32, fat: 2.9 },
        { name: "Mixed Salad Greens", quantity: "150g", calories: 26, protein: 2, carbs: 5, fat: 0.3 },
        { name: "Olive Oil", quantity: "1 tbsp", calories: 119, protein: 0, carbs: 0, fat: 13.5 },
      ],
      snack: [
        { name: "Apple", quantity: "1 medium", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
        { name: "Peanut Butter", quantity: "1 tbsp", calories: 94, protein: 4, carbs: 3, fat: 8 },
      ],
      dinner: [
        { name: "Salmon Fillet", quantity: "150g", calories: 312, protein: 30, carbs: 0, fat: 19.5 },
        { name: "Sweet Potato", quantity: "200g", calories: 172, protein: 3, carbs: 40, fat: 0.2 },
        { name: "Broccoli", quantity: "100g steamed", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Exercise data for assigned workouts
// ---------------------------------------------------------------------------
const beginnerExercises = [
  { name: "Barbell Bench Press", sets: 3, reps: 10, restTime: "90s", weight: "40 kg" },
  { name: "Barbell Row", sets: 3, reps: 10, restTime: "90s", weight: "35 kg" },
  { name: "Overhead Press", sets: 3, reps: 10, restTime: "90s", weight: "25 kg" },
  { name: "Barbell Back Squat", sets: 3, reps: 10, restTime: "120s", weight: "50 kg" },
  { name: "Deadlift", sets: 3, reps: 8, restTime: "120s", weight: "60 kg" },
  { name: "Plank", sets: 3, reps: 30, restTime: "60s" },
];

const fatLossExercises = [
  { name: "Burpee", sets: 3, reps: 12, restTime: "45s" },
  { name: "Kettlebell Swing", sets: 3, reps: 15, restTime: "45s", weight: "16 kg" },
  { name: "Box Jump", sets: 3, reps: 10, restTime: "45s" },
  { name: "Mountain Climber", sets: 3, reps: 30, restTime: "30s" },
  { name: "Battle Ropes", sets: 3, reps: 30, restTime: "45s" },
  { name: "Russian Twist", sets: 3, reps: 20, restTime: "30s" },
];

const muscleExercises = [
  { name: "Barbell Bench Press", sets: 4, reps: 8, restTime: "120s", weight: "60 kg" },
  { name: "Barbell Row", sets: 4, reps: 8, restTime: "120s", weight: "50 kg" },
  { name: "Barbell Back Squat", sets: 4, reps: 8, restTime: "150s", weight: "70 kg" },
  { name: "Overhead Press", sets: 3, reps: 10, restTime: "90s", weight: "30 kg" },
  { name: "Deadlift", sets: 4, reps: 6, restTime: "150s", weight: "80 kg" },
  { name: "Pull-up", sets: 3, reps: 8, restTime: "90s" },
  { name: "Barbell Curl", sets: 3, reps: 12, restTime: "60s", weight: "20 kg" },
  { name: "Tricep Pushdown", sets: 3, reps: 12, restTime: "60s", weight: "15 kg" },
];

// Meals for daily diet plans
function getBalancedMeals() {
  return {
    breakfast: [
      { name: "Oatmeal", quantity: "80g", calories: 311, protein: 14, carbs: 53, fat: 5.6 },
      { name: "Banana", quantity: "1 medium", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
      { name: "Whey Protein", quantity: "1 scoop", calories: 120, protein: 24, carbs: 3, fat: 1 },
    ],
    lunch: [
      { name: "Chicken Breast", quantity: "150g", calories: 248, protein: 47, carbs: 0, fat: 5 },
      { name: "Brown Rice", quantity: "150g cooked", calories: 167, protein: 4, carbs: 35, fat: 1.4 },
      { name: "Broccoli", quantity: "100g", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
    ],
    snack: [
      { name: "Greek Yogurt", quantity: "150g", calories: 105, protein: 15, carbs: 6, fat: 1.5 },
      { name: "Almonds", quantity: "20g", calories: 109, protein: 4, carbs: 4, fat: 9 },
    ],
    dinner: [
      { name: "Salmon Fillet", quantity: "150g", calories: 312, protein: 30, carbs: 0, fat: 19.5 },
      { name: "Sweet Potato", quantity: "150g", calories: 129, protein: 2, carbs: 30, fat: 0.2 },
      { name: "Mixed Salad Greens", quantity: "100g", calories: 17, protein: 1.5, carbs: 3, fat: 0.2 },
    ],
  };
}

// Progress simulation per exercise
function generateProgress(exercises, completed, dayOffset, exerciseName) {
  return exercises.map((ex, i) => {
    if (!completed) {
      const someDone = i < 2;
      return {
        completed: someDone,
        setsCompleted: someDone ? Math.ceil(ex.sets / 2) : 0,
        totalSets: ex.sets,
        sets: Array.from({ length: ex.sets }, (_, si) => {
          const done = someDone && si < Math.ceil(ex.sets / 2);
          return {
            weight: ex.weight ? String(parseInt(ex.weight) + (dayOffset > 5 ? 2 : 0)) : "",
            reps: done ? String(ex.reps - (si > 1 ? 1 : 0)) : "",
          };
        }),
        notes: someDone ? "Felt okay, could push harder next time" : "",
      };
    }

    const progress = dayOffset / 15;
    const currentWeight = ex.weight ? Math.round(parseInt(ex.weight) * (0.85 + progress * 0.15)) : 0;
    const currentReps = ex.reps + (dayOffset > 7 ? 1 : 0);

    return {
      completed: true,
      setsCompleted: ex.sets,
      totalSets: ex.sets,
      sets: Array.from({ length: ex.sets }, (_, si) => ({
        weight: String(currentWeight + (si > 1 ? 2 : 0)),
        reps: String(currentReps - (si > 1 ? 1 : 0)),
      })),
      notes: dayOffset % 3 === 0 ? "Great session, increased weight!" : "Solid form throughout",
    };
  });
}

// ---------------------------------------------------------------------------
// Coaching data
// ---------------------------------------------------------------------------
const coachingNotes = [
  { title: "Great form on squats", message: "Your squat depth has improved significantly this week. Keep working on keeping your chest up.", priority: "low", category: "technique" },
  { title: "Recovery focus", message: "Make sure you're getting at least 7-8 hours of sleep. Recovery is just as important as training.", priority: "medium", category: "recovery" },
  { title: "Nutrition check-in", message: "Your meal prep looks good but try increasing your protein intake on training days.", priority: "medium", category: "nutrition" },
  { title: "Consistency reward", message: "You've hit 5 sessions this week! Excellent consistency — keep it up!", priority: "high", category: "motivation" },
  { title: "Deadlift technique", message: "Remember to brace your core before each rep on deadlifts. Let's work on this next session.", priority: "high", category: "technique" },
];

const feedbackMessages = [
  { title: "Week 1 Check-in", message: "Great start to the program! Your form on compound lifts looks solid. Let's focus on increasing your squat depth next week.", category: "technique", priority: "medium" },
  { title: "Week 2 Review", message: "Excellent progress this week. Your bench press has improved by 5kg! Nutrition is on track. Keep the momentum going.", category: "motivation", priority: "medium" },
  { title: "Week 3 Assessment", message: "Really impressed with your dedication. Cardio endurance is up 20%. Let's introduce some new exercises to keep challenging your body.", category: "general", priority: "low" },
];

const exerciseCommentsData = [
  { exerciseName: "Bench Press", comment: "Keep your shoulders retracted and drive through your heels. Try pausing at the bottom for better control." },
  { exerciseName: "Squat", comment: "Great depth! Focus on keeping your knees tracking over your toes. Try box squats to reinforce proper form." },
  { exerciseName: "Deadlift", comment: "Remember to pull the slack out of the bar before lifting. Your back position looks good!" },
  { exerciseName: "Push Up", comment: "Try lowering yourself more slowly on the eccentric phase. Quality over quantity." },
  { exerciseName: "Pull Up", comment: "Initiate the pull by driving your elbows down. You're ready to try weighted pull-ups soon!" },
];

const dietCommentsData = [
  { mealType: "breakfast", comment: "Add a source of protein to breakfast for better satiety throughout the morning." },
  { mealType: "lunch", comment: "Great choices! Try adding more leafy greens for micronutrients." },
  { mealType: "dinner", comment: "Consider reducing carb portion at dinner if you're training in the morning." },
];

async function main() {
  console.log("\n=== Demo Seed ===\n");

  // ---- Demo Users ----
  console.log("Creating demo users...");
  const admin = await prisma.user.upsert({
    where: { email: DEMO.admin.email },
    update: { password: PASSWORD_HASH, isActive: true },
    create: { name: DEMO.admin.name, email: DEMO.admin.email, password: PASSWORD_HASH, role: "ADMIN" },
  });
  const trainer = await prisma.user.upsert({
    where: { email: DEMO.trainer.email },
    update: { password: PASSWORD_HASH, isActive: true },
    create: { name: DEMO.trainer.name, email: DEMO.trainer.email, password: PASSWORD_HASH, role: "TRAINER" },
  });
  const trainee1 = await prisma.user.upsert({
    where: { email: DEMO.trainee1.email },
    update: { password: PASSWORD_HASH, isActive: true },
    create: { name: DEMO.trainee1.name, email: DEMO.trainee1.email, password: PASSWORD_HASH, role: "TRAINEE" },
  });
  const trainee2 = await prisma.user.upsert({
    where: { email: DEMO.trainee2.email },
    update: { password: PASSWORD_HASH, isActive: true },
    create: { name: DEMO.trainee2.name, email: DEMO.trainee2.email, password: PASSWORD_HASH, role: "TRAINEE" },
  });
  console.log(`  Admin: ${admin.email}`);
  console.log(`  Trainer: ${trainer.email} (${trainer.name})`);
  console.log(`  Trainee 1: ${trainee1.email} (${trainee1.name})`);
  console.log(`  Trainee 2: ${trainee2.email} (${trainee2.name})`);

  const demoUserIds = [admin.id, trainer.id, trainee1.id, trainee2.id];
  const demoEmails = Object.values(DEMO).map((u) => u.email);

  // ---- Trainer Profile ----
  console.log("\nCreating trainer profile...");
  await prisma.trainerProfile.upsert({
    where: { userId: trainer.id },
    update: { trainerCode: "DEMO01", bio: "Certified Strength and Conditioning Specialist with 8 years of experience helping clients transform their bodies through evidence-based training and nutrition.", specialties: "Strength Training, Nutrition Coaching, Weight Loss", yearsExperience: 8 },
    create: { userId: trainer.id, trainerCode: "DEMO01", bio: "Certified Strength and Conditioning Specialist with 8 years of experience helping clients transform their bodies through evidence-based training and nutrition.", specialties: "Strength Training, Nutrition Coaching, Weight Loss", yearsExperience: 8 },
  });
  console.log("  DEMO01 — Alex Trainer");

  // ---- Trainee Profiles ----
  console.log("\nCreating trainee profiles...");
  await prisma.traineeProfile.upsert({
    where: { userId: trainee1.id },
    update: { fitnessGoal: "Build muscle and increase strength" },
    create: { userId: trainee1.id, fitnessGoal: "Build muscle and increase strength" },
  });
  await prisma.traineeProfile.upsert({
    where: { userId: trainee2.id },
    update: { fitnessGoal: "Lose weight and improve endurance" },
    create: { userId: trainee2.id, fitnessGoal: "Lose weight and improve endurance" },
  });
  await prisma.user.update({
    where: { id: trainee1.id },
    data: { bio: "Software engineer looking to get in the best shape of my life. Been training consistently for 6 months.", gender: "male", age: 28, height: 178, weight: 78, location: "New York, NY", preferences: { workoutReminders: true, emailNotifications: true, darkMode: false } },
  });
  await prisma.user.update({
    where: { id: trainee2.id },
    data: { bio: "Marketing professional on a weight loss journey. Down 10kg so far and committed to reaching my goal weight.", gender: "female", age: 35, height: 165, weight: 72, location: "Los Angeles, CA", preferences: { workoutReminders: true, emailNotifications: true, darkMode: true } },
  });
  console.log("  2 Trainee profiles with bio, age, weight, height, goals");

  // ---- Trainer Links ----
  console.log("\nCreating trainer links...");
  await prisma.trainerLink.deleteMany({ where: { traineeId: { in: [trainee1.id, trainee2.id] } } });
  await prisma.trainerLink.create({ data: { trainerId: trainer.id, traineeId: trainee1.id } });
  await prisma.trainerLink.create({ data: { trainerId: trainer.id, traineeId: trainee2.id } });
  console.log("  Trainer → Trainee 1 & Trainee 2");

  // ---- Food Items ----
  console.log("\nCreating food items...");
  const existingFoods = await prisma.foodItem.count({ where: { trainerId: null } });
  if (existingFoods === 0) {
    for (const food of foodItems) {
      await prisma.foodItem.create({ data: food });
    }
    console.log(`  ${foodItems.length} food items created`);
  } else {
    console.log(`  ${existingFoods} food items already exist, skipping`);
  }

  // ---- Workout Templates ----
  console.log("\nCreating workout templates...");
  await prisma.workoutTemplate.deleteMany({ where: { trainerId: trainer.id } });
  for (const tpl of workoutTemplates) {
    await prisma.workoutTemplate.create({
      data: {
        trainerId: trainer.id,
        name: tpl.name,
        description: tpl.description,
        difficulty: tpl.difficulty,
        estimatedDuration: tpl.estimatedDuration,
        exercises: tpl.exercises,
      },
    });
  }
  console.log(`  ${workoutTemplates.length} workout templates created`);

  // ---- Diet Templates ----
  console.log("\nCreating diet templates...");
  await prisma.dietTemplate.deleteMany({ where: { trainerId: trainer.id } });
  for (const tpl of dietTemplates) {
    await prisma.dietTemplate.create({
      data: {
        trainerId: trainer.id,
        name: tpl.name,
        description: tpl.description,
        meals: tpl.meals,
      },
    });
  }
  console.log(`  ${dietTemplates.length} diet templates created`);

  // ---- Cleanup old demo data ----
  const demoAllTraineeIds = [trainee1.id, trainee2.id];
  await prisma.assignedWorkout.deleteMany({ where: { traineeId: { in: demoAllTraineeIds } } });
  await prisma.dietPlan.deleteMany({ where: { traineeId: { in: demoAllTraineeIds } } });
  await prisma.workoutLog.deleteMany({ where: { traineeId: { in: demoAllTraineeIds } } });
  await prisma.feedback.deleteMany({ where: { trainerId: trainer.id, traineeId: { in: demoAllTraineeIds } } });
  await prisma.coachingNote.deleteMany({ where: { trainerId: trainer.id, traineeId: { in: demoAllTraineeIds } } });
  await prisma.exerciseComment.deleteMany({ where: { trainerId: trainer.id, traineeId: { in: demoAllTraineeIds } } });
  await prisma.dietComment.deleteMany({ where: { trainerId: trainer.id, traineeId: { in: demoAllTraineeIds } } });

  // ---- Assigned Workouts (14 days) ----
  console.log("\nCreating assigned workouts (14 days)...");
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const exerciseSets = [beginnerExercises, fatLossExercises, muscleExercises];

  for (let offset = 0; offset < 14; offset++) {
    const date = daysAgo(offset);
    const dayName = dayNames[date.getDay()];
    const exSet = exerciseSets[offset % 3];

    for (const traineeId of demoAllTraineeIds) {
      await prisma.assignedWorkout.create({
        data: {
          trainerId: trainer.id,
          traineeId,
          day: date,
          name: dayName,
          exercises: exSet,
        },
      });
    }
  }
  console.log("  14 days × 2 trainees = 28 assigned workouts");

  // ---- Diet Plans (14 days) ----
  console.log("\nCreating diet plans (14 days)...");
  for (let offset = 0; offset < 14; offset++) {
    const date = daysAgo(offset);
    const meals = getBalancedMeals();

    for (const traineeId of demoAllTraineeIds) {
      await prisma.dietPlan.create({
        data: {
          trainerId: trainer.id,
          traineeId,
          day: date,
          meals,
        },
      });
    }
  }
  console.log("  14 days × 2 trainees = 28 diet plans");

  // ---- Workout Logs (14 days with progress) ----
  console.log("\nCreating workout logs with progress...");

  let logCount = 0;
  for (let offset = 0; offset < 14; offset++) {
    const date = daysAgo(offset);
    // ~70% completion rate — 10 of 14 days completed
    const completed = offset % 5 !== 3;

    for (const traineeId of demoAllTraineeIds) {
      const exSet = exerciseSets[offset % 3];
      const progress = generateProgress(exSet, completed, offset);

      await prisma.workoutLog.create({
        data: {
          traineeId,
          day: date,
          exercises: exSet,
          progress,
          completed,
          completedAt: completed ? daysAgoWithTime(offset) : null,
          note: completed
            ? (offset % 2 === 0 ? "Felt strong today! Good session." : "Tough workout but pushed through.")
            : null,
        },
      });
      logCount++;
    }
  }
  console.log(`  ${logCount} workout logs with realistic progression data`);

  // ---- Exercise History (separate logs for progression tracking) ----
  // These create additional logs specifically for the 5 tracked exercises
  // to show rich historical data
  console.log("\nCreating exercise history entries...");
  const trackedExercises = [
    { name: "Bench Press", category: "chest", equipment: "Barbell" },
    { name: "Squat", category: "legs", equipment: "Barbell" },
    { name: "Deadlift", category: "back", equipment: "Barbell" },
    { name: "Push Up", category: "chest", equipment: "Bodyweight" },
    { name: "Pull Up", category: "back", equipment: "Bodyweight" },
  ];

  // Progression weights over 10 weeks
  const benchProgression = [40, 42, 45, 45, 48, 50, 50, 52, 55, 55];
  const squatProgression = [50, 55, 55, 60, 60, 65, 65, 70, 70, 75];
  const deadliftProgression = [60, 65, 70, 70, 75, 80, 80, 85, 85, 90];
  const pushupProgression = [10, 12, 12, 15, 15, 18, 20, 20, 22, 25];
  const pullupProgression = [5, 5, 6, 6, 7, 8, 8, 9, 10, 10];

  const progressions = [benchProgression, squatProgression, deadliftProgression, pushupProgression, pullupProgression];

  for (let week = 0; week < 10; week++) {
    const date = daysAgo(week * 7 + 14);

    for (let exIdx = 0; exIdx < trackedExercises.length; exIdx++) {
      const ex = trackedExercises[exIdx];
      const weight = progressions[exIdx][week];
      const reps = 10 - Math.floor(week / 3);

      const singleExercise = [
        {
          name: ex.name,
          sets: 3,
          reps: reps,
          weight: ex.name === "Push Up" || ex.name === "Pull Up" ? undefined : `${weight} kg`,
        },
      ];

      const singleProgress = [
        {
          completed: true,
          setsCompleted: 3,
          totalSets: 3,
          sets: [
            { weight: String(weight), reps: String(reps) },
            { weight: String(weight), reps: String(reps - 1) },
            { weight: String(weight + 2), reps: String(Math.max(reps - 2, 1)) },
          ],
          notes: week > 5 ? "Progressive overload working well" : "Building consistency",
        },
      ];

      for (const traineeId of demoAllTraineeIds) {
        await prisma.workoutLog.create({
          data: {
            traineeId,
            day: date,
            exercises: singleExercise,
            progress: singleProgress,
            completed: true,
            completedAt: new Date(date.getTime() + 3600000),
            note: `Week ${week + 1} — ${ex.name}`,
          },
        });
      }
    }
  }
  console.log(`  10 weeks × 5 exercises × 2 trainees = 100 history entries`);

  // ---- Coaching Notes ----
  console.log("\nCreating coaching notes...");
  for (let i = 0; i < coachingNotes.length; i++) {
    const note = coachingNotes[i];
    for (const traineeId of demoAllTraineeIds) {
      const date = daysAgo(i * 2);
      await prisma.coachingNote.create({
        data: {
          trainerId: trainer.id,
          traineeId,
          title: note.title,
          message: note.message,
          priority: note.priority,
          category: note.category,
          read: i < 2,
          createdAt: date,
        },
      });
    }
  }
  console.log(`  ${coachingNotes.length} coaching note types × 2 trainees`);

  // ---- Feedback ----
  console.log("\nCreating weekly feedback...");
  for (let weekOffset = 0; weekOffset < feedbackMessages.length; weekOffset++) {
    const weekStart = daysAgo(weekOffset * 7 + 7);
    const fb = feedbackMessages[weekOffset];

    for (const traineeId of demoAllTraineeIds) {
      const existing = await prisma.feedback.findFirst({
        where: { trainerId: trainer.id, traineeId, weekStart },
      });
      if (!existing) {
        await prisma.feedback.create({
          data: {
            trainerId: trainer.id,
            traineeId,
            weekStart,
            title: fb.title,
            message: fb.message,
            category: fb.category,
            priority: fb.priority,
            read: false,
          },
        });
      }
    }
  }
  console.log(`  ${feedbackMessages.length} weekly feedback entries × 2 trainees`);

  // ---- Exercise Comments ----
  console.log("\nCreating exercise comments...");
  for (const ec of exerciseCommentsData) {
    for (const traineeId of demoAllTraineeIds) {
      await prisma.exerciseComment.upsert({
        where: {
          trainerId_traineeId_exerciseName: {
            trainerId: trainer.id,
            traineeId,
            exerciseName: ec.exerciseName,
          },
        },
        update: { comment: ec.comment },
        create: {
          trainerId: trainer.id,
          traineeId,
          exerciseName: ec.exerciseName,
          comment: ec.comment,
        },
      });
    }
  }
  console.log(`  ${exerciseCommentsData.length} exercise comments × 2 trainees`);

  // ---- Diet Comments ----
  console.log("\nCreating diet comments...");
  for (const dc of dietCommentsData) {
    for (const traineeId of demoAllTraineeIds) {
      await prisma.dietComment.upsert({
        where: {
          trainerId_traineeId_mealType: {
            trainerId: trainer.id,
            traineeId,
            mealType: dc.mealType,
          },
        },
        update: { comment: dc.comment },
        create: {
          trainerId: trainer.id,
          traineeId,
          mealType: dc.mealType,
          comment: dc.comment,
        },
      });
    }
  }
  console.log(`  ${dietCommentsData.length} diet comments × 2 trainees`);

  console.log("\n=== Demo Seed Complete ===\n");
}

module.exports = main;

if (require.main === module) {
  main()
    .catch((e) => {
      console.error("Demo seed failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
