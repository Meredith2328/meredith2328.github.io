(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc543-二叉树的直径"] = {
    title: "543 二叉树的直径",
    link: "https://leetcode.cn/problems/diameter-of-binary-tree/",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:",
      "        # 转化为经过的节点数",
      "        self.ans = 1",
      "        def depth(node):",
      "            if not node:",
      "                return 0",
      "",
      "            l = depth(node.left)",
      "            r = depth(node.right)",
      "            self.ans = max(self.ans, l + r + 1)",
      "            return max(l, r) + 1",
      "",
      "        depth(root)",
      "        return self.ans - 1 # 转化回长度"
    ].join("\n"),

    defaultInput: "root = [1,2,3,4,5]",
    inputHint: "每行一个变量，格式如 root = [1,2,3,4,5]（层序遍历，null 表示空节点）",
    testInputs: ["root = [1,2,3,4,5,null,null,6,7]", "root = []"],
    expectedOutputs: ["3", "4", "0"],

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

      // 构建二叉树（层序）
      function buildTree(arr) {
        if (!arr || arr.length === 0 || arr[0] === null) return null;
        var root = { val: arr[0], left: null, right: null };
        var queue = [root];
        var i = 1;
        while (i < arr.length) {
          var node = queue.shift();
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
        return root;
      }

      var root = buildTree(arr);
      var ans = 1;
      var callStack = [];

      // 树视图辅助：把 JS 对象树转成 algoviz tree 格式
      function toTreeView(node, statusMap) {
        if (!node) return null;
        var key = node.val + "_" + (node.left ? node.left.val : "null") + "_" + (node.right ? node.right.val : "null");
        var status = statusMap && statusMap[key] ? statusMap[key] : undefined;
        return {
          val: node.val,
          status: status,
          children: [
            toTreeView(node.left, statusMap),
            toTreeView(node.right, statusMap)
          ].filter(function (c) { return c !== null; })
        };
      }

      // 递归 depth 函数（模拟 Python 闭包）
      function depth(node, nodeLabel) {
        if (!node) {
          steps.push({
            line: 10, msg: "depth(" + nodeLabel + ")：节点为空，返回 0。",
            views: {
              vars: { ans: ans, node: nodeLabel, l: null, r: null },
              tree: { root: toTreeView(root, {}) },
              callstack: { frames: callStack.slice() }
            }
          });
          return 0;
        }

        var label = String(node.val);
        callStack.push("depth(" + label + ")");
        steps.push({
          line: 9, msg: "进入 depth(" + label + ")，节点非空。",
          views: {
            vars: { ans: ans, node: label, l: null, r: null },
            tree: { root: toTreeView(root, {}) },
            callstack: { frames: callStack.slice() }
          }
        });

        // 递归左子树
        var l = depth(node.left, label + ".left");
        callStack.pop();
        callStack.push("depth(" + label + ")");
        steps.push({
          line: 12, msg: "左子树深度 l=" + l + "。",
          views: {
            vars: { ans: ans, node: label, l: l, r: null },
            tree: { root: toTreeView(root, {}) },
            callstack: { frames: callStack.slice() }
          }
        });

        // 递归右子树
        var r = depth(node.right, label + ".right");
        callStack.pop();
        callStack.push("depth(" + label + ")");
        steps.push({
          line: 13, msg: "右子树深度 r=" + r + "。",
          views: {
            vars: { ans: ans, node: label, l: l, r: r },
            tree: { root: toTreeView(root, {}) },
            callstack: { frames: callStack.slice() }
          }
        });

        // 更新 ans
        var oldAns = ans;
        ans = Math.max(ans, l + r + 1);
        steps.push({
          line: 14, msg: "更新 ans：max(" + oldAns + ", " + l + "+" + r + "+1) = " + ans + "。",
          views: {
            vars: { ans: { value: ans, __hot: true }, node: label, l: l, r: r },
            tree: { root: toTreeView(root, {}) },
            callstack: { frames: callStack.slice() }
          }
        });

        var ret = Math.max(l, r) + 1;
        callStack.pop();
        steps.push({
          line: 15, msg: "返回 max(" + l + ", " + r + ") + 1 = " + ret + "。",
          views: {
            vars: { ans: ans, node: label, l: l, r: r, "返回值": ret },
            tree: { root: toTreeView(root, {}) },
            callstack: { frames: callStack.slice() }
          }
        });
        return ret;
      }

      // 开始
      steps.push({
        line: 7, msg: "开始计算二叉树的直径。",
        views: {
          vars: { ans: ans, node: null, l: null, r: null },
          tree: { root: toTreeView(root, {}) },
          callstack: { frames: [] }
        }
      });

      steps.push({
        line: 8, msg: "初始化 ans = 1（记录经过的节点数）。",
        views: {
          vars: { ans: { value: ans, __hot: true }, node: null, l: null, r: null },
          tree: { root: toTreeView(root, {}) },
          callstack: { frames: [] }
        }
      });

      if (root) {
        depth(root, String(root.val));
      } else {
        steps.push({
          line: 17, msg: "树为空，直接跳过递归。",
          views: {
            vars: { ans: ans },
            tree: { root: null },
            callstack: { frames: [] }
          }
        });
      }

      var result = ans - 1;
      steps.push({
        line: 18, msg: "返回 ans - 1 = " + result + "（节点数转回边数）。",
        views: {
          vars: { ans: ans, "返回值": result },
          tree: { root: toTreeView(root, {}) },
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);