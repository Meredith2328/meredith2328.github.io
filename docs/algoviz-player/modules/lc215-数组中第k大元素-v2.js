(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc215-数组中第k大元素-v2"] = {
    title: "215 数组中的第K个最大元素 · 堆",
    link: "https://leetcode.cn/problems/kth-largest-element-in-an-array/",
    language: "python",
    code: [
      "class Solution:",
      "    def findKthLargest(self, nums: List[int], k: int) -> int:",
      "        nums = [-x for x in nums]",
      "        heapq.heapify(nums)",
      "        for i in range(k - 1):",
      "            heapq.heappop(nums)",
      "        return -heapq.heappop(nums)"
    ].join("\n"),

    defaultInput: "nums = [3, 2, 1, 5, 6, 4]\nk = 2",
    inputHint: "每行一个变量，格式如 nums = [3, 2, 1, 5, 6, 4] / k = 2",

    views: {
      vars: { type: "vars", title: "变量" },
      heap: { type: "heap", title: "堆（取负后）" },
      nums: { type: "array", title: "nums（取负后）" }
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
      var heap = [];

      // 最小堆辅助函数（ES5）
      function heapPush(h, v) {
        h.push(v);
        var i = h.length - 1;
        while (i > 0) {
          var p = Math.floor((i - 1) / 2);
          if (h[p] <= h[i]) break;
          var t = h[p]; h[p] = h[i]; h[i] = t;
          i = p;
        }
      }
      function heapPop(h) {
        if (h.length === 0) return undefined;
        var top = h[0];
        var last = h.pop();
        if (h.length > 0) {
          h[0] = last;
          var i = 0;
          while (true) {
            var l = 2 * i + 1, r = 2 * i + 2, smallest = i;
            if (l < h.length && h[l] < h[smallest]) smallest = l;
            if (r < h.length && h[r] < h[smallest]) smallest = r;
            if (smallest === i) break;
            var t = h[i]; h[i] = h[smallest]; h[smallest] = t;
            i = smallest;
          }
        }
        return top;
      }

      // 步骤 1：取负
      var negNums = [];
      for (var i = 0; i < nums.length; i++) {
        negNums.push(-nums[i]);
      }
      steps.push({
        line: 3,
        msg: "将 nums 每个元素取负，得到 [" + negNums.join(", ") + "]，以便用最小堆模拟最大堆。",
        views: {
          vars: { k: k, i: null, "取负后": negNums.slice() },
          nums: { items: negNums.slice() },
          heap: { items: [] }
        }
      });

      // 步骤 2：建堆
      heap = negNums.slice();
      // 自底向上堆化
      for (var j = Math.floor(heap.length / 2) - 1; j >= 0; j--) {
        var idx = j;
        while (true) {
          var l = 2 * idx + 1, r = 2 * idx + 2, smallest = idx;
          if (l < heap.length && heap[l] < heap[smallest]) smallest = l;
          if (r < heap.length && heap[r] < heap[smallest]) smallest = r;
          if (smallest === idx) break;
          var t = heap[idx]; heap[idx] = heap[smallest]; heap[smallest] = t;
          idx = smallest;
        }
      }
      steps.push({
        line: 4,
        msg: "对取负后的数组建最小堆，堆顶是最小值（即原数组最大值）。",
        views: {
          vars: { k: k, i: null, "取负后": negNums.slice() },
          nums: { items: negNums.slice() },
          heap: { items: heap.slice() }
        }
      });

      // 步骤 3：弹出 k-1 次
      for (var i = 0; i < k - 1; i++) {
        var popped = heapPop(heap);
        steps.push({
          line: 6,
          msg: "第 " + (i + 1) + " 次弹出堆顶 " + popped + "（对应原数组 " + (-popped) + "），剩余堆为 [" + heap.join(", ") + "]。",
          views: {
            vars: { k: k, i: i, "弹出": popped },
            nums: { items: negNums.slice(), highlights: [] },
            heap: { items: heap.slice() }
          }
        });
      }

      // 步骤 4：返回结果
      var result = -heapPop(heap);
      steps.push({
        line: 7,
        msg: "弹出堆顶并取负，得到第 " + k + " 大的元素：" + result + "。",
        views: {
          vars: { k: k, "结果": result },
          nums: { items: negNums.slice() },
          heap: { items: heap.slice() }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);