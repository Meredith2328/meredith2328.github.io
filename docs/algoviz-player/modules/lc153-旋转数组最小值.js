(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc153-旋转数组最小值"] = {
    title: "153 寻找旋转排序数组中的最小值 · 二分",
    link: "https://leetcode.cn/problems/find-minimum-in-rotated-sorted-array/",
    language: "python",
    code: [
      "class Solution:",
      "    def findMin(self, nums: List[int]) -> int:",
      "        l, r = 0, len(nums) - 1",
      "        minVal = nums[0]",
      "        while l <= r:",
      "            mid = (l + r) // 2",
      "            if nums[mid] < minVal:",
      "                minVal = min(minVal, nums[mid])",
      "            else:",
      "                if nums[l] <= nums[mid]:",
      "                    # 有序",
      "                    minVal = min(minVal, nums[l])",
      "                    l = mid + 1",
      "                else:",
      "                    minVal = min(minVal, nums[mid + 1])",
      "                    r = mid - 1",
      "        return minVal"
    ].join("\n"),

    defaultInput: "nums = [4, 5, 6, 7, 0, 1, 2]",
    inputHint: "每行一个变量，格式如 nums = [4, 5, 6, 7, 0, 1, 2]",
    testInputs: ["nums = [1]", "nums = [3, 4, 5, 1, 2]"],
    expectedOutputs: ["0", "1", "1"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      range: { type: "array", title: "搜索区间" }
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
      var l = 0, r = nums.length - 1;
      var minVal = nums[0];

      var rangeItems = function () {
        var items = [];
        for (var i = 0; i < nums.length; i++) {
          if (i >= l && i <= r) items.push(nums[i]);
          else items.push(null);
        }
        return items;
      };

      steps.push({
        line: 3, msg: "初始化左右指针 l=0, r=" + r + "，当前最小值 minVal=nums[0]=" + minVal + "。",
        views: {
          vars: { l: l, r: r, mid: null, minVal: minVal },
          nums: { items: nums.slice(), highlights: [0] },
          range: { items: rangeItems(), highlights: [0] }
        }
      });

      while (l <= r) {
        var mid = Math.floor((l + r) / 2);
        steps.push({
          line: 5, msg: "进入循环，计算中间位置 mid=" + mid + "。",
          views: {
            vars: { l: l, r: r, mid: mid, minVal: minVal },
            nums: { items: nums.slice(), highlights: [mid], pointers: { l: l, r: r, mid: mid } },
            range: { items: rangeItems(), highlights: [mid] }
          }
        });

        if (nums[mid] < minVal) {
          minVal = Math.min(minVal, nums[mid]);
          steps.push({
            line: 7, msg: "nums[mid]=" + nums[mid] + " 小于当前最小值，更新 minVal=" + minVal + "。",
            views: {
              vars: { l: l, r: r, mid: mid, minVal: { value: minVal, __hot: true } },
              nums: { items: nums.slice(), highlights: [mid], ok: [mid] },
              range: { items: rangeItems(), highlights: [mid] }
            }
          });
        } else {
          steps.push({
            line: 9, msg: "nums[mid]=" + nums[mid] + " 不小于 minVal，进入 else 分支。",
            views: {
              vars: { l: l, r: r, mid: mid, minVal: minVal },
              nums: { items: nums.slice(), highlights: [mid] },
              range: { items: rangeItems(), highlights: [mid] }
            }
          });

          if (nums[l] <= nums[mid]) {
            minVal = Math.min(minVal, nums[l]);
            steps.push({
              line: 12, msg: "左半部分有序（nums[l]=" + nums[l] + " <= nums[mid]=" + nums[mid] + "），更新 minVal=" + minVal + "，搜索右半部分。",
              views: {
                vars: { l: l, r: r, mid: mid, minVal: { value: minVal, __hot: true } },
                nums: { items: nums.slice(), highlights: [l, mid], ok: [l] },
                range: { items: rangeItems(), highlights: [l, mid] }
              }
            });
            l = mid + 1;
            steps.push({
              line: 13, msg: "l 移动到 mid+1=" + l + "。",
              views: {
                vars: { l: l, r: r, mid: mid, minVal: minVal },
                nums: { items: nums.slice(), pointers: { l: l, r: r } },
                range: { items: rangeItems() }
              }
            });
          } else {
            minVal = Math.min(minVal, nums[mid + 1]);
            steps.push({
              line: 16, msg: "右半部分有序（nums[l]=" + nums[l] + " > nums[mid]=" + nums[mid] + "），更新 minVal=" + minVal + "，搜索左半部分。",
              views: {
                vars: { l: l, r: r, mid: mid, minVal: { value: minVal, __hot: true } },
                nums: { items: nums.slice(), highlights: [mid + 1], ok: [mid + 1] },
                range: { items: rangeItems(), highlights: [mid + 1] }
              }
            });
            r = mid - 1;
            steps.push({
              line: 17, msg: "r 移动到 mid-1=" + r + "。",
              views: {
                vars: { l: l, r: r, mid: mid, minVal: minVal },
                nums: { items: nums.slice(), pointers: { l: l, r: r } },
                range: { items: rangeItems() }
              }
            });
          }
        }
      }

      steps.push({
        line: 17, msg: "循环结束，返回最小值 " + minVal + "。",
        views: {
          vars: { l: l, r: r, mid: null, minVal: { value: minVal, __hot: true } },
          nums: { items: nums.slice(), ok: [nums.indexOf(minVal)] },
          range: { items: rangeItems() }
        }
      });

      return { steps: steps, output: JSON.stringify(minVal) };
    }
  };
})(typeof window !== "undefined" ? window : this);