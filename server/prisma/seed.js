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
// Seed execution
// ---------------------------------------------------------------------------
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
