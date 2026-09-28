(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc94-二叉树的中序遍历-v3"] = {
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
      "    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:",
      "        if not root:",
      "            return root",
      "        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)",
      "        return root"
    ].join("\n"),

    defaultInput: "root = [4,2,7,1,3,6,9]",
    inputHint: "每行一个变量，格式如 root = [4,2,7,1,3,6,9]（层序遍历，null 表示空节点）",

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
          if (arr[i] !== null && arr[i] !== undefined) {
            node.left = { val: arr[i], left: null, right: null };
            queue.push(node.left);
          }
          i++;
          if (i < arr.length && arr[i] !== null && arr[i] !== undefined) {
            node.right = { val: arr[i], left: null, right: null };
            queue.push(node.right);
          }
          i++;
        }
        return root;
      }

      var root = buildTree(arr);

      // 树视图（深拷贝，避免引用）
      function treeView(node, statusMap) {
        if (!node) return null;
        var status = statusMap && statusMap[node.val] ? statusMap[node.val] : undefined;
        return {
          val: node.val,
          status: status,
          children: [treeView(node.left, statusMap), treeView(node.right, statusMap)].filter(Boolean)
        };
      }

      // 递归反转
      var callStack = [];
      function invert(node, depth) {
        if (!node) {
          steps.push({
            line: 8,
            msg: "当前节点为空，直接返回 null。",
            views: {
              vars: { "当前节点": null, "递归深度": depth },
              tree: treeView(root),
              callstack: { frames: callStack.slice() }
            }
          });
          return null;
        }

        callStack.push("invert(" + node.val + ")");
        steps.push({
          line: 7,
          msg: "进入 invert(" + node.val + ")，先递归处理右子树。",
          views: {
            vars: { "当前节点": node.val, "递归深度": depth },
            tree: treeView(root, { [node.val]: "hi" }),
            callstack: { frames: callStack.slice() }
          }
        });

        var right = invert(node.right, depth + 1);
        var left = invert(node.left, depth + 1);

        steps.push({
          line: 9,
          msg: "交换节点 " + node.val + " 的左右子树。",
          views: {
            vars: { "当前节点": node.val, "左子树": left ? left.val : null, "右子树": right ? right.val : null },
            tree: treeView(root, { [node.val]: "hi" }),
            callstack: { frames: callStack.slice() }
          }
        });

        node.left = right;
        node.right = left;

        callStack.pop();
        steps.push({
          line: 10,
          msg: "返回反转后的子树（根为 " + node.val + "）。",
          views: {
            vars: { "当前节点": node.val },
            tree: treeView(root, { [node.val]: "ok" }),
            callstack: { frames: callStack.slice() }
          }
        });

        return node;
      }

      steps.push({
        line: 7,
        msg: "开始反转二叉树。",
        views: {
          vars: { "当前节点": root ? root.val : null },
          tree: treeView(root),
          callstack: { frames: [] }
        }
      });

      var result = invert(root, 0);

      steps.push({
        line: 10,
        msg: "反转完成，返回新树的根节点。",
        views: {
          vars: { "根节点": result ? result.val : null },
          tree: treeView(result),
          callstack: { frames: [] }
        }
      });

      // 层序遍历输出结果
      function levelOrder(node) {
        if (!node) return [];
        var res = [];
        var q = [node];
        while (q.length) {
          var n = q.shift();
          if (n) {
            res.push(n.val);
            q.push(n.left);
            q.push(n.right);
          } else {
            res.push(null);
          }
        }
        // 去掉末尾的 null
        while (res.length && res[res.length - 1] === null) res.pop();
        return res;
      }

      var output = levelOrder(result);
      return { steps: steps, output: JSON.stringify(output) };
    }
  };
})(typeof window !== "undefined" ? window : this);