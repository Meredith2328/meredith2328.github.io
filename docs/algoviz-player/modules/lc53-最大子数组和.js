(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc53-最大子数组和"] = {
    title: "53 最大子数组和 · 前缀和",
    link: "https://leetcode.cn/problems/maximum-subarray/",
    language: "python",
    code: [
      "class Solution:",
      "    def maxSubArray(self, nums: List[int]) -> int:",
      "        s = [0] * (len(nums) + 1)",
      "        for i, num in enumerate(nums):",
      "            s[i+1] = s[i] + num",
      "        maxval = -2147483647",
      "        minval = 2147483647",
      "        for i in range(1, len(nums) + 1):",
      "            if s[i-1] < minval:",
      "                minval = s[i-1]",
      "            val = s[i] - minval",
      "            if val > maxval:",
      "                maxval = val",
      "        return maxval"
    ].join("\n"),

    defaultInput: "nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
    inputHint: "每行一个变量，格式如 nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]",
    testInputs: ["nums = [1]", "nums = [-1, -2]"],
    expectedOutputs: ["6", "1", "-1"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      prefix: { type: "array", title: "前缀和 s" }
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
      var s = new Array(n + 1);
      s[0] = 0;

      steps.push({
        line: 3,
        msg: "初始化前缀和数组 s，长度为 " + (n + 1) + "，s[0]=0。",
        views: {
          vars: { i: null, num: null, s: s.slice(), maxval: null, minval: null, val: null },
          nums: { items: nums.slice() },
          prefix: { items: s.slice(), highlights: [0] }
        }
      });

      for (var i = 0; i < n; i++) {
        var num = nums[i];
        s[i + 1] = s[i] + num;
        steps.push({
          line: 5,
          msg: "计算前缀和 s[" + (i + 1) + "] = s[" + i + "] + " + num + " = " + s[i + 1] + "。",
          views: {
            vars: { i: i, num: num, s: s.slice(), maxval: null, minval: null, val: null },
            nums: { items: nums.slice(), highlights: [i] },
            prefix: { items: s.slice(), highlights: [i + 1], pointers: { i: i + 1 } }
          }
        });
      }

      var maxval = -2147483647;
      var minval = 2147483647;
      steps.push({
        line: 6,
        msg: "初始化 maxval 为极小值 " + maxval + "。",
        views: {
          vars: { i: null, num: null, s: s.slice(), maxval: maxval, minval: minval, val: null },
          nums: { items: nums.slice() },
          prefix: { items: s.slice() }
        }
      });
      steps.push({
        line: 7,
        msg: "初始化 minval 为极大值 " + minval + "。",
        views: {
          vars: { i: null, num: null, s: s.slice(), maxval: maxval, minval: minval, val: null },
          nums: { items: nums.slice() },
          prefix: { items: s.slice() }
        }
      });

      for (var i2 = 1; i2 <= n; i2++) {
        steps.push({
          line: 8,
          msg: "遍历 i=" + i2 + "，考虑以第 " + i2 + " 个元素结尾的子数组。",
          views: {
            vars: { i: i2, num: null, s: s.slice(), maxval: maxval, minval: minval, val: null },
            nums: { items: nums.slice(), highlights: [i2 - 1] },
            prefix: { items: s.slice(), highlights: [i2], pointers: { i: i2 } }
          }
        });

        if (s[i2 - 1] < minval) {
          minval = s[i2 - 1];
          steps.push({
            line: 9,
            msg: "s[" + (i2 - 1) + "]=" + s[i2 - 1] + " 比 minval 小，更新 minval=" + minval + "。",
            views: {
              vars: { i: i2, num: null, s: s.slice(), maxval: maxval, minval: minval, val: null },
              nums: { items: nums.slice(), highlights: [i2 - 1] },
              prefix: { items: s.slice(), highlights: [i2 - 1], ok: [i2 - 1] }
            }
          });
        } else {
          steps.push({
            line: 9,
            msg: "s[" + (i2 - 1) + "]=" + s[i2 - 1] + " 不小于 minval，minval 不变。",
            views: {
              vars: { i: i2, num: null, s: s.slice(), maxval: maxval, minval: minval, val: null },
              nums: { items: nums.slice(), highlights: [i2 - 1] },
              prefix: { items: s.slice(), highlights: [i2 - 1] }
            }
          });
        }

        var val = s[i2] - minval;
        steps.push({
          line: 10,
          msg: "计算以第 " + i2 + " 个元素结尾的最大子数组和 val = s[" + i2 + "] - minval = " + s[i2] + " - " + minval + " = " + val + "。",
          views: {
            vars: { i: i2, num: null, s: s.slice(), maxval: maxval, minval: minval, val: val },
            nums: { items: nums.slice(), highlights: [i2 - 1] },
            prefix: { items: s.slice(), highlights: [i2], ok: [i2] }
          }
        });

        if (val > maxval) {
          maxval = val;
          steps.push({
            line: 11,
            msg: "val=" + val + " 比 maxval 大，更新 maxval=" + maxval + "。",
            views: {
              vars: { i: i2, num: null, s: s.slice(), maxval: maxval, minval: minval, val: val },
              nums: { items: nums.slice(), highlights: [i2 - 1] },
              prefix: { items: s.slice(), highlights: [i2], ok: [i2] }
            }
          });
        } else {
          steps.push({
            line: 11,
            msg: "val=" + val + " 不大于 maxval，maxval 不变。",
            views: {
              vars: { i: i2, num: null, s: s.slice(), maxval: maxval, minval: minval, val: val },
              nums: { items: nums.slice(), highlights: [i2 - 1] },
              prefix: { items: s.slice(), highlights: [i2] }
            }
          });
        }
      }

      steps.push({
        line: 12,
        msg: "遍历结束，返回最大子数组和 " + maxval + "。",
        views: {
          vars: { i: null, num: null, s: s.slice(), maxval: maxval, minval: minval, val: null },
          nums: { items: nums.slice() },
          prefix: { items: s.slice() }
        }
      });

      return { steps: steps, output: JSON.stringify(maxval) };
    }
  };
})(typeof window !== "undefined" ? window : this);