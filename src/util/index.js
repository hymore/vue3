/**
 * 判断是否是对象
 * @param {*} data
 */
export function isObject(data) {
  return typeof data === "object" && data !== null;
}

export const isArray = (val) => Array.isArray(val);

export const isSymbol = (val) => typeof val === "symbol";

export const hasOwn = (target, key) =>
  Object.prototype.hasOwnProperty.call(target, key);

export const isIntegerKey = (key) => parseInt(key, 10) + "" === key;
