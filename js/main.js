// File: main.js

// ======== Debug & Utility Functions ========
const DEBUG = false;
function log(...args) {
  if (DEBUG) console.log(...args);
}

function debounce(fn, wait = 150) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, limit = 200) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function validateNumber(value, min, max) {
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
}


// ======== Cache DOM Elements ========
const DOM = {
  form: document.getElementById('calculator-form'),
  fsGrade: document.getElementById('fs-grade'),
  fsStep: document.getElementById('fs-step'),
  yearsService: document.getElementById('years-service'),
  age: document.getElementById('age'),
  currentPlan: document.getElementById('current-plan'),
  coverageType: document.getElementById('coverage-type'),
  state: document.getElementById('state'),
  teraEligible: document.getElementById('tera-eligible'),
  teraYears: document.getElementById('tera-years'),
  teraAge: document.getElementById('tera-age'),
  salaryYear1: document.getElementById('salary-year-1'),
  salaryYear2: document.getElementById('salary-year-2'),
  salaryYear3: document.getElementById('salary-year-3'),
  sickLeaveBalance: document.getElementById('sick-leave-balance'),
  serviceComputationDate: document.getElementById('service-computation-date'),
  annualLeaveBalance: document.getElementById('annual-leave-balance'),
  severanceResults: document.getElementById('severance-results'),
  retirementResults: document.getElementById('retirement-results'),
  healthResults: document.getElementById('health-results'),
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  tabButtons: document.querySelectorAll('.tab-button'),
};


// ======== Helper Calculation Functions ========
function calculateServiceDuration(serviceComputationDate) {
  if (!serviceComputationDate) return null;
  const today = new Date();
  const startDate = new Date(serviceComputationDate);
  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const years = Math.floor(diffDays / 365.25);
  let remainingDays = diffDays - years * 365.25;
  const months = Math.floor(remainingDays / 30.44);
  remainingDays = Math.floor(remainingDays - months * 30.44);
  return {
    years,
    months,
    days: remainingDays,
    totalYears: diffDays / 365.25,
    totalDays: diffDays,
  };
}

function calculateSickLeaveServiceDuration(sickLeaveHours) {
  if (!sickLeaveHours || sickLeaveHours <= 0) return null;
  const totalDays = Math.floor((sickLeaveHours / 2087) * 365.25);
  const years = Math.floor(totalDays / 365.25);
  let remainingDays = totalDays - years * 365.25;
  const months = Math.floor(remainingDays / 30.44);
  remainingDays = Math.floor(remainingDays - months * 30.44);
  return {
    years,
    months,
    days: remainingDays,
    totalYears: totalDays / 365.25,
  };
}

const CAREER_PROGRESSION = {
  'FS-04': { baseStep: 66574, stepIncrement: 2000, maxStep: 14, avgTimeInGrade: 2 },
  'FS-03': { baseStep: 82160, stepIncrement: 2500, maxStep: 14, avgTimeInGrade: 3 },
  'FS-02': { baseStep: 101395, stepIncrement: 3500, maxStep: 14, avgTimeInGrade: 4 },
  'FS-01': { baseStep: 125133, stepIncrement: 4000, maxStep: 14, avgTimeInGrade: 5 },
  SFS: { baseStep: 172500, stepIncrement: 2500, maxStep: 14, avgTimeInGrade: null },
};

function simulateCareerProgression(currentGrade, currentStep, yearsService) {
  const grades = ['FS-04', 'FS-03', 'FS-02', 'FS-01', 'SFS'];
  let totalEarnings = 0,
    yearsInService = 0;
  let currentGradeIndex = grades.indexOf(currentGrade);
  if (currentGradeIndex === -1) currentGradeIndex = 0;
  let expectedYearsToPosition = 0;
  for (let i = 0; i < currentGradeIndex; i++) {
    expectedYearsToPosition += CAREER_PROGRESSION[grades[i]].avgTimeInGrade;
  }
  const progressionRate = expectedYearsToPosition
    ? Math.min(yearsService / expectedYearsToPosition, 2)
    : 1;
  const simulatedYears = Math.min(yearsService, 40);
  let currentSimStep = 1,
    currentSimGrade = 'FS-04';
  for (let y = 0; y < simulatedYears; y++) {
    const info = CAREER_PROGRESSION[currentSimGrade];
    const yearSalary = info.baseStep + (currentSimStep - 1) * info.stepIncrement;
    totalEarnings += yearSalary;
    yearsInService++;
    currentSimStep++;
    if (currentSimStep > info.maxStep && currentSimGrade !== 'SFS') {
      const nextIdx = grades.indexOf(currentSimGrade) + 1;
      if (nextIdx < grades.length) {
        currentSimGrade = grades[nextIdx];
        currentSimStep = 1;
      }
    }
  }
  return {
    averageAnnualSalary: totalEarnings / yearsInService,
    yearsInService,
    finalGrade: currentGrade,
    finalStep: currentStep,
  };
}

function calculateEnhancedSupplemental(
  currentGrade,
  currentStep,
  yearsService,
  age
) {
  if (age >= 62) return 0;
  const gradeInfo = CAREER_PROGRESSION[currentGrade];
  if (!gradeInfo) return 0;
  const currentBaseSalary = gradeInfo.baseStep + (currentStep - 1) * gradeInfo.stepIncrement;
  const careerSimulation = simulateCareerProgression(currentGrade, currentStep, yearsService);
  const averageIndexedEarnings = careerSimulation.averageAnnualSalary;
  const supplementalPercentage = Math.min(yearsService / 30, 1);
  const supplementalBase = averageIndexedEarnings * 0.4;
  const annualSupplemental = supplementalBase * supplementalPercentage;
  const monthlySupplemental = annualSupplemental / 12;
  const maxMonthlyBenefit = 3627;
  return Math.min(monthlySupplemental, maxMonthlyBenefit);
}

function getMRA(currentAge) {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - currentAge;
  if (birthYear <= 1947) return 55;
  if (birthYear >= 1970) return 57;
  const yearsSince1947 = birthYear - 1947;
  return 55 + (yearsSince1947 * 2) / 12;
}

