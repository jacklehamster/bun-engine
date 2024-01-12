var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// src/gl/lifecycle/Disposable.ts
class Disposable {
  disposables;
  own(disposable) {
    if (!this.disposables) {
      this.disposables = new Set;
    }
    this.disposables.add(disposable);
    return disposable;
  }
  addOnDestroy(callback) {
    if (callback) {
      this.disposables?.add({
        destroy: callback
      });
    }
  }
  destroy() {
    this.disposables?.forEach((disposable) => disposable.destroy());
  }
}

// src/gl/attributes/Constants.ts
var GL = globalThis.WebGL2RenderingContext ?? {};
var POSITION_LOC = "position";
var INDEX_LOC = "index";
var TRANSFORM_LOC = "transform";
var SLOT_SIZE_LOC = "slotSize_and_number";
var INSTANCE_LOC = "instance";
var SPRITE_FLAGS_LOC = "spriteFlag";
var CAM_POS_LOC = "camPos";
var CAM_TILT_LOC = "camTilt";
var CAM_TURN_LOC = "camTurn";
var CAM_DISTANCE_LOC = "camDist";
var CAM_PROJECTION_LOC = "projection";
var CAM_CURVATURE_LOC = "curvature";
var BG_BLUR_LOC = "bgBlur";
var BG_COLOR_LOC = "bgColor";
var MAX_TEXTURE_SIZE_LOC = "maxTextureSize";
var TEXTURE_UNIFORM_LOC = "uTextures";

// src/gl/programs/GLProgram.ts
var createProgram = function(gl, vertex, fragment) {
  function createShader(shaderSource, type) {
    function typeName(type2) {
      return type2 === gl?.VERTEX_SHADER ? "vertex" : type2 === gl?.FRAGMENT_SHADER ? "fragment" : undefined;
    }
    if (type !== gl.VERTEX_SHADER && type !== gl.FRAGMENT_SHADER) {
      throw new Error(`Shader error in ${typeName(type)}`);
    }
    const shader = gl.createShader(type);
    if (!shader) {
      throw new Error(`Unable to generate ${typeName(type)} shader.`);
    }
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(`Shader compile error in ${typeName(type)}:` + gl.getShaderInfoLog(shader));
    }
    return shader;
  }
  const program = gl.createProgram();
  if (!program) {
    throw new Error(`Unable to create program.`);
  }
  const vertexShader = createShader(vertex, gl.VERTEX_SHADER);
  const fragmentShader = createShader(fragment, gl.FRAGMENT_SHADER);
  const vertexInfo = gl.getShaderInfoLog(vertexShader), fragmentInfo = gl.getShaderInfoLog(fragmentShader);
  if (vertexInfo) {
    console.log("VERTEX", vertexInfo);
  }
  if (fragmentInfo) {
    console.log("FRAGMENT", fragmentInfo);
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const programInfo = gl.getProgramInfoLog(program);
  if (programInfo) {
    console.log("PROGRAM", programInfo);
  }
  gl.detachShader(program, vertexShader);
  gl.detachShader(program, fragmentShader);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  gl.validateProgram(program);
  Object.entries(GL).forEach(([k, value]) => {
    if (value && gl.getError() === value) {
      console.log(`gl.${k}`);
    }
  });
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error("Unable to initialize the shader program:\n" + gl.getProgramInfoLog(program));
  }
  return program;
};
var deleteProgram = function(gl, program) {
  gl.deleteProgram(program);
};

class GLProgram extends Disposable {
  gl;
  program;
  constructor(gl, vertex, fragment) {
    super();
    this.gl = gl;
    this.program = createProgram(gl, vertex.trim(), fragment.trim());
  }
  use() {
    this.gl.useProgram(this.program);
  }
  destroy() {
    super.destroy();
    deleteProgram(this.gl, this.program);
  }
}

// src/gl/programs/GLPrograms.ts
class GLPrograms extends Disposable {
  activeProgramId = "";
  gl;
  programs = {};
  constructor(gl) {
    super();
    this.gl = gl;
  }
  addProgram(id, vertex, fragment) {
    if (this.programs[id]) {
      this.removeProgram(id);
    }
    this.programs[id] = this.own(new GLProgram(this.gl, vertex, fragment));
  }
  useProgram(id) {
    if (this.activeProgramId !== id) {
      this.activeProgramId = id;
      this.programs[id].use();
    }
  }
  removeProgram(id) {
    this.programs[id].destroy();
    delete this.programs[id];
  }
  getProgram(id) {
    return this.programs[id ?? this.activeProgramId]?.program;
  }
}

// src/gl/VertexArray.ts
class VertexArray {
  gl;
  triangleArray;
  constructor(gl) {
    this.gl = gl;
    this.triangleArray = gl.createVertexArray();
    gl.bindVertexArray(this.triangleArray);
  }
  destroy() {
    this.gl.deleteVertexArray(this.triangleArray);
  }
}

// src/gl/attributes/GLAttributeBuffers.ts
class GLAttributeBuffers {
  bufferRecord = {};
  gl;
  programs;
  constructor(gl, programs) {
    this.gl = gl;
    this.programs = programs;
  }
  getAttributeLocation(name, programId) {
    const program = this.programs.getProgram(programId);
    return program ? this.gl.getAttribLocation(program, name) ?? -1 : -1;
  }
  createBuffer(location) {
    this.deleteBuffer(location);
    const bufferBuffer = this.gl?.createBuffer();
    if (!bufferBuffer) {
      throw new Error(`Unable to create buffer "${location}"`);
    }
    const record = {
      buffer: bufferBuffer,
      location: this.getAttributeLocation(location)
    };
    this.bufferRecord[location] = record;
    return record;
  }
  deleteBuffer(location) {
    if (this.bufferRecord[location]) {
      this.gl.deleteBuffer(this.bufferRecord[location].buffer);
      delete this.bufferRecord[location];
    }
  }
  getAttributeBuffer(location) {
    const attribute = this.bufferRecord[location];
    if (!attribute) {
      throw new Error(`Attribute "${location}" not created. Make sure "createBuffer" is called.`);
    }
    return attribute;
  }
  destroy() {
    Object.keys(this.bufferRecord).forEach((location) => this.deleteBuffer(location));
  }
}

// src/gl/uniforms/GLUniforms.ts
class GLUniforms {
  gl;
  programs;
  constructor(gl, programs) {
    this.gl = gl;
    this.programs = programs;
  }
  getUniformLocation(name, programId) {
    const program = this.programs.getProgram(programId);
    return this.gl.getUniformLocation(program, name);
  }
}

// node_modules/avl/src/utils.js
function print(root, printNode = (n) => n.key) {
  var out = [];
  row(root, "", true, (v) => out.push(v), printNode);
  return out.join("");
}
var row = function(root, prefix, isTail, out, printNode) {
  if (root) {
    out(`${prefix}${isTail ? "\u2514\u2500\u2500 " : "\u251C\u2500\u2500 "}${printNode(root)}\n`);
    const indent = prefix + (isTail ? "    " : "\u2502   ");
    if (root.left)
      row(root.left, indent, false, out, printNode);
    if (root.right)
      row(root.right, indent, true, out, printNode);
  }
};
function isBalanced(root) {
  if (root === null)
    return true;
  var lh = height(root.left);
  var rh = height(root.right);
  if (Math.abs(lh - rh) <= 1 && isBalanced(root.left) && isBalanced(root.right))
    return true;
  return false;
}
var height = function(node) {
  return node ? 1 + Math.max(height(node.left), height(node.right)) : 0;
};
function loadRecursive(parent, keys, values, start, end) {
  const size = end - start;
  if (size > 0) {
    const middle = start + Math.floor(size / 2);
    const key = keys[middle];
    const data = values[middle];
    const node = { key, data, parent };
    node.left = loadRecursive(node, keys, values, start, middle);
    node.right = loadRecursive(node, keys, values, middle + 1, end);
    return node;
  }
  return null;
}
function markBalance(node) {
  if (node === null)
    return 0;
  const lh = markBalance(node.left);
  const rh = markBalance(node.right);
  node.balanceFactor = lh - rh;
  return Math.max(lh, rh) + 1;
}
function sort(keys, values, left, right, compare) {
  if (left >= right)
    return;
  const pivot = keys[left + right >> 1];
  let i = left - 1;
  let j = right + 1;
  while (true) {
    do
      i++;
    while (compare(keys[i], pivot) < 0);
    do
      j--;
    while (compare(keys[j], pivot) > 0);
    if (i >= j)
      break;
    let tmp = keys[i];
    keys[i] = keys[j];
    keys[j] = tmp;
    tmp = values[i];
    values[i] = values[j];
    values[j] = tmp;
  }
  sort(keys, values, left, j, compare);
  sort(keys, values, j + 1, right, compare);
}

// node_modules/avl/src/index.js
var DEFAULT_COMPARE = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};
var rotateLeft = function(node) {
  var rightNode = node.right;
  node.right = rightNode.left;
  if (rightNode.left)
    rightNode.left.parent = node;
  rightNode.parent = node.parent;
  if (rightNode.parent) {
    if (rightNode.parent.left === node) {
      rightNode.parent.left = rightNode;
    } else {
      rightNode.parent.right = rightNode;
    }
  }
  node.parent = rightNode;
  rightNode.left = node;
  node.balanceFactor += 1;
  if (rightNode.balanceFactor < 0) {
    node.balanceFactor -= rightNode.balanceFactor;
  }
  rightNode.balanceFactor += 1;
  if (node.balanceFactor > 0) {
    rightNode.balanceFactor += node.balanceFactor;
  }
  return rightNode;
};
var rotateRight = function(node) {
  var leftNode = node.left;
  node.left = leftNode.right;
  if (node.left)
    node.left.parent = node;
  leftNode.parent = node.parent;
  if (leftNode.parent) {
    if (leftNode.parent.left === node) {
      leftNode.parent.left = leftNode;
    } else {
      leftNode.parent.right = leftNode;
    }
  }
  node.parent = leftNode;
  leftNode.right = node;
  node.balanceFactor -= 1;
  if (leftNode.balanceFactor > 0) {
    node.balanceFactor -= leftNode.balanceFactor;
  }
  leftNode.balanceFactor -= 1;
  if (node.balanceFactor < 0) {
    leftNode.balanceFactor += node.balanceFactor;
  }
  return leftNode;
};

class AVLTree {
  constructor(comparator, noDuplicates = false) {
    this._comparator = comparator || DEFAULT_COMPARE;
    this._root = null;
    this._size = 0;
    this._noDuplicates = !!noDuplicates;
  }
  destroy() {
    return this.clear();
  }
  clear() {
    this._root = null;
    this._size = 0;
    return this;
  }
  get size() {
    return this._size;
  }
  contains(key) {
    if (this._root) {
      var node = this._root;
      var comparator = this._comparator;
      while (node) {
        var cmp = comparator(key, node.key);
        if (cmp === 0)
          return true;
        else if (cmp < 0)
          node = node.left;
        else
          node = node.right;
      }
    }
    return false;
  }
  next(node) {
    var successor = node;
    if (successor) {
      if (successor.right) {
        successor = successor.right;
        while (successor.left)
          successor = successor.left;
      } else {
        successor = node.parent;
        while (successor && successor.right === node) {
          node = successor;
          successor = successor.parent;
        }
      }
    }
    return successor;
  }
  prev(node) {
    var predecessor = node;
    if (predecessor) {
      if (predecessor.left) {
        predecessor = predecessor.left;
        while (predecessor.right)
          predecessor = predecessor.right;
      } else {
        predecessor = node.parent;
        while (predecessor && predecessor.left === node) {
          node = predecessor;
          predecessor = predecessor.parent;
        }
      }
    }
    return predecessor;
  }
  forEach(callback) {
    var current = this._root;
    var s = [], done = false, i = 0;
    while (!done) {
      if (current) {
        s.push(current);
        current = current.left;
      } else {
        if (s.length > 0) {
          current = s.pop();
          callback(current, i++);
          current = current.right;
        } else
          done = true;
      }
    }
    return this;
  }
  range(low, high, fn, ctx) {
    const Q = [];
    const compare = this._comparator;
    let node = this._root, cmp;
    while (Q.length !== 0 || node) {
      if (node) {
        Q.push(node);
        node = node.left;
      } else {
        node = Q.pop();
        cmp = compare(node.key, high);
        if (cmp > 0) {
          break;
        } else if (compare(node.key, low) >= 0) {
          if (fn.call(ctx, node))
            return this;
        }
        node = node.right;
      }
    }
    return this;
  }
  keys() {
    var current = this._root;
    var s = [], r = [], done = false;
    while (!done) {
      if (current) {
        s.push(current);
        current = current.left;
      } else {
        if (s.length > 0) {
          current = s.pop();
          r.push(current.key);
          current = current.right;
        } else
          done = true;
      }
    }
    return r;
  }
  values() {
    var current = this._root;
    var s = [], r = [], done = false;
    while (!done) {
      if (current) {
        s.push(current);
        current = current.left;
      } else {
        if (s.length > 0) {
          current = s.pop();
          r.push(current.data);
          current = current.right;
        } else
          done = true;
      }
    }
    return r;
  }
  at(index) {
    var current = this._root;
    var s = [], done = false, i = 0;
    while (!done) {
      if (current) {
        s.push(current);
        current = current.left;
      } else {
        if (s.length > 0) {
          current = s.pop();
          if (i === index)
            return current;
          i++;
          current = current.right;
        } else
          done = true;
      }
    }
    return null;
  }
  minNode() {
    var node = this._root;
    if (!node)
      return null;
    while (node.left)
      node = node.left;
    return node;
  }
  maxNode() {
    var node = this._root;
    if (!node)
      return null;
    while (node.right)
      node = node.right;
    return node;
  }
  min() {
    var node = this._root;
    if (!node)
      return null;
    while (node.left)
      node = node.left;
    return node.key;
  }
  max() {
    var node = this._root;
    if (!node)
      return null;
    while (node.right)
      node = node.right;
    return node.key;
  }
  isEmpty() {
    return !this._root;
  }
  pop() {
    var node = this._root, returnValue = null;
    if (node) {
      while (node.left)
        node = node.left;
      returnValue = { key: node.key, data: node.data };
      this.remove(node.key);
    }
    return returnValue;
  }
  popMax() {
    var node = this._root, returnValue = null;
    if (node) {
      while (node.right)
        node = node.right;
      returnValue = { key: node.key, data: node.data };
      this.remove(node.key);
    }
    return returnValue;
  }
  find(key) {
    var root = this._root;
    var subtree = root, cmp;
    var compare = this._comparator;
    while (subtree) {
      cmp = compare(key, subtree.key);
      if (cmp === 0)
        return subtree;
      else if (cmp < 0)
        subtree = subtree.left;
      else
        subtree = subtree.right;
    }
    return null;
  }
  insert(key, data) {
    if (!this._root) {
      this._root = {
        parent: null,
        left: null,
        right: null,
        balanceFactor: 0,
        key,
        data
      };
      this._size++;
      return this._root;
    }
    var compare = this._comparator;
    var node = this._root;
    var parent = null;
    var cmp = 0;
    if (this._noDuplicates) {
      while (node) {
        cmp = compare(key, node.key);
        parent = node;
        if (cmp === 0)
          return null;
        else if (cmp < 0)
          node = node.left;
        else
          node = node.right;
      }
    } else {
      while (node) {
        cmp = compare(key, node.key);
        parent = node;
        if (cmp <= 0)
          node = node.left;
        else
          node = node.right;
      }
    }
    var newNode = {
      left: null,
      right: null,
      balanceFactor: 0,
      parent,
      key,
      data
    };
    var newRoot;
    if (cmp <= 0)
      parent.left = newNode;
    else
      parent.right = newNode;
    while (parent) {
      cmp = compare(parent.key, key);
      if (cmp < 0)
        parent.balanceFactor -= 1;
      else
        parent.balanceFactor += 1;
      if (parent.balanceFactor === 0)
        break;
      else if (parent.balanceFactor < -1) {
        if (parent.right.balanceFactor === 1)
          rotateRight(parent.right);
        newRoot = rotateLeft(parent);
        if (parent === this._root)
          this._root = newRoot;
        break;
      } else if (parent.balanceFactor > 1) {
        if (parent.left.balanceFactor === -1)
          rotateLeft(parent.left);
        newRoot = rotateRight(parent);
        if (parent === this._root)
          this._root = newRoot;
        break;
      }
      parent = parent.parent;
    }
    this._size++;
    return newNode;
  }
  remove(key) {
    if (!this._root)
      return null;
    var node = this._root;
    var compare = this._comparator;
    var cmp = 0;
    while (node) {
      cmp = compare(key, node.key);
      if (cmp === 0)
        break;
      else if (cmp < 0)
        node = node.left;
      else
        node = node.right;
    }
    if (!node)
      return null;
    var returnValue = node.key;
    var max, min;
    if (node.left) {
      max = node.left;
      while (max.left || max.right) {
        while (max.right)
          max = max.right;
        node.key = max.key;
        node.data = max.data;
        if (max.left) {
          node = max;
          max = max.left;
        }
      }
      node.key = max.key;
      node.data = max.data;
      node = max;
    }
    if (node.right) {
      min = node.right;
      while (min.left || min.right) {
        while (min.left)
          min = min.left;
        node.key = min.key;
        node.data = min.data;
        if (min.right) {
          node = min;
          min = min.right;
        }
      }
      node.key = min.key;
      node.data = min.data;
      node = min;
    }
    var parent = node.parent;
    var pp = node;
    var newRoot;
    while (parent) {
      if (parent.left === pp)
        parent.balanceFactor -= 1;
      else
        parent.balanceFactor += 1;
      if (parent.balanceFactor < -1) {
        if (parent.right.balanceFactor === 1)
          rotateRight(parent.right);
        newRoot = rotateLeft(parent);
        if (parent === this._root)
          this._root = newRoot;
        parent = newRoot;
      } else if (parent.balanceFactor > 1) {
        if (parent.left.balanceFactor === -1)
          rotateLeft(parent.left);
        newRoot = rotateRight(parent);
        if (parent === this._root)
          this._root = newRoot;
        parent = newRoot;
      }
      if (parent.balanceFactor === -1 || parent.balanceFactor === 1)
        break;
      pp = parent;
      parent = parent.parent;
    }
    if (node.parent) {
      if (node.parent.left === node)
        node.parent.left = null;
      else
        node.parent.right = null;
    }
    if (node === this._root)
      this._root = null;
    this._size--;
    return returnValue;
  }
  load(keys = [], values = [], presort) {
    if (this._size !== 0)
      throw new Error("bulk-load: tree is not empty");
    const size = keys.length;
    if (presort)
      sort(keys, values, 0, size - 1, this._comparator);
    this._root = loadRecursive(null, keys, values, 0, size);
    markBalance(this._root);
    this._size = size;
    return this;
  }
  isBalanced() {
    return isBalanced(this._root);
  }
  toString(printNode) {
    return print(this._root, printNode);
  }
}
AVLTree.default = AVLTree;

// node_modules/texture-slot-allocator/dist/src/texture/TextureSlot.js
class TextureSlot {
  size;
  slotNumber;
  x;
  y;
  textureIndex;
  parent;
  sibbling;
  textureSizeLimits;
  constructor(size, slotNumber, parent, textureSizeLimits) {
    this.textureSizeLimits = parent?.textureSizeLimits ?? textureSizeLimits ?? { min: DEFAULT_MIN_TEXTURE_SIZE, max: DEFAULT_MAX_TEXTURE_SIZE };
    this.size = size;
    this.slotNumber = slotNumber;
    this.parent = parent;
    this.sibbling = undefined;
    const { x, y, textureIndex } = this.calculatePosition(size, slotNumber);
    this.x = x;
    this.y = y;
    this.textureIndex = textureIndex;
  }
  calculateTextureIndex(size, slotNumber) {
    const [w, h] = size;
    const slotsPerTexture = this.textureSizeLimits.max / w * (this.textureSizeLimits.max / h);
    return Math.floor(slotNumber / slotsPerTexture);
  }
  calculatePosition(size, slotNumber) {
    const [w, h] = size;
    const slotsPerRow = this.textureSizeLimits.max / w;
    const slotsPerColumn = this.textureSizeLimits.max / h;
    const x = slotNumber % slotsPerRow * w;
    const y = Math.floor(slotNumber / slotsPerRow) % slotsPerColumn * h;
    return { x, y, textureIndex: this.calculateTextureIndex(size, slotNumber) };
  }
  getTag() {
    return TextureSlot.getTag(this);
  }
  static getTag(slot) {
    return `${slot.size[0]}x${slot.size[1]}-#${slot.slotNumber}`;
  }
  static positionToTextureSlot(x, y, size, textureIndex, parent) {
    const [w, h] = size;
    const slotsPerRow = parent.textureSizeLimits.max / w;
    const slotsPerTexture = parent.textureSizeLimits.max / w * (parent.textureSizeLimits.max / h);
    const slotNumber = slotsPerTexture * textureIndex + y / h * slotsPerRow + x / w;
    return new TextureSlot(size, slotNumber, parent);
  }
  getPosition() {
    return { x: this.x, y: this.y, size: this.size, textureIndex: this.textureIndex };
  }
  canSplitHorizontally() {
    const [, h] = this.size;
    return h > this.textureSizeLimits.min;
  }
  canSplitVertically() {
    const [w] = this.size;
    return w > this.textureSizeLimits.min;
  }
  splitHorizontally() {
    const { x, y, size, textureIndex } = this;
    const [w, h] = size;
    if (!this.canSplitHorizontally()) {
      throw new Error(`Cannot split texture slot of size ${w} horizontally`);
    }
    const halfWidth = w / 2;
    const left = TextureSlot.positionToTextureSlot(x, y, [halfWidth, h], textureIndex, this);
    const right = TextureSlot.positionToTextureSlot(x + halfWidth, y, [halfWidth, h], textureIndex, this);
    left.sibbling = right;
    right.sibbling = left;
    return [left, right];
  }
  splitVertically() {
    const { x, y, size, textureIndex } = this;
    const [w, h] = size;
    if (!this.canSplitVertically()) {
      throw new Error(`Cannot split texture slot of size ${h} vertically`);
    }
    const halfHeight = h / 2;
    const top = TextureSlot.positionToTextureSlot(x, y, [w, halfHeight], textureIndex, this);
    const bottom = TextureSlot.positionToTextureSlot(x, y + halfHeight, [w, halfHeight], textureIndex, this);
    top.sibbling = bottom;
    bottom.sibbling = top;
    return [top, bottom];
  }
}

