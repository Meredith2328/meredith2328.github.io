(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc437-路径总和-iii"] = {
    title: "437 路径总和 III · 双重递归",
    language: "python",
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
    inputHint: "每行一个变量，格式如 root = [10,5,-3,3,2,null,11,3,-2,null,1] / targetSum = 8",
    testInputs: [
      "root = [1,null,2,null,3]\ntargetSum = 3",
      "root = []\ntargetSum = 0"
    ],
    expectedOutputs: [
      "3",
      "1",
      "0"
    ],

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
      if (!Array.isArray(env.root)) throw new Error("缺少 root = [...]");
      if (typeof env.targetSum !== "number") throw new Error("缺少 targetSum = 数字");
      return env;
    },

    run: function (input) {
      var rootArr = input.root, targetSum = input.targetSum;
      var steps = [];

      // Build tree from array (level order)
      function buildTree(arr) {
        if (!arr || arr.length === 0) return null;
        var nodes = arr.map(function (v) { return v === null ? null : { val: v, left: null, right: null }; });
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i] === null) continue;
          var leftIdx = 2 * i + 1, rightIdx = 2 * i + 2;
          if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx];
          if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx];
        }
        return nodes[0];
      }

      var root = buildTree(rootArr);

      // Tree view builder
      function treeView(root, hiNode, okNode) {
        function build(node) {
          if (!node) return null;
          var status = null;
          if (node === hiNode) status = "hi";
          if (node === okNode) status = "ok";
          return { val: node.val, children: [build(node.left), build(node.right)].filter(Boolean), status: status };
        }
        return { root: build(root) };
      }

      // Callstack view builder
      function callstackView(frames) {
        return { frames: frames.slice() };
      }

      // Helper to get node label
      function nodeLabel(node) {
        return node ? String(node.val) : "null";
      }

      // Recursive countPaths
      var callstack = [];
      var totalCount = 0;

      function countPaths(node, tSum, indent) {
        if (!node) {
          steps.push({
            line: 13, msg: "countPaths(" + nodeLabel(node) + ", " + tSum + ")：节点为空，返回 0。",
            views: {
              vars: { targetSum: targetSum, "当前节点": "null", "剩余和": tSum, "累计路径数": totalCount },
              tree: treeView(root, node, null),
              callstack: callstackView(callstack)
            }
          });
          return 0;
        }

        callstack.push("countPaths(" + node.val + ", " + tSum + ")");
        steps.push({
          line: 12, msg: "进入 countPaths(" + node.val + ", " + tSum + ")，检查节点 " + node.val + "。",
          views: {
            vars: { targetSum: targetSum, "当前节点": node.val, "剩余和": tSum, "累计路径数": totalCount },
            tree: treeView(root, node, null),
            callstack: callstackView(callstack)
          }
        });

        var count = (node.val === tSum) ? 1 : 0;
        steps.push({
          line: 14, msg: "节点值 " + node.val + " 等于剩余和 " + tSum + "？" + (count === 1 ? "是，计数 +1。" : "否，计数不变。") + " 当前 count=" + count + "。",
          views: {
            vars: { targetSum: targetSum, "当前节点": node.val, "剩余和": tSum, "count": count, "累计路径数": totalCount },
            tree: treeView(root, node, count === 1 ? node : null),
            callstack: callstackView(callstack)
          }
        });

        // Left child
        steps.push({
          line: 15, msg: "递归计算左子树，剩余和变为 " + (tSum - node.val) + "。",
          views: {
            vars: { targetSum: targetSum, "当前节点": node.val, "剩余和": tSum - node.val, "count": count, "累计路径数": totalCount },
            tree: treeView(root, node, null),
            callstack: callstackView(callstack)
          }
        });
        count += countPaths(node.left, tSum - node.val);

        // Right child
        steps.push({
          line: 16, msg: "递归计算右子树，剩余和变为 " + (tSum - node.val) + "。",
          views: {
            vars: { targetSum: targetSum, "当前节点": node.val, "剩余和": tSum - node.val, "count": count, "累计路径数": totalCount },
            tree: treeView(root, node, null),
            callstack: callstackView(callstack)
          }
        });
        count += countPaths(node.right, tSum - node.val);

        callstack.pop();
        steps.push({
          line: 17, msg: "返回 count=" + count + "（从节点 " + node.val + " 开始的路径数）。",
          views: {
            vars: { targetSum: targetSum, "当前节点": node.val, "count": count, "累计路径数": totalCount },
            tree: treeView(root, node, null),
            callstack: callstackView(callstack)
          }
        });
        return count;
      }

      // Main pathSum
      steps.push({
        line: 7, msg: "开始 pathSum：目标路径和为 " + targetSum + "。",
        views: {
          vars: { targetSum: targetSum, "累计路径数": 0 },
          tree: treeView(root, null, null),
          callstack: callstackView([])
        }
      });

      if (!root) {
        steps.push({
          line: 8, msg: "根节点为空，直接返回 0。",
          views: {
            vars: { targetSum: targetSum, "累计路径数": 0 },
            tree: treeView(null, null, null),
            callstack: callstackView([])
          }
        });
        return { steps: steps, output: "0" };
      }

      // Main recursive pathSum
      function pathSum(node, tSum) {
        if (!node) return 0;
        var res = countPaths(node, tSum);
        totalCount += res;
        steps.push({
          line: 20, msg: "从节点 " + node.val + " 开始的路径数为 " + res + "，累计总数变为 " + totalCount + "。",
          views: {
            vars: { targetSum: targetSum, "当前节点": node.val, "累计路径数": totalCount },
            tree: treeView(root, node, null),
            callstack: callstackView([])
          }
        });
        res += pathSum(node.left, tSum);
        res += pathSum(node.right, tSum);
        return res;
      }

      var result = pathSum(root, targetSum);
      steps.push({
        line: 20, msg: "最终结果：路径总和为 " + targetSum + " 的路径共有 " + result + " 条。",
        views: {
          vars: { targetSum: targetSum, "累计路径数": result },
          tree: treeView(root, null, null),
          callstack: callstackView([])
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);