function calculateScenario(
  highThreeAverage,
  yearsService,
  age,
  type,
  isInvoluntary = false,
  teraEligible = false,
  teraYearsRequired = 10,
  teraAgeRequired = 43,
  sickLeaveDuration = null,
  serviceDuration = null
) {
  function roundToMonths(y) {
    const totalMonths = Math.round(y * 12);
    return totalMonths / 12;
  }
  let effectiveYears = serviceDuration ? roundToMonths(serviceDuration.totalYears) : roundToMonths(yearsService);
  if ((type === 'immediate' || type === 'tera') && sickLeaveDuration) {
    effectiveYears += roundToMonths(sickLeaveDuration.totalYears);
  }
  const mraAge = getMRA(age);
  let annuityPercentage = 0,
    description = '',
    isEligible = false,
    mraReduction = 0,
    age62Comparison = null;
  const isSenior = DOM.fsGrade.value === 'FS-01' || DOM.fsGrade.value === 'SFS';

  if (type === 'immediate') {
    if (isSenior && effectiveYears >= 5) {
      isEligible = true;
      description = 'Immediate retirement (Senior Grade)';
    } else if (age >= 62 && effectiveYears >= 5) {
      isEligible = true;
      description = 'Immediate retirement (age 62 with 5 years)';
    } else if ((age >= 50 && effectiveYears >= 20) || (isInvoluntary && age >= 50 && effectiveYears >= 20)) {
      isEligible = true;
      description = isInvoluntary
        ? 'Immediate retirement (involuntary, age 50 with 20 years)'
        : 'Immediate retirement (age 50 with 20 years)';
    } else if (effectiveYears >= 25) {
      isEligible = true;
      description = 'Immediate retirement (25 years any age)';
    }
  } else if (type === 'tera') {
    if (teraEligible && age >= teraAgeRequired && effectiveYears >= teraYearsRequired) {
      isEligible = true;
      description = `V/TERA retirement (age ${teraAgeRequired} with ${teraYearsRequired} years)`;
    }
  } else if (type === 'mra+10') {
    if (effectiveYears >= 10) {
      isEligible = true;
      description = 'MRA+10 retirement';
      if (age < mraAge) {
        description += ` (eligible at ${mraAge})`;
        const yearsUnder = 62 - mraAge;
        mraReduction = 0.05 * yearsUnder;
        age62Comparison = {
          age: 62,
          description: 'MRA+10 (wait until 62)',
          annuityPercentage: effectiveYears * 0.01,
          mraReduction: 0,
          monthlyAnnuity: (highThreeAverage * effectiveYears * 0.01) / 12,
          annualAnnuity: highThreeAverage * effectiveYears * 0.01,
          yearsToWait: 62 - age,
        };
      } else if (age < 62) {
        const yearsUnder = 62 - age;
        mraReduction = 0.05 * yearsUnder;
        description += ` with ${(mraReduction * 100).toFixed(1)}% reduction`;
        age62Comparison = {
          age: 62,
          description: 'MRA+10 (wait until 62)',
          annuityPercentage: effectiveYears * 0.01,
          mraReduction: 0,
          monthlyAnnuity: (highThreeAverage * effectiveYears * 0.01) / 12,
          annualAnnuity: highThreeAverage * effectiveYears * 0.01,
          yearsToWait: 62 - age,
        };
      }
    }
  } else if (type === 'deferred' && effectiveYears >= 5) {
    isEligible = true;
    description = 'Deferred retirement (payable at 62)';
  }

  let annuityPct = 0;
  if (isEligible) {
    if (type === 'mra+10' || (type === 'deferred' && age < 65)) {
      annuityPct = effectiveYears * 0.01;
    } else {
      const first20 = Math.min(20, effectiveYears) * 0.017;
      const over20 = Math.max(0, effectiveYears - 20) * 0.01;
      annuityPct = first20 + over20;
    }
  }

  const baseAnnuity = highThreeAverage * annuityPct;
  const finalAnnuity = baseAnnuity * (1 - mraReduction);
  const monthlyAnnuity = finalAnnuity / 12;
  const isSupplementEligible =
    isEligible &&
    (type === 'immediate' || type === 'tera') &&
    age < 62 &&
    ((age >= 50 && effectiveYears >= 20) || effectiveYears >= 25 || (type === 'tera' && teraEligible));

  let monthlySupplemental = 0,
    supplementalAnnuity = 0;
  if (isSupplementEligible) {
    const cg = DOM.fsGrade.value;
    const cs = parseInt(DOM.fsStep.value, 10);
    monthlySupplemental = calculateEnhancedSupplemental(cg, cs, effectiveYears, age);
    supplementalAnnuity = monthlySupplemental * 12;
  }

  return {
    isEligible,
    description,
    monthlyAnnuity,
    annualAnnuity: finalAnnuity,
    mraAge,
    mraReduction,
    sickLeaveDuration,
    serviceDuration,
    supplementalAnnuity,
    monthlySupplemental,
    age62Comparison,
    isSupplementEligible,
  };
}

function calculateFSPSAnnuity(
  fsGrade,
  fsStep,
  yearsService,
  age,
  highThreeYears,
  post,
  teraEligible,
  teraYearsRequired,
  teraAgeRequired,
  sickLeaveDuration,
  serviceDuration
) {
  const currentSalary = SALARY_TABLES[fsGrade].steps[parseInt(fsStep, 10) - 1];
  const postAllowanceRate = POST_ALLOWANCES[post] / 100;
  const adjustedSalary = currentSalary * (1 + postAllowanceRate);
  const highThreeAverage =
    highThreeYears.some((s) => s > 0)
      ? highThreeYears.reduce((sum, x) => sum + x, 0) / 3
      : adjustedSalary;

  const scenarios = {
    immediate: calculateScenario(highThreeAverage, yearsService, age, 'immediate', false, teraEligible, teraYearsRequired, teraAgeRequired, sickLeaveDuration, serviceDuration),
    tera: calculateScenario(highThreeAverage, yearsService, age, 'tera', false, teraEligible, teraYearsRequired, teraAgeRequired, sickLeaveDuration, serviceDuration),
    mraPlusTen: calculateScenario(highThreeAverage, yearsService, age, 'mra+10', false, teraEligible, teraYearsRequired, teraAgeRequired, sickLeaveDuration, serviceDuration),
    deferred: calculateScenario(highThreeAverage, yearsService, age, 'deferred', false, teraEligible, teraYearsRequired, teraAgeRequired, sickLeaveDuration, serviceDuration),
  };

  const best = Object.values(scenarios).reduce((a, c) => (c.monthlyAnnuity > a.monthlyAnnuity ? c : a));

  return {
    ...best,
    scenarios,
    baseSalary: currentSalary,
    postAllowanceRate,
    adjustedSalary,
    highThreeAverage,
    serviceDuration,
  };
}