// node_modules/texture-slot-allocator/dist/src/texture/TextureUtils.js
function getMinTextureSlotSize(size, minSize) {
  return Math.max(minSize, Math.pow(2, Math.ceil(Math.log(size) / Math.log(2))));
}
function getFlexSizes(w, h, count, textureSizeLimits) {
  if (count < 1) {
    throw new Error("Invalid count");
  }
  const wFixed = getMinTextureSlotSize(w, textureSizeLimits.min), hFixed = getMinTextureSlotSize(h, textureSizeLimits.min);
  const flexSizes = new Map;
  let wSize = textureSizeLimits.min;
  for (let i = 1;i <= count; i++) {
    wSize = getMinTextureSlotSize(wFixed * i, textureSizeLimits.min);
    const hSize = getMinTextureSlotSize(hFixed * Math.ceil(count / i), textureSizeLimits.min);
    flexSizes.set(wSize, hSize);
  }
  for (let size = wSize;size <= textureSizeLimits.max; size *= 2) {
    if (!flexSizes.has(size)) {
      flexSizes.set(size, hFixed);
    }
  }
  return flexSizes;
}

// node_modules/texture-slot-allocator/dist/src/texture/TextureSlotAllocator.js
var DEBUG = false;
var DEFAULT_MIN_TEXTURE_SIZE = 16;
var DEFAULT_MAX_TEXTURE_SIZE = 4096;
var DEFAULT_NUM_TEXTURE_SHEETS = 16;

class TextureSlotAllocator2 {
  textureSlots = new AVLTree((slot1, slot2) => {
    const sizeDiff = slot1.size[0] * slot1.size[1] - slot2.size[0] * slot2.size[1];
    if (sizeDiff !== 0) {
      return sizeDiff;
    }
    return slot1.slotNumber - slot2.slotNumber;
  }, false);
  allocatedTextures = {};
  minTextureSize;
  maxTextureSize;
  numTextureSheets;
  initialSlots = [];
  constructor({ numTextureSheets, minTextureSize, maxTextureSize, excludeTexture } = {}, gl) {
    this.numTextureSheets = numTextureSheets ?? DEFAULT_NUM_TEXTURE_SHEETS;
    this.minTextureSize = minTextureSize ?? DEFAULT_MIN_TEXTURE_SIZE;
    this.maxTextureSize = maxTextureSize ?? DEFAULT_MAX_TEXTURE_SIZE;
    if (gl) {
      this.numTextureSheets = Math.min(this.numTextureSheets, gl.getParameter(WebGL2RenderingContext.MAX_TEXTURE_IMAGE_UNITS));
      this.maxTextureSize = Math.min(this.maxTextureSize, gl.getParameter(WebGL2RenderingContext.MAX_TEXTURE_SIZE));
      this.minTextureSize = Math.min(this.minTextureSize, this.maxTextureSize);
    }
    for (let i = 0;i < this.numTextureSheets; i++) {
      if (excludeTexture?.(i)) {
        continue;
      }
      this.initialSlots.push(new TextureSlot([this.maxTextureSize, this.maxTextureSize], i, undefined, {
        min: this.minTextureSize,
        max: this.maxTextureSize
      }));
    }
    this.initialSlots.forEach((slot) => this.textureSlots.insert(slot));
  }
  allocate(w, h, count = 1) {
    const { size, slotNumber, x, y, textureIndex } = this.allocateHelper(w, h, count);
    return { size, slotNumber, x, y, textureIndex };
  }
  deallocate(slot) {
    if (!this.isSlotUsed(slot)) {
      throw new Error("Slot is not allocated");
    }
    const textureSlot = this.allocatedTextures[TextureSlot.getTag(slot)];
    this.deallocateHelper(textureSlot);
  }
  get countUsedTextureSheets() {
    return this.initialSlots.filter((slot) => this.isSlotUsed(slot)).length;
  }
  allocateHelper(w, h, count = 1) {
    const flexSizes = getFlexSizes(w, h, count, { min: this.minTextureSize, max: this.maxTextureSize });
    const slot = this.findSlot(flexSizes);
    if (!slot) {
      throw new Error(`Could not find a slot for texture to fit ${count} sprites of size ${w}x${h}`);
    }
    this.textureSlots.remove(slot);
    const [bestWidth, bestHeight] = this.bestFit(flexSizes, slot);
    return this.fitSlot(slot, bestWidth, bestHeight);
  }
  findSlot(flexSizes) {
    for (let i = 0;i < this.textureSlots.size; i++) {
      const slot = this.textureSlots.at(i);
      const textureSlot = slot.key;
      const [w, h] = textureSlot.size;
      if (flexSizes.get(w) <= h) {
        return textureSlot;
      }
    }
    return null;
  }
  calculateRatio(w, h) {
    return Math.max(w / h, h / w);
  }
  bestFit(flexSizes, slot) {
    const [slotWidth, slotHeight] = slot.size;
    let bestWidth = slot.textureSizeLimits.max;
    flexSizes.forEach((hSize, wSize) => {
      if (wSize <= slotWidth && hSize <= slotHeight) {
        const product = wSize * hSize;
        const bestProduct = flexSizes.get(bestWidth) * bestWidth;
        if (product < bestProduct) {
          bestWidth = wSize;
        } else if (product === bestProduct) {
          const ratio = this.calculateRatio(wSize, hSize);
          if (ratio < this.calculateRatio(bestWidth, flexSizes.get(bestWidth))) {
            bestWidth = wSize;
          }
        }
      }
    });
    return [bestWidth, flexSizes.get(bestWidth)];
  }
  isSlotUsed(slot) {
    return !!this.allocatedTextures[TextureSlot.getTag(slot)];
  }
  deallocateHelper(slot) {
    if (slot.parent && slot.sibbling && !this.isSlotUsed(slot.sibbling)) {
      const sibbling = slot.sibbling;
      this.textureSlots.remove(sibbling);
      if (DEBUG && this.textureSlots.find(slot)) {
        throw new Error("Slot is not expected to be in the tree");
      }
      const parent = slot.parent;
      this.deallocateHelper(parent);
      return;
    }
    this.textureSlots.insert(slot);
    delete this.allocatedTextures[slot.getTag()];
  }
  trySplitHorizontally(slot, w, h) {
    if (slot.canSplitHorizontally()) {
      const [leftColumn, rightColumn] = slot.splitHorizontally();
      if (leftColumn.size[0] >= w) {
        this.textureSlots.insert(rightColumn);
        return this.fitSlot(leftColumn, w, h);
      }
    }
    return null;
  }
  trySplitVertically(slot, w, h) {
    if (slot.canSplitVertically()) {
      const [topRow, bottomRow] = slot.splitVertically();
      if (topRow.size[1] >= h) {
        this.textureSlots.insert(bottomRow);
        return this.fitSlot(topRow, w, h);
      }
    }
    return null;
  }
  fitSlot(slot, w, h) {
    this.allocatedTextures[slot.getTag()] = slot;
    if (slot.size[0] > slot.size[1]) {
      const splitAttempt = this.trySplitHorizontally(slot, w, h) ?? this.trySplitVertically(slot, w, h);
      if (splitAttempt) {
        return splitAttempt;
      }
    } else {
      const splitAttempt = this.trySplitVertically(slot, w, h) ?? this.trySplitHorizontally(slot, w, h);
      if (splitAttempt) {
        return splitAttempt;
      }
    }
    return slot;
  }
  listSlots() {
    this.textureSlots.forEach((node) => {
      console.log(node.key?.getTag());
    });
  }
}

// src/gl/texture/TextureManager.ts
var TEXTURE_INDEX_FOR_VIDEO = 15;

class TextureManager extends Disposable {
  gl;
  uniforms;
  textureBuffers = {};
  tempContext = new OffscreenCanvas(1, 1).getContext("2d");
  textureSlotAllocator = new TextureSlotAllocator2({
    excludeTexture: (tex) => tex === TEXTURE_INDEX_FOR_VIDEO
  });
  textureSlotAllocatorForVideo = new TextureSlotAllocator2({
    excludeTexture: (tex) => tex !== TEXTURE_INDEX_FOR_VIDEO
  });
  constructor(gl, uniforms) {
    super();
    this.gl = gl;
    this.uniforms = uniforms;
    this.tempContext.imageSmoothingEnabled = true;
  }
  initialize() {
    this.initTextureUniforms();
    this.initMaxTexture();
  }
  getTexture(textureId) {
    if (!this.textureBuffers[textureId]) {
      const texture = this.gl.createTexture();
      if (!texture) {
        return;
      }
      this.gl.bindTexture(GL.TEXTURE_2D, texture);
      this.gl.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.textureSlotAllocator.maxTextureSize, this.textureSlotAllocator.maxTextureSize, 0, GL.RGBA, GL.UNSIGNED_BYTE, null);
      this.textureBuffers[textureId] = texture;
      this.addOnDestroy(() => this.gl.deleteTexture(texture));
    }
    return this.textureBuffers[textureId];
  }
  loadTexture(mediaInfo, textureId, texture, sourceRect, destRect) {
    this.gl.activeTexture(GL[textureId]);
    this.gl.bindTexture(GL.TEXTURE_2D, texture);
    this.applyTexImage2d(mediaInfo, sourceRect, destRect);
    this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
  }
  applyTexImage2d(mediaInfo, [srcX, srcY, srcWidth, srcHeight], [dstX, dstY, dstWidth, dstHeight]) {
    if (srcWidth === dstWidth && srcHeight === dstHeight && !srcX && !srcY) {
      this.gl.texSubImage2D(GL.TEXTURE_2D, 0, dstX, dstY, dstWidth, dstHeight, GL.RGBA, GL.UNSIGNED_BYTE, mediaInfo.texImgSrc);
    } else {
      const canvas = this.tempContext.canvas;
      if (mediaInfo.texImgSrc instanceof ImageData) {
        canvas.width = dstWidth || mediaInfo.width;
        canvas.height = dstHeight || mediaInfo.height;
        this.tempContext.putImageData(mediaInfo.texImgSrc, 0, 0);
        if (srcX || srcY) {
          console.warn("Offset not available when sending imageData");
        }
      } else {
        const sourceWidth = srcWidth || mediaInfo.width;
        const sourceHeight = srcHeight || mediaInfo.height;
        canvas.width = dstWidth || sourceWidth;
        canvas.height = dstHeight || sourceHeight;
        this.tempContext.drawImage(mediaInfo.texImgSrc, srcX, srcY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      }
      this.gl.texSubImage2D(GL.TEXTURE_2D, 0, dstX, dstY, canvas.width, canvas.height, GL.RGBA, GL.UNSIGNED_BYTE, canvas);
    }
  }
  allocateSlotForImage(mediaInfo) {
    const allocator = mediaInfo.isVideo ? this.textureSlotAllocatorForVideo : this.textureSlotAllocator;
    const slot = allocator.allocate(mediaInfo.width, mediaInfo.height);
    const textureId = `TEXTURE${slot.textureIndex}`;
    const webGLTexture = this.getTexture(textureId);
    if (!webGLTexture) {
      throw new Error(`Invalid texture Id ${textureId}`);
    }
    const refreshCallback = this.assignImageToTexture(mediaInfo, textureId, webGLTexture, [0, 0, mediaInfo.width, mediaInfo.height], [slot.x, slot.y, ...slot.size]);
    return { slot, refreshCallback };
  }
  assignImageToTexture(imageInfo, textureId, texture, sourceRect, destRect) {
    const srcRect = sourceRect ?? [0, 0, imageInfo.width, imageInfo.height];
    const dstRect = destRect ?? [0, 0, srcRect[2], srcRect[3]];
    const refreshTexture = () => {
      this.gl.bindTexture(GL.TEXTURE_2D, texture);
      this.applyTexImage2d(imageInfo, srcRect, dstRect);
    };
    if (imageInfo.active) {
      refreshTexture();
    } else {
      this.loadTexture(imageInfo, textureId, texture, srcRect, dstRect);
      imageInfo.active = true;
    }
    return refreshTexture;
  }
  setupTextureForVideo(textureId) {
    const texture = this.getTexture(textureId);
    if (texture) {
      this.gl.activeTexture(GL[textureId]);
      this.gl.bindTexture(GL.TEXTURE_2D, texture);
      this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
      this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
    }
  }
  generateMipMap(textureId) {
    const texture = this.getTexture(textureId);
    if (texture) {
      this.gl.activeTexture(GL[textureId]);
      this.gl.bindTexture(GL.TEXTURE_2D, texture);
      this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR_MIPMAP_LINEAR);
      this.gl.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
      this.gl.generateMipmap(GL.TEXTURE_2D);
    }
  }
  initTextureUniforms() {
    const maxTextureUnits = this.gl.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);
    const arrayOfTextureIndex = new Array(maxTextureUnits).fill(null).map((_, index) => index);
    const textureUniformLocation = this.uniforms.getUniformLocation(TEXTURE_UNIFORM_LOC);
    this.gl.uniform1iv(textureUniformLocation, arrayOfTextureIndex);
  }
  initMaxTexture() {
    const loc = this.uniforms.getUniformLocation(MAX_TEXTURE_SIZE_LOC);
    this.gl.uniform1f(loc, this.textureSlotAllocator.maxTextureSize);
  }
}

// src/gl/texture/MediaData.ts
class MediaData extends Disposable {
  texImgSrc;
  active = false;
  width;
  height;
  isVideo;
  schedule;
  constructor(image, refreshRate) {
    super();
    this.texImgSrc = image;
    const img = image;
    this.isVideo = !!(img.videoWidth || img.videoHeight);
    this.width = img.naturalWidth ?? img.videoWidth ?? img.displayWidth ?? img.width?.baseValue?.value ?? img.width;
    this.height = img.naturalHeight ?? img.videoHeight ?? img.displayHeight ?? img.height?.baseValue?.value ?? img.height;
    this.schedule = refreshRate ? { period: 1000 / refreshRate } : undefined;
    if (!this.width || !this.height) {
      throw new Error("Invalid image");
    }
  }
  refresh() {
    this.refreshCallback?.();
  }
  static createFromCanvas(canvas) {
    return new MediaData(canvas);
  }
  static async loadImage(src) {
    const image = await new Promise((resolve, reject) => {
      const image2 = new Image;
      image2.crossOrigin = "anonymous";
      const imageError = (e) => reject(e.error);
      image2.addEventListener("error", imageError);
      image2.addEventListener("load", () => resolve(image2), { once: true });
      image2.src = src;
    });
    return new MediaData(image);
  }
  static async loadVideo(src, volume, fps = 30, playSpeed = 1, maxRefreshRate = Number.MAX_SAFE_INTEGER) {
    const video = await new Promise((resolve, reject) => {
      const video2 = document.createElement("video");
      video2.loop = true;
      if (volume !== undefined) {
        video2.volume = volume;
      }
      video2.addEventListener("loadedmetadata", () => {
        video2.play();
        video2.playbackRate = playSpeed;
        resolve(video2);
      }, { once: true });
      document.addEventListener("focus", () => video2.play());
      video2.addEventListener("error", (e) => reject(e.error));
      video2.src = src;
    });
    const videoInfo = new MediaData(video, Math.min(fps * playSpeed, maxRefreshRate));
    videoInfo.addOnDestroy(() => video.pause());
    return videoInfo;
  }
  static async loadWebcam(deviceId) {
    const video = await new Promise((resolve, reject) => {
      const video2 = document.createElement("video");
      video2.loop = true;
      video2.addEventListener("loadedmetadata", () => video2.play());
      video2.addEventListener("playing", () => resolve(video2), { once: true });
      video2.addEventListener("error", (e) => reject(e.error));
    });
    const videoInfo = new MediaData(video);
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: { deviceId } }).then((stream) => {
      if (!cancelled) {
        video.srcObject = stream;
        videoInfo.addOnDestroy(() => stream.getTracks().forEach((track) => track.stop()));
      }
    });
    videoInfo.addOnDestroy(() => {
      cancelled = true;
      video.pause();
    });
    return videoInfo;
  }
}

// src/gl/texture/ImageManager.ts
var createDrawProcedure = function(procedure) {
  return procedure;
};

class ImageManager extends Disposable {
  constructor() {
    super(...arguments);
  }
  images = {};
  renderProcedures = {
    image: createDrawProcedure((imageId, media) => this.loadImage(imageId, media.src)),
    video: createDrawProcedure((imageId, media) => this.loadVideo(imageId, media.src, media.volume, media.fps, media.playSpeed)),
    draw: createDrawProcedure((imageId, media) => this.drawImage(imageId, media.draw)),
    canvas: createDrawProcedure((imageId, media) => this.loadCanvas(imageId, media.canvas)),
    webcam: createDrawProcedure((imageId, media) => this.loadWebCam(imageId, media.deviceId))
  };
  hasImageId(imageId) {
    return !!this.getMedia(imageId);
  }
  getMedia(imageId) {
    return this.images[imageId];
  }
  setImage(imageId, mediaInfo) {
    this.images[imageId] = mediaInfo;
  }
  async renderMedia(imageId, media) {
    return this.renderProcedures[media.type](imageId, media);
  }
  async drawImage(imageId, drawProcedure) {
    const canvas = new OffscreenCanvas(1, 1);
    drawProcedure(canvas.getContext("2d"));
    const imageInfo = MediaData.createFromCanvas(canvas);
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }
  async loadCanvas(imageId, canvas) {
    const imageInfo = MediaData.createFromCanvas(canvas);
    canvas.getContext("2d");
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }
  async loadImage(imageId, src) {
    const imageInfo = await MediaData.loadImage(src);
    this.images[imageId] = this.own(imageInfo);
    return imageInfo;
  }
  async loadVideo(imageId, src, volume, fps, playSpeed, maxRefreshRate) {
    const videoInfo = await MediaData.loadVideo(src, volume, fps, playSpeed, maxRefreshRate);
    this.images[imageId] = this.own(videoInfo);
    return videoInfo;
  }
  async loadWebCam(imageId, deviceId) {
    const videoInfo = await MediaData.loadWebcam(deviceId);
    this.images[imageId] = this.own(videoInfo);
    return videoInfo;
  }
}

// src/generated/src/gl/resources/vertexShader.txt
var vertexShader_default = `#version 300 es
//  ~{AUTHOR}

precision highp float;

//  IN
//  shape
layout(location = 0) in vec2 position;
layout(location = 1) in mat4 transform;
//  1, 2, 3, 4 reserved for transform
//  animation
layout(location = 5) in vec2 slotSize_and_number;
//  instance
layout(location = 6) in float instance;
layout(location = 7) in float spriteFlag;

//  UNIFORM
uniform float maxTextureSize;
uniform mat4 camPos;
uniform mat4 camTurn;
uniform mat4 camTilt;
uniform float camDist;
uniform mat4 projection;
uniform float curvature;

//  OUT
out vec2 vTex;
out float vTextureIndex;
out vec3 vInstanceColor;
out float dist;

void main() {
  vec2 tex = position.xy * vec2(0.49, -0.49) + 0.5;
  vec2 slotSize = vec2(
    pow(2.0, floor(slotSize_and_number.x / 16.0)),
    pow(2.0, mod(slotSize_and_number.x, 16.0)));
  float slotNumber = slotSize_and_number.y;
  float maxCols = maxTextureSize / slotSize.x;
  float maxRows = maxTextureSize / slotSize.y;
  float slotX = mod(slotNumber, maxCols);
  float slotY = mod(floor(slotNumber / maxCols), maxRows);

  vec4 elemPosition = transform * vec4(position, 0.0, 1.0);
  // elementPosition => relativePosition
  vec4 relativePosition = camTilt * camTurn * camPos * elemPosition;
  relativePosition.z -= camDist;
  relativePosition.y -= curvature * ((relativePosition.z * relativePosition.z) + (relativePosition.x * relativePosition.x) / 4.) / 10.;
  relativePosition.x /= (1. + curvature * 1.4);
  dist = (relativePosition.z*relativePosition.z + relativePosition.x*relativePosition.x);
  // relativePosition => gl_Position
  gl_Position = projection * relativePosition;

  vTex = (vec2(slotX, slotY) + tex) * slotSize / maxTextureSize;
  vTextureIndex = floor(slotNumber / (maxCols * maxRows));

  //  instance
  float r = fract(instance / (256.0 * 256.0 * 255.0));
  float g = fract(instance / (256.0 * 255.0));
  float b = fract(instance / 255.0);
  vInstanceColor = vec3(r, g, b);

  // DUMMY
  vInstanceColor.x += spriteFlag;
}
`;

