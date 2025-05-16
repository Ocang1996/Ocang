import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, AlertTriangle, CheckCircle, Database, HelpCircle, RefreshCw } from 'lucide-react';

const SupabaseDebug = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ test: string; status: 'success' | 'error' | 'pending'; message: string }[]>([]);
  const [showFixOptions, setShowFixOptions] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixResult, setFixResult] = useState<string | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    setResults([]);
    setShowFixOptions(false);
    setFixResult(null);
    
    // Test 1: Can connect to Supabase
    try {
      setResults(prev => [...prev, { 
        test: 'Connection', 
        status: 'pending', 
        message: 'Testing connection to Supabase...' 
      }]);
      
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) throw error;
      
      setResults(prev => prev.map(r => 
        r.test === 'Connection' 
          ? { ...r, status: 'success', message: 'Successfully connected to Supabase' } 
          : r
      ));
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.test === 'Connection' 
          ? { ...r, status: 'error', message: `Failed to connect: ${error.message}` } 
          : r
      ));
      setShowFixOptions(true);
    }
    
    // Test 2: Employee table exists
    try {
      setResults(prev => [...prev, { 
        test: 'Employees Table', 
        status: 'pending', 
        message: 'Checking employees table...' 
      }]);
      
      const { data, error } = await supabase.from('employees').select('count').limit(1);
      
      if (error && error.code === '42P01') {
        setResults(prev => prev.map(r => 
          r.test === 'Employees Table' 
            ? { ...r, status: 'error', message: 'Employees table does not exist' } 
            : r
        ));
        setShowFixOptions(true);
      } else if (error) {
        setResults(prev => prev.map(r => 
          r.test === 'Employees Table' 
            ? { ...r, status: 'error', message: `Error: ${error.message}` } 
            : r
        ));
        setShowFixOptions(true);
      } else {
        setResults(prev => prev.map(r => 
          r.test === 'Employees Table' 
            ? { ...r, status: 'success', message: 'Employees table exists' } 
            : r
        ));
      }
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.test === 'Employees Table' 
          ? { ...r, status: 'error', message: `Error: ${error.message}` } 
          : r
      ));
      setShowFixOptions(true);
    }
    
    // Test 3: Can create an employee record
    try {
      setResults(prev => [...prev, { 
        test: 'Create Employee', 
        status: 'pending', 
        message: 'Testing employee creation...' 
      }]);
      
      // Create a test employee with minimal data
      const { data, error } = await supabase
        .from('employees')
        .insert([
          { 
            name: 'Test Employee', 
            nip: 'TEST' + Date.now().toString().slice(0, 18), 
            position: 'Tester',
            department: 'IT',
            rank: 'Staff',
            status: 'active'
          }
        ])
        .select()
        .single();
      
      if (error) {
        setResults(prev => prev.map(r => 
          r.test === 'Create Employee' 
            ? { ...r, status: 'error', message: `Error: ${error.message}` } 
            : r
        ));
        setShowFixOptions(true);
      } else if (!data) {
        setResults(prev => prev.map(r => 
          r.test === 'Create Employee' 
            ? { ...r, status: 'error', message: 'No data returned' } 
            : r
        ));
        setShowFixOptions(true);
      } else {
        setResults(prev => prev.map(r => 
          r.test === 'Create Employee' 
            ? { ...r, status: 'success', message: 'Successfully created test employee' } 
            : r
        ));
        
        // Clean up test data
        await supabase.from('employees').delete().eq('id', data.id);
      }
    } catch (error: any) {
      setResults(prev => prev.map(r => 
        r.test === 'Create Employee' 
          ? { ...r, status: 'error', message: `Error: ${error.message}` } 
          : r
      ));
      setShowFixOptions(true);
    }
    
    setIsLoading(false);
  };
  
  const fixIssues = async () => {
    setIsFixing(true);
    setFixResult(null);
    
    try {
      // Create employees table if it doesn't exist
      const { error: tableError } = await supabase.rpc('create_employees_table_if_not_exists');
      
      if (tableError) {
        console.error('Error creating table:', tableError);
        setFixResult(`Failed to create employees table: ${tableError.message}`);
        setIsFixing(false);
        return;
      }
      
      // Fix RLS permissions
      const { error: rlsError } = await supabase.rpc('fix_employee_rls_permissions');
      
      if (rlsError) {
        console.error('Error fixing RLS:', rlsError);
        setFixResult(`Failed to fix permissions: ${rlsError.message}`);
        setIsFixing(false);
        return;
      }
      
      setFixResult('Successfully fixed database issues. Please run the tests again.');
      
      // Run tests again after a short delay
      setTimeout(() => {
        runTests();
      }, 1500);
    } catch (error: any) {
      console.error('Fix error:', error);
      setFixResult(`Error: ${error.message}`);
    } finally {
      setIsFixing(false);
    }
  };
  
  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Database className="mr-2 h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Supabase Connection Diagnostic</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          This tool helps diagnose and fix issues with your Supabase connection
        </p>
      </div>
      <div className="p-4">
        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="flex items-start space-x-4 border-b pb-3">
                <div className="flex-shrink-0 pt-1">
                  {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {result.status === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  {result.status === 'pending' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                </div>
                <div>
                  <h3 className="font-medium">{result.test}</h3>
                  <p className={`text-sm ${
                    result.status === 'error' 
                      ? 'text-red-600 dark:text-red-400' 
                      : result.status === 'success'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <HelpCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Press "Run Tests" to diagnose your Supabase connection
            </p>
          </div>
        )}
        
        {showFixOptions && (
          <div className="mt-4 p-4 border border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Issues Detected</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your Supabase connection has issues that need to be fixed.
                  Click "Fix Issues" to attempt automatic repairs.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {fixResult && (
          <div className={`mt-4 p-4 border rounded-md ${
            fixResult.includes('Successfully') 
              ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
              : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
          }`}>
            <div className="flex">
              {fixResult.includes('Successfully') 
                ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500 mr-2 flex-shrink-0" />
                : <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 mr-2 flex-shrink-0" />
              }
              <div>
                <h3 className="font-medium">
                  {fixResult.includes('Successfully') ? 'Fix Successful' : 'Fix Failed'}
                </h3>
                <p className="text-sm">
                  {fixResult}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
        <button 
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          onClick={runTests} 
          disabled={isLoading || isFixing}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </span>
          ) : (
            <span className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Tests
            </span>
          )}
        </button>
        
        {showFixOptions && (
          <button 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            onClick={fixIssues} 
            disabled={isLoading || isFixing}
          >
            {isFixing ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fixing Issues...
              </span>
            ) : (
              'Fix Issues'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SupabaseDebug; 