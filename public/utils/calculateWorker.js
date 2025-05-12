// Web Worker for Dashboard Calculations
// Handles heavy data processing to avoid blocking the main thread

// Handle incoming messages
self.onmessage = function(e) {
  const { action, data } = e.data;
  
  try {
    let result;
    
    switch (action) {
      case 'calculateStats':
        result = calculateStats(data);
        break;
      case 'calculateEmployeeTypes':
        result = calculateEmployeeTypes(data);
        break;
      case 'calculateGenderData':
        result = calculateGenderData(data);
        break;
      case 'calculateAgeData':
        result = calculateAgeData(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Send result back to main thread
    self.postMessage(result);
  } catch (error) {
    // Send error back to main thread
    self.postMessage({ error: error.message });
  }
};

/**
 * Calculate summary statistics from employee data
 */
function calculateStats(employees) {
  if (!employees || !Array.isArray(employees)) {
    return { total: 0, active: 0, onLeave: 0, retiring: 0 };
  }
  
  const now = new Date();
  const thisYear = now.getFullYear();
  
  // Calculate stats
  const total = employees.length;
  const active = employees.filter(emp => emp.status === 'active').length;
  const onLeave = employees.filter(emp => emp.status === 'cuti').length;
  
  // Get retirement year and calculate retiring this year
  const retiring = employees.filter(emp => {
    if (!emp.retirementDate) return false;
    const retirementYear = new Date(emp.retirementDate).getFullYear();
    return retirementYear === thisYear;
  }).length;
  
  return { total, active, onLeave, retiring };
}

/**
 * Calculate distribution of employee types (PNS, PPPK, NON ASN)
 */
function calculateEmployeeTypes(employees) {
  if (!employees || !Array.isArray(employees)) {
    return { pns: 0, pppk: 0, nonAsn: 0 };
  }
  
  const counts = { pns: 0, pppk: 0, nonAsn: 0 };
  
  employees.forEach(emp => {
    if (emp.employeeType === 'PNS') {
      counts.pns++;
    } else if (emp.employeeType === 'PPPK') {
      counts.pppk++;
    } else {
      counts.nonAsn++;
    }
  });
  
  return counts;
}

/**
 * Calculate gender distribution (Male/Female)
 */
function calculateGenderData(employees) {
  if (!employees || !Array.isArray(employees)) {
    return { male: 0, female: 0 };
  }
  
  const counts = { male: 0, female: 0 };
  
  employees.forEach(emp => {
    if (emp.gender === 'L') {
      counts.male++;
    } else if (emp.gender === 'P') {
      counts.female++;
    }
  });
  
  return counts;
}

/**
 * Calculate age distribution by range
 */
function calculateAgeData(employees) {
  if (!employees || !Array.isArray(employees)) {
    return { 
      ranges: ['18-25', '26-35', '36-45', '46-55', '56+'],
      counts: [0, 0, 0, 0, 0]
    };
  }
  
  const ageRanges = [
    { min: 18, max: 25 },
    { min: 26, max: 35 },
    { min: 36, max: 45 },
    { min: 46, max: 55 },
    { min: 56, max: 100 }
  ];
  
  const counts = [0, 0, 0, 0, 0];
  const currentYear = new Date().getFullYear();
  
  employees.forEach(emp => {
    if (!emp.birthDate) return;
    
    // Calculate age
    const birthYear = new Date(emp.birthDate).getFullYear();
    const age = currentYear - birthYear;
    
    // Count by age range
    for (let i = 0; i < ageRanges.length; i++) {
      if (age >= ageRanges[i].min && age <= ageRanges[i].max) {
        counts[i]++;
        break;
      }
    }
  });
  
  return {
    ranges: ['18-25', '26-35', '36-45', '46-55', '56+'],
    counts
  };
}
