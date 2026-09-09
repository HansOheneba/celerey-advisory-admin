"use client";

import { useCallback, useState } from "react";

export function useRepeatableKeys(initialCount: number) {
  const [keys, setKeys] = useState(() =>
    Array.from({ length: initialCount }, (_, index) => index),
  );
  const [nextKey, setNextKey] = useState(initialCount);

  const add = useCallback(() => {
    setKeys((current) => [...current, nextKey]);
    setNextKey((current) => current + 1);
  }, [nextKey]);

  const remove = useCallback((index: number) => {
    setKeys((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }, []);

  return { keys, add, remove };
}

export function indexedFieldName(prefix: string, index: number, key: string) {
  return `${prefix}[${index}].${key}`;
}
