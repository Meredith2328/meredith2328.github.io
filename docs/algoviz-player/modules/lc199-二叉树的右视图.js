(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc199-二叉树的右视图"] = {
    title: "199 二叉树的右视图 · 层序",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:",
      "        # 基于层序遍历",
      "        if not root:",
      "            return []",
      "",
      "        q = deque([root])",
      "        res = []",
      "",
      "        while q:",
      "            # 当前层的节点个数",
      "            level_size = len(q)",
      "            for i in range(level_size):",
      "                node = q.popleft()",
      "                if i == level_size - 1:",
      "                    res.append(node.val)",
      "                if node.left:",
      "                    q.append(node.left)",
      "                if node.right:",
      "                    q.append(node.right)",
      "",
      "        return res"
    ].join("\n"),

    defaultInput: "root = [1,2,3,null,5,null,4]",
    inputHint: "root = [1,2,3,null,5,null,4]  （层序，null 表示空节点）",
    testInputs: [
      "root = [1,null,3]",
      "root = []"
    ],
    expectedOutputs: [
      "[1,3,4]",
      "[1,3]",
      "[]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      tree: { type: "tree", title: "二叉树" },
      queue: { type: "queue", title: "队列 q" },
      res: { type: "array", title: "结果 res" }
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

      // 构建二叉树（层序数组 -> 树）
      function buildTree(arr) {
        if (!arr || arr.length === 0 || arr[0] === null) return null;
        var root = { val: arr[0], left: null, right: null };
        var q = [root];
        var i = 1;
        while (i < arr.length) {
          var node = q.shift();
          if (i < arr.length && arr[i] !== null) {
            node.left = { val: arr[i], left: null, right: null };
            q.push(node.left);
          }
          i++;
          if (i < arr.length && arr[i] !== null) {
            node.right = { val: arr[i], left: null, right: null };
            q.push(node.right);
          }
          i++;
        }
        return root;
      }

      var root = buildTree(arr);

      // 树视图（深拷贝，避免引用）
      function treeView(root, hotVal) {
        function copy(n) {
          if (!n) return null;
          return {
            val: n.val,
            status: (hotVal !== undefined && n.val === hotVal) ? "hi" : undefined,
            children: [copy(n.left), copy(n.right)].filter(Boolean)
          };
        }
        return { root: copy(root) };
      }

      // 队列视图
      function queueView(q) {
        return { items: q.map(function (n) { return n.val; }) };
      }

      // 初始步骤
      steps.push({
        line: 8,
        msg: "开始：判断根节点是否为空。",
        views: {
          vars: { root: root ? root.val : null, res: [] },
          tree: treeView(root),
          queue: { items: [] },
          res: { items: [] }
        }
      });

      if (!root) {
        steps.push({
          line: 9,
          msg: "根节点为空，直接返回空数组。",
          views: {
            vars: { root: null, res: [] },
            tree: { root: null },
            queue: { items: [] },
            res: { items: [] }
          }
        });
        return { steps: steps, output: "[]" };
      }

      var q = [root];
      steps.push({
        line: 12,
        msg: "初始化队列 q = [" + root.val + "]，结果数组 res 为空。",
        views: {
          vars: { root: root.val, q: [root.val], res: [] },
          tree: treeView(root),
          queue: queueView(q),
          res: { items: [] }
        }
      });

      while (q.length > 0) {
        var level_size = q.length;
        steps.push({
          line: 16,
          msg: "当前层有 " + level_size + " 个节点，开始处理这一层。",
          views: {
            vars: { level_size: level_size, i: null, node: null, res: res.slice() },
            tree: treeView(root),
            queue: queueView(q),
            res: { items: res.slice() }
          }
        });

        for (var i = 0; i < level_size; i++) {
          var node = q.shift();
          steps.push({
            line: 18,
            msg: "出队节点 " + node.val + "（i=" + i + "）。",
            views: {
              vars: { level_size: level_size, i: i, node: node.val, res: res.slice() },
              tree: treeView(root, node.val),
              queue: queueView(q),
              res: { items: res.slice() }
            }
          });

          if (i === level_size - 1) {
            res.push(node.val);
            steps.push({
              line: 19,
              msg: "这是当前层最后一个节点，把 " + node.val + " 加入结果。",
              views: {
                vars: { level_size: level_size, i: i, node: node.val, res: res.slice() },
                tree: treeView(root, node.val),
                queue: queueView(q),
                res: { items: res.slice(), highlights: [res.length - 1], ok: [res.length - 1] }
              }
            });
          }

          if (node.left) {
            q.push(node.left);
            steps.push({
              line: 21,
              msg: "左孩子 " + node.left.val + " 入队。",
              views: {
                vars: { level_size: level_size, i: i, node: node.val, res: res.slice() },
                tree: treeView(root, node.left.val),
                queue: queueView(q),
                res: { items: res.slice() }
              }
            });
          }
          if (node.right) {
            q.push(node.right);
            steps.push({
              line: 23,
              msg: "右孩子 " + node.right.val + " 入队。",
              views: {
                vars: { level_size: level_size, i: i, node: node.val, res: res.slice() },
                tree: treeView(root, node.right.val),
                queue: queueView(q),
                res: { items: res.slice() }
              }
            });
          }
        }
      }

      steps.push({
        line: 26,
        msg: "层序遍历完成，返回结果 [" + res.join(", ") + "]。",
        views: {
          vars: { res: res.slice() },
          tree: treeView(root),
          queue: { items: [] },
          res: { items: res.slice(), ok: res.map(function (_, idx) { return idx; }) }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);