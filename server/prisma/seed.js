require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PASSWORD_HASH = bcrypt.hashSync("password123", 10);
const ADMIN_HASH = bcrypt.hashSync("admin123", 10);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Preset workout definitions
// ---------------------------------------------------------------------------
const presetData = [
  {
    name: "Beginner Full Body",
    description: "A beginner-friendly full body program with compound movements.",
    days: [
      { dayNumber: 1, name: "Full Body A", exercises: [
        { name: "Bodyweight Squats", sets: 3, reps: 12 },
        { name: "Push-ups", sets: 3, reps: 10 },
        { name: "Bent Over Rows (Dumbbell)", sets: 3, reps: 10 },
        { name: "Plank", sets: 3, reps: 30 },
        { name: "Jumping Jacks", sets: 3, reps: 20 },
      ]},
      { dayNumber: 2, name: "Full Body B", exercises: [
        { name: "Lunges", sets: 3, reps: 10 },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: 10 },
        { name: "Lat Pulldown", sets: 3, reps: 10 },
        { name: "Glute Bridges", sets: 3, reps: 12 },
        { name: "Bicycle Crunches", sets: 3, reps: 15 },
      ]},
      { dayNumber: 3, name: "Full Body C", exercises: [
        { name: "Goblet Squats", sets: 3, reps: 10 },
        { name: "Dumbbell Bench Press", sets: 3, reps: 10 },
        { name: "Seated Cable Row", sets: 3, reps: 10 },
        { name: "Dumbbell Deadlifts", sets: 3, reps: 8 },
        { name: "Mountain Climbers", sets: 3, reps: 20 },
      ]},
      { dayNumber: 4, name: "Cardio & Core", exercises: [
        { name: "Brisk Walking", sets: 1, reps: 20 },
        { name: "Plank", sets: 3, reps: 30 },
        { name: "Bicycle Crunches", sets: 3, reps: 15 },
        { name: "Jumping Jacks", sets: 3, reps: 25 },
        { name: "Russian Twists", sets: 3, reps: 12 },
      ]},
      { dayNumber: 5, name: "Full Body D", exercises: [
        { name: "Dumbbell Thrusters", sets: 3, reps: 10 },
        { name: "Push-ups", sets: 3, reps: 12 },
        { name: "Single Leg Romanian Deadlifts", sets: 3, reps: 8 },
        { name: "Lat Pulldown", sets: 3, reps: 10 },
        { name: "Flutter Kicks", sets: 3, reps: 20 },
      ]},
      { dayNumber: 6, name: "Light Cardio & Mobility", exercises: [
        { name: "Cycling", sets: 1, reps: 20 },
        { name: "Hip Flexor Stretch", sets: 3, reps: 30 },
        { name: "Shoulder Rolls", sets: 3, reps: 12 },
        { name: "Cat-Cow Stretch", sets: 3, reps: 12 },
        { name: "Walking Lunges (Bodyweight)", sets: 3, reps: 10 },
      ]},
      { dayNumber: 7, name: "Recovery & Stretching", exercises: [
        { name: "Full Body Stretching Routine", sets: 1, reps: 15 },
        { name: "Foam Rolling (Back)", sets: 1, reps: 5 },
        { name: "Foam Rolling (Legs)", sets: 1, reps: 5 },
        { name: "Child's Pose", sets: 2, reps: 45 },
        { name: "Deep Breathing", sets: 3, reps: 10 },
      ]},
    ],
  },
  {
    name: "Push-Pull-Legs",
    description: "A 6-day PPL split for intermediate trainees.",
    days: [
      { dayNumber: 1, name: "Push A", exercises: [
        { name: "Barbell Bench Press", sets: 4, reps: 8 },
        { name: "Overhead Press", sets: 4, reps: 8 },
        { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
        { name: "Lateral Raises", sets: 3, reps: 12 },
        { name: "Tricep Pushdowns", sets: 3, reps: 12 },
      ]},
      { dayNumber: 2, name: "Pull A", exercises: [
        { name: "Deadlifts", sets: 4, reps: 6 },
        { name: "Pull-ups", sets: 4, reps: 8 },
        { name: "Seated Cable Row", sets: 3, reps: 10 },
        { name: "Face Pulls", sets: 3, reps: 15 },
        { name: "Barbell Curls", sets: 3, reps: 10 },
      ]},
      { dayNumber: 3, name: "Legs A", exercises: [
        { name: "Barbell Squats", sets: 4, reps: 8 },
        { name: "Romanian Deadlifts", sets: 4, reps: 8 },
        { name: "Leg Press", sets: 3, reps: 10 },
        { name: "Walking Lunges", sets: 3, reps: 12 },
        { name: "Calf Raises", sets: 4, reps: 15 },
      ]},
      { dayNumber: 4, name: "Push B", exercises: [
        { name: "Dumbbell Bench Press", sets: 4, reps: 10 },
        { name: "Arnold Press", sets: 4, reps: 8 },
        { name: "Cable Flyes", sets: 3, reps: 12 },
        { name: "Front Raises", sets: 3, reps: 12 },
        { name: "Skull Crushers", sets: 3, reps: 10 },
      ]},
      { dayNumber: 5, name: "Pull B", exercises: [
        { name: "Barbell Rows", sets: 4, reps: 8 },
        { name: "Lat Pulldown", sets: 4, reps: 10 },
        { name: "T-Bar Row", sets: 3, reps: 10 },
        { name: "Hammer Curls", sets: 3, reps: 10 },
        { name: "Shrugs", sets: 3, reps: 12 },
      ]},
      { dayNumber: 6, name: "Legs B", exercises: [
        { name: "Front Squats", sets: 4, reps: 8 },
        { name: "Leg Curls", sets: 4, reps: 10 },
        { name: "Hip Thrusts", sets: 3, reps: 12 },
        { name: "Bulgarian Split Squats", sets: 3, reps: 10 },
        { name: "Seated Calf Raises", sets: 4, reps: 15 },
      ]},
      { dayNumber: 7, name: "Active Recovery", exercises: [
        { name: "Light Jogging", sets: 1, reps: 20 },
        { name: "Full Body Stretching", sets: 1, reps: 15 },
        { name: "Foam Rolling", sets: 1, reps: 10 },
        { name: "Yoga Flow", sets: 3, reps: 10 },
        { name: "Deep Breathing", sets: 3, reps: 10 },
      ]},
    ],
  },
  {
    name: "Weight Loss",
    description: "A high-rep circuit-style program designed for fat loss and conditioning.",
    days: [
      { dayNumber: 1, name: "Circuit A", exercises: [
        { name: "Jump Squats", sets: 3, reps: 15 },
        { name: "Push-ups", sets: 3, reps: 15 },
        { name: "Mountain Climbers", sets: 3, reps: 30 },
        { name: "Dumbbell Rows", sets: 3, reps: 12 },
        { name: "Burpees", sets: 3, reps: 10 },
        { name: "Plank Jacks", sets: 3, reps: 20 },
      ]},
      { dayNumber: 2, name: "Circuit B", exercises: [
        { name: "Alternating Lunges", sets: 3, reps: 12 },
        { name: "Dumbbell Shoulder Press", sets: 3, reps: 12 },
        { name: "Bicycle Crunches", sets: 3, reps: 20 },
        { name: "Kettlebell Swings", sets: 3, reps: 15 },
        { name: "High Knees", sets: 3, reps: 30 },
        { name: "Tricep Dips", sets: 3, reps: 12 },
      ]},
      { dayNumber: 3, name: "Cardio Core", exercises: [
        { name: "Box Jumps", sets: 3, reps: 10 },
        { name: "Russian Twists", sets: 3, reps: 20 },
        { name: "Battle Ropes", sets: 3, reps: 30 },
        { name: "Leg Raises", sets: 3, reps: 15 },
        { name: "Jump Rope", sets: 3, reps: 60 },
        { name: "Dead Bugs", sets: 3, reps: 12 },
      ]},
      { dayNumber: 4, name: "Circuit C", exercises: [
        { name: "Goblet Squats", sets: 3, reps: 12 },
        { name: "Dumbbell Bench Press", sets: 3, reps: 12 },
        { name: "Rows (Cable)", sets: 3, reps: 12 },
        { name: "Lateral Raises", sets: 3, reps: 15 },
        { name: "Farmer's Walk", sets: 3, reps: 30 },
        { name: "Plank", sets: 3, reps: 45 },
      ]},
      { dayNumber: 5, name: "HIIT Circuit", exercises: [
        { name: "Sprint Intervals", sets: 4, reps: 30 },
        { name: "Burpees", sets: 4, reps: 10 },
        { name: "Box Jumps", sets: 4, reps: 8 },
        { name: "Kettlebell Swings", sets: 4, reps: 12 },
        { name: "Mountain Climbers", sets: 4, reps: 25 },
      ]},
      { dayNumber: 6, name: "Full Body Burn", exercises: [
        { name: "Thrusters", sets: 3, reps: 10 },
        { name: "Pull-ups (Assisted)", sets: 3, reps: 8 },
        { name: "Medicine Ball Slams", sets: 3, reps: 12 },
        { name: "Walking Lunges", sets: 3, reps: 12 },
        { name: "Rowing Machine", sets: 3, reps: 60 },
      ]},
      { dayNumber: 7, name: "Recovery & Mobility", exercises: [
        { name: "Yoga Stretches", sets: 3, reps: 45 },
        { name: "Foam Rolling", sets: 3, reps: 60 },
        { name: "Cat-Cow Stretch", sets: 3, reps: 12 },
        { name: "Hip Flexor Stretch", sets: 3, reps: 30 },
        { name: "Child's Pose", sets: 3, reps: 60 },
      ]},
    ],
  },
];

