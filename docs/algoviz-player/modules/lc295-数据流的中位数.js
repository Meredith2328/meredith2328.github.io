/* algoviz module: LeetCode 295 数据流的中位数 (C++ 双堆, hand-written)
 * 模拟 MedianFinder: addNum → 双堆维护 → findMedian 返回当前中位数。
 * defaultInput 是操作序列，每行一条：addNum <数字> 或 findMedian。 */
(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc295-数据流的中位数"] = {
    title: "295 数据流的中位数 · 双堆",
    language: "cpp",
    link: "https://leetcode.cn/problems/find-median-from-data-stream",
    code: [
      "class MedianFinder {",
      "private:",
      "    priority_queue<int> low;   // 大根堆，存较小的一半，top=其中最大",
      "    priority_queue<int, vector<int>, greater<int>> high; // 小根堆，存较大的一半",
      "",
      "public:",
      "    MedianFinder() {}",
      "",
      "    void addNum(int num) {",
      "        if (low.empty() || num <= low.top()) {",
      "            low.push(num);",
      "        } else {",
      "            high.push(num);",
      "        }",
      "",
      "        if (low.size() > high.size() + 1) {",
      "            high.push(low.top());",
      "            low.pop();",
      "        } else if (low.size() < high.size()) {",
      "            low.push(high.top());",
      "            high.pop();",
      "        }",
      "    }",
      "",
      "    double findMedian() {",
      "        if (low.size() == high.size()) {",
      "            return ((double)low.top() + high.top()) / 2.0;",
      "        } else {",
      "            return low.top();",
      "        }",
      "    }",
      "};"
    ].join("\n"),

    defaultInput: "addNum 1\naddNum 2\nfindMedian\naddNum 3\nfindMedian",
    inputHint: "每行一个操作：addNum <数字> 或 findMedian（addNum 加入一个数，findMedian 返回当前中位数）",
    testInputs: [
      "addNum 2\naddNum 3\nfindMedian",
      "addNum 4\nfindMedian"
    ],
    expectedOutputs: [
      "[1.5,2]",
      "[2.5]",
      "[4]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      low: { type: "array", title: "low（大根堆，较小一半，顶部最大）" },
      high: { type: "array", title: "high（小根堆，较大一半，顶部最小）" },
      result: { type: "array", title: "中位数结果" }
    },

    parseInput: function (text) {
      var ops = [];
      text.split(/\n/).forEach(function (line) {
        line = line.trim();
        if (!line) return;
        var m = /^addNum\s+(-?\d+)$/i.exec(line);
        if (m) { ops.push({ op: "add", num: parseInt(m[1], 10) }); return; }
        if (/^findMedian$/i.test(line)) { ops.push({ op: "find" }); return; }
        throw new Error("无法识别的操作：" + line + "（应为 addNum <数字> 或 findMedian）");
      });
      if (!ops.length) throw new Error("至少需要一个操作");
      return ops;
    },

    run: function (input) {
      var steps = [];
      var low = [];    // 降序数组，index0=最大（模拟大根堆 top）
      var high = [];   // 升序数组，index0=最小（模拟小根堆 top）
      var results = [];

      function insertDesc(arr, v) { // arr 降序，插入后仍降序，返回下标
        var i = 0;
        while (i < arr.length && arr[i] > v) i++;
        arr.splice(i, 0, v);
        return i;
      }
      function insertAsc(arr, v) {  // arr 升序，插入后仍升序
        var i = 0;
        while (i < arr.length && arr[i] < v) i++;
        arr.splice(i, 0, v);
        return i;
      }

      function lowView(hot) {
        var o = { items: low.slice(), showIndex: true };
        if (hot != null) { o.highlights = (o.highlights || []); o.highlights.push(hot); }
        return o;
      }
      function highView(hot) {
        var o = { items: high.slice(), showIndex: true };
        if (hot != null) { o.highlights = (o.highlights || []); o.highlights.push(hot); }
        return o;
      }
      function resultView() {
        return { items: results.slice(), showIndex: true };
      }
      function vars(extra) {
        var v = { "low.size": low.length, "high.size": high.length };
        for (var k in (extra || {})) v[k] = extra[k];
        return v;
      }

      // 初始步（对应用户代码第 14 行 addNum 前的准备，指向类声明）
      steps.push({
        line: 10, msg: "开始：MedianFinder 空结构，双堆 low/high 都为空。",
        views: { vars: vars(), low: lowView(), high: highView(), result: resultView() }
      });

      for (var t = 0; t < input.length; t++) {
        var op = input[t];
        if (op.op === "add") {
          var num = op.num;
          var toLow, lineNo;
          if (low.length === 0 || num <= low[0]) {
            toLow = true; lineNo = 10;
          } else {
            toLow = false; lineNo = 13;
          }
          if (toLow) { var li = insertDesc(low, num); steps.push({
            line: 11, msg: "addNum " + num + "：num ≤ low.top（" + low[0] + "），加入大根堆 low。",
            views: { vars: vars({ "当前": num }), low: lowView(li), high: highView(), result: resultView() }
          }); }
          else { var hi = insertAsc(high, num); steps.push({
            line: 14, msg: "addNum " + num + "：num > low.top（" + low[0] + "），加入小根堆 high。",
            views: { vars: vars({ "当前": num }), low: lowView(), high: highView(hi), result: resultView() }
          }); }

          // 平衡：low 比 high 多 1 个以上
          if (low.length > high.length + 1) {
            var moved = low[0];
            low.shift();
            var hpos = insertAsc(high, moved);
            steps.push({
              line: 17, msg: "失衡：low 比 high 多 2 个，把 low.top（" + moved + "）移到 high。",
              views: { vars: vars({ "当前": num }), low: lowView(), high: highView(hpos), result: resultView() }
            });
          } else if (low.length < high.length) {
            var moved2 = high[0];
            high.shift();
            var lpos = insertDesc(low, moved2);
            steps.push({
              line: 19, msg: "失衡：low 比 high 少，把 high.top（" + moved2 + "）移到 low。",
              views: { vars: vars({ "当前": num }), low: lowView(lpos), high: highView(), result: resultView() }
            });
          } else {
            steps.push({
              line: 21, msg: "平衡保持：low.size=" + low.length + "，high.size=" + high.length + "，相差 ≤1。",
              views: { vars: vars({ "当前": num }), low: lowView(), high: highView(), result: resultView() }
            });
          }
        } else { // findMedian
          var mid;
          if (low.length === high.length) {
            mid = (low[0] + high[0]) / 2;
            steps.push({
              line: 24, msg: "findMedian：两堆一样多（" + low.length + " 个），中位数 = (low.top + high.top) / 2 = (" + low[0] + "+" + high[0] + ")/2 = " + mid + "。",
              views: { vars: vars({ "中位数": mid }), low: lowView(0), high: highView(0), result: resultView() }
            });
          } else {
            mid = low[0];
            steps.push({
              line: 26, msg: "findMedian：奇数个元素，中位数 = low.top = " + mid + "。",
              views: { vars: vars({ "中位数": mid }), low: lowView(0), high: highView(), result: resultView() }
            });
          }
          results.push(mid);
          steps.push({
            line: 27, msg: "记录本次中位数 " + mid + "。",
            views: { vars: vars({ "中位数": mid }), low: lowView(), high: highView(), result: resultView() }
          });
        }
      }

      return { steps: steps, output: JSON.stringify(results) };
    }
  };
})(typeof window !== "undefined" ? window : this);
