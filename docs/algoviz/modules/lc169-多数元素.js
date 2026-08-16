(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc169-多数元素"] = {
    title: "169 多数元素 · Boyer-Moore 投票",
    language: "python",
    code: [
      "class Solution:",
      "    def majorityElement(self, nums: List[int]) -> int:",
      "        count = 0",
      "        majority = -1",
      "        for num in nums:",
      "            if count == 0:",
      "                majority = num",
      "                count += 1",
      "            elif majority == num:",
      "                count += 1",
      "            else:",
      "                count -= 1",
      "        return majority"
    ].join("\n"),

    defaultInput: "nums = [2, 2, 1, 1, 1, 2, 2]",
    inputHint: "每行一个变量，格式如 nums = [2, 2, 1, 1, 1, 2, 2]",
    testInputs: ["nums = [3, 3, 4]", "nums = [1]"],
    expectedOutputs: ["2", "3", "1"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      vote: { type: "vars", title: "投票状态" }
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
      var count = 0;
      var majority = -1;

      steps.push({
        line: 3, msg: "初始化：count = 0，majority = -1（占位值）。",
        views: {
          vars: { count: count, majority: majority, num: null },
          nums: { items: nums.slice() },
          vote: { count: count, majority: majority }
        }
      });

      for (var i = 0; i < nums.length; i++) {
        var num = nums[i];
        steps.push({
          line: 5, msg: "遍历到下标 " + i + "，当前元素 num = " + num + "。",
          views: {
            vars: { count: count, majority: majority, num: num },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            vote: { count: count, majority: majority }
          }
        });

        if (count === 0) {
          steps.push({
            line: 6, msg: "count 为 0，重新设定 majority = " + num + "。",
            views: {
              vars: { count: count, majority: majority, num: num },
              nums: { items: nums.slice(), highlights: [i] },
              vote: { count: count, majority: majority }
            }
          });
          majority = num;
          count += 1;
          steps.push({
            line: 7, msg: "count 加 1，变为 " + count + "。",
            views: {
              vars: { count: { value: count, __hot: true }, majority: { value: majority, __hot: true }, num: num },
              nums: { items: nums.slice(), highlights: [i] },
              vote: { count: count, majority: majority }
            }
          });
        } else if (majority === num) {
          count += 1;
          steps.push({
            line: 8, msg: "num 与 majority 相同，count 加 1，变为 " + count + "。",
            views: {
              vars: { count: { value: count, __hot: true }, majority: majority, num: num },
              nums: { items: nums.slice(), highlights: [i] },
              vote: { count: count, majority: majority }
            }
          });
        } else {
          count -= 1;
          steps.push({
            line: 10, msg: "num 与 majority 不同，count 减 1，变为 " + count + "。",
            views: {
              vars: { count: { value: count, __hot: true }, majority: majority, num: num },
              nums: { items: nums.slice(), highlights: [i] },
              vote: { count: count, majority: majority }
            }
          });
        }
      }

      steps.push({
        line: 11, msg: "遍历结束，返回 majority = " + majority + "。",
        views: {
          vars: { count: count, majority: { value: majority, __hot: true } },
          nums: { items: nums.slice() },
          vote: { count: count, majority: majority }
        }
      });

      return { steps: steps, output: JSON.stringify(majority) };
    }
  };
})(typeof window !== "undefined" ? window : this);