// ---------------------------------------------------------------------------
// User definitions
// ---------------------------------------------------------------------------
const SEED_EMAILS = {
  admin: "admin@latraino.com",
  trainer1: "sarah.jenkins@example.com",
  trainer2: "marcus.chen@example.com",
};

const trainer1Trainees = [
  { name: "Emily Rodriguez", email: "emily.r@example.com" },
  { name: "James Thompson", email: "james.t@example.com" },
  { name: "Sophia Kim", email: "sophia.k@example.com" },
];

const trainer2Trainees = [
  { name: "Liam O'Brien", email: "liam.ob@example.com" },
  { name: "Ava Patel", email: "ava.p@example.com" },
  { name: "Noah Williams", email: "noah.w@example.com" },
];

// ---------------------------------------------------------------------------
// Meal templates for diet plans
// ---------------------------------------------------------------------------
function getMealsForDay() {
  return [
    { time: "Breakfast", items: ["Oatmeal", "Banana", "Almond Milk", "Whey Protein"] },
    { time: "Lunch", items: ["Grilled Chicken Breast", "Brown Rice", "Steamed Broccoli", "Olive Oil"] },
    { time: "Snack", items: ["Greek Yogurt", "Mixed Berries", "Almonds"] },
    { time: "Dinner", items: ["Salmon Fillet", "Sweet Potato", "Asparagus", "Quinoa"] },
  ];
}

// ---------------------------------------------------------------------------
// Exercises for assigned workouts
// ---------------------------------------------------------------------------
const ASSIGNED_EXERCISES = [
  { name: "Barbell Bench Press", sets: 4, reps: 8 },
  { name: "Bent Over Rows", sets: 4, reps: 8 },
  { name: "Overhead Press", sets: 3, reps: 10 },
  { name: "Lat Pulldown", sets: 3, reps: 10 },
  { name: "Barbell Curls", sets: 3, reps: 10 },
  { name: "Tricep Pushdowns", sets: 3, reps: 12 },
];

