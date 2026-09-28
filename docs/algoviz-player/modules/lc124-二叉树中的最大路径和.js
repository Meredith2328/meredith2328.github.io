(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc124-二叉树中的最大路径和"] = {
    title: "124 二叉树中的最大路径和 · 递归",
    link: "https://leetcode.cn/problems/binary-tree-maximum-path-sum/",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def maxPathSum(self, root: Optional[TreeNode]) -> int:",
      "        self.res = -float('inf')",
      "        ",
      "        def maxGain(node):",
      "            if not node:",
      "                return 0 # 不选",
      "            ",
      "            # 以某个节点为根的最大贡献.",
      "            l = max(maxGain(node.left), 0)",
      "            r = max(maxGain(node.right), 0)",
      "            pathSum = l + r + node.val",
      "            self.res = max(self.res, pathSum)",
      "            # 向上贡献时只能二选一.",
      "            return max(l, r) + node.val",
      "            ",
      "        maxGain(root)",
      "        return self.res"
    ].join("\n"),

    defaultInput: "root = [1,2,3]",
    inputHint: "每行一个变量，格式如 root = [1,2,3]（层序遍历，null 表示空节点）",
    testInputs: ["root = [-10,9,20,null,null,15,7]", "root = [-3]"],
    expectedOutputs: ["6", "42", "-3"],

    views: {
      vars: { type: "vars", title: "变量" },
      tree: { type: "tree", title: "二叉树" },
      callstack: { type: "callstack", title: "递归调用栈" }
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
      if (!Array.isArray(env.root)) throw new Error("缺少 root = [...]（层序遍历数组）");
      return env;
    },

    run: function (input) {
      var arr = input.root;
      var steps = [];

      // Build tree from level-order array
      function buildTree(arr) {
        if (!arr || arr.length === 0 || arr[0] === null) return null;
        var root = { val: arr[0], left: null, right: null };
        var queue = [root];
        var i = 1;
        while (i < arr.length) {
          var node = queue.shift();
          if (node) {
            if (i < arr.length && arr[i] !== null) {
              node.left = { val: arr[i], left: null, right: null };
              queue.push(node.left);
            }
            i++;
            if (i < arr.length && arr[i] !== null) {
              node.right = { val: arr[i], left: null, right: null };
              queue.push(node.right);
            }
            i++;
          }
        }
        return root;
      }

      var root = buildTree(arr);
      var res = -Infinity;

      // Helper to build tree view (with statuses)
      function treeView(node, statusMap) {
        if (!node) return null;
        var status = statusMap && statusMap[node.__id] ? statusMap[node.__id] : undefined;
        return {
          val: node.val,
          status: status,
          children: [treeView(node.left, statusMap), treeView(node.right, statusMap)].filter(Boolean)
        };
      }

      // Assign ids to nodes for status tracking
      var nodeId = 0;
      (function assignIds(node) {
        if (!node) return;
        node.__id = nodeId++;
        assignIds(node.left);
        assignIds(node.right);
      })(root);

      var callStack = [];

      function maxGain(node) {
        if (!node) {
          steps.push({
            line: 11, msg: "到达空节点，返回贡献 0（不选）。",
            views: {
              vars: { res: res, node: "null" },
              tree: { root: treeView(root, {}) },
              callstack: { frames: callStack.slice() }
            }
          });
          return 0;
        }

        var nodeLabel = "node(" + node.val + ")";
        callStack.push("maxGain(" + nodeLabel + ")");
        steps.push({
          line: 10, msg: "进入节点 " + node.val + "，计算其最大贡献。",
          views: {
            vars: { res: res, node: node.val },
            tree: { root: treeView(root, { [node.__id]: "hi" }) },
            callstack: { frames: callStack.slice() }
          }
        });

        // left
        var lRaw = maxGain(node.left);
        var l = Math.max(lRaw, 0);
        steps.push({
          line: 13, msg: "左子树贡献为 " + lRaw + "，取 max(...,0) 后为 " + l + "。",
          views: {
            vars: { res: res, node: node.val, l: l, r: null },
            tree: { root: treeView(root, { [node.__id]: "hi" }) },
            callstack: { frames: callStack.slice() }
          }
        });

        // right
        var rRaw = maxGain(node.right);
        var r = Math.max(rRaw, 0);
        steps.push({
          line: 14, msg: "右子树贡献为 " + rRaw + "，取 max(...,0) 后为 " + r + "。",
          views: {
            vars: { res: res, node: node.val, l: l, r: r },
            tree: { root: treeView(root, { [node.__id]: "hi" }) },
            callstack: { frames: callStack.slice() }
          }
        });

        var pathSum = l + r + node.val;
        steps.push({
          line: 15, msg: "以节点 " + node.val + " 为根的路径和为 " + l + " + " + r + " + " + node.val + " = " + pathSum + "。",
          views: {
            vars: { res: res, node: node.val, l: l, r: r, pathSum: pathSum },
            tree: { root: treeView(root, { [node.__id]: "hi" }) },
            callstack: { frames: callStack.slice() }
          }
        });

        if (pathSum > res) {
          res = pathSum;
          steps.push({
            line: 16, msg: "更新全局最大值 res = " + res + "。",
            views: {
              vars: { res: { value: res, __hot: true }, node: node.val, l: l, r: r, pathSum: pathSum },
              tree: { root: treeView(root, { [node.__id]: "ok" }) },
              callstack: { frames: callStack.slice() }
            }
          });
        } else {
          steps.push({
            line: 16, msg: "pathSum=" + pathSum + " 不大于当前 res=" + res + "，不更新。",
            views: {
              vars: { res: res, node: node.val, l: l, r: r, pathSum: pathSum },
              tree: { root: treeView(root, { [node.__id]: "hi" }) },
              callstack: { frames: callStack.slice() }
            }
          });
        }

        var gain = Math.max(l, r) + node.val;
        steps.push({
          line: 18, msg: "向上贡献取左右较大者 + 自身值：max(" + l + ", " + r + ") + " + node.val + " = " + gain + "。",
          views: {
            vars: { res: res, node: node.val, l: l, r: r, gain: gain },
            tree: { root: treeView(root, { [node.__id]: "hi" }) },
            callstack: { frames: callStack.slice() }
          }
        });

        callStack.pop();
        return gain;
      }

      steps.push({
        line: 7, msg: "初始化 res = -∞。",
        views: {
          vars: { res: res },
          tree: { root: treeView(root, {}) },
          callstack: { frames: [] }
        }
      });

      steps.push({
        line: 20, msg: "从根节点开始调用 maxGain。",
        views: {
          vars: { res: res },
          tree: { root: treeView(root, {}) },
          callstack: { frames: [] }
        }
      });

      maxGain(root);

      steps.push({
        line: 21, msg: "递归结束，返回最大路径和 res = " + res + "。",
        views: {
          vars: { res: res },
          tree: { root: treeView(root, {}) },
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);