// src/generated/src/gl/resources/fragmentShader.txt
var fragmentShader_default = `#version 300 es
//  ~{AUTHOR}
precision highp float;

//  CONST
const int NUM_TEXTURES = 16;
const float threshold = 0.00001;

//  IN
//  texture
in float vTextureIndex;
in vec2 vTex;
in float opacity;
in vec3 vInstanceColor;
in float dist;

//  OUT
out vec4 fragColor;

// UNIFORMS
uniform sampler2D uTextures[NUM_TEXTURES];
uniform vec3 bgColor;
uniform float bgBlur;

//  FUNCTIONS
vec4 getTextureColor(float textureSlot, vec2 vTexturePoint);

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453) - .5;
}

void main() {
  vec2 vFragment = vTex;
  float blur = bgBlur * pow(dist, .9) / 20000.;
  vec4 color = getTextureColor(vTextureIndex, vTex);
  if (color.a <= .2) {
    discard;
  };
  int blurPass = 3;
  for (int i = 0; i < blurPass; i++) {
    vFragment = vTex + blur * rand(vTex + dist * float(i));
    color += getTextureColor(vTextureIndex, vFragment);
  }
  color /= float(blurPass + 1);

  color.a = 1.;
  float colorFactor = 1.25 * pow(dist, -.12);
  color.rgb = (color.rgb * colorFactor) + (bgColor * (1. - colorFactor));
  fragColor = color;
//  fragColor = vec4(vInstanceColor.rgb, 1.0);
}

vec4 getTextureColor(float textureSlot, vec2 vTexturePoint) {
  if (abs(0.0 - textureSlot) < threshold) {
    return texture(uTextures[0], vTexturePoint);
  }
  if (abs(1.0 - textureSlot) < threshold) {
    return texture(uTextures[1], vTexturePoint);
  }
  if (abs(2.0 - textureSlot) < threshold) {
    return texture(uTextures[2], vTexturePoint);
  }
  if (abs(3.0 - textureSlot) < threshold) {
    return texture(uTextures[3], vTexturePoint);
  }
  if (abs(4.0 - textureSlot) < threshold) {
    return texture(uTextures[4], vTexturePoint);
  }
  if (abs(5.0 - textureSlot) < threshold) {
    return texture(uTextures[5], vTexturePoint);
  }
  if (abs(6.0 - textureSlot) < threshold) {
    return texture(uTextures[6], vTexturePoint);
  }
  if (abs(7.0 - textureSlot) < threshold) {
    return texture(uTextures[7], vTexturePoint);
  }
  if (abs(8.0 - textureSlot) < threshold) {
    return texture(uTextures[8], vTexturePoint);
  }
  if (abs(9.0 - textureSlot) < threshold) {
    return texture(uTextures[9], vTexturePoint);
  }
  if (abs(10.0 - textureSlot) < threshold) {
    return texture(uTextures[10], vTexturePoint);
  }
  if (abs(11.0 - textureSlot) < threshold) {
    return texture(uTextures[11], vTexturePoint);
  }
  if (abs(12.0 - textureSlot) < threshold) {
    return texture(uTextures[12], vTexturePoint);
  }
  if (abs(13.0 - textureSlot) < threshold) {
    return texture(uTextures[13], vTexturePoint);
  }
  if (abs(14.0 - textureSlot) < threshold) {
    return texture(uTextures[14], vTexturePoint);
  }
  if (abs(15.0 - textureSlot) < threshold) {
    return texture(uTextures[15], vTexturePoint);
  }
  return texture(uTextures[0], vTexturePoint);
}
`;

// src/gl/utils/replaceTilda.ts
function replaceTilda(inputString, replacementMap) {
  return inputString.replace(/~\{(\w+)\}/g, (match, variable) => {
    return replacementMap?.[variable] || match;
  });
}

// node_modules/gl-matrix/esm/common.js
var EPSILON = 0.000001;
var ARRAY_TYPE = typeof Float32Array !== "undefined" ? Float32Array : Array;
var RANDOM = Math.random;
var degree = Math.PI / 180;
if (!Math.hypot)
  Math.hypot = function() {
    var y = 0, i = arguments.length;
    while (i--) {
      y += arguments[i] * arguments[i];
    }
    return Math.sqrt(y);
  };

// node_modules/gl-matrix/esm/mat3.js
function create() {
  var out = new ARRAY_TYPE(9);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
  }
  out[0] = 1;
  out[4] = 1;
  out[8] = 1;
  return out;
}

// node_modules/gl-matrix/esm/mat4.js
var exports_mat4 = {};
__export(exports_mat4, {
  transpose: () => {
    {
      return transpose;
    }
  },
  translate: () => {
    {
      return translate;
    }
  },
  targetTo: () => {
    {
      return targetTo;
    }
  },
  subtract: () => {
    {
      return subtract;
    }
  },
  sub: () => {
    {
      return sub;
    }
  },
  str: () => {
    {
      return str;
    }
  },
  set: () => {
    {
      return set;
    }
  },
  scale: () => {
    {
      return scale;
    }
  },
  rotateZ: () => {
    {
      return rotateZ;
    }
  },
  rotateY: () => {
    {
      return rotateY;
    }
  },
  rotateX: () => {
    {
      return rotateX;
    }
  },
  rotate: () => {
    {
      return rotate;
    }
  },
  perspectiveZO: () => {
    {
      return perspectiveZO;
    }
  },
  perspectiveNO: () => {
    {
      return perspectiveNO;
    }
  },
  perspectiveFromFieldOfView: () => {
    {
      return perspectiveFromFieldOfView;
    }
  },
  perspective: () => {
    {
      return perspective;
    }
  },
  orthoZO: () => {
    {
      return orthoZO;
    }
  },
  orthoNO: () => {
    {
      return orthoNO;
    }
  },
  ortho: () => {
    {
      return ortho;
    }
  },
  multiplyScalarAndAdd: () => {
    {
      return multiplyScalarAndAdd;
    }
  },
  multiplyScalar: () => {
    {
      return multiplyScalar;
    }
  },
  multiply: () => {
    {
      return multiply;
    }
  },
  mul: () => {
    {
      return mul;
    }
  },
  lookAt: () => {
    {
      return lookAt;
    }
  },
  invert: () => {
    {
      return invert;
    }
  },
  identity: () => {
    {
      return identity;
    }
  },
  getTranslation: () => {
    {
      return getTranslation;
    }
  },
  getScaling: () => {
    {
      return getScaling;
    }
  },
  getRotation: () => {
    {
      return getRotation;
    }
  },
  frustum: () => {
    {
      return frustum;
    }
  },
  fromZRotation: () => {
    {
      return fromZRotation;
    }
  },
  fromYRotation: () => {
    {
      return fromYRotation;
    }
  },
  fromXRotation: () => {
    {
      return fromXRotation;
    }
  },
  fromValues: () => {
    {
      return fromValues;
    }
  },
  fromTranslation: () => {
    {
      return fromTranslation;
    }
  },
  fromScaling: () => {
    {
      return fromScaling;
    }
  },
  fromRotationTranslationScaleOrigin: () => {
    {
      return fromRotationTranslationScaleOrigin;
    }
  },
  fromRotationTranslationScale: () => {
    {
      return fromRotationTranslationScale;
    }
  },
  fromRotationTranslation: () => {
    {
      return fromRotationTranslation;
    }
  },
  fromRotation: () => {
    {
      return fromRotation;
    }
  },
  fromQuat2: () => {
    {
      return fromQuat2;
    }
  },
  fromQuat: () => {
    {
      return fromQuat;
    }
  },
  frob: () => {
    {
      return frob;
    }
  },
  exactEquals: () => {
    {
      return exactEquals;
    }
  },
  equals: () => {
    {
      return equals;
    }
  },
  determinant: () => {
    {
      return determinant;
    }
  },
  create: () => {
    {
      return create2;
    }
  },
  copy: () => {
    {
      return copy;
    }
  },
  clone: () => {
    {
      return clone;
    }
  },
  adjoint: () => {
    {
      return adjoint;
    }
  },
  add: () => {
    {
      return add;
    }
  }
});
function create2() {
  var out = new ARRAY_TYPE(16);
  if (ARRAY_TYPE != Float32Array) {
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
  }
  out[0] = 1;
  out[5] = 1;
  out[10] = 1;
  out[15] = 1;
  return out;
}
function clone(a) {
  var out = new ARRAY_TYPE(16);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function copy(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  out[4] = a[4];
  out[5] = a[5];
  out[6] = a[6];
  out[7] = a[7];
  out[8] = a[8];
  out[9] = a[9];
  out[10] = a[10];
  out[11] = a[11];
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function fromValues(m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  var out = new ARRAY_TYPE(16);
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function set(out, m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
  out[0] = m00;
  out[1] = m01;
  out[2] = m02;
  out[3] = m03;
  out[4] = m10;
  out[5] = m11;
  out[6] = m12;
  out[7] = m13;
  out[8] = m20;
  out[9] = m21;
  out[10] = m22;
  out[11] = m23;
  out[12] = m30;
  out[13] = m31;
  out[14] = m32;
  out[15] = m33;
  return out;
}
function identity(out) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function transpose(out, a) {
  if (out === a) {
    var a01 = a[1], a02 = a[2], a03 = a[3];
    var a12 = a[6], a13 = a[7];
    var a23 = a[11];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a01;
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a02;
    out[9] = a12;
    out[11] = a[14];
    out[12] = a03;
    out[13] = a13;
    out[14] = a23;
  } else {
    out[0] = a[0];
    out[1] = a[4];
    out[2] = a[8];
    out[3] = a[12];
    out[4] = a[1];
    out[5] = a[5];
    out[6] = a[9];
    out[7] = a[13];
    out[8] = a[2];
    out[9] = a[6];
    out[10] = a[10];
    out[11] = a[14];
    out[12] = a[3];
    out[13] = a[7];
    out[14] = a[11];
    out[15] = a[15];
  }
  return out;
}
function invert(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) {
    return null;
  }
  det = 1 / det;
  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return out;
}
function adjoint(out, a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  out[0] = a11 * (a22 * a33 - a23 * a32) - a21 * (a12 * a33 - a13 * a32) + a31 * (a12 * a23 - a13 * a22);
  out[1] = -(a01 * (a22 * a33 - a23 * a32) - a21 * (a02 * a33 - a03 * a32) + a31 * (a02 * a23 - a03 * a22));
  out[2] = a01 * (a12 * a33 - a13 * a32) - a11 * (a02 * a33 - a03 * a32) + a31 * (a02 * a13 - a03 * a12);
  out[3] = -(a01 * (a12 * a23 - a13 * a22) - a11 * (a02 * a23 - a03 * a22) + a21 * (a02 * a13 - a03 * a12));
  out[4] = -(a10 * (a22 * a33 - a23 * a32) - a20 * (a12 * a33 - a13 * a32) + a30 * (a12 * a23 - a13 * a22));
  out[5] = a00 * (a22 * a33 - a23 * a32) - a20 * (a02 * a33 - a03 * a32) + a30 * (a02 * a23 - a03 * a22);
  out[6] = -(a00 * (a12 * a33 - a13 * a32) - a10 * (a02 * a33 - a03 * a32) + a30 * (a02 * a13 - a03 * a12));
  out[7] = a00 * (a12 * a23 - a13 * a22) - a10 * (a02 * a23 - a03 * a22) + a20 * (a02 * a13 - a03 * a12);
  out[8] = a10 * (a21 * a33 - a23 * a31) - a20 * (a11 * a33 - a13 * a31) + a30 * (a11 * a23 - a13 * a21);
  out[9] = -(a00 * (a21 * a33 - a23 * a31) - a20 * (a01 * a33 - a03 * a31) + a30 * (a01 * a23 - a03 * a21));
  out[10] = a00 * (a11 * a33 - a13 * a31) - a10 * (a01 * a33 - a03 * a31) + a30 * (a01 * a13 - a03 * a11);
  out[11] = -(a00 * (a11 * a23 - a13 * a21) - a10 * (a01 * a23 - a03 * a21) + a20 * (a01 * a13 - a03 * a11));
  out[12] = -(a10 * (a21 * a32 - a22 * a31) - a20 * (a11 * a32 - a12 * a31) + a30 * (a11 * a22 - a12 * a21));
  out[13] = a00 * (a21 * a32 - a22 * a31) - a20 * (a01 * a32 - a02 * a31) + a30 * (a01 * a22 - a02 * a21);
  out[14] = -(a00 * (a11 * a32 - a12 * a31) - a10 * (a01 * a32 - a02 * a31) + a30 * (a01 * a12 - a02 * a11));
  out[15] = a00 * (a11 * a22 - a12 * a21) - a10 * (a01 * a22 - a02 * a21) + a20 * (a01 * a12 - a02 * a11);
  return out;
}
function determinant(a) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b00 = a00 * a11 - a01 * a10;
  var b01 = a00 * a12 - a02 * a10;
  var b02 = a00 * a13 - a03 * a10;
  var b03 = a01 * a12 - a02 * a11;
  var b04 = a01 * a13 - a03 * a11;
  var b05 = a02 * a13 - a03 * a12;
  var b06 = a20 * a31 - a21 * a30;
  var b07 = a20 * a32 - a22 * a30;
  var b08 = a20 * a33 - a23 * a30;
  var b09 = a21 * a32 - a22 * a31;
  var b10 = a21 * a33 - a23 * a31;
  var b11 = a22 * a33 - a23 * a32;
  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
}
function multiply(out, a, b) {
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
  var a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
  var a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
  var a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[4];
  b1 = b[5];
  b2 = b[6];
  b3 = b[7];
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[8];
  b1 = b[9];
  b2 = b[10];
  b3 = b[11];
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  b0 = b[12];
  b1 = b[13];
  b2 = b[14];
  b3 = b[15];
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
  return out;
}
function translate(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  if (a === out) {
    out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
    out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
    out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
    out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
  } else {
    a00 = a[0];
    a01 = a[1];
    a02 = a[2];
    a03 = a[3];
    a10 = a[4];
    a11 = a[5];
    a12 = a[6];
    a13 = a[7];
    a20 = a[8];
    a21 = a[9];
    a22 = a[10];
    a23 = a[11];
    out[0] = a00;
    out[1] = a01;
    out[2] = a02;
    out[3] = a03;
    out[4] = a10;
    out[5] = a11;
    out[6] = a12;
    out[7] = a13;
    out[8] = a20;
    out[9] = a21;
    out[10] = a22;
    out[11] = a23;
    out[12] = a00 * x + a10 * y + a20 * z + a[12];
    out[13] = a01 * x + a11 * y + a21 * z + a[13];
    out[14] = a02 * x + a12 * y + a22 * z + a[14];
    out[15] = a03 * x + a13 * y + a23 * z + a[15];
  }
  return out;
}
function scale(out, a, v) {
  var x = v[0], y = v[1], z = v[2];
  out[0] = a[0] * x;
  out[1] = a[1] * x;
  out[2] = a[2] * x;
  out[3] = a[3] * x;
  out[4] = a[4] * y;
  out[5] = a[5] * y;
  out[6] = a[6] * y;
  out[7] = a[7] * y;
  out[8] = a[8] * z;
  out[9] = a[9] * z;
  out[10] = a[10] * z;
  out[11] = a[11] * z;
  out[12] = a[12];
  out[13] = a[13];
  out[14] = a[14];
  out[15] = a[15];
  return out;
}
function rotate(out, a, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  var a00, a01, a02, a03;
  var a10, a11, a12, a13;
  var a20, a21, a22, a23;
  var b00, b01, b02;
  var b10, b11, b12;
  var b20, b21, b22;
  if (len < EPSILON) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  a00 = a[0];
  a01 = a[1];
  a02 = a[2];
  a03 = a[3];
  a10 = a[4];
  a11 = a[5];
  a12 = a[6];
  a13 = a[7];
  a20 = a[8];
  a21 = a[9];
  a22 = a[10];
  a23 = a[11];
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;
  out[0] = a00 * b00 + a10 * b01 + a20 * b02;
  out[1] = a01 * b00 + a11 * b01 + a21 * b02;
  out[2] = a02 * b00 + a12 * b01 + a22 * b02;
  out[3] = a03 * b00 + a13 * b01 + a23 * b02;
  out[4] = a00 * b10 + a10 * b11 + a20 * b12;
  out[5] = a01 * b10 + a11 * b11 + a21 * b12;
  out[6] = a02 * b10 + a12 * b11 + a22 * b12;
  out[7] = a03 * b10 + a13 * b11 + a23 * b12;
  out[8] = a00 * b20 + a10 * b21 + a20 * b22;
  out[9] = a01 * b20 + a11 * b21 + a21 * b22;
  out[10] = a02 * b20 + a12 * b21 + a22 * b22;
  out[11] = a03 * b20 + a13 * b21 + a23 * b22;
  if (a !== out) {
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  return out;
}
function rotateX(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    out[3] = a[3];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;
  return out;
}
function rotateY(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a20 = a[8];
  var a21 = a[9];
  var a22 = a[10];
  var a23 = a[11];
  if (a !== out) {
    out[4] = a[4];
    out[5] = a[5];
    out[6] = a[6];
    out[7] = a[7];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;
  return out;
}
function rotateZ(out, a, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  var a00 = a[0];
  var a01 = a[1];
  var a02 = a[2];
  var a03 = a[3];
  var a10 = a[4];
  var a11 = a[5];
  var a12 = a[6];
  var a13 = a[7];
  if (a !== out) {
    out[8] = a[8];
    out[9] = a[9];
    out[10] = a[10];
    out[11] = a[11];
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
  }
  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;
  return out;
}
function fromTranslation(out, v) {
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromScaling(out, v) {
  out[0] = v[0];
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = v[1];
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = v[2];
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotation(out, rad, axis) {
  var x = axis[0], y = axis[1], z = axis[2];
  var len = Math.hypot(x, y, z);
  var s, c, t;
  if (len < EPSILON) {
    return null;
  }
  len = 1 / len;
  x *= len;
  y *= len;
  z *= len;
  s = Math.sin(rad);
  c = Math.cos(rad);
  t = 1 - c;
  out[0] = x * x * t + c;
  out[1] = y * x * t + z * s;
  out[2] = z * x * t - y * s;
  out[3] = 0;
  out[4] = x * y * t - z * s;
  out[5] = y * y * t + c;
  out[6] = z * y * t + x * s;
  out[7] = 0;
  out[8] = x * z * t + y * s;
  out[9] = y * z * t - x * s;
  out[10] = z * z * t + c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromXRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = 1;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = c;
  out[6] = s;
  out[7] = 0;
  out[8] = 0;
  out[9] = -s;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromYRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = 0;
  out[2] = -s;
  out[3] = 0;
  out[4] = 0;
  out[5] = 1;
  out[6] = 0;
  out[7] = 0;
  out[8] = s;
  out[9] = 0;
  out[10] = c;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromZRotation(out, rad) {
  var s = Math.sin(rad);
  var c = Math.cos(rad);
  out[0] = c;
  out[1] = s;
  out[2] = 0;
  out[3] = 0;
  out[4] = -s;
  out[5] = c;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 1;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function fromRotationTranslation(out, q, v) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromQuat2(out, a) {
  var translation = new ARRAY_TYPE(3);
  var bx = -a[0], by = -a[1], bz = -a[2], bw = a[3], ax = a[4], ay = a[5], az = a[6], aw = a[7];
  var magnitude = bx * bx + by * by + bz * bz + bw * bw;
  if (magnitude > 0) {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2 / magnitude;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2 / magnitude;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2 / magnitude;
  } else {
    translation[0] = (ax * bw + aw * bx + ay * bz - az * by) * 2;
    translation[1] = (ay * bw + aw * by + az * bx - ax * bz) * 2;
    translation[2] = (az * bw + aw * bz + ax * by - ay * bx) * 2;
  }
  fromRotationTranslation(out, a, translation);
  return out;
}
function getTranslation(out, mat) {
  out[0] = mat[12];
  out[1] = mat[13];
  out[2] = mat[14];
  return out;
}
function getScaling(out, mat) {
  var m11 = mat[0];
  var m12 = mat[1];
  var m13 = mat[2];
  var m21 = mat[4];
  var m22 = mat[5];
  var m23 = mat[6];
  var m31 = mat[8];
  var m32 = mat[9];
  var m33 = mat[10];
  out[0] = Math.hypot(m11, m12, m13);
  out[1] = Math.hypot(m21, m22, m23);
  out[2] = Math.hypot(m31, m32, m33);
  return out;
}
function getRotation(out, mat) {
  var scaling = new ARRAY_TYPE(3);
  getScaling(scaling, mat);
  var is1 = 1 / scaling[0];
  var is2 = 1 / scaling[1];
  var is3 = 1 / scaling[2];
  var sm11 = mat[0] * is1;
  var sm12 = mat[1] * is2;
  var sm13 = mat[2] * is3;
  var sm21 = mat[4] * is1;
  var sm22 = mat[5] * is2;
  var sm23 = mat[6] * is3;
  var sm31 = mat[8] * is1;
  var sm32 = mat[9] * is2;
  var sm33 = mat[10] * is3;
  var trace = sm11 + sm22 + sm33;
  var S = 0;
  if (trace > 0) {
    S = Math.sqrt(trace + 1) * 2;
    out[3] = 0.25 * S;
    out[0] = (sm23 - sm32) / S;
    out[1] = (sm31 - sm13) / S;
    out[2] = (sm12 - sm21) / S;
  } else if (sm11 > sm22 && sm11 > sm33) {
    S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
    out[3] = (sm23 - sm32) / S;
    out[0] = 0.25 * S;
    out[1] = (sm12 + sm21) / S;
    out[2] = (sm31 + sm13) / S;
  } else if (sm22 > sm33) {
    S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
    out[3] = (sm31 - sm13) / S;
    out[0] = (sm12 + sm21) / S;
    out[1] = 0.25 * S;
    out[2] = (sm23 + sm32) / S;
  } else {
    S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
    out[3] = (sm12 - sm21) / S;
    out[0] = (sm31 + sm13) / S;
    out[1] = (sm23 + sm32) / S;
    out[2] = 0.25 * S;
  }
  return out;
}
function fromRotationTranslationScale(out, q, v, s) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  out[0] = (1 - (yy + zz)) * sx;
  out[1] = (xy + wz) * sx;
  out[2] = (xz - wy) * sx;
  out[3] = 0;
  out[4] = (xy - wz) * sy;
  out[5] = (1 - (xx + zz)) * sy;
  out[6] = (yz + wx) * sy;
  out[7] = 0;
  out[8] = (xz + wy) * sz;
  out[9] = (yz - wx) * sz;
  out[10] = (1 - (xx + yy)) * sz;
  out[11] = 0;
  out[12] = v[0];
  out[13] = v[1];
  out[14] = v[2];
  out[15] = 1;
  return out;
}
function fromRotationTranslationScaleOrigin(out, q, v, s, o) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var xy = x * y2;
  var xz = x * z2;
  var yy = y * y2;
  var yz = y * z2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  var sx = s[0];
  var sy = s[1];
  var sz = s[2];
  var ox = o[0];
  var oy = o[1];
  var oz = o[2];
  var out0 = (1 - (yy + zz)) * sx;
  var out1 = (xy + wz) * sx;
  var out2 = (xz - wy) * sx;
  var out4 = (xy - wz) * sy;
  var out5 = (1 - (xx + zz)) * sy;
  var out6 = (yz + wx) * sy;
  var out8 = (xz + wy) * sz;
  var out9 = (yz - wx) * sz;
  var out10 = (1 - (xx + yy)) * sz;
  out[0] = out0;
  out[1] = out1;
  out[2] = out2;
  out[3] = 0;
  out[4] = out4;
  out[5] = out5;
  out[6] = out6;
  out[7] = 0;
  out[8] = out8;
  out[9] = out9;
  out[10] = out10;
  out[11] = 0;
  out[12] = v[0] + ox - (out0 * ox + out4 * oy + out8 * oz);
  out[13] = v[1] + oy - (out1 * ox + out5 * oy + out9 * oz);
  out[14] = v[2] + oz - (out2 * ox + out6 * oy + out10 * oz);
  out[15] = 1;
  return out;
}
function fromQuat(out, q) {
  var x = q[0], y = q[1], z = q[2], w = q[3];
  var x2 = x + x;
  var y2 = y + y;
  var z2 = z + z;
  var xx = x * x2;
  var yx = y * x2;
  var yy = y * y2;
  var zx = z * x2;
  var zy = z * y2;
  var zz = z * z2;
  var wx = w * x2;
  var wy = w * y2;
  var wz = w * z2;
  out[0] = 1 - yy - zz;
  out[1] = yx + wz;
  out[2] = zx - wy;
  out[3] = 0;
  out[4] = yx - wz;
  out[5] = 1 - xx - zz;
  out[6] = zy + wx;
  out[7] = 0;
  out[8] = zx + wy;
  out[9] = zy - wx;
  out[10] = 1 - xx - yy;
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;
  return out;
}
function frustum(out, left, right, bottom, top, near, far) {
  var rl = 1 / (right - left);
  var tb = 1 / (top - bottom);
  var nf = 1 / (near - far);
  out[0] = near * 2 * rl;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = near * 2 * tb;
  out[6] = 0;
  out[7] = 0;
  out[8] = (right + left) * rl;
  out[9] = (top + bottom) * tb;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near * 2 * nf;
  out[15] = 0;
  return out;
}
function perspectiveNO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = (far + near) * nf;
    out[14] = 2 * far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -2 * near;
  }
  return out;
}
function perspectiveZO(out, fovy, aspect, near, far) {
  var f = 1 / Math.tan(fovy / 2), nf;
  out[0] = f / aspect;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = f;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[15] = 0;
  if (far != null && far !== Infinity) {
    nf = 1 / (near - far);
    out[10] = far * nf;
    out[14] = far * near * nf;
  } else {
    out[10] = -1;
    out[14] = -near;
  }
  return out;
}
function perspectiveFromFieldOfView(out, fov, near, far) {
  var upTan = Math.tan(fov.upDegrees * Math.PI / 180);
  var downTan = Math.tan(fov.downDegrees * Math.PI / 180);
  var leftTan = Math.tan(fov.leftDegrees * Math.PI / 180);
  var rightTan = Math.tan(fov.rightDegrees * Math.PI / 180);
  var xScale = 2 / (leftTan + rightTan);
  var yScale = 2 / (upTan + downTan);
  out[0] = xScale;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = yScale;
  out[6] = 0;
  out[7] = 0;
  out[8] = -((leftTan - rightTan) * xScale * 0.5);
  out[9] = (upTan - downTan) * yScale * 0.5;
  out[10] = far / (near - far);
  out[11] = -1;
  out[12] = 0;
  out[13] = 0;
  out[14] = far * near / (near - far);
  out[15] = 0;
  return out;
}
function orthoNO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = 2 * nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}
function orthoZO(out, left, right, bottom, top, near, far) {
  var lr = 1 / (left - right);
  var bt = 1 / (bottom - top);
  var nf = 1 / (near - far);
  out[0] = -2 * lr;
  out[1] = 0;
  out[2] = 0;
  out[3] = 0;
  out[4] = 0;
  out[5] = -2 * bt;
  out[6] = 0;
  out[7] = 0;
  out[8] = 0;
  out[9] = 0;
  out[10] = nf;
  out[11] = 0;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = near * nf;
  out[15] = 1;
  return out;
}
function lookAt(out, eye, center, up) {
  var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  var eyex = eye[0];
  var eyey = eye[1];
  var eyez = eye[2];
  var upx = up[0];
  var upy = up[1];
  var upz = up[2];
  var centerx = center[0];
  var centery = center[1];
  var centerz = center[2];
  if (Math.abs(eyex - centerx) < EPSILON && Math.abs(eyey - centery) < EPSILON && Math.abs(eyez - centerz) < EPSILON) {
    return identity(out);
  }
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;
  len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.hypot(x0, x1, x2);
  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;
  len = Math.hypot(y0, y1, y2);
  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }
  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[3] = 0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[7] = 0;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[11] = 0;
  out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  out[15] = 1;
  return out;
}
function targetTo(out, eye, target, up) {
  var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2];
  var z0 = eyex - target[0], z1 = eyey - target[1], z2 = eyez - target[2];
  var len = z0 * z0 + z1 * z1 + z2 * z2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    z0 *= len;
    z1 *= len;
    z2 *= len;
  }
  var x0 = upy * z2 - upz * z1, x1 = upz * z0 - upx * z2, x2 = upx * z1 - upy * z0;
  len = x0 * x0 + x1 * x1 + x2 * x2;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }
  out[0] = x0;
  out[1] = x1;
  out[2] = x2;
  out[3] = 0;
  out[4] = z1 * x2 - z2 * x1;
  out[5] = z2 * x0 - z0 * x2;
  out[6] = z0 * x1 - z1 * x0;
  out[7] = 0;
  out[8] = z0;
  out[9] = z1;
  out[10] = z2;
  out[11] = 0;
  out[12] = eyex;
  out[13] = eyey;
  out[14] = eyez;
  out[15] = 1;
  return out;
}
function str(a) {
  return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
}
function frob(a) {
  return Math.hypot(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15]);
}
function add(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  out[4] = a[4] + b[4];
  out[5] = a[5] + b[5];
  out[6] = a[6] + b[6];
  out[7] = a[7] + b[7];
  out[8] = a[8] + b[8];
  out[9] = a[9] + b[9];
  out[10] = a[10] + b[10];
  out[11] = a[11] + b[11];
  out[12] = a[12] + b[12];
  out[13] = a[13] + b[13];
  out[14] = a[14] + b[14];
  out[15] = a[15] + b[15];
  return out;
}
function subtract(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  out[3] = a[3] - b[3];
  out[4] = a[4] - b[4];
  out[5] = a[5] - b[5];
  out[6] = a[6] - b[6];
  out[7] = a[7] - b[7];
  out[8] = a[8] - b[8];
  out[9] = a[9] - b[9];
  out[10] = a[10] - b[10];
  out[11] = a[11] - b[11];
  out[12] = a[12] - b[12];
  out[13] = a[13] - b[13];
  out[14] = a[14] - b[14];
  out[15] = a[15] - b[15];
  return out;
}
function multiplyScalar(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  out[4] = a[4] * b;
  out[5] = a[5] * b;
  out[6] = a[6] * b;
  out[7] = a[7] * b;
  out[8] = a[8] * b;
  out[9] = a[9] * b;
  out[10] = a[10] * b;
  out[11] = a[11] * b;
  out[12] = a[12] * b;
  out[13] = a[13] * b;
  out[14] = a[14] * b;
  out[15] = a[15] * b;
  return out;
}
function multiplyScalarAndAdd(out, a, b, scale2) {
  out[0] = a[0] + b[0] * scale2;
  out[1] = a[1] + b[1] * scale2;
  out[2] = a[2] + b[2] * scale2;
  out[3] = a[3] + b[3] * scale2;
  out[4] = a[4] + b[4] * scale2;
  out[5] = a[5] + b[5] * scale2;
  out[6] = a[6] + b[6] * scale2;
  out[7] = a[7] + b[7] * scale2;
  out[8] = a[8] + b[8] * scale2;
  out[9] = a[9] + b[9] * scale2;
  out[10] = a[10] + b[10] * scale2;
  out[11] = a[11] + b[11] * scale2;
  out[12] = a[12] + b[12] * scale2;
  out[13] = a[13] + b[13] * scale2;
  out[14] = a[14] + b[14] * scale2;
  out[15] = a[15] + b[15] * scale2;
  return out;
}
function exactEquals(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
}
function equals(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
  var a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
  var a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
  var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
  var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3)) && Math.abs(a4 - b4) <= EPSILON * Math.max(1, Math.abs(a4), Math.abs(b4)) && Math.abs(a5 - b5) <= EPSILON * Math.max(1, Math.abs(a5), Math.abs(b5)) && Math.abs(a6 - b6) <= EPSILON * Math.max(1, Math.abs(a6), Math.abs(b6)) && Math.abs(a7 - b7) <= EPSILON * Math.max(1, Math.abs(a7), Math.abs(b7)) && Math.abs(a8 - b8) <= EPSILON * Math.max(1, Math.abs(a8), Math.abs(b8)) && Math.abs(a9 - b9) <= EPSILON * Math.max(1, Math.abs(a9), Math.abs(b9)) && Math.abs(a10 - b10) <= EPSILON * Math.max(1, Math.abs(a10), Math.abs(b10)) && Math.abs(a11 - b11) <= EPSILON * Math.max(1, Math.abs(a11), Math.abs(b11)) && Math.abs(a12 - b12) <= EPSILON * Math.max(1, Math.abs(a12), Math.abs(b12)) && Math.abs(a13 - b13) <= EPSILON * Math.max(1, Math.abs(a13), Math.abs(b13)) && Math.abs(a14 - b14) <= EPSILON * Math.max(1, Math.abs(a14), Math.abs(b14)) && Math.abs(a15 - b15) <= EPSILON * Math.max(1, Math.abs(a15), Math.abs(b15));
}
var perspective = perspectiveNO;
var ortho = orthoNO;
var mul = multiply;
var sub = subtract;

