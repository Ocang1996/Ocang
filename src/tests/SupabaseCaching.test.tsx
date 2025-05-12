import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock local storage for caching tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    key: vi.fn((index: number) => {
      return Object.keys(store)[index] || null;
    }),
    length: 0
  };
})();

// Assign the mock to global object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock the Supabase service
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation(callback => Promise.resolve(callback({ data: [], error: null }))),
  },
}));

// Create a simple cache utility module for testing
const CACHE_PREFIX = 'supabase_cache_';
const DEFAULT_TTL = 300; // 5 minutes in seconds

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

// Cache function to be tested
const cacheData = <T,>(key: string, data: T, options: CacheOptions = {}): void => {
  const ttl = options.ttl || DEFAULT_TTL;
  const expiresAt = Date.now() + ttl * 1000;
  const cacheObject = {
    data,
    expiresAt
  };
  localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheObject));
};

// Get cached data function to be tested
const getCachedData = <T,>(key: string): T | null => {
  const cachedJson = localStorage.getItem(`${CACHE_PREFIX}${key}`);
  if (!cachedJson) return null;
  
  try {
    const cacheObject = JSON.parse(cachedJson);
    const now = Date.now();
    
    // Check if cache is expired
    if (cacheObject.expiresAt < now) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return cacheObject.data as T;
  } catch (e) {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    return null;
  }
};

// Invalidate cache function to be tested
const invalidateCache = (keyPattern: string): void => {
  // In a real implementation, we would scan all localStorage keys and remove matching ones
  // For testing, we'll just simulate removing a specific key
  localStorage.removeItem(`${CACHE_PREFIX}${keyPattern}`);
};

// Simple hook for fetching data with caching
function useSupabaseCachedFetch<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  options: CacheOptions = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchData = React.useCallback(async (bypassCache: boolean = false) => {
    if (!bypassCache) {
      // Try to get from cache first
      const cachedData = getCachedData<T>(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }

    // If not in cache or bypassing cache, fetch from API
    setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      // Cache the new data
      cacheData(cacheKey, result, options);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, cacheKey, options]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Test component to demonstrate caching
const CachingTestComponent = () => {
  // Mock data
  const mockEmployees = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ];
  
  // Mock fetch function
  const fetchEmployees = vi.fn(() => Promise.resolve(mockEmployees));
  
  // Create cached hook
  const { data, loading, error, refetch } = useSupabaseCachedFetch(
    fetchEmployees,
    'employees_list',
    { ttl: 60 } // 1 minute cache
  );

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error?.message || 'no-error'}</div>
      <div data-testid="data-count">{data ? data.length : 0}</div>
      <div data-testid="fetch-count">{fetchEmployees.mock.calls.length}</div>
      
      <button 
        data-testid="refetch-btn" 
        onClick={() => refetch(false)}
      >
        Refetch (Use Cache)
      </button>
      
      <button 
        data-testid="force-refetch-btn" 
        onClick={() => refetch(true)}
      >
        Force Refetch (Bypass Cache)
      </button>
      
      <button 
        data-testid="invalidate-cache-btn" 
        onClick={() => invalidateCache('employees_list')}
      >
        Invalidate Cache
      </button>
    </div>
  );
};

describe('Supabase Caching E2E Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorageMock.clear();
  });

  it('should cache data and avoid refetching within TTL', async () => {
    render(<CachingTestComponent />);

    // Wait for initial fetch
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Verify first fetch happened
    expect(screen.getByTestId('fetch-count').textContent).toBe('1');
    expect(screen.getByTestId('data-count').textContent).toBe('2');

    // Click refetch button (should use cache)
    await act(async () => {
      screen.getByTestId('refetch-btn').click();
    });

    // Verify we didn't fetch again (still at 1)
    expect(screen.getByTestId('fetch-count').textContent).toBe('1');
    
    // Now force refetch (bypassing cache)
    await act(async () => {
      screen.getByTestId('force-refetch-btn').click();
    });
    
    // Verify we fetched again
    expect(screen.getByTestId('fetch-count').textContent).toBe('2');
  });

  it('should invalidate cache when requested', async () => {
    render(<CachingTestComponent />);

    // Wait for initial fetch
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Verify localStorage was called with proper cache key structure
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      expect.stringContaining('supabase_cache_employees_list'),
      expect.any(String)
    );

    // Invalidate the cache
    await act(async () => {
      screen.getByTestId('invalidate-cache-btn').click();
    });

    // Verify localStorage removeItem was called
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(
      expect.stringContaining('supabase_cache_employees_list')
    );

    // Now refetch (should hit API again since cache is gone)
    await act(async () => {
      screen.getByTestId('refetch-btn').click();
    });

    // Verify we fetched again (now at 2)
    expect(screen.getByTestId('fetch-count').textContent).toBe('2');
  });

  it('should respect the TTL setting', async () => {
    // Mock Date.now to manipulate time
    const realDateNow = Date.now;
    const mockTime = 1589011200000; // Example timestamp
    Date.now = vi.fn(() => mockTime);

    render(<CachingTestComponent />);

    // Wait for initial fetch
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Verify initial fetch happened
    expect(screen.getByTestId('fetch-count').textContent).toBe('1');

    // Move time forward by 30 seconds (within TTL)
    Date.now = vi.fn(() => mockTime + 30 * 1000);

    // Refetch - should use cache
    await act(async () => {
      screen.getByTestId('refetch-btn').click();
    });
    expect(screen.getByTestId('fetch-count').textContent).toBe('1');

    // Move time forward by 61 seconds (outside TTL)
    Date.now = vi.fn(() => mockTime + 61 * 1000);

    // Refetch - should fetch new data
    await act(async () => {
      screen.getByTestId('refetch-btn').click();
    });
    expect(screen.getByTestId('fetch-count').textContent).toBe('2');

    // Restore Date.now
    Date.now = realDateNow;
  });
});
