(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc41-缺失的第一个正数"] = {
    title: "41 缺失的第一个正数 · 暴力查找",
    language: "python",
    code: [
      "class Solution:",
      "    def firstMissingPositive(self, nums: List[int]) -> int:",
      "        for i in range(1, len(nums) + 2):",
      "            if i not in nums:",
      "                return i"
    ].join("\n"),

    defaultInput: "nums = [3, 4, -1, 1]",
    inputHint: "每行一个变量，格式如 nums = [3, 4, -1, 1]",
    testInputs: ["nums = [1, 2, 0]", "nums = [7, 8, 9, 11, 12]"],
    expectedOutputs: ["2", "3", "1"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      check: { type: "vars", title: "检查" }
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
      var limit = n + 2;

      steps.push({
        line: 2,
        msg: "开始：寻找缺失的最小正整数。数组长度为 " + n + "，所以只需检查 1 到 " + (n + 1) + "。",
        views: {
          vars: { n: n, i: null },
          nums: { items: nums.slice() },
          check: {}
        }
      });

      for (var i = 1; i < limit; i++) {
        steps.push({
          line: 3,
          msg: "检查正整数 " + i + " 是否在数组中。",
          views: {
            vars: { n: n, i: i },
            nums: { items: nums.slice() },
            check: { "当前检查": i, "是否在数组中": null }
          }
        });

        var found = false;
        for (var j = 0; j < nums.length; j++) {
          if (nums[j] === i) {
            found = true;
            steps.push({
              line: 4,
              msg: i + " 在数组中（下标 " + j + "），继续检查下一个。",
              views: {
                vars: { n: n, i: i, j: j },
                nums: { items: nums.slice(), highlights: [j], ok: [j] },
                check: { "当前检查": i, "是否在数组中": "是" }
              }
            });
            break;
          }
        }

        if (!found) {
          steps.push({
            line: 4,
            msg: i + " 不在数组中，它就是缺失的最小正整数。",
            views: {
              vars: { n: n, i: i },
              nums: { items: nums.slice() },
              check: { "当前检查": i, "是否在数组中": "否" }
            }
          });
          steps.push({
            line: 5,
            msg: "返回 " + i + "。",
            views: {
              vars: { "返回值": i },
              nums: { items: nums.slice() },
              check: { "当前检查": i, "是否在数组中": "否" }
            }
          });
          return { steps: steps, output: JSON.stringify(i) };
        }
      }

      steps.push({
        line: 3,
        msg: "循环结束，所有 1 到 " + (n + 1) + " 都在数组中，返回 " + (n + 1) + "。",
        views: {
          vars: { n: n, i: limit },
          nums: { items: nums.slice() },
          check: {}
        }
      });
      return { steps: steps, output: JSON.stringify(n + 1) };
    }
  };
})(typeof window !== "undefined" ? window : this);