// node_modules/gl-matrix/esm/quat.js
var exports_quat = {};
__export(exports_quat, {
  str: () => {
    {
      return str3;
    }
  },
  squaredLength: () => {
    {
      return squaredLength3;
    }
  },
  sqrLen: () => {
    {
      return sqrLen2;
    }
  },
  sqlerp: () => {
    {
      return sqlerp;
    }
  },
  slerp: () => {
    {
      return slerp;
    }
  },
  setAxisAngle: () => {
    {
      return setAxisAngle;
    }
  },
  setAxes: () => {
    {
      return setAxes;
    }
  },
  set: () => {
    {
      return set4;
    }
  },
  scale: () => {
    {
      return scale4;
    }
  },
  rotationTo: () => {
    {
      return rotationTo;
    }
  },
  rotateZ: () => {
    {
      return rotateZ3;
    }
  },
  rotateY: () => {
    {
      return rotateY3;
    }
  },
  rotateX: () => {
    {
      return rotateX3;
    }
  },
  random: () => {
    {
      return random2;
    }
  },
  pow: () => {
    {
      return pow;
    }
  },
  normalize: () => {
    {
      return normalize3;
    }
  },
  multiply: () => {
    {
      return multiply3;
    }
  },
  mul: () => {
    {
      return mul3;
    }
  },
  ln: () => {
    {
      return ln;
    }
  },
  lerp: () => {
    {
      return lerp3;
    }
  },
  length: () => {
    {
      return length3;
    }
  },
  len: () => {
    {
      return len2;
    }
  },
  invert: () => {
    {
      return invert2;
    }
  },
  identity: () => {
    {
      return identity2;
    }
  },
  getAxisAngle: () => {
    {
      return getAxisAngle;
    }
  },
  getAngle: () => {
    {
      return getAngle;
    }
  },
  fromValues: () => {
    {
      return fromValues4;
    }
  },
  fromMat3: () => {
    {
      return fromMat3;
    }
  },
  fromEuler: () => {
    {
      return fromEuler;
    }
  },
  exp: () => {
    {
      return exp;
    }
  },
  exactEquals: () => {
    {
      return exactEquals4;
    }
  },
  equals: () => {
    {
      return equals4;
    }
  },
  dot: () => {
    {
      return dot3;
    }
  },
  create: () => {
    {
      return create5;
    }
  },
  copy: () => {
    {
      return copy4;
    }
  },
  conjugate: () => {
    {
      return conjugate;
    }
  },
  clone: () => {
    {
      return clone4;
    }
  },
  calculateW: () => {
    {
      return calculateW;
    }
  },
  add: () => {
    {
      return add4;
    }
  }
});

// node_modules/gl-matrix/esm/vec3.js
var exports_vec3 = {};
__export(exports_vec3, {
  zero: () => {
    {
      return zero;
    }
  },
  transformQuat: () => {
    {
      return transformQuat;
    }
  },
  transformMat4: () => {
    {
      return transformMat4;
    }
  },
  transformMat3: () => {
    {
      return transformMat3;
    }
  },
  subtract: () => {
    {
      return subtract2;
    }
  },
  sub: () => {
    {
      return sub2;
    }
  },
  str: () => {
    {
      return str2;
    }
  },
  squaredLength: () => {
    {
      return squaredLength;
    }
  },
  squaredDistance: () => {
    {
      return squaredDistance;
    }
  },
  sqrLen: () => {
    {
      return sqrLen;
    }
  },
  sqrDist: () => {
    {
      return sqrDist;
    }
  },
  set: () => {
    {
      return set2;
    }
  },
  scaleAndAdd: () => {
    {
      return scaleAndAdd;
    }
  },
  scale: () => {
    {
      return scale2;
    }
  },
  round: () => {
    {
      return round;
    }
  },
  rotateZ: () => {
    {
      return rotateZ2;
    }
  },
  rotateY: () => {
    {
      return rotateY2;
    }
  },
  rotateX: () => {
    {
      return rotateX2;
    }
  },
  random: () => {
    {
      return random;
    }
  },
  normalize: () => {
    {
      return normalize;
    }
  },
  negate: () => {
    {
      return negate;
    }
  },
  multiply: () => {
    {
      return multiply2;
    }
  },
  mul: () => {
    {
      return mul2;
    }
  },
  min: () => {
    {
      return min;
    }
  },
  max: () => {
    {
      return max;
    }
  },
  lerp: () => {
    {
      return lerp;
    }
  },
  length: () => {
    {
      return length;
    }
  },
  len: () => {
    {
      return len;
    }
  },
  inverse: () => {
    {
      return inverse;
    }
  },
  hermite: () => {
    {
      return hermite;
    }
  },
  fromValues: () => {
    {
      return fromValues2;
    }
  },
  forEach: () => {
    {
      return forEach;
    }
  },
  floor: () => {
    {
      return floor;
    }
  },
  exactEquals: () => {
    {
      return exactEquals2;
    }
  },
  equals: () => {
    {
      return equals2;
    }
  },
  dot: () => {
    {
      return dot;
    }
  },
  divide: () => {
    {
      return divide;
    }
  },
  div: () => {
    {
      return div;
    }
  },
  distance: () => {
    {
      return distance;
    }
  },
  dist: () => {
    {
      return dist;
    }
  },
  cross: () => {
    {
      return cross;
    }
  },
  create: () => {
    {
      return create3;
    }
  },
  copy: () => {
    {
      return copy2;
    }
  },
  clone: () => {
    {
      return clone2;
    }
  },
  ceil: () => {
    {
      return ceil;
    }
  },
  bezier: () => {
    {
      return bezier;
    }
  },
  angle: () => {
    {
      return angle;
    }
  },
  add: () => {
    {
      return add2;
    }
  }
});
function create3() {
  var out = new ARRAY_TYPE(3);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  return out;
}
function clone2(a) {
  var out = new ARRAY_TYPE(3);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function length(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return Math.hypot(x, y, z);
}
function fromValues2(x, y, z) {
  var out = new ARRAY_TYPE(3);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function copy2(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  return out;
}
function set2(out, x, y, z) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  return out;
}
function add2(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  return out;
}
function subtract2(out, a, b) {
  out[0] = a[0] - b[0];
  out[1] = a[1] - b[1];
  out[2] = a[2] - b[2];
  return out;
}
function multiply2(out, a, b) {
  out[0] = a[0] * b[0];
  out[1] = a[1] * b[1];
  out[2] = a[2] * b[2];
  return out;
}
function divide(out, a, b) {
  out[0] = a[0] / b[0];
  out[1] = a[1] / b[1];
  out[2] = a[2] / b[2];
  return out;
}
function ceil(out, a) {
  out[0] = Math.ceil(a[0]);
  out[1] = Math.ceil(a[1]);
  out[2] = Math.ceil(a[2]);
  return out;
}
function floor(out, a) {
  out[0] = Math.floor(a[0]);
  out[1] = Math.floor(a[1]);
  out[2] = Math.floor(a[2]);
  return out;
}
function min(out, a, b) {
  out[0] = Math.min(a[0], b[0]);
  out[1] = Math.min(a[1], b[1]);
  out[2] = Math.min(a[2], b[2]);
  return out;
}
function max(out, a, b) {
  out[0] = Math.max(a[0], b[0]);
  out[1] = Math.max(a[1], b[1]);
  out[2] = Math.max(a[2], b[2]);
  return out;
}
function round(out, a) {
  out[0] = Math.round(a[0]);
  out[1] = Math.round(a[1]);
  out[2] = Math.round(a[2]);
  return out;
}
function scale2(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  return out;
}
function scaleAndAdd(out, a, b, scale3) {
  out[0] = a[0] + b[0] * scale3;
  out[1] = a[1] + b[1] * scale3;
  out[2] = a[2] + b[2] * scale3;
  return out;
}
function distance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return Math.hypot(x, y, z);
}
function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
}
function squaredLength(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  return x * x + y * y + z * z;
}
function negate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  return out;
}
function inverse(out, a) {
  out[0] = 1 / a[0];
  out[1] = 1 / a[1];
  out[2] = 1 / a[2];
  return out;
}
function normalize(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var len = x * x + y * y + z * z;
  if (len > 0) {
    len = 1 / Math.sqrt(len);
  }
  out[0] = a[0] * len;
  out[1] = a[1] * len;
  out[2] = a[2] * len;
  return out;
}
function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function cross(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2];
  var bx = b[0], by = b[1], bz = b[2];
  out[0] = ay * bz - az * by;
  out[1] = az * bx - ax * bz;
  out[2] = ax * by - ay * bx;
  return out;
}
function lerp(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  return out;
}
function hermite(out, a, b, c, d, t) {
  var factorTimes2 = t * t;
  var factor1 = factorTimes2 * (2 * t - 3) + 1;
  var factor2 = factorTimes2 * (t - 2) + t;
  var factor3 = factorTimes2 * (t - 1);
  var factor4 = factorTimes2 * (3 - 2 * t);
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
function bezier(out, a, b, c, d, t) {
  var inverseFactor = 1 - t;
  var inverseFactorTimesTwo = inverseFactor * inverseFactor;
  var factorTimes2 = t * t;
  var factor1 = inverseFactorTimesTwo * inverseFactor;
  var factor2 = 3 * t * inverseFactorTimesTwo;
  var factor3 = 3 * factorTimes2 * inverseFactor;
  var factor4 = factorTimes2 * t;
  out[0] = a[0] * factor1 + b[0] * factor2 + c[0] * factor3 + d[0] * factor4;
  out[1] = a[1] * factor1 + b[1] * factor2 + c[1] * factor3 + d[1] * factor4;
  out[2] = a[2] * factor1 + b[2] * factor2 + c[2] * factor3 + d[2] * factor4;
  return out;
}
function random(out, scale3) {
  scale3 = scale3 || 1;
  var r = RANDOM() * 2 * Math.PI;
  var z = RANDOM() * 2 - 1;
  var zScale = Math.sqrt(1 - z * z) * scale3;
  out[0] = Math.cos(r) * zScale;
  out[1] = Math.sin(r) * zScale;
  out[2] = z * scale3;
  return out;
}
function transformMat4(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  var w = m[3] * x + m[7] * y + m[11] * z + m[15];
  w = w || 1;
  out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
  out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
  out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
  return out;
}
function transformMat3(out, a, m) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x * m[0] + y * m[3] + z * m[6];
  out[1] = x * m[1] + y * m[4] + z * m[7];
  out[2] = x * m[2] + y * m[5] + z * m[8];
  return out;
}
function transformQuat(out, a, q) {
  var qx = q[0], qy = q[1], qz = q[2], qw = q[3];
  var x = a[0], y = a[1], z = a[2];
  var uvx = qy * z - qz * y, uvy = qz * x - qx * z, uvz = qx * y - qy * x;
  var uuvx = qy * uvz - qz * uvy, uuvy = qz * uvx - qx * uvz, uuvz = qx * uvy - qy * uvx;
  var w2 = qw * 2;
  uvx *= w2;
  uvy *= w2;
  uvz *= w2;
  uuvx *= 2;
  uuvy *= 2;
  uuvz *= 2;
  out[0] = x + uvx + uuvx;
  out[1] = y + uvy + uuvy;
  out[2] = z + uvz + uuvz;
  return out;
}
function rotateX2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0];
  r[1] = p[1] * Math.cos(rad) - p[2] * Math.sin(rad);
  r[2] = p[1] * Math.sin(rad) + p[2] * Math.cos(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function rotateY2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
  r[1] = p[1];
  r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad);
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function rotateZ2(out, a, b, rad) {
  var p = [], r = [];
  p[0] = a[0] - b[0];
  p[1] = a[1] - b[1];
  p[2] = a[2] - b[2];
  r[0] = p[0] * Math.cos(rad) - p[1] * Math.sin(rad);
  r[1] = p[0] * Math.sin(rad) + p[1] * Math.cos(rad);
  r[2] = p[2];
  out[0] = r[0] + b[0];
  out[1] = r[1] + b[1];
  out[2] = r[2] + b[2];
  return out;
}
function angle(a, b) {
  var ax = a[0], ay = a[1], az = a[2], bx = b[0], by = b[1], bz = b[2], mag1 = Math.sqrt(ax * ax + ay * ay + az * az), mag2 = Math.sqrt(bx * bx + by * by + bz * bz), mag = mag1 * mag2, cosine = mag && dot(a, b) / mag;
  return Math.acos(Math.min(Math.max(cosine, -1), 1));
}
function zero(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  return out;
}
function str2(a) {
  return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
}
function exactEquals2(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}
function equals2(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2];
  var b0 = b[0], b1 = b[1], b2 = b[2];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2));
}
var sub2 = subtract2;
var mul2 = multiply2;
var div = divide;
var dist = distance;
var sqrDist = squaredDistance;
var len = length;
var sqrLen = squaredLength;
var forEach = function() {
  var vec = create3();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 3;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset;i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
    }
    return a;
  };
}();

