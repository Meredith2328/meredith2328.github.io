(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc41-缺失的第一个正数-v2"] = {
    title: "41 缺失的第一个正数 · 原地哈希",
    language: "python",
    code: [
      "class Solution:",
      "    def firstMissingPositive(self, nums: List[int]) -> int:",
      "        n = len(nums)",
      "        # 清除负值",
      "        for i in range(n):",
      "            if nums[i] <= 0:",
      "                nums[i] = n + 1",
      "",
      "        # 利用正值进行负值哈希",
      "        for i in range(n):",
      "            num = abs(nums[i])",
      "            if num <= n:",
      "                nums[num - 1] = -abs(nums[num - 1])",
      "",
      "        # 第一个不是负值",
      "        for i in range(n):",
      "            if nums[i] > 0:",
      "                return i + 1",
      "",
      "        # 按顺序全部有, 那就肯定是更大的",
      "        return n + 1"
    ].join("\n"),

    defaultInput: "nums = [3, 4, -1, 1]",
    inputHint: "每行一个变量，格式如 nums = [3, 4, -1, 1]",
    testInputs: ["nums = [1, 2, 0]", "nums = [7, 8, 9, 11, 12]"],
    expectedOutputs: ["2", "3", "1"],

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
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...]");
      return env;
    },

    run: function (input) {
      var nums = input.nums.slice();
      var n = nums.length;
      var steps = [];

      var numsView = function (highlights, ok, bad, pointers) {
        return {
          items: nums.slice(),
          highlights: highlights || [],
          ok: ok || [],
          bad: bad || [],
          pointers: pointers || {},
          showIndex: true
        };
      };

      steps.push({
        line: 3, msg: "开始：数组长度为 n=" + n + "，目标是找到缺失的最小正整数。",
        views: {
          vars: { n: n, i: null, num: null },
          nums: numsView()
        }
      });

      // 第一轮：清除负值
      for (var i = 0; i < n; i++) {
        steps.push({
          line: 5, msg: "第一轮：检查下标 i=" + i + "，当前值 nums[" + i + "]=" + nums[i] + "。",
          views: {
            vars: { n: n, i: i, num: null },
            nums: numsView([i], [], [], { i: i })
          }
        });
        if (nums[i] <= 0) {
          nums[i] = n + 1;
          steps.push({
            line: 6, msg: "nums[" + i + "]=" + nums[i] + " <= 0，将其替换为 n+1=" + (n + 1) + "（哨兵值）。",
            views: {
              vars: { n: n, i: i, num: null },
              nums: numsView([i], [], [i], { i: i })
            }
          });
        }
      }

      // 第二轮：负值哈希
      for (var i2 = 0; i2 < n; i2++) {
        var num = Math.abs(nums[i2]);
        steps.push({
          line: 9, msg: "第二轮：i=" + i2 + "，取绝对值 num=|nums[" + i2 + "]|=" + num + "。",
          views: {
            vars: { n: n, i: i2, num: num },
            nums: numsView([i2], [], [], { i: i2 })
          }
        });
        if (num <= n) {
          var idx = num - 1;
          var oldVal = nums[idx];
          nums[idx] = -Math.abs(nums[idx]);
          steps.push({
            line: 10, msg: "num=" + num + " 在有效范围 [1, n] 内，将 nums[" + idx + "] 置为负：-" + Math.abs(oldVal) + "。",
            views: {
              vars: { n: n, i: i2, num: num, "标记下标": idx },
              nums: numsView([idx], [], [], { i: i2, "标记": idx })
            }
          });
        } else {
          steps.push({
            line: 10, msg: "num=" + num + " 超出范围 [1, n]，跳过。",
            views: {
              vars: { n: n, i: i2, num: num },
              nums: numsView([i2], [], [], { i: i2 })
            }
          });
        }
      }

      // 第三轮：找第一个正数
      for (var i3 = 0; i3 < n; i3++) {
        steps.push({
          line: 14, msg: "第三轮：检查下标 i=" + i3 + "，nums[" + i3 + "]=" + nums[i3] + "。",
          views: {
            vars: { n: n, i: i3, num: null },
            nums: numsView([i3], [], [], { i: i3 })
          }
        });
        if (nums[i3] > 0) {
          steps.push({
            line: 15, msg: "nums[" + i3 + "]=" + nums[i3] + " > 0，说明数字 " + (i3 + 1) + " 缺失，返回 " + (i3 + 1) + "。",
            views: {
              vars: { n: n, i: i3, "返回值": i3 + 1 },
              nums: numsView([i3], [], [i3], { i: i3 })
            }
          });
          return { steps: steps, output: JSON.stringify(i3 + 1) };
        }
      }

      steps.push({
        line: 18, msg: "1 到 n 全部存在，缺失的第一个正数是 n+1=" + (n + 1) + "。",
        views: {
          vars: { n: n, "返回值": n + 1 },
          nums: numsView()
        }
      });
      return { steps: steps, output: JSON.stringify(n + 1) };
    }
  };
})(typeof window !== "undefined" ? window : this);