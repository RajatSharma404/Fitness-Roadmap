"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExerciseDetail = getExerciseDetail;
exports.getAdaptiveGymProgression = getAdaptiveGymProgression;
exports.computeReadinessScore = computeReadinessScore;
exports.getProgressBasedAdjustment = getProgressBasedAdjustment;
exports.getEnhancedNodeStatus = getEnhancedNodeStatus;
exports.buildDailyMealTemplates = buildDailyMealTemplates;
exports.buildGroceryList = buildGroceryList;
exports.buildMealSwaps = buildMealSwaps;
exports.getDailyCoachMessage = getDailyCoachMessage;
const exerciseLibrary = {
    "Flat dumbbell press": {
        howTo: [
            "Set bench to flat and keep feet planted.",
            "Lower dumbbells to chest line with elbows 45 degrees.",
            "Press up while keeping shoulders packed.",
        ],
        commonMistakes: [
            "Flaring elbows too wide.",
            "Bouncing dumbbells at the bottom.",
            "Lifting hips off bench.",
        ],
        targetMuscles: ["Chest", "Front delts", "Triceps"],
        alternatives: ["Push-up", "Machine chest press"],
        demoTip: "Use a 2-second lowering phase for better chest activation.",
    },
    "Lat pulldown": {
        howTo: [
            "Grip bar slightly wider than shoulders.",
            "Lean back slightly and pull elbows to ribs.",
            "Control the bar up without shrugging.",
        ],
        commonMistakes: [
            "Pulling behind the neck.",
            "Using momentum and torso swing.",
            "Stopping short of full range.",
        ],
        targetMuscles: ["Lats", "Mid-back", "Biceps"],
        alternatives: ["Assisted pull-up", "Band pulldown"],
        demoTip: "Think chest up and drive elbows down, not hands down.",
    },
    "Goblet squat": {
        howTo: [
            "Hold dumbbell at chest and brace core.",
            "Sit between hips while keeping heels grounded.",
            "Stand up by driving through mid-foot.",
        ],
        commonMistakes: [
            "Knees collapsing inward.",
            "Rounding lower back.",
            "Heels lifting off floor.",
        ],
        targetMuscles: ["Quads", "Glutes", "Core"],
        alternatives: ["Bodyweight squat", "Leg press"],
        demoTip: "Pause for one second at the bottom to improve control.",
    },
};
function fallbackDetail(name) {
    return {
        name,
        howTo: [
            "Set up with a stable posture and brace core.",
            "Move through full controlled range of motion.",
            "Keep tempo smooth and stop 1-2 reps before failure.",
        ],
        commonMistakes: [
            "Using too much momentum.",
            "Cutting range of motion.",
            "Ignoring breathing and bracing.",
        ],
        targetMuscles: ["Primary target", "Secondary stabilizers"],
        alternatives: ["Machine variation", "Bodyweight variation"],
        demoTip: "Record one set from side angle to check form weekly.",
    };
}
function getExerciseDetail(name) {
    const known = exerciseLibrary[name];
    if (!known)
        return fallbackDetail(name);
    return Object.assign({ name }, known);
}
function convertExerciseForEquipment(name, equipment) {
    var _a;
    if (equipment === "gym")
        return name;
    const homeMap = {
        "Lat pulldown": "Resistance-band lat pulldown",
        "Seated cable row": "Resistance-band seated row",
        "Machine chest press": "Deficit push-up",
        "Cable triceps pushdown": "Band triceps pushdown",
        "Leg press": "Heel-elevated goblet squat",
        "Lying leg curl": "Swiss-ball hamstring curl",
        "Face pull": "Band face pull",
        "Cable crunch": "Dead bug crunch",
        "Weighted pull-up": "Band-assisted pull-up",
        "T-bar row": "Two-dumbbell bent-over row",
        "Hack squat": "Tempo split squat",
        "Rope pushdown": "Band pushdown",
    };
    return (_a = homeMap[name]) !== null && _a !== void 0 ? _a : name;
}
function byExperienceOrder(level) {
    if (level === "advanced")
        return ["Advanced", "Intermediate", "Beginner"];
    if (level === "intermediate")
        return ["Intermediate", "Beginner", "Advanced"];
    return ["Beginner", "Intermediate", "Advanced"];
}
function getAdaptiveGymProgression(basePhases, experience, workoutDays, equipment) {
    const ordered = byExperienceOrder(experience)
        .map((level) => basePhases.find((phase) => phase.level === level))
        .filter((phase) => Boolean(phase));
    const cappedDays = Math.max(3, Math.min(6, workoutDays));
    return ordered.map((phase, phaseIndex) => {
        const dayCount = Math.max(3, Math.min(cappedDays + (phaseIndex === 0 ? 0 : 1), 6));
        const days = phase.days.slice(0, dayCount).map((day) => (Object.assign(Object.assign({}, day), { exercises: day.exercises.map((exercise) => convertExerciseForEquipment(exercise, equipment)) })));
        return Object.assign(Object.assign({}, phase), { weeklySplit: `${dayCount} training days + ${7 - dayCount} recovery days (${equipment})`, days });
    });
}
function computeReadinessScore(checkin) {
    const sleepScore = Math.max(0, Math.min(100, (checkin.sleepHours / 9) * 100));
    const stepsScore = Math.max(0, Math.min(100, (checkin.stepsAvg / 10000) * 100));
    const stressScore = Math.max(0, Math.min(100, 100 - checkin.stress * 10));
    const energyScore = Math.max(0, Math.min(100, checkin.energy * 10));
    const completionScore = Math.max(0, Math.min(100, checkin.workoutCompletion));
    const weighted = sleepScore * 0.2 +
        stepsScore * 0.2 +
        stressScore * 0.15 +
        energyScore * 0.2 +
        completionScore * 0.25;
    return Math.round(weighted);
}
function getProgressBasedAdjustment(input, checkins) {
    if (checkins.length < 2) {
        return {
            calorieDelta: 0,
            stepsDelta: 0,
            cardioMinutesDelta: 0,
            note: "Need at least two check-ins before auto-adjustments activate.",
        };
    }
    const latest = checkins[checkins.length - 1];
    const previous = checkins[checkins.length - 2];
    const weightDiff = latest.weightKg - previous.weightKg;
    const readiness = computeReadinessScore(latest);
    if ((input.goal === "fat_loss" || input.goal === "weight_loss") &&
        weightDiff >= -0.1) {
        return {
            calorieDelta: -140,
            stepsDelta: 1500,
            cardioMinutesDelta: 20,
            note: "Fat-loss trend stalled: reduce 140 kcal, add 1500 steps, and 20 min cardio weekly.",
        };
    }
    if (input.goal === "muscle_gain" && weightDiff <= 0.05) {
        return {
            calorieDelta: 120,
            stepsDelta: 0,
            cardioMinutesDelta: 0,
            note: "Muscle-gain trend is too slow: add 120 kcal/day and keep strength progression.",
        };
    }
    if (readiness < 55) {
        return {
            calorieDelta: 0,
            stepsDelta: -500,
            cardioMinutesDelta: -10,
            note: "Readiness is low: hold calories and reduce training fatigue this week.",
        };
    }
    return {
        calorieDelta: 0,
        stepsDelta: 500,
        cardioMinutesDelta: 5,
        note: "Progress is on track: keep nutrition steady and push slight activity progression.",
    };
}
function getEnhancedNodeStatus(node, manualProgress, checkins) {
    if (manualProgress[node.id])
        return "completed";
    const dependenciesUnlocked = node.dependencies.every((dependency) => manualProgress[dependency]);
    if (!dependenciesUnlocked)
        return "locked";
    if (node.level >= 4) {
        const latest = checkins[checkins.length - 1];
        if (!latest)
            return "locked";
        const readiness = computeReadinessScore(latest);
        if (readiness < 60 || latest.workoutCompletion < 70)
            return "locked";
    }
    return "active";
}
function pickMeal(options, minProtein) {
    var _a;
    const sorted = [...options].sort((a, b) => b.proteinG - a.proteinG);
    return (_a = sorted.find((item) => item.proteinG >= minProtein)) !== null && _a !== void 0 ? _a : sorted[0];
}
function buildDailyMealTemplates(targetCalories, macros, diet, mealOptions) {
    const allowed = diet === "mixed"
        ? mealOptions
        : mealOptions.filter((meal) => meal.category === diet);
    const breakfast = pickMeal(allowed, 25);
    const lunch = pickMeal(allowed, 35);
    const dinner = pickMeal(allowed, 30);
    const snack = pickMeal(allowed, 20);
    const cutTemplate = {
        name: "Cut Template",
        calories: Math.max(1300, targetCalories - 120),
        proteinG: Math.round(macros.proteinG),
        carbsG: Math.round(macros.carbsG * 0.9),
        fatsG: Math.round(macros.fatsG * 0.95),
        meals: [
            {
                slot: "Breakfast",
                mealName: breakfast.name,
                calories: breakfast.calories,
                proteinG: breakfast.proteinG,
            },
            {
                slot: "Lunch",
                mealName: lunch.name,
                calories: lunch.calories,
                proteinG: lunch.proteinG,
            },
            {
                slot: "Dinner",
                mealName: dinner.name,
                calories: dinner.calories,
                proteinG: dinner.proteinG,
            },
            {
                slot: "Snack",
                mealName: snack.name,
                calories: snack.calories,
                proteinG: snack.proteinG,
            },
        ],
    };
    const balanceTemplate = {
        name: "Balance Template",
        calories: targetCalories,
        proteinG: macros.proteinG,
        carbsG: macros.carbsG,
        fatsG: macros.fatsG,
        meals: cutTemplate.meals,
    };
    const performanceTemplate = {
        name: "Performance Template",
        calories: targetCalories + 120,
        proteinG: Math.round(macros.proteinG * 1.02),
        carbsG: Math.round(macros.carbsG * 1.1),
        fatsG: macros.fatsG,
        meals: cutTemplate.meals,
    };
    return [cutTemplate, balanceTemplate, performanceTemplate];
}
function buildGroceryList(templates) {
    const names = templates.flatMap((template) => template.meals.map((meal) => meal.mealName.toLowerCase()));
    const has = (needle) => names.some((name) => name.includes(needle));
    const list = [
        { item: "Eggs / Egg whites", qty: "18 pcs", category: "protein" },
        { item: "Chicken / Paneer / Tofu", qty: "1.5-2 kg", category: "protein" },
        { item: "Greek yogurt", qty: "7 cups", category: "protein" },
        { item: "Rice / Quinoa / Millet", qty: "2-3 kg", category: "carb" },
        { item: "Oats", qty: "1 kg", category: "carb" },
        { item: "Olive oil / Ghee", qty: "500 ml", category: "fat" },
        { item: "Mixed vegetables", qty: "3-4 kg", category: "produce" },
        { item: "Berries / seasonal fruits", qty: "2 kg", category: "produce" },
    ];
    if (has("fish")) {
        list.push({ item: "Fish", qty: "1-1.5 kg", category: "protein" });
    }
    return list;
}
function buildMealSwaps(meals) {
    if (meals.length < 2)
        return [];
    const sortedByCalories = [...meals].sort((a, b) => a.calories - b.calories);
    const lower = sortedByCalories[0];
    const higher = sortedByCalories[sortedByCalories.length - 1];
    const sortedByProtein = [...meals].sort((a, b) => b.proteinG - a.proteinG);
    const proteinHigh = sortedByProtein[0];
    const proteinLow = sortedByProtein[sortedByProtein.length - 1];
    return [
        {
            from: higher.name,
            to: lower.name,
            kcalDelta: lower.calories - higher.calories,
            proteinDelta: lower.proteinG - higher.proteinG,
        },
        {
            from: proteinLow.name,
            to: proteinHigh.name,
            kcalDelta: proteinHigh.calories - proteinLow.calories,
            proteinDelta: proteinHigh.proteinG - proteinLow.proteinG,
        },
    ];
}
function getDailyCoachMessage(goal, readinessScore, adjustment) {
    if (readinessScore < 50) {
        return "Recovery-first day: keep technique clean, shorten session by 10 minutes, and hit hydration + sleep target.";
    }
    if (goal === "fat_loss" || goal === "weight_loss") {
        if (adjustment.calorieDelta < 0) {
            return "Scale is flat but not a failure. Tighten tracking today, hit steps, and execute the updated deficit.";
        }
        return "Momentum day: keep protein high, complete the full workout, and finish with a 15-minute incline walk.";
    }
    if (goal === "muscle_gain") {
        if (adjustment.calorieDelta > 0) {
            return "Growth phase is active. Add the extra calories around workout window and push load on first compound lift.";
        }
        return "Strong progression day: prioritize quality reps and add 1-2 reps or 2.5% load where form allows.";
    }
    return "Recomposition focus: train hard, keep nutrition precise, and track waist + strength together this week.";
}
