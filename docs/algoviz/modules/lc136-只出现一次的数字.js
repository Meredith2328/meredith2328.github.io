(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc136-只出现一次的数字"] = {
    title: "136 只出现一次的数字",
    language: "python",
    code: [
      "class Solution:",
      "    def singleNumber(self, nums: List[int]) -> int:",
      "        res = 0",
      "        for num in nums:",
      "            res ^= num",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [2, 2, 1]",
    inputHint: "每行一个变量，格式如 nums = [2, 2, 1]",
    testInputs: [
      "nums = [4, 1, 2, 1, 2]",
      "nums = [1]"
    ],
    expectedOutputs: ["1", "4", "1"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" }
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
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...]，例如 nums = [2, 2, 1]");
      return env;
    },

    run: function (input) {
      var nums = input.nums;
      var steps = [];
      var res = 0;

      steps.push({
        line: 3,
        msg: "初始化结果变量 res = 0。",
        views: {
          vars: { res: 0, num: null },
          nums: { items: nums.slice(), highlights: [] }
        }
      });

      for (var i = 0; i < nums.length; i++) {
        var num = nums[i];
        steps.push({
          line: 4,
          msg: "进入循环，取到第 " + (i + 1) + " 个元素 num = " + num + "。",
          views: {
            vars: { res: res, num: num },
            nums: { items: nums.slice(), highlights: [i] }
          }
        });

        var oldRes = res;
        res ^= num;
        steps.push({
          line: 5,
          msg: "res ^= num，即 " + oldRes + " ^ " + num + " = " + res + "，异或结果存入 res。",
          views: {
            vars: { res: { value: res, __hot: true }, num: num },
            nums: { items: nums.slice(), highlights: [i] }
          }
        });
      }

      steps.push({
        line: 6,
        msg: "循环结束，res 中只剩下只出现一次的元素，返回 " + res + "。",
        views: {
          vars: { res: res, num: null },
          nums: { items: nums.slice(), highlights: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);