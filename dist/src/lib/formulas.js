"use strict";
/**
 * Fitness calculation formulas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliteStandards = void 0;
exports.calculateEpley1RM = calculateEpley1RM;
exports.calculateBrzycki1RM = calculateBrzycki1RM;
exports.kgToLbs = kgToLbs;
exports.lbsToKg = lbsToKg;
exports.calculateWilksScore = calculateWilksScore;
exports.calculateDOTSScore = calculateDOTSScore;
exports.calculateVolume = calculateVolume;
exports.calculateStrengthRatio = calculateStrengthRatio;
exports.getStrengthLevel = getStrengthLevel;
// Epley formula for estimated 1RM
// weight * (1 + reps/30)
function calculateEpley1RM(weight, reps) {
    if (reps <= 0 || weight <= 0)
        return 0;
    if (reps === 1)
        return weight;
    return weight * (1 + reps / 30);
}
// Brzycki formula (alternative 1RM calculation)
// weight / (1.0278 - 0.0278 * reps)
function calculateBrzycki1RM(weight, reps) {
    if (reps <= 0 || weight <= 0)
        return 0;
    if (reps === 1)
        return weight;
    return weight / (1.0278 - 0.0278 * reps);
}
// Convert between kg and lbs
function kgToLbs(kg) {
    return kg * 2.20462;
}
function lbsToKg(lbs) {
    return lbs / 2.20462;
}
// Wilks coefficient calculation
// Used for comparing strength across different bodyweights
function calculateWilksScore(totalKg, bodyweightKg, isFemale = false) {
    if (bodyweightKg <= 0)
        return 0;
    const coeff = isFemale
        ? [
            -125.4255398,
            13.7121942,
            -0.0330725061,
            -0.00105040051,
            9.38773881428571e-06,
            -1.33355449036207e-08,
        ]
        : [
            -216.0475144,
            16.2606339,
            -0.002388645,
            -0.00113732,
            7.01863e-06,
            -1.291e-08,
        ];
    const x = bodyweightKg;
    const denominator = coeff[0] +
        coeff[1] * x +
        coeff[2] * x ** 2 +
        coeff[3] * x ** 3 +
        coeff[4] * x ** 4 +
        coeff[5] * x ** 5;
    if (denominator === 0)
        return 0;
    return (totalKg * 500) / denominator;
}
// DOTS score calculation (newer alternative to Wilks)
function calculateDOTSScore(totalKg, bodyweightKg, isFemale = false) {
    if (bodyweightKg <= 0)
        return 0;
    const coefficients = isFemale
        ? { a: -57.96, b: 13.518, c: -0.0028, d: 1.332e-05, e: -2.093e-08 }
        : { a: -307.75, b: 24.49, c: -0.1917, d: 7.631e-04, e: -1.058e-06 };
    const x = bodyweightKg;
    const denominator = coefficients.a +
        coefficients.b * x +
        coefficients.c * x ** 2 +
        coefficients.d * x ** 3 +
        coefficients.e * x ** 4;
    if (denominator === 0)
        return 0;
    return (totalKg * 500) / denominator;
}
// Calculate volume (weight * reps * sets)
function calculateVolume(weight, reps, sets) {
    return weight * reps * sets;
}
// Calculate strength ratio
function calculateStrengthRatio(liftWeight, bodyweight) {
    if (bodyweight <= 0)
        return 0;
    return liftWeight / bodyweight;
}
// Elite standards (approximate, based on powerlifting classifications)
exports.eliteStandards = {
    squat: { beginner: 1.0, intermediate: 1.5, advanced: 2.0, elite: 2.5 },
    bench: { beginner: 0.75, intermediate: 1.25, advanced: 1.75, elite: 2.25 },
    deadlift: { beginner: 1.25, intermediate: 2.0, advanced: 2.5, elite: 3.5 },
    ohp: { beginner: 0.4, intermediate: 0.6, advanced: 0.75, elite: 1.0 },
    barbell_row: { beginner: 0.5, intermediate: 0.8, advanced: 1.0, elite: 1.5 },
};
// Get normalized strength level (0-1 scale relative to elite)
function getStrengthLevel(lift, ratio) {
    const standards = exports.eliteStandards[lift];
    if (!standards)
        return 0;
    if (ratio < standards.beginner)
        return ratio / standards.beginner * 0.25;
    if (ratio < standards.intermediate)
        return 0.25 + ((ratio - standards.beginner) / (standards.intermediate - standards.beginner)) * 0.25;
    if (ratio < standards.advanced)
        return 0.5 + ((ratio - standards.intermediate) / (standards.advanced - standards.intermediate)) * 0.25;
    if (ratio < standards.elite)
        return 0.75 + ((ratio - standards.advanced) / (standards.elite - standards.advanced)) * 0.25;
    return Math.min(1, 1 + (ratio - standards.elite) * 0.1);
}
