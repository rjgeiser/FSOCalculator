// Global form reference
let calculatorForm;

document.addEventListener('DOMContentLoaded', () => {
    calculatorForm = document.getElementById('calculator-form');
    if (!calculatorForm) {
        console.error('Calculator form not found');
        return;
    }
    
    // Initialize form handlers
    FormManager.init();
    
    // Add iOS-specific form handling
    if (calculatorForm) {
        calculatorForm.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.type === 'submit') {
                e.preventDefault();
            }
        }, { passive: false });
        
        calculatorForm.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.activeElement.blur();
            }
        });
    }
});

// Place this near the top of main.js or in a shared config area

// === Begin object labelMap ===
const labelMap = {
  immediate: 'Immediate',
  tera: 'TERA',
  vera: 'VERA',
  mraPlusTen: 'MRA+10',
  deferred: 'Deferred'
};

// Function to update step dropdown visibility based on grade

// --- Begin function updateStepDropdown ---
function updateStepDropdown(grade) {
    const fsStep = document.getElementById('fs-step');
    if (!fsStep) return;

    // Clear existing options
    fsStep.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Step/Rank';
    fsStep.appendChild(defaultOption);

    if (grade === 'SFS') {
        // Add Career Minister option
        const cmOption = document.createElement('option');
        cmOption.value = SFS_RANKS['Career Minister'].step;
        cmOption.textContent = 'Career Minister';
        fsStep.appendChild(cmOption);
        
        // Add Minister Counselor options
        SFS_RANKS['Minister Counselor'].steps.forEach(step => {
            const option = document.createElement('option');
            option.value = step;
            option.textContent = `Minister Counselor (Step ${step})`;
            fsStep.appendChild(option);
        });
        
        // Add Counselor options
        SFS_RANKS['Counselor'].steps.forEach(step => {
            const option = document.createElement('option');
            option.value = step;
            option.textContent = `Counselor (Step ${step})`;
            fsStep.appendChild(option);
        });
    } else if (grade) {
        // Regular FS grades steps
        for (let i = 1; i <= 14; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Step ${i}`;
            fsStep.appendChild(option);
        }
    }

    // Force redraw for iOS
    fsStep.style.display = 'none';
    fsStep.offsetHeight;
    fsStep.style.display = '';
}

// --- Begin function calculateSickLeaveServiceDuration ---
function calculateSickLeaveServiceDuration(sickLeaveHours) {
    if (!sickLeaveHours || sickLeaveHours <= 0) {
        return null;
    }
    
    // Convert sick leave hours to days (2087 hours = 1 year)
    const totalDays = Math.floor((sickLeaveHours / 2087) * 365.25);
    
    // Calculate years, months, and days
    const years = Math.floor(totalDays / 365.25);
    let remainingDays = totalDays - (years * 365.25);
    const months = Math.floor(remainingDays / 30.44); // Average days per month
    remainingDays = Math.floor(remainingDays - (months * 30.44));
    
    console.log('Sick leave service duration calculated:', {
        sickLeaveHours,
        totalDays,
        years,
        months,
        days: remainingDays
    });
    
        return {
        years,
        months,
        days: remainingDays,
        totalYears: totalDays / 365.25
    };
}


// --- Begin function calculateServiceDuration ---
function calculateServiceDuration(serviceComputationDate) {
    if (!serviceComputationDate) {
        console.log('No SCD provided, returning null');
        return null;
    }
    
    const today = new Date();
    const startDate = new Date(serviceComputationDate);
    
    // Calculate total days between dates
    const diffTime = Math.abs(today - startDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate years, months, and days
    const years = Math.floor(diffDays / 365.25); // Using 365.25 to account for leap years
    let remainingDays = diffDays - (years * 365.25);
    const months = Math.floor(remainingDays / 30.44); // Average days per month
    remainingDays = Math.floor(remainingDays - (months * 30.44));
    
    const totalYears = diffDays / 365.25;
    
    console.log('Service duration calculated:', {
        years,
        months,
        days: remainingDays,
        totalDays: diffDays,
        totalYears: totalYears.toFixed(4)
    });
    
    return {
        years,
        months,
        days: remainingDays,
        totalDays: diffDays,
        totalYears
    };
}

// Career Progression Model Constants

// === Begin object CAREER_PROGRESSION ===
const CAREER_PROGRESSION = {
    'FS-04': {
        baseStep: 66574,
        stepIncrement: 2000,
        maxStep: 14,
        avgTimeInGrade: 2
    },
    'FS-03': {
        baseStep: 82160,
        stepIncrement: 2500,
        maxStep: 14,
        avgTimeInGrade: 3
    },
    'FS-02': {
        baseStep: 101395,
        stepIncrement: 3500,
        maxStep: 14,
        avgTimeInGrade: 4
    },
    'FS-01': {
        baseStep: 125133,
        stepIncrement: 4000,
        maxStep: 14,
        avgTimeInGrade: 5
    },
    'SFS': {
        baseStep: 172500,
        stepIncrement: 2500,
        maxStep: 14,
        avgTimeInGrade: null  // No automatic progression
    }
};

// Function to simulate career progression and calculate average salary

// --- Begin function simulateCareerProgression ---
function simulateCareerProgression(currentGrade, currentStep, yearsService) {
    // Start from FS-04 Step 1 and simulate progression
    const grades = ['FS-04', 'FS-03', 'FS-02', 'FS-01', 'SFS'];
    let totalEarnings = 0;
    let yearsInService = 0;
    let currentGradeIndex = grades.indexOf(currentGrade);
    
    // If current grade is not found, default to FS-04
    if (currentGradeIndex === -1) {
        currentGradeIndex = 0;
    }

    // Calculate average time to reach current position
    let expectedYearsToPosition = 0;
    for (let i = 0; i < currentGradeIndex; i++) {
        expectedYearsToPosition += CAREER_PROGRESSION[grades[i]].avgTimeInGrade;
    }

    // Adjust progression rate if actual years of service differs from expected
    const progressionRate = expectedYearsToPosition > 0 ? 
        Math.min(yearsService / expectedYearsToPosition, 2) : 1;

    // Simulate year-by-year progression
    let simulatedYears = Math.min(yearsService, 40); // Cap at 40 years
    let currentSimStep = 1;
    let currentSimGrade = 'FS-04';
    
    for (let year = 0; year < simulatedYears; year++) {
        // Calculate salary for this year
        const gradeInfo = CAREER_PROGRESSION[currentSimGrade];
        const yearSalary = gradeInfo.baseStep + (currentSimStep - 1) * gradeInfo.stepIncrement;
        totalEarnings += yearSalary;
        yearsInService++;

        // Progress step
        currentSimStep++;
        
        // Check for promotion
        if (currentSimStep > gradeInfo.maxStep && currentSimGrade !== 'SFS') {
            const nextGradeIndex = grades.indexOf(currentSimGrade) + 1;
            if (nextGradeIndex < grades.length) {
                currentSimGrade = grades[nextGradeIndex];
                currentSimStep = 1;
            }
        }
    }

    // Calculate average annual salary
    const averageAnnualSalary = totalEarnings / yearsInService;
    
    return {
        averageAnnualSalary,
        yearsInService,
        finalGrade: currentGrade,
        finalStep: currentStep
    };
}

// Calculate enhanced supplemental annuity based on career progression

// --- Begin function calculateEnhancedSupplemental ---
function calculateEnhancedSupplemental(currentGrade, currentStep, yearsService, age) {
    console.log('Starting SRS calculation with:', {
        currentGrade,
        currentStep,
        yearsService,
        age
    });

    // Only calculate if eligible (under 62)
    if (age >= 62) {
        console.log('Not eligible for SRS: Age 62 or older');
        return 0;
    }

    // Get base salary without locality pay for conservative estimate
    const gradeInfo = CAREER_PROGRESSION[currentGrade];
    if (!gradeInfo) {
        console.warn('Grade not found in career progression:', currentGrade);
        return 0;
    }

    // Use base salary without locality pay for career simulation
    const currentBaseSalary = gradeInfo.baseStep + (currentStep - 1) * gradeInfo.stepIncrement;
    console.log('Current base salary:', currentBaseSalary);
    
    // Simulate career progression using base pay only
    const careerSimulation = simulateCareerProgression(currentGrade, currentStep, yearsService);
    console.log('Career simulation result:', careerSimulation);
    
    // Calculate average indexed earnings (using base pay only, no locality)
    const averageIndexedEarnings = careerSimulation.averageAnnualSalary;
    console.log('Average indexed earnings:', averageIndexedEarnings);
    
    // Calculate supplemental percentage (similar to Social Security formula)
    // Use 40% of average indexed earnings as base, adjusted by years of service
    const supplementalPercentage = Math.min(yearsService / 30, 1); // Cap at 30 years
    const supplementalBase = averageIndexedEarnings * 0.40; // 40% of average earnings
    
    // Apply service time adjustment
    const annualSupplemental = supplementalBase * supplementalPercentage;
    console.log('Annual supplemental before cap:', annualSupplemental);
    
    // Monthly amount
    const monthlySupplemental = annualSupplemental / 12;
    
    // Cap at maximum Social Security benefit
    const maxMonthlyBenefit = 3627; // 2024 maximum Social Security benefit
    const finalMonthlyBenefit = Math.min(monthlySupplemental, maxMonthlyBenefit);
    
    console.log('Final SRS calculation:', {
        supplementalPercentage,
        supplementalBase,
        annualSupplemental,
        monthlySupplemental,
        finalMonthlyBenefit,
        maxMonthlyBenefit,
        isCapped: monthlySupplemental > maxMonthlyBenefit
    });
    
    return finalMonthlyBenefit;
}

// Calculate retirement scenario

// --- Begin function calculateScenario ---
function calculateScenario(highThreeAverage, yearsService, currentAge, type, isInvoluntarySeparation = false, teraEligible = false, teraYearsRequired = 10, teraAgeRequired = 43, sickLeaveServiceDuration = null, serviceDuration = null) {
    let annuityReductionFactor = 1; // default to 100% unless reduced
    let reductionNote = '';

    console.log('Starting scenario calculation:', {
        type,
        currentAge,
        yearsService,
        teraEligible
    });

    // Round years to nearest month
    function roundToMonths(years) {
        if (!years) return 0;
        const totalMonths = Math.round(years * 12);
        return totalMonths / 12;
    }

    // Use serviceDuration if available, otherwise use yearsService
    let effectiveYearsService = roundToMonths(yearsService);

    // Add service duration if provided
    if (serviceDuration && serviceDuration.totalYears) {
        effectiveYearsService = roundToMonths(serviceDuration.totalYears);
    }

    // Only add sick leave service for immediate retirement and TERA
    if ((type === "immediate" || type === "tera") && sickLeaveServiceDuration && sickLeaveServiceDuration.totalYears) {
        effectiveYearsService += roundToMonths(sickLeaveServiceDuration.totalYears);
    }

    let annuityPercentage = 0;
    let description = '';
    let isEligible = false;
    let mraReduction = 0;
    let age62Comparison = null;

    //Calculate MRA age with a years and months value and a maximum of 57
    function formatMRA(decimalAge) {
        const capped = Math.min(decimalAge, 57); // FSPS max
        const years = Math.floor(capped);
        const months = Math.round((capped - years) * 12);
        return `${years} years${months > 0 ? `, ${months} months` : ""}`;
    }  
    
    // Get MRA for the employee's age
    const mraAgeRaw = getMRA(currentAge);
    const mraAge = Math.min(mraAgeRaw, 57); // cap per FSPS
    const mraDisplay = formatMRA(mraAgeRaw); // use raw for display, but capped for logic

    // Get current grade
    const fsGrade = document.getElementById('fs-grade').value;
    const isSeniorGrade = fsGrade === 'FS-01' || fsGrade === 'SFS';

    // Check eligibility and set appropriate values based on retirement type
    if (type === "immediate") {
        if (isSeniorGrade && effectiveYearsService >= 5) {
            // FS-01 and SFS are always eligible for immediate retirement with 5 years service
            isEligible = true;
            description = "Immediate retirement (Senior Grade)";
        } else if (currentAge >= 62 && effectiveYearsService >= 5) {
            isEligible = true;
            description = "Immediate retirement (age 62 with 5 years)";
        } else if ((currentAge >= 50 && effectiveYearsService >= 20) || (isInvoluntarySeparation && currentAge >= 50 && effectiveYearsService >= 20)) {
            isEligible = true;
            description = isInvoluntarySeparation ? 
                "Immediate retirement (involuntary, age 50 with 20 years)" :
                "Immediate retirement (age 50 with 20 years)";
        } else if (effectiveYearsService >= 25) {
            isEligible = true;
            description = "Immediate retirement (25 years any age)";
        }
    } else if (type === "tera" && teraEligible && effectiveYearsService >= teraYearsRequired) {
        isEligible = true;
        description = `TERA retirement (${teraYearsRequired}+ years of service)`;
    
        // Calculate annuity percentage using FSPS formula
        const firstTwentyYears = Math.min(20, effectiveYearsService) * 0.017;
        const yearsOver20 = Math.max(0, effectiveYearsService - 20) * 0.01;
        annuityPercentage = firstTwentyYears + yearsOver20;
    
        // Apply TERA reduction: 1/12 of 1% per month under 20 years
        const monthsUnder20 = Math.max(0, (20 - effectiveYearsService) * 12);
        const reductionFactor = 1 - (monthsUnder20 * (1 / 12) * 0.01); // = 0.95 for 15 years
        annuityReductionFactor = Math.max(0, reductionFactor); // Prevent negative reduction
    
        const reduction = (100 - reductionFactor * 100).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
reductionNote = `Annuity reduced by ${reduction}% for service under 20 years (TERA reduction - 1/12 of 1% per month)`;
    } else if (type === "vera" && teraEligible) {
        const veraAgeThreshold = parseInt(teraAgeRequired) || 43;
        const veraYearsThreshold = parseInt(teraYearsRequired) || 15;
        
        if (currentAge >= veraAgeThreshold && effectiveYearsService >= veraYearsThreshold) {
            isEligible = true;
            description = `VERA retirement (age ${veraAgeThreshold}+ with ${veraYearsThreshold}+ years)`;
        }
    } else if (type === "mra+10") {
        if (effectiveYearsService >= 10) {
            isEligible = true;
            description = "MRA+10 retirement";
            
            if (currentAge < mraAge) {
                // Not yet eligible to collect, show future scenarios
                description = `MRA+10 retirement (eligible to begin at age ${mraDisplay})`;
                // Calculate reduction if starting at MRA
                const yearsUnder62FromMRA = 62 - mraAge;
                mraReduction = 0.05 * yearsUnder62FromMRA;
                
                // Create comparison for waiting until 62
                age62Comparison = {
                    age: 62,
                    description: "MRA+10 (if waiting until age 62)",
                    annuityPercentage: effectiveYearsService * 0.01,
                    mraReduction: 0,
                    monthlyAnnuity: (highThreeAverage * effectiveYearsService * 0.01) / 12,
                    annualAnnuity: highThreeAverage * effectiveYearsService * 0.01,
                    yearsToWait: 62 - currentAge
                };
            } else if (currentAge >= mraAge && currentAge < 62) {
                // Currently eligible but under 62
                const yearsUnder62 = 62 - currentAge;
                mraReduction = 0.05 * yearsUnder62;
                description += ` with ${(mraReduction * 100).toFixed(1)}% reduction`;
                
                // Create comparison for waiting until 62
                age62Comparison = {
                    age: 62,
                    description: "MRA+10 (if waiting until age 62)",
                    annuityPercentage: effectiveYearsService * 0.01,
                    mraReduction: 0,
                    monthlyAnnuity: (highThreeAverage * effectiveYearsService * 0.01) / 12,
                    annualAnnuity: highThreeAverage * effectiveYearsService * 0.01,
                    yearsToWait: 62 - currentAge
                };
            }
        }
    } else if (type === "deferred" && effectiveYearsService >= 5) {
        isEligible = true;
        description = "Deferred retirement (payable at 62)";
    }

    // Add sick leave description only for immediate and TERA retirement
    let sickLeaveDescription = '';
    if (isEligible && (type === "immediate" || type === "tera") && sickLeaveServiceDuration && sickLeaveServiceDuration.totalYears > 0) {
        sickLeaveDescription = ` (including ${sickLeaveServiceDuration.years} years, ${sickLeaveServiceDuration.months} months, ${sickLeaveServiceDuration.days} days of sick leave)`;
        description += sickLeaveDescription;
    }

    // Calculate base annuity percentage
    if (isEligible) {
        if (type === "mra+10" || (type === "deferred" && currentAge < 65)) {
            // For MRA+10 and deferred retirement before 65: Always use 1% per year
            annuityPercentage = effectiveYearsService * 0.01;
        } else {
            // For all other types and deferred at 65+: 1.7% for first 20 years, 1% for remaining years
            const firstTwentyYears = Math.min(20, effectiveYearsService) * 0.017;
            const yearsOver20 = Math.max(0, effectiveYearsService - 20) * 0.01;
            annuityPercentage = firstTwentyYears + yearsOver20;
        }
    }

    // Calculate annual and monthly amounts
    const baseAnnuity = highThreeAverage * annuityPercentage;
    const reductionMultiplier = (type === 'tera')
        ? annuityReductionFactor
        : (1 - mraReduction);
    
    const finalAnnuity = baseAnnuity * reductionMultiplier;
    const monthlyAnnuity = finalAnnuity / 12;

    // Calculate supplement if eligible
    const isEligibleForSupplement = isEligible && 
        (type === "tera" ? 
            // For TERA, only check TERA requirements and age < 62
            (currentAge >= teraAgeRequired && 
            effectiveYearsService >= teraYearsRequired && 
            currentAge < 62) :
            // For other types, check standard requirements
            ((currentAge >= 50 && effectiveYearsService >= 20) || 
            effectiveYearsService >= 25) && 
            currentAge < 62) &&
        (type === "immediate" || type === "tera"); // Only for immediate and TERA retirement

    console.log('SRS Eligibility Check:', {
        isEligible,
        currentAge,
        effectiveYearsService,
        type,
        teraEligible: type === "tera",
        teraRequirements: {
            meetsAge: currentAge >= teraAgeRequired,
            meetsService: effectiveYearsService >= teraYearsRequired,
            under62: currentAge < 62
        },
        standardRequirements: {
            meets50_20: currentAge >= 50 && effectiveYearsService >= 20,
            meets25: effectiveYearsService >= 25,
            under62: currentAge < 62
        },
        isEligibleForSupplement,
        validType: type === "immediate" || type === "tera"
    });

    let supplementalAnnuity = 0;
    let monthlySupplemental = 0;
    if (isEligibleForSupplement) {
        // Get current grade and step from form
        const currentGrade = document.getElementById('fs-grade').value;
        const currentStep = parseInt(document.getElementById('fs-step').value);
        
        console.log('Calculating SRS with:', {
            currentGrade,
            currentStep,
            effectiveYearsService,
            currentAge,
            type,
            teraRequirements: {
                ageRequired: teraAgeRequired,
                yearsRequired: teraYearsRequired
            }
        });
        
        monthlySupplemental = calculateEnhancedSupplemental(
            currentGrade,
            currentStep,
            effectiveYearsService,
            currentAge
        );
        supplementalAnnuity = monthlySupplemental * 12;

        console.log('SRS Calculation Results:', {
            monthlySupplemental,
            supplementalAnnuity
        });
    }

    const result = {
        isEligible,
        annualAnnuity: finalAnnuity || 0,
        monthlyAnnuity: monthlyAnnuity || 0,
        description,
        supplementalAnnuity: supplementalAnnuity || 0,
        monthlySupplemental: monthlySupplemental || 0,
        mraDisplay,
        mraReduction,
        totalServiceYears: effectiveYearsService,
        sickLeaveServiceDuration: sickLeaveServiceDuration || null,
        serviceDuration: serviceDuration || null,
        age62Comparison,
        isEligibleForSupplement
    };

    console.log('Final scenario result:', result);
    return result;
}

// Core utility functions

// === Begin object Utils ===
const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {

// === Begin object later ===
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    memoize(fn) {
        const cache = new Map();
        return (...args) => {
            const key = JSON.stringify(args);
            if (cache.has(key)) return cache.get(key);
            const result = fn.apply(this, args);
            cache.set(key, result);
            return result;
        };
    },

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    validateNumber(value, min, max) {
        const num = parseFloat(value);
        if (isNaN(num)) return false;
        if (min !== undefined && num < min) return false;
        if (max !== undefined && num > max) return false;
        return true;
    }
};

// DOM Elements Cache

// === Begin object DOM ===
const DOM = {
    form: document.getElementById('calculator-form'),
    inputs: {
        fsGrade: document.getElementById('fs-grade'),
        fsStep: document.getElementById('fs-step'),
        yearsService: document.getElementById('years-service'),
        age: document.getElementById('age'),
        currentPost: document.getElementById('current-post'),
        currentPlan: document.getElementById('current-plan'),
        planOption: document.getElementById('plan-option'),
        coverageType: document.getElementById('coverage-type'),
        state: document.getElementById('state'),
        teraEligible: document.getElementById('tera-eligible'),
        teraYears: document.getElementById('tera-years'),
        teraAge: document.getElementById('tera-age'),
        salaryYears: [
            document.getElementById('salary-year-1'),
            document.getElementById('salary-year-2'),
            document.getElementById('salary-year-3')
        ]
    },
    results: {
        severance: document.getElementById('severance-results'),
        retirement: document.getElementById('retirement-results'),
        health: document.getElementById('health-results'),
        report: document.getElementById('lieftime-results')
    },
    loading: document.getElementById('loading'),
    error: document.getElementById('error'),
    uploadStatus: document.getElementById('upload-status'),
    ratesDate: document.getElementById('rates-date')
};

// Enhanced error handling
// Performance monitoring

// === Begin object PerformanceMonitor ===
const PerformanceMonitor = {
    marks: {},
    start: function(label) {
        this.marks[label] = performance.now();
    },
    end: function(label) {
        if (this.marks[label]) {
            const duration = performance.now() - this.marks[label];
            console.log(`Performance [${label}]: ${duration.toFixed(2)}ms`);
            delete this.marks[label];
            return duration;
        }
        return 0;
    }
};

// Error tracking
window.addEventListener('error', function(event) {
    // Prevent default error handling
    event.preventDefault();
    
    // Get more detailed error information

// === Begin object errorInfo ===
    const errorInfo = {
        message: event.error?.message || event.message || 'Unknown error',
        stack: event.error?.stack,
        type: event.error?.name || 'Unknown Error',
        context: 'Global Error Handler',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    };
    
    // Log the error with more context and proper formatting
    console.error('Global error:', JSON.stringify(errorInfo, null, 2));
    
    // Use the ErrorHandler to handle the error
    ErrorHandler.handleError(event.error || new Error(event.message), 'Global Error Handler');
});

// Performance monitoring
window.addEventListener('load', function() {
    // Report critical performance metrics
    const paintMetrics = performance.getEntriesByType('paint');
    const navigationMetrics = performance.getEntriesByType('navigation');
    
    console.log('Performance Metrics:', {
        firstPaint: paintMetrics.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paintMetrics.find(p => p.name === 'first-contentful-paint')?.startTime,
        domInteractive: navigationMetrics[0]?.domInteractive,
        domComplete: navigationMetrics[0]?.domComplete
    });
});


// === Begin class ErrorHandler ===
class ErrorHandler {

    // --- Begin static method handleError ---
    static handleError(error, context = '') {
        // Log the error with context
        console.error(`Error in ${context}:`, error);
        
        // Format user-friendly error message
        let userMessage = 'An error occurred. Please try again.';
        
        // Handle different types of errors
        if (error instanceof ValidationError) {
            userMessage = error.message;
        } else if (error instanceof CalculationError) {
            userMessage = 'Error calculating benefits. Please check your inputs.';
        } else if (error instanceof TypeError) {
            userMessage = 'A type error occurred. Please check your inputs.';
        } else if (error instanceof ReferenceError) {
            userMessage = 'A reference error occurred. Please refresh the page.';
        } else if (error instanceof SyntaxError) {
            userMessage = 'A syntax error occurred. Please refresh the page.';
        }
        
        // Show the error to the user
        UIManager.showError(userMessage);
        
        // Log additional error details
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            context: context
        });
    }
}


// === Begin class ValidationError ===
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}


// === Begin class CalculationError ===
class CalculationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CalculationError';
    }
}

// Enhanced Form Validator

// === Begin class FormValidator ===
class FormValidator {
  static validateFormData(formData) {
    const errors = [];

    const requiredFields = {
      fsGrade: { name: 'Grade Level', element: 'fs-grade' },
      fsStep: { name: 'Step', element: 'fs-step' },
      yearsService: { name: 'Years of Service', element: 'years-service' },
      age: { name: 'Current Age', element: 'age' }
    };

    Object.entries(requiredFields).forEach(([field, info]) => {
      const element = document.getElementById(info.element);
      if (!element) {
        console.warn(`Form field element not found: ${info.element}`);
        return;
      }

      const value = formData[field];
      if (!value && value !== 0) {
        errors.push(`${info.name} is required`);
        this.showFieldError(element, `${info.name} is required`);
      } else {
        this.clearFieldError(element);
      }
    });

    if (formData.yearsService) {
      const yearsElement = document.getElementById('years-service');
      if (formData.yearsService < 1 || formData.yearsService > 40) {
        errors.push('Years of Service must be between 1 and 40');
        this.showFieldError(yearsElement, 'Must be between 1 and 40 years');
      }
    }

    if (formData.age) {
      const ageElement = document.getElementById('age');
      if (formData.age < 21 || formData.age > 80) {
        errors.push('Age must be between 21 and 80');
        this.showFieldError(ageElement, 'Must be between 21 and 80 years');
      }
    }

    if (formData.teraEligible === 'yes') {
      const teraYearsElement = document.getElementById('tera-years');
      const teraAgeElement = document.getElementById('tera-age');

      if (!formData.teraYears) {
        errors.push('V/TERA Years is required when V/TERA is eligible');
        this.showFieldError(teraYearsElement, 'Required for V/TERA eligibility');
      }

      if (!formData.teraAge) {
        errors.push('V/TERA Age is required when V/TERA is eligible');
        this.showFieldError(teraAgeElement, 'Required for V/TERA eligibility');
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join('\n'));
    }

    return true;
  }

  static showFieldError(element, message) {
    try {
      if (!element) {
        console.warn(`Attempted to show error on non-existent element: ${message}`);
        return;
      }

      if (element.classList) {
        element.classList.add('invalid');
        element.classList.remove('valid');
      }

      const parent = element.parentElement;
      if (!parent) {
        console.warn(`Element has no parent: ${element.id}`);
        return;
      }

      let errorDiv = parent.querySelector('.validation-message');
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'validation-message';
        parent.appendChild(errorDiv);
      }

      errorDiv.textContent = message;
    } catch (error) {
      console.error('Error showing field error:', error);
    }
  }

  static clearFieldError(element) {
    try {
      if (!element || !element.classList) return;

      element.classList.remove('invalid');
      element.classList.add('valid');

      const parent = element.parentElement;
      if (!parent) return;

      const errorDiv = parent.querySelector('.validation-message');
      if (errorDiv) {
        errorDiv.textContent = '';
        errorDiv.classList.remove('error');
      }
    } catch (error) {
      console.error('Error clearing field error:', error);
    }
  }

  static clearAllErrors() {
    document.querySelectorAll('.form-control').forEach(element => {
      this.clearFieldError(element);
    });
  }
}

// === Begin object UIManager ===

const UIManager = {
  showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'flex';
  },

  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
  },

  showError(message) {
    const error = document.getElementById('error');
    if (error) {
      error.textContent = message;
      error.style.display = 'block';
    }
  },

  clearError() {
    const error = document.getElementById('error');
    if (error) {
      error.textContent = '';
      error.style.display = 'none';
    }
  },

  showResults() {
    try {
      const resultsColumn = document.querySelector('.results-column');
      if (!resultsColumn) {
        console.warn('Results column not found');
        return;
      }

      resultsColumn.style.display = 'block';
      resultsColumn.style.visibility = 'visible';
      resultsColumn.style.opacity = '1';

      ['severance-results', 'retirement-results', 'health-results', 'lifetime-results'].forEach(id => {
        const container = document.getElementById(id);
        if (container) {
          container.style.display = 'block';
          container.style.visibility = 'visible';
          container.style.opacity = '1';
        }
      });

      if (window.innerWidth <= 768) {
        resultsColumn.scrollIntoView({ behavior: 'smooth' });
      }

      if ('localStorage' in window && 'serviceWorker' in navigator) {
        window.addEventListener('beforeunload', function () {
          try {
            const formData = document.getElementById('calculator-form').elements;
            localStorage.setItem('lastFormData', JSON.stringify(Array.from(formData).reduce((obj, field) => {
              if (field.id) obj[field.id] = field.value;
              return obj;
            }, {})));
          } catch (e) {
            console.warn('Unable to save form data:', e);
          }
        });

        window.addEventListener('load', function () {
          try {
            const lastFormData = JSON.parse(localStorage.getItem('lastFormData'));
            if (lastFormData) {
              Object.entries(lastFormData).forEach(([id, value]) => {
                const field = document.getElementById(id);
                if (field) field.value = value;
              });
            }
          } catch (e) {
            console.warn('Unable to restore form data:', e);
          }
        });
      }

      const hasContent = ['severance-results', 'retirement-results', 'health-results', 'lifetime-results'].some(id => {
        const container = document.getElementById(id);
        return container && container.innerHTML.trim() !== '';
      });

      if (!hasContent) {
        console.warn('No results content found in containers');
        return;
      }

      const firstTab = document.querySelector('.tab-button');
      if (firstTab && !document.querySelector('.tab-button.active')) {
        TabManager.activateTab(firstTab.id);
      }

      const activeTab = document.querySelector('.tab-button.active');
      if (activeTab) {
        const activeContent = document.getElementById(activeTab.getAttribute('data-tab'));
        if (activeContent) {
          activeContent.style.display = 'block';
          activeContent.style.visibility = 'visible';
          activeContent.style.opacity = '1';
        }
      }

      console.log('Results visibility state:', {
        resultsColumn: resultsColumn.style.display,
        activeTab: document.querySelector('.tab-button.active')?.id,
        activeContent: document.querySelector('.tab-content.active')?.id
      });

    } catch (error) {
      console.error('Error showing results:', error);
    }
  }
};


        // Define tabButtons first
        const tabButtons = document.querySelectorAll('.tab-button');


// === Begin class TabManager ===
class TabManager {

  // --- Begin static method activateTab ---
  static activateTab(tabId) {
    try {
      // Hide all tab contents first
      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
        content.setAttribute('aria-hidden', 'true');
      });

      // Remove active class from all buttons
      document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
      });

      // Show selected tab content
      const selectedContent = document.getElementById(tabId);
      const selectedButton = document.querySelector(`[data-tab="${tabId}"]`);

      if (selectedContent && selectedButton) {
        selectedContent.style.display = 'block';
        selectedContent.classList.add('active');
        selectedContent.setAttribute('aria-hidden', 'false');

        selectedButton.classList.add('active');
        selectedButton.setAttribute('aria-selected', 'true');
      }
    } catch (error) {
      console.error('Error in activateTab:', error);
    }
  }

  // --- Begin static method setupTabNavigation ---
  static setupTabNavigation() {
    // Add click handlers to tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        this.activateTab(tabId);
      });
    });

    // Show Severance tab by default
    this.showDefaultTab();
  }

  // --- Begin static method showDefaultTab ---
  static showDefaultTab() {
    this.activateTab('severance');
  }
}

// === Begin class AccessibilityManager ===
class AccessibilityManager {

    // --- Begin static method initialize ---
    static initialize() {
// Enhanced accessibility
               this.setupSkipLink();
        this.enhanceFormControls();
        this.setupKeyboardNavigation();
    }


    // --- Begin static method setupSkipLink ---
    static setupSkipLink() {
        const skipLink = document.querySelector('.skip-link');
        const mainContent = document.querySelector('main');
        
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            mainContent.focus();
        });
    }


    // --- Begin static method enhanceFormControls ---
    static enhanceFormControls() {
        // Add ARIA labels and descriptions
        document.querySelectorAll('.form-control').forEach(control => {
            const label = control.closest('.form-group').querySelector('label');
            if (label) {
                control.setAttribute('aria-label', label.textContent);
            }
            
            const description = control.closest('.form-group').querySelector('.form-text');
            if (description) {

// === Begin object descId ===
                const descId = `desc-${control.id}`;
                description.id = descId;
                control.setAttribute('aria-describedby', descId);
            }
        });
    }


    // --- Begin static method setupKeyboardNavigation ---
    static setupKeyboardNavigation() {
        // Enhanced keyboard navigation for tabs
        const tabList = document.querySelector('.tab-buttons');
        const tabs = tabList.querySelectorAll('.tab-button');
        
        tabList.setAttribute('role', 'tablist');
        tabs.forEach(tab => {
            tab.setAttribute('role', 'tab');
            tab.setAttribute('tabindex', '0');
            
            tab.addEventListener('keydown', (e) => {
                const targetTab = e.target;
                const previousTab = targetTab.previousElementSibling;
                const nextTab = targetTab.nextElementSibling;
                
                switch(e.key) {
                    case 'ArrowLeft':
                        if (previousTab) {
                            previousTab.focus();
                            previousTab.click();
                        }
                        break;
                    case 'ArrowRight':
                        if (nextTab) {
                            nextTab.focus();
                            nextTab.click();
                        }
                        break;
                }
            });
        });
    }
}

// Enhanced form feedback

// === Begin class FormFeedbackManager ===
class FormFeedbackManager {

  // --- Begin static method initialize ---
  static initialize() {
    try {
      this.setupInputFeedback();
      const calculatorForm = document.getElementById('calculator-form');
      if (calculatorForm) {
        this.setupProgressIndicator();
      }
    } catch (error) {
      console.error('Error initializing form feedback:', error);
    }
  }

  // --- Begin static method setupInputFeedback ---
  static setupInputFeedback() {
    const calculatorForm = document.getElementById('calculator-form');
    if (!calculatorForm) return;

    const requiredInputs = calculatorForm.querySelectorAll('.form-control[required]');
    requiredInputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.value) {
          input.classList.add('is-valid');
          input.classList.remove('is-invalid');
        } else {
          input.classList.add('is-invalid');
          input.classList.remove('is-valid');
        }
      });

      if (input.value) {
        input.classList.add('is-valid');
      }
    });
  }

  // --- Begin static method setupProgressIndicator ---
  static setupProgressIndicator() {
    const calculatorForm = document.getElementById('calculator-form');
    if (!calculatorForm) return;

    let progressBar = calculatorForm.querySelector('.progress-bar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      calculatorForm.insertBefore(progressBar, calculatorForm.firstChild);
    }

    this.updateProgress();
    calculatorForm.addEventListener('input', () => this.updateProgress());
  }

  // --- Begin static method updateProgress ---
  static updateProgress() {
    const calculatorForm = document.getElementById('calculator-form');
    const progressBar = calculatorForm.querySelector('.progress-bar');
    if (!calculatorForm || !progressBar) return;

    const total = calculatorForm.querySelectorAll('.form-control[required]').length;
    const filled = calculatorForm.querySelectorAll('.form-control[required]:valid').length;
    const progress = total > 0 ? (filled / total) * 100 : 0;

    progressBar.style.width = `${progress}%`;
  }
}

// Calculation Manager for handling all calculations

// === Begin object CalculationManager ===
const CalculationManager = {
  async calculateBenefits(formData) {
    try {
      // Calculate severance pay
      const severance = calculateSeverance(
        formData.fsGrade,
        formData.fsStep,
        formData.yearsService,
        formData.age,
        formData.currentPost,
        formData.annualLeaveBalance,
        formData.serviceDuration
      );

      // Calculate annuity
      const annuity = calculateFSPSAnnuity(
        formData.fsGrade,
        formData.fsStep,
        formData.yearsService,
        formData.age,
        [formData.salaryYear1, formData.salaryYear2, formData.salaryYear3],
        formData.currentPost,
        formData.teraEligible === 'yes',
        parseInt(formData.teraYears),
        parseInt(formData.teraAge),
        formData.sickLeaveYears,
        formData.serviceDuration
      );

      // Calculate health insurance
      const health = calculateHealthInsurance(
        formData.currentPlan,
        formData.planOption,
        formData.coverageType,
        formData.state
      );

      return {
        severance,
        annuity,
        health,
        formData
      };

    } catch (error) {
      console.error('Error calculating benefits:', error);
      throw new CalculationError('Error calculating benefits. Please check your inputs.');
    }
  }
};

// Validate input function - simplified

// --- Begin function validateInput ---
function validateInput(e) {
    const input = e.target;
    if (input.id.startsWith('salary-year-')) {
        // For salary inputs, only validate that it's a positive number
        const value = parseFloat(input.value);
        if (value < 0) input.value = 0;
        return;
    }
    
    // For other numeric inputs
    let value = input.value.replace(/[^0-9]/g, ''); // Only allow numbers
    if (input.min) value = Math.max(input.min, value);
    if (input.max) value = Math.min(input.max, value);
    input.value = value;
}

// Function to populate Years of Service dropdown

// --- Begin function populateYearsOfServiceDropdown ---
function populateYearsOfServiceDropdown() {
  console.log('Populating years of service dropdown');
  const yearsSelect = document.getElementById('years-service');
  if (!yearsSelect) {
    console.error('Years of Service dropdown not found');
    return;
  }

  try {
    // Clear existing options
    yearsSelect.innerHTML = '';

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Years';
    yearsSelect.appendChild(defaultOption);

    // Add year options
    for (let year = 1; year <= 40; year++) {
      const option = document.createElement('option');
      option.value = year.toString();
      option.textContent = `${year} ${year === 1 ? 'year' : 'years'}`;
      yearsSelect.appendChild(option);
    }

    // Force redraw for mobile browsers
    yearsSelect.style.display = 'none';
    yearsSelect.offsetHeight;
    yearsSelect.style.display = '';

    console.log('Years of service dropdown populated successfully');
  } catch (error) {
    console.error('Error populating years dropdown:', error);
  }
}

    // Function to populate High-Three Salary dropdowns

// --- Begin function populateHighThreeSalaryDropdowns ---
function populateHighThreeSalaryDropdowns() {
  console.log('Populating high-three salary dropdowns');
  const minSalary = 92000;
  const maxSalary = 205000;
  const step = 5000;

  const salaryInputs = ['salary-year-1', 'salary-year-2', 'salary-year-3'];

  salaryInputs.forEach(inputId => {
    const select = document.getElementById(inputId);
    if (!select) {
      console.error(`Salary dropdown ${inputId} not found`);
      return;
    }

    try {
      // Clear existing options
      select.innerHTML = '';

      // Add default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select Salary';
      select.appendChild(defaultOption);

      // Add salary options
      for (let salary = minSalary; salary <= maxSalary; salary += step) {
        const option = document.createElement('option');
        option.value = salary.toString();
        option.textContent = `$${salary.toLocaleString()}`;
        select.appendChild(option);
      }

      // Force redraw for mobile browsers
      select.style.display = 'none';
      select.offsetHeight;
      select.style.display = '';

      console.log(`Salary dropdown ${inputId} populated successfully`);
    } catch (error) {
      console.error(`Error populating salary dropdown ${inputId}:`, error);
    }
  });
}

// Initialize TERA dropdowns

// --- Begin function initializeTERADropdowns ---
function initializeTERADropdowns() {
  console.log('Initializing V/TERA dropdowns');
  const teraYearsSelect = document.getElementById('tera-years');
  const teraAgeSelect = document.getElementById('tera-age');

  if (!teraYearsSelect || !teraAgeSelect) {
    console.error('V/TERA dropdowns not found');
    return;
  }

  try {
    // Clear existing options
    teraYearsSelect.innerHTML = '';
    teraAgeSelect.innerHTML = '';

    // Add TERA Years options
    for (let year = 10; year <= 20; year++) {
      const option = document.createElement('option');
      option.value = year.toString();
      option.textContent = `${year} years`;
      teraYearsSelect.appendChild(option);
    }

    // Add TERA Age options
    for (let age = 43; age <= 50; age++) {
      const option = document.createElement('option');
      option.value = age.toString();
      option.textContent = `${age} years`;
      teraAgeSelect.appendChild(option);
    }

    // Force redraw for mobile browsers
    teraYearsSelect.style.display = 'none';
    teraYearsSelect.offsetHeight;
    teraYearsSelect.style.display = '';

    teraAgeSelect.style.display = 'none';
    teraAgeSelect.offsetHeight;
    teraAgeSelect.style.display = '';

    console.log('V/TERA dropdowns initialized successfully');
  } catch (error) {
    console.error('Error initializing V/TERA dropdowns:', error);
  }
}

// Replace the POST_ALLOWANCES object with just Washington, DC

// === Begin object POST_ALLOWANCES ===
const POST_ALLOWANCES = {
    'Washington, DC': 33.94
};

// Salary Tables Constants

// === Begin object SALARY_TABLES ===
const SALARY_TABLES = {
    'SFS': {
        base: 172500,
        steps: Array(14).fill(0).map((_, i) => 172500 + (i * 2500))
    },
    'FS-01': {
        base: 125133,
        steps: [125133, 128887, 132754, 136736, 140838, 145063, 149415, 153898, 158515, 162672, 162672, 162672, 162672, 162672]
    },
    'FS-02': {
        base: 101395,
        steps: [101395, 104427, 107570, 110797, 114121, 117545, 121071, 124703, 128444, 132297, 136266, 140354, 144565, 148902]
    },
    'FS-03': {
        base: 82160,
        steps: [82160, 84625, 87164, 89778, 92472, 95246, 98103, 101046, 104078, 107200, 110416, 113729, 117141, 120655]
    },
    'FS-04': {
        base: 66574,
        steps: [66574, 68571, 70628, 72747, 74930, 77178, 79493, 81878, 84334, 86864, 89470, 92154, 94919, 97766]
    }
};

// Health Insurance Rates moved to top for global access
window.HEALTH_INSURANCE_RATES = {
    'BCBS-basic': {
        'self': { monthly: 245.18, cobra: 891.02 * 1.02 },
        'self-plus-one': { monthly: 593.97, cobra: 2002.30 * 1.02 },
        'family': { monthly: 657.82, cobra: 2205.32 * 1.02 }
    },
    'FSBP-standard': {
        'self': { monthly: 202.28, cobra: 809.12 * 1.02 },
        'self-plus-one': { monthly: 544.96, cobra: 1953.29 * 1.02 },
        'family': { monthly: 500.40, cobra: 2001.59 * 1.02 }
    },
    'GEHA-standard': {
        'self': { monthly: 174.03, cobra: 696.13 * 1.02 },
        'self-plus-one': { monthly: 374.18, cobra: 1496.73 * 1.02 },
        'family': { monthly: 464.32, cobra: 1857.29 * 1.02 }
    },
        'GEHA-High Deductible': {
        'self': { monthly: 165.26, cobra: 661.05 * 1.02 },
        'self-plus-one': { monthly: 355.31, cobra: 1421.25 * 1.02 },
        'family': { monthly: 436.63, cobra: 1746.51 * 1.02 },
    },
    'Compass Rose': {
        'self': { monthly: 269.71, cobra: 915.55 * 1.02 },
        'self-plus-one': { monthly: 605.91, cobra: 2014.24 * 1.02 },
        'family': { monthly: 649.89, cobra: 2197.39 * 1.02 }
    },
    'NALC-High': {
        'self': { monthly: 294.84, cobra: 940.68 * 1.02 },
        'self-plus-one': { monthly: 690.54, cobra: 2098.87 * 1.02 },
        'family': { monthly: 615.20, cobra: 2162.70 * 1.02 }
    }
};

// Add state-specific ACA adjustment factors

// === Begin object STATE_ACA_FACTORS ===
const STATE_ACA_FACTORS = {
    'default': 1.0,
    'AL': 1.02,  // Alabama
    'AK': 1.15,  // Alaska - Higher costs due to geographic isolation
    'AZ': 0.98,  // Arizona
    'AR': 1.00,  // Arkansas
    'CA': 0.95,  // California - Own exchange with lower rates
    'CO': 0.97,  // Colorado
    'CT': 0.98,  // Connecticut
    'DE': 1.03,  // Delaware
    'DC': 0.94,  // District of Columbia - Strong marketplace
    'FL': 1.05,  // Florida - Higher average rates
    'GA': 1.04,  // Georgia
    'HI': 0.93,  // Hawaii - Strong health insurance regulations
    'ID': 1.01,  // Idaho
    'IL': 1.00,  // Illinois
    'IN': 1.02,  // Indiana
    'IA': 1.01,  // Iowa
    'KS': 1.03,  // Kansas
    'KY': 1.01,  // Kentucky
    'LA': 1.04,  // Louisiana
    'ME': 0.97,  // Maine
    'MD': 0.96,  // Maryland - State-based marketplace
    'MA': 0.92,  // Massachusetts - Strong state programs
    'MI': 0.99,  // Michigan
    'MN': 0.95,  // Minnesota - State-based marketplace
    'MS': 1.06,  // Mississippi
    'MO': 1.03,  // Missouri
    'MT': 1.04,  // Montana
    'NE': 1.02,  // Nebraska
    'NV': 1.01,  // Nevada
    'NH': 0.99,  // New Hampshire
    'NJ': 0.97,  // New Jersey
    'NM': 0.99,  // New Mexico
    'NY': 0.92,  // New York - Additional regulations and subsidies
    'NC': 1.03,  // North Carolina
    'ND': 1.02,  // North Dakota
    'OH': 1.00,  // Ohio
    'OK': 1.04,  // Oklahoma
    'OR': 0.96,  // Oregon
    'PA': 0.98,  // Pennsylvania
    'RI': 0.97,  // Rhode Island
    'SC': 1.04,  // South Carolina
    'SD': 1.03,  // South Dakota
    'TN': 1.03,  // Tennessee
    'TX': 1.05,  // Texas - Large uninsured population
    'UT': 0.98,  // Utah
    'VT': 0.94,  // Vermont - Strong state programs
    'VA': 1.00,  // Virginia
    'WA': 0.96,  // Washington - State-based marketplace
    'WV': 1.04,  // West Virginia
    'WI': 0.99,  // Wisconsin
    'WY': 1.06   // Wyoming - Limited competition
};

// ACA coverage level adjustments

// === Begin object ACA_COVERAGE_FACTORS ===
const ACA_COVERAGE_FACTORS = {
    'self': {
        deductible: { high: 1500, standard: 2500, basic: 3000 },
        outOfPocket: { high: 4000, standard: 6000, basic: 7000 }
    },
    'self-plus-one': {
        deductible: { high: 3000, standard: 5000, basic: 6000 },
        outOfPocket: { high: 8000, standard: 12000, basic: 14000 }
    },
    'family': {
        deductible: { high: 4500, standard: 7500, basic: 9000 },
        outOfPocket: { high: 12000, standard: 18000, basic: 21000 }
    }
};

// Calculate Severance Pay

// --- Begin function calculateSeverance ---
function calculateSeverance(fsGrade, fsStep, yearsService, age, post, annualLeaveBalance = 0, serviceDuration = null) {
    // Input validation
    if (!fsGrade || !fsStep || !yearsService || !age || !post) {
        throw new CalculationError('Missing required inputs for severance calculation');
    }

    console.log('Calculating severance with inputs:', { 
        fsGrade, 
        fsStep, 
        yearsService, 
        age, 
        post, 
        annualLeaveBalance,
        serviceDuration 
    });

    // Get base salary from salary tables
    if (!SALARY_TABLES[fsGrade]) {
        throw new CalculationError(`Invalid grade: ${fsGrade}`);
    }

    const stepIndex = parseInt(fsStep) - 1;
    // Get base salary from salary tables
    if (!SALARY_TABLES[fsGrade]) {
        throw new CalculationError(`Invalid grade: ${fsGrade}`);
    }

    const localityMultiplier = 1.3394; // DC locality adjustment
    const baseSalary = SALARY_TABLES[fsGrade].steps[stepIndex] * localityMultiplier;
    
    if (typeof baseSalary !== 'number' || isNaN(baseSalary)) {
        throw new CalculationError(`Invalid salary for grade ${fsGrade} step ${fsStep}`);
    }

    console.log('Base salary:', baseSalary);

    // Calculate monthly pay
    const monthlyPay = baseSalary / 12;
    console.log('Monthly pay:', monthlyPay);

    // Use serviceDuration if available, otherwise use yearsService
    const effectiveYearsService = serviceDuration ? serviceDuration.totalYears : yearsService;
    
    // Calculate severance pay (one month's pay for each year of service)
    let severancePay = monthlyPay * effectiveYearsService;
    console.log('Initial severance pay:', severancePay);

    // Cap at one year's salary
    severancePay = Math.min(severancePay, baseSalary);
    console.log('Final severance pay (after cap):', severancePay);

    // Calculate installments with dates (paid over three consecutive years on January 1)
    const currentYear = new Date().getFullYear();
    const installmentAmount = severancePay / 3;
    const installments = [
        {
            amount: installmentAmount,
            date: new Date(currentYear + 1, 0, 1).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        },
        {
            amount: installmentAmount,
            date: new Date(currentYear + 2, 0, 1).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        },
        {
            amount: installmentAmount,
            date: new Date(currentYear + 3, 0, 1).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        }
    ];

    // Calculate hourly rate for annual leave payout
    const hourlyRate = baseSalary / 2087;
    const annualLeavePayout = hourlyRate * annualLeaveBalance;


// === Begin object result ===
    const result = {
        baseSalary: baseSalary,
        monthlyPay: monthlyPay,
        severanceAmount: severancePay,
        installments: installments,
        hourlyRate: hourlyRate,
        yearsOfService: effectiveYearsService,
        serviceDuration: serviceDuration,
        annualLeaveHours: annualLeaveBalance,
        annualLeavePayout: annualLeavePayout
    };

    console.log('Severance calculation result:', result);
    return result;
}

//Salary Lookup

// --- Begin function lookupBaseSalary ---
function lookupBaseSalary(grade, step) {
  try {
    const stepNum = parseInt(step);
    if (isNaN(stepNum) || !SALARY_TABLES[grade]) return 0;
    return SALARY_TABLES[grade].steps[stepNum - 1] || 0;
  } catch {
    return 0;
  }
}

// Add getMRA function before calculateScenario

// --- Begin function getMRA ---
function getMRA(currentAge) {
    // Calculate birth year from current age
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - currentAge;
    
    // Determine MRA based on birth year
    if (birthYear <= 1947) {
        return 55;
    } else if (birthYear >= 1970) {
        return 57;
    } else {
        // For birth years 1948-1969, MRA increases by 2 months for each year
        const yearsSince1947 = birthYear - 1947;
        const additionalMonths = yearsSince1947 * 2;
        return 55 + (additionalMonths / 12);
    }
}

// Calculate FSPS Annuity

// --- Begin function calculateFSPSAnnuity ---
function calculateFSPSAnnuity(fsGrade, fsStep, yearsService, age, highThreeYears, post, teraEligible = false, teraYearsRequired = 10, teraAgeRequired = 43, sickLeaveServiceDuration = null, serviceDuration = null) {
    const currentSalary = SALARY_TABLES[fsGrade].steps[parseInt(fsStep) - 1];
    const postAllowanceRate = POST_ALLOWANCES[post] / 100;
    const adjustedSalary = currentSalary * (1 + postAllowanceRate);
    
    const highThreeAverage = highThreeYears.some(salary => salary > 0) ? 
        highThreeYears.reduce((sum, salary) => sum + salary, 0) / 3 : 
        adjustedSalary;

    // Calculate effective years of service
    let effectiveYearsService = yearsService;
    if (serviceDuration && serviceDuration.totalYears) {
        effectiveYearsService = serviceDuration.totalYears;
    }
    
    // Calculate scenarios including TERA
    const scenarios = {
        immediate: calculateScenario(
            highThreeAverage, 
            effectiveYearsService, 
            age, 
            "immediate", 
            false, 
            teraEligible, 
            teraYearsRequired, 
            teraAgeRequired, 
            sickLeaveServiceDuration, 
            serviceDuration
        ),
        tera: calculateScenario(
            highThreeAverage, 
            effectiveYearsService, 
            age, 
            "tera", 
            false, 
            teraEligible, 
            teraYearsRequired, 
            teraAgeRequired, 
            sickLeaveServiceDuration, 
            serviceDuration
        ),
        vera: calculateScenario(
            highThreeAverage, 
            effectiveYearsService, 
            age, 
            "vera", 
            false, 
            teraEligible, 
            teraYearsRequired, 
            teraAgeRequired, 
            sickLeaveServiceDuration, 
            serviceDuration
        ),
        mraPlusTen: calculateScenario(
            highThreeAverage, 
            effectiveYearsService, 
            age, 
            "mra+10", 
            false, 
            teraEligible, 
            teraYearsRequired, 
            teraAgeRequired, 
            sickLeaveServiceDuration, 
            serviceDuration
        ),
        deferred: calculateScenario(
            highThreeAverage, 
            effectiveYearsService, 
            age, 
            "deferred", 
            false, 
            teraEligible, 
            teraYearsRequired, 
            teraAgeRequired, 
            sickLeaveServiceDuration, 
            serviceDuration
        )
    };
    
    // Return the best scenario as the main result along with all scenarios
    const bestScenario = Object.values(scenarios).reduce((best, current) => 
        current.monthlyAnnuity > best.monthlyAnnuity ? current : best
    );
    
    return {
        ...bestScenario,
        scenarios: scenarios,
        baseSalary: currentSalary,
        postAllowanceRate: postAllowanceRate,
        adjustedSalary: adjustedSalary,
        highThreeAverage: highThreeAverage,
        serviceDuration: serviceDuration
    };
}

// Calculate Health Insurance

// --- Begin function calculateHealthInsurance ---
function calculateHealthInsurance(currentPlanOption, coverageType, homeState) {
    try {
        // Validate inputs
        if (!currentPlanOption || !coverageType || !homeState) {
            console.warn("Health insurance section skipped — returning default values.");
            return {
                fehb: { monthly: 0, cobra: 0 },
                cobra: { monthly: 0, duration: 18, totalCost: 0 },
                aca: { monthly: 0, deductible: 0, outOfPocket: 0 },
                planOption: '',
                coverageType: '',
                homeState: '',
                recommendations: [],
                skipped: true
            };
        }

        // Get the plan data directly (no need to split since we store full plan names)
        if (!HEALTH_INSURANCE_RATES[currentPlanOption]) {
            throw new Error(`Invalid health insurance plan: ${currentPlanOption}`);
        }

        // Get the rates for the selected coverage type
        const currentRates = HEALTH_INSURANCE_RATES[currentPlanOption][coverageType];
        if (!currentRates) {
            throw new Error(`Invalid coverage type ${coverageType} for plan ${currentPlanOption}`);
        }

        // Validate state
        if (!STATE_ACA_FACTORS[homeState] && !STATE_ACA_FACTORS['default']) {
            throw new Error(`Invalid state: ${homeState}`);
        }

        // Calculate COBRA costs (total monthly premium + 2% admin fee)
        const totalMonthlyPremium = currentRates.cobra / 1.02; // Remove the 2% admin fee to get base total premium

// === Begin object cobraCosts ===
        const cobraCosts = {
            monthly: currentRates.cobra,
            duration: 18,
            totalCost: currentRates.cobra * 18
        };
        
        // Calculate ACA estimate based on total monthly premium with state adjustments
        const stateFactor = STATE_ACA_FACTORS[homeState] || STATE_ACA_FACTORS['default'];
        // Use total monthly premium (employer + employee portions) as base for ACA calculation
        const baseACARate = Math.round(totalMonthlyPremium * stateFactor);
        
        // Extract plan option from the plan name (e.g., 'BCBS-basic' -> 'basic')
        const planOption = currentPlanOption.includes('-') ? 
            currentPlanOption.split('-')[1] : 'standard';
        
        // Validate ACA coverage factors
        if (!ACA_COVERAGE_FACTORS[coverageType]) {
            throw new Error(`Missing ACA coverage factors for type: ${coverageType}`);
        }
        

// === Begin object acaEstimate ===
        const acaEstimate = {
            monthly: baseACARate,
            deductible: ACA_COVERAGE_FACTORS[coverageType].deductible[planOption] || 3000,
            outOfPocket: ACA_COVERAGE_FACTORS[coverageType].outOfPocket[planOption] || 7000,
            totalPremiumBase: totalMonthlyPremium // Add this for transparency
        };

        const recommendations = generateHealthInsuranceRecommendations(currentRates, cobraCosts, acaEstimate, planOption);
        
        return {
            fehb: currentRates,
            cobra: cobraCosts,
            aca: acaEstimate,
            planOption: planOption,
            coverageType: coverageType,
            homeState: homeState,
            recommendations: recommendations
        };
    } catch (error) {
        console.error('Error in calculateHealthInsurance:', error);
        // Return a default structure with error information
        return {
            error: error.message,
            fehb: { monthly: 0, cobra: 0 },
            cobra: { monthly: 0, duration: 18, totalCost: 0 },
            aca: { monthly: 0, deductible: 0, outOfPocket: 0 },
            planOption: '',
            coverageType: '',
            homeState: '',
            recommendations: ['Error calculating health insurance costs. Please check your selections.']
        };
    }
}


// --- Begin function generateHealthInsuranceRecommendations ---
function generateHealthInsuranceRecommendations(fehbRates, cobraCosts, acaEstimate, planOption) {
    const recommendations = [];
    
    // Compare COBRA vs ACA costs
    if (cobraCosts.monthly < acaEstimate.monthly) {
        recommendations.push("COBRA coverage may be more cost-effective initially (calculated as your Total Monthly Premium [Employee + Employer] + 2% Admin Fee), providing 18 months of your current coverage.");
    } else {
        recommendations.push("ACA marketplace plans may offer more affordable monthly premiums than COBRA.");
    }

    // High vs Low deductible considerations
    if (planOption === 'high') {
        recommendations.push("Your current high-option plan suggests you may benefit from comprehensive coverage. Consider similar coverage levels when comparing marketplace plans.");
    } else {
        recommendations.push("Your current plan choice suggests you may prefer lower monthly premiums. Look for bronze or silver marketplace plans to maintain similar cost structure.");
    }

    // General recommendations
    recommendations.push("Compare plan networks to ensure your preferred healthcare providers are covered.");
    recommendations.push("Consider any upcoming medical needs when choosing between COBRA and marketplace plans.");
    recommendations.push("Check if you qualify for ACA premium tax credits based on your expected income.");
    
    return recommendations;
}

    // Add click handlers to all tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = button.getAttribute('data-tab');
            if (tabId) {
                switchTab(tabId);
            }
        });
    });
    
    // Set initial active tab
    const firstTabId = tabButtons[0]?.getAttribute('data-tab');
    if (firstTabId) {
        switchTab(firstTabId);
    }

// Clear error function

// --- Begin function clearError ---
function clearError() {
    DOM.error.style.display = 'none';
    DOM.error.textContent = '';
}

// Reset form handler
document.getElementById('calculator-form').addEventListener('reset', function(e) {
    clearError();
    document.querySelectorAll('.results-container').forEach(container => {
        container.innerHTML = '';
    });
    // Hide TERA requirements section and reset dropdown
    document.querySelector('.tera-requirements').style.display = 'none';
    document.getElementById('tera-eligible').value = 'no';
});

// Add input validation
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function(e) {
        const min = parseFloat(this.min);
        const max = parseFloat(this.max);
        const value = parseFloat(this.value);
        
        if (value < min) {
            this.value = min;
        } else if (value > max) {
            this.value = max;
        }
    });
});

// Add memoization for expensive calculations
const memoizedCalculateScenario = Utils.memoize(calculateScenario);

// Add debounced form validation

// === Begin object debouncedValidateInput ===
const debouncedValidateInput = Utils.debounce((e) => {
    const input = e.target;
    if (input.id.startsWith('salary-year-')) {
        const value = parseFloat(input.value);
        if (value < 0) input.value = 0;
        return;
    }
    
    let value = input.value.replace(/[^0-9]/g, '');
    if (input.min) value = Math.max(input.min, value);
    if (input.max) value = Math.min(input.max, value);
    input.value = value;
}, 150);

// Optimize tab switching

// --- Begin function switchTab ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Add SFS ranks and salary data

// === Begin object SFS_RANKS ===
const SFS_RANKS = {
    'Career Minister': {
        step: 14,
        salary: 203700
    },
    'Minister Counselor': {
        steps: [11, 12, 13],
        salaries: {
            11: 186300,
            12: 192100,
            13: 197900
        }
    },
    'Counselor': {
        steps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        salaries: {
            1: 172500,
            2: 175000,
            3: 177500,
            4: 180000,
            5: 182500,
            6: 185000,
            7: 187500,
            8: 190000,
            9: 192500,
            10: 195000
        }
    }
};

// Update the existing SALARY_TABLES with SFS data
SALARY_TABLES.SFS = {
    base: 172500,
    steps: Array(14).fill(0).map((_, i) => {
        if (i < 10) return SFS_RANKS.Counselor.salaries[i + 1];
        else if (i < 13) return SFS_RANKS['Minister Counselor'].salaries[i + 1];
        else return SFS_RANKS['Career Minister'].salary;
    })
};

// Update getFormData function to handle SFS ranks

// --- Begin function getFormData ---
function getFormData() {
    const grade = document.getElementById('fs-grade').value;
    const step = document.getElementById('fs-step').value;
    
    // Get the actual salary based on grade and step
    let baseSalary;
    if (grade === 'SFS') {
        if (step == 14) {
            baseSalary = SFS_RANKS['Career Minister'].salary;
        } else if (step >= 11) {
            baseSalary = SFS_RANKS['Minister Counselor'].salaries[step];
        } else {
            baseSalary = SFS_RANKS['Counselor'].salaries[step];
        }
    } else {
        baseSalary = SALARY_TABLES[grade].steps[parseInt(step) - 1];
    }
    
    return {
        fsGrade: grade,
        fsStep: step,
        baseSalary: baseSalary,
        yearsService: parseInt(document.getElementById('years-service').value),
        age: parseInt(document.getElementById('age').value),
        currentPost: "Washington, DC", // Always use Washington, DC
        currentPlan: document.getElementById('current-plan').value,
        planOption: document.getElementById('plan-option').value,
        coverageType: document.getElementById('coverage-type').value,
        state: document.getElementById('state').value,
        teraEligible: document.getElementById('tera-eligible').value,
        teraYears: document.getElementById('tera-eligible').value === 'yes' ? 
            (document.getElementById('tera-years')?.value || '10') : 
            (document.getElementById('tera-years')?.value || '20'),
        teraAge: document.getElementById('tera-age')?.value || '43',
        salaryYear1: parseInt(document.getElementById('salary-year-1').value) || 0,
        salaryYear2: parseInt(document.getElementById('salary-year-2').value) || 0,
        salaryYear3: parseInt(document.getElementById('salary-year-3').value) || 0,
        annualLeaveBalance: parseInt(document.getElementById('annual-leave-balance').value) || 0
    };
}

// Replace with a single, comprehensive handler:

// === Begin class FormManager ===
class FormManager {

    // --- Begin static method init ---
static init() {
const calculatorForm= document.getElementById('calculator-form');
if (calculatorForm) {
    // Remove any existing event listeners
    calculatorForm.removeEventListener('submit', FormManager.handleFormSubmit);
    
    // Add the submit event listener
    calculatorForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form from submitting normally
        e.stopPropagation(); // Stop event from bubbling
        FormManager.handleFormSubmit(e);
        return false; // Ensure the form doesn't reset
    });
}
}

// Get form data function

    // --- Begin static method getFormData ---
static getFormData() {
    const serviceComputationDate = document.getElementById('service-computation-date')?.value;
    const yearsServiceInput = parseInt(document.getElementById('years-service')?.value) || 0;
    const sickLeaveBalance = parseFloat(document.getElementById('sick-leave-balance')?.value) || 0;
    
    // Calculate years of service from SCD if available
    let calculatedYearsService;
    let serviceDuration = null;
    
    if (serviceComputationDate) {
        serviceDuration = calculateServiceDuration(serviceComputationDate);
        calculatedYearsService = serviceDuration ? serviceDuration.totalYears : yearsServiceInput;
        console.log('Using service duration calculated from SCD:', calculatedYearsService);
    } else {
        calculatedYearsService = yearsServiceInput;
        console.log('Using manually entered years of service:', calculatedYearsService);
    }

    // Calculate additional service time from sick leave (2087 hours = 1 year)
    const sickLeaveYears = sickLeaveBalance > 0 ? sickLeaveBalance / 2087 : 0;
    console.log('Additional years from sick leave:', sickLeaveYears);

    // Create service duration object if it doesn't exist from SCD
    if (!serviceDuration && calculatedYearsService) {
        serviceDuration = {
            years: Math.floor(calculatedYearsService),
            months: Math.floor((calculatedYearsService % 1) * 12),
            days: 0,
            totalYears: calculatedYearsService
        };
    }

    return {
        fsGrade: document.getElementById('fs-grade')?.value || '',
        fsStep: document.getElementById('fs-step')?.value || '',
        yearsService: calculatedYearsService || 0,  // Ensure this is never undefined
        sickLeaveYears: sickLeaveYears,
        sickLeaveBalance: sickLeaveBalance,
        serviceComputationDate: serviceComputationDate,
        serviceDuration: serviceDuration,
        effectiveYearsService: calculatedYearsService + sickLeaveYears, // Add this for total
        age: parseInt(document.getElementById('age')?.value) || 0,
        currentPost: "Washington, DC",
        currentPlan: document.getElementById('current-plan')?.value || '',
        coverageType: document.getElementById('coverage-type')?.value || '',
        state: document.getElementById('state')?.value || '',
        teraEligible: document.getElementById('tera-eligible')?.value || 'no',
        teraYears: document.getElementById('tera-years')?.value || '10',
        teraAge: document.getElementById('tera-age')?.value || '43',
        salaryYears: [
            parseInt(document.getElementById('salary-year-1')?.value) || 0,
            parseInt(document.getElementById('salary-year-2')?.value) || 0,
            parseInt(document.getElementById('salary-year-3')?.value) || 0
        ],
        annualLeaveBalance: parseInt(document.getElementById('annual-leave-balance').value) || 0
    };
}
//Handles form submission and prevents default behavior

    // --- Begin static method async ---
static async handleFormSubmit(e) {
    try {
        e.preventDefault();
        e.stopPropagation();

        // Clear any previous errors or results
        FormValidator.clearAllErrors();
        UIManager.clearError();
        UIManager.showLoading();

        // Gather all form input
        const formData = FormManager.getFormData();
        console.log('📄 Form Data:', formData);

        // Validate formData has required fields
        if (!formData || typeof formData.yearsService === 'undefined') {
            throw new Error('Invalid form data: Years of service is required');
        }

        // Rest of the method remains the same...
    } catch (error) {
        console.error("❌ Form processing error:", error);
        UIManager.showError("An error occurred while processing your form. Please check your inputs.");
    } finally {
        UIManager.hideLoading();
    }
} // End of handleFormSubmit method
} // End of FormManager class

// Service Duration Validation Functions

// --- Begin function getValidatedServiceDuration ---
function getValidatedServiceDuration() {
    try {
        const scdInput = document.getElementById('service-computation-date');
        const yearsServiceInput = document.getElementById('years-service');
        const warningDiv = document.getElementById('service-duration-warning');
        const warningMessage = document.getElementById('service-duration-message');

        const scd = scdInput?.value?.trim() || null;
        const manualYears = parseFloat(yearsServiceInput?.value) || 0;

        if (!scd) {
            if (warningDiv) warningDiv.style.display = 'none';
            return {
                totalYears: manualYears,
                totalMonths: manualYears * 12
            };
        }

        const calculated = calculateServiceDuration(scd);
        if (!calculated || typeof calculated.totalYears !== "number") {
            if (warningDiv) warningDiv.style.display = 'none';
            return {
                totalYears: manualYears,
                totalMonths: manualYears * 12
            };
        }

        // Check if difference exceeds threshold (1 month)
        const yearDiff = Math.abs(calculated.totalYears - manualYears);
        const monthThreshold = 1 / 12;

        if (yearDiff > monthThreshold) {
            const scdYears = Math.floor(calculated.totalYears);
            const scdMonths = Math.round((calculated.totalYears - scdYears) * 12);

            if (warningMessage) {
                warningMessage.innerHTML = `SCD calculates to ${scdYears} years, ${scdMonths} months vs. manual entry of ${manualYears} years. SCD will be used.`;
            }
            if (warningDiv) {
                warningDiv.style.display = 'block';
            }
        } else {
            if (warningDiv) {
                warningDiv.style.display = 'none';
            }
        }

        return calculated;

    } catch (error) {
        console.error("Error in getValidatedServiceDuration:", error);
        return {
            totalYears: 0,
            totalMonths: 0
        };
    }
}


// --- Begin function clearSCD ---
function clearSCD() {
    const scdInput = document.getElementById('service-computation-date');
    const warningDiv = document.getElementById('service-duration-warning');
    const warningMessage = document.getElementById('service-duration-message');

    if (scdInput) {
        scdInput.value = '';
    }
    if (warningMessage) {
        warningMessage.innerHTML = '';
    }
    if (warningDiv) {
        warningDiv.style.display = 'none';
    }

    // Optionally re-run duration logic or refresh outputs
    // const service = getValidatedServiceDuration(); 
}

// ✅ Expose to inline HTML
window.getValidatedServiceDuration = getValidatedServiceDuration;

// === Begin class Calculator ===
class Calculator {

  // --- Begin static method initialize ---
  static initialize() {
    try {
      this.setupFormHandlers();
      this.addTouchSupport();  // Added touch support for mobile devices

      const currentPostSelect = document.getElementById('current-post');
      if (currentPostSelect && !currentPostSelect.value) {
        currentPostSelect.value = "Washington, DC";
      }

      console.log('Calculator initialized successfully');
    } catch (error) {
      console.error('Error initializing Calculator:', error);
    }
  }

    // Method to add touch support for form submission

    // --- Begin static method addTouchSupport ---
    static addTouchSupport() {
        const calculatorForm = document.getElementById('calculator-form');
        if (!calculatorForm) return;  // Check if form exists
        
        const submitButton = calculatorForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                calculatorForm.dispatchEvent(new Event('submit'));
            });
        }
    }

// --- Begin static method setupFormHandlers ---
static setupFormHandlers() {
  const calculatorForm = document.getElementById('calculator-form');
  if (!calculatorForm) return;

  calculatorForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      FormValidator.clearAllErrors();
      UIManager.showLoading();
      UIManager.clearError();

      const formData = this.getFormData();
      FormValidator.validateFormData(formData);

      // Calculate all results first
      const severanceResult = this.calculateSeverance(formData);
      const retirementResult = this.calculateRetirement(formData);
      const healthResult = this.calculateHealth(formData);

      // Create results object after calculations
      const results = {
        formData: formData,
        severance: severanceResult,
        retirement: retirementResult,
        health: healthResult
      };

      // Update the UI with results
      this.updateResults(results);
      UIManager.showResults();
    } catch (error) {
      ErrorHandler.handleError(error, 'form submission');
    } finally {
      UIManager.hideLoading();
    }
  });

  // Add reset handler
  calculatorForm.addEventListener('reset', () => {
    FormValidator.clearAllErrors();
    UIManager.clearError();
    document.querySelectorAll('.results-container').forEach(container => {
      container.innerHTML = '';
      container.style.display = 'none';
    });
  });

  // Add mobile-specific touch handling for submit button
  const submitButton = calculatorForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      submitButton.click(); // Trigger native click
    });
  }
}
    
    // --- Begin static method getFormData ---
    static getFormData() {
        const serviceComputationDate = document.getElementById('service-computation-date')?.value;
        const yearsServiceInput = parseInt(document.getElementById('years-service')?.value) || 0;
        const sickLeaveBalance = parseFloat(document.getElementById('sick-leave-balance')?.value) || 0;
        
        // Calculate years of service from SCD if available
        let calculatedYearsService;
        let serviceDuration = null;
        
        if (serviceComputationDate) {
            serviceDuration = calculateServiceDuration(serviceComputationDate);
            calculatedYearsService = serviceDuration ? serviceDuration.totalYears : yearsServiceInput;
            console.log('Using service duration calculated from SCD:', calculatedYearsService);
        } else {
            calculatedYearsService = yearsServiceInput;
            console.log('Using manually entered years of service:', calculatedYearsService);
        }

        // Calculate additional service time from sick leave (2087 hours = 1 year)
        const sickLeaveYears = sickLeaveBalance / 2087;
        console.log('Additional years from sick leave:', sickLeaveYears);


// === Begin object formData ===
        const formData = {
            fsGrade: document.getElementById('fs-grade')?.value || '',
            fsStep: document.getElementById('fs-step')?.value || '',
            yearsService: calculatedYearsService,
            sickLeaveYears: sickLeaveYears,
            serviceComputationDate: serviceComputationDate,
            serviceDuration: serviceDuration,
            age: parseInt(document.getElementById('age')?.value) || 0,
            currentPost: "Washington, DC", // Always use Washington, DC
            currentPlan: document.getElementById('current-plan')?.value || '',
            coverageType: document.getElementById('coverage-type')?.value || '',
            state: document.getElementById('state')?.value || '',
            teraEligible: document.getElementById('tera-eligible')?.value || 'no',
            teraYears: document.getElementById('tera-years')?.value || '10',
            teraAge: document.getElementById('tera-age')?.value || '43',
            salaryYears: [
                parseInt(document.getElementById('salary-year-1')?.value) || 0,
                parseInt(document.getElementById('salary-year-2')?.value) || 0,
                parseInt(document.getElementById('salary-year-3')?.value) || 0
            ],
            annualLeaveBalance: parseInt(document.getElementById('annual-leave-balance').value) || 0
        };

        // Add debug logging
        console.log('Form Data:', formData);
        
        return formData;
    }


    // --- Begin static method calculateSeverance ---
    static calculateSeverance(formData) {
        console.log('Calculating Severance with:', formData);
        
        // Calculate effective years of service
        const effectiveYearsService = formData.serviceDuration ? 
            formData.serviceDuration.totalYears : 
            formData.yearsService;
        
        const result = calculateSeverance(
            formData.fsGrade,
            formData.fsStep,
            effectiveYearsService,  // Use the calculated effective years
            formData.age,
            formData.currentPost,
            formData.annualLeaveBalance,
            formData.serviceDuration
        );
        console.log('Severance Result:', result);
        return result;
    }


    // --- Begin static method calculateRetirement ---
    static calculateRetirement(formData) {
        console.log('Calculating Retirement with:', formData);

        const teraEligible = formData['tera-eligible'] === 'yes';
        
        const result = calculateFSPSAnnuity(
            formData.fsGrade,
            formData.fsStep,
            formData.yearsService,
            formData.age,
            formData.salaryYears,
            formData.currentPost,
            formData.teraEligible === 'yes',
            parseInt(formData.teraYears) || 10,
            parseInt(formData.teraAge) || 43,
            formData.sickLeaveYears ? 
                { totalYears: formData.sickLeaveYears, years: Math.floor(formData.sickLeaveYears), months: Math.floor((formData.sickLeaveYears % 1) * 12), days: Math.floor(((formData.sickLeaveYears % 1) * 12 % 1) * 30) } : 
                null,
            formData.serviceDuration
        );
        console.log('Retirement Result:', result);
        return result;
    }

    // --- Begin static method calculateHealth ---
    static calculateHealth(formData) {
        console.log('Calculating health with formData:', formData); // Debug log
        const healthResult = calculateHealthInsurance(
            formData.currentPlan,
            formData.coverageType,
            formData.state
        );
        console.log('Health calculation result:', healthResult); // Debug log
        return healthResult;
    }

    // --- Begin static method updateResults ---
    static updateResults(results) {
        console.log('Updating results with:', results); // Debug log

        // Update severance results
        const severanceResults = document.getElementById('severance-results');
        if (severanceResults && results.severance) {
            this.updateSeveranceResults(severanceResults, results.severance);
        }

        // Update retirement results
        const retirementResults = document.getElementById('retirement-results');
        if (retirementResults && results.retirement) {
            this.updateRetirementResults(retirementResults, results.retirement, results.formData || {}, results.health);
        }

        // Update health results
        const healthResults = document.getElementById('health-results');
        if (healthResults && results.health) {
            this.updateHealthResults(healthResults, results.health);
        }

        // Update lifetime results - Add this section
        console.log('Starting updateResults with:', results);

    // Update lifetime results
    const lifetimeResults = document.getElementById('lifetime-results');
    if (lifetimeResults && results.retirement) {
        console.log('Passing to updateLifetimeReport:', {
            retirement: results.retirement,
            formData: results.formData
        });
        this.updateLifetimeReport(lifetimeResults, results.retirement, results.formData);
    } else {
        console.warn('Missing lifetimeResults container or retirement data:', {
            containerExists: !!lifetimeResults,
            hasRetirementData: !!results.retirement
        });
    }
}

    // --- Begin static method updateSeveranceResults ---
    static updateSeveranceResults(container, severance) {
        if (!container || !severance) {
            console.warn('Missing required parameters for updateSeveranceResults');
            return;
        }

// === Begin object serviceDurationText ===
        const serviceDurationText = severance.serviceDuration ? formatServiceDuration(severance.serviceDuration) : `${severance.yearsOfService.toFixed(1)} years`;

        // Check if grade is FS-01 or SFS
        const fsGrade = document.getElementById('fs-grade').value;
        const isExcluded = fsGrade === 'FS-01' || fsGrade === 'SFS';

        if (isExcluded) {
            container.innerHTML = `
                <div class="form-section">
                    <h3>Severance Pay Summary</h3>
                    <div class="alert alert-info" style="margin: 1rem 0; padding: 1rem; background-color: #f0f9ff; border-left: 3px solid #3b82f6; border-radius: 4px;">
                        <p><strong>Note:</strong> Severance pay is not available for FS-01 and Senior Foreign Service members who are involuntarily separated, as they are eligible for immediate retirement.</p>
                    </div>
                    <div style="margin-top: 1rem;">
                        <h3>Annual Leave Payout</h3>
                        <div class="comparison-table">
                            <table>
                                <tr>
                                    <th>Annual Leave Balance</th>
                                    <td>${severance.annualLeaveHours || 0} hours</td>
                                </tr>
                                <tr>
                                    <th>Hourly Rate</th>
                                    <td>${Utils.formatCurrency(severance.hourlyRate || 0)}/hour</td>
                                </tr>
                                <tr>
                                    <th>Total Payout</th>
                                    <td>${Utils.formatCurrency((severance.annualLeaveHours || 0) * (severance.hourlyRate || 0))}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="form-text">
                            <p><strong>Note:</strong> Annual leave will be paid in a lump sum after separation.</p>
                        </div>
                    </div>
                </div>`;
        } else {
            container.innerHTML = `
                <div class="form-section">
                    <h3>Severance Pay Summary</h3>
                    <div class="comparison-table">
                        <table>
                            <tr>
                                <th>Base Salary</th>
                                <td>${Utils.formatCurrency(severance.baseSalary || 0)}</td>
                            </tr>
                            <tr>
                                <th>Service Duration</th>
                                <td>${serviceDurationText}</td>
                            </tr>
                            <tr>
                                <th>Amount Per Year of Service</th>
                                <td>${Utils.formatCurrency(severance.monthlyPay || 0)}</td>
                            </tr>
                            <tr>
                                <th>Total Severance</th>
                                <td>${Utils.formatCurrency(severance.severanceAmount || 0)}</td>
                            </tr>
                        </table>
                    </div>
                    <h3>Severance Payment Schedule</h3>
                    <div class="comparison-table">
                        <table>
                            ${severance.installments.map(payment => `
                                <tr>
                                    <th>${payment.date}</th>
                                    <td>${Utils.formatCurrency(payment.amount)}</td>
                                </tr>
                            `).join('')}
                        </table>
                    </div>
                    <div class="form-text">
                        <p><strong>Note:</strong> Severance pay is adjusted with DC locality pay at 33.94%.</p>
                        <p><strong>Important:</strong> Severance pay is not available to employees who are eligible for immediate retirement (including TERA) or to FS-01 and Senior Foreign Service members who are involuntarily separated.</p>
                    </div>
                    <div style="margin-top: 1rem;">
                        <h3>Annual Leave Payout</h3>
                        <div class="comparison-table">
                            <table>
                                <tr>
                                    <th>Annual Leave Balance</th>
                                    <td>${severance.annualLeaveHours || 0} hours</td>
                                </tr>
                                <tr>
                                    <th>Hourly Rate</th>
                                    <td>${Utils.formatCurrency(severance.hourlyRate || 0)}/hour</td>
                                </tr>
                                <tr>
                                    <th>Total Payout</th>
                                    <td>${Utils.formatCurrency((severance.annualLeaveHours || 0) * (severance.hourlyRate || 0))}</td>
                                </tr>
                            </table>
                        </div>
                        <div class="form-text">
                            <p><strong>Note:</strong> Annual leave will be paid in a lump sum after separation.</p>
                        </div>
                    </div>
                </div>`;
        }
    }

    // --- Begin static method updateHealthResults ---
    static updateHealthResults(container, health) {
        if (!container || !health) {
            console.warn('Missing required parameters for updateHealthResults');
            return;
        }

        // NEW LOGIC: Show fallback message if user skipped health insurance
        if (health?.fehb?.monthly === 0 && health?.aca?.monthly === 0) {
            const message = document.getElementById('health-skipped-message');
            if (message) {
                message.style.display = 'block';
            }
            return;
        }

        container.innerHTML = `
            <div class="form-section">
                <h3>Current Coverage</h3>
                <div class="comparison-table">
                    <table>
                        <tr>
                            <th>Current Employee Monthly Premium</th>
                            <td>${Utils.formatCurrency(health.fehb.monthly)}</td>
                        </tr>
                        <tr>
                            <th>Total Monthly Premium</th>
                            <td>${Utils.formatCurrency(health.aca.totalPremiumBase)}</td>
                        </tr>
                        <tr>
                            <th>COBRA Monthly Premium</th>
                            <td>${Utils.formatCurrency(health.cobra.monthly)}</td>
                        </tr>
                        <tr>
                            <th>COBRA Duration</th>
                            <td>${health.cobra.duration} months</td>
                        </tr>
                        <tr>
                            <th>Total COBRA Cost</th>
                            <td>${Utils.formatCurrency(health.cobra.totalCost)}</td>
                        </tr>
                    </table>
                </div>

                <h3>Marketplace Options</h3>
                <div class="comparison-table">
                    <table>
                        <tr>
                            <th>Estimated Monthly Premium</th>
                            <td>${Utils.formatCurrency(health.aca.monthly)}</td>
                        </tr>
                        <tr>
                            <th>Estimated Deductible</th>
                            <td>${Utils.formatCurrency(health.aca.deductible)}</td>
                        </tr>
                        <tr>
                            <th>Estimated Out-of-Pocket Max</th>
                            <td>${Utils.formatCurrency(health.aca.outOfPocket)}</td>
                        </tr>
                    </table>
                </div>

                <h3>Recommendations</h3>
                <div class="form-text">
                    <ul>
                        ${health.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                    <p class="mt-3"><strong>Note:</strong> ACA Marketplace premium estimates are based on your current plan's total premium of ${Utils.formatCurrency(health.aca.totalPremiumBase)} (both employee and employer portions), adjusted for ${health.homeState} market factors. Actual marketplace premiums may vary based on plan selection, income, and available subsidies.</p>
                </div>
            </div>
        `;
    }

    // --- Begin static method updateRetirementResults ---
static updateRetirementResults(container, retirement, formData, health) {
    if (!container || !retirement || !formData) {
        console.warn('Missing required parameters for updateRetirementResults');
        return;
    }

    // Get monthly health premium if available
    const monthlyHealthPremium = health && health.fehb ? health.fehb.monthly : 0;
    console.log('Monthly health premium for retirement calculation:', monthlyHealthPremium);

    // Format service duration in years and months
    // Local function to safely format years as duration
    function formatYearsAsDuration(years) {
        if (!years || isNaN(years)) return '0 years';
        const totalMonths = Math.round(years * 12);
        const wholeYears = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;
        
        if (wholeYears === 0) {
            return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        } else if (remainingMonths === 0) {
            return `${wholeYears} year${wholeYears !== 1 ? 's' : ''}`;
        } else {
            return `${wholeYears} year${wholeYears !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        }
    }

    // Safely get service durations with fallbacks
    const serviceDurationText = retirement.serviceDuration ? 
        formatYearsAsDuration(retirement.serviceDuration.totalYears) : 
        formatYearsAsDuration(formData.yearsService || 0);

    const yearsService = formData.yearsService || 0;
    const sickLeaveYears = formData.sickLeaveYears || 0;

    const sickLeaveText = sickLeaveYears > 0 ? 
        `${(sickLeaveYears * 2087).toFixed(0)} hours (${formatYearsAsDuration(sickLeaveYears)})` : 
        '';

    const totalServiceText = formatYearsAsDuration(yearsService + sickLeaveYears);

    // Get TERA/VERA parameters with fallbacks
    const minVeraAge = parseInt(formData.teraAge, 10) || 43;
    const minServiceYears = parseInt(formData.teraYears, 10) || 15;

    // Generate the HTML content
    container.innerHTML = `
    <div class="retirement-options">
        <div class="option-card">
            <h6>Service and Salary Summary</h6>
            <div class="comparison-table">
                <table>
                    <tr>
                        <th>High-Three Average Salary</th>
                        <td>${Utils.formatCurrency(retirement.highThreeAverage || 0)}</td>
                    </tr>
                    <tr>
                        <th>Service Duration</th>
                        <td>${serviceDurationText}</td>
                    </tr>
                    ${sickLeaveText ? `
                    <tr>
                        <th>Creditable Sick Leave</th>
                        <td>${sickLeaveText}</td>
                    </tr>
                    <tr>
                        <th>Total Credited Service</th>
                        <td>${totalServiceText}</td>
                    </tr>
                    ` : `
                    <tr>
                        <th>Total Credited Service</th>
                        <td>${serviceDurationText}</td>
                    </tr>
                    `}
                    <tr>
                        <th>Current Age</th>
                        <td>${formData.age || 0} years</td>
                    </tr>
                    <tr>
                        <th>Minimum Retirement Age (MRA)</th>
                        <td>${retirement.mraDisplay || 'Not Available'}</td>
                    </tr>
                </table>
            </div>
        </div>

        <h3>Available Retirement Options</h3>
        ${Object.entries(retirement.scenarios || {})
            .filter(([_, scenario]) => scenario && scenario.isEligible)
            .map(([type, scenario]) => {
                // Generate eligibility requirements, citation, and policy notes based on type
                const { eligibilityRequirements, citation, policyNotes } = this.getRetirementTypeDetails(
                    type, minServiceYears, minVeraAge
                );

                return `
                    <div class="option-card">
                        <h6>${labelMap[type] || (type.charAt(0).toUpperCase() + type.slice(1))} Retirement</h6>
                        <div class="option-details">
                            ${eligibilityRequirements}
                            <div class="calculation-details">
                                <p><strong>Monthly Benefit:</strong> ${Utils.formatCurrency(scenario.monthlyAnnuity || 0)}</p>
                                <p><strong>Annual Benefit:</strong> ${Utils.formatCurrency(scenario.annualAnnuity || 0)}</p>
                                ${this.generateDeductionsTable(scenario, health)}
                            </div>
                            ${policyNotes}
                            ${citation}
                        </div>
                    </div>`;
            }).join('')}
    </div>
    ${this.generateRetirementNotes(minVeraAge, minServiceYears)}`;
}

    // --- Begin function updateLifetimeReport ---
 static updateLifetimeReport(container, retirement, formData) {
  console.log('🔍 DEBUG - Lifetime Report Inputs:', {
    retirement: retirement,
    formData: formData,
    scenarios: retirement?.scenarios || 'No scenarios found'
  });

  const maxAge = 85;
  const currentAge = parseInt(formData.age, 10) || 57;
  const service = parseFloat(formData.yearsService || 0);
  const grade = formData.fsGrade || '';
  const step = parseInt(formData.fsStep || 1, 10);
  const teraMinAge = parseInt(formData.teraAge || 43, 10);
  const teraMinYears = parseInt(formData.teraYears || 15, 10);

  const tbodyEligible = [];
  const tbodyIneligible = [];
  const notesEligible = [];
  const notesIneligible = [];

  const eligibilityRules = {
    immediate: (age, service, grade) => {
      const reasons = [];
      if (age < 50) reasons.push("must be at least 50 years old");
      if (service < 20) reasons.push("requires 20+ years of service");
      if (!/^FS-0[1-3]$|^SFS$/.test(grade)) reasons.push("requires grade FS-01 or higher");
      return reasons;
    },
    tera: (age, service) => {
      const reasons = [];
      if (age < teraMinAge) reasons.push(`must be at least ${teraMinAge} years old`);
      if (service < teraMinYears) reasons.push(`requires ${teraMinYears}+ years of service`);
      return reasons;
    },
    vera: (age, service) => {
      const reasons = [];
      if (age < teraMinAge) reasons.push(`must be at least ${teraMinAge} years old`);
      if (service < teraMinYears) reasons.push(`requires ${teraMinYears}+ years of service`);
      return reasons;
    },
    mraPlusTen: (age, service) => {
      const reasons = [];
      if (age < 57) reasons.push("must reach MRA (57)");
      if (service < 10) reasons.push("requires 10+ years of service");
      return reasons;
    },
    deferred: (_, service) => {
      return service < 5 ? ["requires at least 5 years of creditable service"] : [];
    }
  };

  if (retirement.scenarios) {
    Object.entries(retirement.scenarios).forEach(([type, scenario]) => {
      const label = labelMap[type] || type;

      // Try to use provided annuity or calculate one
      let annual = typeof scenario.annualAnnuity === "number" ? scenario.annualAnnuity : 0;
      if (annual === 0) {
        const s1 = parseFloat(formData.salaryYear1 || 0);
        const s2 = parseFloat(formData.salaryYear2 || 0);
        const s3 = parseFloat(formData.salaryYear3 || 0);
        let average = (s1 + s2 + s3) / 3;

        if (average === 0 && typeof lookupBaseSalary === "function") {
          const base = lookupBaseSalary(formData.fsGrade, step);
          average = base || 80000;
        }

        const multiplierMap = {
          immediate: 0.017,
          tera: 0.017,
          vera: 0.017,
          mraPlusTen: 0.01,
          deferred: 0.015
        };

        const multiplier = multiplierMap[type] || 0.01;
        annual = Math.round(average * service * multiplier);
      }

      const monthlySupplemental = scenario.monthlySupplemental || 0;

      const startAge =
        type === 'deferred' ? Math.max(62, currentAge) :
        type === 'mraPlusTen' ? Math.max(57, currentAge) :
        currentAge;

      const years = Math.max(0, maxAge - startAge);
      const total = Math.round(annual * years);

      let assumptions = `$${annual.toLocaleString()}/yr × ${years} years starting at age ${startAge}`;
      if (monthlySupplemental > 0) {
        const annualSupplemental = monthlySupplemental * 12;
        assumptions += ` (+ $${annualSupplemental.toLocaleString()} SRS until age 62)`;
      }

      const reasons = eligibilityRules[type]?.(currentAge, service, grade) || [];
      const reasonText = !scenario.isEligible && reasons.length
        ? `Ineligible because ${reasons.join(", ")} — but would be `
        : "";

      const notes = `<strong>${label}:</strong> ${reasonText}${assumptions}`;

      const row = `<tr>
        <td>${label}</td>
        <td>${Utils.formatCurrency(total)}</td>
      </tr>`;

      if (scenario.isEligible) {
        tbodyEligible.push(row);
        notesEligible.push(notes);
      } else {
        tbodyIneligible.push(row);
        notesIneligible.push(notes);
      }
    });
  }

  container.innerHTML = `
    <div class="form-section">
      <h3>Eligible Retirement</h3>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Eligible Options</th>
              <th>Total Value (to age ${maxAge})</th>
            </tr>
          </thead>
          <tbody>${tbodyEligible.join('')}</tbody>
        </table>
      </div>

      <h3>Ineligible Retirement (for Comparison Only)</h3>
      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Ineligible Options</th>
              <th>Total Value (to age ${maxAge})</th>
            </tr>
          </thead>
          <tbody>${tbodyIneligible.join('')}</tbody>
        </table>
      </div>

      <div class="form-text">
        <h3>Assumptions</h3>
        <ul>
          <li>${[...notesEligible, ...notesIneligible].join("</li><li>")}</li>
        </ul>
      </div>
    </div>
  `;
}
   
// Helper method to determine ineligibility reasons
static getIneligibilityReasons(type, age, service, grade) {
    const reasons = [];
    switch (type) {
        case 'immediate':
            if (age < 50) reasons.push("must be at least 50 years old");
            if (service < 20) reasons.push("requires 20+ years of service");
            if (!/^FS-0[1-3]$|^SFS$/.test(grade)) reasons.push("requires grade FS-01 or higher");
            break;
        case 'tera':
            if (age < 50) reasons.push("must be at least 50 years old");
            if (service < 15) reasons.push("requires 15+ years of service");
            break;
        case 'mraPlusTen':
            if (age < 57) reasons.push("must reach MRA (57)");
            if (service < 10) reasons.push("requires 10+ years of service");
            break;
        case 'deferred':
            if (service < 5) reasons.push("requires at least 5 years of service");
            break;
    }
    return reasons;
}
    
// Helper method to generate the deductions table
static generateDeductionsTable(scenario, health) {
    const monthlyAnnuity = scenario.monthlyAnnuity || 0;
    const healthPremium = health?.fehb?.monthly || 0;

    return `
    <div style="margin-top: 1rem;">
        <p><strong>Net Monthly Annuity</strong></p>
        
        <div style="margin: 1rem 0;">
            <p><strong>With Maximum Survivor Benefit (10%)</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                <tr>
                    <td>Gross Monthly Annuity</td>
                    <td style="text-align: right;">${Utils.formatCurrency(monthlyAnnuity)}</td>
                </tr>
                <tr>
                    <td>Survivor Benefit (10%)</td>
                    <td style="text-align: right;">-${Utils.formatCurrency(monthlyAnnuity * 0.10)}</td>
                </tr>
                <tr>
                    <td>Health Insurance Premium</td>
                    <td style="text-align: right;">-${Utils.formatCurrency(healthPremium)}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                    <td><strong>Net Monthly Annuity</strong></td>
                    <td style="text-align: right;"><strong>${Utils.formatCurrency(monthlyAnnuity - (monthlyAnnuity * 0.10) - healthPremium)}</strong></td>
                </tr>
            </table>
        </div>

        <div style="margin: 1rem 0;">
            <p><strong>With Reduced Survivor Benefit (5%)</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                <tr>
                    <td>Gross Monthly Annuity</td>
                    <td style="text-align: right;">${Utils.formatCurrency(monthlyAnnuity)}</td>
                </tr>
                <tr>
                    <td>Survivor Benefit (5%)</td>
                    <td style="text-align: right;">-${Utils.formatCurrency(monthlyAnnuity * 0.05)}</td>
                </tr>
                <tr>
                    <td>Health Insurance Premium</td>
                    <td style="text-align: right;">-${Utils.formatCurrency(healthPremium)}</td>
                </tr>
                <tr style="border-top: 1px solid #e2e8f0;">
                    <td><strong>Net Monthly Annuity</strong></td>
                    <td style="text-align: right;"><strong>${Utils.formatCurrency(monthlyAnnuity - (monthlyAnnuity * 0.05) - healthPremium)}</strong></td>
                </tr>
            </table>
        </div>
        
        <p style="margin-top: 0.5rem;">
            <em>Note: Maximum survivor benefit provides 50% of your full annuity to your survivor, while reduced benefit provides 25%. Actual deductions may vary based on tax withholding and other factors.</em>
        </p>
    </div>`;
}

// Helper method to get retirement type details
static getRetirementTypeDetails(type, minServiceYears, minVeraAge) {
    const details = {
        immediate: {
            eligibilityRequirements: `
                <h6>Eligibility Requirements</h6>
                <ul>
                    <li>Age 62 with 5 years of service</li>
                    <li>Age 50 with 20 years of service</li>
                    <li>Any age with 25 years of service</li>
                </ul>
                <h6>Benefit Calculation</h6>
                <ul>
                    <li>1.7% × first 20 years of service × high-3 average salary</li>
                    <li>Plus 1% × remaining years over 20 × high-3 average salary</li>
                    <li>Special Retirement Supplement until age 62 (if eligible)</li>
                </ul>`,
            policyNotes: `
                <div class="alert alert-info">
                
                    <strong>Policy Notes:</strong>
                    <ul>
                        <li>Eligible for FEHB and FEGLI coverage in retirement</li>
                        <li>Special Retirement Supplement provides additional income until age 62</li>
                        <li>No reduction in annuity regardless of age</li>
                    </ul>
                </div>`,
            citation: '<p class="citation">Source: Foreign Service Act of 1980, as amended, 22 U.S.C. 4051-4052; 5 U.S.C. Chapter 84</p>'
        },
        tera: {
            eligibilityRequirements: `
                <h6>Eligibility Requirements</h6>
                <ul>
                    <li>Minimum ${minServiceYears} years of service required</li>
                    <li>Must be part of authorized TERA window</li>
                </ul>
                <h6>Benefit Calculation</h6>
                <ul>
                    <li>1.7% × years of service × high-3 average salary</li>
                    <li>Reduced by 1/12 of 1% per month under 20 years service (~ 1% per year)</li>
                    <li>Eligible for Special Retirement Supplement if age requirements met</li>
                </ul>`,
            policyNotes: `
                <div class="alert alert-info">
                    <strong>Policy Notes:</strong>
                    <ul>
                        <li>Eligible for FEHB and FEGLI coverage if 5-year requirement met</li>
                        <li>Permanent reduction in annuity based on years under 20</li>
                        <li>Agency-specific eligibility rules may apply</li>
                    </ul>
                </div>`,
            citation: '<p class="citation">Source: 22 U.S.C. 4008a; Department Authority</p>'
        },
        vera: {
            eligibilityRequirements: `
                <h6>Eligibility Requirements</h6>
                <ul>
                    <li>Age ${minVeraAge}+ with ${minServiceYears}+ years of service</li>
                    <li>Must be part of authorized VERA window</li>
                </ul>
                <h6>Benefit Calculation</h6>
                <ul>
                    <li>1.7% × first 20 years of service × high-3 average salary</li>
                    <li>Plus 1% × remaining years over 20 × high-3 average salary</li>
                    <li>Special Retirement Supplement until age 62</li>
                </ul>`,
            policyNotes: `
                <div class="alert alert-info">
                    <strong>Policy Notes:</strong>
                    <ul>
                        <li>Eligible for FEHB and FEGLI coverage if 5-year requirement met</li>
                        <li>No reduction in basic annuity</li>
                        <li>Agency-specific eligibility rules may apply</li>
                    </ul>
                </div>`,
            citation: '<p class="citation">Source: 5 U.S.C. 8336(d)(2); Department Authority</p>'
        },
        mraPlusTen: {
            eligibilityRequirements: `
                <h6>Eligibility Requirements</h6>
                <ul>
                    <li>Reach Minimum Retirement Age (MRA)</li>
                    <li>At least 10 years of service</li>
                </ul>
                <h6>Benefit Calculation</h6>
                <ul>
                    <li>1% × years of service × high-3 average salary</li>
                    <li>Reduced by 5% per year under age 62</li>
                    <li>No Special Retirement Supplement</li>
                </ul>`,
            policyNotes: `
                <div class="alert alert-info">
                    <strong>Policy Notes:</strong>
                    <ul>
                        <li>FEHB/FEGLI only if taking immediate annuity</li>
                        <li>Permanent reduction unless postponed to 62</li>
                        <li>Can postpone annuity to reduce or eliminate age reduction</li>
                    </ul>
                </div>`,
            citation: '<p class="citation">Source: 5 U.S.C. 8412(g); Foreign Service Act</p>'
        },
        deferred: {
            eligibilityRequirements: `
                <h6>Eligibility Requirements</h6>
                <ul>
                    <li>At least 5 years of service</li>
                    <li>Payable at age 62</li>
                </ul>
                <h6>Benefit Calculation</h6>
                <ul>
                    <li>1% × years of service × high-3 average salary</li>
                    <li>No reduction for age</li>
                    <li>No Special Retirement Supplement</li>
                </ul>`,
            policyNotes: `
                <div class="alert alert-info">
                    <strong>Policy Notes:</strong>
                    <ul>
                        <li>Not eligible to continue FEHB or FEGLI</li>
                        <li>No survivor benefits until annuity begins</li>
                        <li>No COLA until age 62</li>
                    </ul>
                </div>`,
            citation: '<p class="citation">Source: 5 U.S.C. 8413(b); Foreign Service Act</p>'
        }
    };

    return details[type] || {
        eligibilityRequirements: '',
        policyNotes: '',
        citation: ''
    };
}

// Helper method to generate retirement notes
static generateRetirementNotes(minVeraAge, minServiceYears) {
    return `
    <div class="retirement-notes">
        <h5>Important Notes</h5>
        <ul>
            <li>All calculations are estimates based on current policy and provided information</li>
            <li>Actual benefits may vary based on final service computation and other factors</li>
            <li>Special Retirement Supplement (SRS) eligibility and calculation:
                <ul>
                    <li>Available for immediate retirement and VERA and TERA before age 62</li>
                    <li>Must meet one of these criteria:
                        <ul>
                            <li>Age 50+ with 20+ years of service</li>
                            <li>Any age with 25+ years of service</li>
                            <li>VERA retirement meeting minimum age (${minVeraAge}) and service (${minServiceYears} years) requirements</li>
                            <li>TERA retirement meeting minimum service (${minServiceYears} years) requirement</li>
                        </ul>
                    </li>
                    <li>SRS estimate based on career average base pay earnings (excluding locality pay) for conservative estimation</li>
                    <li>Maximum SRS capped at Social Security maximum benefit ($3,627 for 2024)</li>
                    <li>Actual SRS may be higher if locality pay is included in HR's final calculation</li>
                </ul>
            </li>
            <li>FEHB Coverage Eligibility:
                <ul>
                    <li>Immediate Retirement: Eligible if covered for 5 years before retirement</li>
                    <li>MRA+10: Only eligible if taking immediate annuity (not postponed)</li>
                    <li>Deferred: Not eligible to continue FEHB coverage</li>
                    <li>VERA and TERA: Eligible if covered for 5 years before retirement</li>
                </ul>
            </li>
            <li>Consider consulting with HR for official calculations and guidance</li>
        </ul>
    </div>`;
    }
}
        
// --- Begin function initializeAfterLoad ---
function initializeAfterLoad() {
  try {
    // Initialize Calculator
    Calculator.initialize();
    
    // Initialize TabManager
    TabManager.setupTabNavigation();
    
    // Initialize other components
    populateYearsOfServiceDropdown();
    populateHighThreeSalaryDropdowns();
    initializeTERADropdowns();
    
    // Initialize accessibility features
    AccessibilityManager.initialize();
    
    // Initialize form feedback
    FormFeedbackManager.initialize();

    console.log('All components initialized successfully');
  } catch (error) {
    console.error('Error in initializeAfterLoad:', error);
  }
}

// Call initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAfterLoad);
} else {
  initializeAfterLoad();
}

