import { renderHook, act } from '@testing-library/react';
import { useDataFetching } from './useDataFetching';

// Mock fetch
global.fetch = jest.fn();

describe('useDataFetching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch data on mount when immediate is true', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
    
    const { result } = renderHook(() =>
      useDataFetching({
        fetchFunction: mockFetch,
        dependencies: [],
        immediate: true
      })
    );

    expect(result.current.loading).toBe(true);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual({ data: 'test' });
    expect(result.current.loading).toBe(false);
  });

  it('should not fetch data on mount when immediate is false', () => {
    const mockFetch = jest.fn();
    
    const { result } = renderHook(() =>
      useDataFetching({
        fetchFunction: mockFetch,
        dependencies: [],
        immediate: false
      })
    );

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('should debounce requests when debounceMs is set', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
    
    const { result, rerender } = renderHook(
      ({ deps }) =>
        useDataFetching({
          fetchFunction: mockFetch,
          dependencies: deps,
          debounceMs: 100
        }),
      { initialProps: { deps: [1] } }
    );

    // Change dependencies multiple times quickly
    act(() => {
      rerender({ deps: [2] });
    });

    act(() => {
      rerender({ deps: [3] });
    });

    act(() => {
      rerender({ deps: [4] });
    });

    // Should not have called fetch yet due to debouncing
    expect(mockFetch).not.toHaveBeenCalled();

    // Wait for debounce to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    // Should have called fetch only once (the last call)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should handle errors correctly', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Test error'));
    
    const { result } = renderHook(() =>
      useDataFetching({
        fetchFunction: mockFetch,
        dependencies: [],
        immediate: true
      })
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBe('Test error');
    expect(result.current.loading).toBe(false);
  });

  it('should not cause infinite loops with changing dependencies', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ data: 'test' });
    let callCount = 0;
    
    const { result, rerender } = renderHook(
      ({ deps }) =>
        useDataFetching({
          fetchFunction: () => {
            callCount++;
            return mockFetch();
          },
          dependencies: deps,
          immediate: true
        }),
      { initialProps: { deps: [1] } }
    );

    // Change dependencies multiple times
    for (let i = 2; i <= 5; i++) {
      act(() => {
        rerender({ deps: [i] });
      });
    }

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should not have called fetch more than once per dependency change
    expect(callCount).toBeLessThanOrEqual(5);
  });
});