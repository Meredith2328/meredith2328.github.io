(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc53-最大子数组和-v2"] = {
    title: "53 最大子数组和 · 动态规划",
    link: "https://leetcode.cn/problems/maximum-subarray/",
    language: "python",
    code: [
      "class Solution:",
      "    def maxSubArray(self, nums: List[int]) -> int:",
      "        n = len(nums)",
      "        dp = [0] * (n + 1)",
      "        dp[0] = nums[0]",
      "        maxval = dp[0]",
      "",
      "        for i in range(1, n):",
      "            # 新元素一定被选择. 选择是是否包含前面的: 如果是拖油瓶(负值), 则轻装上阵.",
      "            dp[i] = max(dp[i-1]+nums[i], nums[i])",
      "            maxval = max(maxval, dp[i])",
      "        return maxval"
    ].join("\n"),

    defaultInput: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
    inputHint: "每行一个变量，格式如 nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
    testInputs: ["nums = [1]", "nums = [-1, -2]"],
    expectedOutputs: ["6", "1", "-1"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      dp: { type: "array", title: "dp" }
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
      var dp = new Array(n + 1);
      var maxval;

      steps.push({
        line: 3, msg: "计算数组长度 n = " + n + "。",
        views: {
          vars: { n: n, dp: null, maxval: null },
          nums: { items: nums.slice() },
          dp: { items: new Array(n + 1).fill(null), showIndex: true }
        }
      });

      dp[0] = nums[0];
      maxval = dp[0];
      steps.push({
        line: 5, msg: "初始化 dp[0] = nums[0] = " + nums[0] + "，maxval = dp[0] = " + maxval + "。",
        views: {
          vars: { n: n, dp: dp.slice(0, n + 1), maxval: maxval },
          nums: { items: nums.slice(), highlights: [0] },
          dp: { items: dp.slice(0, n + 1), highlights: [0], showIndex: true }
        }
      });

      for (var i = 1; i < n; i++) {
        steps.push({
          line: 7, msg: "进入循环，i = " + i + "，当前元素 nums[" + i + "] = " + nums[i] + "。",
          views: {
            vars: { n: n, i: i, dp: dp.slice(0, n + 1), maxval: maxval },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            dp: { items: dp.slice(0, n + 1), highlights: [i - 1], showIndex: true }
          }
        });

        var candidate1 = dp[i - 1] + nums[i];
        var candidate2 = nums[i];
        dp[i] = Math.max(candidate1, candidate2);
        steps.push({
          line: 8, msg: "dp[" + i + "] = max(dp[" + (i - 1) + "] + nums[" + i + "], nums[" + i + "]) = max(" + candidate1 + ", " + candidate2 + ") = " + dp[i] + "。",
          views: {
            vars: { n: n, i: i, dp: dp.slice(0, n + 1), maxval: maxval },
            nums: { items: nums.slice(), highlights: [i] },
            dp: { items: dp.slice(0, n + 1), highlights: [i], showIndex: true }
          }
        });

        var oldMax = maxval;
        maxval = Math.max(maxval, dp[i]);
        steps.push({
          line: 9, msg: "maxval = max(" + oldMax + ", dp[" + i + "]) = max(" + oldMax + ", " + dp[i] + ") = " + maxval + "。",
          views: {
            vars: { n: n, i: i, dp: dp.slice(0, n + 1), maxval: maxval },
            nums: { items: nums.slice(), highlights: [i] },
            dp: { items: dp.slice(0, n + 1), highlights: [i], showIndex: true }
          }
        });
      }

      steps.push({
        line: 10, msg: "循环结束，返回最大子数组和 maxval = " + maxval + "。",
        views: {
          vars: { n: n, dp: dp.slice(0, n + 1), maxval: maxval },
          nums: { items: nums.slice() },
          dp: { items: dp.slice(0, n + 1), showIndex: true }
        }
      });

      return { steps: steps, output: JSON.stringify(maxval) };
    }
  };
})(typeof window !== "undefined" ? window : this);