// node_modules/gl-matrix/esm/vec4.js
function create4() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
  }
  return out;
}
function clone3(a) {
  var out = new ARRAY_TYPE(4);
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function fromValues3(x, y, z, w) {
  var out = new ARRAY_TYPE(4);
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function copy3(out, a) {
  out[0] = a[0];
  out[1] = a[1];
  out[2] = a[2];
  out[3] = a[3];
  return out;
}
function set3(out, x, y, z, w) {
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = w;
  return out;
}
function add3(out, a, b) {
  out[0] = a[0] + b[0];
  out[1] = a[1] + b[1];
  out[2] = a[2] + b[2];
  out[3] = a[3] + b[3];
  return out;
}
function scale3(out, a, b) {
  out[0] = a[0] * b;
  out[1] = a[1] * b;
  out[2] = a[2] * b;
  out[3] = a[3] * b;
  return out;
}
function length2(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return Math.hypot(x, y, z, w);
}
function squaredLength2(a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  return x * x + y * y + z * z + w * w;
}
function normalize2(out, a) {
  var x = a[0];
  var y = a[1];
  var z = a[2];
  var w = a[3];
  var len2 = x * x + y * y + z * z + w * w;
  if (len2 > 0) {
    len2 = 1 / Math.sqrt(len2);
  }
  out[0] = x * len2;
  out[1] = y * len2;
  out[2] = z * len2;
  out[3] = w * len2;
  return out;
}
function dot2(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
}
function lerp2(out, a, b, t) {
  var ax = a[0];
  var ay = a[1];
  var az = a[2];
  var aw = a[3];
  out[0] = ax + t * (b[0] - ax);
  out[1] = ay + t * (b[1] - ay);
  out[2] = az + t * (b[2] - az);
  out[3] = aw + t * (b[3] - aw);
  return out;
}
function exactEquals3(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
function equals3(a, b) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
  return Math.abs(a0 - b0) <= EPSILON * Math.max(1, Math.abs(a0), Math.abs(b0)) && Math.abs(a1 - b1) <= EPSILON * Math.max(1, Math.abs(a1), Math.abs(b1)) && Math.abs(a2 - b2) <= EPSILON * Math.max(1, Math.abs(a2), Math.abs(b2)) && Math.abs(a3 - b3) <= EPSILON * Math.max(1, Math.abs(a3), Math.abs(b3));
}
var forEach2 = function() {
  var vec = create4();
  return function(a, stride, offset, count, fn, arg) {
    var i, l;
    if (!stride) {
      stride = 4;
    }
    if (!offset) {
      offset = 0;
    }
    if (count) {
      l = Math.min(count * stride + offset, a.length);
    } else {
      l = a.length;
    }
    for (i = offset;i < l; i += stride) {
      vec[0] = a[i];
      vec[1] = a[i + 1];
      vec[2] = a[i + 2];
      vec[3] = a[i + 3];
      fn(vec, vec, arg);
      a[i] = vec[0];
      a[i + 1] = vec[1];
      a[i + 2] = vec[2];
      a[i + 3] = vec[3];
    }
    return a;
  };
}();

// node_modules/gl-matrix/esm/quat.js
function create5() {
  var out = new ARRAY_TYPE(4);
  if (ARRAY_TYPE != Float32Array) {
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
  }
  out[3] = 1;
  return out;
}
function identity2(out) {
  out[0] = 0;
  out[1] = 0;
  out[2] = 0;
  out[3] = 1;
  return out;
}
function setAxisAngle(out, axis, rad) {
  rad = rad * 0.5;
  var s = Math.sin(rad);
  out[0] = s * axis[0];
  out[1] = s * axis[1];
  out[2] = s * axis[2];
  out[3] = Math.cos(rad);
  return out;
}
function getAxisAngle(out_axis, q) {
  var rad = Math.acos(q[3]) * 2;
  var s = Math.sin(rad / 2);
  if (s > EPSILON) {
    out_axis[0] = q[0] / s;
    out_axis[1] = q[1] / s;
    out_axis[2] = q[2] / s;
  } else {
    out_axis[0] = 1;
    out_axis[1] = 0;
    out_axis[2] = 0;
  }
  return rad;
}
function getAngle(a, b) {
  var dotproduct = dot3(a, b);
  return Math.acos(2 * dotproduct * dotproduct - 1);
}
function multiply3(out, a, b) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];
  out[0] = ax * bw + aw * bx + ay * bz - az * by;
  out[1] = ay * bw + aw * by + az * bx - ax * bz;
  out[2] = az * bw + aw * bz + ax * by - ay * bx;
  out[3] = aw * bw - ax * bx - ay * by - az * bz;
  return out;
}
function rotateX3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + aw * bx;
  out[1] = ay * bw + az * bx;
  out[2] = az * bw - ay * bx;
  out[3] = aw * bw - ax * bx;
  return out;
}
function rotateY3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var by = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw - az * by;
  out[1] = ay * bw + aw * by;
  out[2] = az * bw + ax * by;
  out[3] = aw * bw - ay * by;
  return out;
}
function rotateZ3(out, a, rad) {
  rad *= 0.5;
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bz = Math.sin(rad), bw = Math.cos(rad);
  out[0] = ax * bw + ay * bz;
  out[1] = ay * bw - ax * bz;
  out[2] = az * bw + aw * bz;
  out[3] = aw * bw - az * bz;
  return out;
}
function calculateW(out, a) {
  var x = a[0], y = a[1], z = a[2];
  out[0] = x;
  out[1] = y;
  out[2] = z;
  out[3] = Math.sqrt(Math.abs(1 - x * x - y * y - z * z));
  return out;
}
function exp(out, a) {
  var x = a[0], y = a[1], z = a[2], w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var et = Math.exp(w);
  var s = r > 0 ? et * Math.sin(r) / r : 0;
  out[0] = x * s;
  out[1] = y * s;
  out[2] = z * s;
  out[3] = et * Math.cos(r);
  return out;
}
function ln(out, a) {
  var x = a[0], y = a[1], z = a[2], w = a[3];
  var r = Math.sqrt(x * x + y * y + z * z);
  var t = r > 0 ? Math.atan2(r, w) / r : 0;
  out[0] = x * t;
  out[1] = y * t;
  out[2] = z * t;
  out[3] = 0.5 * Math.log(x * x + y * y + z * z + w * w);
  return out;
}
function pow(out, a, b) {
  ln(out, a);
  scale4(out, out, b);
  exp(out, out);
  return out;
}
function slerp(out, a, b, t) {
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];
  var omega, cosom, sinom, scale0, scale1;
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  if (cosom < 0) {
    cosom = -cosom;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }
  if (1 - cosom > EPSILON) {
    omega = Math.acos(cosom);
    sinom = Math.sin(omega);
    scale0 = Math.sin((1 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    scale0 = 1 - t;
    scale1 = t;
  }
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;
  return out;
}
function random2(out) {
  var u1 = RANDOM();
  var u2 = RANDOM();
  var u3 = RANDOM();
  var sqrt1MinusU1 = Math.sqrt(1 - u1);
  var sqrtU1 = Math.sqrt(u1);
  out[0] = sqrt1MinusU1 * Math.sin(2 * Math.PI * u2);
  out[1] = sqrt1MinusU1 * Math.cos(2 * Math.PI * u2);
  out[2] = sqrtU1 * Math.sin(2 * Math.PI * u3);
  out[3] = sqrtU1 * Math.cos(2 * Math.PI * u3);
  return out;
}
function invert2(out, a) {
  var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
  var dot3 = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
  var invDot = dot3 ? 1 / dot3 : 0;
  out[0] = -a0 * invDot;
  out[1] = -a1 * invDot;
  out[2] = -a2 * invDot;
  out[3] = a3 * invDot;
  return out;
}
function conjugate(out, a) {
  out[0] = -a[0];
  out[1] = -a[1];
  out[2] = -a[2];
  out[3] = a[3];
  return out;
}
function fromMat3(out, m) {
  var fTrace = m[0] + m[4] + m[8];
  var fRoot;
  if (fTrace > 0) {
    fRoot = Math.sqrt(fTrace + 1);
    out[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[0] = (m[5] - m[7]) * fRoot;
    out[1] = (m[6] - m[2]) * fRoot;
    out[2] = (m[1] - m[3]) * fRoot;
  } else {
    var i = 0;
    if (m[4] > m[0])
      i = 1;
    if (m[8] > m[i * 3 + i])
      i = 2;
    var j = (i + 1) % 3;
    var k = (i + 2) % 3;
    fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1);
    out[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
    out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
    out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
  }
  return out;
}
function fromEuler(out, x, y, z) {
  var halfToRad = 0.5 * Math.PI / 180;
  x *= halfToRad;
  y *= halfToRad;
  z *= halfToRad;
  var sx = Math.sin(x);
  var cx = Math.cos(x);
  var sy = Math.sin(y);
  var cy = Math.cos(y);
  var sz = Math.sin(z);
  var cz = Math.cos(z);
  out[0] = sx * cy * cz - cx * sy * sz;
  out[1] = cx * sy * cz + sx * cy * sz;
  out[2] = cx * cy * sz - sx * sy * cz;
  out[3] = cx * cy * cz + sx * sy * sz;
  return out;
}
function str3(a) {
  return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
}
var clone4 = clone3;
var fromValues4 = fromValues3;
var copy4 = copy3;
var set4 = set3;
var add4 = add3;
var mul3 = multiply3;
var scale4 = scale3;
var dot3 = dot2;
var lerp3 = lerp2;
var length3 = length2;
var len2 = length3;
var squaredLength3 = squaredLength2;
var sqrLen2 = squaredLength3;
var normalize3 = normalize2;
var exactEquals4 = exactEquals3;
var equals4 = equals3;
var rotationTo = function() {
  var tmpvec3 = create3();
  var xUnitVec3 = fromValues2(1, 0, 0);
  var yUnitVec3 = fromValues2(0, 1, 0);
  return function(out, a, b) {
    var dot4 = dot(a, b);
    if (dot4 < -0.999999) {
      cross(tmpvec3, xUnitVec3, a);
      if (len(tmpvec3) < 0.000001)
        cross(tmpvec3, yUnitVec3, a);
      normalize(tmpvec3, tmpvec3);
      setAxisAngle(out, tmpvec3, Math.PI);
      return out;
    } else if (dot4 > 0.999999) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 1;
      return out;
    } else {
      cross(tmpvec3, a, b);
      out[0] = tmpvec3[0];
      out[1] = tmpvec3[1];
      out[2] = tmpvec3[2];
      out[3] = 1 + dot4;
      return normalize3(out, out);
    }
  };
}();
var sqlerp = function() {
  var temp1 = create5();
  var temp2 = create5();
  return function(out, a, b, c, d, t) {
    slerp(temp1, a, d, t);
    slerp(temp2, b, c, t);
    slerp(out, temp1, temp2, 2 * t * (1 - t));
    return out;
  };
}();
var setAxes = function() {
  var matr = create();
  return function(out, view, right, up) {
    matr[0] = right[0];
    matr[3] = right[1];
    matr[6] = right[2];
    matr[1] = up[0];
    matr[4] = up[1];
    matr[7] = up[2];
    matr[2] = -view[0];
    matr[5] = -view[1];
    matr[8] = -view[2];
    return normalize3(out, fromMat3(out, matr));
  };
}();

// src/gl/transform/Matrix.ts
var DEG_TO_RADIANT = Math.PI / 90;

class Matrix {
  m4 = Float32Array.from(exports_mat4.create());
  static HIDDEN = Matrix.create().scale(0, 0, 0);
  static IDENTITY = Matrix.create();
  static tempVec = [0, 0, 0];
  constructor() {
    this.identity();
  }
  static create() {
    return new Matrix;
  }
  copy(matrix) {
    exports_mat4.copy(this.m4, matrix.getMatrix());
    return this;
  }
  identity() {
    exports_mat4.identity(this.m4);
    return this;
  }
  invert(matrix) {
    exports_mat4.invert(this.m4, matrix?.getMatrix() ?? this.getMatrix());
    return this;
  }
  multiply(matrix) {
    exports_mat4.multiply(this.m4, this.m4, matrix.getMatrix());
    return this;
  }
  multiply2(matrix1, matrix2) {
    exports_mat4.multiply(this.m4, matrix1.getMatrix(), matrix2.getMatrix());
    return this;
  }
  multiply3(matrix1, matrix2, matrix3) {
    this.multiply2(matrix1, matrix2);
    this.multiply(matrix3);
    return this;
  }
  translate(x, y, z) {
    const v = Matrix.tempVec;
    v[0] = x;
    v[1] = y;
    v[2] = z;
    return this.move(v);
  }
  move(vector) {
    exports_mat4.translate(this.m4, this.m4, vector);
    return this;
  }
  rotateX(angle2) {
    exports_mat4.rotateX(this.m4, this.m4, angle2);
    return this;
  }
  rotateY(angle2) {
    exports_mat4.rotateY(this.m4, this.m4, angle2);
    return this;
  }
  rotateZ(angle2) {
    exports_mat4.rotateZ(this.m4, this.m4, angle2);
    return this;
  }
  setXRotation(angle2) {
    exports_mat4.fromXRotation(this.getMatrix(), angle2);
    return this;
  }
  setYRotation(angle2) {
    exports_mat4.fromYRotation(this.getMatrix(), angle2);
    return this;
  }
  scale(x, y, z) {
    exports_mat4.scale(this.m4, this.m4, [x, y ?? x, z ?? x]);
    return this;
  }
  perspective(degAngle, ratio, near, far) {
    exports_mat4.perspective(this.m4, degAngle * DEG_TO_RADIANT, ratio, near, far);
    return this;
  }
  ortho(left, right, bottom, top, near, far) {
    exports_mat4.ortho(this.m4, left, right, bottom, top, near, far);
    return this;
  }
  static aTemp = exports_mat4.create();
  static bTemp = exports_mat4.create();
  combine(matrix1, matrix2, level = 0.5) {
    exports_mat4.multiplyScalar(Matrix.aTemp, matrix1.getMatrix(), 1 - level);
    exports_mat4.multiplyScalar(Matrix.bTemp, matrix2.getMatrix(), level);
    exports_mat4.add(this.m4, Matrix.aTemp, Matrix.bTemp);
    return this;
  }
  static tempQuat = exports_quat.create();
  getMoveVector(x, y, z, turnMatrix) {
    const v = Matrix.tempVec;
    v[0] = x;
    v[1] = y;
    v[2] = z;
    if (turnMatrix) {
      exports_mat4.getRotation(Matrix.tempQuat, turnMatrix.getMatrix());
      exports_quat.invert(Matrix.tempQuat, Matrix.tempQuat);
      exports_vec3.transformQuat(v, v, Matrix.tempQuat);
    }
    return v;
  }
  setPosition(x, y, z) {
    this.m4[12] = x;
    this.m4[13] = y;
    this.m4[14] = z;
    return this;
  }
  getMatrix() {
    return this.m4;
  }
}
var Matrix_default = Matrix;

// src/core/graphics/Uniforms.ts
var FloatUniform;
(function(FloatUniform2) {
  FloatUniform2[FloatUniform2["CURVATURE"] = 0] = "CURVATURE";
  FloatUniform2[FloatUniform2["CAM_DISTANCE"] = 1] = "CAM_DISTANCE";
  FloatUniform2[FloatUniform2["BG_BLUR"] = 2] = "BG_BLUR";
})(FloatUniform || (FloatUniform = {}));
var MatrixUniform;
(function(MatrixUniform2) {
  MatrixUniform2[MatrixUniform2["PROJECTION"] = 0] = "PROJECTION";
  MatrixUniform2[MatrixUniform2["CAM_POS"] = 1] = "CAM_POS";
  MatrixUniform2[MatrixUniform2["CAM_TURN"] = 2] = "CAM_TURN";
  MatrixUniform2[MatrixUniform2["CAM_TILT"] = 3] = "CAM_TILT";
})(MatrixUniform || (MatrixUniform = {}));
var VectorUniform;
(function(VectorUniform2) {
  VectorUniform2[VectorUniform2["BG_COLOR"] = 0] = "BG_COLOR";
})(VectorUniform || (VectorUniform = {}));

// src/core/graphics/GraphicsEngine.ts
var glProxy = function(gl) {
  if (!LOG_GL) {
    return gl;
  }
  const proxy = new Proxy(gl, {
    get(target, prop) {
      const t = target;
      const result = t[prop];
      if (typeof result === "function") {
        const f = (...params) => {
          const returnValue = result.apply(t, params);
          console.log(`gl.${String(prop)}(`, params, ") = ", returnValue);
          return returnValue;
        };
        return f;
      } else {
        console.log(`gl.${String(prop)} = `, result);
        return result;
      }
    }
  });
  return proxy;
};
var DEFAULT_ATTRIBUTES = {
  alpha: true,
  antialias: false,
  depth: true,
  failIfMajorPerformanceCaveat: undefined,
  powerPreference: "default",
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  stencil: false
};
var VERTEX_COUNT = 6;
var LOG_GL = false;
var EMPTY_VEC2 = Float32Array.from([0, 0]);

class GraphicsEngine extends Disposable {
  gl;
  programs;
  attributeBuffers;
  uniforms;
  canvas;
  textureManager;
  imageManager;
  textureSlots = {};
  onResize = new Set;
  pixelListener;
  spriteCount = 0;
  maxSpriteCount = 0;
  matrixUniforms;
  floatUniforms;
  vec3Uniforms;
  constructor(canvas, {
    attributes
  } = {}) {
    super();
    const gl = canvas.getContext("webgl2", { ...DEFAULT_ATTRIBUTES, ...attributes });
    this.gl = glProxy(gl);
    this.canvas = canvas;
    this.programs = this.own(new GLPrograms(this.gl));
    this.uniforms = new GLUniforms(this.gl, this.programs);
    this.attributeBuffers = this.own(new GLAttributeBuffers(this.gl, this.programs));
    this.textureManager = new TextureManager(this.gl, this.uniforms);
    this.imageManager = new ImageManager;
    const onResize = this.checkCanvasSize.bind(this);
    window.addEventListener("resize", onResize);
    this.addOnDestroy(() => window.removeEventListener("resize", onResize));
    const PROGRAM_NAME = "main";
    const replacementMap = {
      AUTHOR: "Jack le hamster"
    };
    this.programs.addProgram(PROGRAM_NAME, replaceTilda(vertexShader_default, replacementMap), replaceTilda(fragmentShader_default, replacementMap));
    this.matrixUniforms = {
      [MatrixUniform.PROJECTION]: this.uniforms.getUniformLocation(CAM_PROJECTION_LOC, PROGRAM_NAME),
      [MatrixUniform.CAM_POS]: this.uniforms.getUniformLocation(CAM_POS_LOC, PROGRAM_NAME),
      [MatrixUniform.CAM_TURN]: this.uniforms.getUniformLocation(CAM_TURN_LOC, PROGRAM_NAME),
      [MatrixUniform.CAM_TILT]: this.uniforms.getUniformLocation(CAM_TILT_LOC, PROGRAM_NAME)
    };
    this.floatUniforms = {
      [FloatUniform.CURVATURE]: this.uniforms.getUniformLocation(CAM_CURVATURE_LOC, PROGRAM_NAME),
      [FloatUniform.CAM_DISTANCE]: this.uniforms.getUniformLocation(CAM_DISTANCE_LOC, PROGRAM_NAME),
      [FloatUniform.BG_BLUR]: this.uniforms.getUniformLocation(BG_BLUR_LOC, PROGRAM_NAME)
    };
    this.vec3Uniforms = {
      [VectorUniform.BG_COLOR]: this.uniforms.getUniformLocation(BG_COLOR_LOC, PROGRAM_NAME)
    };
    this.initialize(PROGRAM_NAME);
  }
  addResizeListener(listener) {
    listener(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.onResize.add(listener);
    return () => this.removeResizeListener(listener);
  }
  removeResizeListener(listener) {
    this.onResize.delete(listener);
  }
  clearTextureSlots() {
    for (let i in this.textureSlots) {
      delete this.textureSlots[i];
    }
  }
  checkCanvasSize() {
    if (this.canvas instanceof HTMLCanvasElement) {
      this.canvas.width = this.canvas.offsetWidth * 2;
      this.canvas.height = this.canvas.offsetHeight * 2;
    }
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.onResize.forEach((callback) => callback(this.gl.drawingBufferWidth, this.gl.drawingBufferHeight));
  }
  initialize(programName) {
    this.programs.useProgram(programName);
    this.gl.enable(GL.DEPTH_TEST);
    this.gl.depthFunc(GL.LESS);
    this.gl.clearDepth(1);
    this.gl.enable(GL.BLEND);
    this.gl.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
    this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    this.gl.enable(GL.CULL_FACE);
    this.gl.cullFace(GL.BACK);
    this.gl.clearColor(0, 0, 0, 1);
    this.textureManager.initialize();
    this.checkCanvasSize();
  }
  activate() {
    this.clearTextureSlots();
  }
  setMaxSpriteCount(count) {
    if (count > this.maxSpriteCount) {
      this.maxSpriteCount = 1 << Math.ceil(Math.log2(count));
      this.initializeBuffers(this.maxSpriteCount);
      console.log("Sprite limit", this.maxSpriteCount);
    }
  }
  setBgColor(rgb) {
    this.gl.clearColor(rgb[0], rgb[1], rgb[2], 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
  onCleanupBuffers = new Set;
  initializeBuffers(maxSpriteCount) {
    this.onCleanupBuffers.forEach((cleanup) => cleanup());
    this.onCleanupBuffers.clear();
    if (maxSpriteCount) {
      const cleanups = [
        this.initializeIndexBuffer(INDEX_LOC),
        this.initializePositionBuffer(POSITION_LOC),
        this.initializeBuffer(TRANSFORM_LOC, maxSpriteCount, 4, 4, 1, GL.DYNAMIC_DRAW),
        this.initializeBuffer(SLOT_SIZE_LOC, maxSpriteCount, 2, 1, 1, GL.DYNAMIC_DRAW),
        this.initializeBuffer(INSTANCE_LOC, maxSpriteCount, 1, 1, 1, GL.STATIC_DRAW, (index) => index),
        this.initializeBuffer(SPRITE_FLAGS_LOC, maxSpriteCount, 1, 1, 1, GL.STATIC_DRAW)
      ];
      cleanups.forEach((cleanup) => this.onCleanupBuffers.add(cleanup));
    }
  }
  initializeIndexBuffer(location) {
    const bufferInfo = this.attributeBuffers.createBuffer(location);
    this.gl.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, bufferInfo.buffer);
    this.gl.bufferData(GL.ELEMENT_ARRAY_BUFFER, Uint16Array.from([0, 1, 2, 2, 3, 0]), GL.STATIC_DRAW);
    return () => {
      this.attributeBuffers.deleteBuffer(location);
    };
  }
  initializePositionBuffer(location) {
    const bufferInfo = this.attributeBuffers.createBuffer(location);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
    this.gl.vertexAttribPointer(bufferInfo.location, 2, GL.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(bufferInfo.location);
    this.gl.bufferData(GL.ARRAY_BUFFER, Float32Array.from([-1, -1, 1, -1, 1, 1, -1, 1]), GL.STATIC_DRAW);
    return () => {
      this.gl.disableVertexAttribArray(bufferInfo.location);
      this.attributeBuffers.deleteBuffer(location);
    };
  }
  initializeBuffer(location, instanceCount, elemCount, dataRows = 1, divisor = 0, usage = GL.DYNAMIC_DRAW, callback) {
    const bufferInfo = this.attributeBuffers.createBuffer(location);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
    const bytesPerRow = elemCount * Float32Array.BYTES_PER_ELEMENT;
    const bytesPerInstance = dataRows * bytesPerRow;
    for (let i = 0;i < dataRows; i++) {
      const loc = bufferInfo.location + i;
      this.gl.vertexAttribPointer(loc, elemCount, GL.FLOAT, false, bytesPerInstance, i * bytesPerRow);
      this.gl.enableVertexAttribArray(loc);
      this.gl.vertexAttribDivisor(loc, divisor);
    }
    if (callback) {
      this.gl.bufferData(GL.ARRAY_BUFFER, Float32Array.from(new Array(instanceCount).fill(0).map((_, index) => callback(index))), usage);
    } else {
      this.gl.bufferData(GL.ARRAY_BUFFER, instanceCount * bytesPerInstance, usage);
    }
    return () => {
      this.gl.disableVertexAttribArray(bufferInfo.location);
      this.attributeBuffers.deleteBuffer(location);
    };
  }
  async updateTextures(imageIds, getMedia) {
    const mediaInfos = (await Promise.all(imageIds.map(async (imageId) => {
      const media = getMedia(imageId);
      if (!media) {
        console.warn(`No media for imageId ${imageId}`);
        return;
      }
      const mediaData = await this.imageManager.renderMedia(imageId, media);
      return { mediaData, imageId };
    }))).filter((data) => !!data);
    const textureIndices = await Promise.all(mediaInfos.map(async ({ mediaData, imageId }) => {
      const { slot, refreshCallback } = this.textureManager.allocateSlotForImage(mediaData);
      const slotW = Math.log2(slot.size[0]), slotH = Math.log2(slot.size[1]);
      const wh = slotW * 16 + slotH;
      this.textureSlots[imageId] = {
        buffer: Float32Array.from([wh, slot.slotNumber])
      };
      mediaData.refreshCallback = refreshCallback;
      return slot.textureIndex;
    }));
    const textureIndicesSet = new Set(textureIndices);
    textureIndicesSet.forEach((textureIndex) => {
      if (textureIndex === TEXTURE_INDEX_FOR_VIDEO) {
        this.textureManager.setupTextureForVideo(`TEXTURE${textureIndex}`);
      } else {
        this.textureManager.generateMipMap(`TEXTURE${textureIndex}`);
      }
    });
    return mediaInfos.map(({ mediaData }) => mediaData);
  }
  drawElementsInstanced(vertexCount, instances) {
    this.gl.drawElementsInstanced(GL.TRIANGLES, vertexCount, GL.UNSIGNED_SHORT, 0, instances);
  }
  updateSpriteTransforms(spriteIds, sprites) {
    const bufferInfo = this.attributeBuffers.getAttributeBuffer(TRANSFORM_LOC);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
    let topVisibleSprite = this.spriteCount - 1;
    spriteIds.forEach((spriteId) => {
      const sprite = sprites.at(spriteId);
      this.gl.bufferSubData(GL.ARRAY_BUFFER, 16 * Float32Array.BYTES_PER_ELEMENT * spriteId, (sprite?.transform ?? Matrix_default.HIDDEN).getMatrix());
      if (sprite) {
        topVisibleSprite = Math.max(topVisibleSprite, spriteId);
      }
    });
    spriteIds.clear();
    while (topVisibleSprite >= 0 && !sprites.at(topVisibleSprite)) {
      topVisibleSprite--;
    }
    this.spriteCount = Math.max(this.spriteCount, topVisibleSprite + 1);
  }
  updateSpriteAnims(spriteIds, sprites) {
    const bufferInfo = this.attributeBuffers.getAttributeBuffer(SLOT_SIZE_LOC);
    this.gl.bindBuffer(GL.ARRAY_BUFFER, bufferInfo.buffer);
    spriteIds.forEach((spriteId) => {
      const sprite = sprites.at(spriteId);
      const slotObj = sprite ? this.textureSlots[sprite.imageId] : undefined;
      this.gl.bufferSubData(GL.ARRAY_BUFFER, 2 * Float32Array.BYTES_PER_ELEMENT * spriteId, slotObj?.buffer ?? EMPTY_VEC2);
      const spriteWaitingForTexture = sprite && !slotObj;
      if (!spriteWaitingForTexture) {
        spriteIds.delete(spriteId);
      }
    });
  }
  updateUniformMatrix(type, matrix) {
    this.gl.uniformMatrix4fv(this.matrixUniforms[type], false, matrix);
  }
  updateUniformFloat(type, value) {
    this.gl.uniform1f(this.floatUniforms[type], value);
  }
  updateUniformVector(type, vector) {
    this.gl.uniform3fv(this.vec3Uniforms[type], vector);
  }
  bindVertexArray() {
    return this.own(new VertexArray(this.gl));
  }
  setPixelListener(listener) {
    this.pixelListener = listener;
  }
  _pixel = new Uint8Array(4);
  getPixel(x, y) {
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this._pixel);
    const [r, g, b, _a] = this._pixel;
    return r * 65536 + g * 256 + b;
  }
  static clearBit = GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT;
  refresh() {
    this.gl.clear(GraphicsEngine.clearBit);
    this.drawElementsInstanced(VERTEX_COUNT, this.spriteCount);
    this.pixelListener?.setPixel(this.getPixel(this.pixelListener.x, this.pixelListener.y));
  }
}

// src/core/motor/Motor.ts
var MAX_DELTA_TIME = 50;

class Motor {
  updateSchedule = new Map;
  time = 0;
  set holder(refresh) {
    this.loop(refresh);
  }
  loop(update, frameRate, expirationTime) {
    this.registerUpdate(update, { period: frameRate ? 1000 / frameRate : 1, expirationTime });
  }
  registerUpdate(update, schedule = {}) {
    schedule.triggerTime = schedule.triggerTime ?? this.time;
    schedule.expirationTime = schedule.expirationTime ?? Infinity;
    schedule.period = schedule.period;
    this.updateSchedule.set(update, schedule);
  }
  deregisterUpdate(update) {
    this.updateSchedule.delete(update);
  }
  activate() {
    let handle = 0;
    const updatePayload = {
      time: 0,
      deltaTime: 0
    };
    const updates = [];
    const loop = (time) => {
      updatePayload.deltaTime = Math.min(time - updatePayload.time, MAX_DELTA_TIME);
      updatePayload.time = time;
      handle = requestAnimationFrame(loop);
      this.time = time;
      updates.length = 0;
      this.updateSchedule.forEach((schedule, update) => {
        if (time < schedule.triggerTime) {
          return;
        }
        updates.push(update);
        if (schedule.period && time < schedule.expirationTime) {
          schedule.triggerTime = Math.max(schedule.triggerTime + schedule.period, time);
        } else {
          this.updateSchedule.delete(update);
        }
      });
      updates.forEach((update) => update.refresh?.(updatePayload));
    };
    requestAnimationFrame(loop);
    this.deactivate = () => {
      cancelAnimationFrame(handle);
      this.deactivate = undefined;
    };
  }
}

// src/world/aux/AuxiliaryHolder.ts
class AuxiliaryHolder {
  auxiliaries = [];
  refreshes = [];
  cellTracks = [];
  active = false;
  activate() {
    if (this.active) {
      return;
    }
    this.active = true;
    if (this.auxiliaries) {
      for (const a of this.auxiliaries) {
        a.activate?.();
      }
    }
  }
  deactivate() {
    if (!this.active) {
      return;
    }
    this.active = false;
    if (this.auxiliaries) {
      for (const a of this.auxiliaries) {
        a.deactivate?.();
      }
      this.removeAllAuxiliaries();
    }
  }
  refresh(updatePayload) {
    for (const r of this.refreshes) {
      r.refresh?.(updatePayload);
    }
  }
  trackCell(cell) {
    for (const v of this.cellTracks) {
      v.trackCell(cell);
    }
  }
  untrackCell(cellTag) {
    for (const v of this.cellTracks) {
      v.untrackCell(cellTag);
    }
  }
  addAuxiliary(...aux) {
    if (!this.auxiliaries) {
      this.auxiliaries = [];
    }
    aux.forEach((a) => {
      a.holder = this;
      this.auxiliaries?.push(a);
      if (this.active) {
        a.activate?.();
      }
    });
    this.onAuxiliariesChange();
  }
  removeAllAuxiliaries() {
    this.removeAuxiliary(...this.auxiliaries ?? []);
  }
  removeAuxiliary(...aux) {
    if (this.auxiliaries) {
      const removeSet = new Set(aux);
      let j = 0;
      for (let i = 0;i < this.auxiliaries.length; i++) {
        const a = this.auxiliaries[i];
        if (!removeSet.has(a)) {
          this.auxiliaries[j] = a;
          j++;
        } else {
          a.deactivate?.();
          a.holder = undefined;
        }
      }
      this.auxiliaries.length = j;
      if (!this.auxiliaries.length) {
        this.auxiliaries = undefined;
      }
    }
    this.onAuxiliariesChange();
  }
  onAuxiliariesChange() {
    this.refreshes = this.auxiliaries?.filter((a) => !!a.refresh) ?? undefined;
    this.cellTracks = this.auxiliaries?.filter((a) => !!a.trackCell || !!a.untrackCell) ?? undefined;
  }
}

// src/core/Core.ts
class Core extends AuxiliaryHolder {
  motor;
  engine;
  constructor({ motor, canvas, engine, size }) {
    super();
    this.motor = motor ?? new Motor;
    this.engine = engine ?? new GraphicsEngine(canvas ?? new OffscreenCanvas(size[0], size[1]));
  }
  start(world) {
    const { motor, engine } = this;
    this.addAuxiliary(world, motor, engine);
    this.activate();
  }
  stop() {
    this.motor.deregisterUpdate(this);
    this.deactivate();
  }
}

// src/controls/Keyboard.ts
var QUICK_TAP_TIME = 200;

class Keyboard extends AuxiliaryHolder {
  keys = {};
  keysUp = {};
  keyDownListener = new Set;
  keyUpListener = new Set;
  quickTapListener = new Set;
  isActive = false;
  timeProvider;
  constructor({ motor }) {
    super();
    this.keyDown = this.keyDown.bind(this);
    this.keyUp = this.keyUp.bind(this);
    this.timeProvider = motor;
  }
  keyDown(e) {
    if (!this.keys[e.code]) {
      const time = this.timeProvider.time;
      this.keys[e.code] = time;
      this.keyDownListener.forEach((listener) => listener.onKeyDown?.(e.code, time));
    }
    e.preventDefault();
  }
  keyUp(e) {
    const quickTap = this.timeProvider.time - this.keys[e.code] < QUICK_TAP_TIME;
    this.keysUp[e.code] = this.timeProvider.time;
    this.keys[e.code] = 0;
    this.keyUpListener.forEach((listener) => listener.onKeyUp?.(e.code, this.timeProvider.time));
    if (quickTap) {
      this.quickTapListener.forEach((listener) => listener.onQuickTap?.(e.code, this.timeProvider.time));
    }
  }
  activate() {
    super.activate();
    this.setActive(true);
  }
  deactivate() {
    super.deactivate();
    this.setActive(false);
  }
  setActive(value) {
    if (this.isActive !== value) {
      this.isActive = value;
      document.removeEventListener("keydown", this.keyDown);
      document.removeEventListener("keyup", this.keyUp);
      if (this.isActive) {
        document.addEventListener("keydown", this.keyDown);
        document.addEventListener("keyup", this.keyUp);
      }
    }
  }
  addListener(listener) {
    if (listener.onKeyDown) {
      this.keyDownListener.add(listener);
    }
    if (listener.onKeyUp) {
      this.keyUpListener.add(listener);
    }
    if (listener.onQuickTap) {
      this.quickTapListener.add(listener);
    }
    return () => {
      this.removeListener(listener);
    };
  }
  removeListener(listener) {
    this.keyDownListener.delete(listener);
    this.keyUpListener.delete(listener);
    this.quickTapListener.delete(listener);
  }
}

// src/core/aux/ResizeAux.ts
class ResizeAux {
  engine;
  camera;
  constructor({ engine }) {
    this.engine = engine;
  }
  set holder(value) {
    this.camera = value;
  }
  activate() {
    this.handleResize();
  }
  deactivate() {
    this.removeListener?.();
    this.removeListener = undefined;
  }
  handleResize() {
    const { engine } = this;
    const onResize = (width, height2) => {
      this.camera?.resizeViewport(width, height2);
    };
    this.removeListener = engine.addResizeListener(onResize);
  }
}

// src/gl/transform/ProjectionMatrix.ts
class ProjectionMatrix extends AuxiliaryHolder {
  onChange;
  baseMatrix = Matrix_default.create();
  perspectiveMatrix = Matrix_default.create();
  orthoMatrix = Matrix_default.create();
  _perspectiveLevel = 1;
  _zoom = 1;
  _width = 0;
  _height = 0;
  constructor(onChange) {
    super();
    this.onChange = onChange;
  }
  configPerspectiveMatrix(angle2, ratio, near, far) {
    this.perspectiveMatrix.perspective(angle2, ratio, near, far);
  }
  configOrthoMatrix(width, height2, near, far) {
    this.orthoMatrix.ortho(-width / 2, width / 2, -height2 / 2, height2 / 2, near, far);
  }
  configure(width, height2, zoom = 1, near = 0.5, far = 1000) {
    if (this._width !== width || this._height !== height2 || this._zoom !== zoom) {
      this._width = width;
      this._height = height2;
      this._zoom = zoom;
      const ratio = width / height2;
      const angle2 = 45 / Math.sqrt(this._zoom);
      this.configPerspectiveMatrix(angle2, ratio, Math.max(near, 0.00001), far);
      this.configOrthoMatrix(ratio / this._zoom / this._zoom, 1 / this._zoom / this._zoom, -far, far);
      this.onChange?.();
    }
  }
  setPerspective(level) {
    this._perspectiveLevel = level;
    this.onChange?.();
  }
  setZoom(zoom) {
    this.configure(this._width, this._height, zoom);
  }
  getMatrix() {
    this.baseMatrix.combine(this.orthoMatrix, this.perspectiveMatrix, this._perspectiveLevel);
    return this.baseMatrix.getMatrix();
  }
}

// src/gl/utils/angleUtils.ts
function angle2(value) {
  return (value + Math.PI) % (2 * Math.PI) - Math.PI;
}
function angleStep(angle3, step) {
  return Math.round(angle3 / step) * step;
}

// src/core/value/Progressive.ts
class Progressive {
  element;
  getValue;
  apply;
  _goal;
  active = false;
  speed = 0;
  locker;
  constructor(element, getValue, apply) {
    this.element = element;
    this.getValue = getValue;
    this.apply = apply;
    this._goal = this.getValue(element);
  }
  setGoal(value, speed, locker) {
    if (this.locker && this.locker !== locker) {
      return;
    }
    if (this._goal !== value || this.speed !== speed) {
      this.speed = speed;
      this._goal = value;
      this.locker = locker;
      this.active = true;
    }
  }
  get goal() {
    return this._goal;
  }
  update(deltaTime) {
    if (this.active) {
      const curValue = this.getValue(this.element);
      const diff = this.goal - curValue;
      const dDist = Math.min(Math.abs(diff), this.speed * deltaTime);
      if (dDist <= 0.01) {
        this.apply(this.element, this.goal);
        this.active = false;
        this.locker = undefined;
      } else {
        this.apply(this.element, curValue + dDist * Math.sign(diff));
      }
    }
    return this.active;
  }
}

// src/gl/transform/TiltMatrix.ts
class TiltMatrix {
  onChange;
  matrix = Matrix_default.create();
  _tilt = 0;
  progressive;
  constructor(onChange) {
    this.onChange = onChange;
    this.progressive = new Progressive(this, (matrix) => matrix.tilt, (matrix, value) => matrix.tilt = value);
  }
  get tilt() {
    return this._tilt;
  }
  set tilt(value) {
    this._tilt = angle2(value);
    this.matrix.setXRotation(this._tilt);
    this.onChange?.();
  }
  getMatrix() {
    return this.matrix.getMatrix();
  }
}

// src/gl/transform/TurnMatrix.ts
class TurnMatrix {
  onChange;
  matrix = Matrix_default.create();
  _turn = 0;
  progressive;
  constructor(onChange) {
    this.onChange = onChange;
    this.progressive = new Progressive(this, (matrix) => matrix.turn, (matrix, value) => matrix.turn = value);
  }
  get turn() {
    return this._turn;
  }
  set turn(value) {
    this._turn = angle2(value);
    this.matrix.setYRotation(this._turn);
    this.onChange?.();
  }
  getMatrix() {
    return this.matrix.getMatrix();
  }
}

// src/updates/CameraUpdate.ts
class CameraUpdate {
  getCameraMatrix;
  engine;
  motor;
  updatedTypes = new Set;
  constructor(getCameraMatrix, engine, motor) {
    this.getCameraMatrix = getCameraMatrix;
    this.engine = engine;
    this.motor = motor;
  }
  informUpdate(type) {
    this.motor.registerUpdate(this.withCameraType(type));
  }
  withCameraType(type) {
    this.updatedTypes.add(type);
    return this;
  }
  refresh() {
    this.updatedTypes.forEach((type) => this.engine.updateUniformMatrix(type, this.getCameraMatrix(type)));
  }
}

// src/updates/CameraFloatUpdate.ts
class CameraFloatUpdate {
  getCameraFloat;
  engine;
  motor;
  updatedTypes = new Set;
  constructor(getCameraFloat, engine, motor) {
    this.getCameraFloat = getCameraFloat;
    this.engine = engine;
    this.motor = motor;
  }
  informUpdate(type) {
    this.motor.registerUpdate(this.withCameraType(type));
  }
  withCameraType(type) {
    this.updatedTypes.add(type);
    return this;
  }
  refresh() {
    this.updatedTypes.forEach((type) => this.engine.updateUniformFloat(type, this.getCameraFloat(type)));
  }
}

// src/world/sprite/List.ts
function forEach3(list, callback) {
  if (list) {
    for (let i = 0;i < list.length; i++) {
      const elem = list.at(i);
      callback(elem, i);
    }
  }
}
function map(list, callback) {
  const r = [];
  for (let i = 0;i < list.length; i++) {
    const elem = list.at(i);
    r.push(elem ? callback(elem, i) : undefined);
  }
  return r;
}

// src/world/grid/Position.ts
function toPos(x, y, z) {
  _position[0] = x;
  _position[1] = y;
  _position[2] = z;
  return _position;
}
function transformToPosition(transform, pos = _position) {
  const m = transform.getMatrix();
  pos[0] = m[12];
  pos[1] = m[13];
  pos[2] = m[14];
  return pos;
}
var _position = [0, 0, 0];
var _matrix = Matrix_default.create();

// src/gl/transform/PositionMatrix.ts
class PositionMatrix extends AuxiliaryHolder {
  onChange;
  matrix = Matrix_default.create().setPosition(0, 0, 0);
  _position = [0, 0, 0];
  static _cellPos = [0, 0, 0, 0];
  static _tempPos = [0, 0, 0];
  moveBlocker;
  constructor(onChange) {
    super();
    this.onChange = onChange;
  }
  changedPosition() {
    transformToPosition(this.matrix, this._position);
    this.onChange?.();
  }
  moveBy(x, y, z, turnMatrix) {
    const vector = this.matrix.getMoveVector(x, y, z, turnMatrix);
    const blocked = this.moveBlocker?.isBlocked(toPos(this.position[0] + vector[0], this.position[1] + vector[1], this.position[2] + vector[2]), this.position);
    if (!blocked) {
      this.matrix.move(vector);
      this.changedPosition();
    }
    return !blocked;
  }
  moveTo(x, y, z) {
    const blocked = this.moveBlocker?.isBlocked(toPos(x, y, z));
    if (!blocked) {
      this.matrix.setPosition(x, y, z);
      this.changedPosition();
    }
    return !blocked;
  }
  get position() {
    return this._position;
  }
  getCellPosition(cellSize) {
    return PositionMatrix.getCellPos(this.position, cellSize);
  }
  static getCellPos(pos, cellSize) {
    this._cellPos[0] = Math.round(pos[0] / cellSize);
    this._cellPos[1] = Math.round(pos[1] / cellSize);
    this._cellPos[2] = Math.round(pos[2] / cellSize);
    this._cellPos[3] = cellSize;
    return this._cellPos;
  }
  static positionFromCell(cellPos) {
    const [cx, cy, cz, cellSize] = cellPos;
    this._tempPos[0] = cx * cellSize;
    this._tempPos[1] = cy * cellSize;
    this._tempPos[2] = cz * cellSize;
    return this._tempPos;
  }
  gotoPos(x, y, z, speed = 0.1) {
    const curPos = this.position;
    const dx = x - curPos[0];
    const dy = y - curPos[1];
    const dz = z - curPos[2];
    const dist2 = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist2 > 0.01) {
      const sp = Math.min(dist2, speed);
      return this.moveBy(dx / dist2 * sp, dy / dist2 * sp, dz / dist2 * sp);
    } else {
      return this.moveTo(x, y, z);
    }
  }
  getMatrix() {
    return this.matrix.getMatrix();
  }
}

// src/updates/CameraVectorUpdate.ts
class CameraVectorUpdate {
  getCameraVector;
  engine;
  motor;
  updatedTypes = new Set;
  constructor(getCameraVector, engine, motor) {
    this.getCameraVector = getCameraVector;
    this.engine = engine;
    this.motor = motor;
  }
  informUpdate(type) {
    this.motor.registerUpdate(this.withCameraType(type));
  }
  withCameraType(type) {
    this.updatedTypes.add(type);
    return this;
  }
  refresh() {
    this.updatedTypes.forEach((type) => this.engine.updateUniformVector(type, this.getCameraVector(type)));
  }
}

// src/gl/camera/Camera.ts
class Camera extends AuxiliaryHolder {
  camMatrix = Matrix_default.create();
  projectionMatrix = new ProjectionMatrix(() => this.updateInformer.informUpdate(MatrixUniform.PROJECTION));
  posMatrix = new PositionMatrix(() => this.updateInformer.informUpdate(MatrixUniform.CAM_POS));
  tiltMatrix = new TiltMatrix(() => this.updateInformer.informUpdate(MatrixUniform.CAM_TILT));
  turnMatrix = new TurnMatrix(() => this.updateInformer.informUpdate(MatrixUniform.CAM_TURN));
  _curvature = 0.05;
  _distance = 0.5;
  _bgColor = [0, 0, 0];
  _blur = 1;
  _viewportWidth = 0;
  _viewportHeight = 0;
  updateInformer;
  updateInformerFloat;
  updateInformerVector;
  engine;
  constructor({ engine, motor }) {
    super();
    this.engine = engine;
    this.updateInformer = new CameraUpdate(this.getCameraMatrix.bind(this), engine, motor);
    this.updateInformerFloat = new CameraFloatUpdate(this.getCameraFloat.bind(this), engine, motor);
    this.updateInformerVector = new CameraVectorUpdate(this.getCameraVector.bind(this), engine, motor);
    this.addAuxiliary(this.posMatrix);
  }
  activate() {
    super.activate();
    this.updateInformer.informUpdate(MatrixUniform.PROJECTION);
    this.updateInformer.informUpdate(MatrixUniform.CAM_POS);
    this.updateInformer.informUpdate(MatrixUniform.CAM_TURN);
    this.updateInformer.informUpdate(MatrixUniform.CAM_TILT);
    this.updateInformerFloat.informUpdate(FloatUniform.CURVATURE);
    this.updateInformerFloat.informUpdate(FloatUniform.CAM_DISTANCE);
    this.updateInformerVector.informUpdate(VectorUniform.BG_COLOR);
    this.updateInformerFloat.informUpdate(FloatUniform.BG_BLUR);
  }
  cameraMatrices = {
    [MatrixUniform.PROJECTION]: this.projectionMatrix,
    [MatrixUniform.CAM_POS]: this.camMatrix,
    [MatrixUniform.CAM_TURN]: this.turnMatrix,
    [MatrixUniform.CAM_TILT]: this.tiltMatrix
  };
  resizeViewport(width, height2) {
    if (this._viewportWidth !== width || this._viewportHeight !== height2) {
      this._viewportWidth = width;
      this._viewportHeight = height2;
      this.projectionMatrix.configure(this._viewportWidth, this._viewportHeight);
    }
  }
  set curvature(value) {
    this._curvature = value;
    this.updateInformerFloat.informUpdate(FloatUniform.CURVATURE);
  }
  set distance(value) {
    this._distance = value;
    this.updateInformerFloat.informUpdate(FloatUniform.CAM_DISTANCE);
  }
  set blur(value) {
    this._blur = value;
    this.updateInformerFloat.informUpdate(FloatUniform.BG_BLUR);
  }
  set bgColor(rgb) {
    const red = rgb >> 16 & 255;
    const green = rgb >> 8 & 255;
    const blue = rgb & 255;
    this._bgColor[0] = red / 255;
    this._bgColor[1] = green / 255;
    this._bgColor[2] = blue / 255;
    this.updateInformerVector.informUpdate(VectorUniform.BG_COLOR);
    this.engine.setBgColor(this._bgColor);
  }
  getCameraMatrix(uniform) {
    if (uniform === MatrixUniform.CAM_POS) {
      this.camMatrix.invert(this.posMatrix);
    }
    return this.cameraMatrices[uniform].getMatrix();
  }
  getCameraFloat(uniform) {
    switch (uniform) {
      case FloatUniform.CURVATURE:
        return this._curvature;
      case FloatUniform.CAM_DISTANCE:
        return this._distance;
      case FloatUniform.BG_BLUR:
        return this._blur;
    }
  }
  getCameraVector(uniform) {
    switch (uniform) {
      case VectorUniform.BG_COLOR:
        return this._bgColor;
    }
  }
  moveCam(x, y, z) {
    this.posMatrix.moveBy(x, y, z, this.turnMatrix);
  }
}

// src/world/grid/CellPos.ts
function cellTag(x, y, z, cellSize) {
  return `(${x},${y},${z})_${cellSize}`;
}

// src/gl/transform/aux/CellChangeAuxiliary.ts
class CellChangeAuxiliary {
  matrix;
  cellSize;
  cell;
  visitCellObj;
  constructor({ visitCell }, config) {
    this.cellSize = config?.cellSize ?? 1;
    this.visitCellObj = visitCell;
    this.cell = { pos: [0, 0, 0, this.cellSize], tag: "" };
  }
  set holder(value) {
    this.matrix = value;
    if (this.matrix) {
      const cellPos = this.matrix.getCellPosition(this.cellSize);
      this.cell.pos[0] = cellPos[0];
      this.cell.pos[1] = cellPos[1];
      this.cell.pos[2] = cellPos[2];
      this.cell.tag = cellTag(...this.cell.pos);
    }
  }
  activate() {
    this.visitCellObj.visitCell(this.cell);
  }
  refresh(updatePayload) {
    if (!this.matrix) {
      return;
    }
    const [x, y, z] = this.matrix.getCellPosition(this.cellSize);
    if (this.cell.pos[0] !== x || this.cell.pos[1] !== y || this.cell.pos[2] !== z) {
      this.cell.pos[0] = x;
      this.cell.pos[1] = y;
      this.cell.pos[2] = z;
      this.cell.tag = cellTag(...this.cell.pos);
      this.visitCellObj.visitCell(this.cell, updatePayload);
    }
  }
}

// src/world/aux/Auxiliaries.ts
class Auxiliaries {
  auxiliaries;
  active = false;
  constructor(auxiliaries) {
    this.auxiliaries = auxiliaries;
  }
  static from(...aux) {
    return new Auxiliaries(aux);
  }
  get length() {
    return this.auxiliaries.length;
  }
  at(index) {
    return this.auxiliaries.at(index);
  }
  refresh(updatePayload) {
    forEach3(this.auxiliaries, (aux) => aux?.refresh?.(updatePayload));
  }
  activate() {
    if (!this.active) {
      this.active = true;
      forEach3(this.auxiliaries, (aux) => aux?.activate?.());
    }
  }
  deactivate() {
    if (this.active) {
      this.active = false;
      forEach3(this.auxiliaries, (aux) => aux?.deactivate?.());
    }
  }
}

// src/world/aux/CamMoveAuxiliary.ts
class CamMoveAuxiliary {
  keyboard;
  camera;
  config;
  constructor(props, config) {
    this.keyboard = props.keyboard;
    this.camera = props.camera;
    this.config = {
      speed: config?.speed ?? 1
    };
  }
  refresh(update) {
    const { keys } = this.keyboard;
    const { deltaTime } = update;
    const speed = deltaTime / 80 * this.config.speed;
    const turnspeed = deltaTime / 400;
    if (keys.KeyW || keys.ArrowUp && !keys.ShiftRight) {
      this.camera.moveCam(0, 0, -speed);
    }
    if (keys.KeyS || keys.ArrowDown && !keys.ShiftRight) {
      this.camera.moveCam(0, 0, speed);
    }
    if (keys.KeyA || keys.ArrowLeft && !keys.ShiftRight) {
      this.camera.moveCam(-speed, 0, 0);
    }
    if (keys.KeyD || keys.ArrowRight && !keys.ShiftRight) {
      this.camera.moveCam(speed, 0, 0);
    }
    if (keys.KeyQ || keys.ArrowLeft && keys.ShiftRight) {
      this.camera.turnMatrix.turn -= turnspeed;
    }
    if (keys.KeyE || keys.ArrowRight && keys.ShiftRight) {
      this.camera.turnMatrix.turn += turnspeed;
    }
    if (keys.ArrowUp && keys.ShiftRight) {
      this.camera.tiltMatrix.tilt -= turnspeed;
    }
    if (keys.ArrowDown && keys.ShiftRight) {
      this.camera.tiltMatrix.tilt += turnspeed;
    }
  }
}

// src/world/aux/CamStepAuxiliary.ts
class CamStepAuxiliary {
  keyboard;
  camera;
  goalPos;
  stepCount = 0;
  turnCount = 0;
  tiltCount = 0;
  config;
  constructor({ keyboard, camera }, config = {}) {
    this.keyboard = keyboard;
    this.camera = camera;
    const camPos = this.camera.posMatrix.position;
    this.goalPos = [...camPos];
    this.config = {
      step: config.step ?? 2,
      turnStep: config.turnStep ?? Math.PI / 2,
      tiltStep: config.tiltStep ?? Math.PI / 2,
      speed: config.speed ?? 1
    };
  }
  prePos = [0, 0, 0];
  refresh(update) {
    const { keys } = this.keyboard;
    const { deltaTime } = update;
    const pos = this.camera.posMatrix.position;
    const { step, turnStep, tiltStep } = this.config;
    this.prePos[0] = Math.round(pos[0] / step) * step;
    this.prePos[1] = Math.round(pos[1] / step) * step;
    this.prePos[2] = Math.round(pos[2] / step) * step;
    let dx = 0, dz = 0;
    if (keys.KeyW || keys.ArrowUp && !keys.ShiftRight) {
      dz--;
    }
    if (keys.KeyS || keys.ArrowDown && !keys.ShiftRight) {
      dz++;
    }
    if (keys.KeyA || keys.ArrowLeft && !keys.ShiftRight) {
      dx--;
    }
    if (keys.KeyD || keys.ArrowRight && !keys.ShiftRight) {
      dx++;
    }
    const turnGoal = this.camera.turnMatrix.progressive.goal;
    if (dx || dz || this.stepCount > 0) {
      const relativeDx = dx * Math.cos(turnGoal) - dz * Math.sin(turnGoal);
      const relativeDz = dx * Math.sin(turnGoal) + dz * Math.cos(turnGoal);
      const gx = Math.round(pos[0] / step + relativeDx) * step;
      const gz = Math.round(pos[2] / step + relativeDz) * step;
      this.goalPos[0] = gx;
      this.goalPos[2] = gz;
    }
    if (!dx && !dz) {
      this.stepCount = 0;
    }
    const speed = (dx || dz ? deltaTime / 150 : deltaTime / 100) * this.config.speed;
    const didMove = this.camera.posMatrix.gotoPos(this.goalPos[0], pos[1], this.goalPos[2], speed);
    if (!didMove) {
      const gx = Math.round(pos[0] / step) * step;
      const gz = Math.round(pos[2] / step) * step;
      this.goalPos[0] = gx;
      this.goalPos[2] = gz;
    }
    const newPos = this.camera.posMatrix.position;
    if (Math.round(newPos[0] / step) * step !== this.prePos[0] || Math.round(newPos[1] / step) * step !== this.prePos[1] || Math.round(newPos[2] / step) * step !== this.prePos[2]) {
      this.stepCount++;
    }
    let dTurn = 0;
    if (keys.KeyQ || keys.ArrowLeft && keys.ShiftRight) {
      dTurn--;
    }
    if (keys.KeyE || keys.ArrowRight && keys.ShiftRight) {
      dTurn++;
    }
    const turn = angleStep(this.camera.turnMatrix.turn, turnStep);
    if (dTurn || this.turnCount > 0) {
      this.camera.turnMatrix.progressive.setGoal(angleStep(turn + turnStep * dTurn, turnStep), dTurn ? 0.005 : 0.01, this);
    }
    if (!dTurn) {
      this.turnCount = 0;
    }
    if (this.camera.turnMatrix.progressive.update(deltaTime)) {
      const newTurn = angleStep(this.camera.turnMatrix.turn, turnStep);
      if (newTurn !== turn) {
        this.turnCount++;
      }
    }
    let dTilt = 0;
    if (keys.ArrowUp && keys.ShiftRight) {
      dTilt--;
    }
    if (keys.ArrowDown && keys.ShiftRight) {
      dTilt++;
    }
    const tilt = angleStep(this.camera.tiltMatrix.tilt, tiltStep);
    if (dTilt || this.tiltCount > 0) {
      this.camera.tiltMatrix.progressive.setGoal(angleStep(tilt + tiltStep * dTilt, tiltStep), dTilt ? 0.0025 : 0.005, this);
    }
    if (!dTilt) {
      this.tiltCount = 0;
    }
    if (this.camera.tiltMatrix.progressive.update(deltaTime)) {
      const newTilt = angleStep(this.camera.tiltMatrix.tilt, tiltStep);
      if (newTilt !== tilt) {
        this.tiltCount++;
      }
    }
  }
}

// src/world/aux/CamTiltResetAuxiliary.ts
class CamTiltResetAuxiliary {
  keyboard;
  camera;
  key;
  constructor(props, config) {
    this.keyboard = props.keyboard;
    this.camera = props.camera;
    this.key = config.key;
    this._refresh = this._refresh.bind(this);
  }
  activate() {
    const removeListener = this.keyboard.addListener({
      onQuickTap: (keyCode) => {
        if (keyCode === this.key) {
          this.refresh = this._refresh;
          this.camera.tiltMatrix.progressive.setGoal(0, 0.0033333333333333335, this);
        }
      }
    });
    this.deactivate = () => {
      removeListener();
      this.deactivate = undefined;
    };
  }
  refresh;
  _refresh(update) {
    const { deltaTime } = update;
    if (!this.camera.tiltMatrix.progressive.update(deltaTime)) {
      this.refresh = undefined;
    }
  }
}

// src/world/aux/JumpAuxiliary.ts
class JumpAuxiliary {
  keyboard;
  camera;
  key;
  gravity;
  dy;
  jumpStrength = 0;
  plane = 1;
  constructor({ keyboard, camera }, config = {}) {
    this.keyboard = keyboard;
    this.camera = camera;
    this.key = config.key ?? "Space";
    this.gravity = config.gravity ?? -1;
    this.jumpStrength = config.jump ?? 2;
    this.plane = config.plane ?? 10;
    this.dy = 0;
  }
  refresh(update) {
    const { deltaTime } = update;
    this.jump(deltaTime, this.keyboard);
  }
  jump(deltaTime, keyboard) {
    const speed = deltaTime / 80;
    const acceleration = deltaTime / 80;
    const { keys } = keyboard;
    const [_x, y, _z] = this.camera.posMatrix.position;
    if (y === 0) {
      if (keys[this.key]) {
        this.dy = this.jumpStrength;
        this.camera.moveCam(0, speed * this.dy, 0);
      }
    } else {
      this.camera.moveCam(0, speed * this.dy, 0);
      const [x, y2, z] = this.camera.posMatrix.position;
      if (y2 > 0) {
        const mul4 = this.dy < 0 ? 1 / this.plane : 1;
        this.dy += this.gravity * acceleration * mul4;
      } else {
        this.camera.posMatrix.moveTo(x, 0, z);
        this.dy = 0;
      }
    }
  }
}

// src/world/aux/ToggleAuxiliary.ts
class ToggleAuxiliary {
  keyboard;
  active = false;
  toggleIndex = 0;
  keys;
  auxiliaries;
  keyListener;
  constructor(config) {
    this.keys = map(config.auxiliariesMapping, ({ key }) => key);
    this.keyListener = {
      onKeyDown: (keyCode) => {
        if (this.keys.indexOf(keyCode) >= 0) {
          const wasActive = this.active;
          this.auxiliary?.deactivate?.();
          this.toggle(keyCode);
          if (wasActive) {
            this.auxiliary?.activate?.();
          }
        }
      }
    };
    this.auxiliaries = map(config.auxiliariesMapping, ({ aux }) => aux);
  }
  set holder(keyboard) {
    this.keyboard = keyboard;
  }
  get auxiliary() {
    return this.auxiliaries.at(this.toggleIndex);
  }
  toggle(key) {
    if (this.keys[this.toggleIndex] !== key) {
      this.toggleIndex = this.keys.indexOf(key);
    } else {
      const nextIndex = this.keys.length ? (this.toggleIndex + 1) % this.keys.length : 0;
      if (this.keys[nextIndex] === key) {
        this.toggleIndex = nextIndex;
      }
    }
  }
  refresh(updatePayload) {
    this.auxiliary?.refresh?.(updatePayload);
  }
  activate() {
    if (!this.active) {
      this.keyboard?.addListener(this.keyListener);
      this.active = true;
      this.auxiliary?.activate?.();
    }
  }
  deactivate() {
    if (this.active) {
      this.keyboard?.removeListener(this.keyListener);
      this.active = false;
      this.auxiliary?.deactivate?.();
    }
  }
}

// src/utils/ObjectPool.ts
class ObjectPool {
  initCall;
  allObjectsCreated = [];
  recycler = [];
  constructor(initCall) {
    this.initCall = initCall;
  }
  recycle(element) {
    this.recycler.push(element);
  }
  create(...params) {
    const recycledElem = this.recycler.pop();
    if (recycledElem) {
      return this.initCall(recycledElem, ...params);
    }
    const elem = this.initCall(undefined, ...params);
    this.allObjectsCreated.push(elem);
    return elem;
  }
  reset() {
    this.recycler.length = 0;
    this.recycler.push(...this.allObjectsCreated);
  }
}

// src/utils/DoubleLinkList.ts
class DoubleLinkList {
  start;
  end;
  nodeMap = new Map;
  pool;
  constructor(edgeValue) {
    this.start = { value: edgeValue };
    this.end = { value: edgeValue };
    this.start.next = this.end;
    this.end.prev = this.start;
    this.pool = new ObjectPool((elem, value) => {
      if (!elem) {
        return { value };
      }
      elem.value = value;
      return elem;
    });
  }
  get size() {
    return this.nodeMap.size;
  }
  tags = [];
  getList() {
    this.tags.length = 0;
    for (let e = this.start.next;e !== this.end; e = e.next) {
      this.tags.push(e.value);
    }
    return this.tags;
  }
  pushTop(value) {
    const formerTop = this.end.prev;
    const newTop = this.pool.create(value);
    newTop.prev = formerTop;
    newTop.next = this.end;
    formerTop.next = this.end.prev = newTop;
    this.nodeMap.set(value, newTop);
  }
  remove(value) {
    const entry = this.nodeMap.get(value);
    if (entry) {
      if (entry.prev) {
        entry.prev.next = entry.next;
      }
      if (entry.next) {
        entry.next.prev = entry.prev;
      }
      entry.prev = entry.next = undefined;
      this.pool.recycle(entry);
      return true;
    } else {
      return false;
    }
  }
  popBottom() {
    const entryToRemove = this.start.next;
    if (entryToRemove !== this.end) {
      const newBottom = entryToRemove.next;
      this.start.next = newBottom;
      newBottom.prev = this.start;
      this.nodeMap.delete(entryToRemove.value);
      entryToRemove.prev = entryToRemove.next = undefined;
      this.pool.recycle(entryToRemove);
      return entryToRemove.value;
    }
    return;
  }
}

// src/world/grid/CellTracker.ts
class CellTracker {
  cellTrack;
  range;
  base;
  cellLimit;
  cellSize;
  tempCell;
  cellTags = new DoubleLinkList("");
  constructor(cellTrack, { range, cellLimit, cellSize = 1 } = {}) {
    this.cellTrack = cellTrack;
    this.range = [range?.[0] ?? 3, range?.[1] ?? 3, range?.[2] ?? 3];
    this.base = this.range.map((r) => Math.ceil(-r / 2));
    this.cellLimit = Math.max(0, cellLimit ?? 10);
    this.cellSize = cellSize ?? 1;
    this.tempCell = {
      pos: [0, 0, 0, this.cellSize],
      tag: ""
    };
    this.onCellVisit = this.onCellVisit.bind(this);
  }
  getCellTags() {
    return this.cellTags.getList();
  }
  iterateCells(visitedCell, callback) {
    const { range, base, tempCell } = this;
    const { pos } = visitedCell;
    const cellX = pos[0] + base[0];
    const cellY = pos[1] + base[1];
    const cellZ = pos[2] + base[2];
    for (let z = 0;z < range[0]; z++) {
      for (let x = 0;x < range[2]; x++) {
        for (let y = 0;y < range[1]; y++) {
          tempCell.pos[0] = cellX + x;
          tempCell.pos[1] = cellY + y;
          tempCell.pos[2] = cellZ + z;
          tempCell.tag = cellTag(...tempCell.pos);
          callback(tempCell);
        }
      }
    }
  }
  onCellVisit(cell) {
    if (!this.cellTags.remove(cell.tag)) {
      this.cellTrack.trackCell?.(cell);
    }
    this.cellTags.pushTop(cell.tag);
  }
  visitCell(visitedCell) {
    this.iterateCells(visitedCell, this.onCellVisit);
    while (this.cellTags.size > this.cellLimit) {
      const removedTag = this.cellTags.popBottom();
      if (removedTag) {
        this.cellTrack.untrackCell?.(removedTag);
      }
    }
  }
}

// src/updates/UpdatableList.ts
class UpdatableList {
  array;
  updateValue;
  notifier;
  constructor(array, updateValue, notifier) {
    this.array = array;
    this.updateValue = updateValue;
    this.notifier = notifier;
  }
  at(index) {
    return this.array.at(index);
  }
  get length() {
    return this.array.length;
  }
  set(index, value) {
    this.updateValue(index, value);
    this.notifier?.informUpdate(index);
  }
  remove(index) {
    this.updateValue(index, undefined);
    this.notifier?.informUpdate(index);
  }
}

// src/updates/UpdateRegistry.ts
class UpdateRegistry {
  applyUpdate;
  motor;
  updatedIds = new Set;
  constructor(applyUpdate, motor) {
    this.applyUpdate = applyUpdate;
    this.motor = motor;
  }
  informUpdate(id) {
    this.addId(id);
    this.motor.registerUpdate(this);
  }
  addId(id) {
    this.updatedIds.add(id);
  }
  refresh() {
    this.applyUpdate(this.updatedIds);
    if (this.updatedIds.size) {
      this.motor.registerUpdate(this);
    }
  }
}

// src/world/sprite/Medias.ts
class UpdatableMedias extends UpdatableList {
  constructor({ motor, engine }, medias = []) {
    super(medias, (index, value) => {
      medias[index] = value;
      while (!medias[medias.length - 1]) {
        medias.length--;
      }
    }, new UpdateRegistry((ids) => {
      const imageIds = Array.from(ids);
      ids.clear();
      engine.updateTextures(imageIds, medias.at.bind(medias)).then((mediaInfos) => {
        mediaInfos.forEach((mediaInfo) => {
          if (mediaInfo.isVideo) {
            motor.registerUpdate(mediaInfo, mediaInfo.schedule);
          }
        });
      });
    }, motor));
  }
}

// src/world/sprite/SpritesAccumulator.ts
class SpritesAccumulator extends AuxiliaryHolder {
  constructor() {
    super(...arguments);
  }
  spritesIndices = [];
  newSpritesListener = new Set;
  pool = new ObjectPool((elem, sprites, index) => {
    if (!elem) {
      return { sprites, index };
    }
    elem.sprites = sprites;
    elem.index = index;
    return elem;
  });
  addNewSpritesListener(listener) {
    this.newSpritesListener.add(listener);
  }
  at(spriteId) {
    const slot = this.spritesIndices[spriteId];
    return slot?.sprites.at(slot.index);
  }
  get length() {
    return this.spritesIndices.length;
  }
  addSprites(...spritesList) {
    spritesList.forEach((sprites) => {
      const slots = [];
      if (sprites.informUpdate) {
        sprites.informUpdate = (index, type) => {
          const slot = slots[index] ?? (slots[index] = this.pool.create(sprites, index));
          const sprite = slot.sprites.at(index);
          if (sprite) {
            if (slot.spriteId === undefined) {
              slot.spriteId = this.spritesIndices.length;
              this.spritesIndices.push(slot);
              this.onSizeChange();
            }
            this.informUpdate?.(slot.spriteId, type);
          } else {
            if (slot.spriteId !== undefined) {
              const spriteId = slot.spriteId;
              slot.spriteId = undefined;
              const lastSlotId = this.spritesIndices.length - 1;
              if (spriteId !== lastSlotId) {
                this.spritesIndices[spriteId] = this.spritesIndices[lastSlotId];
                this.spritesIndices[spriteId].spriteId = spriteId;
              }
              this.spritesIndices.pop();
              this.informUpdate?.(spriteId);
              this.informUpdate?.(lastSlotId);
              this.onSizeChange();
            }
          }
        };
      }
    });
    this.onSizeChange();
  }
  onSizeChange() {
    this.spritesIndices.forEach((_, spriteId) => this.informUpdate?.(spriteId));
    this.newSpritesListener.forEach((listener) => listener(this));
  }
  deactivate() {
    super.deactivate();
    this.spritesIndices.forEach((slot) => {
      this.pool.recycle(slot);
    });
    this.spritesIndices.length = 0;
  }
}

// src/world/sprite/SpritesGroup.ts
class SpriteGroup {
  children;
  transform;
  spriteModel = {
    imageId: 0,
    transform: Matrix_default.create()
  };
  constructor(children, transform = Matrix_default.create()) {
    this.children = children;
    this.transform = transform;
  }
  get length() {
    return this.children.length;
  }
  at(index) {
    const s = this.children.at(index);
    if (!s) {
      return;
    }
    this.spriteModel.imageId = s.imageId;
    this.spriteModel.transform.multiply2(this.transform, s.transform);
    return this.spriteModel;
  }
  informUpdate(id, type) {
    this.children.informUpdate?.(id, type);
  }
}

// src/world/sprite/Sprite.ts
function copySprite(sprite) {
  return {
    name: sprite.name,
    transform: Matrix_default.create().copy(sprite.transform),
    imageId: sprite.imageId
  };
}

// src/world/sprite/update/SpriteUpdateType.ts
var SpriteUpdateType;
(function(SpriteUpdateType2) {
  SpriteUpdateType2[SpriteUpdateType2["NONE"] = 0] = "NONE";
  SpriteUpdateType2[SpriteUpdateType2["TRANSFORM"] = 1] = "TRANSFORM";
  SpriteUpdateType2[SpriteUpdateType2["ANIM"] = 2] = "ANIM";
  SpriteUpdateType2[SpriteUpdateType2["ALL"] = 3] = "ALL";
})(SpriteUpdateType || (SpriteUpdateType = {}));

// src/world/sprite/aux/SpriteGrid.ts
class SpriteGrid {
  spriteFactory;
  slots = [];
  ranges;
  slotPool = new ObjectPool((slot, sprite, tag) => {
    if (!slot) {
      return { sprite, tag };
    }
    slot.sprite = sprite;
    slot.tag = tag;
    return slot;
  });
  holder;
  informUpdate(_id, _type) {
  }
  activate() {
    this.holder?.addSprites(this);
  }
  constructor(config, spriteFactory = {}) {
    this.spriteFactory = spriteFactory;
    this.ranges = [
      config?.xRange ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
      config?.yRange ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY],
      config?.zRange ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY]
    ];
  }
  get length() {
    return this.slots.length;
  }
  at(index) {
    return this.slots[index]?.sprite;
  }
  trackCell(cell) {
    const [[minX, maxX], [minY, maxY], [minZ, maxZ]] = this.ranges;
    const [x, y, z] = cell.pos;
    if (x < minX || maxX < x || y < minY || maxY < y || z < minZ || maxZ < z) {
      return;
    }
    const { tag } = cell;
    forEach3(this.spriteFactory.getSpritesAtCell?.(cell), (sprite) => {
      if (sprite) {
        const spriteId = this.slots.length;
        const slot = this.slotPool.create(copySprite(sprite), tag);
        this.slots.push(slot);
        this.informUpdate(spriteId);
      }
    });
  }
  untrackCell(cellTag2) {
    for (let i = this.slots.length - 1;i >= 0; i--) {
      const slot = this.slots[i];
      if (slot.tag === cellTag2) {
        this.informUpdate(i, SpriteUpdateType.ALL);
        this.informUpdate(this.slots.length - 1, SpriteUpdateType.TRANSFORM);
        this.slots[i] = this.slots[this.slots.length - 1];
        this.slots.pop();
        this.slotPool.recycle(slot);
      }
    }
  }
}

