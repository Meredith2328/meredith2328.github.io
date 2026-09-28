(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc78-子集"] = {
    title: "78 子集 · 回溯",
    link: "https://leetcode.cn/problems/subsets/",
    language: "python",
    code: [
      "class Solution:",
      "    def subsets(self, nums: List[int]) -> List[List[int]]:",
      "        res = []",
      "        def backtrack(start, path):",
      "            res.append(path[:])",
      "            for i in range(start, len(nums)):",
      "                path.append(nums[i])",
      "                backtrack(i + 1, path)",
      "                path.pop()",
      "",
      "        backtrack(0, [])",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [1, 2, 3]",
    inputHint: "每行一个变量，格式如 nums = [1, 2, 3]",
    testInputs: ["nums = []", "nums = [1, 2]"],
    expectedOutputs: ["[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]", "[[]]", "[[],[1],[1,2],[2]]"],

    views: {
      vars: { type: "vars", title: "变量" },
      path: { type: "array", title: "path" },
      res: { type: "grid", title: "res" },
      callstack: { type: "callstack", title: "调用栈" }
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
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...]");
      return env;
    },

    run: function (input) {
      var nums = input.nums;
      var steps = [];
      var res = [];
      var callStack = [];

      var resView = function (hotIdx) {
        var cells = res.map(function (r) { return r.slice(); });
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < cells.length) {
          highlights.push([hotIdx, 0]);
        }
        return { cells: cells, highlights: highlights };
      };

      var pathView = function (hotIdx) {
        var items = path.slice();
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) {
          highlights.push(hotIdx);
        }
        return { items: items, highlights: highlights };
      };

      var path = [];

      steps.push({
        line: 3,
        msg: "初始化结果列表 res 为空。",
        views: {
          vars: { start: null, path: "[]", res: "[]" },
          path: { items: [] },
          res: resView(),
          callstack: { frames: [] }
        }
      });

      function backtrack(start, depth) {
        var frameLabel = "backtrack(" + start + ", [" + path.join(",") + "])";
        callStack.push(frameLabel);

        steps.push({
          line: 5,
          msg: "进入 backtrack(" + start + ", [" + path.join(",") + "])，将当前 path 的副本加入 res。",
          views: {
            vars: { start: start, path: "[" + path.join(",") + "]", res: "[" + res.map(function (r) { return "[" + r.join(",") + "]"; }).join(",") + "]" },
            path: pathView(),
            res: resView(res.length - 1),
            callstack: { frames: callStack.slice() }
          }
        });

        res.push(path.slice());

        steps.push({
          line: 6,
          msg: "开始遍历 i 从 " + start + " 到 " + (nums.length - 1) + "。",
          views: {
            vars: { start: start, i: null, path: "[" + path.join(",") + "]", res: "[" + res.map(function (r) { return "[" + r.join(",") + "]"; }).join(",") + "]" },
            path: pathView(),
            res: resView(),
            callstack: { frames: callStack.slice() }
          }
        });

        for (var i = start; i < nums.length; i++) {
          steps.push({
            line: 7,
            msg: "将 nums[" + i + "]=" + nums[i] + " 加入 path。",
            views: {
              vars: { start: start, i: i, path: "[" + path.join(",") + "]", res: "[" + res.map(function (r) { return "[" + r.join(",") + "]"; }).join(",") + "]" },
              path: pathView(),
              res: resView(),
              callstack: { frames: callStack.slice() }
            }
          });

          path.push(nums[i]);

          steps.push({
            line: 8,
            msg: "递归调用 backtrack(" + (i + 1) + ", [" + path.join(",") + "])。",
            views: {
              vars: { start: start, i: i, path: "[" + path.join(",") + "]", res: "[" + res.map(function (r) { return "[" + r.join(",") + "]"; }).join(",") + "]" },
              path: pathView(path.length - 1),
              res: resView(),
              callstack: { frames: callStack.slice() }
            }
          });

          backtrack(i + 1, depth + 1);

          steps.push({
            line: 9,
            msg: "回溯：从 path 中弹出 " + nums[i] + "。",
            views: {
              vars: { start: start, i: i, path: "[" + path.join(",") + "]", res: "[" + res.map(function (r) { return "[" + r.join(",") + "]"; }).join(",") + "]" },
              path: pathView(),
              res: resView(),
              callstack: { frames: callStack.slice() }
            }
          });

          path.pop();
        }

        callStack.pop();
      }

      steps.push({
        line: 11,
        msg: "调用 backtrack(0, []) 开始生成所有子集。",
        views: {
          vars: { start: 0, path: "[]", res: "[]" },
          path: { items: [] },
          res: resView(),
          callstack: { frames: [] }
        }
      });

      backtrack(0, 0);

      steps.push({
        line: 12,
        msg: "所有子集生成完毕，返回 res。",
        views: {
          vars: { res: "[" + res.map(function (r) { return "[" + r.join(",") + "]"; }).join(",") + "]" },
          path: { items: [] },
          res: resView(),
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);