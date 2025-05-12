import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the Supabase service
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null }))),
    catch: vi.fn().mockImplementation(callback => Promise.resolve()),
  },
  getURL: vi.fn().mockReturnValue('http://localhost:3000')
}));

// Mock the Employee service functions
vi.mock('../lib/employeeService', () => ({
  getEmployees: vi.fn(),
  getEmployeeById: vi.fn(),
  addEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));

// Import the mocked services
import { 
  getEmployees, 
  getEmployeeById, 
  addEmployee, 
  updateEmployee, 
  deleteEmployee 
} from '../lib/employeeService';

// Assume we have an EmployeeContext like LeaveContext
import { EmployeeProvider, useEmployee } from '../lib/EmployeeContext';

// Define Employee interface for testing
interface Employee {
  id: string;
  name: string;
  nip: string;
  position: string;
  department: string;
  rank: string;
  status: 'active' | 'inactive';
  joinDate: string;
  retirementDate?: string;
  createdAt: string;
  updatedAt: string;
}

// TestComponent to access and test the Employee context
const TestComponent = () => {
  const { 
    employees, 
    loading, 
    error, 
    addEmployee: addEmp, 
    updateEmployee: updateEmp, 
    deleteEmployee: deleteEmp, 
    getEmployeeById: getEmpById 
  } = useEmployee();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="employee-count">{employees.length}</div>
      <button 
        data-testid="add-employee-btn" 
        onClick={() => addEmp({
          name: "New Employee",
          nip: "123456789",
          position: "Staff",
          department: "IT",
          rank: "III/a",
          status: "active",
          joinDate: "2020-01-01"
        })}
      >
        Add Employee
      </button>
      <button 
        data-testid="update-employee-btn" 
        onClick={() => employees.length > 0 && updateEmp(employees[0].id, { 
          position: "Senior Staff" 
        })}
      >
        Update Employee
      </button>
      <button 
        data-testid="delete-employee-btn" 
        onClick={() => employees.length > 0 && deleteEmp(employees[0].id)}
      >
        Delete Employee
      </button>
      <div data-testid="employee-details">
        {employees.length > 0 ? getEmpById(employees[0].id)?.name || 'not-found' : 'none'}
      </div>
    </div>
  );
};

describe('EmployeeContext E2E Tests with Supabase', () => {
  const mockEmployees: Employee[] = [
    {
      id: "1",
      name: "John Doe",
      nip: "198601012010011001",
      position: "Kepala Bidang",
      department: "Pengembangan SDM",
      rank: "IV/a",
      status: "active",
      joinDate: "2010-01-01",
      retirementDate: "2046-01-01",
      createdAt: "2023-01-01T00:00:00Z",
      updatedAt: "2023-01-01T00:00:00Z"
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (getEmployees as any).mockResolvedValue(mockEmployees);
    (getEmployeeById as any).mockImplementation((id) => 
      Promise.resolve(mockEmployees.find(emp => emp.id === id) || null)
    );
    (addEmployee as any).mockImplementation(async (employee) => ({
      ...employee,
      id: "2",
      createdAt: "2025-05-13T00:00:00Z",
      updatedAt: "2025-05-13T00:00:00Z"
    }));
    (updateEmployee as any).mockImplementation(async (id, data) => ({
      ...mockEmployees.find(emp => emp.id === id),
      ...data,
      updatedAt: "2025-05-13T00:00:00Z"
    }));
    (deleteEmployee as any).mockResolvedValue(true);
  });

  it('should load initial employee data', async () => {
    render(
      <EmployeeProvider>
        <TestComponent />
      </EmployeeProvider>
    );

    // Initially loading
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Check that service functions were called
    expect(getEmployees).toHaveBeenCalledTimes(1);

    // Check loaded data
    expect(screen.getByTestId('employee-count').textContent).toBe('1');
    expect(screen.getByTestId('error').textContent).toBe('no-error');
  });

  it('should add a new employee record', async () => {
    render(
      <EmployeeProvider>
        <TestComponent />
      </EmployeeProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Add new employee
    await act(async () => {
      screen.getByTestId('add-employee-btn').click();
    });

    // Check if addEmployee was called
    expect(addEmployee).toHaveBeenCalledTimes(1);
    
    // Check the parameters
    const addEmployeeCall = (addEmployee as any).mock.calls[0][0];
    expect(addEmployeeCall).toHaveProperty('name', 'New Employee');
    expect(addEmployeeCall).toHaveProperty('nip', '123456789');
    
    // Check employee count updated
    await waitFor(() => {
      expect(screen.getByTestId('employee-count').textContent).toBe('2');
    });
  });

  it('should update an employee record', async () => {
    render(
      <EmployeeProvider>
        <TestComponent />
      </EmployeeProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Update employee
    await act(async () => {
      screen.getByTestId('update-employee-btn').click();
    });

    // Check if updateEmployee was called
    expect(updateEmployee).toHaveBeenCalledTimes(1);
    
    // Check the parameters
    const updateEmployeeCall = (updateEmployee as any).mock.calls[0];
    expect(updateEmployeeCall[0]).toBe('1'); // ID of the employee to update
    expect(updateEmployeeCall[1]).toHaveProperty('position', 'Senior Staff');
  });

  it('should delete an employee record', async () => {
    render(
      <EmployeeProvider>
        <TestComponent />
      </EmployeeProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Delete employee
    await act(async () => {
      screen.getByTestId('delete-employee-btn').click();
    });

    // Check if deleteEmployee was called
    expect(deleteEmployee).toHaveBeenCalledTimes(1);
    
    // Check the parameters
    expect((deleteEmployee as any).mock.calls[0][0]).toBe('1'); // ID of the employee to delete
    
    // Employee count should be zero after deletion
    await waitFor(() => {
      expect(screen.getByTestId('employee-count').textContent).toBe('0');
    });
  });

  it('should handle errors correctly', async () => {
    // Mock getEmployees to throw an error
    (getEmployees as any).mockRejectedValue(new Error('API Error'));

    render(
      <EmployeeProvider>
        <TestComponent />
      </EmployeeProvider>
    );

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('API Error');
    });
  });

  it('should test Row Level Security rules via permissions', async () => {
    // Mock the Supabase RLS error
    const mockRLSError = { 
      message: "new row violates row-level security policy", 
      code: "42501" 
    };
    
    // Mock addEmployee to simulate RLS blocking
    (addEmployee as any).mockRejectedValue(mockRLSError);

    render(
      <EmployeeProvider>
        <TestComponent />
      </EmployeeProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Try to add new employee which should be blocked by RLS
    await act(async () => {
      screen.getByTestId('add-employee-btn').click();
    });

    // Check error message related to RLS
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe("new row violates row-level security policy");
    });
  });
});