// --- Combined DOMContentLoaded Initialization ---
document.addEventListener('DOMContentLoaded', function () {
  const serviceComputationDateInput = document.getElementById('service-computation-date');
  const sickLeaveBalanceInput = document.getElementById('sick-leave-balance');
  const annualLeaveBalanceInput = document.getElementById('annual-leave-balance');
  const annualLeavePayoutSummary = document.getElementById('annual-leave-payout-summary');
  const annualLeaveInput = document.getElementById('annual-leave');

  // --- Handle Optional Inputs ---
  function handleOptionalInputs() {
    const serviceComputationDate = serviceComputationDateInput?.value || 'N/A';
    const sickLeaveBalance = parseFloat(sickLeaveBalanceInput?.value) || 0;
    const annualLeaveBalance = parseFloat(annualLeaveBalanceInput?.value) || 0;
    // These values can be passed to calculations later
  }

  if (serviceComputationDateInput)
    serviceComputationDateInput.addEventListener('input', handleOptionalInputs);
  if (sickLeaveBalanceInput)
    sickLeaveBalanceInput.addEventListener('input', handleOptionalInputs);
  if (annualLeaveBalanceInput)
    annualLeaveBalanceInput.addEventListener('input', handleOptionalInputs);

  // --- Calculate Annual Leave Payout ---
  function calculateAnnualLeavePayout(baseSalary, postAllowanceRate) {
    const balanceInput = annualLeaveInput || annualLeaveBalanceInput;
    const balance = balanceInput && balanceInput.value ? parseFloat(balanceInput.value) : 0;
    const hourlyRate = (baseSalary * (1 + postAllowanceRate)) / 2087;
    const payout = hourlyRate * balance;
    return payout.toFixed(2);
  }

  if (annualLeavePayoutSummary) {
    const updatePayout = () => {
      const baseSalary = parseFloat(document.getElementById('base-salary')?.value) || 0;
      const postAllowanceRate = parseFloat(document.getElementById('post-allowance-rate')?.value) || 0;
      const payout = calculateAnnualLeavePayout(baseSalary, postAllowanceRate);
      annualLeavePayoutSummary.innerHTML = `Annual Leave Payout: $${payout}`;
    };

    if (annualLeaveBalanceInput)
      annualLeaveBalanceInput.addEventListener('input', updatePayout);

    if (annualLeaveInput)
      annualLeaveInput.addEventListener('input', updatePayout);
  }
});

