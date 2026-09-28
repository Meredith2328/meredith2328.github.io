(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc101-对称二叉树"] = {
    title: "101 对称二叉树 · 递归",
    link: "https://leetcode.cn/problems/symmetric-tree/",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def check2Trees(self, t1, t2):",
      "        if not t1 and not t2:",
      "            return True",
      "        elif not t1 and t2:",
      "            return False",
      "        elif not t2 and t1:",
      "            return False",
      "        elif t1.val != t2.val:",
      "            return False",
      "        else:",
      "            return self.check2Trees(t1.left, t2.right) and self.check2Trees(t1.right, t2.left)",
      "",
      "    def isSymmetric(self, root: Optional[TreeNode]) -> bool:",
      "        if not root:",
      "            return True",
      "        else:",
      "            return self.check2Trees(root.left, root.right)"
    ].join("\n"),

    defaultInput: "root = [1,2,2,3,4,4,3]",
    inputHint: "每行一个变量，格式如 root = [1,2,2,3,4,4,3]（层序遍历，null 用 null 表示）",
    testInputs: ["root = [1,2,2,null,3,null,3]", "root = []"],
    expectedOutputs: ["true", "false", "true"],

    views: {
      vars: { type: "vars", title: "变量" },
      tree: { type: "tree", title: "当前子树" },
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
      if (!Array.isArray(env.root)) throw new Error("缺少 root = [...]（层序遍历数组，null 表示空节点）");
      return env;
    },

    run: function (input) {
      var arr = input.root;
      var steps = [];

      // Build tree from level-order array
      function buildTree(arr) {
        if (!arr || arr.length === 0 || arr[0] === null) return null;
        var nodes = arr.map(function (v) { return v === null ? null : { val: v, left: null, right: null }; });
        var i = 0, j = 1;
        while (j < nodes.length) {
          if (nodes[i] !== null) {
            if (j < nodes.length) nodes[i].left = nodes[j++];
            if (j < nodes.length) nodes[i].right = nodes[j++];
          } else {
            j += 2;
          }
          i++;
        }
        return nodes[0];
      }

      var root = buildTree(arr);

      // Convert tree to view format
      function treeView(node, hotId) {
        function conv(n) {
          if (!n) return null;
          var obj = { val: n.val, children: [] };
          if (n.left) obj.children.push(conv(n.left));
          if (n.right) obj.children.push(conv(n.right));
          if (hotId && n.__id === hotId) obj.status = "hi";
          return obj;
        }
        return { root: conv(node) };
      }

      // Assign ids for highlighting
      var idCounter = 0;
      function assignIds(node) {
        if (!node) return;
        node.__id = idCounter++;
        assignIds(node.left);
        assignIds(node.right);
      }
      assignIds(root);

      var callStack = [];

      function check2Trees(t1, t2, depth) {
        var frameName = "check(" + (t1 ? t1.val : "null") + "," + (t2 ? t2.val : "null") + ")";
        callStack.push(frameName);
        steps.push({
          line: 7, msg: "进入 check2Trees：比较 " + (t1 ? "节点 " + t1.val : "空") + " 和 " + (t2 ? "节点 " + t2.val : "空") + "。",
          views: {
            vars: { t1: t1 ? t1.val : null, t2: t2 ? t2.val : null, 深度: depth },
            tree: treeView(root, t1 ? t1.__id : null),
            callstack: { frames: callStack.slice() }
          }
        });

        if (!t1 && !t2) {
          steps.push({
            line: 8, msg: "两个节点都为空，对称，返回 True。",
            views: {
              vars: { t1: null, t2: null, 深度: depth, 结果: true },
              tree: treeView(root),
              callstack: { frames: callStack.slice() }
            }
          });
          callStack.pop();
          return true;
        }
        if (!t1 && t2) {
          steps.push({
            line: 9, msg: "左空右非空，不对称，返回 False。",
            views: {
              vars: { t1: null, t2: t2.val, 深度: depth, 结果: false },
              tree: treeView(root, t2.__id),
              callstack: { frames: callStack.slice() }
            }
          });
          callStack.pop();
          return false;
        }
        if (!t2 && t1) {
          steps.push({
            line: 10, msg: "右空左非空，不对称，返回 False。",
            views: {
              vars: { t1: t1.val, t2: null, 深度: depth, 结果: false },
              tree: treeView(root, t1.__id),
              callstack: { frames: callStack.slice() }
            }
          });
          callStack.pop();
          return false;
        }
        if (t1.val !== t2.val) {
          steps.push({
            line: 11, msg: "值不同：" + t1.val + " ≠ " + t2.val + "，不对称，返回 False。",
            views: {
              vars: { t1: t1.val, t2: t2.val, 深度: depth, 结果: false },
              tree: treeView(root, t1.__id),
              callstack: { frames: callStack.slice() }
            }
          });
          callStack.pop();
          return false;
        }

        steps.push({
          line: 12, msg: "值相同（" + t1.val + "），继续递归比较：左对右、右对左。",
          views: {
            vars: { t1: t1.val, t2: t2.val, 深度: depth },
            tree: treeView(root, t1.__id),
            callstack: { frames: callStack.slice() }
          }
        });

        var leftRes = check2Trees(t1.left, t2.right, depth + 1);
        var rightRes = check2Trees(t1.right, t2.left, depth + 1);
        var res = leftRes && rightRes;

        steps.push({
          line: 12, msg: "递归结果：" + (leftRes ? "左对右 True" : "左对右 False") + "，" + (rightRes ? "右对左 True" : "右对左 False") + "，最终 " + (res ? "True" : "False") + "。",
          views: {
            vars: { t1: t1.val, t2: t2.val, 深度: depth, 结果: res },
            tree: treeView(root, t1.__id),
            callstack: { frames: callStack.slice() }
          }
        });
        callStack.pop();
        return res;
      }

      // Main isSymmetric
      steps.push({
        line: 16, msg: "开始判断二叉树是否对称。",
        views: {
          vars: { root: root ? root.val : null },
          tree: treeView(root),
          callstack: { frames: [] }
        }
      });

      if (!root) {
        steps.push({
          line: 17, msg: "根节点为空，空树对称，返回 True。",
          views: {
            vars: { root: null, 结果: true },
            tree: { root: null },
            callstack: { frames: [] }
          }
        });
        return { steps: steps, output: "true" };
      }

      steps.push({
        line: 19, msg: "根节点非空，递归检查左右子树是否对称。",
        views: {
          vars: { root: root.val },
          tree: treeView(root),
          callstack: { frames: [] }
        }
      });

      var result = check2Trees(root.left, root.right, 1);

      steps.push({
        line: 19, msg: "最终结果：" + (result ? "对称" : "不对称") + "。",
        views: {
          vars: { root: root.val, 结果: result },
          tree: treeView(root),
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: result ? "true" : "false" };
    }
  };
})(typeof window !== "undefined" ? window : this);