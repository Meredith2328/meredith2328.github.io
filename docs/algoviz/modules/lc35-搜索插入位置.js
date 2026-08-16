(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc35-搜索插入位置"] = {
    title: "35 搜索插入位置 · 二分查找",
    language: "python",
    code: [
      "class Solution:",
      "    def searchInsert(self, nums: List[int], target: int) -> int:",
      "        return bisect.bisect_left(nums, target)"
    ].join("\n"),

    defaultInput: "nums = [1, 3, 5, 6]\ntarget = 5",
    inputHint: "每行一个变量，格式如 nums = [1, 3, 5, 6] / target = 5",

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      range: { type: "bars", title: "搜索区间" }
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
      var lo = 0, hi = n; // bisect_left 的搜索区间是 [lo, hi)

      // 辅助：生成 bars 视图（区间条）
      function barsView(loIdx, hiIdx, midIdx) {
        var bars = [];
        for (var i = 0; i < n; i++) {
          var status = "normal";
          if (i >= loIdx && i < hiIdx) status = "active";
          if (i === midIdx) status = "mid";
          bars.push({ start: i, end: i + 1, label: String(nums[i]), status: status });
        }
        var axis = { min: 0, max: n, ticks: [0, n] };
        return { bars: bars, highlights: midIdx != null ? [midIdx] : [], axis: axis };
      }

      // 初始步骤
      steps.push({
        line: 2, msg: "开始：在有序数组 nums 中查找 target=" + target + " 的插入位置。",
        views: {
          vars: { target: target, lo: lo, hi: hi, mid: null },
          nums: { items: nums.slice(), showIndex: true },
          range: barsView(lo, hi, null)
        }
      });

      // 模拟 bisect_left 的二分过程
      while (lo < hi) {
        var mid = Math.floor((lo + hi) / 2);
        steps.push({
          line: 2, msg: "计算中间位置 mid=" + mid + "（当前搜索区间 [" + lo + ", " + hi + ")）。",
          views: {
            vars: { target: target, lo: lo, hi: hi, mid: mid },
            nums: { items: nums.slice(), highlights: [mid], pointers: { lo: lo, hi: hi, mid: mid }, showIndex: true },
            range: barsView(lo, hi, mid)
          }
        });

        if (nums[mid] < target) {
          steps.push({
            line: 2, msg: "nums[" + mid + "]=" + nums[mid] + " < target=" + target + "，目标在右半部分，更新 lo=" + (mid + 1) + "。",
            views: {
              vars: { target: target, lo: lo, hi: hi, mid: mid },
              nums: { items: nums.slice(), highlights: [mid], pointers: { lo: lo, hi: hi, mid: mid }, showIndex: true },
              range: barsView(lo, hi, mid)
            }
          });
          lo = mid + 1;
        } else {
          steps.push({
            line: 2, msg: "nums[" + mid + "]=" + nums[mid] + " >= target=" + target + "，目标在左半部分（含 mid），更新 hi=" + mid + "。",
            views: {
              vars: { target: target, lo: lo, hi: hi, mid: mid },
              nums: { items: nums.slice(), highlights: [mid], pointers: { lo: lo, hi: hi, mid: mid }, showIndex: true },
              range: barsView(lo, hi, mid)
            }
          });
          hi = mid;
        }
      }

      // 结束步骤
      steps.push({
        line: 2, msg: "搜索结束，lo=hi=" + lo + "，这就是插入位置。",
        views: {
          vars: { target: target, lo: lo, hi: hi, mid: null, "返回值": lo },
          nums: { items: nums.slice(), ok: [lo], showIndex: true },
          range: barsView(lo, hi, null)
        }
      });

      return { steps: steps, output: JSON.stringify(lo) };
    }
  };
})(typeof window !== "undefined" ? window : this);