function calculateSeverance(fsGrade, fsStep, yearsService, age, post, annualLeaveBalance, serviceDuration) {
  const table = SALARY_TABLES[fsGrade];
  const baseSalary = table.steps[parseInt(fsStep, 10) - 1];
  const monthlyPay = baseSalary / 12;
  const effectiveYears = serviceDuration ? serviceDuration.totalYears : yearsService;
  let severancePay = Math.min(monthlyPay * effectiveYears, baseSalary);
  const currentYear = new Date().getFullYear();
  const installment = severancePay / 3;
  const installments = [1, 2, 3].map((n) => ({
    amount: installment,
    date: new Date(currentYear + n, 0, 1).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
  }));
  const hourlyRate = baseSalary / 2087;
  const annualLeavePayout = hourlyRate * annualLeaveBalance;
  return {
    baseSalary,
    monthlyPay,
    severanceAmount: severancePay,
    installments,
    hourlyRate,
    annualLeaveBalance,
    annualLeavePayout,
    serviceDuration,
    yearsOfService: effectiveYears,
  };
}

function calculateHealthInsurance(planKey, coverageType, homeState) {
  try {
    const rates = HEALTH_INSURANCE_RATES[planKey][coverageType];
    const cobraMonthly = rates.cobra;
    const acaFactor = STATE_ACA_FACTORS[homeState] || STATE_ACA_FACTORS.default;
    const totalMonthlyPremium = cobraMonthly / 1.02;
    const acaMonthly = Math.round(totalMonthlyPremium * acaFactor);
    const planOption = planKey.includes('-') ? planKey.split('-')[1] : 'standard';
    const deductible = ACA_COVERAGE_FACTORS[coverageType].deductible[planOption];
    const outOfPocket = ACA_COVERAGE_FACTORS[coverageType].outOfPocket[planOption];
    const cobraCost = {
      monthly: cobraMonthly,
      duration: 18,
      totalCost: cobraMonthly * 18,
    };
    const acaEstimate = { monthly: acaMonthly, deductible, outOfPocket, totalPremiumBase: totalMonthlyPremium };
    const recommendations = generateHealthInsuranceRecommendations(rates, cobraCost, acaEstimate, planOption);
    return { fehb: rates, cobra: cobraCost, aca: acaEstimate, homeState, recommendations };
  } catch (err) {
    log('Health calc error', err);
    return { error: err.message, fehb: {}, cobra: {}, aca: {}, recommendations: [] };
  }
}

function generateHealthInsuranceRecommendations(fehbRates, cobraCost, acaEstimate, planOption) {
  const recs = [];
  recs.push(
    cobraCost.monthly < acaEstimate.monthly
      ? 'COBRA may be more cost-effective initially.'
      : 'ACA marketplace plans may offer lower premiums.'
  );
  if (planOption === 'high') recs.push('Your high-option suggests comprehensive coverage.');
  else recs.push('Your plan preference suggests lower premiums.');
  recs.push('Compare plan networks.');
  recs.push('Consider upcoming medical needs.');
  recs.push('Check for ACA premium tax credits.');
  return recs;
}


// ======== UI & Form Management ========

class FormManager {

   else if (step >= 11) {
            baseSalary = SFS_RANKS['Minister Counselor'].salaries[step];
        } else {
            baseSalary = SFS_RANKS['Counselor'].salaries[step];
        }
    } else {
        baseSalary = SALARY_TABLES[grade].steps[parseInt(step) - 1];
  
   else if (step >= 11) {
                baseSalary = SFS_RANKS['Minister Counselor'].salaries[step];
            } else {
                baseSalary = SFS_RANKS['Counselor'].salaries[step];
  }

  static getFormData() {
  }
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

  static init() {
    const f = DOM.form;
    f.removeEventListener('submit', FormManager.onSubmit);
    f.addEventListener('submit', FormManager.onSubmit);
    f.removeEventListener('reset', FormManager.onReset);
    f.addEventListener('reset', FormManager.onReset);
  }

  static onSubmit(e) {
    e.preventDefault();
    UIManager.clearError();
    UIManager.showLoading();
    try {
      const data = FormManager.collectFormData();
      FormValidator.validate(data);
      const results = Calculator.calculateAll(data);
      Calculator.updateResults(results);
      UIManager.showResults();
    } catch (err) {
      ErrorHandler.handle(err, 'form submit');
    } finally {
      UIManager.hideLoading();
    }
  }

  static onReset() {
    UIManager.clearError();
    document.querySelectorAll('.results-container').forEach((c) => (c.innerHTML = ''));
  }

  static collectFormData() {
    const serviceDuration = DOM.serviceComputationDate.value
      ? calculateServiceDuration(DOM.serviceComputationDate.value)
      : null;
    const yearsService = serviceDuration ? serviceDuration.totalYears : parseInt(DOM.yearsService.value, 10);
    const sick = calculateSickLeaveServiceDuration(parseFloat(DOM.sickLeaveBalance.value) || 0);
    return {
      fsGrade: DOM.fsGrade.value,
      fsStep: DOM.fsStep.value,
      yearsService,
      serviceDuration,
      sickLeaveDuration: sick,
      age: parseInt(DOM.age.value, 10),
      currentPost: 'Washington, DC',
      currentPlan: DOM.currentPlan.value,
      coverageType: DOM.coverageType.value,
      state: DOM.state.value,
      teraEligible: DOM.teraEligible.value,
      teraYears: DOM.teraYears.value,
      teraAge: DOM.teraAge.value,
      salaryYear1: parseInt(DOM.salaryYear1.value, 10) || 0,
      salaryYear2: parseInt(DOM.salaryYear2.value, 10) || 0,
      salaryYear3: parseInt(DOM.salaryYear3.value, 10) || 0,
      annualLeaveBalance: parseInt(DOM.annualLeaveBalance.value, 10) || 0,
    };
  }
}

class ErrorHandler {
  static handle(error, context = '') {
    log('Error in', context, error);
    UIManager.showError(error.message || 'An error occurred');
  }
}

