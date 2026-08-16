(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc34-在排序数组中查找元素的第一个和最后一个位置"] = {
    title: "34 在排序数组中查找元素的第一个和最后一个位置 · 二分查找",
    language: "python",
    code: [
      "class Solution:",
      "    def searchRange(self, nums: List[int], target: int) -> List[int]:",
      "        n = len(nums)",
      "        l = bisect.bisect_left(nums, target)",
      "        if l >= n or nums[l] != target:",
      "            return [-1, -1]",
      "        r = bisect.bisect_right(nums, target) - 1",
      "        return [l, r]"
    ].join("\n"),

    defaultInput: "nums = [5, 7, 7, 8, 8, 10]\ntarget = 8",
    inputHint: "每行一个变量，格式如 nums = [5, 7, 7, 8, 8, 10] / target = 8",

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      range: { type: "bars", title: "查找范围" }
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
      if (typeof env.target !== "number") throw new Error("缺少 target = 数字");
      return env;
    },

    run: function (input) {
      var nums = input.nums, target = input.target;
      var steps = [];
      var n = nums.length;

      // 模拟 bisect_left 和 bisect_right
      function bisectLeft(arr, x) {
        var lo = 0, hi = arr.length;
        while (lo < hi) {
          var mid = Math.floor((lo + hi) / 2);
          if (arr[mid] < x) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      function bisectRight(arr, x) {
        var lo = 0, hi = arr.length;
        while (lo < hi) {
          var mid = Math.floor((lo + hi) / 2);
          if (arr[mid] <= x) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      // 辅助：生成 bars 视图
      function barsView(highlightIdx) {
        var bars = [];
        for (var i = 0; i < nums.length; i++) {
          bars.push({ start: i, end: i + 1, label: String(nums[i]), status: (i === highlightIdx) ? "hi" : undefined });
        }
        return { bars: bars, axis: { min: 0, max: nums.length, ticks: nums.length } };
      }

      // 步骤 1：初始化
      steps.push({
        line: 3,
        msg: "开始：数组长度为 " + n + "，目标值为 " + target + "。",
        views: {
          vars: { n: n, l: null, r: null, target: target },
          nums: { items: nums.slice() },
          range: barsView(-1)
        }
      });

      // 步骤 2：计算 bisect_left
      var l = bisectLeft(nums, target);
      steps.push({
        line: 4,
        msg: "用二分查找找到第一个 >= " + target + " 的位置，得到 l = " + l + "。",
        views: {
          vars: { n: n, l: l, r: null, target: target },
          nums: { items: nums.slice(), highlights: [l] },
          range: barsView(l)
        }
      });

      // 步骤 3：检查是否找到
      if (l >= n || nums[l] !== target) {
        steps.push({
          line: 5,
          msg: "l = " + l + " 越界或 nums[" + l + "] = " + (l < n ? nums[l] : "无") + " != " + target + "，说明 target 不存在。",
          views: {
            vars: { n: n, l: l, r: null, target: target },
            nums: { items: nums.slice(), highlights: [l], bad: [l] },
            range: barsView(l)
          }
        });
        steps.push({
          line: 6,
          msg: "返回 [-1, -1]。",
          views: {
            vars: { "返回值": [-1, -1] },
            nums: { items: nums.slice() },
            range: barsView(-1)
          }
        });
        return { steps: steps, output: "[-1,-1]" };
      }

      // 步骤 4：计算 bisect_right
      var r = bisectRight(nums, target) - 1;
      steps.push({
        line: 7,
        msg: "用二分查找找到第一个 > " + target + " 的位置，减 1 得到 r = " + r + "。",
        views: {
          vars: { n: n, l: l, r: r, target: target },
          nums: { items: nums.slice(), highlights: [l, r], ok: [l, r] },
          range: barsView(r)
        }
      });

      // 步骤 5：返回结果
      steps.push({
        line: 8,
        msg: "返回 [" + l + ", " + r + "]。",
        views: {
          vars: { "返回值": [l, r] },
          nums: { items: nums.slice(), ok: [l, r] },
          range: barsView(-1)
        }
      });

      return { steps: steps, output: JSON.stringify([l, r]) };
    }
  };
})(typeof window !== "undefined" ? window : this);