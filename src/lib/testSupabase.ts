import { supabase } from './supabase';

// Helper functions for manual testing of CRUD operations

/**
 * Tests creating a new employee record in Supabase
 */
export async function testCreateEmployee(employeeData: any) {
  console.log('Testing CREATE operation for employee...');
  try {
    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select();

    if (error) {
      console.error('CREATE test failed:', error.message);
      return { success: false, error };
    }

    console.log('CREATE test succeeded:', data);
    return { success: true, data };
  } catch (err) {
    console.error('CREATE test encountered an exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Tests reading employee records from Supabase
 */
export async function testReadEmployees() {
  console.log('Testing READ operation for employees...');
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');

    if (error) {
      console.error('READ test failed:', error.message);
      return { success: false, error };
    }

    console.log(`READ test succeeded: Retrieved ${data.length} employees`);
    return { success: true, data };
  } catch (err) {
    console.error('READ test encountered an exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Tests updating an employee record in Supabase
 */
export async function testUpdateEmployee(id: string, updates: any) {
  console.log(`Testing UPDATE operation for employee with ID ${id}...`);
  try {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('UPDATE test failed:', error.message);
      return { success: false, error };
    }

    console.log('UPDATE test succeeded:', data);
    return { success: true, data };
  } catch (err) {
    console.error('UPDATE test encountered an exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Tests deleting an employee record from Supabase
 */
export async function testDeleteEmployee(id: string) {
  console.log(`Testing DELETE operation for employee with ID ${id}...`);
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('DELETE test failed:', error.message);
      return { success: false, error };
    }

    console.log('DELETE test succeeded');
    return { success: true };
  } catch (err) {
    console.error('DELETE test encountered an exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Tests leave-related CRUD operations in Supabase
 */
export async function testLeaveOperations() {
  console.log('Testing CRUD operations for leave data...');
  
  // Test data
  const testLeave = {
    employeeId: '1',
    employeeName: 'Test Employee',
    leaveType: 'Tahunan',
    duration: 5,
    startDate: '2025-05-15',
    endDate: '2025-05-21',
    reason: 'Vacation',
    status: 'Pending',
    inputBy: 'admin',
    year: 2025,
    documentRequired: false
  };
  
  // CREATE
  try {
    console.log('Testing CREATE for leave data...');
    const { data: createdLeave, error: createError } = await supabase
      .from('leaves')
      .insert(testLeave)
      .select();
      
    if (createError) {
      console.error('Leave CREATE test failed:', createError.message);
      return { success: false, error: createError };
    }
    
    console.log('Leave CREATE test succeeded:', createdLeave);
    
    if (!createdLeave || createdLeave.length === 0) {
      console.error('No leave data returned after creation');
      return { success: false };
    }
    
    const leaveId = createdLeave[0].id;
    
    // READ
    console.log('Testing READ for leave data...');
    const { data: readLeaves, error: readError } = await supabase
      .from('leaves')
      .select('*')
      .eq('employeeId', '1');
      
    if (readError) {
      console.error('Leave READ test failed:', readError.message);
      return { success: false, error: readError };
    }
    
    console.log(`Leave READ test succeeded: Retrieved ${readLeaves.length} records`);
    
    // UPDATE
    console.log(`Testing UPDATE for leave with ID ${leaveId}...`);
    const { data: updatedLeave, error: updateError } = await supabase
      .from('leaves')
      .update({ reason: 'Updated Reason' })
      .eq('id', leaveId)
      .select();
      
    if (updateError) {
      console.error('Leave UPDATE test failed:', updateError.message);
      return { success: false, error: updateError };
    }
    
    console.log('Leave UPDATE test succeeded:', updatedLeave);
    
    // DELETE
    console.log(`Testing DELETE for leave with ID ${leaveId}...`);
    const { error: deleteError } = await supabase
      .from('leaves')
      .delete()
      .eq('id', leaveId);
      
    if (deleteError) {
      console.error('Leave DELETE test failed:', deleteError.message);
      return { success: false, error: deleteError };
    }
    
    console.log('Leave DELETE test succeeded');
    return { success: true };
  } catch (err) {
    console.error('Leave tests encountered an exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Tests RLS (Row Level Security) in Supabase
 */
export async function testRLS() {
  console.log('Testing Row Level Security (RLS)...');
  
  // Attempt operations that should be restricted by RLS
  try {
    // This will succeed or fail depending on whether the current user has permission
    const { data, error } = await supabase
      .from('employees')
      .insert({
        name: 'RLS Test User',
        nip: '9999999999',
        position: 'Test Position',
        department: 'Security Test',
        status: 'active'
      });
      
    if (error && error.message.includes('row-level security')) {
      console.log('RLS test result: RLS is active and functioning');
      return { success: true, rlsActive: true, error };
    } else if (error) {
      console.error('RLS test failed with non-RLS error:', error.message);
      return { success: false, rlsActive: false, error };
    } else {
      console.log('RLS test result: Operation succeeded - user has permission or RLS is not configured for this table');
      return { success: true, rlsActive: false, data };
    }
  } catch (err) {
    console.error('RLS test encountered an exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Tests caching mechanism for Supabase data
 */
export async function testCaching() {
  console.log('Testing Supabase data caching...');
  
  const cacheKey = 'test_cache_' + Date.now();
  const testData = { message: 'Test cache data', timestamp: Date.now() };
  
  try {
    // Set cache data
    localStorage.setItem(cacheKey, JSON.stringify(testData));
    console.log('Cached test data:', testData);
    
    // Read from cache
    const cachedJson = localStorage.getItem(cacheKey);
    if (!cachedJson) {
      console.error('Cache test failed: Could not retrieve cached data');
      return { success: false };
    }
    
    const cachedData = JSON.parse(cachedJson);
    console.log('Retrieved cached data:', cachedData);
    
    // Verify cache data matches original
    if (cachedData.message !== testData.message) {
      console.error('Cache test failed: Retrieved data does not match original');
      return { success: false, original: testData, retrieved: cachedData };
    }
    
    // Clean up
    localStorage.removeItem(cacheKey);
    console.log('Cache test succeeded');
    return { success: true };
  } catch (err) {
    console.error('Cache test encountered an exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Run all Supabase tests
 */
export async function runAllTests() {
  const results = {
    create: await testCreateEmployee({
      name: 'Test User',
      nip: '1234567890',
      position: 'Test Position',
      department: 'E2E Test',
      status: 'active'
    }),
    read: await testReadEmployees(),
    leave: await testLeaveOperations(),
    rls: await testRLS(),
    cache: await testCaching()
  };
  
  console.log('All test results:', results);
  return results;
}

// Export a function to execute tests from browser console
(window as any).testSupabase = {
  runAllTests,
  testCreateEmployee,
  testReadEmployees,
  testUpdateEmployee,
  testDeleteEmployee,
  testLeaveOperations,
  testRLS,
  testCaching
};
