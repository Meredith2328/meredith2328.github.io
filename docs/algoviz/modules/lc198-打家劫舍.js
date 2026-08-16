(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc198-打家劫舍"] = {
    title: "198 打家劫舍 · 动态规划",
    language: "python",
    code: [
      "class Solution:",
      "    def rob(self, nums: List[int]) -> int:",
      "        if len(nums) == 1:",
      "            return nums[0]",
      "        dp = [0] * len(nums)",
      "        dp[0] = nums[0]",
      "        dp[1] = max(nums[0], nums[1])",
      "        for i in range(2, len(nums)):",
      "            dp[i] = max(dp[i - 2] + nums[i], dp[i - 1])",
      "        return dp[len(nums) - 1]"
    ].join("\n"),

    defaultInput: "nums = [2, 7, 9, 3, 1]",
    inputHint: "每行一个变量，格式如 nums = [2, 7, 9, 3, 1]",
    testInputs: ["nums = [1, 2]", "nums = [5]"],
    expectedOutputs: ["12", "2", "5"],

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

      // 边界情况：只有一个房子
      if (n === 1) {
        steps.push({
          line: 3, msg: "只有一个房子，直接返回它的金额 " + nums[0] + "。",
          views: {
            vars: { n: n, "返回值": nums[0] },
            nums: { items: nums.slice(), highlights: [0] },
            dp: { items: [] }
          }
        });
        return { steps: steps, output: JSON.stringify(nums[0]) };
      }

      // 初始化 dp 数组
      var dp = new Array(n);
      for (var k = 0; k < n; k++) dp[k] = 0;

      steps.push({
        line: 5, msg: "初始化 dp 数组，长度为 " + n + "，全部为 0。",
        views: {
          vars: { n: n, i: null },
          nums: { items: nums.slice() },
          dp: { items: dp.slice() }
        }
      });

      // dp[0] = nums[0]
      dp[0] = nums[0];
      steps.push({
        line: 6, msg: "dp[0] = nums[0] = " + nums[0] + "，只偷第一家。",
        views: {
          vars: { n: n, i: null, "dp[0]": dp[0] },
          nums: { items: nums.slice(), highlights: [0] },
          dp: { items: dp.slice(), highlights: [0] }
        }
      });

      // dp[1] = max(nums[0], nums[1])
      dp[1] = Math.max(nums[0], nums[1]);
      steps.push({
        line: 7, msg: "dp[1] = max(nums[0], nums[1]) = max(" + nums[0] + ", " + nums[1] + ") = " + dp[1] + "，前两家最多偷 " + dp[1] + "。",
        views: {
          vars: { n: n, i: null, "dp[0]": dp[0], "dp[1]": dp[1] },
          nums: { items: nums.slice(), highlights: [0, 1] },
          dp: { items: dp.slice(), highlights: [0, 1] }
        }
      });

      // 主循环
      for (var i = 2; i < n; i++) {
        steps.push({
          line: 8, msg: "开始计算 dp[" + i + "]：考虑第 " + i + " 家（金额 " + nums[i] + "）。",
          views: {
            vars: { n: n, i: i, "dp[i-2]": dp[i - 2], "dp[i-1]": dp[i - 1], "nums[i]": nums[i] },
            nums: { items: nums.slice(), highlights: [i] },
            dp: { items: dp.slice(), highlights: [i - 2, i - 1] }
          }
        });

        var take = dp[i - 2] + nums[i];
        var skip = dp[i - 1];
        dp[i] = Math.max(take, skip);

        steps.push({
          line: 9, msg: "dp[" + i + "] = max(dp[" + (i - 2) + "] + nums[" + i + "], dp[" + (i - 1) + "]) = max(" + take + ", " + skip + ") = " + dp[i] + "。",
          views: {
            vars: { n: n, i: i, "dp[i-2]": dp[i - 2], "dp[i-1]": dp[i - 1], "nums[i]": nums[i], "dp[i]": dp[i] },
            nums: { items: nums.slice(), highlights: [i] },
            dp: { items: dp.slice(), highlights: [i] }
          }
        });
      }

      var result = dp[n - 1];
      steps.push({
        line: 10, msg: "返回 dp[" + (n - 1) + "] = " + result + "，即最多能偷到的金额。",
        views: {
          vars: { n: n, "返回值": result },
          nums: { items: nums.slice() },
          dp: { items: dp.slice(), ok: [n - 1] }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);