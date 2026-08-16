(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc2-优化为一维01背包后-内层循环只能倒着遍历"] = {
    title: "2 优化为一维01背包后，内层循环只能倒着遍历。",
    language: "python",
    code: [
      "class Solution:",
      "    def canPartition(self, nums: List[int]) -> bool:",
      "        total = sum(nums)",
      "        if total % 2:",
      "            return False",
      "",
      "        target = total // 2",
      "",
      "        # dp[j] 表示能否选出和为 j 的子集",
      "        dp = [False] * (target + 1)",
      "        dp[0] = True  # 和为0总是可以",
      "",
      "        for num in nums:",
      "            # 必须从大到小遍历，避免重复使用同一个数",
      "            for j in range(target, num - 1, -1):",
      "                if dp[j - num]:",
      "                    dp[j] = True",
      "",
      "            # 提前结束",
      "            if dp[target]:",
      "                return True",
      "",
      "        return dp[target]"
    ].join("\n"),

    defaultInput: "nums = [1, 5, 11, 5]",
    inputHint: "每行一个变量，格式如 nums = [1, 5, 11, 5]",
    testInputs: ["nums = [1, 2, 5]", "nums = [1, 2, 3, 5]"],
    expectedOutputs: ["true", "false", "false"],

    views: {
      vars: { type: "vars", title: "变量" },
      dp: { type: "array", title: "dp" },
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
        line: 3, msg: "计算总和 total = " + total + "。",
        views: {
          vars: { total: total, target: null, num: null, j: null },
          nums: { items: nums.slice() },
          dp: { items: [] }
        }
      });

      if (total % 2 !== 0) {
        steps.push({
          line: 4, msg: "总和 " + total + " 是奇数，无法分成两个和相等的子集，返回 false。",
          views: {
            vars: { total: total, "total%2": total % 2 },
            nums: { items: nums.slice() },
            dp: { items: [] }
          }
        });
        return { steps: steps, output: "false" };
      }

      var target = total / 2;
      steps.push({
        line: 6, msg: "目标子集和 target = " + target + "。",
        views: {
          vars: { total: total, target: target, num: null, j: null },
          nums: { items: nums.slice() },
          dp: { items: [] }
        }
      });

      var dp = [];
      for (var i = 0; i <= target; i++) dp.push(false);
      dp[0] = true;

      steps.push({
        line: 9, msg: "初始化 dp 数组，长度 " + (target + 1) + "，dp[0] = true。",
        views: {
          vars: { total: total, target: target, num: null, j: null },
          nums: { items: nums.slice() },
          dp: { items: dp.slice(), highlights: [0], ok: [0] }
        }
      });

      for (var ni = 0; ni < nums.length; ni++) {
        var num = nums[ni];
        steps.push({
          line: 12, msg: "处理数字 num = " + num + "。",
          views: {
            vars: { total: total, target: target, num: num, j: null },
            nums: { items: nums.slice(), highlights: [ni] },
            dp: { items: dp.slice() }
          }
        });

        for (var j = target; j >= num; j--) {
          if (dp[j - num]) {
            dp[j] = true;
            steps.push({
              line: 15, msg: "dp[" + (j - num) + "] 为 true，所以 dp[" + j + "] 设为 true。",
              views: {
                vars: { total: total, target: target, num: num, j: j },
                nums: { items: nums.slice(), highlights: [ni] },
                dp: { items: dp.slice(), highlights: [j, j - num], ok: [j] }
              }
            });
          } else {
            steps.push({
              line: 14, msg: "dp[" + (j - num) + "] 为 false，dp[" + j + "] 保持不变。",
              views: {
                vars: { total: total, target: target, num: num, j: j },
                nums: { items: nums.slice(), highlights: [ni] },
                dp: { items: dp.slice(), highlights: [j, j - num] }
              }
            });
          }
        }

        if (dp[target]) {
          steps.push({
            line: 18, msg: "dp[" + target + "] 为 true，提前返回 true。",
            views: {
              vars: { total: total, target: target, num: num, j: null },
              nums: { items: nums.slice(), highlights: [ni] },
              dp: { items: dp.slice(), highlights: [target], ok: [target] }
            }
          });
          return { steps: steps, output: "true" };
        }
      }

      steps.push({
        line: 21, msg: "遍历结束，dp[" + target + "] = " + dp[target] + "，返回结果。",
        views: {
          vars: { total: total, target: target, num: null, j: null },
          nums: { items: nums.slice() },
          dp: { items: dp.slice(), highlights: [target] }
        }
      });
      return { steps: steps, output: dp[target] ? "true" : "false" };
    }
  };
})(typeof window !== "undefined" ? window : this);