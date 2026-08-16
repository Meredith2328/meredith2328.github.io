(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc236-二叉树的最近公共祖先"] = {
    title: "236 二叉树的最近公共祖先 · 后序递归",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, x):",
      "#         self.val = x",
      "#         self.left = None",
      "#         self.right = None",
      "",
      "class Solution:",
      "    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':",
      "        if not root or root == p or root == q:",
      "            return root",
      "",
      "        # 后序写法",
      "        left = self.lowestCommonAncestor(root.left, p, q)",
      "        right = self.lowestCommonAncestor(root.right, p, q)",
      "        if left and right:",
      "            return root",
      "        else:",
      "            return left or right"
    ].join("\n"),

    defaultInput: "root = [3,5,1,6,2,0,8,null,null,7,4]\np = 5\nq = 1",
    inputHint: "每行一个变量：root = [层序数组] / p = 节点值 / q = 节点值",
    testInputs: [
      "root = [3,5,1,6,2,0,8,null,null,7,4]\np = 5\nq = 4",
      "root = [1,2]\np = 1\nq = 2"
    ],
    expectedOutputs: ["3", "5", "1"],

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
      if (!Array.isArray(env.root)) throw new Error("缺少 root = [层序数组]");
      if (typeof env.p !== "number") throw new Error("缺少 p = 节点值");
      if (typeof env.q !== "number") throw new Error("缺少 q = 节点值");
      return env;
    },

    run: function (input) {
      var steps = [];
      var pVal = input.p, qVal = input.q;

      // 构建二叉树（层序）
      function buildTree(arr) {
        if (!arr || arr.length === 0 || arr[0] === null) return null;
        var nodes = arr.map(function (v) { return v === null ? null : { val: v, left: null, right: null }; });
        var idx = 0;
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i] === null) continue;
          if (idx + 1 < nodes.length) nodes[i].left = nodes[idx + 1];
          if (idx + 2 < nodes.length) nodes[i].right = nodes[idx + 2];
          idx += 2;
        }
        return nodes[0];
      }

      var root = buildTree(input.root);

      // 找节点
      function findNode(node, val) {
        if (!node) return null;
        if (node.val === val) return node;
        return findNode(node.left, val) || findNode(node.right, val);
      }
      var pNode = findNode(root, pVal);
      var qNode = findNode(root, qVal);

      // 树视图（带高亮）
      function treeView(hiNode, okNode) {
        function copyNode(n) {
          if (!n) return null;
          var status = undefined;
          if (hiNode && n === hiNode) status = "hi";
          if (okNode && n === okNode) status = "ok";
          return { val: n.val, status: status, children: [copyNode(n.left), copyNode(n.right)].filter(Boolean) };
        }
        return { root: copyNode(root) };
      }

      // 调用栈视图
      function stackView(frames) {
        return { frames: frames.slice() };
      }

      var callStack = [];

      function dfs(node, depth) {
        var indent = "";
        for (var k = 0; k < depth; k++) indent += "  ";
        var frameLabel = "LCA(" + (node ? node.val : "null") + ")";
        callStack.push(frameLabel);

        steps.push({
          line: 9,
          msg: "进入 " + frameLabel + "，检查当前节点。",
          views: {
            vars: { p: pVal, q: qVal, 当前节点: node ? node.val : "null" },
            tree: treeView(node),
            callstack: stackView(callStack)
          }
        });

        if (!node || node === pNode || node === qNode) {
          var retVal = node ? node.val : "null";
          steps.push({
            line: 10,
            msg: "满足终止条件（空节点或就是 p/q），返回 " + retVal + "。",
            views: {
              vars: { p: pVal, q: qVal, 当前节点: node ? node.val : "null", 返回值: retVal },
              tree: treeView(node, node),
              callstack: stackView(callStack)
            }
          });
          callStack.pop();
          return node;
        }

        steps.push({
          line: 13,
          msg: "递归搜索左子树 " + (node.left ? node.left.val : "null") + "。",
          views: {
            vars: { p: pVal, q: qVal, 当前节点: node.val },
            tree: treeView(node),
            callstack: stackView(callStack)
          }
        });
        var left = dfs(node.left, depth + 1);

        steps.push({
          line: 14,
          msg: "递归搜索右子树 " + (node.right ? node.right.val : "null") + "。",
          views: {
            vars: { p: pVal, q: qVal, 当前节点: node.val, left: left ? left.val : "null" },
            tree: treeView(node),
            callstack: stackView(callStack)
          }
        });
        var right = dfs(node.right, depth + 1);

        var leftVal = left ? left.val : "null";
        var rightVal = right ? right.val : "null";
        steps.push({
          line: 15,
          msg: "左右子树结果：left=" + leftVal + "，right=" + rightVal + "。",
          views: {
            vars: { p: pVal, q: qVal, 当前节点: node.val, left: leftVal, right: rightVal },
            tree: treeView(node),
            callstack: stackView(callStack)
          }
        });

        var result;
        if (left && right) {
          result = node;
          steps.push({
            line: 16,
            msg: "左右都找到了，当前节点 " + node.val + " 就是最近公共祖先！",
            views: {
              vars: { p: pVal, q: qVal, 当前节点: node.val, left: leftVal, right: rightVal, 返回值: node.val },
              tree: treeView(node, node),
              callstack: stackView(callStack)
            }
          });
        } else {
          result = left || right;
          var resVal = result ? result.val : "null";
          steps.push({
            line: 18,
            msg: "只有一侧找到，向上返回 " + resVal + "。",
            views: {
              vars: { p: pVal, q: qVal, 当前节点: node.val, left: leftVal, right: rightVal, 返回值: resVal },
              tree: treeView(node, result),
              callstack: stackView(callStack)
            }
          });
        }
        callStack.pop();
        return result;
      }

      steps.push({
        line: 8,
        msg: "开始后序递归查找节点 " + pVal + " 和 " + qVal + " 的最近公共祖先。",
        views: {
          vars: { p: pVal, q: qVal, 当前节点: root ? root.val : "null" },
          tree: treeView(root),
          callstack: stackView(callStack)
        }
      });

      var ans = dfs(root, 0);
      var ansVal = ans ? ans.val : "null";
      steps.push({
        line: 8,
        msg: "递归结束，最近公共祖先是 " + ansVal + "。",
        views: {
          vars: { p: pVal, q: qVal, 最终答案: ansVal },
          tree: treeView(root, ans),
          callstack: stackView([])
        }
      });

      return { steps: steps, output: JSON.stringify(ansVal) };
    }
  };
})(typeof window !== "undefined" ? window : this);