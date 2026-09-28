/* algoviz module: 复旦大学2025 · 独立数的中位数 (C++ DualHeap 四种状态转移, hand-written)
 * 原题 noobdream 10093。维护"出现次数恰为1"的数的流式窗口，每步输出其中位数（取整），窗口空输出 -1。
 * defaultInput 是 OJ 标准输入：第一行 n k，接下来 k 个起始数，再往后逐个滑入。 */
(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["oj10093-独立数的中位数-复旦大学2025"] = {
    title: "10093 独立数的中位数 · 双堆状态转移",
    language: "cpp",
    link: "https://noobdream.com/DreamJudge/Issue/page/10093/",
    code: [
      "#include <cstdio>",
      "#include <vector>",
      "#include <unordered_map>",
      "#include <queue>",
      "using namespace std;",
      "int nums[500010];",
      "",
      "class DualHeap {",
      "private:",
      "    priority_queue<int> low;       // 大根堆，候选较小的一半",
      "    priority_queue<int, vector<int>, greater<int>> high; // 小根堆",
      "    unordered_map<int, int> removed;",
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
      "    int getMid() {",
      "        return low.top();",
      "    }",
      "",
      "    int size() {",
      "        return lowCount + highCount;",
      "    }",
      "};",
      "",
      "int main() {",
      "    int n, k;",
      "    scanf(\"%d%d\", &n, &k);",
      "",
      "    DualHeap dualHeap;",
      "    unordered_map<int, int> counter;",
      "    for (int i = 0; i < k; i++) {",
      "        scanf(\"%d\", &nums[i]);",
      "        counter[nums[i]]++;",
      "        if (counter[nums[i]] == 1) {",
      "            dualHeap.insert(nums[i]);",
      "        } else if (counter[nums[i]] == 2) {",
      "            dualHeap.erase(nums[i]);",
      "        }",
      "    }",
      "    if (dualHeap.size() == 0) {",
      "        printf(\"-1\\n\");",
      "    } else {",
      "        printf(\"%d\\n\", dualHeap.getMid());",
      "    }",
      "    for (int i = k; i < n; i++) {",
      "        scanf(\"%d\", &nums[i]);",
      "        counter[nums[i - k]]--;",
      "        if (counter[nums[i - k]] == 1) {",
      "            dualHeap.insert(nums[i - k]);",
      "        } else if (counter[nums[i - k]] == 0) {",
      "            dualHeap.erase(nums[i - k]);",
      "        }",
      "",
      "        counter[nums[i]]++;",
      "        if (counter[nums[i]] == 1) {",
      "            dualHeap.insert(nums[i]);",
      "        } else if (counter[nums[i]] == 2) {",
      "            dualHeap.erase(nums[i]);",
      "        }",
      "",
      "        if (dualHeap.size() == 0) {",
      "            printf(\"-1\\n\");",
      "        } else {",
      "            printf(\"%d\\n\", dualHeap.getMid());",
      "        }",
      "    }",
      "",
      "    return 0;",
      "}"
    ].join("\n"),

    defaultInput: "6 3\n2 2 1 3 1 2",
    inputHint: "第一行 n k（总长、窗口大小）；第二行起 n 个数",
    testInputs: [
      "3 2\n1 2 3",
      "4 2\n1 1 1 1"
    ],
    expectedOutputs: [
      "1\n2\n3\n2",
      "1\n2",
      "-1\n-1\n-1"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums 流" },
      counter: { type: "vars", title: "计数 counter" },
      low: { type: "array", title: "low（较小一半，大根堆）" },
      high: { type: "array", title: "high（较大一半，小根堆）" }
    },

    parseInput: function (text) {
      return text;
    },

    run: function (input) {
      var lines = input.trim().split(/\n/);
      var nk = lines[0].trim().split(/\s+/);
      var n = parseInt(nk[0], 10), k = parseInt(nk[1], 10);
      var arr = [];
      for (var idx = 1; idx < lines.length; idx++) {
        var numsLine = lines[idx].trim().split(/\s+/);
        for (var c = 0; c < numsLine.length; c++) if (numsLine[c].length) arr.push(parseInt(numsLine[c], 10));
      }
      var nums = arr;

      var steps = [];
      var low = [], high = [];       // low 降序(arr[0]=max), high 升序(arr[0]=min)
      var removed = {}, counter = {};
      var lowCount = 0, highCount = 0;
      var outputs = [];

      function insertDesc(a, v) { var i = 0; while (i < a.length && a[i] > v) i++; a.splice(i, 0, v); return i; }
      function insertAsc(a, v) { var i = 0; while (i < a.length && a[i] < v) i++; a.splice(i, 0, v); return i; }

      function countView() {
        var o = {};
        var keys = Object.keys(counter);
        for (var i = 0; i < keys.length; i++) o[keys[i]] = counter[keys[i]];
        return o;
      }
      function lowView(hot) { var o = { items: low.slice(), showIndex: true }; if (hot != null) o.highlights = [hot]; return o; }
      function highView(hot) { var o = { items: high.slice(), showIndex: true }; if (hot != null) o.highlights = [hot]; return o; }
      function numsView(i) { var o = { items: nums.slice(), showIndex: true }; if (i != null) o.highlights = [i]; return o; }
      function vars(extra) {
        var v = { "low.size": lowCount, "high.size": highCount };
        for (var e in (extra || {})) v[e] = extra[e];
        return v;
      }

      function clean(heap) {
        while (heap.length && (removed[heap[0]] || 0) > 0) { removed[heap[0]]--; heap.shift(); }
      }

      function insertVal(num, hotLine) {
        if (low.length === 0 || num <= low[0]) {
          var li = insertDesc(low, num); lowCount += 1;
          steps.push({ line: hotLine, msg: "插入 " + num + "（较小/唯一）进 low。", views: { vars: vars({ "操作": "insert " + num }), nums: numsView(), counter: countView(), low: lowView(li), high: highView() } });
        } else {
          var hi = insertAsc(high, num); highCount += 1;
          steps.push({ line: hotLine, msg: "插入 " + num + "（较大）进 high。", views: { vars: vars({ "操作": "insert " + num }), nums: numsView(), counter: countView(), low: lowView(), high: highView(hi) } });
        }
        var b = balance();
        if (b.kind === "lowToHigh") steps.push({ line: 23, msg: "平衡：" + b.val + " 移到 high。", views: { vars: vars({ "操作": "insert " + num }), nums: numsView(), counter: countView(), low: lowView(), high: highView(b.hp) } });
        else if (b.kind === "highToLow") steps.push({ line: 27, msg: "平衡：" + b.val + " 移到 low。", views: { vars: vars({ "操作": "insert " + num }), nums: numsView(), counter: countView(), low: lowView(b.lp), high: highView() } });
      }

      function eraseVal(num, hotLine) {
        removed[num] = (removed[num] || 0) + 1;
        var inLow = low.length > 0 && num <= low[0];
        if (inLow) { lowCount -= 1; clean(low); }
        else { highCount -= 1; clean(high); }
        steps.push({ line: hotLine, msg: "删除 " + num + "（懒删除 removed[" + num + "]=" + removed[num] + "），" + (inLow ? "从 low 计数-1" : "从 high 计数-1") + "。", views: { vars: vars({ "操作": "erase " + num }), nums: numsView(), counter: countView(), low: lowView(), high: highView() } });
        var b = balance();
        if (b.kind === "lowToHigh") steps.push({ line: 23, msg: "平衡：" + b.val + " 移到 high。", views: { vars: vars({ "操作": "erase " + num }), nums: numsView(), counter: countView(), low: lowView(), high: highView(b.hp) } });
        else if (b.kind === "highToLow") steps.push({ line: 27, msg: "平衡：" + b.val + " 移到 low。", views: { vars: vars({ "操作": "erase " + num }), nums: numsView(), counter: countView(), low: lowView(b.lp), high: highView() } });
      }

      function balance() {
        if (lowCount > highCount + 1) {
          lowCount -= 1; highCount += 1;
          var mv = low[0]; low.shift(); var hp = insertAsc(high, mv);
          return { kind: "lowToHigh", val: mv, hp: hp };
        } else if (lowCount < highCount) {
          lowCount += 1; highCount -= 1;
          var mv2 = high[0]; high.shift(); var lp = insertDesc(low, mv2);
          return { kind: "highToLow", val: mv2, lp: lp };
        }
        return { kind: "none" };
      }

      function outputMid(line, pos) {
        if (lowCount + highCount === 0) {
          outputs.push(-1);
          steps.push({ line: line, msg: "候选为空，输出 -1。", views: { vars: vars({ "输出": -1 }), nums: numsView(pos), counter: countView(), low: lowView(), high: highView() } });
        } else {
          var mid = low[0];
          outputs.push(mid);
          steps.push({ line: line, msg: "中位数（取整）= low.top = " + mid + "。", views: { vars: vars({ "输出": mid }), nums: numsView(pos), counter: countView(), low: lowView(0), high: highView() } });
        }
      }

      // 初始
      steps.push({ line: 27, msg: "读入 n=" + n + "，k=" + k + "。初始窗口将读入前 " + k + " 个数。", views: { vars: vars({ "n": n, "k": k }), nums: numsView(), counter: countView(), low: lowView(), high: highView() } });

      for (var i = 0; i < k && i < nums.length; i++) {
        var v = nums[i];
        counter[v] = (counter[v] || 0) + 1;
        if (counter[v] === 1) { steps.push({ line: 33, msg: "读入 " + v + "：第一次出现（计数1），加入候选集。", views: { vars: vars({ "当前": v, "count": 1 }), nums: numsView(i), counter: countView(), low: lowView(), high: highView() } }); insertVal(v, 35); }
        else if (counter[v] === 2) { steps.push({ line: 36, msg: "读入 " + v + "：变成2个（计数2），从候选集移除。", views: { vars: vars({ "当前": v, "count": 2 }), nums: numsView(i), counter: countView(), low: lowView(), high: highView() } }); eraseVal(v, 37); }
      }
      // 窗口满后输出第一个中位
      steps.push({ line: 32, msg: "初始窗口形成，输出中位数。", views: { vars: vars(), nums: numsView(k - 1), counter: countView(), low: lowView(), high: highView() } });
      outputMid(34, k - 1);

      // 滑动
      for (var i2 = k; i2 < nums.length; i2++) {
        var inV = nums[i2];
        // 退出旧窗口元素 nums[i2-k]
        var outV = nums[i2 - k];
        counter[outV] = (counter[outV] || 0) - 1;
        if (counter[outV] === 1) { steps.push({ line: 42, msg: "滑出 " + outV + "：计数变1，加回候选集。", views: { vars: vars({ "滑出": outV, "count": 1 }), nums: numsView(i2 - k), counter: countView(), low: lowView(), high: highView() } }); insertVal(outV, 44); }
        else if (counter[outV] === 0) { steps.push({ line: 45, msg: "滑出 " + outV + "：计数归0，从候选集移除。", views: { vars: vars({ "滑出": outV, "count": 0 }), nums: numsView(i2 - k), counter: countView(), low: lowView(), high: highView() } }); eraseVal(outV, 46); }

        counter[inV] = (counter[inV] || 0) + 1;
        if (counter[inV] === 1) { steps.push({ line: 49, msg: "滑入 " + inV + "：第一次出现，加入候选集。", views: { vars: vars({ "滑入": inV, "count": 1 }), nums: numsView(i2), counter: countView(), low: lowView(), high: highView() } }); insertVal(inV, 51); }
        else if (counter[inV] === 2) { steps.push({ line: 52, msg: "滑入 " + inV + "：变成2个，从候选集移除。", views: { vars: vars({ "滑入": inV, "count": 2 }), nums: numsView(i2), counter: countView(), low: lowView(), high: highView() } }); eraseVal(inV, 53); }

        outputMid(55, i2);
      }

      return { steps: steps, output: outputs.join("\n") };
    }
  };
})(typeof window !== "undefined" ? window : this);
