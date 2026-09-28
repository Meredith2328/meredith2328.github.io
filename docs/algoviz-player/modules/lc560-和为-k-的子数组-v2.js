(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc560-和为-k-的子数组-v2"] = {
    title: "560 和为 K 的子数组 · 前缀和+哈希",
    link: "https://leetcode.cn/problems/subarray-sum-equals-k/",
    language: "python",
    code: [
      "class Solution:",
      "    def subarraySum(self, nums: List[int], k: int) -> int:",
      "        # 首先计算前缀和数组. 注意前缀和数组比原数组多一项s[0] = 0.",
      "        s = [0] * (len(nums) + 1)",
      "        for i, x in enumerate(nums):",
      "            s[i + 1] = s[i] + x",
      "        ",
      "        adict = defaultdict(int)",
      "        res = 0",
      "        for sj in s:",
      "            # 注意枚举的是\"曾经有过多少个sj - k\"",
      "            # 所以应该先加res, 而不能把sj本身计入",
      "            res += adict[sj - k]",
      "            adict[sj] += 1",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [1, 2, 3]\nk = 3",
    inputHint: "每行一个变量，格式如 nums = [1, 2, 3] / k = 3",
    testInputs: ["nums = [1, 1, 1]\nk = 2", "nums = [1]\nk = 0"],
    expectedOutputs: ["2", "2", "0"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      prefix: { type: "array", title: "前缀和 s" },
      hash: { type: "vars", title: "哈希表 adict" }
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
      var nums = input.nums, k = input.k;
      var steps = [];
      var s = new Array(nums.length + 1);
      var adict = {};
      var res = 0;

      var hashView = function (hotKey) {
        var o = {};
        Object.keys(adict).forEach(function (key) { o[key] = adict[key]; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      };

      // line 3: 初始化前缀和数组
      s[0] = 0;
      steps.push({
        line: 3, msg: "初始化前缀和数组 s，长度为 " + (nums.length + 1) + "，s[0] = 0。",
        views: {
          vars: { k: k, res: 0, i: null, x: null, sj: null },
          nums: { items: nums.slice() },
          prefix: { items: s.slice(0, 1), showIndex: true },
          hash: {}
        }
      });

      // line 4-5: 计算前缀和
      for (var i = 0; i < nums.length; i++) {
        var x = nums[i];
        s[i + 1] = s[i] + x;
        steps.push({
          line: 5, msg: "计算前缀和：s[" + (i + 1) + "] = s[" + i + "] + " + x + " = " + s[i + 1] + "。",
          views: {
            vars: { k: k, res: 0, i: i, x: x, sj: null },
            nums: { items: nums.slice(), highlights: [i] },
            prefix: { items: s.slice(0, i + 2), highlights: [i + 1], showIndex: true },
            hash: {}
          }
        });
      }

      // line 7: 初始化哈希表
      steps.push({
        line: 7, msg: "初始化哈希表 adict（用于记录前缀和出现的次数），res = 0。",
        views: {
          vars: { k: k, res: 0, i: null, x: null, sj: null },
          nums: { items: nums.slice() },
          prefix: { items: s.slice(), showIndex: true },
          hash: {}
        }
      });

      // line 8-12: 遍历前缀和
      for (var j = 0; j < s.length; j++) {
        var sj = s[j];
        steps.push({
          line: 9, msg: "遍历到前缀和 sj = " + sj + "（下标 " + j + "）。",
          views: {
            vars: { k: k, res: res, i: null, x: null, sj: sj },
            nums: { items: nums.slice() },
            prefix: { items: s.slice(), highlights: [j], showIndex: true },
            hash: hashView()
          }
        });

        var need = sj - k;
        var cnt = adict[need] || 0;
        res += cnt;
        steps.push({
          line: 11, msg: "res += adict[" + sj + " - " + k + "] = adict[" + need + "] = " + cnt + "，res 变为 " + res + "。",
          views: {
            vars: { k: k, res: res, i: null, x: null, sj: sj, "sj-k": need },
            nums: { items: nums.slice() },
            prefix: { items: s.slice(), highlights: [j], showIndex: true },
            hash: hashView(String(need))
          }
        });

        adict[sj] = (adict[sj] || 0) + 1;
        steps.push({
          line: 12, msg: "adict[" + sj + "] 自增 1，变为 " + adict[sj] + "。",
          views: {
            vars: { k: k, res: res, i: null, x: null, sj: sj },
            nums: { items: nums.slice() },
            prefix: { items: s.slice(), highlights: [j], showIndex: true },
            hash: hashView(String(sj))
          }
        });
      }

      steps.push({
        line: 13, msg: "遍历结束，返回结果 res = " + res + "。",
        views: {
          vars: { k: k, res: res, i: null, x: null, sj: null },
          nums: { items: nums.slice() },
          prefix: { items: s.slice(), showIndex: true },
          hash: hashView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);