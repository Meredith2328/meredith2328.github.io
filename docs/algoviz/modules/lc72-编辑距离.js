(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc72-编辑距离"] = {
    title: "72 编辑距离 · 动态规划",
    language: "python",
    code: [
      "class Solution:",
      "    def minDistance(self, word1: str, word2: str) -> int:",
      "        m, n = len(word1), len(word2)",
      "        # 将word1[0:i]转化为word2[0:j]的最少操作数",
      "        dp = [[0] * (n + 1) for _ in range(m + 1)]",
      "        for i in range(m + 1):",
      "            dp[i][0] = i",
      "        for j in range(n + 1):",
      "            dp[0][j] = j",
      "",
      "        for i in range(1, m + 1):",
      "            for j in range(1, n + 1):",
      "                if word1[i - 1] == word2[j - 1]:",
      "                    dp[i][j] = dp[i - 1][j - 1]",
      "                else:",
      "                    dp[i][j] = min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1",
      "",
      "        return dp[m][n]"
    ].join("\n"),

    defaultInput: "word1 = \"horse\"\nword2 = \"ros\"",
    inputHint: "每行一个变量，格式如 word1 = \"horse\" / word2 = \"ros\"",

    testInputs: [
      "word1 = \"intention\"\nword2 = \"execution\"",
      "word1 = \"\"\nword2 = \"abc\""
    ],
    expectedOutputs: ["3", "5", "3"],

    views: {
      vars: { type: "vars", title: "变量" },
      dp: { type: "grid", title: "dp 表" },
      words: { type: "array", title: "word1 / word2" }
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
      if (typeof env.word1 !== "string") throw new Error("缺少 word1 = \"...\"");
      if (typeof env.word2 !== "string") throw new Error("缺少 word2 = \"...\"");
      return env;
    },

    run: function (input) {
      var word1 = input.word1, word2 = input.word2;
      var m = word1.length, n = word2.length;
      var steps = [];

      // 初始化 dp 表
      var dp = [];
      for (var i = 0; i <= m; i++) {
        dp.push(new Array(n + 1).fill(0));
      }

      // 辅助：生成 dp 视图
      function dpView(hi, ok) {
        var cells = [];
        for (var r = 0; r <= m; r++) {
          var row = [];
          for (var c = 0; c <= n; c++) {
            row.push(dp[r][c]);
          }
          cells.push(row);
        }
        var view = { cells: cells };
        if (hi) view.highlights = [hi];
        if (ok) view.ok = [ok];
        return view;
      }

      // 辅助：生成 words 视图
      function wordsView(hi1, hi2) {
        var items1 = word1.split('').map(function (ch) { return ch; });
        var items2 = word2.split('').map(function (ch) { return ch; });
        var view = {
          items: items1.concat(['|'], items2),
          highlights: []
        };
        if (hi1 != null) view.highlights.push(hi1);
        if (hi2 != null) view.highlights.push(m + 1 + hi2);
        return view;
      }

      // 步骤 1：初始化
      steps.push({
        line: 3,
        msg: "计算两个字符串的长度：m=" + m + "，n=" + n + "。",
        views: {
          vars: { m: m, n: n, i: null, j: null },
          dp: dpView(),
          words: wordsView()
        }
      });

      steps.push({
        line: 5,
        msg: "创建 (m+1)×(n+1) 的 dp 表，初始全为 0。",
        views: {
          vars: { m: m, n: n, i: null, j: null },
          dp: dpView(),
          words: wordsView()
        }
      });

      // 初始化第一列
      for (var i = 0; i <= m; i++) {
        dp[i][0] = i;
        steps.push({
          line: 7,
          msg: "初始化第一列：dp[" + i + "][0] = " + i + "（将 word1 前 " + i + " 个字符变为空串需要 " + i + " 次删除）。",
          views: {
            vars: { m: m, n: n, i: i, j: 0 },
            dp: dpView([i, 0]),
            words: wordsView(i - 1, null)
          }
        });
      }

      // 初始化第一行
      for (var j = 0; j <= n; j++) {
        dp[0][j] = j;
        steps.push({
          line: 9,
          msg: "初始化第一行：dp[0][" + j + "] = " + j + "（将空串变为 word2 前 " + j + " 个字符需要 " + j + " 次插入）。",
          views: {
            vars: { m: m, n: n, i: 0, j: j },
            dp: dpView([0, j]),
            words: wordsView(null, j - 1)
          }
        });
      }

      // 主循环
      for (var i = 1; i <= m; i++) {
        for (var j = 1; j <= n; j++) {
          var ch1 = word1[i - 1], ch2 = word2[j - 1];
          steps.push({
            line: 12,
            msg: "比较 word1[" + (i - 1) + "]='" + ch1 + "' 与 word2[" + (j - 1) + "]='" + ch2 + "'。",
            views: {
              vars: { m: m, n: n, i: i, j: j, "word1[i-1]": ch1, "word2[j-1]": ch2 },
              dp: dpView([i, j]),
              words: wordsView(i - 1, j - 1)
            }
          });

          if (ch1 === ch2) {
            dp[i][j] = dp[i - 1][j - 1];
            steps.push({
              line: 13,
              msg: "字符相同，dp[" + i + "][" + j + "] = dp[" + (i - 1) + "][" + (j - 1) + "] = " + dp[i][j] + "（无需额外操作）。",
              views: {
                vars: { m: m, n: n, i: i, j: j, "word1[i-1]": ch1, "word2[j-1]": ch2 },
                dp: dpView([i, j], [[i - 1, j - 1]]),
                words: wordsView(i - 1, j - 1)
              }
            });
          } else {
            var minVal = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
            dp[i][j] = minVal + 1;
            steps.push({
              line: 15,
              msg: "字符不同，取 min(替换=" + dp[i - 1][j - 1] + ", 删除=" + dp[i - 1][j] + ", 插入=" + dp[i][j - 1] + ") + 1 = " + dp[i][j] + "。",
              views: {
                vars: { m: m, n: n, i: i, j: j, "word1[i-1]": ch1, "word2[j-1]": ch2, "min": minVal },
                dp: dpView([i, j], [[i - 1, j - 1], [i - 1, j], [i, j - 1]]),
                words: wordsView(i - 1, j - 1)
              }
            });
          }
        }
      }

      // 返回结果
      steps.push({
        line: 17,
        msg: "计算完成，dp[" + m + "][" + n + "] = " + dp[m][n] + "，即最少编辑距离。",
        views: {
          vars: { m: m, n: n, "结果": dp[m][n] },
          dp: dpView([m, n], [[m, n]]),
          words: wordsView()
        }
      });

      return { steps: steps, output: JSON.stringify(dp[m][n]) };
    }
  };
})(typeof window !== "undefined" ? window : this);