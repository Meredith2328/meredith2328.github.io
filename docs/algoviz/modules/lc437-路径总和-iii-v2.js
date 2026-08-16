(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};
  global.AlgoVizModules["lc437-路径总和-iii-v2"] = {
    title: "437 路径总和 III · 前缀和+回溯",
    language: "python",
    code: [
      "# Definition for a binary tree node.",
      "# class TreeNode:",
      "#     def __init__(self, val=0, left=None, right=None):",
      "#         self.val = val",
      "#         self.left = left",
      "#         self.right = right",
      "class Solution:",
      "    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:",
      "        self.count = 0",
      "        self.premap = defaultdict(int)",
      "        self.premap[0] = 1",
      "        self.target = targetSum",
      "",
      "        def dfs(node, cursum):",
      "            if not node:",
      "                return",
      "",
      "            cursum += node.val",
      "            self.count += self.premap[cursum - self.target]",
      "            self.premap[cursum] += 1",
      "            dfs(node.left, cursum)",
      "            dfs(node.right, cursum)",
      "            self.premap[cursum] -= 1",
      "        # 不同起点的dfs不能互相影响, 所以要用回溯写法",
      "",
      "        dfs(root, 0)",
      "        return self.count"
    ].join("\n"),

    defaultInput: "root = [10,5,-3,3,2,null,11,3,-2,null,1]\ntargetSum = 8",
    inputHint: "每行一个变量，root 为层序数组（null 表示空节点），targetSum 为整数",
    testInputs: [
      "root = [1,null,2,null,3]\ntargetSum = 3",
      "root = [1]\ntargetSum = 1",
      "root = []\ntargetSum = 0"
    ],
    expectedOutputs: ["3", "2", "1", "0"],

    views: {
      vars: { type: "vars", title: "变量" },
      tree: { type: "tree", title: "二叉树" },
      premap: { type: "vars", title: "前缀和计数" },
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
      if (!Array.isArray(env.root)) throw new Error("缺少 root = [...]（层序数组，null 表示空节点）");
      if (typeof env.targetSum !== "number") throw new Error("缺少 targetSum = 数字");
      return env;
    },

    run: function (input) {
      var arr = input.root;
      var targetSum = input.targetSum;
      var steps = [];

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

      var root = buildTree(arr);

      // 树视图构建（带节点 id）
      var nodeId = 0;
      function buildTreeView(node) {
        if (!node) return null;
        var id = nodeId++;
        var tv = { val: node.val, id: id, children: [] };
        if (node.left) tv.children.push(buildTreeView(node.left));
        if (node.right) tv.children.push(buildTreeView(node.right));
        return tv;
      }

      var count = 0;
      var premap = {};
      premap[0] = 1;
      var target = targetSum;
      var callStack = [];

      function premapView(hotKey) {
        var o = {};
        Object.keys(premap).forEach(function (k) { o[k] = premap[k]; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      }

      function treeViewWithStatus(node, statusMap) {
        nodeId = 0;
        function build(n) {
          if (!n) return null;
          var id = nodeId++;
          var tv = { val: n.val, id: id, children: [] };
          if (statusMap && statusMap[id]) tv.status = statusMap[id];
          if (n.left) tv.children.push(build(n.left));
          if (n.right) tv.children.push(build(n.right));
          return tv;
        }
        return build(node);
      }

      // 初始步骤
      steps.push({
        line: 7,
        msg: "初始化：count=0，前缀和表 premap 中 premap[0]=1，目标 targetSum=" + target + "。",
        views: {
          vars: { count: 0, target: target, cursum: null },
          tree: { root: treeViewWithStatus(root, null) },
          premap: premapView(),
          callstack: { frames: [] }
        }
      });

      // 递归 dfs
      function dfs(node, cursum, depth) {
        if (!node) {
          steps.push({
            line: 12,
            msg: "到达空节点，直接返回。",
            views: {
              vars: { count: count, target: target, cursum: cursum },
              tree: { root: treeViewWithStatus(root, null) },
              premap: premapView(),
              callstack: { frames: callStack.slice() }
            }
          });
          return;
        }

        // 进入节点
        callStack.push("dfs(" + node.val + ", " + cursum + ")");
        steps.push({
          line: 15,
          msg: "进入节点 " + node.val + "，当前前缀和 cursum=" + cursum + "。",
          views: {
            vars: { count: count, target: target, cursum: cursum },
            tree: { root: treeViewWithStatus(root, null) },
            premap: premapView(),
            callstack: { frames: callStack.slice() }
          }
        });

        cursum += node.val;
        steps.push({
          line: 16,
          msg: "更新前缀和：cursum = " + cursum + "（加上节点值 " + node.val + "）。",
          views: {
            vars: { count: count, target: target, cursum: cursum },
            tree: { root: treeViewWithStatus(root, null) },
            premap: premapView(),
            callstack: { frames: callStack.slice() }
          }
        });

        var need = cursum - target;
        var add = premap[need] || 0;
        count += add;
        steps.push({
          line: 17,
          msg: "查找 premap[" + need + "]=" + add + "，count 增加 " + add + "，现在 count=" + count + "。",
          views: {
            vars: { count: count, target: target, cursum: cursum, "cursum-target": need },
            tree: { root: treeViewWithStatus(root, null) },
            premap: premapView(String(need)),
            callstack: { frames: callStack.slice() }
          }
        });

        premap[cursum] = (premap[cursum] || 0) + 1;
        steps.push({
          line: 18,
          msg: "将 premap[" + cursum + "] 加 1，现在为 " + premap[cursum] + "。",
          views: {
            vars: { count: count, target: target, cursum: cursum },
            tree: { root: treeViewWithStatus(root, null) },
            premap: premapView(String(cursum)),
            callstack: { frames: callStack.slice() }
          }
        });

        // 递归左子树
        steps.push({
          line: 19,
          msg: "递归进入左子树。",
          views: {
            vars: { count: count, target: target, cursum: cursum },
            tree: { root: treeViewWithStatus(root, null) },
            premap: premapView(),
            callstack: { frames: callStack.slice() }
          }
        });
        dfs(node.left, cursum, depth + 1);

        // 递归右子树
        steps.push({
          line: 20,
          msg: "递归进入右子树。",
          views: {
            vars: { count: count, target: target, cursum: cursum },
            tree: { root: treeViewWithStatus(root, null) },
            premap: premapView(),
            callstack: { frames: callStack.slice() }
          }
        });
        dfs(node.right, cursum, depth + 1);

        // 回溯
        premap[cursum] -= 1;
        callStack.pop();
        steps.push({
          line: 21,
          msg: "回溯：将 premap[" + cursum + "] 减 1，现在为 " + premap[cursum] + "，退出节点 " + node.val + "。",
          views: {
            vars: { count: count, target: target, cursum: cursum },
            tree: { root: treeViewWithStatus(root, null) },
            premap: premapView(String(cursum)),
            callstack: { frames: callStack.slice() }
          }
        });
      }

      // 启动 dfs
      steps.push({
        line: 24,
        msg: "调用 dfs(root, 0) 开始遍历。",
        views: {
          vars: { count: count, target: target, cursum: 0 },
          tree: { root: treeViewWithStatus(root, null) },
          premap: premapView(),
          callstack: { frames: [] }
        }
      });
      dfs(root, 0, 0);

      steps.push({
        line: 25,
        msg: "遍历结束，返回 count=" + count + "。",
        views: {
          vars: { count: count, target: target },
          tree: { root: treeViewWithStatus(root, null) },
          premap: premapView(),
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(count) };
    }
  };
})(typeof window !== "undefined" ? window : this);