(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc74-搜索二维矩阵-v2"] = {
    title: "74 搜索二维矩阵 · 二分查找",
    language: "python",
    code: [
      "class Solution:",
      "    def searchRange(self, nums: List[int], target: int) -> List[int]:",
      "        def find_boundary(is_left: bool):",
      "            left, right = 0, len(nums) - 1",
      "            pos = -1 # 精华",
      "            while left <= right:",
      "                mid = (left + right) // 2",
      "                if nums[mid] == target:",
      "                    pos = mid # 精华",
      "                    if is_left:",
      "                        right = mid - 1",
      "                    else:",
      "                        left = mid + 1",
      "                elif nums[mid] < target:",
      "                    left = mid + 1",
      "                else:",
      "                    right = mid - 1",
      "            return pos",
      "        return [find_boundary(True), find_boundary(False)]"
    ].join("\n"),

    defaultInput: "nums = [5, 7, 7, 8, 8, 10]\ntarget = 8",
    inputHint: "每行一个变量，格式如 nums = [5, 7, 7, 8, 8, 10] / target = 8",

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      callstack: { type: "callstack", title: "调用栈" }
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

      function findBoundary(isLeft) {
        var left = 0, right = nums.length - 1, pos = -1;
        var sideName = isLeft ? "左边界" : "右边界";
        steps.push({
          line: 4, msg: "开始查找" + sideName + "，初始化 left=0, right=" + right + ", pos=-1。",
          views: {
            vars: { "is_left": isLeft, "left": left, "right": right, "mid": null, "pos": pos },
            nums: { items: nums.slice(), highlights: [], pointers: { left: left, right: right } },
            callstack: { frames: ["find_boundary(" + isLeft + ")"] }
          }
        });

        while (left <= right) {
          var mid = Math.floor((left + right) / 2);
          steps.push({
            line: 7, msg: "计算 mid = (" + left + " + " + right + ") // 2 = " + mid + "。",
            views: {
              vars: { "is_left": isLeft, "left": left, "right": right, "mid": mid, "pos": pos },
              nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid } },
              callstack: { frames: ["find_boundary(" + isLeft + ")"] }
            }
          });

          if (nums[mid] === target) {
            pos = mid;
            steps.push({
              line: 9, msg: "nums[" + mid + "] = " + target + "，命中目标，更新 pos = " + mid + "。",
              views: {
                vars: { "is_left": isLeft, "left": left, "right": right, "mid": mid, "pos": pos },
                nums: { items: nums.slice(), highlights: [mid], ok: [mid], pointers: { left: left, right: right, mid: mid } },
                callstack: { frames: ["find_boundary(" + isLeft + ")"] }
              }
            });

            if (isLeft) {
              right = mid - 1;
              steps.push({
                line: 11, msg: "查找左边界，将 right 收缩到 mid-1 = " + right + "。",
                views: {
                  vars: { "is_left": isLeft, "left": left, "right": right, "mid": mid, "pos": pos },
                  nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid } },
                  callstack: { frames: ["find_boundary(" + isLeft + ")"] }
                }
              });
            } else {
              left = mid + 1;
              steps.push({
                line: 13, msg: "查找右边界，将 left 收缩到 mid+1 = " + left + "。",
                views: {
                  vars: { "is_left": isLeft, "left": left, "right": right, "mid": mid, "pos": pos },
                  nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid } },
                  callstack: { frames: ["find_boundary(" + isLeft + ")"] }
                }
              });
            }
          } else if (nums[mid] < target) {
            left = mid + 1;
            steps.push({
              line: 15, msg: "nums[" + mid + "] = " + nums[mid] + " < " + target + "，目标在右半部分，left = " + left + "。",
              views: {
                vars: { "is_left": isLeft, "left": left, "right": right, "mid": mid, "pos": pos },
                nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid } },
                callstack: { frames: ["find_boundary(" + isLeft + ")"] }
              }
            });
          } else {
            right = mid - 1;
            steps.push({
              line: 17, msg: "nums[" + mid + "] = " + nums[mid] + " > " + target + "，目标在左半部分，right = " + right + "。",
              views: {
                vars: { "is_left": isLeft, "left": left, "right": right, "mid": mid, "pos": pos },
                nums: { items: nums.slice(), highlights: [mid], pointers: { left: left, right: right, mid: mid } },
                callstack: { frames: ["find_boundary(" + isLeft + ")"] }
              }
            });
          }
        }

        steps.push({
          line: 18, msg: "循环结束，返回 pos = " + pos + "。",
          views: {
            vars: { "is_left": isLeft, "left": left, "right": right, "mid": null, "pos": pos },
            nums: { items: nums.slice(), pointers: { left: left, right: right } },
            callstack: { frames: ["find_boundary(" + isLeft + ")"] }
          }
        });
        return pos;
      }

      steps.push({
        line: 2, msg: "开始查找目标值 " + target + " 在数组中的左右边界。",
        views: {
          vars: { "target": target, "left": null, "right": null, "mid": null, "pos": null },
          nums: { items: nums.slice() },
          callstack: { frames: [] }
        }
      });

      var leftPos = findBoundary(true);
      var rightPos = findBoundary(false);

      steps.push({
        line: 19, msg: "左边界 = " + leftPos + "，右边界 = " + rightPos + "，返回 [" + leftPos + ", " + rightPos + "]。",
        views: {
          vars: { "左边界": leftPos, "右边界": rightPos, "返回值": [leftPos, rightPos] },
          nums: { items: nums.slice(), ok: leftPos !== -1 ? [leftPos, rightPos] : [] },
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify([leftPos, rightPos]) };
    }
  };
})(typeof window !== "undefined" ? window : this);