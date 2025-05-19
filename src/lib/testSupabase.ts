import { supabase } from './supabase';

// Defines the format of test results
interface TestResult {
  success: boolean;
  data?: any;
  error?: any;
  message?: string;
  rlsActive?: boolean;
  note?: string;
}

// Helper function to log messages that will be displayed in the console output
const logMessage = (message: string) => {
  console.log(message);
  return message;
};

/**
 * Run all Supabase tests
 */
export const runAllTests = async (): Promise<Record<string, TestResult>> => {
  const results: Record<string, TestResult> = {};

  try {
    logMessage('=== STARTING ALL SUPABASE TESTS ===');
    
    // Test creation
    const employeeData = {
      name: 'Test User',
      nip: `TEST-${Date.now()}`,
      position: 'Test Position',
      department: 'Test Department',
      rank: 'Test Rank',
      status: 'active'
    };
    
    results.create = await testCreateEmployee(employeeData);
    
    // If create test succeeded, use the created employee for update and delete tests
    let testEmployeeId = null;
    if (results.create.success && results.create.data && results.create.data.length > 0) {
      testEmployeeId = results.create.data[0].id;
      logMessage(`Using created employee ID: ${testEmployeeId} for further tests`);
    }
    
    // Test read
    results.read = await testReadEmployees();
    
    // Test update if we have a test employee
    if (testEmployeeId) {
      results.update = await testUpdateEmployee(testEmployeeId, {
        position: 'Updated Position',
        updated_at: new Date().toISOString()
      });
    } else {
      results.update = {
        success: false,
        message: 'Update test skipped - no test employee ID available',
        note: 'Create test must succeed first'
      };
    }
    
    // Test leave operations
    results.leave = await testLeaveOperations();
    
    // Test RLS
    results.rls = await testRLS();
    
    // Test caching
    results.cache = await testCaching();
    
    // Test delete if we have a test employee
    if (testEmployeeId) {
      results.delete = await testDeleteEmployee(testEmployeeId);
    } else {
      results.delete = {
        success: false,
        message: 'Delete test skipped - no test employee ID available',
        note: 'Create test must succeed first'
      };
    }
    
    logMessage('=== ALL TESTS COMPLETED ===');
    return results;
  } catch (error: any) {
    logMessage(`Error running all tests: ${error.message}`);
    return results;
  }
};

/**
 * Test creating a new employee
 */
