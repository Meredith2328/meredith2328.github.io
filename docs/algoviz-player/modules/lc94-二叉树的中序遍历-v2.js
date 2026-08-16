(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc94-二叉树的中序遍历-v2"] = {
    title: "94 二叉树的中序遍历 · 递归",
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
      "        res = []",
      "        def dfs(node):",
      "            if not node:",
      "                return",
      "            dfs(node.left)",
      "            res.append(node.val)",
      "            dfs(node.right)",
      "        dfs(root)",
      "        return res"
    ].join("\n"),

    defaultInput: "root = [1, null, 2, 3]",
    inputHint: "root = [1, null, 2, 3] 表示二叉树层序遍历序列，null 表示空节点",
    testInputs: [
      "root = []",
      "root = [1, 2, 3, null, 4, null, 5]"
    ],
    expectedOutputs: [
      "[1,3,2]",
      "[]",
      "[2,4,1,3,5]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      tree: { type: "tree", title: "二叉树" },
      res: { type: "array", title: "res" },
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
      if (!Array.isArray(env.root)) throw new Error("缺少 root = [...]");
      return env;
    },

    run: function (input) {
      var arr = input.root;
      var steps = [];
      var res = [];
      var callStack = [];

      // Build tree from level-order array
      function buildTree(arr) {
        if (!arr || arr.length === 0) return null;
        var root = { val: arr[0], children: [] };
        var queue = [root];
        var i = 1;
        while (i < arr.length) {
          var node = queue.shift();
          if (arr[i] !== null) {
            node.children[0] = { val: arr[i], children: [] };
            queue.push(node.children[0]);
          } else {
            node.children[0] = null;
          }
          i++;
          if (i < arr.length) {
            if (arr[i] !== null) {
              node.children[1] = { val: arr[i], children: [] };
              queue.push(node.children[1]);
            } else {
              node.children[1] = null;
            }
            i++;
          }
        }
        return root;
      }

      var root = buildTree(arr);

      function treeView(node, highlightVal) {
        if (!node) return null;
        var obj = { val: node.val, children: [] };
        if (node.children[0]) obj.children.push(treeView(node.children[0], highlightVal));
        else obj.children.push(null);
        if (node.children[1]) obj.children.push(treeView(node.children[1], highlightVal));
        else obj.children.push(null);
        if (node.val === highlightVal) obj.status = "hi";
        return obj;
      }

      function resView() {
        return { items: res.slice() };
      }

      function callStackView() {
        return { frames: callStack.slice() };
      }

      function dfs(node) {
        if (!node) {
          steps.push({
            line: 10, msg: "当前节点为空，直接返回。",
            views: {
              vars: { res: res.slice() },
              tree: treeView(root),
              res: resView(),
              callstack: callStackView()
            }
          });
          return;
        }

        callStack.push("dfs(" + node.val + ")");
        steps.push({
          line: 11, msg: "递归访问左子树 " + (node.children[0] ? node.children[0].val : "空") + "。",
          views: {
            vars: { res: res.slice() },
            tree: treeView(root, node.val),
            res: resView(),
            callstack: callStackView()
          }
        });

        dfs(node.children[0]);

        res.push(node.val);
        steps.push({
          line: 12, msg: "访问当前节点，将 " + node.val + " 加入结果。",
          views: {
            vars: { res: res.slice() },
            tree: treeView(root, node.val),
            res: resView(),
            callstack: callStackView()
          }
        });

        steps.push({
          line: 13, msg: "递归访问右子树 " + (node.children[1] ? node.children[1].val : "空") + "。",
          views: {
            vars: { res: res.slice() },
            tree: treeView(root, node.val),
            res: resView(),
            callstack: callStackView()
          }
        });

        dfs(node.children[1]);

        callStack.pop();
      }

      steps.push({
        line: 7, msg: "初始化结果数组 res。",
        views: {
          vars: { res: [] },
          tree: treeView(root),
          res: resView(),
          callstack: callStackView()
        }
      });

      steps.push({
        line: 8, msg: "定义递归函数 dfs。",
        views: {
          vars: { res: [] },
          tree: treeView(root),
          res: resView(),
          callstack: callStackView()
        }
      });

      steps.push({
        line: 14, msg: "从根节点开始调用 dfs。",
        views: {
          vars: { res: [] },
          tree: treeView(root),
          res: resView(),
          callstack: callStackView()
        }
      });

      dfs(root);

      steps.push({
        line: 15, msg: "返回中序遍历结果。",
        views: {
          vars: { res: res.slice() },
          tree: treeView(root),
          res: resView(),
          callstack: callStackView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);