class ValidationError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'ValidationError';
  }
}
class CalculationError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'CalculationError';
  }
}

class UIManager {
  static showLoading() {
    if (DOM.loading) DOM.loading.style.display = 'flex';
  }
  static hideLoading() {
    if (DOM.loading) DOM.loading.style.display = 'none';
  }
  static showError(msg) {
    if (!DOM.error) return;
    DOM.error.textContent = msg;
    DOM.error.style.display = 'block';
  }
  static clearError() {
    if (!DOM.error) return;
    DOM.error.textContent = '';
    DOM.error.style.display = 'none';
  }
  static showResults() {
    document.querySelector('.results-column').style.display = 'block';
  }
}

class FormValidator {
  static validate(data) {
    const errs = [];
    if (!data.fsGrade) errs.push('Grade required');
    if (!data.fsStep) errs.push('Step required');
    if (!data.yearsService) errs.push('Years of Service required');
    if (!data.age) errs.push('Age required');
    if (!data.currentPlan) errs.push('Plan required');
    if (!data.coverageType) errs.push('Coverage type required');
    if (!data.state) errs.push('Home state required');
    if (errs.length) throw new ValidationError(errs.join(', '));
    return true;
  }
}

class TabManager {
  static setupTabNavigation() {
    DOM.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.activateTab(btn.getAttribute('data-tab')));
    });
    this.activateTab('severance');
  }
  static activateTab(tabId) {
    document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach((b) => b.classList.remove('active'));
    const btn = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    const content = document.getElementById(tabId);
    if (btn && content) {
      btn.classList.add('active');
      content.classList.add('active');
    }
  }
}

class AccessibilityManager {
  static initialize() {
    document.querySelectorAll('.form-control').forEach((ctrl) => {
      const label = ctrl.closest('.form-group').querySelector('label');
      if (label) ctrl.setAttribute('aria-label', label.textContent);
    });
  }
}

class FormFeedbackManager {
  static initialize() {
    const inputs = DOM.form.querySelectorAll('.form-control[required]');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (input.checkValidity()) input.classList.add('is-valid');
        else input.classList.add('is-invalid');
      });
    });
  }
}

class Calculator {
  static calculateAll(data) {
    const serv = calculateSeverance(
      data.fsGrade,
      data.fsStep,
      data.yearsService,
      data.age,
      data.currentPost,
      data.annualLeaveBalance,
      data.serviceDuration
    );
    const ret = calculateFSPSAnnuity(
      data.fsGrade,
      data.fsStep,
      data.yearsService,
      data.age,
      [data.salaryYear1, data.salaryYear2, data.salaryYear3],
      data.currentPost,
      data.teraEligible === 'yes',
      parseInt(data.teraYears, 10),
      parseInt(data.teraAge, 10),
      data.sickLeaveDuration,
      data.serviceDuration
    );
    const health = calculateHealthInsurance(data.currentPlan, data.coverageType, data.state);
    return { serv, ret, health };
  }

  static updateResults({ serv, ret, health }) {
    // ... implement DOM updates as before, using formatCurrency and log where needed ...
  }
}




// ======== Initialization ========
function initializeApp() {
  FormManager.init();
  TabManager.setupTabNavigation();
  populateYearsOfServiceDropdown();
  populateHighThreeSalaryDropdowns();
  initializeTERADropdowns();
  AccessibilityManager.initialize();
  FormFeedbackManager.initialize();
  updatePlanPrices();
}

document.addEventListener('DOMContentLoaded', initializeApp);

// Function to populate Years of Service dropdown
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
const POST_ALLOWANCES = {
    'Washington, DC': 33.94
};

// Salary Tables Constants
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
        'self': { monthly: 198.89, cobra: 795.54 * 1.02 },
        'self-plus-one': { monthly: 424.01, cobra: 1696.02 * 1.02 },
        'family': { monthly: 494.95, cobra: 1979.78 * 1.02 }
    },
    'FSBP-standard': {
        'self': { monthly: 203.64, cobra: 814.56 * 1.02 },
        'self-plus-one': { monthly: 488.74, cobra: 1954.96 * 1.02 },
        'family': { monthly: 549.35, cobra: 2197.39 * 1.02 }
    },
    'AETNA-direct': {
        'self': { monthly: 179.01, cobra: 716.04 * 1.02 },
        'self-plus-one': { monthly: 398.24, cobra: 1592.96 * 1.02 },
        'family': { monthly: 472.10, cobra: 1888.41 * 1.02 }
    },
    'GEHA-standard': {
        'self': { monthly: 71.40, cobra: 285.60 * 1.02 },
        'self-plus-one': { monthly: 150.83, cobra: 603.31 * 1.02 },
        'family': { monthly: 172.70, cobra: 690.80 * 1.02 }
    },
    'Compass Rose': {
        'self': { monthly: 203.64, cobra: 814.56 * 1.02 },
        'self-plus-one': { monthly: 488.74, cobra: 1954.96 * 1.02 },
        'family': { monthly: 549.35, cobra: 2197.39 * 1.02 }
    }
};

// Add state-specific ACA adjustment factors
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
    const baseSalary = SALARY_TABLES[fsGrade].steps[stepIndex];
    
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

