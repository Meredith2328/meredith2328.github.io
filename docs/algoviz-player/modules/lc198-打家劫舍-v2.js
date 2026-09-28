(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc198-打家劫舍-v2"] = {
    title: "198 打家劫舍 · 动态规划",
    link: "https://leetcode.cn/problems/house-robber/",
    language: "python",
    code: [
      "class Solution:",
      "    def rob(self, nums: List[int]) -> int:",
      "        if len(nums) == 1:",
      "            return nums[0]",
      "",
      "        prev2 = nums[0]",
      "        prev1 = max(nums[0], nums[1])",
      "        for i in range(2, len(nums)):",
      "            cur = max(prev2 + nums[i], prev1)",
      "            prev2 = prev1",
      "            prev1 = cur",
      "        return prev1"
    ].join("\n"),

    defaultInput: "nums = [2, 7, 9, 3, 1]",
    inputHint: "每行一个变量，格式如 nums = [2, 7, 9, 3, 1]",
    testInputs: [
      "nums = [1, 2, 3, 1]",
      "nums = [5]"
    ],
    expectedOutputs: [
      "12",
      "4",
      "5"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      dp: { type: "array", title: "DP 状态" }
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

      // 辅助：构造 dp 视图（只显示已计算的部分）
      var dpView = function (len, highlights, ok) {
        var items = [];
        for (var i = 0; i < len; i++) items.push(null);
        return { items: items, highlights: highlights || [], ok: ok || [] };
      };

      // 初始步骤
      steps.push({
        line: 2,
        msg: "开始：给定房屋金额数组 nums，求能偷到的最大金额（不能偷相邻两间）。",
        views: {
          vars: { n: n, prev2: null, prev1: null, i: null, cur: null },
          nums: { items: nums.slice() },
          dp: dpView(0)
        }
      });

      // 边界：len == 1
      if (n === 1) {
        steps.push({
          line: 3,
          msg: "只有一间房，直接返回 nums[0] = " + nums[0] + "。",
          views: {
            vars: { n: n, "返回值": nums[0] },
            nums: { items: nums.slice(), ok: [0] },
            dp: dpView(1, [], [0])
          }
        });
        return { steps: steps, output: JSON.stringify(nums[0]) };
      }

      // 初始化
      var prev2 = nums[0];
      var prev1 = Math.max(nums[0], nums[1]);

      steps.push({
        line: 5,
        msg: "初始化 prev2 = nums[0] = " + nums[0] + "（前 1 间房的最优解）。",
        views: {
          vars: { n: n, prev2: prev2, prev1: null, i: null, cur: null },
          nums: { items: nums.slice(), highlights: [0] },
          dp: dpView(1, [], [0])
        }
      });

      steps.push({
        line: 6,
        msg: "初始化 prev1 = max(nums[0], nums[1]) = max(" + nums[0] + ", " + nums[1] + ") = " + prev1 + "（前 2 间房的最优解）。",
        views: {
          vars: { n: n, prev2: prev2, prev1: prev1, i: null, cur: null },
          nums: { items: nums.slice(), highlights: [0, 1], ok: [0, 1] },
          dp: dpView(2, [], [0, 1])
        }
      });

      // 主循环
      for (var i = 2; i < n; i++) {
        steps.push({
          line: 7,
          msg: "进入循环，i = " + i + "，当前房屋金额 nums[" + i + "] = " + nums[i] + "。",
          views: {
            vars: { n: n, prev2: prev2, prev1: prev1, i: i, cur: null },
            nums: { items: nums.slice(), highlights: [i] },
            dp: dpView(i, [i])
          }
        });

        var cur = Math.max(prev2 + nums[i], prev1);
        steps.push({
          line: 8,
          msg: "计算 cur = max(prev2 + nums[i], prev1) = max(" + prev2 + " + " + nums[i] + ", " + prev1 + ") = " + cur + "。",
          views: {
            vars: { n: n, prev2: prev2, prev1: prev1, i: i, cur: cur },
            nums: { items: nums.slice(), highlights: [i] },
            dp: dpView(i + 1, [i], [i])
          }
        });

        steps.push({
          line: 9,
          msg: "更新 prev2 = prev1 = " + prev1 + "。",
          views: {
            vars: { n: n, prev2: prev1, prev1: prev1, i: i, cur: cur },
            nums: { items: nums.slice(), highlights: [i] },
            dp: dpView(i + 1, [i], [i])
          }
        });

        prev2 = prev1;
        steps.push({
          line: 10,
          msg: "更新 prev1 = cur = " + cur + "。",
          views: {
            vars: { n: n, prev2: prev2, prev1: cur, i: i, cur: cur },
            nums: { items: nums.slice(), highlights: [i] },
            dp: dpView(i + 1, [i], [i])
          }
        });
        prev1 = cur;
      }

      // 返回结果
      steps.push({
        line: 11,
        msg: "循环结束，返回 prev1 = " + prev1 + "，即最大偷窃金额。",
        views: {
          vars: { n: n, prev2: prev2, prev1: prev1, "返回值": prev1 },
          nums: { items: nums.slice() },
          dp: dpView(n, [], [n - 1])
        }
      });

      return { steps: steps, output: JSON.stringify(prev1) };
    }
  };
})(typeof window !== "undefined" ? window : this);