// src/world/sprite/aux/FixedSpriteGrid.ts
var EMPTY = [];

class FixedSpriteGrid extends SpriteGrid {
  cellSize;
  spritesPerCell = {};
  spritesList;
  constructor(config, ...spritesList) {
    super({ spriteLimit: config.spriteLimit ?? spritesList.reduce((a, s) => a + s.length, 0) }, {
      getSpritesAtCell: (cell) => {
        return this.spritesPerCell[cell.tag] ?? EMPTY;
      }
    });
    this.cellSize = config.cellSize ?? 1;
    this.spritesList = spritesList;
  }
  activate() {
    super.activate();
    this.spritesList.forEach((sprites) => {
      forEach3(sprites, (sprite) => {
        if (sprite) {
          const pos = transformToPosition(sprite.transform);
          const cellPos = PositionMatrix.getCellPos(pos, this.cellSize);
          const tag = cellTag(...cellPos);
          this.spritesPerCell[tag] = this.spritesPerCell[tag] ?? [];
          this.spritesPerCell[tag].push(copySprite(sprite));
        }
      });
    });
  }
}

// src/world/sprite/aux/MaxSpriteCountAuxiliary.ts
class MaxSpriteCountAuxiliary {
  engine;
  sprites;
  constructor({ engine }) {
    this.engine = engine;
  }
  set holder(value) {
    this.sprites = value;
    value.addNewSpritesListener(this.updateCount.bind(this));
  }
  updateCount() {
    this.engine.setMaxSpriteCount(this.sprites?.length ?? 0);
  }
  activate() {
    this.updateCount();
  }
}

