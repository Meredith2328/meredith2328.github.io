(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc189-轮转数组-v2"] = {
    title: "189 轮转数组 · 乘积除自身",
    language: "python",
    code: [
      "class Solution:",
      "    def productExceptSelf(self, nums: List[int]) -> List[int]:",
      "        n = len(nums)",
      "        res = [1] * n",
      "        for i in range(1, n):",
      "            res[i] = res[i - 1] * nums[i - 1]",
      "        R = 1",
      "        for i in range(n - 1, -1, -1):",
      "            res[i] *= R",
      "            R *= nums[i]",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [1, 2, 3, 4]",
    inputHint: "每行一个变量，格式如 nums = [1, 2, 3, 4]",
    testInputs: ["nums = [0, 1, 2]", "nums = [1]"],
    expectedOutputs: ["[24,12,8,6]", "[2,0,0]", "[1]"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      res: { type: "array", title: "res" }
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
        line: 3, msg: "开始：计算每个位置除自身以外所有元素的乘积。",
        views: {
          vars: { n: n, R: null, i: null },
          nums: { items: nums.slice() },
          res: { items: new Array(n).fill(1), showIndex: true }
        }
      });

      var res = new Array(n).fill(1);
      steps.push({
        line: 4, msg: "初始化结果数组 res，长度 " + n + "，全部填 1。",
        views: {
          vars: { n: n, R: null, i: null },
          nums: { items: nums.slice() },
          res: { items: res.slice(), showIndex: true }
        }
      });

      for (var i = 1; i < n; i++) {
        res[i] = res[i - 1] * nums[i - 1];
        steps.push({
          line: 5, msg: "前缀乘积：res[" + i + "] = res[" + (i - 1) + "] * nums[" + (i - 1) + "] = " + res[i] + "。",
          views: {
            vars: { n: n, R: null, i: i },
            nums: { items: nums.slice(), highlights: [i - 1] },
            res: { items: res.slice(), highlights: [i], showIndex: true }
          }
        });
      }

      var R = 1;
      steps.push({
        line: 7, msg: "初始化后缀乘积 R = 1。",
        views: {
          vars: { n: n, R: R, i: null },
          nums: { items: nums.slice() },
          res: { items: res.slice(), showIndex: true }
        }
      });

      for (i = n - 1; i >= 0; i--) {
        res[i] *= R;
        steps.push({
          line: 8, msg: "res[" + i + "] *= R，即 res[" + i + "] = " + res[i] + "。",
          views: {
            vars: { n: n, R: R, i: i },
            nums: { items: nums.slice(), highlights: [i] },
            res: { items: res.slice(), highlights: [i], showIndex: true }
          }
        });
        R *= nums[i];
        steps.push({
          line: 9, msg: "更新后缀乘积 R *= nums[" + i + "]，R = " + R + "。",
          views: {
            vars: { n: n, R: R, i: i },
            nums: { items: nums.slice(), highlights: [i] },
            res: { items: res.slice(), showIndex: true }
          }
        });
      }

      steps.push({
        line: 10, msg: "返回最终结果 res = [" + res.join(", ") + "]。",
        views: {
          vars: { n: n, R: R, i: -1 },
          nums: { items: nums.slice() },
          res: { items: res.slice(), ok: res.map(function (_, idx) { return idx; }), showIndex: true }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);