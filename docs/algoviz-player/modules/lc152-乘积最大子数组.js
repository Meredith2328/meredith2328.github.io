(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc152-乘积最大子数组"] = {
    title: "152 乘积最大子数组 · 动态规划",
    language: "python",
    code: [
      "class Solution:",
      "    def maxProduct(self, nums: List[int]) -> int:",
      "        # 到i的乘积最大值, 可能由**最大值或最小值**转移得到.",
      "        res = nums[0]",
      "        prev_max = prev_min = nums[0]",
      "",
      "        for i in range(1, len(nums)):",
      "            curr_max = max(nums[i], prev_max * nums[i], prev_min * nums[i])",
      "            curr_min = min(nums[i], prev_max * nums[i], prev_min * nums[i])",
      "            res = max(res, curr_max)",
      "            prev_max, prev_min = curr_max, curr_min",
      "",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [2, 3, -2, 4]",
    inputHint: "每行一个变量，格式如 nums = [2, 3, -2, 4]",
    testInputs: ["nums = [-2, 0, -1]", "nums = [0, 2]"],
    expectedOutputs: ["6", "0", "2"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      dp: { type: "array", title: "prev_max / prev_min" }
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

      steps.push({
        line: 2, msg: "开始：求数组的最大乘积子数组。",
        views: {
          vars: { res: null, prev_max: null, prev_min: null, i: null },
          nums: { items: nums.slice() },
          dp: { items: [], showIndex: true }
        }
      });

      if (n === 0) {
        steps.push({ line: 4, msg: "数组为空，返回 0。", views: { vars: { res: 0 } } });
        return { steps: steps, output: "0" };
      }

      var res = nums[0];
      var prev_max = nums[0];
      var prev_min = nums[0];

      steps.push({
        line: 4, msg: "初始化 res = nums[0] = " + nums[0] + "。",
        views: {
          vars: { res: res, prev_max: prev_max, prev_min: prev_min, i: null },
          nums: { items: nums.slice(), highlights: [0] },
          dp: { items: [prev_max, prev_min], highlights: [0, 1], showIndex: true }
        }
      });

      steps.push({
        line: 5, msg: "初始化 prev_max = prev_min = nums[0] = " + nums[0] + "。",
        views: {
          vars: { res: res, prev_max: prev_max, prev_min: prev_min, i: null },
          nums: { items: nums.slice(), highlights: [0] },
          dp: { items: [prev_max, prev_min], highlights: [0, 1], showIndex: true }
        }
      });

      for (var i = 1; i < n; i++) {
        var val = nums[i];
        var cand1 = prev_max * val;
        var cand2 = prev_min * val;
        var curr_max = Math.max(val, cand1, cand2);
        var curr_min = Math.min(val, cand1, cand2);

        steps.push({
          line: 7, msg: "i=" + i + "，当前元素 val=" + val + "。",
          views: {
            vars: { res: res, prev_max: prev_max, prev_min: prev_min, i: i, val: val },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            dp: { items: [prev_max, prev_min], highlights: [0, 1], showIndex: true }
          }
        });

        steps.push({
          line: 8, msg: "计算 curr_max = max(" + val + ", " + prev_max + "*" + val + ", " + prev_min + "*" + val + ") = " + curr_max + "。",
          views: {
            vars: { res: res, prev_max: prev_max, prev_min: prev_min, i: i, val: val, curr_max: curr_max },
            nums: { items: nums.slice(), highlights: [i] },
            dp: { items: [prev_max, prev_min], highlights: [0, 1], showIndex: true }
          }
        });

        steps.push({
          line: 9, msg: "计算 curr_min = min(" + val + ", " + prev_max + "*" + val + ", " + prev_min + "*" + val + ") = " + curr_min + "。",
          views: {
            vars: { res: res, prev_max: prev_max, prev_min: prev_min, i: i, val: val, curr_max: curr_max, curr_min: curr_min },
            nums: { items: nums.slice(), highlights: [i] },
            dp: { items: [prev_max, prev_min], highlights: [0, 1], showIndex: true }
          }
        });

        var old_res = res;
        res = Math.max(res, curr_max);
        steps.push({
          line: 10, msg: "更新 res = max(" + old_res + ", " + curr_max + ") = " + res + "。",
          views: {
            vars: { res: { value: res, __hot: true }, prev_max: prev_max, prev_min: prev_min, i: i, val: val, curr_max: curr_max, curr_min: curr_min },
            nums: { items: nums.slice(), highlights: [i] },
            dp: { items: [prev_max, prev_min], highlights: [0, 1], showIndex: true }
          }
        });

        prev_max = curr_max;
        prev_min = curr_min;
        steps.push({
          line: 11, msg: "更新 prev_max = " + prev_max + "，prev_min = " + prev_min + "。",
          views: {
            vars: { res: res, prev_max: { value: prev_max, __hot: true }, prev_min: { value: prev_min, __hot: true }, i: i, val: val },
            nums: { items: nums.slice(), highlights: [i] },
            dp: { items: [prev_max, prev_min], highlights: [0, 1], showIndex: true }
          }
        });
      }

      steps.push({
        line: 13, msg: "遍历结束，返回最大乘积 res = " + res + "。",
        views: {
          vars: { res: res, prev_max: prev_max, prev_min: prev_min, i: n - 1 },
          nums: { items: nums.slice() },
          dp: { items: [prev_max, prev_min], showIndex: true }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);