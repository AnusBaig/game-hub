interface SafeStorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class SafeLocalStorage {
  private isAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  getItem<T>(key: string, validator?: (data: unknown) => data is T): SafeStorageResult<T> {
    try {
      if (!this.isAvailable()) {
        return { 
          success: false, 
          error: 'localStorage is not available (private browsing mode or security restrictions)' 
        };
      }

      const item = localStorage.getItem(key);
      if (item === null) {
        return { success: true, data: undefined };
      }

      const parsed = JSON.parse(item);
      
      if (validator && !validator(parsed)) {
        console.warn(`localStorage data validation failed for key: ${key}`);
        return { 
          success: false, 
          error: 'Data validation failed - removing corrupted data',
          data: undefined 
        };
      }

      return { success: true, data: parsed };
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      
      // Try to clear corrupted data
      try {
        localStorage.removeItem(key);
      } catch {
        // Silent fail for cleanup
      }
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error reading localStorage',
        data: undefined 
      };
    }
  }

  setItem<T>(key: string, value: T): SafeStorageResult<boolean> {
    try {
      if (!this.isAvailable()) {
        return { 
          success: false, 
          error: 'localStorage is not available (private browsing mode or security restrictions)' 
        };
      }

      localStorage.setItem(key, JSON.stringify(value));
      return { success: true, data: true };
    } catch (error) {
      console.error(`Error writing to localStorage (key: ${key}):`, error);
      
      let errorMessage = 'Unknown error writing to localStorage';
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          errorMessage = 'localStorage quota exceeded - consider clearing old data';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage,
        data: false 
      };
    }
  }

  removeItem(key: string): SafeStorageResult<boolean> {
    try {
      if (!this.isAvailable()) {
        return { 
          success: false, 
          error: 'localStorage is not available' 
        };
      }

      localStorage.removeItem(key);
      return { success: true, data: true };
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error removing from localStorage',
        data: false 
      };
    }
  }
}

// Type guards for validation
export const isStringArray = (data: unknown): data is string[] => {
  return Array.isArray(data) && data.every(item => typeof item === 'string');
};

export const isString = (data: unknown): data is string => {
  return typeof data === 'string';
};

export const isNumber = (data: unknown): data is number => {
  return typeof data === 'number' && !isNaN(data);
};

// Singleton instance
export const safeLocalStorage = new SafeLocalStorage();

// Convenience functions for common use cases
export const getStringArray = (key: string, fallback: string[] = []): string[] => {
  const result = safeLocalStorage.getItem(key, isStringArray);
  return result.success && result.data ? result.data : fallback;
};

export const setStringArray = (key: string, value: string[]): boolean => {
  const result = safeLocalStorage.setItem(key, value);
  return result.success;
};

export const getString = (key: string, fallback: string = ''): string => {
  const result = safeLocalStorage.getItem(key, isString);
  return result.success && result.data ? result.data : fallback;
};

export const setString = (key: string, value: string): boolean => {
  const result = safeLocalStorage.setItem(key, value);
  return result.success;
};