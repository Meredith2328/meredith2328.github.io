(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc543-二叉树的直径-v2"] = {
    title: "543 二叉树的直径 · 层序遍历",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:",
      "        if not root:",
      "            return []",
      "        res = []",
      "        queue = deque([root])",
      "        while queue:",
      "            cur_layer = []",
      "            layer_size = len(queue)",
      "            for _ in range(layer_size):",
      "                node = queue.popleft()",
      "                cur_layer.append(node.val)",
      "                if node.left:",
      "                    queue.append(node.left)",
      "                if node.right:",
      "                    queue.append(node.right)",
      "            res.append(cur_layer)",
      "        return res"
    ].join("\n"),

    defaultInput: "root = [3,9,20,null,null,15,7]",
    inputHint: "每行一个变量，格式如 root = [3,9,20,null,null,15,7]",
    testInputs: [
      "root = [1,2,3,4,5]",
      "root = []"
    ],
    expectedOutputs: [
      "[[3],[9,20],[15,7]]",
      "[[1],[2,3],[4,5]]",
      "[]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      tree: { type: "tree", title: "二叉树" },
      queue: { type: "queue", title: "队列" },
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
      var queue = [];

      // Build tree from array (level order)
      function buildTree(arr) {
        if (!arr || arr.length === 0) return null;
        var nodes = arr.map(function (v) { return v === null ? null : { val: v, left: null, right: null }; });
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i] === null) continue;
          var leftIdx = 2 * i + 1;
          var rightIdx = 2 * i + 2;
          if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx];
          if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx];
        }
        return nodes[0];
      }

      var root = buildTree(arr);

      // Helper to build tree view
      function treeView(root, hotNode) {
        function build(node) {
          if (!node) return null;
          var obj = { val: node.val, children: [] };
          if (node.left) obj.children.push(build(node.left));
          if (node.right) obj.children.push(build(node.right));
          if (hotNode && node === hotNode) obj.status = "hi";
          return obj;
        }
        return { root: build(root) };
      }

      // Helper to build queue view
      function queueView() {
        return { items: queue.map(function (n) { return n.val; }) };
      }

      // Helper to build res view
      function resView() {
        return { items: res.map(function (layer) { return layer.slice(); }) };
      }

      // Step 1: initial
      steps.push({
        line: 7,
        msg: "开始层序遍历。",
        views: {
          vars: { root: arr.length ? arr[0] : null, res: [] },
          tree: treeView(root),
          queue: queueView(),
          res: resView()
        }
      });

      // Step 2: if not root
      if (!root) {
        steps.push({
          line: 8,
          msg: "根节点为空，直接返回空列表。",
          views: {
            vars: { root: null, res: [] },
            tree: { root: null },
            queue: queueView(),
            res: resView()
          }
        });
        return { steps: steps, output: "[]" };
      }

      // Step 3: res = []
      steps.push({
        line: 9,
        msg: "初始化结果列表 res 为空。",
        views: {
          vars: { root: root.val, res: [] },
          tree: treeView(root),
          queue: queueView(),
          res: resView()
        }
      });

      // Step 4: queue = deque([root])
      queue.push(root);
      steps.push({
        line: 10,
        msg: "将根节点 " + root.val + " 放入队列。",
        views: {
          vars: { root: root.val, res: [] },
          tree: treeView(root),
          queue: queueView(),
          res: resView()
        }
      });

      // Step 5: while queue
      while (queue.length > 0) {
        steps.push({
          line: 11,
          msg: "队列非空，开始处理当前层。",
          views: {
            vars: { root: root.val, res: res.length ? res.map(function (l) { return l.slice(); }) : [] },
            tree: treeView(root),
            queue: queueView(),
            res: resView()
          }
        });

        // cur_layer = []
        var cur_layer = [];
        steps.push({
          line: 12,
          msg: "初始化当前层列表 cur_layer 为空。",
          views: {
            vars: { root: root.val, res: res.length ? res.map(function (l) { return l.slice(); }) : [], cur_layer: [] },
            tree: treeView(root),
            queue: queueView(),
            res: resView()
          }
        });

        // layer_size = len(queue)
        var layer_size = queue.length;
        steps.push({
          line: 13,
          msg: "记录当前层节点数 layer_size = " + layer_size + "。",
          views: {
            vars: { root: root.val, res: res.length ? res.map(function (l) { return l.slice(); }) : [], cur_layer: [], layer_size: layer_size },
            tree: treeView(root),
            queue: queueView(),
            res: resView()
          }
        });

        // for _ in range(layer_size)
        for (var j = 0; j < layer_size; j++) {
          steps.push({
            line: 14,
            msg: "处理当前层第 " + (j + 1) + " 个节点。",
            views: {
              vars: { root: root.val, res: res.length ? res.map(function (l) { return l.slice(); }) : [], cur_layer: cur_layer.slice(), layer_size: layer_size, j: j },
              tree: treeView(root),
              queue: queueView(),
              res: resView()
            }
          });

          // node = queue.popleft()
          var node = queue.shift();
          steps.push({
            line: 15,
            msg: "从队列头部取出节点 " + node.val + "。",
            views: {
              vars: { root: root.val, res: res.length ? res.map(function (l) { return l.slice(); }) : [], cur_layer: cur_layer.slice(), layer_size: layer_size, j: j, node: node.val },
              tree: treeView(root, node),
              queue: queueView(),
              res: resView()
            }
          });

          // cur_layer.append(node.val)
          cur_layer.push(node.val);
          steps.push({
            line: 16,
            msg: "将节点值 " + node.val + " 加入当前层列表。",
            views: {
              vars: { root: root.val, res: res.length ? res.map(function (l) { return l.slice(); }) : [], cur_layer: cur_layer.slice(), layer_size: layer_size, j: j, node: node.val },
              tree: treeView(root, node),
              queue: queueView(),
              res: resView()
            }
          });

          // if node.left
          if (node.left) {
            queue.push(node.left);
            steps.push({
              line: 17,
              msg: "节点 " + node.val + " 有左孩子 " + node.left.val + "，将其加入队列。",
              views: {
                vars: { root: root.val, res: res.length ? res.map(function (l) { return l.slice(); }) : [], cur_layer: cur_layer.slice(), layer_size: layer_size, j: j, node: node.val },
                tree: treeView(root, node.left),
                queue: queueView(),
                res: resView()
              }
            });
          }

          // if node.right
          if (node.right) {
            queue.push(node.right);
            steps.push({
              line: 19,
              msg: "节点 " + node.val + " 有右孩子 " + node.right.val + "，将其加入队列。",
              views: {
                vars: { root: root.val, res: res.length ? res.map(function (l) { return l.slice(); }) : [], cur_layer: cur_layer.slice(), layer_size: layer_size, j: j, node: node.val },
                tree: treeView(root, node.right),
                queue: queueView(),
                res: resView()
              }
            });
          }
        }

        // res.append(cur_layer)
        res.push(cur_layer.slice());
        steps.push({
          line: 20,
          msg: "将当前层 [" + cur_layer.join(", ") + "] 加入结果列表。",
          views: {
            vars: { root: root.val, res: res.map(function (l) { return l.slice(); }), cur_layer: cur_layer.slice(), layer_size: layer_size },
            tree: treeView(root),
            queue: queueView(),
            res: resView()
          }
        });
      }

      // return res
      steps.push({
        line: 21,
        msg: "队列为空，遍历结束，返回结果。",
        views: {
          vars: { root: root.val, res: res.map(function (l) { return l.slice(); }) },
          tree: treeView(root),
          queue: queueView(),
          res: resView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);