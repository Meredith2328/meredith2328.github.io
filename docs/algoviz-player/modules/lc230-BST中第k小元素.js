(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc230-BST中第k小元素"] = {
    title: "230 二叉搜索树中第K小的元素 · 中序遍历",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:",
      "        stk = []",
      "        curr = root",
      "        while curr or stk:",
      "            while curr:",
      "                stk.append(curr)",
      "                curr = curr.left",
      "            curr = stk.pop()",
      "            k -= 1",
      "            if k == 0:",
      "                return curr.val",
      "            curr = curr.right"
    ].join("\n"),

    defaultInput: "root = [3,1,4,null,2]\nk = 1",
    inputHint: "每行一个变量，格式如 root = [3,1,4,null,2] / k = 1",
    testInputs: [
      "root = [5,3,6,2,4,null,null,1]\nk = 3",
      "root = [1,null,2]\nk = 2"
    ],
    expectedOutputs: ["1", "3", "2"],

    views: {
      vars: { type: "vars", title: "变量" },
      tree: { type: "tree", title: "BST" },
      stack: { type: "stack", title: "栈 stk" }
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
      if (typeof env.k !== "number") throw new Error("缺少 k = 数字");
      return env;
    },

    run: function (input) {
      var arr = input.root, k = input.k;
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
      var stk = [];
      var curr = root;

      // Helper to get stack items (values only)
      function stackItems() {
        return stk.map(function (n) { return n.val; });
      }

      // Helper to mark tree nodes
      function markTree(node, target, status) {
        if (!node) return;
        if (node === target) {
          node.status = status;
        } else {
          node.status = undefined;
        }
        markTree(node.left, target, status);
        markTree(node.right, target, status);
      }

      // Initial step
      steps.push({
        line: 8,
        msg: "初始化：栈 stk 为空，curr 指向根节点 " + (root ? root.val : "null") + "。",
        views: {
          vars: { k: k, curr: root ? root.val : null, stk: [] },
          tree: { root: root },
          stack: { items: [] }
        }
      });

      while (curr || stk.length > 0) {
        // Inner while: push left
        while (curr) {
          stk.push(curr);
          steps.push({
            line: 10,
            msg: "将节点 " + curr.val + " 入栈，然后转向其左孩子。",
            views: {
              vars: { k: k, curr: curr.val, stk: stackItems() },
              tree: { root: root },
              stack: { items: stackItems(), highlights: [stk.length - 1] }
            }
          });
          curr = curr.left;
        }

        // Pop from stack
        curr = stk.pop();
        steps.push({
          line: 12,
          msg: "弹出栈顶节点 " + curr.val + "，这是中序遍历访问到的节点。",
          views: {
            vars: { k: k, curr: curr.val, stk: stackItems() },
            tree: { root: root },
            stack: { items: stackItems() }
          }
        });

        // Decrement k
        k -= 1;
        steps.push({
          line: 13,
          msg: "k 减 1，现在 k = " + k + "。",
          views: {
            vars: { k: k, curr: curr.val, stk: stackItems() },
            tree: { root: root },
            stack: { items: stackItems() }
          }
        });

        // Check if k == 0
        if (k === 0) {
          steps.push({
            line: 14,
            msg: "k 为 0，当前节点 " + curr.val + " 就是第 " + input.k + " 小的元素。",
            views: {
              vars: { k: k, curr: curr.val, stk: stackItems(), "结果": curr.val },
              tree: { root: root },
              stack: { items: stackItems() }
            }
          });
          steps.push({
            line: 15,
            msg: "返回 " + curr.val + "。",
            views: {
              vars: { "返回值": curr.val },
              tree: { root: root },
              stack: { items: stackItems() }
            }
          });
          return { steps: steps, output: JSON.stringify(curr.val) };
        }

        // Move to right child
        curr = curr.right;
        steps.push({
          line: 16,
          msg: "转向当前节点的右孩子" + (curr ? "（节点 " + curr.val + "）" : "（null）") + "。",
          views: {
            vars: { k: k, curr: curr ? curr.val : null, stk: stackItems() },
            tree: { root: root },
            stack: { items: stackItems() }
          }
        });
      }

      // Should not reach here for valid input
      steps.push({
        line: 9,
        msg: "遍历结束，未找到第 " + input.k + " 小的元素（输入可能不合法）。",
        views: {
          vars: { k: k, curr: null, stk: [] },
          tree: { root: root },
          stack: { items: [] }
        }
      });
      return { steps: steps, output: "null" };
    }
  };
})(typeof window !== "undefined" ? window : this);