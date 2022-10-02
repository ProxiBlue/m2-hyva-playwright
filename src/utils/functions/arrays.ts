export const titleCaseString = (data: string) =>
  data
    .toLowerCase()
    .split(" ")
    .map((word: string) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

export const convertStringToArray = (para: any, removeSpaces = false) =>
  removeSpaces ? [...para].filter((item) => item !== " ") : [...para];

export const countInstanceInArray = (arr: any[]) =>
  arr.reduce((obj: { [x: string]: number }, item: string | number) => {
    if (!obj[item]) obj[item] = 0;
    obj[item]++;
    return obj;
  }, {});

export const sumOfAnArray = (arr: any[], initialValue = 0) =>
  arr.reduce((a: any, b: any) => a + b, initialValue);

export const inArrayOfObjects = (
  arr: any[],
  key: string | number,
  value: any
) => arr.find((ar: { [x: string]: any }) => ar[key] === value);

export const findArrayIndex = (arr: any[], key: string | number, value: any) =>
  arr.findIndex((ar: { [x: string]: any }) => ar[key] === value);

export const getUniqueList = (arr: any[]) =>
  arr.filter(
    (ar: any, index: any, list: any[]) =>
      list.findIndex((p: any) => JSON.stringify(ar) === JSON.stringify(p)) ===
      index
  );
