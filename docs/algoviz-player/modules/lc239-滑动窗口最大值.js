(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc239-滑动窗口最大值"] = {
    title: "239 滑动窗口最大值 · 模拟",
    link: "https://leetcode.cn/problems/sliding-window-maximum/",
    language: "python",
    code: [
      "class Solution:",
      "    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:",
      "        # 方法一当然是模拟.",
      "        res, n = [], len(nums)",
      "        for i in range(n):",
      "            j = i + k",
      "            if j > n:",
      "                break",
      "            res.append(max(nums[i:j]))",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [1, 3, -1, -3, 5, 3, 6, 7]\nk = 3",
    inputHint: "每行一个变量，格式如 nums = [1, 3, -1, -3, 5, 3, 6, 7] / k = 3",

    testInputs: [
      "nums = [1]\nk = 1",
      "nums = [1, -1]\nk = 1"
    ],
    expectedOutputs: [
      "[3,3,5,5,6,7]",
      "[1]",
      "[1,-1]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      window: { type: "array", title: "当前窗口" },
      res: { type: "array", title: "结果 res" }
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
      if (typeof env.k !== "number" || env.k <= 0) throw new Error("缺少 k = 正整数");
      return env;
    },

    run: function (input) {
      var nums = input.nums, k = input.k;
      var steps = [];
      var res = [];

      steps.push({
        line: 3, msg: "开始：模拟法求滑动窗口最大值，窗口大小 k=" + k + "。",
        views: {
          vars: { k: k, i: null, j: null, n: nums.length },
          nums: { items: nums.slice() },
          window: { items: [] },
          res: { items: [] }
        }
      });

      var n = nums.length;
      steps.push({
        line: 4, msg: "初始化结果数组 res 为空，n = " + n + "。",
        views: {
          vars: { k: k, i: null, j: null, n: n },
          nums: { items: nums.slice() },
          window: { items: [] },
          res: { items: [] }
        }
      });

      for (var i = 0; i < n; i++) {
        var j = i + k;
        steps.push({
          line: 5, msg: "进入循环，i=" + i + "，计算 j = i + k = " + j + "。",
          views: {
            vars: { k: k, i: i, j: j, n: n },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            window: { items: [] },
            res: { items: res.slice() }
          }
        });

        if (j > n) {
          steps.push({
            line: 6, msg: "j=" + j + " 大于 n=" + n + "，窗口越界，跳出循环。",
            views: {
              vars: { k: k, i: i, j: j, n: n },
              nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
              window: { items: [] },
              res: { items: res.slice() }
            }
          });
          break;
        }

        var windowItems = nums.slice(i, j);
        var maxVal = Math.max.apply(null, windowItems);
        steps.push({
          line: 7, msg: "窗口 [" + i + ", " + (j - 1) + "] 为 [" + windowItems.join(", ") + "]，最大值是 " + maxVal + "，加入 res。",
          views: {
            vars: { k: k, i: i, j: j, n: n, "窗口最大值": maxVal },
            nums: { items: nums.slice(), highlights: [i, j - 1], pointers: { i: i, j: j - 1 } },
            window: { items: windowItems.slice(), highlights: [0] },
            res: { items: res.slice() }
          }
        });

        res.push(maxVal);
        steps.push({
          line: 7, msg: "res 现在为 [" + res.join(", ") + "]。",
          views: {
            vars: { k: k, i: i, j: j, n: n, "窗口最大值": maxVal },
            nums: { items: nums.slice(), highlights: [i, j - 1], pointers: { i: i, j: j - 1 } },
            window: { items: windowItems.slice(), highlights: [0] },
            res: { items: res.slice(), highlights: [res.length - 1] }
          }
        });
      }

      steps.push({
        line: 8, msg: "返回最终结果 [" + res.join(", ") + "]。",
        views: {
          vars: { k: k, i: i, j: j, n: n },
          nums: { items: nums.slice() },
          window: { items: [] },
          res: { items: res.slice(), ok: res.map(function (_, idx) { return idx; }) }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);