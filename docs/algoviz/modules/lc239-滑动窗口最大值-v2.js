(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc239-滑动窗口最大值-v2"] = {
    title: "239 滑动窗口最大值 · 最大堆",
    language: "python",
    code: [
      "class Solution:",
      "    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:",
      "        # 最大堆, 所以存储 (-num, i)",
      "        # 堆顶是heap[0]",
      "        heap = []",
      "        result = []",
      "        for i, num in enumerate(nums):",
      "            heapq.heappush(heap, (-num, i))",
      "            if i >= k - 1:",
      "                # 已存入长度为k的元素",
      "                # 窗口应该是 [i - k + 1, i] 这k个元素",
      "                while heap and heap[0][1] <= i - k:",
      "                    heapq.heappop(heap)",
      "                result.append(-heap[0][0])",
      "        return result"
    ].join("\n"),

    defaultInput: "nums = [1, 3, -1, -3, 5, 3, 6, 7]\nk = 3",
    inputHint: "每行一个变量，格式如 nums = [1, 3, -1, -3, 5, 3, 6, 7] / k = 3",
    testInputs: [
      "nums = [1]\nk = 1",
      "nums = [1, -1]\nk = 1"
    ],
    expectedOutputs: [
      "[3,3,5,5,6,7]",
      "[1]",
      "[1,-1]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      heap: { type: "heap", title: "堆 (存储 -num, i)" },
      result: { type: "array", title: "result" }
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
      var heap = []; // 存储 [-num, i]
      var result = [];

      // 堆视图：显示堆中元素（-num, i），并高亮堆顶
      function heapView(highlightIdx) {
        var items = heap.map(function (entry) {
          return "(" + entry[0] + "," + entry[1] + ")";
        });
        var view = { items: items };
        if (highlightIdx != null && highlightIdx >= 0 && highlightIdx < items.length) {
          view.highlights = [highlightIdx];
        }
        return view;
      }

      // 堆操作辅助（模拟 heapq）
      function heapPush(entry) {
        heap.push(entry);
        var idx = heap.length - 1;
        while (idx > 0) {
          var parent = Math.floor((idx - 1) / 2);
          if (heap[parent][0] < heap[idx][0] || (heap[parent][0] === heap[idx][0] && heap[parent][1] < heap[idx][1])) break;
          var tmp = heap[parent]; heap[parent] = heap[idx]; heap[idx] = tmp;
          idx = parent;
        }
      }

      function heapPop() {
        if (heap.length === 0) return null;
        var top = heap[0];
        var last = heap.pop();
        if (heap.length > 0) {
          heap[0] = last;
          var idx = 0;
          while (true) {
            var left = 2 * idx + 1, right = 2 * idx + 2;
            var smallest = idx;
            if (left < heap.length && (heap[left][0] < heap[smallest][0] || (heap[left][0] === heap[smallest][0] && heap[left][1] < heap[smallest][1]))) smallest = left;
            if (right < heap.length && (heap[right][0] < heap[smallest][0] || (heap[right][0] === heap[smallest][0] && heap[right][1] < heap[smallest][1]))) smallest = right;
            if (smallest === idx) break;
            var tmp = heap[idx]; heap[idx] = heap[smallest]; heap[smallest] = tmp;
            idx = smallest;
          }
        }
        return top;
      }

      // 初始化步骤
      steps.push({
        line: 4,
        msg: "初始化：heap 为空，result 为空。",
        views: {
          vars: { k: k, i: null, num: null, "窗口左边界": null },
          nums: { items: nums.slice() },
          heap: heapView(),
          result: { items: [] }
        }
      });

      for (var i = 0; i < nums.length; i++) {
        var num = nums[i];

        // 第 7 行：heappush
        heapPush([-num, i]);
        steps.push({
          line: 7,
          msg: "将 (" + (-num) + ", " + i + ") 推入堆中（对应元素 " + num + "）。",
          views: {
            vars: { k: k, i: i, num: num, "窗口左边界": i - k + 1 },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            heap: heapView(0),
            result: { items: result.slice() }
          }
        });

        if (i >= k - 1) {
          // 第 9 行：进入窗口处理
          steps.push({
            line: 9,
            msg: "i=" + i + " ≥ k-1=" + (k - 1) + "，窗口 [" + (i - k + 1) + ", " + i + "] 已满，开始清理过期元素。",
            views: {
              vars: { k: k, i: i, num: num, "窗口左边界": i - k + 1 },
              nums: { items: nums.slice(), highlights: [i - k + 1, i], pointers: { i: i } },
              heap: heapView(0),
              result: { items: result.slice() }
            }
          });

          // 第 11 行：while 循环清理
          var poppedAny = false;
          while (heap.length > 0 && heap[0][1] <= i - k) {
            var popped = heapPop();
            poppedAny = true;
            steps.push({
              line: 11,
              msg: "堆顶 (" + popped[0] + ", " + popped[1] + ") 的下标 " + popped[1] + " 已滑出窗口（≤ " + (i - k) + "），弹出。",
              views: {
                vars: { k: k, i: i, num: num, "窗口左边界": i - k + 1, "弹出": popped[1] },
                nums: { items: nums.slice(), highlights: [i - k + 1, i], pointers: { i: i } },
                heap: heapView(0),
                result: { items: result.slice() }
              }
            });
          }
          if (!poppedAny) {
            steps.push({
              line: 11,
              msg: "堆顶下标 " + heap[0][1] + " 仍在窗口内，无需弹出。",
              views: {
                vars: { k: k, i: i, num: num, "窗口左边界": i - k + 1 },
                nums: { items: nums.slice(), highlights: [i - k + 1, i], pointers: { i: i } },
                heap: heapView(0),
                result: { items: result.slice() }
              }
            });
          }

          // 第 12 行：取堆顶
          var maxVal = -heap[0][0];
          result.push(maxVal);
          steps.push({
            line: 12,
            msg: "堆顶为 (" + heap[0][0] + ", " + heap[0][1] + ")，最大值是 " + maxVal + "，加入 result。",
            views: {
              vars: { k: k, i: i, num: num, "窗口左边界": i - k + 1, "当前最大值": maxVal },
              nums: { items: nums.slice(), highlights: [i - k + 1, i], ok: [heap[0][1]] },
              heap: heapView(0),
              result: { items: result.slice(), highlights: [result.length - 1] }
            }
          });
        }
      }

      // 第 13 行：返回
      steps.push({
        line: 13,
        msg: "遍历结束，返回 result = [" + result.join(", ") + "]。",
        views: {
          vars: { k: k, i: nums.length - 1, num: nums[nums.length - 1] },
          nums: { items: nums.slice() },
          heap: heapView(),
          result: { items: result.slice(), ok: result.map(function (_, idx) { return idx; }) }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);