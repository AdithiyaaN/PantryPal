"use client";

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

function getStorageValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  const saved = localStorage.getItem(key);
  try {
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error("Error parsing JSON from localStorage", error);
    return defaultValue;
  }
}

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (isClient) {
      try {
        setStoredValue(getStorageValue(key, initialValue));
      } catch (error) {
        console.error("Error getting localStorage value", error);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, key]);

  useEffect(() => {
    if (isClient) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error("Error setting localStorage value", error);
      }
    }
  }, [key, storedValue, isClient]);
  
  return [storedValue, setStoredValue];
}

export default useLocalStorage;
