function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/**
 * 判断是否是对象
 * @param {*} data
 */
function isObject(data) {
  return _typeof(data) === "object" && data !== null;
}
var isArray = function isArray(val) {
  return Array.isArray(val);
};
var hasOwn = function hasOwn(target, key) {
  return Object.prototype.hasOwnProperty.call(target, key);
};
var isIntegerKey = function isIntegerKey(key) {
  return parseInt(key, 10) + "" === key;
};

function effect(fn, options) {
  var effect = createActiveEffect(fn, options);

  if (!effect.lazy) {
    // cleanupEffect(effect);
    effect();
  }

  return effect;
}

var effectStack = [];
var activeEffect;
var uid = 0;

function createActiveEffect(fn, options) {
  var effect = function reactiveEffect() {
    effectStack.push(effect);
    activeEffect = effect;
    var result = fn();
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

var targetMap = new WeakMap();
function track(target, key) {
  if (!activeEffect) return;
  var depsMap = targetMap.get(target);

  if (!depsMap) {
    targetMap.set(target, depsMap = new Map());
  }

  var dep = depsMap.get(key);

  if (!dep) {
    depsMap.set(key, dep = new Set());
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }

  console.log(targetMap);
}
function trigger(target, type, key, newValue, oldValue) {
  var depsMap = targetMap.get(target);
  if (!depsMap) return;
  var deps = [];

  if (isArray(target) && key === "length") {
    //改变了数组的长度
    depsMap.forEach(function (dep, key) {
      if (key === "length" || Number(key) > newValue) {
        //  收集的依赖的下标大于新长度
        deps.push(dep);
      }
    });
  } else {
    if (key !== void 0) {
      var dep = depsMap.get(key);
      if (dep) deps.push(dep);
    } //   新增数组的下标


    if (type === "add" && isIntegerKey(key) && isArray(target)) {
      deps.push(depsMap.get("length"));
    }

    deps.forEach(function (dep) {
      _toConsumableArray(dep).forEach(function (effect) {
        return effect();
      });
    });
  }
}

function reactive(target) {
  var proxy = new Proxy(target, {
    get: function get(target, key, receiver) {
      track(target, key);
      var res = Reflect.get(target, key, receiver);

      if (isObject(res)) {
        return reactive(res);
      }

      return res;
    },
    set: function set(target, key, value, receiver) {
      var oldValue = target[key];
      var hadkey = //是否存在这个属性或下标
      isArray(target) && isIntegerKey(key) ? target.length > Number(key) : hasOwn(target, key);
      var res = Reflect.set(target, key, value, receiver);

      if (!hadkey) {
        trigger(target, "add", key, value);
      } else if (oldValue !== value) {
        trigger(target, "set", key, value);
      }

      return res;
    }
  });
  return proxy;
}

function ref(val) {
  return createRef(val);
}

var convert = function convert(val) {
  return isObject(val) ? reactive(val) : val;
};

function createRef(rawValue) {
  var value = convert(rawValue);
  var r = {
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
    }

  };
  return r;
}

function toRefs(target) {
  var obj = {};

  for (var key in target) {
    if (Object.hasOwnProperty.call(target, key)) {
      obj[key] = toRef(target, key);
    }
  }

  return obj;
}
function toRef(obj, key) {
  return {
    _v_isRef: true,

    get value() {
      return obj[key];
    },

    set value(newValue) {
      obj[key] = newValue;
    }

  };
}

export { effect, reactive, ref, toRef, toRefs };
//# sourceMappingURL=vue.js.map
