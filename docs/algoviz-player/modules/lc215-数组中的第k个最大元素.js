(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc215-数组中的第k个最大元素"] = {
    title: "215 数组中的第K个最大元素 · 排序",
    language: "python",
    code: [
      "class Solution:",
      "    def findKthLargest(self, nums: List[int], k: int) -> int:",
      "        nums.sort()",
      "        return nums[-k]"
    ].join("\n"),

    defaultInput: "nums = [3, 2, 1, 5, 6, 4]\nk = 2",
    inputHint: "每行一个变量，格式如 nums = [3, 2, 1, 5, 6, 4] / k = 2",
    testInputs: [
      "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6]\nk = 4",
      "nums = [1]\nk = 1"
    ],
    expectedOutputs: ["5", "4", "1"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      sorted: { type: "array", title: "排序后的 nums" }
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
      var nums = input.nums.slice();
      var k = input.k;
      var steps = [];
      var n = nums.length;

      steps.push({
        line: 2,
        msg: "开始：在数组 nums 中找第 " + k + " 大的元素。",
        views: {
          vars: { k: k, n: n, "返回值": null },
          nums: { items: nums.slice(), showIndex: true },
          sorted: { items: [], showIndex: true }
        }
      });

      // 模拟 Python 的 nums.sort()（升序）
      var sortedNums = nums.slice().sort(function (a, b) { return a - b; });

      // 逐步展示排序过程（简单插入排序，便于可视化）
      var arr = nums.slice();
      for (var i = 1; i < n; i++) {
        var key = arr[i];
        var j = i - 1;
        steps.push({
          line: 3,
          msg: "排序中：将第 " + i + " 个元素 " + key + " 插入到已排序部分。",
          views: {
            vars: { k: k, n: n, "排序位置": i },
            nums: { items: arr.slice(), highlights: [i], showIndex: true },
            sorted: { items: arr.slice(0, i), showIndex: true }
          }
        });
        while (j >= 0 && arr[j] > key) {
          arr[j + 1] = arr[j];
          j--;
        }
        arr[j + 1] = key;
        steps.push({
          line: 3,
          msg: "排序中：插入完成，当前数组为 [" + arr.join(", ") + "]。",
          views: {
            vars: { k: k, n: n, "排序位置": i },
            nums: { items: arr.slice(), highlights: [i], showIndex: true },
            sorted: { items: arr.slice(0, i + 1), showIndex: true }
          }
        });
      }

      steps.push({
        line: 3,
        msg: "排序完成，数组已升序排列。",
        views: {
          vars: { k: k, n: n },
          nums: { items: arr.slice(), showIndex: true },
          sorted: { items: arr.slice(), showIndex: true }
        }
      });

      var result = arr[n - k];
      steps.push({
        line: 4,
        msg: "返回 nums[-k] = nums[" + (n - k) + "] = " + result + "，即第 " + k + " 大的元素。",
        views: {
          vars: { k: k, n: n, "返回值": result },
          nums: { items: arr.slice(), highlights: [n - k], ok: [n - k], showIndex: true },
          sorted: { items: arr.slice(), highlights: [n - k], ok: [n - k], showIndex: true }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);