// src/world/sprite/aux/StaticSprites.ts
class StaticSprites {
  sprites;
  holder;
  constructor(sprites) {
    this.sprites = sprites;
    this.informUpdate = sprites.informUpdate?.bind(sprites);
  }
  get length() {
    return this.sprites.length;
  }
  at(index) {
    return this.sprites.at(index);
  }
  activate() {
    this.holder?.addSprites(this);
  }
}

// src/world/sprite/update/SpriteUpdater.ts
class SpriteUpdater {
  spriteTransformUpdate;
  spriteAnimUpdate;
  sprites;
  set holder(value) {
    this.sprites = value;
    value.informUpdate = this.informUpdate.bind(this);
  }
  constructor({ engine, motor }) {
    this.spriteTransformUpdate = new UpdateRegistry((ids) => engine.updateSpriteTransforms(ids, this.sprites), motor);
    this.spriteAnimUpdate = new UpdateRegistry((ids) => engine.updateSpriteAnims(ids, this.sprites), motor);
  }
  informUpdate(id, type = SpriteUpdateType.ALL) {
    if (this.sprites && id < this.sprites.length) {
      if (type & SpriteUpdateType.TRANSFORM) {
        this.spriteTransformUpdate.informUpdate(id);
      }
      if (type & SpriteUpdateType.ANIM) {
        this.spriteAnimUpdate.informUpdate(id);
      }
    }
  }
}

