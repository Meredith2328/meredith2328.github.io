/* algoviz module: LeetCode 1 two-sum (hand-written reference module,
 * also serves as the format example for LLM generation) */
(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["two-sum"] = {
    title: "1 两数之和 · 哈希",
    language: "python",
    code: [
      "class Solution:",
      "    def twoSum(self, nums, target):",
      "        d = {} # 从 val 到 i 的 map",
      "        for i, val in enumerate(nums):",
      "            if (target - val) in d:",
      "                return [d[target - val], i]",
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
        var val;
        try { val = JSON.parse(m[2].replace(/'/g, '"')); }
        catch (e) { val = m[2]; }
        env[m[1]] = val;
      });
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...] ");
      if (typeof env.target !== "number") throw new Error("缺少 target = 数字");
      return env;
    },

    run: function (input) {
      var nums = input.nums, target = input.target;
      var steps = [];
      var d = {};
      var dView = function (hotKey) {
        var o = {};
        Object.keys(d).forEach(function (k) { o[k] = d[k]; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      };

      steps.push({
        line: 2, msg: "开始：目标是找到两个数，使它们的和等于 " + target + "。",
        views: {
          vars: { target: target, i: null, val: null },
          nums: { items: nums.slice() },
          hash: {}
        }
      });

      for (var i = 0; i < nums.length; i++) {
        var val = nums[i];
        steps.push({
          line: 4, msg: "遍历到 i=" + i + "，当前元素 val=" + val + "。",
          views: {
            vars: { target: target, i: i, val: val },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            hash: dView()
          }
        });
        var need = target - val;
        if (need in d) {
          steps.push({
            line: 5, msg: "需要的数 " + need + " 在哈希表里（下标 " + d[need] + "），找到了！",
            views: {
              vars: { target: target, i: i, val: val, "target-val": need },
              nums: { items: nums.slice(), highlights: [d[need], i], ok: [d[need], i] },
              hash: dView(String(need))
            }
          });
          steps.push({
            line: 6, msg: "返回两个下标 [" + d[need] + ", " + i + "]。",
            views: {
              vars: { "返回值": [d[need], i] },
              nums: { items: nums.slice(), ok: [d[need], i] },
              hash: dView()
            }
          });
          return { steps: steps, output: JSON.stringify([d[need], i]) };
        }
        d[val] = i;
        steps.push({
          line: 7, msg: "把 " + val + " -> " + i + " 存入哈希表。",
          views: {
            vars: { target: target, i: i, val: val },
            nums: { items: nums.slice(), highlights: [i] },
            hash: dView(String(val))
          }
        });
      }
      steps.push({
        line: 4, msg: "遍历结束，没有找到和为 " + target + " 的两个数。",
        views: { vars: { target: target }, nums: { items: nums.slice() }, hash: dView() }
      });
      return { steps: steps, output: "[]" };
    }
  };
})(typeof window !== "undefined" ? window : this);
