(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc55-跳跃游戏"] = {
    title: "55 跳跃游戏 · 贪心",
    link: "https://leetcode.cn/problems/jump-game/",
    language: "python",
    code: [
      "class Solution:",
      "    def canJump(self, nums: List[int]) -> bool:",
      "        maxReach = 0",
      "        for i in range(len(nums)):",
      "            if maxReach < i:",
      "                return False",
      "            maxReach = max(maxReach, i + nums[i])",
      "            if maxReach >= len(nums) - 1:",
      "                return True",
      "        return maxReach >= len(nums) - 1"
    ].join("\n"),

    defaultInput: "nums = [2, 3, 1, 1, 4]",
    inputHint: "每行一个变量，格式如 nums = [2, 3, 1, 1, 4]",
    testInputs: ["nums = [3, 2, 1, 0, 4]", "nums = [0]"],
    expectedOutputs: ["true", "false", "true"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      reach: { type: "bars", title: "可达范围" }
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
      var n = nums.length;
      var maxReach = 0;

      var reachBars = function (hotIdx) {
        var bars = [];
        for (var j = 0; j < n; j++) {
          var status = undefined;
          if (j === hotIdx) status = "hi";
          else if (j <= maxReach) status = "ok";
          bars.push({ start: j, end: j + 1, label: String(nums[j]), status: status });
        }
        return { bars: bars, axis: { min: 0, max: n, ticks: n } };
      };

      steps.push({
        line: 3, msg: "初始化 maxReach = 0，表示当前能到达的最远下标。",
        views: {
          vars: { maxReach: 0, i: null },
          nums: { items: nums.slice() },
          reach: reachBars()
        }
      });

      for (var i = 0; i < n; i++) {
        steps.push({
          line: 4, msg: "遍历到下标 i=" + i + "。",
          views: {
            vars: { maxReach: maxReach, i: i },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            reach: reachBars()
          }
        });

        if (maxReach < i) {
          steps.push({
            line: 5, msg: "maxReach=" + maxReach + " < i=" + i + "，无法到达当前位置，返回 false。",
            views: {
              vars: { maxReach: maxReach, i: i },
              nums: { items: nums.slice(), highlights: [i], bad: [i] },
              reach: reachBars()
            }
          });
          steps.push({
            line: 6, msg: "返回 false：无法跳到终点。",
            views: {
              vars: { "返回值": false },
              nums: { items: nums.slice(), bad: [i] },
              reach: reachBars()
            }
          });
          return { steps: steps, output: "false" };
        }

        var newReach = i + nums[i];
        var oldReach = maxReach;
        maxReach = Math.max(maxReach, newReach);
        steps.push({
          line: 7, msg: "更新 maxReach：max(" + oldReach + ", " + i + "+" + nums[i] + ") = " + maxReach + "。",
          views: {
            vars: { maxReach: { value: maxReach, __hot: true }, i: i, "i+nums[i]": newReach },
            nums: { items: nums.slice(), highlights: [i] },
            reach: reachBars(i)
          }
        });

        if (maxReach >= n - 1) {
          steps.push({
            line: 8, msg: "maxReach=" + maxReach + " >= 最后下标 " + (n - 1) + "，可以到达终点，返回 true。",
            views: {
              vars: { maxReach: maxReach, i: i },
              nums: { items: nums.slice(), highlights: [i], ok: [i] },
              reach: reachBars()
            }
          });
          steps.push({
            line: 9, msg: "返回 true：可以跳到终点。",
            views: {
              vars: { "返回值": true },
              nums: { items: nums.slice(), ok: [i] },
              reach: reachBars()
            }
          });
          return { steps: steps, output: "true" };
        }
      }

      steps.push({
        line: 10, msg: "循环结束，最终判断 maxReach=" + maxReach + " 是否 >= " + (n - 1) + "。",
        views: {
          vars: { maxReach: maxReach, i: n - 1 },
          nums: { items: nums.slice() },
          reach: reachBars()
        }
      });
      var result = maxReach >= n - 1;
      steps.push({
        line: 10, msg: "返回 " + result + "。",
        views: {
          vars: { "返回值": result },
          nums: { items: nums.slice() },
          reach: reachBars()
        }
      });
      return { steps: steps, output: result ? "true" : "false" };
    }
  };
})(typeof window !== "undefined" ? window : this);