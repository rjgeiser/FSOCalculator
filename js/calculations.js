// calculations.js

import { formatCurrency, formatServiceDuration } from './utils.js';

// Calculate severance pay
export function calculateSeverance(fsGrade, fsStep, yearsService, age, post, annualLeaveBalance = 0, serviceDuration = null) {
    if (!fsGrade || !fsStep || !yearsService || !age || !post) {
        throw new Error('Missing required inputs for severance calculation');
    }

    const SALARY_TABLES = {
        // Example salary data (adjust with actual values)
        'FS-01': { base: 125133, steps: [125133, 128887, 132754, 136736, 140838] },
        'FS-02': { base: 101395, steps: [101395, 104427, 107570, 110797, 114121] }
    };

    if (!SALARY_TABLES[fsGrade]) {
        throw new Error(`Invalid grade: ${fsGrade}`);
    }

    const stepIndex = parseInt(fsStep) - 1;
    const baseSalary = SALARY_TABLES[fsGrade].steps[stepIndex];
    if (typeof baseSalary !== 'number') {
        throw new Error(`Invalid salary for grade ${fsGrade} step ${fsStep}`);
    }

    const monthlyPay = baseSalary / 12;
    const effectiveYearsService = serviceDuration ? serviceDuration.totalYears : yearsService;
    let severancePay = Math.min(monthlyPay * effectiveYearsService, baseSalary); // Cap at one year's salary

    const result = {
        baseSalary: formatCurrency(baseSalary),
        monthlyPay: formatCurrency(monthlyPay),
        severanceAmount: formatCurrency(severancePay),
        yearsOfService: effectiveYearsService,
        annualLeavePayout: formatCurrency((baseSalary / 2087) * annualLeaveBalance)
    };

    return result;
}

// Calculate retirement scenario
export function calculateRetirement(fsGrade, fsStep, yearsService, age, highThreeYears) {
    const highThreeAverage = highThreeYears.reduce((sum, salary) => sum + salary, 0) / 3;

    const annuityPercentage = Math.min(yearsService, 20) * 0.017 + Math.max(yearsService - 20, 0) * 0.01;
    const annualAnnuity = highThreeAverage * annuityPercentage;
    const monthlyAnnuity = annualAnnuity / 12;

    return {
        highThreeAverage: formatCurrency(highThreeAverage),
        annualAnnuity: formatCurrency(annualAnnuity),
        monthlyAnnuity: formatCurrency(monthlyAnnuity),
        yearsService: formatServiceDuration({ years: Math.floor(yearsService), months: Math.round((yearsService % 1) * 12) })
    };
}

// Calculate health insurance costs
export function calculateHealthInsurance(plan, coverageType, homeState) {
    const HEALTH_INSURANCE_RATES = {
        // Example health insurance rates (adjust with actual values)
        'Basic Plan': { self: 200, family: 500 },
        'Premium Plan': { self: 300, family: 800 }
    };

    if (!HEALTH_INSURANCE_RATES[plan] || !HEALTH_INSURANCE_RATES[plan][coverageType]) {
        throw new Error('Invalid plan or coverage type');
    }

    const premium = HEALTH_INSURANCE_RATES[plan][coverageType];
    return {
        premium: formatCurrency(premium),
        deductible: formatCurrency(premium * 0.1), // Example deductible calculation
        outOfPocketMax: formatCurrency(premium * 0.2) // Example out-of-pocket max calculation
    };
}
