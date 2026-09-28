(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc347-前k个高频元素"] = {
    title: "347 前K个高频元素 · 计数排序",
    language: "python",
    link: "https://leetcode.cn/problems/top-k-frequent-elements/",
    code: [
      "class Solution:",
      "    def topKFrequent(self, nums: List[int], k: int) -> List[int]:",
      "        freq = defaultdict(int)",
      "        for num in nums:",
      "            freq[num] += 1",
      "        items = list(sorted(freq.items(), key = lambda x: -x[1]))",
      "        return [x[0] for x in items[:k]]"
    ].join("\n"),

    defaultInput: "nums = [1, 1, 1, 2, 2, 3]\nk = 2",
    inputHint: "每行一个变量，格式如 nums = [1, 1, 1, 2, 2, 3] / k = 2",
    testInputs: [
      "nums = [1]\nk = 1",
      "nums = [4, 1, -1, 2, -1, 2, 3]\nk = 2"
    ],
    expectedOutputs: [
      "[1, 2]",
      "[1]",
      "[-1, 2]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      freq: { type: "vars", title: "频率表 freq" },
      items: { type: "array", title: "排序后的 items" },
      result: { type: "array", title: "结果" }
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
      var freq = {};
      var freqView = function (hotKey) {
        var o = {};
        Object.keys(freq).forEach(function (key) { o[key] = freq[key]; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      };

      steps.push({
        line: 3,
        msg: "初始化频率表 freq（默认值为 0）。",
        views: {
          vars: { k: k, num: null, freq: null, items: null },
          freq: {},
          items: { items: [] },
          result: { items: [] }
        }
      });

      for (var i = 0; i < nums.length; i++) {
        var num = nums[i];
        steps.push({
          line: 4,
          msg: "遍历到 nums[" + i + "] = " + num + "。",
          views: {
            vars: { k: k, num: num, i: i },
            freq: freqView(),
            items: { items: [] },
            result: { items: [] }
          }
        });
        freq[num] = (freq[num] || 0) + 1;
        steps.push({
          line: 5,
          msg: "freq[" + num + "] 增加 1，变为 " + freq[num] + "。",
          views: {
            vars: { k: k, num: num, i: i },
            freq: freqView(String(num)),
            items: { items: [] },
            result: { items: [] }
          }
        });
      }

      var entries = [];
      Object.keys(freq).forEach(function (key) {
        entries.push([parseInt(key, 10), freq[key]]);
      });
      entries.sort(function (a, b) { return b[1] - a[1]; });

      steps.push({
        line: 6,
        msg: "按频率降序排序，得到 items = " + JSON.stringify(entries) + "。",
        views: {
          vars: { k: k, num: null },
          freq: freqView(),
          items: { items: entries.map(function (e) { return e[0] + ":" + e[1]; }), highlights: [] },
          result: { items: [] }
        }
      });

      var result = [];
      for (var j = 0; j < Math.min(k, entries.length); j++) {
        result.push(entries[j][0]);
        steps.push({
          line: 7,
          msg: "取 items[" + j + "] 的元素 " + entries[j][0] + " 加入结果。",
          views: {
            vars: { k: k, num: null, j: j },
            freq: freqView(),
            items: { items: entries.map(function (e) { return e[0] + ":" + e[1]; }), highlights: [j] },
            result: { items: result.slice(), highlights: [result.length - 1] }
          }
        });
      }

      steps.push({
        line: 7,
        msg: "返回结果 " + JSON.stringify(result) + "。",
        views: {
          vars: { k: k, num: null },
          freq: freqView(),
          items: { items: entries.map(function (e) { return e[0] + ":" + e[1]; }) },
          result: { items: result.slice(), ok: result.map(function (_, idx) { return idx; }) }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);