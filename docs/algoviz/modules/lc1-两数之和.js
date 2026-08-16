(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc1-两数之和"] = {
    title: "1 两数之和 · 哈希",
    language: "python",
    code: [
      "class Solution:",
      "    def twoSum(self, nums: List[int], target: int) -> List[int]:",
      "        d = {} # 从val到i的map",
      "        for i, val in enumerate(nums):",
      "            if (target - val) in d:",
      "                return [i, d[target - val]]",
      "            d[val] = i"
    ].join("\n"),

    defaultInput: "nums = [2, 7, 11, 15]\ntarget = 9",
    inputHint: "每行一个变量，格式如 nums = [2, 7, 11, 15] / target = 9",

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      hash: { type: "vars", title: "哈希表 d" }
    },

    parseInput: function (text) {
      var env = {};
      text.split(/\n/).forEach(function (line) {
        var m = /^\s*([A-Za-z_]\w*)\s*=\s*(.+?)\s*$/.exec(line);
        if (!m) return;
        try { env[m[1]] = JSON.parse(m[2].replace(/'/g, '"')); }
        catch (e) { env[m[1]] = m[2]; }
      });
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...] ");
      if (typeof env.target !== "number") throw new Error("缺少 target = 数字");
      return env;
    },

    run: function (input) {
      var nums = input.nums;
      var target = input.target;
      var steps = [];
      var d = {};

      function hasKey(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key);
      }

      function dView(hotKey) {
        var o = {};
        Object.keys(d).forEach(function (k) { o[k] = d[k]; });
        if (hotKey != null && o[hotKey] !== undefined) {
          o[hotKey] = { value: o[hotKey], __hot: true };
        }
        return o;
      }

      steps.push({
        line: 3,
        msg: "初始化哈希表 d，用于记录已经遍历过的数值及其下标。",
        views: {
          vars: { target: target, i: null, val: null },
          nums: { items: nums.slice() },
          hash: dView()
        }
      });

      for (var i = 0; i < nums.length; i++) {
        var val = nums[i];
        steps.push({
          line: 4,
          msg: "遍历到第 " + i + " 个元素，当前值 val=" + val + "。",
          views: {
            vars: { target: target, i: i, val: val },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            hash: dView()
          }
        });

        var need = target - val;

        if (hasKey(d, need)) {
          steps.push({
            line: 5,
            msg: "需要的数 " + need + " 已在哈希表中，其下标为 " + d[need] + "，当前下标为 " + i + "。",
            views: {
              vars: { target: target, i: i, val: val, "target-val": need },
              nums: { items: nums.slice(), highlights: [d[need], i], ok: [d[need], i] },
              hash: dView(String(need))
            }
          });

          var res = [i, d[need]];
          steps.push({
            line: 6,
            msg: "返回 [" + i + ", " + d[need] + "]。",
            views: {
              vars: { "返回值": res },
              nums: { items: nums.slice(), ok: [d[need], i] },
              hash: dView()
            }
          });

          return { steps: steps, output: JSON.stringify(res) };
        }

        d[val] = i;
        steps.push({
          line: 7,
          msg: "将当前值 " + val + " 存入哈希表，下标为 " + i + "。",
          views: {
            vars: { target: target, i: i, val: val },
            nums: { items: nums.slice(), highlights: [i] },
            hash: dView(String(val))
          }
        });
      }

      steps.push({
        line: 4,
        msg: "遍历结束，未找到匹配（题目保证有解，此处不应到达）。",
        views: {
          vars: { target: target, i: nums.length, val: undefined },
          nums: { items: nums.slice() },
          hash: dView()
        }
      });

      return { steps: steps, output: "null" };
    }
  };
})(typeof window !== "undefined" ? window : this);