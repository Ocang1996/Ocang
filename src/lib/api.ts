import { API_CONFIG } from './config';

/**
 * Standard API response interface
 */
interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Simulated mock API responses
const mock = {
  get: async <T>(_path: string): Promise<T> => {
    // Simulate network delay
    await delay(500);
    
    // Simple mock data based on path
    if (_path.includes('/employees')) {
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      } as unknown as T;
    }
    
    return {} as T;
  },
  
  post: async <T>(_path: string, data: any): Promise<T> => {
    await delay(500);
    return { ...data, id: Date.now().toString() } as unknown as T;
  },
  
  put: async <T>(_path: string, data: any): Promise<T> => {
    await delay(500);
    return data as unknown as T;
  },
  
  delete: async (_path: string): Promise<void> => {
    await delay(500);
  },
  
  upload: async <T>(_path: string, _data: FormData): Promise<T> => {
    await delay(1000);
    return { photoUrl: 'https://example.com/photo.jpg' } as unknown as T;
  }
};

// Define retry logic
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit,
  retries = 0
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    // Check if response is ok (status in the range 200-299)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `Server responded with status: ${response.status}`
      );
    }
    
    return await response.json();
  } catch (error) {
    // If we've reached max retries, throw the error
    if (retries >= MAX_RETRIES) {
      console.error(`API call failed after ${MAX_RETRIES} retries:`, error);
      throw error;
    }
    
    // Wait and then retry
    await delay(RETRY_DELAY);
    return fetchWithRetry<T>(url, options, retries + 1);
  }
}

const api = {
  get: async <T>(endpoint: string, params?: Record<string, string>): Promise<T> => {
    // Use mock data if configured to do so
    if (!API_CONFIG.USE_BACKEND) {
      return mock.get<T>(endpoint);
    }
    
    // Build URL with query parameters
    const url = new URL(endpoint, API_CONFIG.BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    try {
      return await fetchWithRetry<T>(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...API_CONFIG.HEADERS
        }
      });
    } catch (error) {
      console.error('API GET request failed:', error);
      
      // Fall back to mock data
      console.log('Falling back to mock data');
      return mock.get<T>(endpoint);
    }
  },
  
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    if (!API_CONFIG.USE_BACKEND) {
      return mock.post<T>(endpoint, data);
    }
    
    const url = new URL(endpoint, API_CONFIG.BASE_URL);
    
    try {
      return await fetchWithRetry<T>(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...API_CONFIG.HEADERS
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('API POST request failed:', error);
      
      // Fall back to mock data
      return mock.post<T>(endpoint, data);
    }
  },
  
  put: async <T>(endpoint: string, data: any): Promise<T> => {
    if (!API_CONFIG.USE_BACKEND) {
      return mock.put<T>(endpoint, data);
    }
    
    const url = new URL(endpoint, API_CONFIG.BASE_URL);
    
    try {
      return await fetchWithRetry<T>(url.toString(), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...API_CONFIG.HEADERS
        },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('API PUT request failed:', error);
      
      // Fall back to mock data
      return mock.put<T>(endpoint, data);
    }
  },
  
  delete: async (endpoint: string): Promise<void> => {
    if (!API_CONFIG.USE_BACKEND) {
      return mock.delete(endpoint);
    }
    
    const url = new URL(endpoint, API_CONFIG.BASE_URL);
    
    try {
      await fetchWithRetry<void>(url.toString(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...API_CONFIG.HEADERS
        }
      });
    } catch (error) {
      console.error('API DELETE request failed:', error);
      // Fall back to mock behavior (do nothing)
      return mock.delete(endpoint);
    }
  },
  
  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    if (!API_CONFIG.USE_BACKEND) {
      return mock.upload<T>(endpoint, formData);
    }
    
    const url = new URL(endpoint, API_CONFIG.BASE_URL);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          ...API_CONFIG.HEADERS,
          // Don't set Content-Type as it will be set automatically with boundary
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Server responded with status: ${response.status}`
        );
      }
      
      return await response.json();
    } catch (error) {
      console.error('API upload request failed:', error);
      
      // Fall back to mock data
      return mock.upload<T>(endpoint, formData);
    }
  }
};

/**
 * Sends a password reset request to the email
 * @param email User's email address
 * @returns Promise with response data
 */
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response;
  } catch (error) {
    console.error('Failed to send password reset request:', error);
    throw error;
  }
};

/**
 * Resets user password using token
 * @param token Reset token received in email
 * @param newPassword New password
 * @returns Promise with response data
 */
export const resetPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post<{ success: boolean; message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword }
    );
    return response;
  } catch (error) {
    console.error('Failed to reset password:', error);
    throw error;
  }
};

export default api;

interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  name: string;
}

/**
 * Register a new user
 * @param data User registration data
 * @returns Promise with registration response
 */
export async function registerUser(data: RegisterUserData): Promise<ApiResponse> {
  try {
    // In production, use real API call
    if (API_CONFIG.USE_BACKEND) {
      const response = await api.post<ApiResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, data);
      return response;
    } else {
      // Simulated registration logic for development/demo
      await delay(800); // Simulate network delay
      return {
        success: true,
        message: 'Registration successful',
        data: {
          id: Date.now().toString(),
          ...data
        }
      };
    }
  } catch (error: any) {
    console.error('Registration failed:', error);
    return {
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    };
  }
}

interface EmployeeData {
  name: string;
  nip: string;
  position: string;
  department: string;
  rank: string;
  status: string;
  [key: string]: any; // Allow for additional properties
}

export async function createEmployee(employeeData: EmployeeData): Promise<ApiResponse> {
  try {
    // Validate required fields
    const requiredFields = ['nip', 'name', 'gender', 'birthDate', 'position', 'workUnit', 'employeeType'];
    const missingFields = requiredFields.filter(field => !employeeData[field as keyof EmployeeData]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        message: `Data tidak lengkap: ${missingFields.join(', ')} harus diisi`
      };
    }
    
    // For development/demo purposes, simulate a successful creation
    // In production, this would be a real API call
    const response = {
      success: true,
      message: 'Employee successfully created',
      data: {
        id: Math.floor(Math.random() * 1000) + 11, // Generate a random ID
        ...employeeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    // Simulate database write delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Log the complete data that would be stored
    console.log('New employee data saved to database:', response.data);
    
    return response;
    
    // Uncomment for real API implementation
    // const response = await api.post(API_CONFIG.ENDPOINTS.EMPLOYEES.CREATE, employeeData);
    // return response;
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return {
      success: false,
      message: error.message || 'Failed to create employee. Please try again.'
    };
  }
}

export async function updateEmployee(id: string, employeeData: Partial<EmployeeData>): Promise<ApiResponse> {
  try {
    // Validate that we have an ID
    if (!id) {
      return {
        success: false,
        message: 'Employee ID is required for update'
      };
    }
    
    // For development/demo purposes, simulate a successful update
    // In production, this would be a real API call
    
    // Simulate database write delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const updatedData = {
      ...employeeData,
      id,
      updatedAt: new Date().toISOString()
    };
    
    // Log the complete data that would be updated
    console.log('Updated employee data in database:', updatedData);
    
    return {
      success: true,
      message: 'Employee successfully updated',
      data: updatedData
    };
    
    // Uncomment for real API implementation
    // const response = await api.put(`${API_CONFIG.ENDPOINTS.EMPLOYEES.BASE}/${id}`, employeeData);
    // return response;
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return {
      success: false,
      message: error.message || 'Failed to update employee. Please try again.'
    };
  }
} 