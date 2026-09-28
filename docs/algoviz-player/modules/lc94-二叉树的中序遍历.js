(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc94-二叉树的中序遍历"] = {
    title: "94 二叉树的中序遍历 · 递归",
    link: "https://leetcode.cn/problems/binary-tree-inorder-traversal/",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:",
      "        if not root:",
      "            return []",
      "        return self.inorderTraversal(root.left) + [root.val] + self.inorderTraversal(root.right)"
    ].join("\n"),

    defaultInput: "root = [1, null, 2, 3]",
    inputHint: "root = [1, null, 2, 3] 表示层序遍历的二叉树，null 表示空节点",
    testInputs: [
      "root = [1, 2, 3, 4, 5, 6, 7]",
      "root = []"
    ],
    expectedOutputs: [
      "[1,3,2]",
      "[4,2,5,1,6,3,7]",
      "[]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      tree: { type: "tree", title: "二叉树" },
      result: { type: "array", title: "中序遍历结果" },
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
      return env;
    },

    run: function (input) {
      var rootArr = input.root;
      var steps = [];
      var result = [];

      // 构建二叉树
      function buildTree(arr) {
        if (!arr.length || arr[0] === null) return null;
        var root = { val: arr[0], left: null, right: null };
        var queue = [root];
        var i = 1;
        while (i < arr.length) {
          var node = queue.shift();
          if (arr[i] !== null) {
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

      var root = buildTree(rootArr);

      // 树视图辅助函数
      function treeView(root, highlightVal) {
        function copyNode(node) {
          if (!node) return null;
          var n = { val: node.val, children: [] };
          if (node.left) n.children.push(copyNode(node.left));
          if (node.right) n.children.push(copyNode(node.right));
          if (highlightVal !== undefined && node.val === highlightVal) n.status = "hi";
          return n;
        }
        return { root: copyNode(root) };
      }

      // 递归中序遍历
      function inorder(node, depth, path) {
        if (!node) {
          steps.push({
            line: 8,
            msg: "当前节点为空，返回空列表。",
            views: {
              vars: { "当前节点": null, "递归深度": depth },
              tree: treeView(root),
              result: { items: result.slice() },
              callstack: { frames: path.slice() }
            }
          });
          return [];
        }

        path.push("inorder(" + node.val + ")");
        steps.push({
          line: 7,
          msg: "进入节点 " + node.val + "，递归遍历左子树。",
          views: {
            vars: { "当前节点": node.val, "递归深度": depth },
            tree: treeView(root, node.val),
            result: { items: result.slice() },
            callstack: { frames: path.slice() }
          }
        });

        // 左子树
        var left = inorder(node.left, depth + 1, path);

        // 访问当前节点
        result.push(node.val);
        steps.push({
          line: 9,
          msg: "访问节点 " + node.val + "，加入结果列表。",
          views: {
            vars: { "当前节点": node.val, "递归深度": depth },
            tree: treeView(root, node.val),
            result: { items: result.slice(), highlights: [result.length - 1] },
            callstack: { frames: path.slice() }
          }
        });

        // 右子树
        var right = inorder(node.right, depth + 1, path);

        path.pop();
        steps.push({
          line: 9,
          msg: "节点 " + node.val + " 的左右子树遍历完成，返回结果。",
          views: {
            vars: { "当前节点": node.val, "递归深度": depth },
            tree: treeView(root),
            result: { items: result.slice() },
            callstack: { frames: path.slice() }
          }
        });

        return left.concat([node.val]).concat(right);
      }

      // 初始步骤
      steps.push({
        line: 7,
        msg: "开始中序遍历。",
        views: {
          vars: { "当前节点": root ? root.val : null, "递归深度": 0 },
          tree: treeView(root),
          result: { items: [] },
          callstack: { frames: [] }
        }
      });

      var output = inorder(root, 0, []);

      steps.push({
        line: 7,
        msg: "遍历完成，最终结果：" + JSON.stringify(output) + "。",
        views: {
          vars: { "当前节点": null, "递归深度": 0 },
          tree: treeView(root),
          result: { items: output.slice(), ok: output.map(function (_, i) { return i; }) },
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(output) };
    }
  };
})(typeof window !== "undefined" ? window : this);