// Add getMRA function before calculateScenario
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
        immediate: calculateScenario(highThreeAverage, effectiveYearsService, age, "immediate", false, teraEligible, teraYearsRequired, teraAgeRequired, sickLeaveServiceDuration, serviceDuration),
        tera: calculateScenario(highThreeAverage, effectiveYearsService, age, "tera", false, teraEligible, teraYearsRequired, teraAgeRequired, sickLeaveServiceDuration, serviceDuration),
        mraPlusTen: calculateScenario(highThreeAverage, effectiveYearsService, age, "mra+10", false, teraEligible, teraYearsRequired, teraAgeRequired, sickLeaveServiceDuration, serviceDuration),
        deferred: calculateScenario(highThreeAverage, effectiveYearsService, age, "deferred", false, teraEligible, teraYearsRequired, teraAgeRequired, sickLeaveServiceDuration, serviceDuration)
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
function calculateHealthInsurance(currentPlanOption, coverageType, homeState) {
    try {
        // Validate inputs
        if (!currentPlanOption || !coverageType || !homeState) {
            throw new Error('Missing required health insurance parameters');
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

function generateHealthInsuranceRecommendations(fehbRates, cobraCosts, acaEstimate, planOption) {
    const recommendations = [];
    
    // Compare COBRA vs ACA costs
    if (cobraCosts.monthly < acaEstimate.monthly) {
        recommendations.push("COBRA coverage may be more cost-effective initially, providing 18 months of your current coverage.");
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
function switchTab(tabId) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Add SFS ranks and salary data
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


// Get form data function
 else {
        calculatedYearsService = yearsServiceInput;
        console.log('Using manually entered years of service:', calculatedYearsService);
    }

    // Calculate additional service time from sick leave (2087 hours = 1 year)
    const sickLeaveYears = sickLeaveBalance / 2087;
    console.log('Additional years from sick leave:', sickLeaveYears);

    return {
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
}

//Handles form submission and prevents default behavior
static async handleFormSubmit(e) {
try {
    e.preventDefault();
    e.stopPropagation();
    
    FormValidator.clearAllErrors();
    UIManager.clearError();
    UIManager.showLoading();

    const formData = FormManager.getFormData();
    console.log('Form Data:', formData); // Debug log

    FormValidator.validateFormData(formData);

    // Calculate all benefits
    const severanceResult = Calculator.calculateSeverance(formData);
    const retirementResult = Calculator.calculateRetirement(formData);
    const healthResult = Calculator.calculateHealth(formData);

    console.log('Health Result:', healthResult); // Debug log

    // Ensure health data is properly structured
    if (healthResult && !healthResult.error) {
        const results = {
            formData: formData,
            severance: severanceResult,
            retirement: retirementResult,
            health: healthResult
        };

        Calculator.updateResults(results);
        UIManager.showResults();
        TabManager.showDefaultTab();
    } else {
        throw new Error(healthResult.error || 'Error calculating health benefits');
    }
    
    return false;
} catch (error) {
    console.error('Error in handleFormSubmit:', error);
    if (error instanceof ValidationError) {
        UIManager.showError(error.message);
    } else {
        ErrorHandler.handleError(error, 'handleFormSubmit');
    }
} finally {
    UIManager.hideLoading();
}
}
}

    // Service Duration Validation Functions
    function validateServiceDuration() {
        try {
            const scdInput = document.getElementById('service-computation-date');
            const yearsServiceInput = document.getElementById('years-service');
            const warningDiv = document.getElementById('service-duration-warning');
            const warningMessage = document.getElementById('service-duration-message');

            if (!scdInput || !yearsServiceInput || !warningDiv || !warningMessage) {
                console.warn('Required elements not found for service duration validation');
                return;
            }

            const scd = scdInput.value;
            const manualYears = parseInt(yearsServiceInput.value) || 0;

            // If no SCD, hide warning and return
            if (!scd) {
                warningDiv.style.display = 'none';
                return;
            }

            // Calculate service duration from SCD
            const serviceDuration = calculateServiceDuration(scd);
            if (!serviceDuration) {
                warningDiv.style.display = 'none';
                return;
            }

            // Compare SCD-calculated duration with manual entry
            const yearDiff = Math.abs(serviceDuration.totalYears - manualYears);
            const monthThreshold = 1/12; // 1 month threshold

            if (yearDiff > monthThreshold) {
                // Format the SCD duration for display
                const scdYears = Math.floor(serviceDuration.totalYears);
                const scdMonths = Math.round((serviceDuration.totalYears - scdYears) * 12);
                
                warningMessage.innerHTML = `SCD calculates to ${scdYears} years, ${scdMonths} months vs. manual entry of ${manualYears} years. SCD will be used.`;
                warningDiv.style.display = 'block';
            } else {
                warningDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('Error in validateServiceDuration:', error);
        }
    }

    function clearSCD() {
        const scdInput = document.getElementById('service-computation-date');
        const warningDiv = document.getElementById('service-duration-warning');
        
        if (scdInput) {
            scdInput.value = '';
        }
        if (warningDiv) {
            warningDiv.style.display = 'none';
        }
        validateServiceDuration(); // Re-validate after clearing
    }
// ... existing code ...
// Form submission and results handling
class Calculator {
    static initialize() {
        try {
            this.setupFormHandlers();
            this.addTouchSupport();  // Added touch support for mobile devices

            // Set Washington, DC as default post if no value is selected
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

    static setupFormHandlers() {
        if (!calculatorForm) return;

        // Set up the form submission handler
        calculatorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                FormValidator.clearAllErrors();
                UIManager.showLoading();
                UIManager.clearError();

                const formData = this.FormManager.getFormData();
                FormValidator.validateFormData(formData);

                const results = {
                    formData: formData,
                    severance: this.calculateSeverance(formData),
                    retirement: this.calculateRetirement(formData),
                    health: this.calculateHealth(formData)
                };

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

     else {
            calculatedYearsService = yearsServiceInput;
            console.log('Using manually entered years of service:', calculatedYearsService);
        }

        // Calculate additional service time from sick leave (2087 hours = 1 year)
        const sickLeaveYears = sickLeaveBalance / 2087;
        console.log('Additional years from sick leave:', sickLeaveYears);

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

    static calculateRetirement(formData) {
        console.log('Calculating Retirement with:', formData);
        
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
            this.updateRetirementResults(retirementResults, results.retirement, results.formData, results.health);
        }

        // Update health results
        const healthResults = document.getElementById('health-results');
        if (healthResults && results.health) {
            this.updateHealthResults(healthResults, results.health);
        }
    }

    static updateSeveranceResults(container, severance) {
        if (!container || !severance) {
            console.warn('Missing required parameters for updateSeveranceResults');
            return;
        }

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
                        <p><strong>Note:</strong> Severance pay policy is unclear if calculations use base salary or salary adjusted with locality pay. This estimate uses base salary to avoid possible overestimation.</p>
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

    static updateHealthResults(container, health) {
        if (!container || !health) {
            console.warn('Missing required parameters for updateHealthResults');
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
                            <th>Total Monthly Premium (Employee + Employer)</th>
                            <td>${Utils.formatCurrency(health.aca.totalPremiumBase)}</td>
                        </tr>
                        <tr>
                            <th>COBRA Monthly Premium</th>
                            <td>${Utils.formatCurrency(health.cobra.monthly)} (Total Premium + 2% Admin Fee)</td>
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

    static updateRetirementResults(container, retirement, formData, health) {
        if (!container || !retirement) {
            console.warn('Missing required parameters for updateRetirementResults');
            return;
        }

        // Get monthly health premium if available
        const monthlyHealthPremium = health && health.fehb ? health.fehb.monthly : 0;
        console.log('Monthly health premium for retirement calculation:', monthlyHealthPremium);

        // Format service duration in years and months
        function formatServiceDuration(years) {
            if (!years) return '0 years';
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

        const serviceDurationText = retirement.serviceDuration ? 
            formatServiceDuration(retirement.serviceDuration.totalYears) : 
            formatServiceDuration(formData.yearsService);

        const sickLeaveText = formData.sickLeaveYears ? 
            `${(formData.sickLeaveYears * 2087).toFixed(0)} hours (${formatServiceDuration(formData.sickLeaveYears)})` : 
            '';

        const totalServiceText = formatServiceDuration(formData.yearsService + (formData.sickLeaveYears || 0));

        container.innerHTML = `
        <div class="retirement-options">
            <div class="option-card">
                <h6>Service and Salary Summary</h6>
                <div class="comparison-table">
                    <table>
                        <tr>
                            <th>High-Three Average Salary</th>
                            <td>${Utils.formatCurrency(retirement.highThreeAverage)}</td>
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
                            <td>${formData.age} years</td>
                        </tr>
                        <tr>
                            <th>Minimum Retirement Age (MRA)</th>
                            <td>${retirement.scenarios.mraPlusTen.mraAge} years</td>
                        </tr>
                    </table>
                </div>
            </div>

            <h3>Available Retirement Options</h3>
            ${Object.entries(retirement.scenarios)
                .filter(([_, scenario]) => scenario.isEligible)
                .map(([type, scenario]) => {
                    let eligibilityRequirements = '';
                    let citation = '';
                    let policyNotes = '';
                    
                    switch(type) {
                        case 'immediate':
                            eligibilityRequirements = `
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
                                </ul>`;
                            policyNotes = `
                                <div class="alert alert-info" style="margin-top: 10px; padding: 10px; background-color: #e2e8f0; border-radius: 4px;">
                                    <strong>Policy Notes:</strong>
                                    <ul>
                                        <li>Eligible for FEHB and FEGLI coverage in retirement</li>
                                        <li>Special Retirement Supplement provides additional income until age 62</li>
                                        <li>No reduction in annuity regardless of age</li>
                                    </ul>
                                </div>`;
                            citation = '<p class="citation">Source: Foreign Service Act of 1980, as amended, 22 U.S.C. 4051-4052; 5 U.S.C. Chapter 84</p>';
                            break;
                        case 'mraPlusTen':
                            eligibilityRequirements = `
                                <h6>Eligibility Requirements</h6>
                                <ul>
                                    <li>Minimum Retirement Age with 10+ years of service</li>
                                    <li>MRA varies from 55-57 based on birth year</li>
                                </ul>
                                <h6>Important Details</h6>
                                <ul>
                                    <li>Uses 1% multiplier for all years of service (as of 2018 GTM/RET policy)</li>
                                    <li>Reduced 5% per year if taken before age 62</li>
                                    <li>Can postpone to reduce or eliminate reduction</li>
                                </ul>`;
                            policyNotes = `
                                <div class="alert alert-info" style="margin-top: 10px; padding: 10px; background-color: #e2e8f0; border-radius: 4px;">
                                    <strong>Policy Notes:</strong>
                                    <ul>
                                        <li>As of 2018, GTM/RET changed the multiplier from 1.7% to 1% for all years</li>
                                        <li>Postponing benefits can help avoid age reduction</li>
                                        <li>FEHB eligibility only if retirement is immediate (meeting age requirements)</li>
                                        <li>No Special Retirement Supplement available</li>
                                    </ul>
                                </div>`;
                            citation = '<p class="citation">Source: 5 U.S.C. §8412(b)(1) and §8415; GTM/RET Policy Change 2018</p>';
                            break;
                        case 'deferred':
                            eligibilityRequirements = `
                                <h6>Eligibility Requirements</h6>
                                <ul>
                                    <li>5+ years of service</li>
                                    <li>Benefits begin at age 62 (or age 65 for enhanced benefit)</li>
                                </ul>
                                <h6>Important Details</h6>
                                <ul>
                                    <li>Uses 1% multiplier if starting benefits before age 65</li>
                                    <li>Enhanced 1.7% multiplier available if waiting until age 65</li>
                                    <li>No Special Retirement Supplement</li>
                                    <li>No retiree health benefits</li>
                                </ul>`;
                            policyNotes = `
                                <div class="alert alert-info" style="margin-top: 10px; padding: 10px; background-color: #e2e8f0; border-radius: 4px;">
                                    <strong>Policy Notes:</strong>
                                    <ul>
                                        <li>Cannot maintain FEHB or FEGLI into retirement</li>
                                        <li>Must wait until at least age 62 to begin receiving benefits</li>
                                        <li>Enhanced 1.7% multiplier only available at age 65 or later</li>
                                        <li>No cost-of-living adjustments until benefits begin</li>
                                    </ul>
                                </div>`;
                            citation = '<p class="citation">Source: 5 U.S.C. §8413(b) and §8415</p>';
                            break;
                        case 'tera':
                            eligibilityRequirements = `
                                <h6>Eligibility Requirements</h6>
                                <ul>
                                    <li>Special authority when offered</li>
                                    <li>Minimum age ${formData.teraAge} with ${formData.teraYears} years of service</li>
                                    <li>Uses same computation as regular retirement</li>
                                </ul>`;
                            policyNotes = `
                                <div class="alert alert-info" style="margin-top: 10px; padding: 10px; background-color: #e2e8f0; border-radius: 4px;">
                                    <strong>Policy Notes:</strong>
                                    <ul>
                                        <li>Eligible for FEHB and FEGLI coverage in retirement</li>
                                        <li>Special Retirement Supplement available until age 62</li>
                                        <li>Uses enhanced 1.7% multiplier for first 20 years</li>
                                        <li>No age reduction in annuity</li>
                                    </ul>
                                </div>`;
                            citation = '<p class="citation">Source: Foreign Service Act of 1980, as amended, 22 U.S.C. 4051-4052</p>';
                            break;
                    }
                    
                    return `
                        <div class="option-card">
                            <h6>${type === 'mraPlusTen' ? 'MRA+10' : type === 'tera' ? 'V/TERA' : type.charAt(0).toUpperCase() + type.slice(1)} Retirement</h6>
                            <div class="option-details">
                                ${eligibilityRequirements}
                                <div class="calculation-details">
                                    <p><strong>Monthly Benefit:</strong> ${Utils.formatCurrency(scenario.monthlyAnnuity)}</p>
                                    <p><strong>Annual Benefit:</strong> ${Utils.formatCurrency(scenario.annualAnnuity)}</p>

                                    <div style="margin-top: 1rem;">
                                        <p><strong>Net Monthly Annuity</strong></p>
                                        
                                        <div style="margin: 1rem 0;">
                                            <p><strong>With Maximum Survivor Benefit (10%)</strong></p>
                                            <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                                                <tr>
                                                    <td>Gross Monthly Annuity</td>
                                                    <td style="text-align: right;">${Utils.formatCurrency(scenario.monthlyAnnuity)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Survivor Benefit (10%)</td>
                                                    <td style="text-align: right;">-${Utils.formatCurrency(scenario.monthlyAnnuity * 0.10)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Health Insurance Premium</td>
                                                    <td style="text-align: right;">-${Utils.formatCurrency(health?.fehb?.monthly || 0)}</td>
                                                </tr>
                                                <tr style="border-top: 1px solid #e2e8f0;">
                                                    <td><strong>Net Monthly Annuity</strong></td>
                                                    <td style="text-align: right;"><strong>${Utils.formatCurrency(scenario.monthlyAnnuity - (scenario.monthlyAnnuity * 0.10) - (health?.fehb?.monthly || 0))}</strong></td>
                                                </tr>
                                            </table>
                                        </div>

                                        <div style="margin: 1rem 0;">
                                            <p><strong>With Reduced Survivor Benefit (5%)</strong></p>
                                            <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                                                <tr>
                                                    <td>Gross Monthly Annuity</td>
                                                    <td style="text-align: right;">${Utils.formatCurrency(scenario.monthlyAnnuity)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Survivor Benefit (5%)</td>
                                                    <td style="text-align: right;">-${Utils.formatCurrency(scenario.monthlyAnnuity * 0.05)}</td>
                                                </tr>
                                                <tr>
                                                    <td>Health Insurance Premium</td>
                                                    <td style="text-align: right;">-${Utils.formatCurrency(health?.fehb?.monthly || 0)}</td>
                                                </tr>
                                                <tr style="border-top: 1px solid #e2e8f0;">
                                                    <td><strong>Net Monthly Annuity</strong></td>
                                                    <td style="text-align: right;"><strong>${Utils.formatCurrency(scenario.monthlyAnnuity - (scenario.monthlyAnnuity * 0.05) - (health?.fehb?.monthly || 0))}</strong></td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <p style="margin-top: 0.5rem;">
                                            <em>Note: Maximum survivor benefit provides 50% of your full annuity to your survivor, while reduced benefit provides 25%. Actual deductions may vary based on your elections.</em>
                                        </p>
                                    </div>
                                </div>
                                ${policyNotes}
                                ${citation}
                            </div>
                        </div>`;
                }).join('')}
        </div>

        <div class="retirement-notes">
            <h5>Important Notes</h5>
            <ul>
                <li>All calculations are estimates based on current policy and provided information</li>
                <li>Actual benefits may vary based on final service computation and other factors</li>
                <li>Special Retirement Supplement (SRS) eligibility and calculation:
                    <ul>
                        <li>Available for immediate retirement and V/TERA before age 62</li>
                        <li>Must meet one of these criteria:
                            <ul>
                                <li>Age 50+ with 20+ years of service</li>
                                <li>Any age with 25+ years of service</li>
                                <li>V/TERA retirement meeting minimum age (43) and service (10 years) requirements</li>
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
                        <li>V/TERA: Eligible if covered for 5 years before retirement</li>
                    </ul>
                </li>
                <li>Consider consulting with HR for official calculations and guidance</li>
            </ul>
        </div>`;
    }

// Function to update plan prices based on selected enrollment type
static updatePlanPrices() {
    const planSelect = document.getElementById('current-plan');
    const coverageTypeSelect = document.getElementById('coverage-type');
    
    if (!planSelect || !coverageTypeSelect) {
        console.warn('Required form elements not found');
        return;
    }

    const selectedPlan = planSelect.value;
    if (!selectedPlan) {
        coverageTypeSelect.disabled = true;
        return;
    }

    coverageTypeSelect.disabled = false;

    // Get rates directly from HEALTH_INSURANCE_RATES
    const planRates = window.HEALTH_INSURANCE_RATES[selectedPlan];
    if (!planRates) {
        console.warn('No rates found for selected plan:', selectedPlan);
        return;
    }

    const coverageType = coverageTypeSelect.value;
    const rateInfo = planRates[coverageType];

    if (!rateInfo || typeof rateInfo.monthly !== 'number') {
        console.warn('No rate found for coverage type:', coverageType);
        return;
    }
} catch (error) {
    console.error('Error in updatePlanPrices:', error);
}
};

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

// Initialize health insurance form elements
document.addEventListener('DOMContentLoaded', function() {
    try {
    const planSelect = document.getElementById('current-plan');
    const coverageTypeSelect = document.getElementById('coverage-type');
    
    if (planSelect && coverageTypeSelect) {
        coverageTypeSelect.disabled = !planSelect.value;
        planSelect.addEventListener('change', function() {
        updatePlanPrices();
        coverageTypeSelect.disabled = !this.value;
        });
        coverageTypeSelect.addEventListener('change', updatePlanPrices);
        updatePlanPrices();
    } else {
        console.warn('Health insurance form elements not found:', {
        planSelect: !!planSelect,
        coverageTypeSelect: !!coverageTypeSelect
        });
    }
    } catch (error) {
    console.warn('Error initializing health insurance form elements:', error);
    }
});

// Additional optional inputs handling
    document.addEventListener('DOMContentLoaded', function() {
        const serviceComputationDateInput = document.getElementById('service-computation-date');
        const sickLeaveBalanceInput = document.getElementById('sick-leave-balance');
    const annualLeaveBalanceInput = document.getElementById('annual-leave-balance');

        function handleOptionalInputs() {
            const serviceComputationDate = serviceComputationDateInput.value || 'N/A';
            const sickLeaveBalance = parseFloat(sickLeaveBalanceInput.value) || 0;
    const annualLeaveBalance = parseFloat(annualLeaveBalanceInput.value) || 0;
    // Use these values in calculations as needed
        }

    if(serviceComputationDateInput) serviceComputationDateInput.addEventListener('input', handleOptionalInputs);
    if(sickLeaveBalanceInput) sickLeaveBalanceInput.addEventListener('input', handleOptionalInputs);
    if(annualLeaveBalanceInput) annualLeaveBalanceInput.addEventListener('input', handleOptionalInputs);
    });

    document.addEventListener('DOMContentLoaded', function() {
        const annualLeaveBalanceInput = document.getElementById('annual-leave-balance');
        const annualLeavePayoutSummary = document.getElementById('annual-leave-payout-summary');

        function calculateAnnualLeavePayout(baseSalary, postAllowanceRate) {
            const annualLeaveInput = document.getElementById('annual-leave');
            const annualLeaveBalance = annualLeaveInput && annualLeaveInput.value ? 
                parseFloat(annualLeaveInput.value) : 
                (parseFloat(annualLeaveBalanceInput.value) || 0);
            const hourlyRate = (baseSalary * (1 + postAllowanceRate)) / 2087; // Standard federal work year hours
            const payout = hourlyRate * annualLeaveBalance;
            return payout.toFixed(2);
        }

        if (annualLeaveBalanceInput && annualLeavePayoutSummary) {
            annualLeaveBalanceInput.addEventListener('input', function() {
                const baseSalary = parseFloat(document.getElementById('base-salary').value) || 0;
                const postAllowanceRate = parseFloat(document.getElementById('post-allowance-rate').value) || 0;
                const payout = calculateAnnualLeavePayout(baseSalary, postAllowanceRate);
                annualLeavePayoutSummary.innerHTML = `Annual Leave Payout: $${payout}`;
            });

            const annualLeaveInput = document.getElementById('annual-leave');
            if (annualLeaveInput) {
                annualLeaveInput.addEventListener('input', function() {
                    const baseSalary = parseFloat(document.getElementById('base-salary').value) || 0;
                    const postAllowanceRate = parseFloat(document.getElementById('post-allowance-rate').value) || 0;
                    const payout = calculateAnnualLeavePayout(baseSalary, postAllowanceRate);
                    annualLeavePayoutSummary.innerHTML = `Annual Leave Payout: $${payout}`;
                });
            }
        }
    });

    function updatePlanPrices() {
        try {
            const planSelect = document.getElementById('current-plan');
            const coverageTypeSelect = document.getElementById('coverage-type');
            
            if (!planSelect || !coverageTypeSelect) {
                console.warn('Required form elements not found');
                return;
            }

            const selectedPlan = planSelect.value;
            if (!selectedPlan) {
                coverageTypeSelect.disabled = true;
                return;
            }

            coverageTypeSelect.disabled = false;

            // Get rates directly from HEALTH_INSURANCE_RATES
            const planRates = window.HEALTH_INSURANCE_RATES[selectedPlan];
            if (!planRates) {
                console.warn('No rates found for selected plan:', selectedPlan);
                return;
            }

            const coverageType = coverageTypeSelect.value;
            const rateInfo = planRates[coverageType];

            if (!rateInfo || typeof rateInfo.monthly !== 'number') {
                console.warn('No rate found for coverage type:', coverageType);
                return;
            }
        } catch (error) {
            console.error('Error in updatePlanPrices:', error);
        }
    }

    // Initialize form elements with proper timing
    document.addEventListener('DOMContentLoaded', function() {
        try {
            // Log the initialization attempt
            console.log('Initializing health insurance form elements...');
            
            const planSelect = document.getElementById('current-plan');
            const coverageTypeSelect = document.getElementById('coverage-type');
            
            // Log element status
            console.log('Form elements initialization status:', {
                'current-plan': planSelect ? 'found' : 'missing',
                'coverage-type': coverageTypeSelect ? 'found' : 'missing'
            });

            if (planSelect && coverageTypeSelect) {
                coverageTypeSelect.disabled = !planSelect.value;
                planSelect.addEventListener('change', function() {
                    updatePlanPrices();
                    coverageTypeSelect.disabled = !this.value;
                });
                coverageTypeSelect.addEventListener('change', updatePlanPrices);
                updatePlanPrices();
            } else {
                console.warn('Health insurance form elements not found during initialization:', {
                    planSelect: !!planSelect,
                    coverageTypeSelect: !!coverageTypeSelect
                });
            }
        } catch (error) {
            console.warn('Error initializing health insurance form elements:', error);
        }
    });

// Modify the calculate function to show Severance tab after calculation
async function calculate(event) {
    event.preventDefault();
    
    try {
        // ... existing calculation code ...
        
        // Show results container and switch to Severance tab
        const resultsContainer = document.querySelector('.results-container');
        if (resultsContainer) {
            resultsContainer.classList.add('visible');
        }
        
        // Show Severance tab by default after calculation
        TabManager.showDefaultTab();
        
    } catch (error) {
        console.error('Error in calculate:', error);
        // ... existing error handling ...
    }
}

// Initialize form handling when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    FormManager.init();
        // Ensure all classes are defined first
        if (typeof Calculator !== 'undefined' && 
            typeof FormManager !== 'undefined' && 
            typeof UIManager !== 'undefined') {
            FormManager.init();

    // Additional iOS-specific form handling
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {

        // Add touch event handling for iOS
        const submitButton = calculatorForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.addEventListener('touchend', (e) => {
                e.preventDefault(); // Prevent default touch behavior
                e.stopPropagation();
                FormManager.handleFormSubmit(e);
                return false;
            }, { passive: false }); // Set passive to false for iOS
        }
        
        // Prevent default form behavior on iOS
        calculatorForm.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'BUTTON' && e.target.type === 'submit') {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Handle iOS keyboard done button
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

// Initialize tab navigation when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    TabManager.setupTabNavigation();
});

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

// Function to update step dropdown visibility based on grade
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

// Add event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set up grade change listener
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
});

// Function to update step dropdown visibility based on grade