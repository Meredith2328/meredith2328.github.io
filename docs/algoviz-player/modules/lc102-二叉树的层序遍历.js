(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc102-二叉树的层序遍历"] = {
    title: "102 二叉树的层序遍历 · 队列",
    link: "https://leetcode.cn/problems/binary-tree-level-order-traversal/",
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
      "        res, cur_res = list(), list()",
      "        q = deque([(root, 1)])",
      "        cur = 1",
      "",
      "        while q:",
      "            node, node_dep = q.popleft()",
      "            if not node:",
      "                continue",
      "            elif node_dep > cur:",
      "                # 清空缓冲区, 再添加新元素",
      "                res.append(cur_res)",
      "                cur_res = list()",
      "                cur += 1",
      "",
      "            cur_res.append(node.val)",
      "            q.append((node.left, node_dep + 1))",
      "            q.append((node.right, node_dep + 1))",
      "",
      "        if cur_res:",
      "            res.append(cur_res)",
      "        return res"
    ].join("\n"),

    defaultInput: "root = [3, 9, 20, null, null, 15, 7]",
    inputHint: "每行一个变量，格式如 root = [3, 9, 20, null, null, 15, 7]（层序序列，null 表示空节点）",
    testInputs: [
      "root = [1, 2, 3, 4, null, null, 5]",
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
      if (!Array.isArray(env.root)) throw new Error("缺少 root = [...]（层序序列）");
      return env;
    },

    run: function (input) {
      var arr = input.root;
      var steps = [];
      var res = [];
      var cur_res = [];

      // 构建树
      function buildTree(arr) {
        if (!arr.length || arr[0] === null) return null;
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

      // 队列元素: {node: 节点, dep: 深度}
      var q = [];
      if (root) q.push({ node: root, dep: 1 });
      var cur = 1;

      // 树视图辅助
      function treeView() {
        return { root: root ? root : null };
      }

      // 队列视图辅助
      function queueView() {
        var items = [];
        for (var i = 0; i < q.length; i++) {
          items.push(q[i].node ? q[i].node.val : "null");
        }
        return { items: items };
      }

      // 结果视图辅助
      function resView() {
        var items = [];
        for (var i = 0; i < res.length; i++) {
          items.push(res[i].slice());
        }
        if (cur_res.length) items.push(cur_res.slice());
        return { items: items };
      }

      steps.push({
        line: 7,
        msg: "初始化：结果列表 res 和当前层列表 cur_res 为空，队列 q 放入根节点（深度 1），当前深度 cur=1。",
        views: {
          vars: { cur: cur, cur_res: cur_res.slice(), res: res.slice() },
          tree: treeView(),
          queue: queueView(),
          res: resView()
        }
      });

      while (q.length > 0) {
        var item = q.shift();
        var node = item.node;
        var node_dep = item.dep;

        steps.push({
          line: 11,
          msg: "从队列取出节点 " + (node ? node.val : "null") + "，深度 " + node_dep + "。",
          views: {
            vars: { cur: cur, node: node ? node.val : null, node_dep: node_dep, cur_res: cur_res.slice(), res: res.slice() },
            tree: treeView(),
            queue: queueView(),
            res: resView()
          }
        });

        if (!node) {
          steps.push({
            line: 12,
            msg: "节点为空，跳过。",
            views: {
              vars: { cur: cur, node: null, node_dep: node_dep, cur_res: cur_res.slice(), res: res.slice() },
              tree: treeView(),
              queue: queueView(),
              res: resView()
            }
          });
          continue;
        }

        if (node_dep > cur) {
          steps.push({
            line: 15,
            msg: "深度 " + node_dep + " 大于当前深度 " + cur + "，说明进入新的一层：把当前层结果 " + JSON.stringify(cur_res) + " 加入 res，并重置 cur_res。",
            views: {
              vars: { cur: cur, node: node.val, node_dep: node_dep, cur_res: cur_res.slice(), res: res.slice() },
              tree: treeView(),
              queue: queueView(),
              res: resView()
            }
          });
          res.push(cur_res.slice());
          cur_res = [];
          cur += 1;
          steps.push({
            line: 16,
            msg: "已将 " + JSON.stringify(res[res.length - 1]) + " 加入 res，cur 更新为 " + cur + "。",
            views: {
              vars: { cur: cur, node: node.val, node_dep: node_dep, cur_res: cur_res.slice(), res: res.slice() },
              tree: treeView(),
              queue: queueView(),
              res: resView()
            }
          });
        }

        cur_res.push(node.val);
        steps.push({
          line: 19,
          msg: "将节点 " + node.val + " 加入当前层结果 cur_res。",
          views: {
            vars: { cur: cur, node: node.val, node_dep: node_dep, cur_res: cur_res.slice(), res: res.slice() },
            tree: treeView(),
            queue: queueView(),
            res: resView()
          }
        });

        q.push({ node: node.left, dep: node_dep + 1 });
        q.push({ node: node.right, dep: node_dep + 1 });
        steps.push({
          line: 20,
          msg: "将左子节点 " + (node.left ? node.left.val : "null") + " 和右子节点 " + (node.right ? node.right.val : "null") + " 加入队列，深度为 " + (node_dep + 1) + "。",
          views: {
            vars: { cur: cur, node: node.val, node_dep: node_dep, cur_res: cur_res.slice(), res: res.slice() },
            tree: treeView(),
            queue: queueView(),
            res: resView()
          }
        });
      }

      if (cur_res.length > 0) {
        steps.push({
          line: 23,
          msg: "循环结束，当前层结果 " + JSON.stringify(cur_res) + " 非空，加入 res。",
          views: {
            vars: { cur: cur, cur_res: cur_res.slice(), res: res.slice() },
            tree: treeView(),
            queue: queueView(),
            res: resView()
          }
        });
        res.push(cur_res.slice());
      }

      steps.push({
        line: 24,
        msg: "返回最终结果 " + JSON.stringify(res) + "。",
        views: {
          vars: { res: res.slice() },
          tree: treeView(),
          queue: queueView(),
          res: resView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);