(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc560-和为-k-的子数组"] = {
    title: "560 和为 K 的子数组 · 暴力枚举",
    link: "https://leetcode.cn/problems/subarray-sum-equals-k/",
    language: "python",
    code: [
      "class Solution:",
      "    def subarraySum(self, nums: List[int], k: int) -> int:",
      "        n, res = len(nums), 0",
      "        for i in range(n):",
      "            for j in range(i, n):",
      "                if sum(nums[i:j+1]) == k:",
      "                    res += 1",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [1, 1, 1]\nk = 2",
    inputHint: "每行一个变量，格式如 nums = [1, 1, 1] / k = 2",
    testInputs: ["nums = [1, 2, 3]\nk = 3", "nums = [1]\nk = 0"],
    expectedOutputs: ["2", "2", "0"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      sub: { type: "array", title: "当前子数组" }
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
      if (typeof env.k !== "number") throw new Error("缺少 k = 数字");
      return env;
    },

    run: function (input) {
      var nums = input.nums, k = input.k;
      var steps = [];
      var n = nums.length, res = 0;

      steps.push({
        line: 3,
        msg: "初始化：数组长度 n=" + n + "，结果计数 res=0。",
        views: {
          vars: { n: n, res: res, i: null, j: null },
          nums: { items: nums.slice() },
          sub: { items: [], highlights: [] }
        }
      });

      for (var i = 0; i < n; i++) {
        steps.push({
          line: 4,
          msg: "外层循环：i=" + i + "，以 nums[" + i + "]=" + nums[i] + " 为子数组起点。",
          views: {
            vars: { n: n, res: res, i: i, j: null },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            sub: { items: [], highlights: [] }
          }
        });

        for (var j = i; j < n; j++) {
          var subArr = nums.slice(i, j + 1);
          var s = 0;
          for (var t = 0; t < subArr.length; t++) s += subArr[t];

          steps.push({
            line: 5,
            msg: "内层循环：j=" + j + "，子数组 nums[" + i + ":" + (j + 1) + "] = [" + subArr.join(", ") + "]，和为 " + s + "。",
            views: {
              vars: { n: n, res: res, i: i, j: j, "子数组和": s },
              nums: { items: nums.slice(), highlights: [i, j], pointers: { i: i, j: j } },
              sub: { items: subArr.slice(), highlights: [] }
            }
          });

          if (s === k) {
            res++;
            steps.push({
              line: 6,
              msg: "子数组和 " + s + " 等于 k=" + k + "，res 加 1，现在 res=" + res + "。",
              views: {
                vars: { n: n, res: res, i: i, j: j, "子数组和": s },
                nums: { items: nums.slice(), highlights: [i, j], ok: [i, j] },
                sub: { items: subArr.slice(), ok: [] }
              }
            });
          } else {
            steps.push({
              line: 6,
              msg: "子数组和 " + s + " 不等于 k=" + k + "，不计数。",
              views: {
                vars: { n: n, res: res, i: i, j: j, "子数组和": s },
                nums: { items: nums.slice(), highlights: [i, j] },
                sub: { items: subArr.slice() }
              }
            });
          }
        }
      }

      steps.push({
        line: 8,
        msg: "遍历结束，返回结果 res=" + res + "。",
        views: {
          vars: { n: n, res: res, i: n - 1, j: n - 1 },
          nums: { items: nums.slice() },
          sub: { items: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);