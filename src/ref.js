import { track, trigger } from "./effect";
import { reactive } from "./reactive";
import { isObject } from "./util";

export function ref(val) {
  return createRef(val);
}
const convert = (val) => (isObject(val) ? reactive(val) : val);
function createRef(rawValue) {
  let value = convert(rawValue);
  const r = {
    _v_isRef: true,
    get value() {
      track(r, "value");
      return value;
    },
    set value(newValue) {
      newValue = convert(newValue);
      if (value !== newValue) {
        value = newValue;
        trigger(r, "set", "value", value);
      }
    },
  };
  return r;
}

export function toRefs(target) {
  const obj = {};
  for (const key in target) {
    if (Object.hasOwnProperty.call(target, key)) {
      obj[key] = toRef(target, key);
    }
  }
  return obj;
}

export function toRef(obj, key) {
  return {
    _v_isRef: true,
    get value() {
      return obj[key];
    },
    set value(newValue) {
      obj[key] = newValue;
    },
  };
}
