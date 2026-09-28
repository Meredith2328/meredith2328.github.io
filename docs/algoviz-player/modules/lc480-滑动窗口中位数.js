/* algoviz module: LeetCode 480 滑动窗口中位数 (C++ DualHeap 懒删除, hand-written)
 * 每滑动一个窗口，求其中位数；用双堆 + removed 懒删除维护。 */
(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc480-滑动窗口中位数"] = {
    title: "480 滑动窗口中位数 · 双堆懒删除",
    language: "cpp",
    link: "https://leetcode.cn/problems/sliding-window-median",
    code: [
      "class DualHeap {",
      "private:",
      "    priority_queue<int> low;       // 大根堆，存较小的一半",
      "    priority_queue<int, vector<int>, greater<int>> high; // 小根堆，存较大的一半",
      "    unordered_map<int, int> removed; // 懒删除标记",
      "    int lowCount = 0;",
      "    int highCount = 0;",
      "",
      "    template<typename T>",
      "    void clean(T& heap) {",
      "        while (!heap.empty() && removed[heap.top()] > 0) {",
      "            removed[heap.top()]--;",
      "            heap.pop();",
      "        }",
      "    }",
      "",
      "    void balance() {",
      "        if (lowCount > highCount + 1) {",
      "            lowCount -= 1;",
      "            highCount += 1;",
      "            high.push(low.top());",
      "            low.pop();",
      "            clean(low);",
      "        } else if (lowCount < highCount) {",
      "            lowCount += 1;",
      "            highCount -= 1;",
      "            low.push(high.top());",
      "            high.pop();",
      "            clean(high);",
      "        }",
      "    }",
      "",
      "public:",
      "    void insert(int num) {",
      "        if (low.empty() || num <= low.top()) {",
      "            lowCount += 1;",
      "            low.push(num);",
      "        } else {",
      "            highCount += 1;",
      "            high.push(num);",
      "        }",
      "        balance();",
      "    }",
      "",
      "    void erase(int num) {",
      "        removed[num]++;",
      "        if (!low.empty() && num <= low.top()) {",
      "            lowCount -= 1;",
      "            clean(low);",
      "        } else {",
      "            highCount -= 1;",
      "            clean(high);",
      "        }",
      "        balance();",
      "    }",
      "",
      "    double getMid() {",
      "        if (lowCount == highCount) {",
      "            return ((double)low.top() + high.top()) / 2.0;",
      "        } else {",
      "            return low.top();",
      "        }",
      "    }",
      "};"
    ].join("\n"),

    defaultInput: "nums = [1, 3, -1, -3, 5, 3, 6, 7]\nk = 3",
    inputHint: "每行一个变量：nums = [...]（数组），k = 窗口大小",
    testInputs: [
      "nums = [1, 2, 3, 4]\nk = 2",
      "nums = [5, 1, 7]\nk = 1"
    ],
    expectedOutputs: [
      "[1,-1,-1,3,5,6]",
      "[1.5,2.5,3.5]",
      "[5,1,7]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      low: { type: "array", title: "low（较小一半，大根堆）" },
      high: { type: "array", title: "high（较大一半，小根堆）" },
      result: { type: "array", title: "各窗口中位数" }
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

      // 用已排序数组模拟双堆；low 存较小一半（降序，top=arr[0]），high 存较大一半（升序）
      var low = [], high = [];
      var removed = {};      // val -> 待删计数
      var lowCount = 0, highCount = 0;
      var results = [];

      function insertDesc(arr, v) { var i = 0; while (i < arr.length && arr[i] > v) i++; arr.splice(i, 0, v); return i; }
      function insertAsc(arr, v) { var i = 0; while (i < arr.length && arr[i] < v) i++; arr.splice(i, 0, v); return i; }

      function cleanHeap(arr, which) {
        while (arr.length && removed[arr[0]] > 0) { removed[arr[0]]--; arr.shift(); }
      }
      function cleanB(heap) {
        var actual = heap.filter(function (x) { return (removed[x] || 0) <= 0; });
        // 重新计数移除了的标记
        return actual;
      }

      function balance() {
        if (lowCount > highCount + 1) {
          lowCount -= 1; highCount += 1;
          var mv = low[0]; low.shift();
          var hp = insertAsc(high, mv);
          return { kind: "lowToHigh", val: mv, hp: hp };
        } else if (lowCount < highCount) {
          lowCount += 1; highCount -= 1;
          var mv2 = high[0]; high.shift();
          var lp = insertDesc(low, mv2);
          return { kind: "highToLow", val: mv2, lp: lp };
        }
        return { kind: "none" };
      }

      function lowView(hot) { var o = { items: low.slice(), showIndex: true }; if (hot != null) o.highlights = [hot]; return o; }
      function highView(hot) { var o = { items: high.slice(), showIndex: true }; if (hot != null) o.highlights = [hot]; return o; }
      function resultView() { return { items: results.slice(), showIndex: true }; }
      function numsView(winStart, winEnd) {
        var items = nums.slice();
        var hl = [];
        for (var i = winStart; i <= winEnd; i++) hl.push(i);
        return { items: items, highlights: hl, showIndex: true };
      }
      function vars(extra) {
        var v = { "low.size": lowCount, "high.size": highCount, "i": null };
        for (var k in (extra || {})) v[k] = extra[k];
        return v;
      }

      function getMid(stepLine) {
        var mid;
        if (lowCount === highCount) {
          mid = (low[0] + high[0]) / 2;
          steps.push({
            line: stepLine, msg: "中位数：两堆一样多（各 " + lowCount + " 个），= (low.top + high.top)/2 = (" + low[0] + "+" + high[0] + ")/2 = " + mid,
            views: { vars: vars({ "中位数": mid }), nums: numsView(0, 0), low: lowView(0), high: highView(0), result: resultView() }
          });
        } else {
          mid = low[0];
          steps.push({
            line: stepLine, msg: "中位数：low 多一个，= low.top = " + mid,
            views: { vars: vars({ "中位数": mid }), nums: numsView(0, 0), low: lowView(0), high: highView(), result: resultView() }
          });
        }
        return mid;
      }

      // 初始：窗口起点
      steps.push({
        line: 2, msg: "窗口大小 k=" + k + "，nums=" + nums.join(",") + "。从窗口 [0," + (k - 1) + "] 开始。",
        views: { vars: vars(), nums: numsView(0, Math.min(k - 1, nums.length - 1)), low: lowView(), high: highView(), result: resultView() }
      });

      // 前 k 个插入
      for (var i = 0; i < k; i++) {
        var num = nums[i];
        if (low.length === 0 || num <= low[0]) {
          var li = insertDesc(low, num); lowCount += 1;
          steps.push({ line: 13, msg: "插入 nums[" + i + "]=" + num + "（较小），进 low。", views: { vars: vars({ "当前": num }), nums: numsView(0, Math.min(k - 1, nums.length - 1)), low: lowView(li), high: highView(), result: resultView() } });
        } else {
          var hi = insertAsc(high, num); highCount += 1;
          steps.push({ line: 16, msg: "插入 nums[" + i + "]=" + num + "（较大），进 high。", views: { vars: vars({ "当前": num }), nums: numsView(0, Math.min(k - 1, nums.length - 1)), low: lowView(), high: highView(hi), result: resultView() } });
        }
        var b = balance();
        if (b.kind === "lowToHigh") { steps.push({ line: 21, msg: "平衡：low 过多，把 " + b.val + " 移到 high。", views: { vars: vars({ "当前": num }), nums: numsView(0, 0), low: lowView(), high: highView(b.hp), result: resultView() } }); }
        else if (b.kind === "highToLow") { steps.push({ line: 25, msg: "平衡：high 过多，把 " + b.val + " 移到 low。", views: { vars: vars({ "当前": num }), nums: numsView(0, 0), low: lowView(b.lp), high: highView(), result: resultView() } }); }
      }
      // 首个中位
      var m0 = getMid(30);
      results.push(m0);
      steps.push({ line: 34, msg: "窗口 [0," + (k - 1) + "] 中位 = " + m0 + "。", views: { vars: vars({ "窗口中位": m0 }), nums: numsView(0, k - 1), low: lowView(), high: highView(), result: resultView() } });

      // 滑动
      for (var w = k; w < nums.length; w++) {
        var startWin = w - k + 1, endWin = w;
        var add = nums[w], drop = nums[w - k];
        // 加新元素
        if (low.length === 0 || add <= low[0]) { var l2 = insertDesc(low, add); lowCount += 1; steps.push({ line: 13, msg: "滑动窗口 [" + startWin + "," + endWin + "]：加入 " + add + "（较小）进 low。", views: { vars: vars({ "当前": add }), nums: numsView(startWin, endWin), low: lowView(l2), high: highView(), result: resultView() } }); }
        else { var h2 = insertAsc(high, add); highCount += 1; steps.push({ line: 16, msg: "滑动窗口 [" + startWin + "," + endWin + "]：加入 " + add + "（较大）进 high。", views: { vars: vars({ "当前": add }), nums: numsView(startWin, endWin), low: lowView(), high: highView(h2), result: resultView() } }); }
        var b2 = balance();
        if (b2.kind === "lowToHigh") { steps.push({ line: 21, msg: "平衡：" + b2.val + " 从 low 移到 high。", views: { vars: vars({ "当前": add }), nums: numsView(startWin, endWin), low: lowView(), high: highView(b2.hp), result: resultView() } }); }
        else if (b2.kind === "highToLow") { steps.push({ line: 25, msg: "平衡：" + b2.val + " 从 high 移到 low。", views: { vars: vars({ "当前": add }), nums: numsView(startWin, endWin), low: lowView(b2.lp), high: highView(), result: resultView() } }); }
        // 删旧元素（懒删除）
        removed[drop] = (removed[drop] || 0) + 1;
        var delLine;
        if (low.length > 0 && drop <= low[0]) { lowCount -= 1; delLine = 30; }
        else { highCount -= 1; delLine = 32; }
        // clean 视图像
        var lowClean = low.filter(function (x) { return (removed[x] || 0) <= 0; });
        var highClean = high.filter(function (x) { return (removed[x] || 0) <= 0; });
        steps.push({ line: delLine, msg: "删除滑出的 " + drop + "（懒删除：记 removed[" + drop + "]=" + (removed[drop]) + "，下次到顶时跳过）。", views: { vars: vars({ "删除": drop }), nums: numsView(startWin, endWin), low: lowView(), high: highView(), result: resultView() } });
        // 实际清理堆顶
        while (low.length && removed[low[0]] > 0) { removed[low[0]]--; low.shift(); }
        while (high.length && removed[high[0]] > 0) { removed[high[0]]--; high.shift(); }
        var b3 = balance();
        if (b3.kind === "lowToHigh") { steps.push({ line: 24, msg: "平衡：" + b3.val + " 移到 high。", views: { vars: vars(), nums: numsView(startWin, endWin), low: lowView(), high: highView(b3.hp), result: resultView() } }); }
        else if (b3.kind === "highToLow") { steps.push({ line: 26, msg: "平衡：" + b3.val + " 移到 low。", views: { vars: vars(), nums: numsView(startWin, endWin), low: lowView(b3.lp), high: highView(), result: resultView() } }); }
        // 中位
        var m2 = getMid(35);
        results.push(m2);
        steps.push({ line: 36, msg: "窗口 [" + startWin + "," + endWin + "] 中位 = " + m2 + "。", views: { vars: vars({ "窗口中位": m2 }), nums: numsView(startWin, endWin), low: lowView(), high: highView(), result: resultView() } });
      }

      return { steps: steps, output: JSON.stringify(results) };
    }
  };
})(typeof window !== "undefined" ? window : this);
