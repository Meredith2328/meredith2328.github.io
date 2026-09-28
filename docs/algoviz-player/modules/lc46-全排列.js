(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc46-全排列"] = {
    title: "46 全排列 · 回溯",
    link: "https://leetcode.cn/problems/permutations/",
    language: "python",
    code: [
      "class Solution:",
      "    def permute(self, nums: List[int]) -> List[List[int]]:",
      "        res = []",
      "",
      "        # 回溯: 结束, 遍历, 选择",
      "        def backtrack(path, used):",
      "            if len(path) == len(nums):",
      "                res.append(path[:])",
      "            for i in range(len(nums)):",
      "                if used[i]:",
      "                    continue",
      "",
      "                path.append(nums[i])",
      "                used[i] = True",
      "                backtrack(path, used)",
      "                path.pop()",
      "                used[i] = False",
      "",
      "        backtrack([], [False] * len(nums))",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [1, 2, 3]",
    inputHint: "每行一个变量，格式如 nums = [1, 2, 3]",
    testInputs: ["nums = [0, 1]", "nums = [1]"],
    expectedOutputs: [
      "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]",
      "[[0,1],[1,0]]",
      "[[1]]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      path: { type: "array", title: "path" },
      used: { type: "array", title: "used" },
      res: { type: "array", title: "res" }
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
      var resView = function () {
        return { items: res.map(function (p) { return p.slice(); }) };
      };

      steps.push({
        line: 3, msg: "初始化结果列表 res 为空。",
        views: {
          vars: { nums: nums.slice(), path: [], used: null, res: [] },
          path: { items: [] },
          used: { items: [] },
          res: resView()
        }
      });

      function backtrack(path, used) {
        steps.push({
          line: 6, msg: "进入 backtrack，当前 path = [" + path.join(", ") + "]。",
          views: {
            vars: { nums: nums.slice(), path: path.slice(), used: used.slice(), res: res.length },
            path: { items: path.slice() },
            used: { items: used.slice() },
            res: resView()
          }
        });

        if (path.length === nums.length) {
          res.push(path.slice());
          steps.push({
            line: 7, msg: "path 长度等于 nums 长度，找到一个排列 [" + path.join(", ") + "]，加入 res。",
            views: {
              vars: { nums: nums.slice(), path: path.slice(), used: used.slice(), res: res.length },
              path: { items: path.slice(), ok: path.map(function (_, i) { return i; }) },
              used: { items: used.slice() },
              res: resView()
            }
          });
          return;
        }

        for (var i = 0; i < nums.length; i++) {
          steps.push({
            line: 9, msg: "遍历下标 i=" + i + "，元素 nums[" + i + "]=" + nums[i] + "。",
            views: {
              vars: { nums: nums.slice(), path: path.slice(), used: used.slice(), res: res.length, i: i },
              path: { items: path.slice() },
              used: { items: used.slice(), highlights: [i] },
              res: resView()
            }
          });

          if (used[i]) {
            steps.push({
              line: 10, msg: "used[" + i + "] 为 True，跳过该元素。",
              views: {
                vars: { nums: nums.slice(), path: path.slice(), used: used.slice(), res: res.length, i: i },
                path: { items: path.slice() },
                used: { items: used.slice(), highlights: [i], bad: [i] },
                res: resView()
              }
            });
            continue;
          }

          path.push(nums[i]);
          used[i] = true;
          steps.push({
            line: 13, msg: "选择 " + nums[i] + "，path 变为 [" + path.join(", ") + "]，used[" + i + "] 置为 True。",
            views: {
              vars: { nums: nums.slice(), path: path.slice(), used: used.slice(), res: res.length, i: i },
              path: { items: path.slice(), highlights: [path.length - 1] },
              used: { items: used.slice(), highlights: [i], ok: [i] },
              res: resView()
            }
          });

          backtrack(path, used);

          path.pop();
          used[i] = false;
          steps.push({
            line: 16, msg: "回溯：弹出 " + nums[i] + "，path 变为 [" + path.join(", ") + "]，used[" + i + "] 置为 False。",
            views: {
              vars: { nums: nums.slice(), path: path.slice(), used: used.slice(), res: res.length, i: i },
              path: { items: path.slice() },
              used: { items: used.slice(), highlights: [i] },
              res: resView()
            }
          });
        }
      }

      backtrack([], nums.map(function () { return false; }));

      steps.push({
        line: 19, msg: "回溯结束，返回所有排列。",
        views: {
          vars: { nums: nums.slice(), res: res.length },
          path: { items: [] },
          used: { items: [] },
          res: resView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);