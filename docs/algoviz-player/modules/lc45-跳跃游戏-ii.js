(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc45-跳跃游戏-ii"] = {
    title: "45 跳跃游戏 II · 动态规划",
    language: "python",
    code: [
      "class Solution:",
      "    def jump(self, nums: List[int]) -> int:",
      "        minStep = [float('inf')] * len(nums)",
      "        minStep[-1] = 0",
      "        for i in range(len(nums) - 2, -1, -1):",
      "            # 对于某个下标i, 遍历它可达的所有下标, 选取其中跳跃到最后下标的最小值.",
      "            for j in range(i + 1, min(len(nums), i + nums[i] + 1)):",
      "                minStep[i] = min(minStep[i], minStep[j] + 1)",
      "        return minStep[0]"
    ].join("\n"),

    defaultInput: "nums = [2, 3, 1, 1, 4]",
    inputHint: "每行一个变量，格式如 nums = [2, 3, 1, 1, 4]",
    testInputs: ["nums = [1, 2, 3]", "nums = [0]"],
    expectedOutputs: ["2", "2", "0"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      dp: { type: "array", title: "minStep" }
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
      var n = nums.length;
      var steps = [];
      var INF = Infinity;

      var minStep = [];
      for (var k = 0; k < n; k++) minStep.push(INF);

      var dpView = function (hotIdx) {
        var items = minStep.map(function (v) {
          return v === INF ? "∞" : v;
        });
        var view = { items: items };
        if (hotIdx != null) view.highlights = [hotIdx];
        return view;
      };

      steps.push({
        line: 3,
        msg: "初始化 minStep 数组，长度为 " + n + "，全部设为无穷大。",
        views: {
          vars: { n: n, i: null, j: null },
          nums: { items: nums.slice() },
          dp: dpView()
        }
      });

      minStep[n - 1] = 0;
      steps.push({
        line: 4,
        msg: "最后一个位置到自己的最小步数为 0。",
        views: {
          vars: { n: n, i: null, j: null },
          nums: { items: nums.slice() },
          dp: dpView(n - 1)
        }
      });

      for (var i = n - 2; i >= 0; i--) {
        steps.push({
          line: 5,
          msg: "从后往前处理，当前下标 i=" + i + "，nums[" + i + "]=" + nums[i] + "。",
          views: {
            vars: { n: n, i: i, j: null },
            nums: { items: nums.slice(), highlights: [i] },
            dp: dpView()
          }
        });

        var limit = Math.min(n, i + nums[i] + 1);
        var j;
        for (j = i + 1; j < limit; j++) {
          steps.push({
            line: 7,
            msg: "检查从 i=" + i + " 跳到 j=" + j + "（minStep[" + j + "]=" + (minStep[j] === INF ? "∞" : minStep[j]) + "）。",
            views: {
              vars: { n: n, i: i, j: j, "可达范围": limit - 1 },
              nums: { items: nums.slice(), highlights: [i], pointers: { i: i, j: j } },
              dp: dpView(j)
            }
          });

          var candidate = minStep[j] + 1;
          if (candidate < minStep[i]) {
            minStep[i] = candidate;
            steps.push({
              line: 8,
              msg: "更新 minStep[" + i + "] = " + candidate + "（经由 j=" + j + "）。",
              views: {
                vars: { n: n, i: i, j: j, "候选值": candidate },
                nums: { items: nums.slice(), highlights: [i] },
                dp: dpView(i)
              }
            });
          } else {
            steps.push({
              line: 8,
              msg: "候选值 " + candidate + " 不小于当前 minStep[" + i + "]=" + minStep[i] + "，不更新。",
              views: {
                vars: { n: n, i: i, j: j, "候选值": candidate },
                nums: { items: nums.slice(), highlights: [i] },
                dp: dpView(i)
              }
            });
          }
        }

        if (nums[i] === 0) {
          steps.push({
            line: 6,
            msg: "nums[" + i + "]=" + nums[i] + "，无法跳到任何位置，minStep[" + i + "] 保持 ∞。",
            views: {
              vars: { n: n, i: i, j: null },
              nums: { items: nums.slice(), highlights: [i] },
              dp: dpView(i)
            }
          });
        }
      }

      steps.push({
        line: 9,
        msg: "计算完成，返回 minStep[0] = " + minStep[0] + "。",
        views: {
          vars: { n: n, i: -1, j: null },
          nums: { items: nums.slice() },
          dp: dpView(0)
        }
      });

      return { steps: steps, output: JSON.stringify(minStep[0]) };
    }
  };
})(typeof window !== "undefined" ? window : this);