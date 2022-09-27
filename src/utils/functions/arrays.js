export const titleCaseString = (data) =>
  data
    .toLowerCase()
    .split(" ")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

export const convertStringToArray = (para, removeSpaces = false) =>
  removeSpaces ? [...para].filter((item) => item !== " ") : [...para];

export const countInstanceInArray = (arr) =>
  arr.reduce((obj, item) => {
    if (!obj[item]) obj[item] = 0;
    obj[item]++;
    return obj;
  }, {});

export const sumOfAnArray = (arr, initialValue = 0) =>
  arr.reduce((a, b) => a + b, initialValue);

export const inArrayOfObjects = (arr, key, value) =>
  arr.find((ar) => ar[key] === value);

export const findArrayIndex = (arr, key, value) =>
  arr.findIndex((ar) => ar[key] === value);

export const getUniqueList = (arr) =>
  arr.filter(
    (ar, index, list) =>
      list.findIndex((p) => JSON.stringify(ar) === JSON.stringify(p)) === index
  );
