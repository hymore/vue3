import { track, trigger } from "./effect";
import { isObject, hasOwn, isArray, isIntegerKey } from "./util/index";
export function reactive(target) {
  const proxy = new Proxy(target, {
    get: function (target, key, receiver) {
      track(target, key);
      const res = Reflect.get(target, key, receiver);
      if (isObject(res)) {
        return reactive(res);
      }
      return res;
    },
    set: function (target, key, value, receiver) {
      const oldValue = target[key];
      const hadkey = //是否存在这个属性或下标
        isArray(target) && isIntegerKey(key)
          ? target.length > Number(key)
          : hasOwn(target, key);

      const res = Reflect.set(target, key, value, receiver);
      if (!hadkey) {
        trigger(target, "add", key, value, oldValue);
      } else if (oldValue !== value) {
        trigger(target, "set", key, value, oldValue);
      }
      return res;
    },
  });

  return proxy;
}