// ---------------------------------------------------------------------------
// Global Workout Preset templates
// ---------------------------------------------------------------------------
const globalWorkoutPresets = [
  // ── Chest ──
  { name: "Beginner Chest", description: "Simple chest exercises to build foundational strength.", category: "chest", difficulty: "Beginner", tags: ["chest", "push", "beginner"], estimatedDuration: 30, exercises: [
    { name: "Push-ups", sets: 3, reps: 10 }, { name: "Dumbbell Bench Press", sets: 3, reps: 10 }, { name: "Incline Dumbbell Press", sets: 3, reps: 10 }, { name: "Chest Flyes (Cable)", sets: 3, reps: 12 }, { name: "Push-ups (Decline)", sets: 3, reps: 8 },
  ]},
  { name: "Intermediate Chest", description: "Moderate intensity chest workout for steady gains.", category: "chest", difficulty: "Intermediate", tags: ["chest", "push", "intermediate"], estimatedDuration: 40, exercises: [
    { name: "Barbell Bench Press", sets: 4, reps: 8 }, { name: "Incline Dumbbell Press", sets: 4, reps: 10 }, { name: "Dumbbell Flyes", sets: 3, reps: 12 }, { name: "Decline Bench Press", sets: 3, reps: 10 }, { name: "Cable Crossovers", sets: 3, reps: 12 },
  ]},
  { name: "Advanced Chest", description: "High volume chest workout for experienced lifters.", category: "chest", difficulty: "Advanced", tags: ["chest", "push", "advanced"], estimatedDuration: 50, exercises: [
    { name: "Heavy Barbell Bench Press", sets: 5, reps: 5 }, { name: "Incline Barbell Press", sets: 4, reps: 8 }, { name: "Dumbbell Pullovers", sets: 3, reps: 10 }, { name: "Weighted Dips", sets: 3, reps: 8 }, { name: "Low-to-High Cable Flyes", sets: 3, reps: 12 }, { name: "Push-ups (Weighted)", sets: 3, reps: 10 },
  ]},
  // ── Back ──
  { name: "Beginner Back", description: "Foundational back exercises for posture and strength.", category: "back", difficulty: "Beginner", tags: ["back", "pull", "beginner"], estimatedDuration: 30, exercises: [
    { name: "Lat Pulldown", sets: 3, reps: 10 }, { name: "Seated Cable Row", sets: 3, reps: 10 }, { name: "Dumbbell Rows", sets: 3, reps: 10 }, { name: "Face Pulls", sets: 3, reps: 12 }, { name: "Superman Hold", sets: 3, reps: 15 },
  ]},
  { name: "Intermediate Back", description: "Build a wider, stronger back with compound pulls.", category: "back", difficulty: "Intermediate", tags: ["back", "pull", "intermediate"], estimatedDuration: 40, exercises: [
    { name: "Deadlifts", sets: 4, reps: 6 }, { name: "Pull-ups", sets: 4, reps: 8 }, { name: "Barbell Rows", sets: 4, reps: 8 }, { name: "T-Bar Row", sets: 3, reps: 10 }, { name: "Lat Pulldown (Wide Grip)", sets: 3, reps: 10 },
  ]},
  { name: "Advanced Back", description: "Intense back workout for maximum width and thickness.", category: "back", difficulty: "Advanced", tags: ["back", "pull", "advanced"], estimatedDuration: 50, exercises: [
    { name: "Deadlifts (Heavy)", sets: 5, reps: 5 }, { name: "Weighted Pull-ups", sets: 4, reps: 6 }, { name: "Pendlay Rows", sets: 4, reps: 8 }, { name: "Meadows Rows", sets: 3, reps: 10 }, { name: "Straight Arm Pulldown", sets: 3, reps: 12 }, { name: "Shrugs (Dumbbell)", sets: 3, reps: 12 },
  ]},
  // ── Bicep ──
  { name: "Beginner Biceps", description: "Simple and effective bicep exercises to start building arms.", category: "bicep", difficulty: "Beginner", tags: ["bicep", "arms", "pull", "beginner"], estimatedDuration: 25, exercises: [
    { name: "Dumbbell Curls", sets: 3, reps: 10 }, { name: "Hammer Curls", sets: 3, reps: 10 }, { name: "Barbell Curls", sets: 3, reps: 10 }, { name: "Concentration Curls", sets: 3, reps: 12 },
  ]},
  { name: "Bicep Blast", description: "Isolation-focused bicep workout for peak contraction.", category: "bicep", difficulty: "Intermediate", tags: ["bicep", "arms", "pull", "intermediate"], estimatedDuration: 30, exercises: [
    { name: "Incline Dumbbell Curls", sets: 4, reps: 10 }, { name: "Preacher Curls (EZ Bar)", sets: 4, reps: 10 }, { name: "Cable Curls", sets: 3, reps: 12 }, { name: "Spider Curls", sets: 3, reps: 12 }, { name: "Reverse Curls", sets: 3, reps: 10 },
  ]},
  { name: "Bicep & Forearm", description: "Target both biceps and forearms for complete arm development.", category: "bicep", difficulty: "Intermediate", tags: ["bicep", "arms", "forearm", "intermediate"], estimatedDuration: 35, exercises: [
    { name: "Barbell Curls", sets: 4, reps: 8 }, { name: "Hammer Curls", sets: 4, reps: 10 }, { name: "Wrist Curls", sets: 3, reps: 15 }, { name: "Reverse Wrist Curls", sets: 3, reps: 15 }, { name: "Farmer's Walk", sets: 3, reps: 30 },
  ]},
  // ── Tricep ──
  { name: "Beginner Triceps", description: "Easy tricep exercises to build arm strength.", category: "tricep", difficulty: "Beginner", tags: ["tricep", "arms", "push", "beginner"], estimatedDuration: 25, exercises: [
    { name: "Tricep Pushdowns (Cable)", sets: 3, reps: 10 }, { name: "Overhead Tricep Extensions", sets: 3, reps: 10 }, { name: "Bench Dips", sets: 3, reps: 10 }, { name: "Skull Crushers (EZ Bar)", sets: 3, reps: 10 },
  ]},
  { name: "Tricep Crushers", description: "High-volume tricep isolation for arm density.", category: "tricep", difficulty: "Intermediate", tags: ["tricep", "arms", "push", "intermediate"], estimatedDuration: 30, exercises: [
    { name: "Close-Grip Bench Press", sets: 4, reps: 8 }, { name: "Tricep Pushdowns (Rope)", sets: 4, reps: 12 }, { name: "Skull Crushers (Dumbbell)", sets: 3, reps: 10 }, { name: "Diamond Push-ups", sets: 3, reps: 10 }, { name: "French Press", sets: 3, reps: 12 },
  ]},
  { name: "Advanced Arm Finisher", description: "Burn out both biceps and triceps in one session.", category: "tricep", difficulty: "Advanced", tags: ["tricep", "bicep", "arms", "advanced"], estimatedDuration: 35, exercises: [
    { name: "Weighted Dips", sets: 4, reps: 8 }, { name: "Skull Crushers (Heavy)", sets: 4, reps: 8 }, { name: "Tricep Pushdowns (Straight Bar)", sets: 3, reps: 12 }, { name: "EZ Bar Curls", sets: 4, reps: 8 }, { name: "Incline Hammer Curls", sets: 3, reps: 10 }, { name: "Cable Overhead Tricep Extension", sets: 3, reps: 12 },
  ]},
  // ── Legs ──
  { name: "Beginner Legs", description: "Foundation leg workout for lower body strength.", category: "legs", difficulty: "Beginner", tags: ["legs", "lower-body", "beginner"], estimatedDuration: 30, exercises: [
    { name: "Bodyweight Squats", sets: 3, reps: 12 }, { name: "Walking Lunges", sets: 3, reps: 10 }, { name: "Glute Bridges", sets: 3, reps: 12 }, { name: "Calf Raises", sets: 3, reps: 15 }, { name: "Step-ups", sets: 3, reps: 10 },
  ]},
  { name: "Leg Day", description: "Intermediate leg workout with compound lifts.", category: "legs", difficulty: "Intermediate", tags: ["legs", "lower-body", "intermediate"], estimatedDuration: 45, exercises: [
    { name: "Barbell Squats", sets: 4, reps: 8 }, { name: "Romanian Deadlifts", sets: 4, reps: 8 }, { name: "Leg Press", sets: 3, reps: 10 }, { name: "Bulgarian Split Squats", sets: 3, reps: 10 }, { name: "Seated Calf Raises", sets: 4, reps: 15 },
  ]},
  { name: "Advanced Legs", description: "High intensity leg day for maximum strength and size.", category: "legs", difficulty: "Advanced", tags: ["legs", "lower-body", "advanced"], estimatedDuration: 55, exercises: [
    { name: "Heavy Back Squats", sets: 5, reps: 5 }, { name: "Front Squats", sets: 4, reps: 8 }, { name: "Box Jumps", sets: 3, reps: 8 }, { name: "Nordic Curls", sets: 3, reps: 6 }, { name: "Bulgarian Split Squats (Weighted)", sets: 3, reps: 8 }, { name: "Standing Calf Raises", sets: 4, reps: 12 },
  ]},
  // ── Shoulder ──
  { name: "Shoulder Builder", description: "Build rounded, strong shoulders.", category: "shoulder", difficulty: "Beginner", tags: ["shoulder", "push", "upper-body", "beginner"], estimatedDuration: 30, exercises: [
    { name: "Seated Dumbbell Press", sets: 3, reps: 10 }, { name: "Lateral Raises", sets: 3, reps: 12 }, { name: "Front Raises", sets: 3, reps: 12 }, { name: "Reverse Flyes", sets: 3, reps: 12 }, { name: "Arnold Press", sets: 3, reps: 10 },
  ]},
  { name: "Deltoid Focus", description: "Target all three deltoid heads for capped shoulders.", category: "shoulder", difficulty: "Intermediate", tags: ["shoulder", "push", "intermediate"], estimatedDuration: 40, exercises: [
    { name: "Overhead Press (Barbell)", sets: 4, reps: 8 }, { name: "Lateral Raises (Cable)", sets: 4, reps: 12 }, { name: "Face Pulls", sets: 3, reps: 15 }, { name: "Front Raises (Plate)", sets: 3, reps: 12 }, { name: "Upright Rows", sets: 3, reps: 10 }, { name: "Reverse Pec Deck Flyes", sets: 3, reps: 12 },
  ]},
  // ── Core ──
  { name: "Core Strength", description: "Build a stable, strong core with these exercises.", category: "core", difficulty: "Beginner", tags: ["core", "abs", "beginner"], estimatedDuration: 20, exercises: [
    { name: "Plank", sets: 3, reps: 30 }, { name: "Bicycle Crunches", sets: 3, reps: 15 }, { name: "Leg Raises", sets: 3, reps: 12 }, { name: "Russian Twists", sets: 3, reps: 20 }, { name: "Dead Bugs", sets: 3, reps: 12 },
  ]},
  { name: "Abs & Core", description: "Intense core circuit for definition and endurance.", category: "core", difficulty: "Intermediate", tags: ["core", "abs", "intermediate"], estimatedDuration: 25, exercises: [
    { name: "Hanging Leg Raises", sets: 3, reps: 10 }, { name: "Cable Crunches", sets: 3, reps: 12 }, { name: "Ab Roller", sets: 3, reps: 10 }, { name: "Pallof Press", sets: 3, reps: 12 }, { name: "Side Plank (Weighted)", sets: 3, reps: 30 }, { name: "Medicine Ball Slams", sets: 3, reps: 12 },
  ]},
  // ── Full Body / All ──
  { name: "Full Body Beginner", description: "A well-rounded full body workout for beginners.", category: "full-body", difficulty: "Beginner", tags: ["full-body", "total-body", "beginner"], estimatedDuration: 35, exercises: [
    { name: "Goblet Squats", sets: 3, reps: 10 }, { name: "Push-ups", sets: 3, reps: 10 }, { name: "Dumbbell Rows", sets: 3, reps: 10 }, { name: "Plank", sets: 3, reps: 30 }, { name: "Glute Bridges", sets: 3, reps: 12 },
  ]},
  { name: "Full Body Intermediate", description: "Compound-focused full body for steady gains.", category: "full-body", difficulty: "Intermediate", tags: ["full-body", "total-body", "intermediate"], estimatedDuration: 45, exercises: [
    { name: "Barbell Squats", sets: 4, reps: 8 }, { name: "Barbell Bench Press", sets: 4, reps: 8 }, { name: "Bent Over Rows", sets: 4, reps: 8 }, { name: "Overhead Press", sets: 3, reps: 10 }, { name: "Deadlifts", sets: 3, reps: 6 },
  ]},
  { name: "Full Body HIIT", description: "High intensity full body circuit for fat burn and conditioning.", category: "full-body", difficulty: "Intermediate", tags: ["full-body", "hiit", "cardio", "intermediate"], estimatedDuration: 30, exercises: [
    { name: "Burpees", sets: 3, reps: 12 }, { name: "Kettlebell Swings", sets: 3, reps: 15 }, { name: "Box Jumps", sets: 3, reps: 10 }, { name: "Battle Ropes", sets: 3, reps: 30 }, { name: "Mountain Climbers", sets: 3, reps: 30 }, { name: "Thrusters", sets: 3, reps: 10 },
  ]},
  { name: "General Strength", description: "Basic strength training for overall fitness.", category: "full-body", difficulty: "Beginner", tags: ["full-body", "strength", "beginner"], estimatedDuration: 40, exercises: [
    { name: "Dumbbell Squats", sets: 3, reps: 10 }, { name: "Dumbbell Bench Press", sets: 3, reps: 10 }, { name: "Seated Cable Row", sets: 3, reps: 10 }, { name: "Dumbbell Shoulder Press", sets: 3, reps: 10 }, { name: "Plank", sets: 3, reps: 30 },
  ]},
];

