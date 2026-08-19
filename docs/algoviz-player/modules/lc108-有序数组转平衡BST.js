(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc108-有序数组转平衡BST"] = {
    title: "108 将有序数组转换为平衡二叉搜索树 · 递归",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:",
      "        def build(left, right):",
      "            if left > right:",
      "                return None",
      "",
      "            mid = (left + right) // 2",
      "            root = TreeNode(nums[mid])",
      "",
      "            root.left = build(left, mid - 1)",
      "            root.right = build(mid + 1, right)",
      "            return root",
      "",
      "        return build(0, len(nums) - 1)"
    ].join("\n"),

    defaultInput: "nums = [-10, -3, 0, 5, 9]",
    inputHint: "每行一个变量，格式如 nums = [-10, -3, 0, 5, 9]",
    testInputs: ["nums = [1, 3]", "nums = [1]"],
    expectedOutputs: [
      "[0,[-10,null,[-3,null,null]],[5,null,[9,null,null]]]",
      "[1,null,[3,null,null]]",
      "[1,null,null]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      tree: { type: "tree", title: "BST" },
      callstack: { type: "callstack", title: "递归栈" }
    },

    parseInput: function (text) {
      var env = {};
      text.split(/\n/).forEach(function (line) {
        var m = /^\s*([A-Za-z_]\w*)\s*=\s*(.+?)\s*$/.exec(line);
        if (!m) return;
        var val;
        try { val = JSON.parse(m[2].replace(/'/g, '"')); }
        catch (e) { val = m[2]; }
        env[m[1]] = val;
      });
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...]");
      return env;
    },

    run: function (input) {
      var nums = input.nums;
      var steps = [];
      var callStack = [];
      var treeRoot = null;

      function treeNode(val, left, right) {
        return { val: val, left: left || null, right: right || null };
      }

      function serialize(node) {
        if (!node) return null;
        return [node.val, serialize(node.left), serialize(node.right)];
      }

      function build(left, right, depth) {
        var frame = "build(" + left + ", " + right + ")";
        callStack.push(frame);
        steps.push({
          line: 8,
          msg: "调用 " + frame + "，处理区间 [" + left + ", " + right + "]",
          views: {
            vars: { left: left, right: right, mid: null, depth: depth },
            nums: { items: nums.slice(), highlights: [], pointers: { left: left, right: right } },
            tree: { root: treeRoot },
            callstack: { frames: callStack.slice() }
          }
        });

        if (left > right) {
          steps.push({
            line: 9,
            msg: "区间为空（left=" + left + " > right=" + right + "），返回 null",
            views: {
              vars: { left: left, right: right, mid: null, depth: depth },
              nums: { items: nums.slice(), highlights: [], pointers: { left: left, right: right } },
              tree: { root: treeRoot },
              callstack: { frames: callStack.slice() }
            }
          });
          callStack.pop();
          return null;
        }

        var mid = Math.floor((left + right) / 2);
        steps.push({
          line: 11,
          msg: "计算中点 mid = (" + left + " + " + right + ") // 2 = " + mid + "，取 nums[" + mid + "] = " + nums[mid] + " 作为根",
          views: {
            vars: { left: left, right: right, mid: mid, depth: depth },
            nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid } },
            tree: { root: treeRoot },
            callstack: { frames: callStack.slice() }
          }
        });

        var root = treeNode(nums[mid]);
        steps.push({
          line: 12,
          msg: "创建根节点，值为 " + nums[mid],
          views: {
            vars: { left: left, right: right, mid: mid, depth: depth, "root.val": nums[mid] },
            nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid } },
            tree: { root: root },
            callstack: { frames: callStack.slice() }
          }
        });

        root.left = build(left, mid - 1, depth + 1);
        steps.push({
          line: 14,
          msg: "递归构建左子树，区间 [" + left + ", " + (mid - 1) + "]",
          views: {
            vars: { left: left, right: right, mid: mid, depth: depth, "root.val": nums[mid] },
            nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid } },
            tree: { root: root },
            callstack: { frames: callStack.slice() }
          }
        });

        root.right = build(mid + 1, right, depth + 1);
        steps.push({
          line: 15,
          msg: "递归构建右子树，区间 [" + (mid + 1) + ", " + right + "]",
          views: {
            vars: { left: left, right: right, mid: mid, depth: depth, "root.val": nums[mid] },
            nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid } },
            tree: { root: root },
            callstack: { frames: callStack.slice() }
          }
        });

        steps.push({
          line: 16,
          msg: "返回以 " + nums[mid] + " 为根的子树",
          views: {
            vars: { left: left, right: right, mid: mid, depth: depth, "root.val": nums[mid] },
            nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid } },
            tree: { root: root },
            callstack: { frames: callStack.slice() }
          }
        });

        callStack.pop();
        return root;
      }

      steps.push({
        line: 7,
        msg: "开始构建平衡 BST，初始区间 [0, " + (nums.length - 1) + "]",
        views: {
          vars: { left: 0, right: nums.length - 1, mid: null, depth: 0 },
          nums: { items: nums.slice() },
          tree: { root: null },
          callstack: { frames: [] }
        }
      });

      treeRoot = build(0, nums.length - 1, 0);

      steps.push({
        line: 18,
        msg: "构建完成，返回整棵树的根节点",
        views: {
          vars: { "根节点值": treeRoot ? treeRoot.val : null },
          nums: { items: nums.slice() },
          tree: { root: treeRoot },
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(serialize(treeRoot)) };
    }
  };
})(typeof window !== "undefined" ? window : this);