(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc189-轮转数组"] = {
    title: "189 轮转数组 · 切片拼接",
    link: "https://leetcode.cn/problems/rotate-array/",
    language: "python",
    code: [
      "class Solution:",
      "    def rotate(self, nums: List[int], k: int) -> None:",
      "        \"\"\"",
      "        Do not return anything, modify nums in-place instead.",
      "        \"\"\"",
      "        new_nums = []",
      "        mod_k = len(nums) - (k % len(nums))",
      "        for num in nums[mod_k:]:",
      "            new_nums.append(num)",
      "        for num in nums[:mod_k]:",
      "            new_nums.append(num)",
      "        for i, num in enumerate(new_nums):",
      "            nums[i] = num"
    ].join("\n"),

    defaultInput: "nums = [1, 2, 3, 4, 5, 6, 7]\nk = 3",
    inputHint: "每行一个变量，格式如 nums = [1, 2, 3, 4, 5, 6, 7] / k = 3",

    testInputs: [
      "nums = [-1, -100, 3, 99]\nk = 2",
      "nums = [1, 2]\nk = 3"
    ],
    expectedOutputs: ["[5,6,7,1,2,3,4]", "[3,99,-1,-100]", "[2,1]"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      new_nums: { type: "array", title: "new_nums" }
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
      var new_nums = [];

      steps.push({
        line: 2,
        msg: "开始：将数组 nums 向右轮转 " + k + " 步。",
        views: {
          vars: { k: k, mod_k: null, i: null, num: null },
          nums: { items: nums.slice() },
          new_nums: { items: [] }
        }
      });

      steps.push({
        line: 5,
        msg: "初始化新数组 new_nums 为空。",
        views: {
          vars: { k: k, mod_k: null, i: null, num: null },
          nums: { items: nums.slice() },
          new_nums: { items: [] }
        }
      });

      var mod_k = nums.length - (k % nums.length);
      steps.push({
        line: 6,
        msg: "计算分割点 mod_k = len(nums) - (k % len(nums)) = " + nums.length + " - (" + k + " % " + nums.length + ") = " + mod_k + "。",
        views: {
          vars: { k: k, mod_k: mod_k, i: null, num: null },
          nums: { items: nums.slice(), pointers: { mod_k: mod_k } },
          new_nums: { items: [] }
        }
      });

      // 第一部分：nums[mod_k:]
      for (var idx1 = mod_k; idx1 < nums.length; idx1++) {
        var num1 = nums[idx1];
        new_nums.push(num1);
        steps.push({
          line: 7,
          msg: "从 nums[" + mod_k + ":] 中取出 " + num1 + "，追加到 new_nums。",
          views: {
            vars: { k: k, mod_k: mod_k, i: null, num: num1 },
            nums: { items: nums.slice(), highlights: [idx1], pointers: { mod_k: mod_k } },
            new_nums: { items: new_nums.slice(), highlights: [new_nums.length - 1] }
          }
        });
      }

      // 第二部分：nums[:mod_k]
      for (var idx2 = 0; idx2 < mod_k; idx2++) {
        var num2 = nums[idx2];
        new_nums.push(num2);
        steps.push({
          line: 9,
          msg: "从 nums[:mod_k] 中取出 " + num2 + "，追加到 new_nums。",
          views: {
            vars: { k: k, mod_k: mod_k, i: null, num: num2 },
            nums: { items: nums.slice(), highlights: [idx2], pointers: { mod_k: mod_k } },
            new_nums: { items: new_nums.slice(), highlights: [new_nums.length - 1] }
          }
        });
      }

      // 第三部分：复制回 nums
      for (var i = 0; i < new_nums.length; i++) {
        var num3 = new_nums[i];
        nums[i] = num3;
        steps.push({
          line: 11,
          msg: "将 new_nums[" + i + "] = " + num3 + " 复制回 nums[" + i + "]。",
          views: {
            vars: { k: k, mod_k: mod_k, i: i, num: num3 },
            nums: { items: nums.slice(), highlights: [i], ok: [i] },
            new_nums: { items: new_nums.slice(), highlights: [i] }
          }
        });
      }

      steps.push({
        line: 11,
        msg: "轮转完成，nums 已原地修改为 [" + nums.join(", ") + "]。",
        views: {
          vars: { k: k, mod_k: mod_k, i: new_nums.length - 1, num: new_nums[new_nums.length - 1] },
          nums: { items: nums.slice(), ok: [i] },
          new_nums: { items: new_nums.slice() }
        }
      });

      return { steps: steps, output: JSON.stringify(nums) };
    }
  };
})(typeof window !== "undefined" ? window : this);