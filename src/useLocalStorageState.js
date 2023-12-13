import { useEffect, useState } from "react";

export function useLocalStorageState(initialValue, item) {
  const [value, setValue] = useState(() => {
    const storedValue = localStorage.getItem(item);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(item, JSON.stringify(value));
  }, [value, item]);

  return [value, setValue];
}
