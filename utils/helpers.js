/**
 * Generic helper utilities.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createMatrix = (rows, columns, fillValue = 0) =>
  Array.from({ length: rows }, () => Array(columns).fill(fillValue));

export const shuffle = (items) => {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const deepClone = (value) => JSON.parse(JSON.stringify(value));