// src/demo/DemoWorld.ts
var DOBUKI = 0;
var LOGO = 1;
var GROUND = 2;
var VIDEO = 3;
var WIREFRAME = 4;
var GRASS = 5;
var BRICK = 6;
var LOGO_SIZE = 512;
var CELLSIZE = 2;

class DemoWorld extends AuxiliaryHolder {
  constructor({ engine, motor }) {
    super();
    const spritesAccumulator = new SpritesAccumulator;
    spritesAccumulator.addAuxiliary(new SpriteUpdater({ engine, motor }));
    spritesAccumulator.addAuxiliary(new MaxSpriteCountAuxiliary({ engine }));
    this.addAuxiliary(spritesAccumulator);
    const medias = new UpdatableMedias({ engine, motor });
    medias.set(DOBUKI, {
      type: "image",
      src: "dobuki.png"
    });
    medias.set(LOGO, {
      type: "draw",
      draw: (ctx) => {
        const { canvas } = ctx;
        canvas.width = LOGO_SIZE;
        canvas.height = LOGO_SIZE;
        const centerX = canvas.width / 2, centerY = canvas.height / 2;
        const halfSize = canvas.width / 2;
        ctx.imageSmoothingEnabled = true;
        ctx.fillStyle = "#ddd";
        ctx.lineWidth = canvas.width / 50;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "black";
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(centerX, centerY, halfSize * 0.8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(centerX, centerY, halfSize * 0.5, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(canvas.width / 3, canvas.height / 3, halfSize * 0.1, 0, Math.PI, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(canvas.width / 3 * 2, canvas.height / 3, halfSize * 0.1, 0, Math.PI * 2, true);
        ctx.stroke();
      }
    });
    medias.set(GROUND, {
      type: "draw",
      draw: (ctx) => {
        const { canvas } = ctx;
        canvas.width = LOGO_SIZE;
        canvas.height = LOGO_SIZE;
        ctx.fillStyle = "#ddd";
        ctx.lineWidth = canvas.width / 50;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "black";
        ctx.fillStyle = "silver";
        ctx.beginPath();
        ctx.rect(canvas.width * 0.2, canvas.height * 0.2, canvas.width * 0.6, canvas.height * 0.6);
        ctx.fill();
        ctx.stroke();
      }
    });
    medias.set(BRICK, {
      type: "draw",
      draw: (ctx) => {
        const { canvas } = ctx;
        canvas.width = LOGO_SIZE;
        canvas.height = LOGO_SIZE;
        ctx.fillStyle = "#ddd";
        ctx.lineWidth = canvas.width / 50;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    });
    medias.set(VIDEO, {
      type: "video",
      src: "sample.mp4",
      volume: 0,
      fps: 30,
      playSpeed: 0.1,
      maxRefreshRate: 30
    });
    medias.set(WIREFRAME, {
      type: "draw",
      draw: (ctx) => {
        const { canvas } = ctx;
        canvas.width = LOGO_SIZE;
        canvas.height = LOGO_SIZE;
        ctx.lineWidth = 5;
        ctx.setLineDash([5, 2]);
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
        ctx.stroke();
      }
    });
    medias.set(GRASS, {
      type: "draw",
      draw: (ctx) => {
        const { canvas } = ctx;
        canvas.width = LOGO_SIZE;
        canvas.height = LOGO_SIZE;
        ctx.fillStyle = "green";
        ctx.lineWidth = canvas.width / 50;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "black";
        ctx.fillStyle = "#4f8";
        ctx.beginPath();
        ctx.rect(canvas.width * 0.2, canvas.height * 0.2, canvas.width * 0.6, canvas.height * 0.6);
        ctx.fill();
        ctx.stroke();
      }
    });
    spritesAccumulator.addAuxiliary(new FixedSpriteGrid({ cellSize: CELLSIZE }, new SpriteGroup([
      ...[
        Matrix_default.create().translate(-1, 0, 0).rotateY(Math.PI / 2),
        Matrix_default.create().translate(-1, 0, 0).rotateY(-Math.PI / 2),
        Matrix_default.create().translate(1, 0, 0).rotateY(-Math.PI / 2),
        Matrix_default.create().translate(1, 0, 0).rotateY(Math.PI / 2)
      ].map((transform) => ({ imageId: LOGO, transform })),
      ...[
        Matrix_default.create().translate(0, -1, 0).rotateX(-Math.PI / 2),
        Matrix_default.create().translate(0, -1, 2).rotateX(-Math.PI / 2),
        Matrix_default.create().translate(-2, -1, 2).rotateX(-Math.PI / 2),
        Matrix_default.create().translate(2, -1, 2).rotateX(-Math.PI / 2)
      ].map((transform) => ({ imageId: GROUND, transform }))
    ], Matrix_default.create()), new SpriteGroup([
      ...[
        Matrix_default.create().translate(0, -1, 0).rotateX(Math.PI / 2),
        Matrix_default.create().translate(0, 1, 0).rotateX(-Math.PI / 2),
        Matrix_default.create().translate(-1, 0, 0).rotateY(-Math.PI / 2),
        Matrix_default.create().translate(1, 0, 0).rotateY(Math.PI / 2),
        Matrix_default.create().translate(0, 0, 1).rotateY(0),
        Matrix_default.create().translate(0, 0, -1).rotateY(Math.PI)
      ].map((transform) => ({ imageId: GROUND, transform })),
      ...[
        Matrix_default.create().translate(0, -1, 0).rotateX(-Math.PI / 2),
        Matrix_default.create().translate(0, 1, 0).rotateX(Math.PI / 2),
        Matrix_default.create().translate(-1, 0, 0).rotateY(Math.PI / 2),
        Matrix_default.create().translate(1, 0, 0).rotateY(-Math.PI / 2),
        Matrix_default.create().translate(0, 0, 1).rotateY(Math.PI),
        Matrix_default.create().translate(0, 0, -1).rotateY(0)
      ].map((transform) => ({ imageId: BRICK, transform }))
    ], Matrix_default.create().setPosition(...PositionMatrix.positionFromCell([0, 0, -3, CELLSIZE])))));
    const camera = new Camera({ engine, motor });
    camera.addAuxiliary(new ResizeAux({ engine }));
    this.addAuxiliary(camera);
    camera.posMatrix.moveBlocker = {
      isBlocked(pos) {
        const [cx, cy, cz] = PositionMatrix.getCellPos(pos, 2);
        return cx === 0 && cy === 0 && cz === -3;
      }
    };
    spritesAccumulator.addAuxiliary(new FixedSpriteGrid({ cellSize: CELLSIZE }, [
      {
        imageId: DOBUKI,
        transform: Matrix_default.create().translate(0, 0, -1)
      },
      {
        imageId: DOBUKI,
        transform: Matrix_default.create().translate(0, 0, -1).rotateY(Math.PI)
      }
    ]));
    spritesAccumulator.addAuxiliary(new SpriteGrid({ yRange: [0, 0] }, {
      getSpritesAtCell: (cell) => [
        {
          name: `${cell.pos[0]}_${cell.pos[2]}`,
          imageId: GRASS,
          transform: Matrix_default.create().translate(cell.pos[0] * cell.pos[3], -1, cell.pos[2] * cell.pos[3]).rotateX(-Math.PI / 2).scale(1)
        },
        {
          imageId: WIREFRAME,
          transform: Matrix_default.create().translate(cell.pos[0] * cell.pos[3], 1, cell.pos[2] * cell.pos[3]).rotateX(Math.PI / 2).scale(1)
        }
      ]
    }));
    spritesAccumulator.addAuxiliary(new StaticSprites([{
      imageId: VIDEO,
      transform: Matrix_default.create().translate(0, 1e4, -50000).scale(9600, 5400, 1)
    }]));
    const keyboard = new Keyboard({ motor });
    keyboard.addAuxiliary(new ToggleAuxiliary({
      auxiliariesMapping: [
        {
          key: "Tab",
          aux: Auxiliaries.from(new CamStepAuxiliary({ keyboard, camera }, { step: 2, turnStep: Math.PI / 2, tiltStep: Math.PI / 4 }), new CamTiltResetAuxiliary({ keyboard, camera }, { key: "ShiftRight" }))
        },
        {
          key: "Tab",
          aux: Auxiliaries.from(new CamMoveAuxiliary({ keyboard, camera }), new JumpAuxiliary({ keyboard, camera }), new CamTiltResetAuxiliary({ keyboard, camera }, { key: "ShiftRight" }))
        }
      ]
    }));
    this.addAuxiliary(keyboard);
    camera.posMatrix.addAuxiliary(new CellChangeAuxiliary({
      visitCell: new CellTracker(this, {
        cellLimit: 5000,
        range: [25, 3, 25],
        cellSize: CELLSIZE
      })
    }, {
      cellSize: CELLSIZE
    }));
  }
}

// src/index.tsx
async function hello() {
  console.log("Hello World!");
}
async function testCanvas(canvas) {
  canvas.style.border = "2px solid silver";
  canvas.addEventListener("mouseenter", () => {
    canvas.style.borderColor = "black";
  });
  canvas.addEventListener("mouseleave", () => {
    canvas.style.borderColor = "silver";
  });
  const pixelListener = {
    x: 0,
    y: 0,
    pixel: 0,
    setPixel(value) {
      this.pixel = value;
    }
  };
  canvas.addEventListener("mousemove", (e) => {
    const x = (e.pageX - canvas.offsetLeft) * 2;
    const y = (canvas.offsetHeight - (e.pageY - canvas.offsetTop)) * 2;
    pixelListener.x = x;
    pixelListener.y = y;
  });
  const core = new Core({
    canvas
  });
  core.engine.setPixelListener(pixelListener);
  const world = new DemoWorld(core);
  core.start(world);
  onStop = () => {
    core.stop();
  };
  return { core, world };
}
function stop() {
  onStop();
}
var onStop;
export {
  testCanvas,
  stop,
  hello
};

//# debugId=8CE89278C83C444C64756e2164756e21
