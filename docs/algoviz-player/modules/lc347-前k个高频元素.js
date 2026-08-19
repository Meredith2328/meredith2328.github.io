(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc347-前k个高频元素"] = {
    title: "347 前K个高频元素 · 堆",
    language: "python",
    code: [
      "class Solution:",
      "    def topKFrequent(self, nums: List[int], k: int) -> List[int]:",
      "        freq = defaultdict(int)",
      "        for num in nums:",
      "            freq[num] += 1",
      "        items = [(-f, v) for v, f in freq.items()]",
      "        heapq.heapify(items)",
      "        res = []",
      "        for i in range(k):",
      "            res.append(heapq.heappop(items)[1])",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [1, 1, 1, 2, 2, 3]\nk = 2",
    inputHint: "每行一个变量，格式如 nums = [1, 1, 1, 2, 2, 3] / k = 2",

    views: {
      vars: { type: "vars", title: "变量" },
      freq: { type: "vars", title: "频率表 freq" },
      heap: { type: "heap", title: "堆 items" },
      res: { type: "array", title: "结果 res" }
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
        line: 2, msg: "开始：统计每个数字出现的频率，然后找出前 " + k + " 个高频元素。",
        views: {
          vars: { k: k, num: null, f: null, v: null, i: null },
          freq: {},
          heap: { items: [] },
          res: { items: [] }
        }
      });

      // 统计频率
      for (var idx = 0; idx < nums.length; idx++) {
        var num = nums[idx];
        steps.push({
          line: 4, msg: "遍历到元素 " + num + "（下标 " + idx + "）。",
          views: {
            vars: { k: k, num: num, f: null, v: null, i: null },
            freq: freqView(),
            heap: { items: [] },
            res: { items: [] }
          }
        });
        freq[num] = (freq[num] || 0) + 1;
        steps.push({
          line: 5, msg: "频率加 1：" + num + " 出现 " + freq[num] + " 次。",
          views: {
            vars: { k: k, num: num, f: null, v: null, i: null },
            freq: freqView(String(num)),
            heap: { items: [] },
            res: { items: [] }
          }
        });
      }

      // 构建 items 数组
      var items = [];
      var keys = Object.keys(freq);
      steps.push({
        line: 6, msg: "构建堆数组：每个元素存 (-频率, 值)，以便按频率降序。",
        views: {
          vars: { k: k, num: null, f: null, v: null, i: null },
          freq: freqView(),
          heap: { items: [] },
          res: { items: [] }
        }
      });
      for (var j = 0; j < keys.length; j++) {
        var v = parseInt(keys[j], 10);
        var f = freq[keys[j]];
        items.push([-f, v]);
        steps.push({
          line: 6, msg: "加入 (" + (-f) + ", " + v + ")，对应 " + v + " 出现 " + f + " 次。",
          views: {
            vars: { k: k, num: null, f: f, v: v, i: null },
            freq: freqView(),
            heap: { items: items.map(function (p) { return p[0]; }) },
            res: { items: [] }
          }
        });
      }

      // 堆化
      steps.push({
        line: 7, msg: "对 items 进行堆化（最小堆，按 -频率 排序）。",
        views: {
          vars: { k: k, num: null, f: null, v: null, i: null },
          freq: freqView(),
          heap: { items: items.map(function (p) { return p[0]; }) },
          res: { items: [] }
        }
      });
      // 模拟堆化（这里直接排序，但逻辑等价）
      items.sort(function (a, b) { return a[0] - b[0]; });
      steps.push({
        line: 7, msg: "堆化完成，堆顶是最小值（即频率最高的元素）。",
        views: {
          vars: { k: k, num: null, f: null, v: null, i: null },
          freq: freqView(),
          heap: { items: items.map(function (p) { return p[0]; }) },
          res: { items: [] }
        }
      });

      // 弹出 k 个
      var res = [];
      for (var i = 0; i < k; i++) {
        steps.push({
          line: 9, msg: "第 " + (i + 1) + " 次弹出：堆顶是 " + items[0][1] + "（频率 " + (-items[0][0]) + "）。",
          views: {
            vars: { k: k, num: null, f: null, v: null, i: i },
            freq: freqView(),
            heap: { items: items.map(function (p) { return p[0]; }), highlights: [0] },
            res: { items: res.slice() }
          }
        });
        res.push(items[0][1]);
        items.shift();
        steps.push({
          line: 10, msg: "将 " + res[res.length - 1] + " 加入结果，当前结果：" + JSON.stringify(res) + "。",
          views: {
            vars: { k: k, num: null, f: null, v: null, i: i },
            freq: freqView(),
            heap: { items: items.map(function (p) { return p[0]; }) },
            res: { items: res.slice(), highlights: [res.length - 1] }
          }
        });
      }

      steps.push({
        line: 11, msg: "返回结果：" + JSON.stringify(res) + "。",
        views: {
          vars: { k: k, num: null, f: null, v: null, i: null },
          freq: freqView(),
          heap: { items: items.map(function (p) { return p[0]; }) },
          res: { items: res.slice(), ok: res.map(function (_, idx) { return idx; }) }
        }
      });
      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);