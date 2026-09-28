(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc215-数组中的第k个最大元素"] = {
    title: "215 数组中的第K个最大元素 · 堆（维护 size=k）",
    language: "python",
    link: "https://leetcode.cn/problems/kth-largest-element-in-an-array/",
    code: [
      "class Solution:",
      "    def findKthLargest(self, nums: List[int], k: int) -> int:",
      "        heap = [] # 最小堆解法",
      "        for num in nums:",
      "            heapq.heappush(heap, num)",
      "            if len(heap) > k:",
      "                heapq.heappop(heap)",
      "        return heap[0]"
    ].join("\n"),

    defaultInput: "nums = [3, 2, 1, 5, 6, 4]\nk = 2",
    inputHint: "每行一个变量，格式如 nums = [3, 2, 1, 5, 6, 4] / k = 2",
    testInputs: [
      "nums = [3, 2, 3, 1, 2, 4, 5, 5, 6]\nk = 4",
      "nums = [1]\nk = 1"
    ],
    expectedOutputs: ["5", "4", "1"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      heap: { type: "heap", title: "最小堆 heap" }
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
      var heap = []; // 最小堆，用数组模拟

      // 最小堆辅助函数（sift up / sift down）
      function heapPush(h, val) {
        h.push(val);
        var i = h.length - 1;
        while (i > 0) {
          var parent = Math.floor((i - 1) / 2);
          if (h[parent] <= h[i]) break;
          var tmp = h[parent]; h[parent] = h[i]; h[i] = tmp;
          i = parent;
        }
      }

      function heapPop(h) {
        if (h.length === 0) return null;
        var top = h[0];
        var last = h.pop();
        if (h.length > 0) {
          h[0] = last;
          var i = 0;
          while (true) {
            var left = 2 * i + 1, right = 2 * i + 2, smallest = i;
            if (left < h.length && h[left] < h[smallest]) smallest = left;
            if (right < h.length && h[right] < h[smallest]) smallest = right;
            if (smallest === i) break;
            var tmp = h[i]; h[i] = h[smallest]; h[smallest] = tmp;
            i = smallest;
          }
        }
        return top;
      }

      var heapView = function (hotIdx) {
        var items = heap.slice();
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) highlights.push(hotIdx);
        return { items: items, highlights: highlights };
      };

      steps.push({
        line: 3,
        msg: "初始化一个空的最小堆，堆的大小始终不超过 k=" + k + "，堆顶就是第 k 大的元素。",
        views: {
          vars: { k: k, num: null, "len(heap)": 0 },
          nums: { items: nums.slice() },
          heap: heapView()
        }
      });

      for (var i = 0; i < nums.length; i++) {
        var num = nums[i];
        steps.push({
          line: 4,
          msg: "遍历到第 " + (i + 1) + " 个元素 num=" + num + "。",
          views: {
            vars: { k: k, num: num, "len(heap)": heap.length },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            heap: heapView()
          }
        });

        // 模拟 heapq.heappush
        heapPush(heap, num);
        steps.push({
          line: 5,
          msg: "将 " + num + " 压入最小堆（自动调整堆结构）。",
          views: {
            vars: { k: k, num: num, "len(heap)": heap.length },
            nums: { items: nums.slice(), highlights: [i] },
            heap: heapView(heap.length - 1)
          }
        });

        if (heap.length > k) {
          var popped = heapPop(heap);
          steps.push({
            line: 6,
            msg: "堆大小 " + (heap.length + 1) + " 超过了 k=" + k + "，弹出堆顶 " + popped + "（当前最小的元素）。",
            views: {
              vars: { k: k, num: num, "len(heap)": heap.length, "弹出": popped },
              nums: { items: nums.slice(), highlights: [i] },
              heap: heapView()
            }
          });
          steps.push({
            line: 7,
            msg: "执行 heapq.heappop，堆大小恢复为 " + heap.length + "。",
            views: {
              vars: { k: k, num: num, "len(heap)": heap.length },
              nums: { items: nums.slice(), highlights: [i] },
              heap: heapView()
            }
          });
        }
      }

      steps.push({
        line: 8,
        msg: "遍历结束，堆顶 " + heap[0] + " 就是第 " + k + " 大的元素。",
        views: {
          vars: { k: k, "结果": heap[0] },
          nums: { items: nums.slice() },
          heap: heapView(0)
        }
      });

      return { steps: steps, output: JSON.stringify(heap[0]) };
    }
  };
})(typeof window !== "undefined" ? window : this);