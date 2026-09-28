(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc105-从前序中序构造二叉树"] = {
    title: "105 从前序和中序遍历序列构造二叉树 · 递归",
    link: "https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:",
      "        n = len(inorder)",
      "        def build(l1, r1, l2, r2):",
      "            if l1 > r1 or l2 > r2:",
      "                return None",
      "",
      "            root = preorder[l1]",
      "            for i in range(n):",
      "                if inorder[i] == root:",
      "                    t = TreeNode(root)",
      "                    t.left = build(l1 + 1, l1 + i - l2, l2, i - 1)",
      "                    t.right = build(l1 + 1 + i - l2, r1, i + 1, r2)",
      "                    return t",
      "",
      "        return build(0, len(preorder) - 1, 0, len(preorder) - 1)"
    ].join("\n"),

    defaultInput: "preorder = [3, 9, 20, 15, 7]\ninorder = [9, 3, 15, 20, 7]",
    inputHint: "每行一个变量，格式如 preorder = [3, 9, 20, 15, 7] / inorder = [9, 3, 15, 20, 7]",
    testInputs: [
      "preorder = [1, 2]\ninorder = [2, 1]",
      "preorder = [1]\ninorder = [1]"
    ],
    expectedOutputs: [
      "[3,9,20,null,null,15,7]",
      "[1,2]",
      "[1]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      preorder: { type: "array", title: "preorder" },
      inorder: { type: "array", title: "inorder" },
      tree: { type: "tree", title: "二叉树" }
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
      if (!Array.isArray(env.preorder)) throw new Error("缺少 preorder = [...]");
      if (!Array.isArray(env.inorder)) throw new Error("缺少 inorder = [...]");
      return env;
    },

    run: function (input) {
      var preorder = input.preorder, inorder = input.inorder;
      var steps = [];
      var n = inorder.length;
      var treeRoot = null;

      // Helper to build tree view from root
      function treeView(root) {
        if (!root) return { root: null };
        function nodeView(node) {
          if (!node) return null;
          return {
            val: node.val,
            children: [nodeView(node.left), nodeView(node.right)].filter(Boolean)
          };
        }
        return { root: nodeView(root) };
      }

      // TreeNode constructor
      function TreeNode(val) {
        this.val = val;
        this.left = null;
        this.right = null;
      }

      // Recursive build function
      function build(l1, r1, l2, r2, depth) {
        depth = depth || 0;
        steps.push({
          line: 9,
          msg: "build(" + l1 + ", " + r1 + ", " + l2 + ", " + r2 + ") 被调用",
          views: {
            vars: { l1: l1, r1: r1, l2: l2, r2: r2, depth: depth },
            preorder: { items: preorder.slice(), highlights: l1 >= 0 && l1 < preorder.length ? [l1] : [] },
            inorder: { items: inorder.slice(), highlights: l2 >= 0 && l2 < inorder.length ? [l2] : [] },
            tree: treeView(treeRoot)
          }
        });

        if (l1 > r1 || l2 > r2) {
          steps.push({
            line: 10,
            msg: "区间为空，返回 null",
            views: {
              vars: { l1: l1, r1: r1, l2: l2, r2: r2, depth: depth, "返回值": null },
              preorder: { items: preorder.slice(), highlights: [] },
              inorder: { items: inorder.slice(), highlights: [] },
              tree: treeView(treeRoot)
            }
          });
          return null;
        }

        var rootVal = preorder[l1];
        steps.push({
          line: 12,
          msg: "根节点值为 preorder[" + l1 + "] = " + rootVal,
          views: {
            vars: { l1: l1, r1: r1, l2: l2, r2: r2, root: rootVal, depth: depth },
            preorder: { items: preorder.slice(), highlights: [l1] },
            inorder: { items: inorder.slice(), highlights: [] },
            tree: treeView(treeRoot)
          }
        });

        var i;
        for (i = 0; i < n; i++) {
          if (inorder[i] === rootVal) {
            steps.push({
              line: 14,
              msg: "在 inorder 中找到根节点位置 i=" + i,
              views: {
                vars: { l1: l1, r1: r1, l2: l2, r2: r2, root: rootVal, i: i, depth: depth },
                preorder: { items: preorder.slice(), highlights: [l1] },
                inorder: { items: inorder.slice(), highlights: [i] },
                tree: treeView(treeRoot)
              }
            });
            break;
          }
        }

        var t = new TreeNode(rootVal);
        if (!treeRoot) treeRoot = t;

        steps.push({
          line: 15,
          msg: "创建节点 " + rootVal,
          views: {
            vars: { l1: l1, r1: r1, l2: l2, r2: r2, root: rootVal, i: i, depth: depth },
            preorder: { items: preorder.slice(), highlights: [l1] },
            inorder: { items: inorder.slice(), highlights: [i] },
            tree: treeView(treeRoot)
          }
        });

        // Build left subtree
        steps.push({
          line: 16,
          msg: "递归构建左子树",
          views: {
            vars: { l1: l1, r1: r1, l2: l2, r2: r2, root: rootVal, i: i, depth: depth },
            preorder: { items: preorder.slice(), highlights: [l1] },
            inorder: { items: inorder.slice(), highlights: [i] },
            tree: treeView(treeRoot)
          }
        });
        t.left = build(l1 + 1, l1 + i - l2, l2, i - 1, depth + 1);

        // Build right subtree
        steps.push({
          line: 17,
          msg: "递归构建右子树",
          views: {
            vars: { l1: l1, r1: r1, l2: l2, r2: r2, root: rootVal, i: i, depth: depth },
            preorder: { items: preorder.slice(), highlights: [l1] },
            inorder: { items: inorder.slice(), highlights: [i] },
            tree: treeView(treeRoot)
          }
        });
        t.right = build(l1 + 1 + i - l2, r1, i + 1, r2, depth + 1);

        steps.push({
          line: 18,
          msg: "返回节点 " + rootVal,
          views: {
            vars: { l1: l1, r1: r1, l2: l2, r2: r2, root: rootVal, i: i, depth: depth, "返回值": rootVal },
            preorder: { items: preorder.slice(), highlights: [l1] },
            inorder: { items: inorder.slice(), highlights: [i] },
            tree: treeView(treeRoot)
          }
        });
        return t;
      }

      // Start building
      steps.push({
        line: 7,
        msg: "开始构建二叉树，n = " + n,
        views: {
          vars: { n: n },
          preorder: { items: preorder.slice() },
          inorder: { items: inorder.slice() },
          tree: { root: null }
        }
      });

      var result = build(0, preorder.length - 1, 0, preorder.length - 1);

      // Serialize tree to LeetCode format
      function serialize(root) {
        if (!root) return "[]";
        var result = [];
        var queue = [root];
        while (queue.length > 0) {
          var node = queue.shift();
          if (node) {
            result.push(node.val);
            queue.push(node.left);
            queue.push(node.right);
          } else {
            result.push(null);
          }
        }
        // Remove trailing nulls
        while (result.length > 0 && result[result.length - 1] === null) {
          result.pop();
        }
        return JSON.stringify(result);
      }

      steps.push({
        line: 20,
        msg: "构建完成，返回根节点",
        views: {
          vars: { "返回值": result ? result.val : null },
          preorder: { items: preorder.slice() },
          inorder: { items: inorder.slice() },
          tree: treeView(treeRoot)
        }
      });

      return { steps: steps, output: serialize(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);