export const testCreateEmployee = async (employeeData: any): Promise<TestResult> => {
  try {
    logMessage('START: Testing CREATE employee operation');
    
    // Check if in test mode
    const testMode = localStorage.getItem('supabase_test_mode') === 'true';
    
    if (testMode) {
      logMessage('Running in TEST MODE with simulated data');
      
      // Simulate a successful response
      return {
        success: true,
        data: [{
          ...employeeData,
          id: `test-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }],
        note: 'Using simulated data in test mode'
      };
    }
    
    // Actual Supabase call
    const { data, error } = await supabase
      .from('employees')
      .insert([employeeData])
      .select();

    if (error) {
      logMessage(`CREATE error: ${error.message}`);
      
      // If we get a specific RLS error, we can indicate that
      const isRLSError = error.message.includes('policy') || 
                          error.message.includes('permission') ||
                          error.code === '42501';
      
      return {
        success: false,
        error,
        rlsActive: isRLSError,
        note: isRLSError ? 'Anda tidak memiliki izin untuk operasi ini (RLS aktif)' : undefined
      };
    }
    
    logMessage(`Successfully created employee: ${JSON.stringify(data)}`);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    logMessage(`Exception in CREATE test: ${error.message}`);
    return {
      success: false,
      error
    };
  }
};

/**
 * Test reading employees
 */
export const testReadEmployees = async (): Promise<TestResult> => {
  try {
    logMessage('START: Testing READ employees operation');
    
    // Check if in test mode
    const testMode = localStorage.getItem('supabase_test_mode') === 'true';
    
    if (testMode) {
      logMessage('Running in TEST MODE with simulated data');
      
      // Simulate a successful response with random data
      return {
        success: true,
        data: [
          {
            id: 'sim-1',
            name: 'Karyawan Simulasi 1',
            position: 'Jabatan Simulasi',
            department: 'Departemen Simulasi',
            created_at: new Date().toISOString()
          },
          {
            id: 'sim-2',
            name: 'Karyawan Simulasi 2',
            position: 'Jabatan Simulasi',
            department: 'Departemen Simulasi',
            created_at: new Date().toISOString()
          }
        ],
        note: 'Using simulated data in test mode'
      };
    }
    
    // Actual Supabase call
    const { data, error } = await supabase
      .from('employees')
      .select()
      .limit(10);

    if (error) {
      logMessage(`READ error: ${error.message}`);
      return {
        success: false,
        error
      };
    }
    
    logMessage(`Successfully retrieved ${data?.length || 0} employees`);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    logMessage(`Exception in READ test: ${error.message}`);
    return {
      success: false,
      error
    };
  }
};

/**
 * Test updating an employee
 */
export const testUpdateEmployee = async (employeeId: string, updateData: any): Promise<TestResult> => {
  try {
    logMessage(`START: Testing UPDATE employee operation for ID: ${employeeId}`);
    
    // Check if in test mode
    const testMode = localStorage.getItem('supabase_test_mode') === 'true';
    
    if (testMode) {
      logMessage('Running in TEST MODE with simulated data');
      
      // Simulate a successful response
      return {
        success: true,
        data: {
          id: employeeId,
          ...updateData,
          updated_at: new Date().toISOString()
        },
        note: 'Using simulated data in test mode'
      };
    }
    
    // Actual Supabase call
    const { data, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', employeeId)
      .select()
      .single();

    if (error) {
      logMessage(`UPDATE error: ${error.message}`);
      
      // If we get a specific RLS error, we can indicate that
      const isRLSError = error.message.includes('policy') || 
                          error.message.includes('permission') ||
                          error.code === '42501';
      
      return {
        success: false,
        error,
        rlsActive: isRLSError,
        note: isRLSError ? 'Anda tidak memiliki izin untuk operasi ini (RLS aktif)' : undefined
      };
    }
    
    logMessage(`Successfully updated employee: ${JSON.stringify(data)}`);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    logMessage(`Exception in UPDATE test: ${error.message}`);
    return {
      success: false,
      error
    };
  }
};

/**
 * Test deleting an employee
 */
export const testDeleteEmployee = async (employeeId: string): Promise<TestResult> => {
  try {
    logMessage(`START: Testing DELETE employee operation for ID: ${employeeId}`);
    
    // Check if in test mode
    const testMode = localStorage.getItem('supabase_test_mode') === 'true';
    
    if (testMode) {
      logMessage('Running in TEST MODE with simulated data');
      
      // Simulate a successful response
      return {
        success: true,
        data: { id: employeeId },
        note: 'Using simulated data in test mode'
      };
    }
    
    // Actual Supabase call
    const { data, error } = await supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (error) {
      logMessage(`DELETE error: ${error.message}`);
      
      // If we get a specific RLS error, we can indicate that
      const isRLSError = error.message.includes('policy') || 
                          error.message.includes('permission') ||
                          error.code === '42501';
      
      return {
        success: false,
        error,
        rlsActive: isRLSError,
        note: isRLSError ? 'Anda tidak memiliki izin untuk operasi ini (RLS aktif)' : undefined
      };
    }
    
    logMessage(`Successfully deleted employee with ID: ${employeeId}`);
    return {
      success: true,
      data
    };
  } catch (error: any) {
    logMessage(`Exception in DELETE test: ${error.message}`);
    return {
      success: false,
      error
    };
  }
};

/**
 * Test leave operations - this test is designed to always fail as a security measure
 */
export const testLeaveOperations = async (): Promise<TestResult> => {
  try {
    logMessage('START: Testing leave operations (Tinggalkan Ujian)');
    logMessage('NOTE: This test is DESIGNED TO FAIL for security reasons');
    
    // Even in test mode, this operation should always fail
    logMessage('Attempting to execute leave operation (expected to fail)');
    
    // Try to execute leave RPC
    try {
      const { data, error } = await supabase.rpc('attempt_leave_exam', {
        user_id: 'test',
        session_id: 'test'
      });
      
      if (error) {
        // This is the expected outcome
        logMessage(`Leave operation FAILED as expected: ${error.message}`);
        return {
          success: false,
          error,
          note: 'Operasi ini dirancang untuk gagal sebagai pengujian keamanan'
        };
      }
      
      // If no error, something is wrong
      logMessage('WARNING: Leave operation succeeded unexpectedly');
      return {
        success: true,
        data,
        note: 'Operasi ini seharusnya gagal tetapi berhasil - Pengujian keamanan gagal!'
      };
    } catch (error: any) {
      // This is an acceptable outcome too
      logMessage(`Leave operation FAILED (exception): ${error.message}`);
      return {
        success: false,
        error,
        note: 'Operasi ini dirancang untuk gagal sebagai pengujian keamanan'
      };
    }
  } catch (error: any) {
    logMessage(`Exception in leave test: ${error.message}`);
    return {
      success: false,
      error,
      note: 'Operasi ini dirancang untuk gagal sebagai pengujian keamanan'
    };
  }
};

/**
 * Test RLS permissions
 */
export const testRLS = async (): Promise<TestResult> => {
  try {
    logMessage('START: Testing RLS permissions');
    
    // Check if in test mode
    const testMode = localStorage.getItem('supabase_test_mode') === 'true';
    
    if (testMode) {
      logMessage('Running in TEST MODE with simulated data');
      
      // Simulate a successful RLS check
      return {
        success: true,
        rlsActive: true,
        data: { policies: ['read', 'insert', 'update', 'delete'] },
        note: 'Using simulated data in test mode'
      };
    }
    
    // Try to execute a sensitive operation without permissions
    const sensitiveTestData = {
      name: 'RLS Test',
      position: 'Test',
      department: 'Test',
      nip: 'TEST-RLS',
      forceAdmin: true // This is a field that should be rejected by RLS
    };
    
    const { error } = await supabase
      .from('employees')
      .insert([sensitiveTestData]);
    
    // If there's no error, RLS might not be active
    if (!error) {
      logMessage('WARNING: Sensitive operation succeeded - RLS may not be active');
      return {
        success: true,
        rlsActive: false,
        note: 'RLS may not be properly configured - sensitive operation succeeded'
      };
    }
    
    // If we get a policy or permission error, RLS is active
    const isRLSError = error.message.includes('policy') || 
                        error.message.includes('permission') ||
                        error.code === '42501';
    
    if (isRLSError) {
      logMessage('RLS is active - sensitive operation was correctly blocked');
      return {
        success: true,
        rlsActive: true,
        error,
        note: 'RLS telah dikonfigurasi dengan benar'
      };
    }
    
    // Other error
    logMessage(`RLS test completed with error: ${error.message}`);
    return {
      success: false,
      error,
      note: 'Tidak dapat menentukan status RLS'
    };
  } catch (error: any) {
    logMessage(`Exception in RLS test: ${error.message}`);
    return {
      success: false,
      error
    };
  }
};

/**
 * Test caching functionality
 */
export const testCaching = async (): Promise<TestResult> => {
  try {
    logMessage('START: Testing caching functionality');
    
    // Generate a unique cache key for this test
    const testCacheKey = `supabase_cache_test_${Date.now()}`;
    
    // Store some test data in cache
    const testData = {
      timestamp: Date.now(),
      testValue: 'Cache test value'
    };
    
    // Save to localStorage
    localStorage.setItem(testCacheKey, JSON.stringify({
      data: testData,
      expires: Date.now() + 60000 // 1 minute expiry
    }));
    
    // Verify we can retrieve the cached data
    const cachedItem = localStorage.getItem(testCacheKey);
    
    if (!cachedItem) {
      logMessage('Cache test failed - could not retrieve data from localStorage');
      return {
        success: false,
        error: { message: 'Failed to retrieve from cache' },
        note: 'Cache retrieval test failed'
      };
    }
    
    try {
      const parsedCache = JSON.parse(cachedItem);
      
      // Verify the cache structure
      if (!parsedCache.data || !parsedCache.expires) {
        logMessage('Cache test failed - invalid cache structure');
        return {
          success: false,
          error: { message: 'Invalid cache structure' },
          note: 'Cache format test failed'
        };
      }
      
      // Clean up test cache
      localStorage.removeItem(testCacheKey);
      
      logMessage('Cache test passed - data was successfully stored and retrieved');
      return {
        success: true,
        data: { testResults: 'Cache system working correctly' },
        note: 'Cache system is functioning properly'
      };
    } catch (error) {
      logMessage('Cache test failed - error parsing cached data');
      return {
        success: false,
        error: { message: 'Error parsing cached data' },
        note: 'Cache parse test failed'
      };
    }
  } catch (error: any) {
    logMessage(`Exception in cache test: ${error.message}`);
    return {
      success: false,
      error
    };
  }
};
