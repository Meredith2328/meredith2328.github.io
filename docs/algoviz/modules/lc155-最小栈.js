(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc155-最小栈"] = {
    title: "155 最小栈 · 有序辅助栈",
    language: "python",
    code: [
      "class MinStack:",
      "",
      "    def __init__(self):",
      "        # 两个结构各自实现栈和最小",
      "        self.stk = []",
      "        self.minStk = []",
      "",
      "    def push(self, val: int) -> None:",
      "        self.stk.append(val)",
      "        i = bisect.bisect_left(self.minStk, val)",
      "        self.minStk.insert(i, val)",
      "",
      "    def pop(self) -> None:",
      "        val = self.stk.pop()",
      "        i = bisect.bisect_left(self.minStk, val)",
      "        self.minStk.pop(i)",
      "",
      "    def top(self) -> int:",
      "        return self.stk[-1]",
      "",
      "    def getMin(self) -> int:",
      "        return self.minStk[0]",
      "",
      "",
      "        # Your MinStack object will be instantiated and called as such:",
      "        # obj = MinStack()",
      "        # obj.push(val)",
      "        # obj.pop()",
      "        # param_3 = obj.top()",
      "# param_4 = obj.getMin()"
    ].join("\n"),

    defaultInput: "ops = [\"MinStack\",\"push\",\"push\",\"push\",\"getMin\",\"pop\",\"top\",\"getMin\"]\nargs = [[],[-2],[0],[-3],[],[],[],[]]",
    inputHint: "每行一个变量，格式如 ops = [...] / args = [...]，其中 ops 是操作名列表，args 是对应参数列表。",
    testInputs: [
      "ops = [\"MinStack\",\"push\",\"push\",\"push\",\"getMin\",\"pop\",\"getMin\"]\nargs = [[],[1],[2],[3],[],[],[]]",
      "ops = [\"MinStack\",\"push\",\"pop\",\"getMin\"]\nargs = [[],[1],[],[]]"
    ],
    expectedOutputs: [
      "[null,null,null,null,-3,null,0,-2]",
      "[null,null,null,null,1,null,1]",
      "[null,null,null,null]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      stk: { type: "stack", title: "stk（主栈）" },
      minStk: { type: "array", title: "minStk（有序）" }
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
      if (!Array.isArray(env.ops)) throw new Error("缺少 ops = [...]");
      if (!Array.isArray(env.args)) throw new Error("缺少 args = [...]");
      if (env.ops.length !== env.args.length) throw new Error("ops 和 args 长度必须一致");
      return env;
    },

    run: function (input) {
      var ops = input.ops, args = input.args;
      var steps = [];
      var stk = [], minStk = [];
      var output = [];

      // 模拟 bisect_left
      function bisectLeft(arr, x) {
        var lo = 0, hi = arr.length;
        while (lo < hi) {
          var mid = (lo + hi) >> 1;
          if (arr[mid] < x) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      function stkView() {
        return { items: stk.slice() };
      }
      function minView(hotIdx) {
        var o = { items: minStk.slice() };
        if (hotIdx != null && hotIdx >= 0 && hotIdx < minStk.length) {
          o.highlights = [hotIdx];
        }
        return o;
      }

      // 初始化
      steps.push({
        line: 3, msg: "初始化 MinStack：创建主栈 stk 和有序辅助栈 minStk。",
        views: {
          vars: { "操作": "MinStack()", "返回值": null },
          stk: stkView(),
          minStk: minView()
        }
      });
      output.push(null);

      for (var opIdx = 0; opIdx < ops.length; opIdx++) {
        var op = ops[opIdx];
        var arg = args[opIdx][0];

        if (op === "MinStack") {
          // 已在初始化处理
          continue;
        }

        if (op === "push") {
          var val = arg;
          steps.push({
            line: 8, msg: "push(" + val + ")：将 " + val + " 压入主栈 stk。",
            views: {
              vars: { "操作": "push(" + val + ")", "val": val, "返回值": null },
              stk: stkView(),
              minStk: minView()
            }
          });
          stk.push(val);

          var i = bisectLeft(minStk, val);
          steps.push({
            line: 9, msg: "在 minStk 中二分查找 " + val + " 的插入位置，得到 i=" + i + "。",
            views: {
              vars: { "操作": "push(" + val + ")", "val": val, "i": i, "返回值": null },
              stk: stkView(),
              minStk: minView()
            }
          });
          minStk.splice(i, 0, val);
          steps.push({
            line: 10, msg: "将 " + val + " 插入 minStk 的索引 " + i + " 处，保持有序。",
            views: {
              vars: { "操作": "push(" + val + ")", "val": val, "i": i, "返回值": null },
              stk: stkView(),
              minStk: minView(i)
            }
          });
          output.push(null);
        }

        else if (op === "pop") {
          var popped = stk[stk.length - 1];
          steps.push({
            line: 13, msg: "pop()：弹出主栈栈顶元素 " + popped + "。",
            views: {
              vars: { "操作": "pop()", "val": popped, "返回值": null },
              stk: stkView(),
              minStk: minView()
            }
          });
          stk.pop();

          var j = bisectLeft(minStk, popped);
          steps.push({
            line: 14, msg: "在 minStk 中二分查找 " + popped + " 的位置，得到 i=" + j + "。",
            views: {
              vars: { "操作": "pop()", "val": popped, "i": j, "返回值": null },
              stk: stkView(),
              minStk: minView()
            }
          });
          minStk.splice(j, 1);
          steps.push({
            line: 15, msg: "从 minStk 中移除索引 " + j + " 处的元素 " + popped + "。",
            views: {
              vars: { "操作": "pop()", "val": popped, "i": j, "返回值": null },
              stk: stkView(),
              minStk: minView()
            }
          });
          output.push(null);
        }

        else if (op === "top") {
          var topVal = stk[stk.length - 1];
          steps.push({
            line: 18, msg: "top()：返回主栈栈顶元素 " + topVal + "。",
            views: {
              vars: { "操作": "top()", "返回值": topVal },
              stk: stkView(),
              minStk: minView()
            }
          });
          output.push(topVal);
        }

        else if (op === "getMin") {
          var minVal = minStk[0];
          steps.push({
            line: 21, msg: "getMin()：返回 minStk 的第一个元素（最小值）" + minVal + "。",
            views: {
              vars: { "操作": "getMin()", "返回值": minVal },
              stk: stkView(),
              minStk: minView(0)
            }
          });
          output.push(minVal);
        }
      }

      steps.push({
        line: 21, msg: "所有操作执行完毕，最终输出结果。",
        views: {
          vars: { "最终输出": JSON.stringify(output) },
          stk: stkView(),
          minStk: minView()
        }
      });

      return { steps: steps, output: JSON.stringify(output) };
    }
  };
})(typeof window !== "undefined" ? window : this);