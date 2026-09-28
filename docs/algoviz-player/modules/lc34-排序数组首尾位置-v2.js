(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc34-排序数组首尾位置-v2"] = {
    title: "34 在排序数组中查找元素的第一个和最后一个位置",
    link: "https://leetcode.cn/problems/find-first-and-last-position-of-element-in-sorted-array/",
    language: "python",
    code: [
      "class Solution:",
      "    def search(self, nums: List[int], target: int) -> int:",
      "        left, right = 0, len(nums)",
      "        while left < right:",
      "            mid = (left + right) // 2",
      "            if nums[mid] == target:",
      "                return mid",
      "            if nums[left] <= nums[mid]: # 为了用下述条件判断target, 我们必须先找到有序区间",
      "                if nums[left] <= target < nums[mid]:      # mid已排除",
      "                    right = mid                           # mid已排除",
      "                else:",
      "                    left = mid + 1                        # mid已排除",
      "            else:",
      "                if nums[mid] < target <= nums[right - 1]: # mid已排除",
      "                    left = mid + 1                        # mid已排除",
      "                else:",
      "                    right = mid                           # mid已排除",
      "        return -1"
    ].join("\n"),

    defaultInput: "nums = [4, 5, 6, 7, 0, 1, 2]\ntarget = 0",
    inputHint: "每行一个变量，格式如 nums = [4, 5, 6, 7, 0, 1, 2] / target = 0",
    testInputs: [
      "nums = [1]\ntarget = 0",
      "nums = [4, 5, 6, 7, 0, 1, 2]\ntarget = 3"
    ],
    expectedOutputs: ["4", "-1", "-1"],

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
      var left = 0, right = nums.length;
      var mid = null;

      function rangeView() {
        var bars = [];
        for (var i = 0; i < nums.length; i++) {
          var status = "normal";
          if (i >= left && i < right) status = "active";
          bars.push({ start: i, end: i + 1, label: String(nums[i]), status: status });
        }
        return { bars: bars, highlights: mid != null ? [mid] : [], axis: { min: 0, max: nums.length, ticks: nums.length } };
      }

      function varsView(hot) {
        var o = { left: left, right: right, mid: mid };
        if (hot) o[hot] = { value: o[hot], __hot: true };
        return o;
      }

      steps.push({
        line: 3, msg: "初始化搜索区间：left=0，right=" + nums.length + "（左闭右开）。",
        views: {
          vars: varsView(),
          nums: { items: nums.slice(), showIndex: true },
          range: rangeView()
        }
      });

      while (left < right) {
        mid = Math.floor((left + right) / 2);
        steps.push({
          line: 5, msg: "计算中点 mid=" + mid + "（值 " + nums[mid] + "）。",
          views: {
            vars: varsView("mid"),
            nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid }, showIndex: true },
            range: rangeView()
          }
        });

        if (nums[mid] === target) {
          steps.push({
            line: 6, msg: "nums[" + mid + "]=" + nums[mid] + " 等于目标 " + target + "，直接返回下标 " + mid + "。",
            views: {
              vars: varsView(),
              nums: { items: nums.slice(), highlights: [mid], ok: [mid], pointers: { left: left, right: right, mid: mid }, showIndex: true },
              range: rangeView()
            }
          });
          return { steps: steps, output: JSON.stringify(mid) };
        }

        if (nums[left] <= nums[mid]) {
          steps.push({
            line: 8, msg: "左半段 [" + left + ", " + mid + "] 有序（" + nums[left] + " ≤ " + nums[mid] + "）。",
            views: {
              vars: varsView(),
              nums: { items: nums.slice(), highlights: [left, mid], pointers: { left: left, right: right, mid: mid }, showIndex: true },
              range: rangeView()
            }
          });
          if (nums[left] <= target && target < nums[mid]) {
            steps.push({
              line: 9, msg: "目标 " + target + " 在有序左半段内（" + nums[left] + " ≤ " + target + " < " + nums[mid] + "），收缩右边界到 mid。",
              views: {
                vars: varsView(),
                nums: { items: nums.slice(), highlights: [left, mid], pointers: { left: left, right: right, mid: mid }, showIndex: true },
                range: rangeView()
              }
            });
            right = mid;
            steps.push({
              line: 10, msg: "right = mid = " + right + "，搜索区间变为 [" + left + ", " + right + ")。",
              views: {
                vars: varsView("right"),
                nums: { items: nums.slice(), pointers: { left: left, right: right }, showIndex: true },
                range: rangeView()
              }
            });
          } else {
            steps.push({
              line: 12, msg: "目标 " + target + " 不在有序左半段内，收缩左边界到 mid+1。",
              views: {
                vars: varsView(),
                nums: { items: nums.slice(), highlights: [left, mid], pointers: { left: left, right: right, mid: mid }, showIndex: true },
                range: rangeView()
              }
            });
            left = mid + 1;
            steps.push({
              line: 13, msg: "left = mid + 1 = " + left + "，搜索区间变为 [" + left + ", " + right + ")。",
              views: {
                vars: varsView("left"),
                nums: { items: nums.slice(), pointers: { left: left, right: right }, showIndex: true },
                range: rangeView()
              }
            });
          }
        } else {
          steps.push({
            line: 15, msg: "右半段 [" + mid + ", " + right + ") 有序（" + nums[left] + " > " + nums[mid] + "）。",
            views: {
              vars: varsView(),
              nums: { items: nums.slice(), highlights: [mid, right - 1], pointers: { left: left, right: right, mid: mid }, showIndex: true },
              range: rangeView()
            }
          });
          if (nums[mid] < target && target <= nums[right - 1]) {
            steps.push({
              line: 16, msg: "目标 " + target + " 在有序右半段内（" + nums[mid] + " < " + target + " ≤ " + nums[right - 1] + "），收缩左边界到 mid+1。",
              views: {
                vars: varsView(),
                nums: { items: nums.slice(), highlights: [mid, right - 1], pointers: { left: left, right: right, mid: mid }, showIndex: true },
                range: rangeView()
              }
            });
            left = mid + 1;
            steps.push({
              line: 17, msg: "left = mid + 1 = " + left + "，搜索区间变为 [" + left + ", " + right + ")。",
              views: {
                vars: varsView("left"),
                nums: { items: nums.slice(), pointers: { left: left, right: right }, showIndex: true },
                range: rangeView()
              }
            });
          } else {
            steps.push({
              line: 19, msg: "目标 " + target + " 不在有序右半段内，收缩右边界到 mid。",
              views: {
                vars: varsView(),
                nums: { items: nums.slice(), highlights: [mid, right - 1], pointers: { left: left, right: right, mid: mid }, showIndex: true },
                range: rangeView()
              }
            });
            right = mid;
            steps.push({
              line: 20, msg: "right = mid = " + right + "，搜索区间变为 [" + left + ", " + right + ")。",
              views: {
                vars: varsView("right"),
                nums: { items: nums.slice(), pointers: { left: left, right: right }, showIndex: true },
                range: rangeView()
              }
            });
          }
        }
      }

      steps.push({
        line: 18, msg: "搜索区间为空（left=" + left + " ≥ right=" + right + "），未找到目标 " + target + "，返回 -1。",
        views: {
          vars: varsView(),
          nums: { items: nums.slice(), pointers: { left: left, right: right }, showIndex: true },
          range: rangeView()
        }
      });
      return { steps: steps, output: "-1" };
    }
  };
})(typeof window !== "undefined" ? window : this);