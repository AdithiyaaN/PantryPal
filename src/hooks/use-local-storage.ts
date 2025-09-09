"use client";

import { useState, useEffect, Dispatch, SetStateAction, useId } from 'react';

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

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (isClient) {
      return getStorageValue(key, initialValse);
    }
    return initialValue;
  });

  useEffect(() => {
    if (isClient) {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error("Error setting localStorage value", error);
      }
    }
  }, [key, storedValue, isClient]);
  
  useEffect(() => {
    if (isClient) {
      setStoredValue(getStorageValue(key, initialValue));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, key]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
