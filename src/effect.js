import { isArray, isIntegerKey } from "./util/index";

function effect(fn, options) {
  const effect = createActiveEffect(fn, options);

  if (!effect.lazy) {
    // cleanupEffect(effect);
    effect();
  }
  return effect;
}
let effectStack = [];
let activeEffect;
let uid = 0;

function createActiveEffect(fn, options) {
  const effect = function reactiveEffect() {
    effectStack.push(effect);
    activeEffect = effect;
    const result = fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
    return result;
  };
  effect.id = uid++;
  effect._isEffect = true;
  effect.deps = [];
  effect.options = options;
  return effect;
}

let targetMap = new WeakMap();
export function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
  console.log(targetMap);
}
export function trigger(target, type, key, newValue, oldValue) {
  let depsMap = targetMap.get(target);
  if (!depsMap) return;
  let deps = [];
  if (isArray(target) && key === "length") {
    //改变了数组的长度
    depsMap.forEach((dep, key) => {
      if (key === "length" || Number(key) > newValue) {
        //  收集的依赖的下标大于新长度
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      const dep = depsMap.get(key);
      if (dep) deps.push(dep);
    }
    //   新增数组的下标
    if (type === "add" && isIntegerKey(key) && isArray(target)) {
      deps.push(depsMap.get("length"));
    }
    deps.forEach((dep) => {
      [...dep].forEach((effect) => effect());
    });
  }
}

function cleanupEffect(effect) {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
  }
}

export { effect };
