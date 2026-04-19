"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const formulas_1 = require("./formulas");
(0, vitest_1.describe)("formulas", () => {
    (0, vitest_1.it)("calculates Epley 1RM", () => {
        (0, vitest_1.expect)((0, formulas_1.calculateEpley1RM)(100, 5)).toBeCloseTo(116.67, 2);
        (0, vitest_1.expect)((0, formulas_1.calculateEpley1RM)(100, 1)).toBe(100);
        (0, vitest_1.expect)((0, formulas_1.calculateEpley1RM)(0, 5)).toBe(0);
    });
    (0, vitest_1.it)("converts units accurately", () => {
        (0, vitest_1.expect)((0, formulas_1.kgToLbs)(100)).toBeCloseTo(220.462, 3);
        (0, vitest_1.expect)((0, formulas_1.lbsToKg)(220.462)).toBeCloseTo(100, 3);
    });
    (0, vitest_1.it)("calculates volume and strength ratio", () => {
        (0, vitest_1.expect)((0, formulas_1.calculateVolume)(100, 5, 3)).toBe(1500);
        (0, vitest_1.expect)((0, formulas_1.calculateStrengthRatio)(150, 75)).toBe(2);
        (0, vitest_1.expect)((0, formulas_1.calculateStrengthRatio)(100, 0)).toBe(0);
    });
});
