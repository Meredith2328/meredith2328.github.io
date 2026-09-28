(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc739-每日温度"] = {
    title: "739 每日温度 · 单调栈",
    link: "https://leetcode.cn/problems/daily-temperatures/",
    language: "python",
    code: [
      "class Solution:",
      "    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:",
      "        stk = []",
      "        res = [0] * len(temperatures)",
      "        for i, temp in enumerate(temperatures):",
      "            while stk and stk[-1][1] < temp:",
      "                cur_i, _ = stk.pop()",
      "                res[cur_i] = i - cur_i",
      "            stk.append((i, temp))",
      "        return res"
    ].join("\n"),

    defaultInput: "temperatures = [73, 74, 75, 71, 69, 72, 76, 73]",
    inputHint: "每行一个变量，格式如 temperatures = [73, 74, 75, 71, 69, 72, 76, 73]",
    testInputs: [
      "temperatures = [30, 40, 50, 60]",
      "temperatures = [30, 60, 90]"
    ],
    expectedOutputs: [
      "[1,1,4,2,1,1,0,0]",
      "[1,1,1,0]",
      "[1,1,0]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      temps: { type: "array", title: "temperatures" },
      res: { type: "array", title: "res" },
      stk: { type: "stack", title: "栈 stk" }
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
      if (!Array.isArray(env.temperatures)) throw new Error("缺少 temperatures = [...]");
      return env;
    },

    run: function (input) {
      var temperatures = input.temperatures;
      var steps = [];
      var stk = []; // 栈中元素为 [index, temp]
      var res = new Array(temperatures.length).fill(0);

      var stkView = function (hotIdx) {
        var items = stk.map(function (pair) { return pair[1]; });
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) highlights.push(hotIdx);
        return { items: items, highlights: highlights };
      };

      steps.push({
        line: 2, msg: "开始：计算每个温度之后需要等多少天才会出现更高的温度。",
        views: {
          vars: { i: null, temp: null, "栈顶温度": null },
          temps: { items: temperatures.slice() },
          res: { items: res.slice() },
          stk: stkView()
        }
      });

      steps.push({
        line: 3, msg: "初始化空栈 stk。",
        views: {
          vars: { i: null, temp: null, "栈顶温度": null },
          temps: { items: temperatures.slice() },
          res: { items: res.slice() },
          stk: stkView()
        }
      });

      steps.push({
        line: 4, msg: "初始化结果数组 res，长度与 temperatures 相同，全部为 0。",
        views: {
          vars: { i: null, temp: null, "栈顶温度": null },
          temps: { items: temperatures.slice() },
          res: { items: res.slice() },
          stk: stkView()
        }
      });

      for (var i = 0; i < temperatures.length; i++) {
        var temp = temperatures[i];
        steps.push({
          line: 5, msg: "遍历到下标 i=" + i + "，当前温度 temp=" + temp + "。",
          views: {
            vars: { i: i, temp: temp, "栈顶温度": stk.length ? stk[stk.length - 1][1] : null },
            temps: { items: temperatures.slice(), highlights: [i], pointers: { i: i } },
            res: { items: res.slice() },
            stk: stkView()
          }
        });

        while (stk.length > 0 && stk[stk.length - 1][1] < temp) {
          var topIdx = stk.length - 1;
          steps.push({
            line: 6, msg: "栈顶温度 " + stk[topIdx][1] + " 小于当前温度 " + temp + "，进入 while 循环。",
            views: {
              vars: { i: i, temp: temp, "栈顶温度": stk[topIdx][1] },
              temps: { items: temperatures.slice(), highlights: [i], pointers: { i: i } },
              res: { items: res.slice() },
              stk: stkView(topIdx)
            }
          });

          var cur_i = stk[topIdx][0];
          stk.pop();
          steps.push({
            line: 7, msg: "弹出栈顶元素，其下标 cur_i=" + cur_i + "。",
            views: {
              vars: { i: i, temp: temp, "cur_i": cur_i },
              temps: { items: temperatures.slice(), highlights: [i], pointers: { i: i } },
              res: { items: res.slice() },
              stk: stkView()
            }
          });

          res[cur_i] = i - cur_i;
          steps.push({
            line: 8, msg: "计算天数差：res[" + cur_i + "] = " + i + " - " + cur_i + " = " + (i - cur_i) + "。",
            views: {
              vars: { i: i, temp: temp, "cur_i": cur_i, "天数差": i - cur_i },
              temps: { items: temperatures.slice(), highlights: [i], pointers: { i: i } },
              res: { items: res.slice(), highlights: [cur_i], ok: [cur_i] },
              stk: stkView()
            }
          });
        }

        stk.push([i, temp]);
        steps.push({
          line: 9, msg: "将当前下标和温度 (" + i + ", " + temp + ") 压入栈。",
          views: {
            vars: { i: i, temp: temp, "栈顶温度": temp },
            temps: { items: temperatures.slice(), highlights: [i], pointers: { i: i } },
            res: { items: res.slice() },
            stk: stkView(stk.length - 1)
          }
        });
      }

      steps.push({
        line: 10, msg: "遍历结束，返回结果数组 res。",
        views: {
          vars: { i: temperatures.length, temp: null, "栈顶温度": null },
          temps: { items: temperatures.slice() },
          res: { items: res.slice(), ok: res.map(function (_, idx) { return idx; }) },
          stk: stkView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);