// ---------------------------------------------------------------------------
// Individual Exercise Library — 190+ exercises across 15 categories
// ---------------------------------------------------------------------------
const exerciseData = [
  // ── Chest (14) ──
  { name: "Bench Press", category: "chest", equipment: "Barbell", difficulty: "Intermediate", description: "Flat barbell bench press for overall chest development." },
  { name: "Incline Bench Press", category: "chest", equipment: "Barbell", difficulty: "Intermediate", description: "Targets the upper chest at a 30-45 degree incline." },
  { name: "Decline Bench Press", category: "chest", equipment: "Barbell", difficulty: "Intermediate", description: "Emphasizes the lower chest at a decline angle." },
  { name: "Dumbbell Bench Press", category: "chest", equipment: "Dumbbells", difficulty: "Intermediate" },
  { name: "Incline Dumbbell Press", category: "chest", equipment: "Dumbbells", difficulty: "Intermediate", description: "Upper chest focus with dumbbells for greater range of motion." },
  { name: "Decline Dumbbell Press", category: "chest", equipment: "Dumbbells", difficulty: "Intermediate" },
  { name: "Dumbbell Flyes", category: "chest", equipment: "Dumbbells", difficulty: "Intermediate", description: "Isolation movement for chest stretch and contraction." },
  { name: "Cable Flyes", category: "chest", equipment: "Cable", difficulty: "Intermediate", description: "Cable crossover for constant tension on the chest." },
  { name: "Machine Chest Press", category: "chest", equipment: "Machine", difficulty: "Beginner" },
  { name: "Push-up", category: "chest", equipment: "Bodyweight", difficulty: "Beginner", description: "Classic bodyweight chest and tricep exercise." },
  { name: "Wide Push-up", category: "chest", equipment: "Bodyweight", difficulty: "Beginner", description: "Wider hand placement for greater chest activation." },
  { name: "Decline Push-up", category: "chest", equipment: "Bodyweight", difficulty: "Intermediate" },
  { name: "Chest Dip", category: "chest", equipment: "Parallel Bars", difficulty: "Intermediate", description: "Leaning forward dip variation for lower chest." },
  { name: "Pec Deck Flyes", category: "chest", equipment: "Machine", difficulty: "Beginner", description: "Machine-based chest isolation for beginners." },
  // ── Back (14) ──
  { name: "Pull-up", category: "back", equipment: "Pull-up Bar", difficulty: "Intermediate", description: "Compound vertical pull for lat width." },
  { name: "Chin-up", category: "back", equipment: "Pull-up Bar", difficulty: "Intermediate", description: "Underhand grip pull-up emphasizing biceps and lats." },
  { name: "Lat Pulldown", category: "back", equipment: "Cable", difficulty: "Beginner", description: "Vertical pulling movement for latissimus dorsi." },
  { name: "Wide-Grip Lat Pulldown", category: "back", equipment: "Cable", difficulty: "Intermediate", description: "Wider grip for greater lat width emphasis." },
  { name: "Close-Grip Lat Pulldown", category: "back", equipment: "Cable", difficulty: "Intermediate", description: "Close grip for lower lat activation." },
  { name: "Barbell Row", category: "back", equipment: "Barbell", difficulty: "Intermediate", description: "Compound horizontal pull for back thickness." },
  { name: "Pendlay Row", category: "back", equipment: "Barbell", difficulty: "Advanced", description: "Explosive barbell row from a dead stop each rep." },
  { name: "Dumbbell Row", category: "back", equipment: "Dumbbells", difficulty: "Intermediate", description: "Unilateral row for back thickness and core stability." },
  { name: "Seated Cable Row", category: "back", equipment: "Cable", difficulty: "Beginner", description: "Controlled horizontal pull for mid-back development." },
  { name: "T-Bar Row", category: "back", equipment: "Barbell", difficulty: "Intermediate" },
  { name: "Seal Row", category: "back", equipment: "Barbell", difficulty: "Intermediate", description: "Chest-supported row for back thickness without lower back strain." },
  { name: "Straight-Arm Pulldown", category: "back", equipment: "Cable", difficulty: "Intermediate", description: "Isolation movement for the lats with straight arms." },
  { name: "Deadlift", category: "back", equipment: "Barbell", difficulty: "Advanced", description: "Full body compound lift targeting the entire posterior chain." },
  { name: "Hyperextension", category: "back", equipment: "Bench", difficulty: "Beginner", description: "Lower back extension exercise for spinal erectors." },
  // ── Legs (14) ──
  { name: "Barbell Back Squat", category: "legs", equipment: "Barbell", difficulty: "Intermediate", description: "Foundation leg exercise targeting quads, glutes, and core." },
  { name: "Front Squat", category: "legs", equipment: "Barbell", difficulty: "Advanced", description: "Quad-dominant squat variation with upright torso." },
  { name: "Goblet Squat", category: "legs", equipment: "Dumbbell", difficulty: "Beginner", description: "Beginner-friendly squat with a dumbbell held at the chest." },
  { name: "Bulgarian Split Squat", category: "legs", equipment: "Dumbbells", difficulty: "Intermediate", description: "Single-leg squat with rear foot elevated." },
  { name: "Walking Lunge", category: "legs", equipment: "Dumbbells", difficulty: "Intermediate", description: "Dynamic lunge pattern for quads, glutes, and balance." },
  { name: "Reverse Lunge", category: "legs", equipment: "Dumbbells", difficulty: "Intermediate" },
  { name: "Leg Press", category: "legs", equipment: "Machine", difficulty: "Beginner", description: "Compound leg machine press for quad and glute mass." },
  { name: "Leg Extension", category: "legs", equipment: "Machine", difficulty: "Beginner", description: "Isolation exercise for the quadriceps." },
  { name: "Leg Curl", category: "legs", equipment: "Machine", difficulty: "Beginner", description: "Isolation exercise for the hamstrings." },
  { name: "Romanian Deadlift", category: "legs", equipment: "Barbell", difficulty: "Intermediate", description: "Hip-hinge movement for hamstring and glute development." },
  { name: "Box Jump", category: "legs", equipment: "Box", difficulty: "Intermediate", description: "Explosive plyometric movement for power and leg strength." },
  { name: "Step-up", category: "legs", equipment: "Bench", difficulty: "Beginner", description: "Unilateral leg exercise for functional strength." },
  { name: "Hack Squat", category: "legs", equipment: "Machine", difficulty: "Intermediate" },
  { name: "Pistol Squat", category: "legs", equipment: "Bodyweight", difficulty: "Advanced", description: "Single-leg squat requiring strength, balance, and mobility." },
  // ── Glutes (12) ──
  { name: "Hip Thrust", category: "glutes", equipment: "Barbell", difficulty: "Intermediate", description: "Barbell hip thrust for glute activation and hypertrophy." },
  { name: "Glute Bridge", category: "glutes", equipment: "Bodyweight", difficulty: "Beginner", description: "Bodyweight hip extension for glute engagement." },
  { name: "Single-Leg Glute Bridge", category: "glutes", equipment: "Bodyweight", difficulty: "Intermediate" },
  { name: "Cable Pull-Through", category: "glutes", equipment: "Cable", difficulty: "Intermediate", description: "Hip-hinge cable movement targeting the glutes." },
  { name: "Glute Ham Raise", category: "glutes", equipment: "Machine", difficulty: "Advanced", description: "Nordic curl variation for glute and hamstring development." },
  { name: "Donkey Kick", category: "glutes", equipment: "Bodyweight", difficulty: "Beginner", description: "Isolation glute activation exercise on all fours." },
  { name: "Fire Hydrant", category: "glutes", equipment: "Bodyweight", difficulty: "Beginner", description: "Hip abduction exercise for glute medius activation." },
  { name: "Glute Kickback", category: "glutes", equipment: "Cable", difficulty: "Intermediate", description: "Cable-based glute isolation with leg extension." },
  { name: "Sumo Squat", category: "glutes", equipment: "Dumbbell", difficulty: "Beginner", description: "Wide-stance squat emphasizing inner thighs and glutes." },
  { name: "Reverse Hyperextension", category: "glutes", equipment: "Machine", difficulty: "Intermediate", description: "Posterior chain movement for glutes and lower back." },
  { name: "Cable Hip Adduction", category: "glutes", equipment: "Cable", difficulty: "Beginner" },
  { name: "Curtsy Lunge", category: "glutes", equipment: "Dumbbells", difficulty: "Intermediate", description: "Lateral lunge variation targeting glute medius." },
  // ── Calves (10) ──
  { name: "Standing Calf Raise", category: "calves", equipment: "Machine", difficulty: "Beginner", description: "Standing calf raise for gastrocnemius development." },
  { name: "Seated Calf Raise", category: "calves", equipment: "Machine", difficulty: "Beginner", description: "Seated calf raise targeting the soleus muscle." },
  { name: "Donkey Calf Raise", category: "calves", equipment: "Machine", difficulty: "Intermediate" },
  { name: "Single-Leg Calf Raise", category: "calves", equipment: "Dumbbell", difficulty: "Intermediate" },
  { name: "Calf Press on Leg Press", category: "calves", equipment: "Machine", difficulty: "Beginner" },
  { name: "Jump Rope", category: "calves", equipment: "Rope", difficulty: "Intermediate", description: "Plyometric cardio that builds calf endurance and agility." },
  { name: "Farmer's Walk on Toes", category: "calves", equipment: "Dumbbells", difficulty: "Intermediate" },
  { name: "Reverse Calf Raise", category: "calves", equipment: "Bodyweight", difficulty: "Beginner", description: "Targets the anterior tibialis by lifting toes upward." },
  { name: "Step Calf Raise", category: "calves", equipment: "Bodyweight", difficulty: "Beginner" },
  { name: "Single-Leg Calf Press", category: "calves", equipment: "Machine", difficulty: "Intermediate", description: "Unilateral calf press for balanced lower leg development." },
  // ── Shoulders (14) ──
  { name: "Overhead Press", category: "shoulders", equipment: "Barbell", difficulty: "Intermediate", description: "Standing barbell press for overall shoulder development." },
  { name: "Seated Dumbbell Press", category: "shoulders", equipment: "Dumbbells", difficulty: "Intermediate" },
  { name: "Arnold Press", category: "shoulders", equipment: "Dumbbells", difficulty: "Intermediate", description: "Rotational dumbbell press targeting all three deltoid heads." },
  { name: "Lateral Raise", category: "shoulders", equipment: "Dumbbells", difficulty: "Beginner", description: "Isolation exercise for the lateral deltoid head." },
  { name: "Front Raise", category: "shoulders", equipment: "Dumbbells", difficulty: "Beginner", description: "Anterior deltoid isolation with dumbbells." },
  { name: "Reverse Flyes", category: "shoulders", equipment: "Dumbbells", difficulty: "Beginner", description: "Rear delt isolation for balanced shoulder development." },
  { name: "Upright Row", category: "shoulders", equipment: "Barbell", difficulty: "Intermediate", description: "Vertical pull for traps and deltoids." },
  { name: "Push Press", category: "shoulders", equipment: "Barbell", difficulty: "Advanced", description: "Overhead press with leg drive for explosive power." },
  { name: "Landmine Press", category: "shoulders", equipment: "Barbell", difficulty: "Intermediate", description: "Angled press using a landmine attachment for shoulder safety." },
  { name: "Single-Arm Dumbbell Press", category: "shoulders", equipment: "Dumbbell", difficulty: "Intermediate" },
  { name: "Plate Front Raise", category: "shoulders", equipment: "Plate", difficulty: "Beginner" },
  { name: "Cable Lateral Raise", category: "shoulders", equipment: "Cable", difficulty: "Intermediate", description: "Cable-based lateral raise for constant tension." },
  { name: "Rear Delt Fly", category: "shoulders", equipment: "Machine", difficulty: "Beginner", description: "Machine-based rear delt isolation." },
  { name: "Face Pull", category: "shoulders", equipment: "Cable", difficulty: "Beginner", description: "Cable pull for rear delts and external rotation." },
  // ── Biceps (12) ──
  { name: "Barbell Curl", category: "biceps", equipment: "Barbell", difficulty: "Beginner", description: "Standard barbell curl for bicep mass." },
  { name: "Dumbbell Curl", category: "biceps", equipment: "Dumbbells", difficulty: "Beginner", description: "Alternating dumbbell curl for bicep development." },
  { name: "Hammer Curl", category: "biceps", equipment: "Dumbbells", difficulty: "Beginner", description: "Neutral-grip curl targeting brachialis and brachioradialis." },
  { name: "Incline Dumbbell Curl", category: "biceps", equipment: "Dumbbells", difficulty: "Intermediate", description: "Incline bench curl for stretched bicep contraction." },
  { name: "Preacher Curl", category: "biceps", equipment: "EZ Bar", difficulty: "Intermediate", description: "Isolated curl on a preacher bench to eliminate momentum." },
  { name: "Concentration Curl", category: "biceps", equipment: "Dumbbell", difficulty: "Beginner", description: "Seated single-arm curl for peak bicep contraction." },
  { name: "Cable Curl", category: "biceps", equipment: "Cable", difficulty: "Beginner", description: "Cable bicep curl for constant tension throughout the movement." },
  { name: "Spider Curl", category: "biceps", equipment: "EZ Bar", difficulty: "Intermediate", description: "Incline prone curl for maximum bicep isolation." },
  { name: "Reverse Curl", category: "biceps", equipment: "EZ Bar", difficulty: "Intermediate", description: "Overhand grip curl targeting brachioradialis and forearms." },
  { name: "Zottman Curl", category: "biceps", equipment: "Dumbbells", difficulty: "Intermediate", description: "Curl up with supination, lower with pronation for full arm." },
  { name: "EZ Bar Curl", category: "biceps", equipment: "EZ Bar", difficulty: "Beginner", description: "EZ bar curl for biceps with reduced wrist strain." },
  { name: "Cable Hammer Curl", category: "biceps", equipment: "Cable", difficulty: "Intermediate" },
  // ── Triceps (12) ──
  { name: "Tricep Pushdown", category: "triceps", equipment: "Cable", difficulty: "Beginner", description: "Straight-bar cable pushdown for tricep isolation." },
  { name: "Overhead Tricep Extension", category: "triceps", equipment: "Dumbbell", difficulty: "Intermediate", description: "Overhead extension targeting the long head of the tricep." },
  { name: "Skull Crusher", category: "triceps", equipment: "EZ Bar", difficulty: "Intermediate", description: "Lying tricep extension for all three tricep heads." },
  { name: "Close-Grip Bench Press", category: "triceps", equipment: "Barbell", difficulty: "Intermediate", description: "Narrow-grip bench press emphasizing tricep strength." },
  { name: "Diamond Push-up", category: "triceps", equipment: "Bodyweight", difficulty: "Intermediate", description: "Close-hand push-up for intense tricep activation." },
  { name: "Bench Dip", category: "triceps", equipment: "Bench", difficulty: "Beginner", description: "Bodyweight tricep dip using a bench or chair." },
  { name: "Tricep Kickback", category: "triceps", equipment: "Dumbbells", difficulty: "Beginner", description: "Bent-over dumbbell extension for tricep isolation." },
  { name: "French Press", category: "triceps", equipment: "Barbell", difficulty: "Intermediate", description: "Lying tricep extension with a barbell." },
  { name: "Rope Pushdown", category: "triceps", equipment: "Cable", difficulty: "Beginner", description: "Cable pushdown with rope attachment for full range of motion." },
  { name: "Single-Arm Tricep Extension", category: "triceps", equipment: "Cable", difficulty: "Beginner" },
  { name: "Bodyweight Tricep Extension", category: "triceps", equipment: "Bodyweight", difficulty: "Intermediate" },
  { name: "JM Press", category: "triceps", equipment: "Barbell", difficulty: "Advanced", description: "Hybrid of close-grip bench and skull crusher for tricep mass." },
  // ── Forearms (10) ──
  { name: "Wrist Curl", category: "forearms", equipment: "Barbell", difficulty: "Beginner", description: "Barbell wrist curl for forearm flexor development." },
  { name: "Reverse Wrist Curl", category: "forearms", equipment: "Barbell", difficulty: "Beginner", description: "Barbell wrist extension for forearm extensor development." },
  { name: "Pinch Grip Hold", category: "forearms", equipment: "Weight Plate", difficulty: "Intermediate", description: "Static hold of smooth plates between fingers and thumb for grip strength." },
  { name: "Dead Hang", category: "forearms", equipment: "Pull-up Bar", difficulty: "Beginner", description: "Passive hang for grip strength and shoulder health." },
  { name: "Plate Pinch", category: "forearms", equipment: "Plate", difficulty: "Intermediate", description: "Pinch grip hold using weight plates." },
  { name: "Wrist Roller", category: "forearms", equipment: "Cable", difficulty: "Intermediate", description: "Rolling weight up and down for comprehensive forearm work." },
  { name: "Finger Curl", category: "forearms", equipment: "Barbell", difficulty: "Intermediate", description: "Rolling barbell across fingers for deep forearm flexor work." },
  { name: "Towel Pull-up", category: "forearms", equipment: "Pull-up Bar", difficulty: "Advanced", description: "Pull-up using a towel draped over the bar for grip strength." },
  { name: "Kettlebell Farmers Carry", category: "forearms", equipment: "Kettlebell", difficulty: "Intermediate" },
  { name: "Coins Grip Hold", category: "forearms", equipment: "Plate", difficulty: "Intermediate", description: "Holding smooth plates together with fingertips." },
  // ── Core (14) ──
  { name: "Plank", category: "core", equipment: "Bodyweight", difficulty: "Beginner", description: "Isometric core hold for overall stability." },
  { name: "Side Plank", category: "core", equipment: "Bodyweight", difficulty: "Beginner", description: "Lateral core stability exercise." },
  { name: "Crunch", category: "core", equipment: "Bodyweight", difficulty: "Beginner", description: "Basic spinal flexion for rectus abdominis." },
  { name: "Bicycle Crunch", category: "core", equipment: "Bodyweight", difficulty: "Beginner", description: "Twisting crunch for oblique and rectus engagement." },
  { name: "Leg Raise", category: "core", equipment: "Bodyweight", difficulty: "Intermediate", description: "Lying leg raise for lower abdominal activation." },
  { name: "Hanging Leg Raise", category: "core", equipment: "Pull-up Bar", difficulty: "Advanced", description: "Hanging leg raise for comprehensive core strength." },
  { name: "Russian Twist", category: "core", equipment: "Bodyweight", difficulty: "Beginner", description: "Rotational core movement for oblique development." },
  { name: "Hollow Body Hold", category: "core", equipment: "Bodyweight", difficulty: "Beginner", description: "Isometric core hold lying on back with arms and legs extended." },
  { name: "Ab Roller", category: "core", equipment: "Ab Wheel", difficulty: "Intermediate", description: "Wheel rollout for deep core and anti-extension strength." },
  { name: "Pallof Press", category: "core", equipment: "Cable", difficulty: "Intermediate", description: "Anti-rotation press for core stability and obliques." },
  { name: "Dead Bug", category: "core", equipment: "Bodyweight", difficulty: "Beginner", description: "Anti-extension core exercise for spinal stability." },
  { name: "Toes to Bar", category: "core", equipment: "Pull-up Bar", difficulty: "Advanced", description: "Hanging toes-to-bar for full core flexion." },
  { name: "V-Up", category: "core", equipment: "Bodyweight", difficulty: "Intermediate", description: "Simultaneous leg and torso raise for rectus abdominis." },
  { name: "Dragon Flag", category: "core", equipment: "Bench", difficulty: "Advanced", description: "Advanced full-body core exercise popularized by Bruce Lee." },
  // ── Cardio (14) ──
  { name: "Running", category: "cardio", equipment: "Treadmill", difficulty: "Beginner", description: "Steady-state running for cardiovascular endurance." },
  { name: "Cycling", category: "cardio", equipment: "Stationary Bike", difficulty: "Beginner", description: "Low-impact cardio for leg endurance and heart health." },
  { name: "Rowing Machine", category: "cardio", equipment: "Rower", difficulty: "Beginner", description: "Full-body cardio on the rowing ergometer." },
  { name: "Burpee", category: "cardio", equipment: "Bodyweight", difficulty: "Intermediate", description: "Full-body explosive movement for high-intensity conditioning." },
  { name: "Mountain Climber", category: "cardio", equipment: "Bodyweight", difficulty: "Beginner", description: "Dynamic plank variation for cardio and core endurance." },
  { name: "Battle Ropes", category: "cardio", equipment: "Rope", difficulty: "Intermediate", description: "Heavy rope waves for upper body cardio and conditioning." },
  { name: "Assault Bike", category: "cardio", equipment: "Assault Bike", difficulty: "Intermediate", description: "Air-resistance bike for full-body HIIT conditioning." },
  { name: "Jumping Jack", category: "cardio", equipment: "Bodyweight", difficulty: "Beginner" },
  { name: "High Knees", category: "cardio", equipment: "Bodyweight", difficulty: "Beginner", description: "Explosive running in place for cardio and hip flexor work." },
  { name: "Star Jump", category: "cardio", equipment: "Bodyweight", difficulty: "Intermediate", description: "Full-body plyometric jump for power and cardio." },
  { name: "Ski Erg", category: "cardio", equipment: "Ski Erg", difficulty: "Intermediate", description: "Double-pole skiing motion for upper body cardio." },
  { name: "Stair Climber", category: "cardio", equipment: "Stair Machine", difficulty: "Beginner", description: "Continuous stair stepping for lower body cardio." },
  { name: "Elliptical Trainer", category: "cardio", equipment: "Elliptical", difficulty: "Beginner", description: "Low-impact full-body cardio machine." },
  { name: "Shuttle Run", category: "cardio", equipment: "Bodyweight", difficulty: "Intermediate", description: "Back-and-forth sprint drill for agility and conditioning." },
  // ── Mobility (12) ──
  { name: "Hip Flexor Stretch", category: "mobility", equipment: "Bodyweight", difficulty: "Beginner", description: "Kneeling stretch to open tight hip flexors." },
  { name: "World's Greatest Stretch", category: "mobility", equipment: "Bodyweight", difficulty: "Beginner", description: "Full-body mobility drill combining lunge, rotation, and hamstring stretch." },
  { name: "Cat-Cow Stretch", category: "mobility", equipment: "Bodyweight", difficulty: "Beginner", description: "Spinal mobility movement for warm-up and recovery." },
  { name: "Thoracic Spine Rotation", category: "mobility", equipment: "Bodyweight", difficulty: "Beginner", description: "Half-kneeling rotation for upper back mobility." },
  { name: "Pigeon Pose", category: "mobility", equipment: "Bodyweight", difficulty: "Beginner", description: "Deep external rotation stretch for the hips and glutes." },
  { name: "90/90 Stretch", category: "mobility", equipment: "Bodyweight", difficulty: "Intermediate", description: "Hip external and internal rotation mobility drill." },
  { name: "Ankle Mobility Drill", category: "mobility", equipment: "Bodyweight", difficulty: "Beginner", description: "Knee-over-toe ankle dorsiflexion mobilization." },
  { name: "Shoulder Dislocates", category: "mobility", equipment: "PVC Pipe", difficulty: "Intermediate", description: "Band or pipe pass-through for shoulder mobility." },
  { name: "Deep Squat Hold", category: "mobility", equipment: "Bodyweight", difficulty: "Beginner", description: "Resting in a deep squat to improve hip and ankle range of motion." },
  { name: "Lunge With Twist", category: "mobility", equipment: "Bodyweight", difficulty: "Beginner", description: "Forward lunge combined with thoracic rotation." },
  { name: "Leg Swings", category: "mobility", equipment: "Bodyweight", difficulty: "Beginner", description: "Dynamic forward and lateral leg swings for hip mobility." },
  { name: "Arm Circles", category: "mobility", equipment: "Bodyweight", difficulty: "Beginner", description: "Dynamic shoulder warm-up in forward and backward directions." },
  // ── Stretching (12) ──
  { name: "Hamstring Stretch", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Seated or standing forward fold for hamstring flexibility." },
  { name: "Quad Stretch", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Standing quad pull for front thigh flexibility." },
  { name: "Chest Stretch", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Doorway or standing pec stretch for chest openness." },
  { name: "Tricep Stretch", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Overhead arm bend for tricep and lat flexibility." },
  { name: "Shoulder Stretch", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Cross-body arm pull for rear delt flexibility." },
  { name: "Child's Pose", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Resting yoga pose for back and hip relaxation." },
  { name: "Cobra Stretch", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Prone back extension for spinal and abdominal stretch." },
  { name: "Seated Forward Fold", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Sitting forward bend for hamstring and lower back flexibility." },
  { name: "Butterfly Stretch", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Seated groin stretch with soles of feet together." },
  { name: "Figure-Four Stretch", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Lying or seated glute and piriformis stretch." },
  { name: "Neck Side Stretch", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Lateral neck tilt for sternocleidomastoid stretch." },
  { name: "Wrist Flexor Stretch", category: "stretching", equipment: "Bodyweight", difficulty: "Beginner", description: "Extended arm with palm up and fingers pulled back." },
  // ── Neck (10) ──
  { name: "Neck Flexion", category: "neck", equipment: "Bodyweight", difficulty: "Beginner", description: "Chin-to-chest movement for neck flexor strengthening." },
  { name: "Neck Extension", category: "neck", equipment: "Bodyweight", difficulty: "Beginner", description: "Looking upward for neck extensor strengthening." },
  { name: "Neck Lateral Flexion", category: "neck", equipment: "Bodyweight", difficulty: "Beginner", description: "Side-to-side neck tilt for lateral neck muscles." },
  { name: "Neck Rotation", category: "neck", equipment: "Bodyweight", difficulty: "Beginner", description: "Turning head side to side for rotational neck mobility." },
  { name: "Isometric Neck Hold", category: "neck", equipment: "Bodyweight", difficulty: "Beginner", description: "Hand-resisted neck presses for isometric strength." },
  { name: "Neck Strap Flexion", category: "neck", equipment: "Weight Plate", difficulty: "Intermediate", description: "Weighted neck flexion using a neck harness." },
  { name: "Neck Strap Extension", category: "neck", equipment: "Weight Plate", difficulty: "Intermediate", description: "Weighted neck extension using a neck harness." },
  { name: "Plate Loaded Neck Flexion", category: "neck", equipment: "Weight Plate", difficulty: "Intermediate", description: "Lying neck flexion with plate on forehead." },
  { name: "Lying Neck Extension", category: "neck", equipment: "Bodyweight", difficulty: "Beginner", description: "Prone neck lift for extensor endurance." },
  { name: "Side Lying Neck Raise", category: "neck", equipment: "Bodyweight", difficulty: "Beginner", description: "Side-lying lateral neck flexion against gravity." },
  // ── Full Body (14) ──
  { name: "Clean and Jerk", category: "full-body", equipment: "Barbell", difficulty: "Advanced", description: "Olympic weightlifting movement for explosive full-body power." },
  { name: "Snatch", category: "full-body", equipment: "Barbell", difficulty: "Advanced", description: "Overhead squat catch from the floor — peak explosive lift." },
  { name: "Squat Clean", category: "full-body", equipment: "Barbell", difficulty: "Advanced", description: "Clean variation receiving the bar in a full squat." },
  { name: "Thruster", category: "full-body", equipment: "Barbell", difficulty: "Intermediate", description: "Front squat to overhead press in one fluid movement." },
  { name: "Wall Ball", category: "full-body", equipment: "Medicine Ball", difficulty: "Intermediate", description: "Squat to overhead throw for full-body conditioning." },
  { name: "Dumbbell Snatch", category: "full-body", equipment: "Dumbbell", difficulty: "Intermediate", description: "Single-arm explosive pull from floor to overhead." },
  { name: "Turkish Get-Up", category: "full-body", equipment: "Kettlebell", difficulty: "Advanced", description: "Complex movement from floor to standing with a weight overhead." },
  { name: "Bear Crawl", category: "full-body", equipment: "Bodyweight", difficulty: "Intermediate", description: "Quadrupedal crawling for full-body coordination and endurance." },
  { name: "Power Clean", category: "full-body", equipment: "Barbell", difficulty: "Advanced", description: "Explosive pull from floor to front rack position for full-body power." },
  { name: "Kettlebell Swing", category: "full-body", equipment: "Kettlebell", difficulty: "Intermediate", description: "Hip-driven swing for posterior chain power and conditioning." },
  { name: "Medicine Ball Slam", category: "full-body", equipment: "Medicine Ball", difficulty: "Intermediate", description: "Overhead slam for explosive power and core engagement." },
  { name: "Farmer's Walk", category: "full-body", equipment: "Dumbbells", difficulty: "Intermediate", description: "Loaded carry for grip strength, core stability, and conditioning." },
  { name: "Sled Drag", category: "full-body", equipment: "Sled", difficulty: "Intermediate", description: "Dragging a weighted sled backward or forward for full-body conditioning." },
  { name: "Sled Push", category: "full-body", equipment: "Sled", difficulty: "Intermediate", description: "Pushing a weighted sled for explosive leg drive and conditioning." },
];

const categoryMuscles = {
  chest: ["Pectoralis Major", "Pectoralis Minor", "Anterior Deltoid"],
  back: ["Latissimus Dorsi", "Trapezius", "Rhomboids", "Erector Spinae"],
  legs: ["Quadriceps", "Hamstrings", "Gluteus Maximus", "Calves"],
  glutes: ["Gluteus Maximus", "Gluteus Medius", "Gluteus Minimus"],
  calves: ["Gastrocnemius", "Soleus"],
  shoulders: ["Deltoid (Anterior)", "Deltoid (Lateral)", "Deltoid (Posterior)", "Trapezius"],
  biceps: ["Biceps Brachii", "Brachialis", "Brachioradialis"],
  triceps: ["Triceps Brachii"],
  forearms: ["Brachioradialis", "Flexor Carpi", "Extensor Carpi"],
  core: ["Rectus Abdominis", "Transverse Abdominis", "Obliques", "Erector Spinae"],
  cardio: ["Heart", "Lungs", "Full Body"],
  mobility: ["Hip Flexors", "Thoracic Spine", "Ankles", "Shoulders"],
  stretching: ["Hamstrings", "Quadriceps", "Hip Flexors", "Chest", "Back"],
  neck: ["Sternocleidomastoid", "Scalenes", "Trapezius (Upper)"],
  "full-body": ["Full Body"],
};

const detailedExercises = {
  "Bench Press": {
    instructions: "1. Lie flat on a bench with feet on the floor.\n2. Grip the bar slightly wider than shoulder-width.\n3. Unrack the bar and lower it to your mid-chest.\n4. Press the bar back up until arms are fully extended.\n5. Repeat.",
    tips: "Keep your shoulder blades retracted throughout the movement. Avoid bouncing the bar off your chest.",
    commonMistakes: "Flaring elbows too wide. Bouncing the bar. Lifting your glutes off the bench.",
  },
  "Deadlift": {
    instructions: "1. Stand with feet hip-width apart, bar over midfoot.\n2. Hinge at hips and grip the bar.\n3. Keep your back straight and chest up.\n4. Drive through your heels and stand up with the bar.\n5. Lower under control.",
    tips: "Keep the bar close to your body throughout. Brace your core before every rep.",
    commonMistakes: "Rounding the lower back. Jerking the bar off the floor. Not using leg drive.",
  },
  "Barbell Back Squat": {
    instructions: "1. Position the bar on your upper back.\n2. Unrack and step back.\n3. Descend by bending knees and hips simultaneously.\n4. Go to at least parallel depth.\n5. Drive up through your midfoot.",
    tips: "Keep your chest up and knees tracking over toes. Maintain a neutral spine.",
    commonMistakes: "Letting knees cave in. Coming up on your toes. Not reaching depth.",
  },
  "Pull-up": {
    instructions: "1. Grip the bar with palms facing away, hands shoulder-width.\n2. Hang with arms fully extended.\n3. Pull yourself up until your chin clears the bar.\n4. Lower under control to full hang.\n5. Repeat.",
    tips: "Initiate the pull by driving your elbows down. Avoid kipping if strict form is the goal.",
    commonMistakes: "Not reaching full extension at the bottom. Using too much momentum.",
  },
};

function enrichExercise(ex) {
  const muscles = categoryMuscles[ex.category];
  const details = detailedExercises[ex.name];
  return {
    ...ex,
    primaryMuscles: muscles ? muscles.slice(0, 3) : null,
    secondaryMuscles: muscles && muscles.length > 3 ? muscles.slice(3) : null,
    instructions: details?.instructions || null,
    tips: details?.tips || null,
    commonMistakes: details?.commonMistakes || null,
  };
}

async function main() {
  console.log("=== La Traino Seed ===\n");

  // ---- Users ----
  console.log("Creating users...");
  const admin = await prisma.user.upsert({
    where: { email: SEED_EMAILS.admin },
    update: { password: ADMIN_HASH, isActive: true },
    create: { name: "Admin", email: SEED_EMAILS.admin, password: ADMIN_HASH, role: "ADMIN" },
  });
  console.log(`  Admin: ${admin.email}`);

  const trainer1 = await prisma.user.upsert({
    where: { email: SEED_EMAILS.trainer1 },
    update: { password: PASSWORD_HASH, isActive: true },
    create: { name: "Sarah Jenkins", email: SEED_EMAILS.trainer1, password: PASSWORD_HASH, role: "TRAINER" },
  });
  const trainer2 = await prisma.user.upsert({
    where: { email: SEED_EMAILS.trainer2 },
    update: { password: PASSWORD_HASH, isActive: true },
    create: { name: "Marcus Chen", email: SEED_EMAILS.trainer2, password: PASSWORD_HASH, role: "TRAINER" },
  });
  console.log(`  Trainer 1: ${trainer1.email} (${trainer1.name})`);
  console.log(`  Trainer 2: ${trainer2.email} (${trainer2.name})`);

  const allTraineeData = [...trainer1Trainees, ...trainer2Trainees];
  const traineeUsers = {};
  for (const t of allTraineeData) {
    const user = await prisma.user.upsert({
      where: { email: t.email },
      update: { password: PASSWORD_HASH, isActive: true },
      create: { name: t.name, email: t.email, password: PASSWORD_HASH, role: "TRAINEE" },
    });
    traineeUsers[t.email] = user;
  }
  console.log(`  ${allTraineeData.length} Trainees created`);

  // ---- Trainer Profiles ----
  console.log("\nCreating trainer profiles...");
  await prisma.trainerProfile.upsert({
    where: { userId: trainer1.id },
    update: { trainerCode: "TRNR01", bio: "Certified Strength and Conditioning Specialist", specialties: "Strength Training, Rehab" },
    create: { userId: trainer1.id, trainerCode: "TRNR01", bio: "Certified Strength and Conditioning Specialist", specialties: "Strength Training, Rehab" },
  });
  await prisma.trainerProfile.upsert({
    where: { userId: trainer2.id },
    update: { trainerCode: "TRNR02", bio: "Certified Personal Trainer and Nutrition Coach", specialties: "Weight Loss, Nutrition" },
    create: { userId: trainer2.id, trainerCode: "TRNR02", bio: "Certified Personal Trainer and Nutrition Coach", specialties: "Weight Loss, Nutrition" },
  });
  console.log("  TRNR01 — Sarah Jenkins");
  console.log("  TRNR02 — Marcus Chen");

  // ---- Trainee Profiles ----
  console.log("\nCreating trainee profiles...");
  for (const t of allTraineeData) {
    const user = traineeUsers[t.email];
    await prisma.traineeProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, fitnessGoal: "General Fitness" },
    });
  }
  console.log(`  ${allTraineeData.length} Trainee profiles created`);

  // ---- Preset Workouts (delete + recreate for idempotency) ----
  console.log("\nSeeding preset workouts...");
  for (const preset of presetData) {
    await prisma.presetWorkout.deleteMany({ where: { name: preset.name } });

    const created = await prisma.presetWorkout.create({
      data: {
        name: preset.name,
        description: preset.description,
        days: {
          create: preset.days.map((day) => ({
            dayNumber: day.dayNumber,
            name: day.name,
            exercises: { create: day.exercises },
          })),
        },
      },
    });
    console.log(`  ${created.name} (${preset.days.length} days)`);
  }

  // Fetch presets back for linking
  const beginnerPreset = await prisma.presetWorkout.findFirst({ where: { name: "Beginner Full Body" } });
  const pplPreset = await prisma.presetWorkout.findFirst({ where: { name: "Push-Pull-Legs" } });
  const weightLossPreset = await prisma.presetWorkout.findFirst({ where: { name: "Weight Loss" } });

  // ---- Select presets for some trainees ----
  console.log("\nSelecting presets for trainees...");
  const t1Emails = trainer1Trainees.map((t) => t.email);
  const t2Emails = trainer2Trainees.map((t) => t.email);

  await prisma.traineeProfile.update({
    where: { userId: traineeUsers[t1Emails[0]].id },
    data: { selectedPresetId: beginnerPreset.id },
  });
  await prisma.traineeProfile.update({
    where: { userId: traineeUsers[t1Emails[1]].id },
    data: { selectedPresetId: pplPreset.id },
  });
  await prisma.traineeProfile.update({
    where: { userId: traineeUsers[t2Emails[0]].id },
    data: { selectedPresetId: weightLossPreset.id },
  });
  await prisma.traineeProfile.update({
    where: { userId: traineeUsers[t2Emails[1]].id },
    data: { selectedPresetId: beginnerPreset.id },
  });
  console.log("  4 trainees assigned presets");

  // ---- Trainer Links ----
  console.log("\nCreating trainer links...");
  // Delete existing links for seed users
  await prisma.trainerLink.deleteMany({
    where: { traineeId: { in: allTraineeData.map((t) => traineeUsers[t.email].id) } },
  });

  for (const t of trainer1Trainees) {
    await prisma.trainerLink.create({
      data: { trainerId: trainer1.id, traineeId: traineeUsers[t.email].id },
    });
  }
  for (const t of trainer2Trainees) {
    await prisma.trainerLink.create({
      data: { trainerId: trainer2.id, traineeId: traineeUsers[t.email].id },
    });
  }
  console.log("  Trainer 1 → 3 trainees, Trainer 2 → 3 trainees");

  // ---- Clean up assigned workouts, diet plans, logs, feedback for seed users ----
  const allTraineeIds = allTraineeData.map((t) => traineeUsers[t.email].id);
  const allTrainerIds = [trainer1.id, trainer2.id];

  await prisma.assignedWorkout.deleteMany({ where: { traineeId: { in: allTraineeIds } } });
  await prisma.dietPlan.deleteMany({ where: { traineeId: { in: allTraineeIds } } });
  await prisma.workoutLog.deleteMany({ where: { traineeId: { in: allTraineeIds } } });
  await prisma.feedback.deleteMany({
    where: {
      trainerId: { in: allTrainerIds },
      traineeId: { in: allTraineeIds },
    },
  });

  // ---- Assigned Workouts (trainer → trainee for recent days) ----
  console.log("\nCreating assigned workouts...");
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for (let offset = 0; offset < 5; offset++) {
    const date = daysAgo(offset);
    const dayName = dayNames[date.getDay()];

    for (const t of trainer1Trainees) {
      await prisma.assignedWorkout.create({
        data: {
          trainerId: trainer1.id,
          traineeId: traineeUsers[t.email].id,
          day: date,
          name: dayName,
          exercises: ASSIGNED_EXERCISES,
        },
      });
    }
  }
  for (let offset = 0; offset < 3; offset++) {
    const date = daysAgo(offset);
    const dayName = dayNames[date.getDay()];

    for (const t of trainer2Trainees) {
      await prisma.assignedWorkout.create({
        data: {
          trainerId: trainer2.id,
          traineeId: traineeUsers[t.email].id,
          day: date,
          name: dayName,
          exercises: ASSIGNED_EXERCISES,
        },
      });
    }
  }
  console.log("  Assigned workouts created");

  // ---- Diet Plans ----
  console.log("\nCreating diet plans...");
  for (let offset = 0; offset < 7; offset++) {
    const date = daysAgo(offset);
    for (const t of trainer1Trainees) {
      await prisma.dietPlan.create({
        data: {
          trainerId: trainer1.id,
          traineeId: traineeUsers[t.email].id,
          day: date,
          meals: getMealsForDay(),
        },
      });
    }
  }
  for (let offset = 0; offset < 5; offset++) {
    const date = daysAgo(offset);
    for (const t of trainer2Trainees) {
      await prisma.dietPlan.create({
        data: {
          trainerId: trainer2.id,
          traineeId: traineeUsers[t.email].id,
          day: date,
          meals: getMealsForDay(),
        },
      });
    }
  }
  console.log("  Diet plans created");

  // ---- Workout Logs (mix completed/incomplete) ----
  console.log("\nCreating workout logs...");
  const allTraineeEmails = [...t1Emails, ...t2Emails];

  for (let offset = 0; offset < 14; offset++) {
    const date = daysAgo(offset);
    for (const email of allTraineeEmails) {
      const completed = offset % 3 !== 0;
      await prisma.workoutLog.create({
        data: {
          traineeId: traineeUsers[email].id,
          day: date,
          exercises: ASSIGNED_EXERCISES,
          completed,
          completedAt: completed ? new Date(date.getTime() + 3600000) : null,
        },
      });
    }
  }
  console.log("  14 days of workout logs (mix of completed/incomplete)");

  // ---- Weekly Feedback ----
  console.log("\nCreating weekly feedback...");
  const feedbackMessages = [
    "Excellent consistency this week. Keep focusing on form — your squats are looking solid.",
    "Good progress overall. Try to increase the intensity on your push exercises next week.",
    "Great dedication! I noticed improvement in your cardio endurance. Let's work on core strength next.",
    "You've been showing up consistently, which is fantastic. Let's focus on sleep and recovery this week.",
    "Impressive performance this week! Your bench press form has improved significantly.",
  ];

  for (let weekOffset = 0; weekOffset < 3; weekOffset++) {
    const weekStart = daysAgo(weekOffset * 7 + 7);

    // Trainer 1 → his 3 trainees
    for (const t of trainer1Trainees) {
      await prisma.feedback.upsert({
        where: {
          trainerId_traineeId_weekStart: {
            trainerId: trainer1.id,
            traineeId: traineeUsers[t.email].id,
            weekStart,
          },
        },
        update: { message: feedbackMessages[(weekOffset + trainer1Trainees.indexOf(t)) % feedbackMessages.length] },
        create: {
          trainerId: trainer1.id,
          traineeId: traineeUsers[t.email].id,
          weekStart,
          message: feedbackMessages[(weekOffset + trainer1Trainees.indexOf(t)) % feedbackMessages.length],
        },
      });
    }

    // Trainer 2 → his 3 trainees
    for (const t of trainer2Trainees) {
      await prisma.feedback.upsert({
        where: {
          trainerId_traineeId_weekStart: {
            trainerId: trainer2.id,
            traineeId: traineeUsers[t.email].id,
            weekStart,
          },
        },
        update: { message: feedbackMessages[(weekOffset + trainer2Trainees.indexOf(t) + 2) % feedbackMessages.length] },
        create: {
          trainerId: trainer2.id,
          traineeId: traineeUsers[t.email].id,
          weekStart,
          message: feedbackMessages[(weekOffset + trainer2Trainees.indexOf(t) + 2) % feedbackMessages.length],
        },
      });
    }
  }
  console.log("  3 weeks of feedback for each trainer-trainee pair");

  // ---- Global Workout Presets ----
  console.log("\nCreating global workout presets...");
  await prisma.globalWorkoutPreset.deleteMany();
  for (const preset of globalWorkoutPresets) {
    await prisma.globalWorkoutPreset.create({ data: preset });
  }
  console.log(`  ${globalWorkoutPresets.length} global workout presets created`);

  // ---- Exercise Library ----
  console.log("\nCreating exercise library...");
  await prisma.exercise.deleteMany();
  for (const ex of exerciseData) {
    await prisma.exercise.create({ data: enrichExercise(ex) });
  }
  console.log(`  ${exerciseData.length} individual exercises created`);

  console.log("\n=== Seed complete! ===");
  console.log("Admin:    admin@latraino.com / admin123");
  console.log("Trainer 1: sarah.jenkins@example.com / password123 (code: TRNR01)");
  console.log("Trainer 2: marcus.chen@example.com / password123 (code: TRNR02)");
  console.log("Trainees: 6 users with password123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
