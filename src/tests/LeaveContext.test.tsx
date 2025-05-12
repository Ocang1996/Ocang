import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LeaveProvider, useLeave, LeaveData, LeaveQuota } from '../lib/LeaveContext';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock the service functions
vi.mock('../lib/leaveService', () => ({
  getLeaveData: vi.fn(),
  getLeaveQuotas: vi.fn(),
  addLeaveData: vi.fn(),
  updateLeaveData: vi.fn(),
  deleteLeaveData: vi.fn(),
  getLeaveQuotaByEmployeeAndYear: vi.fn(),
  updateLeaveQuota: vi.fn(),
}));

// Mock date utils
vi.mock('../lib/dateUtils', () => ({
  isNonWorkingDay: vi.fn().mockImplementation((date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Weekend detection (Sunday or Saturday)
  }),
}));

// Import the mocked services
import { 
  getLeaveData, 
  getLeaveQuotas, 
  addLeaveData, 
  updateLeaveData, 
  deleteLeaveData,
  getLeaveQuotaByEmployeeAndYear,
  updateLeaveQuota 
} from '../lib/leaveService';

// TestComponent to access and test the context
const TestComponent = () => {
  const { 
    leaveData, 
    leaveQuotas, 
    loading, 
    error, 
    addLeave, 
    updateLeave, 
    deleteLeave, 
    getEmployeeLeaves, 
    getEmployeeQuota 
  } = useLeave();

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="leave-count">{leaveData.length}</div>
      <div data-testid="quota-count">{leaveQuotas.length}</div>
      <button 
        data-testid="add-leave-btn" 
        onClick={() => addLeave({
          employeeId: "1",
          employeeName: "Test Employee",
          leaveType: "Tahunan",
          duration: 5, // This will be recalculated
          startDate: "2025-05-15",
          endDate: "2025-05-21",
          reason: "Vacation",
          status: "Pending",
          inputBy: "admin",
          year: 2025,
          documentRequired: false
        })}
      >
        Add Leave
      </button>
      <button 
        data-testid="update-leave-btn" 
        onClick={() => leaveData.length > 0 && updateLeave(leaveData[0].id, { 
          reason: "Updated Reason" 
        })}
      >
        Update Leave
      </button>
      <button 
        data-testid="delete-leave-btn" 
        onClick={() => leaveData.length > 0 && deleteLeave(leaveData[0].id)}
      >
        Delete Leave
      </button>
      <div data-testid="employee-leaves">
        {getEmployeeLeaves("1").length}
      </div>
      <div data-testid="employee-quota">
        {getEmployeeQuota("1", 2025)?.annualRemaining || "not-found"}
      </div>
    </div>
  );
};

