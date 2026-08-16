(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc70-爬楼梯"] = {
    title: "70 爬楼梯 · 动态规划",
    language: "python",
    code: [
      "class Solution:",
      "    def climbStairs(self, n: int) -> int:",
      "        # 问题的解由子问题的解组成.",
      "        # a[n] = a[n - 1] + a[n - 2]",
      "        a = [1, 1]",
      "        for i in range(2, n + 1):",
      "            a.append(a[i - 1] + a[i - 2])",
      "        return a[n]"
    ].join("\n"),

    defaultInput: "n = 5",
    inputHint: "每行一个变量，格式如 n = 5",
    testInputs: ["n = 1", "n = 10"],
    expectedOutputs: ["8", "89"],

    views: {
      vars: { type: "vars", title: "变量" },
      a: { type: "array", title: "a（爬楼梯方案数）" },
      dp: { type: "bars", title: "a 的柱状图" }
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
      if (typeof env.n !== "number" || env.n < 1) throw new Error("缺少 n = 正整数");
      return env;
    },

    run: function (input) {
      var n = input.n;
      var steps = [];
      var a = [1, 1];

      // 辅助函数：生成数组视图
      function arrView(highlights, ok, bad) {
        return {
          items: a.slice(),
          highlights: highlights || [],
          ok: ok || [],
          bad: bad || [],
          showIndex: true
        };
      }

      // 辅助函数：生成柱状图视图
      function barsView(highlights) {
        var bars = [];
        for (var j = 0; j < a.length; j++) {
          bars.push({ start: 0, end: a[j], label: String(j), status: (highlights && highlights.indexOf(j) >= 0) ? "hi" : "" });
        }
        return { bars: bars, axis: { min: 0, max: Math.max.apply(null, a), ticks: 4 } };
      }

      // 初始状态
      steps.push({
        line: 5,
        msg: "初始化 a = [1, 1]，表示爬 0 阶和 1 阶各有 1 种方法。",
        views: {
          vars: { n: n, i: null, "a[i-1]": null, "a[i-2]": null },
          a: arrView(),
          dp: barsView()
        }
      });

      // 边界情况：n = 1
      if (n === 1) {
        steps.push({
          line: 8,
          msg: "n = 1，直接返回 a[1] = " + a[1] + "。",
          views: {
            vars: { n: n, "返回值": a[1] },
            a: arrView([1], [1]),
            dp: barsView([1])
          }
        });
        return { steps: steps, output: JSON.stringify(a[1]) };
      }

      // 循环计算
      for (var i = 2; i <= n; i++) {
        var prev1 = a[i - 1];
        var prev2 = a[i - 2];
        var cur = prev1 + prev2;

        // 步骤：计算新值
        steps.push({
          line: 7,
          msg: "计算 a[" + i + "] = a[" + (i - 1) + "] + a[" + (i - 2) + "] = " + prev1 + " + " + prev2 + " = " + cur + "。",
          views: {
            vars: { n: n, i: i, "a[i-1]": prev1, "a[i-2]": prev2 },
            a: arrView([i - 1, i - 2]),
            dp: barsView([i - 1, i - 2])
          }
        });

        // 步骤：追加到数组
        a.push(cur);
        steps.push({
          line: 7,
          msg: "将 " + cur + " 追加到 a，现在 a = [" + a.join(", ") + "]。",
          views: {
            vars: { n: n, i: i, "a[i]": cur },
            a: arrView([i]),
            dp: barsView([i])
          }
        });
      }

      // 返回结果
      steps.push({
        line: 8,
        msg: "循环结束，返回 a[" + n + "] = " + a[n] + "。",
        views: {
          vars: { n: n, "返回值": a[n] },
          a: arrView([n], [n]),
          dp: barsView([n])
        }
      });

      return { steps: steps, output: JSON.stringify(a[n]) };
    }
  };
})(typeof window !== "undefined" ? window : this);