(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc239-滑动窗口最大值-v3"] = {
    title: "239 滑动窗口最大值 · 单调队列",
    link: "https://leetcode.cn/problems/sliding-window-maximum/",
    language: "python",
    code: [
      "class Solution:",
      "    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:",
      "        # 维护单调队列",
      "        # 每次都首先移除队尾比它小的元素, 然后再加入, 这样就会使得队列始终是单调递减的",
      "        q = deque()",
      "        res = []",
      "        for i, num in enumerate(nums):",
      "            # 移除队尾比num小的元素",
      "            while q and q[-1][1] < num:",
      "                q.pop()",
      "            q.append((i, num))",
      "            # 移除队头不在窗口内的元素",
      "            while q and q[0][0] <= i - k:",
      "                q.popleft()",
      "",
      "            if i >= k - 1:",
      "                res.append(q[0][1])",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [1, 3, -1, -3, 5, 3, 6, 7]\nk = 3",
    inputHint: "每行一个变量，格式如 nums = [1, 3, -1, -3, 5, 3, 6, 7] / k = 3",
    testInputs: ["nums = [1]\nk = 1", "nums = [1, -1]\nk = 1"],
    expectedOutputs: ["[3,3,5,5,6,7]", "[1]", "[1,-1]"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      queue: { type: "queue", title: "单调队列 q" },
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
      var q = []; // 队列元素为 { idx, val }
      var res = [];

      var queueView = function (hotIdx) {
        var items = q.map(function (e) { return e.val; });
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < q.length) highlights.push(hotIdx);
        return { items: items, highlights: highlights };
      };

      var resView = function (hotIdx) {
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < res.length) highlights.push(hotIdx);
        return { items: res.slice(), highlights: highlights };
      };

      steps.push({
        line: 5, msg: "初始化空队列 q 和结果数组 res。",
        views: {
          vars: { k: k, i: null, num: null },
          nums: { items: nums.slice() },
          queue: queueView(),
          res: resView()
        }
      });

      for (var i = 0; i < nums.length; i++) {
        var num = nums[i];
        steps.push({
          line: 7, msg: "遍历到 i=" + i + "，当前元素 num=" + num + "。",
          views: {
            vars: { k: k, i: i, num: num },
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            queue: queueView(),
            res: resView()
          }
        });

        // 移除队尾比 num 小的元素
        var popped = [];
        while (q.length > 0 && q[q.length - 1].val < num) {
          popped.push(q.pop());
        }
        if (popped.length > 0) {
          steps.push({
            line: 9, msg: "队尾元素 " + popped.map(function (e) { return e.val; }).join(", ") + " 比 " + num + " 小，弹出。",
            views: {
              vars: { k: k, i: i, num: num },
              nums: { items: nums.slice(), highlights: [i] },
              queue: queueView(),
              res: resView()
            }
          });
        } else {
          steps.push({
            line: 9, msg: "队尾元素不小于 " + num + "，无需弹出。",
            views: {
              vars: { k: k, i: i, num: num },
              nums: { items: nums.slice(), highlights: [i] },
              queue: queueView(),
              res: resView()
            }
          });
        }

        q.push({ idx: i, val: num });
        steps.push({
          line: 10, msg: "将 (" + i + ", " + num + ") 加入队尾。",
          views: {
            vars: { k: k, i: i, num: num },
            nums: { items: nums.slice(), highlights: [i] },
            queue: queueView(q.length - 1),
            res: resView()
          }
        });

        // 移除队头不在窗口内的元素
        var removedHead = false;
        while (q.length > 0 && q[0].idx <= i - k) {
          q.shift();
          removedHead = true;
        }
        if (removedHead) {
          steps.push({
            line: 12, msg: "队头下标 " + (i - k) + " 已滑出窗口，移除队头。",
            views: {
              vars: { k: k, i: i, num: num },
              nums: { items: nums.slice(), highlights: [i] },
              queue: queueView(),
              res: resView()
            }
          });
        } else {
          steps.push({
            line: 12, msg: "队头仍在窗口内，无需移除。",
            views: {
              vars: { k: k, i: i, num: num },
              nums: { items: nums.slice(), highlights: [i] },
              queue: queueView(),
              res: resView()
            }
          });
        }

        if (i >= k - 1) {
          res.push(q[0].val);
          steps.push({
            line: 15, msg: "窗口已满，当前窗口最大值是队头 " + q[0].val + "，加入结果。",
            views: {
              vars: { k: k, i: i, num: num, "窗口最大值": q[0].val },
              nums: { items: nums.slice(), highlights: [i - k + 1, i], ok: [i - k + 1, i] },
              queue: queueView(),
              res: resView(res.length - 1)
            }
          });
        } else {
          steps.push({
            line: 15, msg: "窗口未满（i=" + i + " < k-1=" + (k - 1) + "），暂不记录结果。",
            views: {
              vars: { k: k, i: i, num: num },
              nums: { items: nums.slice(), highlights: [i] },
              queue: queueView(),
              res: resView()
            }
          });
        }
      }

      steps.push({
        line: 16, msg: "遍历结束，返回结果数组。",
        views: {
          vars: { k: k, i: nums.length - 1, num: nums[nums.length - 1] },
          nums: { items: nums.slice() },
          queue: queueView(),
          res: resView()
        }
      });
      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);