describe('LeaveContext', () => {
  const mockLeaveData: LeaveData[] = [
    {
      id: "1",
      employeeId: "1",
      employeeName: "Test Employee",
      leaveType: "Tahunan",
      duration: 5,
      startDate: "2025-05-01",
      endDate: "2025-05-07",
      reason: "Vacation",
      status: "Approved",
      inputBy: "admin",
      year: 2025,
      documentRequired: false,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
    }
  ];

  const mockLeaveQuotas: LeaveQuota[] = [
    {
      id: "1",
      employeeId: "1",
      employeeName: "Test Employee",
      year: 2025,
      annualQuota: 12,
      annualUsed: 5,
      annualRemaining: 7,
      previousYearRemaining: 3,
      totalAvailable: 10,
      serviceYears: 3,
      bigLeaveEligible: false,
      bigLeaveStatus: false,
      sickLeaveUsed: 0,
      maternityLeaveUsed: 0,
      importantLeaveUsed: 0,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z"
    }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (getLeaveData as any).mockResolvedValue(mockLeaveData);
    (getLeaveQuotas as any).mockResolvedValue(mockLeaveQuotas);
    (addLeaveData as any).mockImplementation(async (leave) => ({
      ...leave,
      id: "2",
      createdAt: "2025-05-13T00:00:00Z",
      updatedAt: "2025-05-13T00:00:00Z"
    }));
    (updateLeaveData as any).mockImplementation(async (id, data) => ({
      ...mockLeaveData.find(l => l.id === id),
      ...data,
      updatedAt: "2025-05-13T00:00:00Z"
    }));
    (deleteLeaveData as any).mockResolvedValue(true);
    (updateLeaveQuota as any).mockImplementation(async (id, data) => ({
      ...mockLeaveQuotas.find(q => q.id === id),
      ...data,
      updatedAt: "2025-05-13T00:00:00Z"
    }));
  });

  it('should load initial data', async () => {
    render(
      <LeaveProvider>
        <TestComponent />
      </LeaveProvider>
    );

    // Initially loading
    expect(screen.getByTestId('loading').textContent).toBe('true');

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Check that service functions were called
    expect(getLeaveData).toHaveBeenCalledTimes(1);
    expect(getLeaveQuotas).toHaveBeenCalledTimes(1);

    // Check loaded data
    expect(screen.getByTestId('leave-count').textContent).toBe('1');
    expect(screen.getByTestId('quota-count').textContent).toBe('1');
    expect(screen.getByTestId('error').textContent).toBe('no-error');
  });

  it('should add a new leave record', async () => {
    render(
      <LeaveProvider>
        <TestComponent />
      </LeaveProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Add new leave
    await act(async () => {
      screen.getByTestId('add-leave-btn').click();
    });

    // Check if addLeaveData was called
    expect(addLeaveData).toHaveBeenCalledTimes(1);
    
    // Check the parameters - duration should be recalculated to match working days
    const addLeaveCall = (addLeaveData as any).mock.calls[0][0];
    expect(addLeaveCall).toHaveProperty('employeeId', '1');
    expect(addLeaveCall).toHaveProperty('leaveType', 'Tahunan');
    
    // The duration should be recalculated (expected to be 5 working days)
    expect(addLeaveCall).toHaveProperty('duration', 5);
    
    // Check leave count updated
    await waitFor(() => {
      expect(screen.getByTestId('leave-count').textContent).toBe('2');
    });
  });

  it('should update a leave record', async () => {
    render(
      <LeaveProvider>
        <TestComponent />
      </LeaveProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Update leave
    await act(async () => {
      screen.getByTestId('update-leave-btn').click();
    });

    // Check if updateLeaveData was called
    expect(updateLeaveData).toHaveBeenCalledTimes(1);
    
    // Check the parameters
    const updateLeaveCall = (updateLeaveData as any).mock.calls[0];
    expect(updateLeaveCall[0]).toBe('1'); // ID of the leave to update
    expect(updateLeaveCall[1]).toHaveProperty('reason', 'Updated Reason');
  });

  it('should delete a leave record', async () => {
    render(
      <LeaveProvider>
        <TestComponent />
      </LeaveProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Delete leave
    await act(async () => {
      screen.getByTestId('delete-leave-btn').click();
    });

    // Check if deleteLeaveData was called
    expect(deleteLeaveData).toHaveBeenCalledTimes(1);
    
    // Check the parameters
    expect((deleteLeaveData as any).mock.calls[0][0]).toBe('1'); // ID of the leave to delete
    
    // Leave count should be zero after deletion
    await waitFor(() => {
      expect(screen.getByTestId('leave-count').textContent).toBe('0');
    });
  });

  it('should get employee leaves', async () => {
    render(
      <LeaveProvider>
        <TestComponent />
      </LeaveProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Check employee leaves
    expect(screen.getByTestId('employee-leaves').textContent).toBe('1');
  });

  it('should get employee quota', async () => {
    render(
      <LeaveProvider>
        <TestComponent />
      </LeaveProvider>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Check employee quota
    expect(screen.getByTestId('employee-quota').textContent).toBe('7');
  });

  it('should handle errors correctly', async () => {
    // Mock getLeaveData to throw an error
    (getLeaveData as any).mockRejectedValue(new Error('API Error'));

    render(
      <LeaveProvider>
        <TestComponent />
      </LeaveProvider>
    );

    // Wait for error to be set
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('API Error');
    });
  });
});
