import React, { useState } from 'react';
import { runAllTests, testCreateEmployee, testReadEmployees, testUpdateEmployee, 
         testDeleteEmployee, testLeaveOperations, testRLS, testCaching } from '../lib/testSupabase';

interface TestResult {
  success: boolean;
  data?: any;
  error?: any;
  rlsActive?: boolean;
}

interface AllTestResults {
  create?: TestResult;
  read?: TestResult;
  update?: TestResult;
  delete?: TestResult;
  leave?: TestResult;
  rls?: TestResult;
  cache?: TestResult;
}

const SupabaseTestPage: React.FC = () => {
  const [results, setResults] = useState<AllTestResults>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [testEmployeeId, setTestEmployeeId] = useState<string>('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  // Intercept console.log to display in the UI
  React.useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      originalConsoleLog(...args);
      setConsoleOutput(prev => [...prev, args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')]);
    };

    console.error = (...args) => {
      originalConsoleError(...args);
      setConsoleOutput(prev => [...prev, `ERROR: ${args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`]);
    };

    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  const handleRunAllTests = async () => {
    setLoading(true);
    setConsoleOutput([]);
    try {
      const allResults = await runAllTests();
      setResults(allResults);
      
      // Get a test employee ID for update/delete tests
      if (allResults.create?.success && allResults.create.data) {
        const employeeId = allResults.create.data[0]?.id;
        if (employeeId) {
          setTestEmployeeId(employeeId);
        }
      }
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async () => {
    setLoading(true);
    setConsoleOutput([]);
    try {
      const result = await testCreateEmployee({
        name: 'Manual Test User',
        nip: '987654321',
        position: 'Manual Test Position',
        department: 'Manual Testing',
        status: 'active'
      });
      setResults({ ...results, create: result });
      
      if (result.success && result.data) {
        const employeeId = result.data[0]?.id;
        if (employeeId) {
          setTestEmployeeId(employeeId);
        }
      }
    } catch (error) {
      console.error('Error in create test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadTest = async () => {
    setLoading(true);
    setConsoleOutput([]);
    try {
      const result = await testReadEmployees();
      setResults({ ...results, read: result });
    } catch (error) {
      console.error('Error in read test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTest = async () => {
    if (!testEmployeeId) {
      console.error('No employee ID available for update test');
      return;
    }
    
    setLoading(true);
    setConsoleOutput([]);
    try {
      const result = await testUpdateEmployee(testEmployeeId, {
        position: 'Updated Position',
        updatedAt: new Date().toISOString()
      });
      setResults({ ...results, update: result });
    } catch (error) {
      console.error('Error in update test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!testEmployeeId) {
      console.error('No employee ID available for delete test');
      return;
    }
    
    setLoading(true);
    setConsoleOutput([]);
    try {
      const result = await testDeleteEmployee(testEmployeeId);
      setResults({ ...results, delete: result });
      if (result.success) {
        setTestEmployeeId(''); // Clear ID after successful deletion
      }
    } catch (error) {
      console.error('Error in delete test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTest = async () => {
    setLoading(true);
    setConsoleOutput([]);
    try {
      const result = await testLeaveOperations();
      setResults({ ...results, leave: result });
    } catch (error) {
      console.error('Error in leave operations test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRLSTest = async () => {
    setLoading(true);
    setConsoleOutput([]);
    try {
      const result = await testRLS();
      setResults({ ...results, rls: result });
    } catch (error) {
      console.error('Error in RLS test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCacheTest = async () => {
    setLoading(true);
    setConsoleOutput([]);
    try {
      const result = await testCaching();
      setResults({ ...results, cache: result });
    } catch (error) {
      console.error('Error in cache test:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setConsoleOutput([]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Supabase End-to-End Tests</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 disabled:opacity-50" 
              onClick={handleRunAllTests} 
              disabled={loading}
            >
              Run All Tests
            </button>
            
            <button 
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50" 
              onClick={handleCreateTest} 
              disabled={loading}
            >
              Test CREATE
            </button>
            
            <button 
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50" 
              onClick={handleReadTest} 
              disabled={loading}
            >
              Test READ
            </button>
            
            <button 
              className="bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 disabled:opacity-50" 
              onClick={handleUpdateTest} 
              disabled={loading || !testEmployeeId}
            >
              Test UPDATE
            </button>
            
            <button 
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50" 
              onClick={handleDeleteTest} 
              disabled={loading || !testEmployeeId}
            >
              Test DELETE
            </button>
            
            <button 
              className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-50" 
              onClick={handleLeaveTest} 
              disabled={loading}
            >
              Test Leave Operations
            </button>
            
            <button 
              className="bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700 disabled:opacity-50" 
              onClick={handleRLSTest} 
              disabled={loading}
            >
              Test RLS
            </button>
            
            <button 
              className="bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 disabled:opacity-50" 
              onClick={handleCacheTest} 
              disabled={loading}
            >
              Test Caching
            </button>
          </div>
          
          {testEmployeeId && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <p className="text-sm">Current test employee ID: <span className="font-mono">{testEmployeeId}</span></p>
            </div>
          )}
          
          {loading && (
            <div className="mt-4 flex items-center justify-center text-blue-600">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running tests...
            </div>
          )}
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <button 
              className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded" 
              onClick={() => setResults({})}
            >
              Clear Results
            </button>
          </div>
          
          <div className="space-y-3">
            {Object.entries(results).map(([testName, result]) => (
              <div key={testName} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{testName} Test</span>
                  {result?.success ? (
                    <span className="text-green-600 text-sm font-medium">Success</span>
                  ) : (
                    <span className="text-red-600 text-sm font-medium">Failed</span>
                  )}
                </div>
                
                {testName === 'rls' && result?.rlsActive !== undefined && (
                  <p className="text-sm mt-1">
                    RLS is {result.rlsActive ? 'active' : 'not active or bypassed'}
                  </p>
                )}
                
                {result?.error && (
                  <div className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto max-h-20">
                    <pre>{JSON.stringify(result.error, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
            
            {Object.keys(results).length === 0 && (
              <p className="text-gray-500 text-sm italic">No tests run yet</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Console Output</h2>
          <button 
            className="text-xs bg-gray-200 hover:bg-gray-300 py-1 px-2 rounded" 
            onClick={clearLogs}
          >
            Clear Logs
          </button>
        </div>
        
        <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-sm overflow-auto max-h-96">
          {consoleOutput.length > 0 ? (
            consoleOutput.map((log, index) => (
              <div key={index} className={`mb-1 ${log.startsWith('ERROR') ? 'text-red-400' : ''}`}>
                {log}
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No output yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseTestPage;