// Initialize form handling when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Ensure all classes are defined
  if (
    typeof Calculator !== 'undefined' &&
    typeof FormManager !== 'undefined' &&
    typeof UIManager !== 'undefined' &&
    typeof TabManager !== 'undefined'
  ) {
    // Initialize core modules
    FormManager.init();
    TabManager.setupTabNavigation();

    // iOS-specific form handling
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {
      const submitButton = calculatorForm.querySelector('button[type="submit"]');
      
      // Handle tap to submit on iOS
      if (submitButton) {
        submitButton.addEventListener('touchend', (e) => {
          e.preventDefault();
          e.stopPropagation();
          FormManager.handleFormSubmit(e);
          return false;
        }, { passive: false });
      }

      // Prevent native iOS form submission
      calculatorForm.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.type === 'submit') {
          e.preventDefault();
        }
      }, { passive: false });

      // Handle Enter key in mobile Safari
      calculatorForm.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          document.activeElement.blur();
        }
      });
    }
  } else {
    console.error('Required classes not initialized');
  }
});

// --- Begin function formatServiceDuration ---
function formatServiceDuration(serviceDuration) {
    if (!serviceDuration) {
        return '';
    }
    
    // Convert everything to months for rounding
    let totalMonths = (serviceDuration.years * 12) + serviceDuration.months;
    
    // Convert days to fraction of a month (assuming 30-day month)
    if (serviceDuration.days > 0) {
        // Round to nearest month if days are 15 or more
        if (serviceDuration.days >= 15) {
            totalMonths += 1;
        }
    }
    
    // Convert back to years and months
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    
    let text = '';
    if (years > 0) {
        text += `${years} year${years !== 1 ? 's' : ''}`;
    }
    if (months > 0) {
        text += text ? ', ' : '';
        text += `${months} month${months !== 1 ? 's' : ''}`;
    }
    
    return text || '0 months';
}

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize core components
        Calculator.initialize();
        FormManager.init();
        TabManager.setupTabNavigation();
        AccessibilityManager.initialize();
        FormFeedbackManager.initialize();
        
        // Initialize dropdowns
        populateYearsOfServiceDropdown();
        populateHighThreeSalaryDropdowns();
        initializeTERADropdowns();
        
        // Set up event listeners
        const fsGrade = document.getElementById('fs-grade');
        if (fsGrade) {
            fsGrade.addEventListener('change', function() {
                updateStepDropdown(this.value);
            });
            
            // Initialize with current grade value
            if (fsGrade.value) {
                updateStepDropdown(fsGrade.value);
            }
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        ErrorHandler.handleError(error, 'initialization');
    }
});

// Add event cleanup
window.addEventListener('beforeunload', function() {
    // Remove form event listeners
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {
        calculatorForm.removeEventListener('submit', FormManager.handleFormSubmit);
        calculatorForm.removeEventListener('touchstart', null);
        calculatorForm.removeEventListener('keypress', null);
    }
});
