(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc283-移动零"] = {
    title: "283 移动零 · 双指针",
    link: "https://leetcode.cn/problems/move-zeroes/",
    language: "python",
    code: [
      "class Solution:",
      "    def moveZeroes(self, nums: List[int]) -> None:",
      "        \"\"\"",
      "        Do not return anything, modify nums in-place instead.",
      "        \"\"\"",
      "        sz = len(nums)",
      "        if sz == 1:",
      "            return",
      "        i, j = 0, sz - 1",
      "        while (i < j) and (i < sz) and (j >= 0):",
      "            while i < sz and nums[i] != 0:",
      "                i += 1",
      "            while j >= 0 and nums[j] == 0:",
      "                j -= 1",
      "            if i < j:",
      "                # 如果不需要保持其他元素的顺序, 把下面两行换成 nums[i], nums[j] = nums[j], nums[i]即可",
      "                nums.pop(i)",
      "                nums.append(0)"
    ].join("\n"),

    defaultInput: "nums = [0, 1, 0, 3, 12]",
    inputHint: "每行一个变量，格式如 nums = [0, 1, 0, 3, 12]",
    testInputs: ["nums = [0, 0, 1]", "nums = [1, 0]"],
    expectedOutputs: ["[1,3,12,0,0]", "[1,0,0]", "[1,0]"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" }
    },

    parseInput: function (text) {
      var env = {};
      text.split(/\n/).forEach(function (line) {
        var m = /^\s*([A-Za-z_]\w*)\s*=\s*(.+?)\s*$/.exec(line);
        if (!m) return;
        try { env[m[1]] = JSON.parse(m[2].replace(/'/g, '"')); }
        catch (e) { env[m[1]] = m[2]; }
      });
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...]");
      return env;
    },

    run: function (input) {
      var nums = input.nums.slice();
      var steps = [];
      var sz = nums.length;

      steps.push({
        line: 5, msg: "开始：数组长度为 " + sz + "。",
        views: {
          vars: { sz: sz, i: null, j: null },
          nums: { items: nums.slice() }
        }
      });

      if (sz === 1) {
        steps.push({
          line: 6, msg: "长度为 1，直接返回。",
          views: {
            vars: { sz: sz, i: null, j: null },
            nums: { items: nums.slice() }
          }
        });
        return { steps: steps, output: JSON.stringify(nums) };
      }

      var i = 0, j = sz - 1;
      steps.push({
        line: 8, msg: "初始化双指针：i=" + i + "（左），j=" + j + "（右）。",
        views: {
          vars: { sz: sz, i: i, j: j },
          nums: { items: nums.slice(), pointers: { i: i, j: j } }
        }
      });

      while ((i < j) && (i < sz) && (j >= 0)) {
        steps.push({
          line: 9, msg: "进入外层循环：i=" + i + "，j=" + j + "。",
          views: {
            vars: { sz: sz, i: i, j: j },
            nums: { items: nums.slice(), pointers: { i: i, j: j } }
          }
        });

        while (i < sz && nums[i] !== 0) {
          i++;
          steps.push({
            line: 11, msg: "左指针右移：i=" + i + "（跳过非零元素）。",
            views: {
              vars: { sz: sz, i: i, j: j },
              nums: { items: nums.slice(), pointers: { i: i, j: j } }
            }
          });
        }

        while (j >= 0 && nums[j] === 0) {
          j--;
          steps.push({
            line: 13, msg: "右指针左移：j=" + j + "（跳过零元素）。",
            views: {
              vars: { sz: sz, i: i, j: j },
              nums: { items: nums.slice(), pointers: { i: i, j: j } }
            }
          });
        }

        if (i < j) {
          steps.push({
            line: 15, msg: "找到一对：nums[" + i + "]=" + nums[i] + "（零）和 nums[" + j + "]=" + nums[j] + "（非零），交换。",
            views: {
              vars: { sz: sz, i: i, j: j },
              nums: { items: nums.slice(), highlights: [i, j], pointers: { i: i, j: j } }
            }
          });

          nums.splice(i, 1);
          nums.push(0);
          if (j > i) j--;

          steps.push({
            line: 17, msg: "执行 pop(i) 和 append(0)，数组变为 [" + nums.join(", ") + "]。",
            views: {
              vars: { sz: sz, i: i, j: j },
              nums: { items: nums.slice(), highlights: [i], pointers: { i: i, j: j } }
            }
          });
        }
      }

      steps.push({
        line: 9, msg: "循环结束，所有零已移到末尾。最终数组：[" + nums.join(", ") + "]。",
        views: {
          vars: { sz: sz, i: i, j: j },
          nums: { items: nums.slice() }
        }
      });

      return { steps: steps, output: JSON.stringify(nums) };
    }
  };
})(typeof window !== "undefined" ? window : this);