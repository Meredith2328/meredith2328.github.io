(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc437-路径总和-iii"] = {
    title: "437 路径总和 III · 双重递归",
    language: "python",
    link: "https://leetcode.cn/problems/path-sum-iii/",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:",
      "        if not root:",
      "            return 0",
      "",
      "        def countPaths(node, targetSum):",
      "            # 计算从某节点开始的和为targerSum的路径数量.",
      "            # 注意, 这个数量是和从其他节点开始的和为targetSum的路径数量无关的.",
      "            if not node:",
      "                return 0",
      "            count = 1 if node.val == targetSum else 0",
      "            count += countPaths(node.left, targetSum - node.val)",
      "            count += countPaths(node.right, targetSum - node.val)",
      "            return count",
      "",
      "        # 对所有节点调用countPaths并求和",
      "        return countPaths(root, targetSum) + self.pathSum(root.left, targetSum) + self.pathSum(root.right, targetSum)"
    ].join("\n"),

    defaultInput: "root = [10,5,-3,3,2,null,11,3,-2,null,1]\ntargetSum = 8",
    inputHint: "每行一个变量，root 用层序遍历数组表示（null 表示空节点），targetSum 为整数",
    testInputs: [
      "root = [1,null,2,null,3]\ntargetSum = 3",
      "root = []\ntargetSum = 0"
    ],
    expectedOutputs: ["3", "2", "0"],

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
      if (typeof env.targetSum !== "number") throw new Error("缺少 targetSum = 数字");
      return env;
    },

    run: function (input) {
      var arr = input.root;
      var targetSum = input.targetSum;
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

      // Helper to convert tree to view format
      function treeView(node, statusMap) {
        if (!node) return null;
        var obj = { val: node.val, children: [] };
        if (statusMap && statusMap[node.id]) obj.status = statusMap[node.id];
        if (node.left) obj.children.push(treeView(node.left, statusMap));
        if (node.right) obj.children.push(treeView(node.right, statusMap));
        return obj;
      }

      // Assign ids to nodes for status tracking
      var nodeId = 0;
      function assignIds(node) {
        if (!node) return;
        node.id = nodeId++;
        assignIds(node.left);
        assignIds(node.right);
      }
      assignIds(root);

      var totalCount = 0;
      var callStack = [];

      // countPaths function
      function countPaths(node, t, depth) {
        if (!node) {
          callStack.push("countPaths(null, " + t + ")");
          steps.push({
            line: 13,
            msg: "countPaths 遇到空节点，返回 0。",
            views: {
              vars: { node: "null", targetSum: t, count: 0 },
              tree: { root: treeView(root, {}) },
              callstack: { frames: callStack.slice() }
            }
          });
          callStack.pop();
          return 0;
        }

        callStack.push("countPaths(" + node.val + ", " + t + ")");
        var count = (node.val === t) ? 1 : 0;
        steps.push({
          line: 15,
          msg: "countPaths(" + node.val + ", " + t + ")：当前节点值 " + node.val + (count ? " 等于目标 " + t + "，count=1" : " 不等于目标 " + t + "，count=0") + "。",
          views: {
            vars: { node: node.val, targetSum: t, count: count },
            tree: { root: treeView(root, { [node.id]: "hi" }) },
            callstack: { frames: callStack.slice() }
          }
        });

        // Left
        var leftCount = countPaths(node.left, t - node.val, depth + 1);
        count += leftCount;
        steps.push({
          line: 16,
          msg: "左子树返回 " + leftCount + "，累计 count=" + count + "。",
          views: {
            vars: { node: node.val, targetSum: t, count: count, leftCount: leftCount },
            tree: { root: treeView(root, {}) },
            callstack: { frames: callStack.slice() }
          }
        });

        // Right
        var rightCount = countPaths(node.right, t - node.val, depth + 1);
        count += rightCount;
        steps.push({
          line: 17,
          msg: "右子树返回 " + rightCount + "，累计 count=" + count + "。",
          views: {
            vars: { node: node.val, targetSum: t, count: count, rightCount: rightCount },
            tree: { root: treeView(root, {}) },
            callstack: { frames: callStack.slice() }
          }
        });

        callStack.pop();
        return count;
      }

      // pathSum function
      function pathSum(node, t) {
        if (!node) {
          steps.push({
            line: 8,
            msg: "pathSum 遇到空节点，返回 0。",
            views: {
              vars: { root: "null", targetSum: t, result: 0 },
              tree: { root: null },
              callstack: { frames: [] }
            }
          });
          return 0;
        }

        steps.push({
          line: 7,
          msg: "pathSum(" + node.val + ", " + t + ")：开始处理节点 " + node.val + "。",
          views: {
            vars: { root: node.val, targetSum: t },
            tree: { root: treeView(root, { [node.id]: "hi" }) },
            callstack: { frames: [] }
          }
        });

        var c = countPaths(node, t, 0);
        totalCount += c;
        steps.push({
          line: 21,
          msg: "countPaths(" + node.val + ", " + t + ") 返回 " + c + "，累计总数 total=" + totalCount + "。",
          views: {
            vars: { root: node.val, targetSum: t, countPathsResult: c, total: totalCount },
            tree: { root: treeView(root, {}) },
            callstack: { frames: [] }
          }
        });

        var leftResult = pathSum(node.left, t);
        var rightResult = pathSum(node.right, t);
        return c + leftResult + rightResult;
      }

      var result = pathSum(root, targetSum);

      steps.push({
        line: 21,
        msg: "最终结果：路径总和为 " + targetSum + " 的路径共有 " + result + " 条。",
        views: {
          vars: { targetSum: targetSum, result: result },
          tree: { root: treeView(root, {}) },
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);