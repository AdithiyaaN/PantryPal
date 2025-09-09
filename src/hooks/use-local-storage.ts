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
    console.log(error);
    return defaultValue;
  }
}

function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
      return getStorageValue(key, initialValue);
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
        console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default useLocalStorage;
