(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc416-分割等和子集"] = {
    title: "416 分割等和子集 · 动态规划",
    link: "https://leetcode.cn/problems/partition-equal-subset-sum/",
    language: "python",
    code: [
      "class Solution:",
      "    def canPartition(self, nums: List[int]) -> bool:",
      "        total = sum(nums)",
      "        if total % 2:",
      "            return False",
      "        target = total // 2",
      "        n = len(nums)",
      "",
      "        # 前i个元素和为target",
      "        dp = [[False] * (target + 1) for _ in range(n + 1)]",
      "        for i in range(n + 1):",
      "            dp[i][0] = True",
      "",
      "        for i in range(1, n + 1):",
      "            # 这里前i个元素, 实际要添加的元素是nums[i - 1]",
      "            for j in range(1, target + 1):",
      "                if j < nums[i - 1]:",
      "                    dp[i][j] = dp[i - 1][j]",
      "                else:",
      "                    dp[i][j] = dp[i - 1][j] or dp[i - 1][j - nums[i - 1]]",
      "",
      "        return dp[n][target]"
    ].join("\n"),

    defaultInput: "nums = [1, 5, 11, 5]",
    inputHint: "每行一个变量，格式如 nums = [1, 5, 11, 5]",
    testInputs: ["nums = [1, 2, 5]", "nums = [1, 2, 3, 4]"],
    expectedOutputs: ["true", "false", "true"],

    views: {
      vars: { type: "vars", title: "变量" },
      dp: { type: "grid", title: "dp 表" },
      nums: { type: "array", title: "nums" }
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
      var total = 0;
      for (var idx = 0; idx < nums.length; idx++) total += nums[idx];

      steps.push({
        line: 3, msg: "计算数组总和 total = " + total + "。",
        views: {
          vars: { total: total, target: null, n: null, i: null, j: null },
          nums: { items: nums.slice() },
          dp: { cells: [] }
        }
      });

      if (total % 2) {
        steps.push({
          line: 4, msg: "总和 " + total + " 是奇数，无法平分，返回 false。",
          views: {
            vars: { total: total, "total%2": total % 2 },
            nums: { items: nums.slice() },
            dp: { cells: [] }
          }
        });
        return { steps: steps, output: "false" };
      }

      var target = total / 2;
      var n = nums.length;
      steps.push({
        line: 5, msg: "target = " + target + "，n = " + n + "。",
        views: {
          vars: { total: total, target: target, n: n, i: null, j: null },
          nums: { items: nums.slice() },
          dp: { cells: [] }
        }
      });

      // 初始化 dp 表
      var dp = [];
      for (var i = 0; i <= n; i++) {
        dp.push([]);
        for (var j = 0; j <= target; j++) dp[i].push(false);
      }

      steps.push({
        line: 9, msg: "初始化 dp 表为 " + (n + 1) + " 行 × " + (target + 1) + " 列，全部为 false。",
        views: {
          vars: { total: total, target: target, n: n, i: null, j: null },
          nums: { items: nums.slice() },
          dp: { cells: dp.map(function (row) { return row.slice(); }) }
        }
      });

      for (i = 0; i <= n; i++) {
        dp[i][0] = true;
        steps.push({
          line: 10, msg: "dp[" + i + "][0] = true（前 " + i + " 个元素可以凑出和为 0）。",
          views: {
            vars: { total: total, target: target, n: n, i: i, j: 0 },
            nums: { items: nums.slice() },
            dp: { cells: dp.map(function (row) { return row.slice(); }), highlights: [[i, 0]], ok: [[i, 0]] }
          }
        });
      }

      for (i = 1; i <= n; i++) {
        var val = nums[i - 1];
        steps.push({
          line: 13, msg: "考虑前 " + i + " 个元素，当前要添加的元素是 nums[" + (i - 1) + "] = " + val + "。",
          views: {
            vars: { total: total, target: target, n: n, i: i, j: null, "nums[i-1]": val },
            nums: { items: nums.slice(), highlights: [i - 1] },
            dp: { cells: dp.map(function (row) { return row.slice(); }), highlights: [[i, 0]] }
          }
        });

        for (j = 1; j <= target; j++) {
          if (j < val) {
            dp[i][j] = dp[i - 1][j];
            steps.push({
              line: 15, msg: "j=" + j + " < " + val + "，dp[" + i + "][" + j + "] = dp[" + (i - 1) + "][" + j + "] = " + dp[i][j] + "。",
              views: {
                vars: { total: total, target: target, n: n, i: i, j: j, "nums[i-1]": val },
                nums: { items: nums.slice(), highlights: [i - 1] },
                dp: { cells: dp.map(function (row) { return row.slice(); }), highlights: [[i, j]], ok: [[i, j]] }
              }
            });
          } else {
            dp[i][j] = dp[i - 1][j] || dp[i - 1][j - val];
            steps.push({
              line: 17, msg: "j=" + j + " ≥ " + val + "，dp[" + i + "][" + j + "] = dp[" + (i - 1) + "][" + j + "] 或 dp[" + (i - 1) + "][" + (j - val) + "] = " + dp[i][j] + "。",
              views: {
                vars: { total: total, target: target, n: n, i: i, j: j, "nums[i-1]": val },
                nums: { items: nums.slice(), highlights: [i - 1] },
                dp: { cells: dp.map(function (row) { return row.slice(); }), highlights: [[i, j]], ok: [[i, j]] }
              }
            });
          }
        }
      }

      var result = dp[n][target];
      steps.push({
        line: 20, msg: "最终结果 dp[" + n + "][" + target + "] = " + result + "，返回 " + result + "。",
        views: {
          vars: { total: total, target: target, n: n, i: n, j: target, "结果": result },
          nums: { items: nums.slice() },
          dp: { cells: dp.map(function (row) { return row.slice(); }), highlights: [[n, target]], ok: [[n, target]] }
        }
      });

      return { steps: steps, output: result ? "true" : "false" };
    }
  };
})(typeof window !== "undefined" ? window : this);