(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};
  global.AlgoVizModules["lgp2840-纸币问题2"] = {
    title: "P2840 纸币问题2 · 完全背包计数",
    language: "cpp",
    link: "https://www.luogu.com.cn/problem/P2840",
    code: [
      "#include <cstdio>",
      "#include <algorithm>",
      "#include <vector>",
      "using namespace std;",
      "",
      "const int INF = 0x3f3f3f3f;",
      "const int mod = 1e9 + 7;",
      "",
      "int main() {",
      "    int n, w;",
      "    scanf(\"%d%d\", &n, &w);",
      "    vector<int> costs(n);",
      "    for (int i = 0; i < n; i++) {",
      "        scanf(\"%d\", &costs[i]);",
      "    }",
      "    vector<int> dp(w + 10, 0);",
      "    dp[0] = 1;",
      "    for (int total = 1; total <= w; total++) {",
      "        for (int j = 0; j < n; j++) {",
      "            if (total >= costs[j]) {",
      "                dp[total] = (dp[total] + dp[total - costs[j]]) % mod;",
      "            }",
      "        }",
      "    }",
      "    printf(\"%d\\n\", dp[w]);",
      "    return 0;",
      "}"
    ].join("\n"),

    defaultInput: "3 4\n1 2 3",
    inputHint: "第一行：n w（纸币种类数、目标金额）；第二行：n 个空格分隔的纸币面值",
    testInputs: [
      "2 5\n2 3",
      "1 0\n5"
    ],
    expectedOutputs: ["7", "2", "1"],

    views: {
      vars: { type: "vars", title: "变量" },
      dp: { type: "array", title: "dp（方案数）" },
      costs: { type: "array", title: "costs（面值）" }
    },

    parseInput: function (text) {
      return text;
    },

    run: function (input) {
      var lines = input.trim().split(/\n/);
      var first = lines[0].trim().split(/\s+/);
      var n = parseInt(first[0], 10);
      var w = parseInt(first[1], 10);
      var costs = [];
      if (lines.length > 1) {
        var parts = lines[1].trim().split(/\s+/);
        for (var i = 0; i < n; i++) {
          costs.push(parseInt(parts[i], 10));
        }
      }
      var mod = 1000000007;
      var dp = new Array(w + 10);
      for (var i = 0; i < dp.length; i++) dp[i] = 0;
      dp[0] = 1;

      var steps = [];
      var dpView = function (hotIdx) {
        var items = [];
        for (var i = 0; i <= w; i++) items.push(dp[i]);
        var v = { items: items, showIndex: true };
        if (hotIdx != null) v.highlights = [hotIdx];
        return v;
      };

      steps.push({
        line: 9,
        msg: "读取 n=" + n + "，w=" + w + "。",
        views: {
          vars: { n: n, w: w, total: null, j: null },
          costs: { items: costs.slice() },
          dp: dpView()
        }
      });

      steps.push({
        line: 11,
        msg: "读取 " + n + " 种纸币面值：" + costs.join(", ") + "。",
        views: {
          vars: { n: n, w: w, total: null, j: null },
          costs: { items: costs.slice(), highlights: [0] },
          dp: dpView()
        }
      });

      steps.push({
        line: 13,
        msg: "初始化 dp 数组，dp[0]=1（金额 0 有 1 种方案：不选任何纸币）。",
        views: {
          vars: { n: n, w: w, total: null, j: null },
          costs: { items: costs.slice() },
          dp: dpView(0)
        }
      });

      for (var total = 1; total <= w; total++) {
        steps.push({
          line: 14,
          msg: "开始计算金额 total=" + total + " 的方案数。",
          views: {
            vars: { n: n, w: w, total: total, j: null },
            costs: { items: costs.slice() },
            dp: dpView(total)
          }
        });

        for (var j = 0; j < n; j++) {
          steps.push({
            line: 15,
            msg: "尝试第 " + j + " 种纸币，面值 " + costs[j] + "。",
            views: {
              vars: { n: n, w: w, total: total, j: j },
              costs: { items: costs.slice(), highlights: [j] },
              dp: dpView(total)
            }
          });

          if (total >= costs[j]) {
            var old = dp[total];
            dp[total] = (dp[total] + dp[total - costs[j]]) % mod;
            steps.push({
              line: 17,
              msg: "total(" + total + ") >= 面值(" + costs[j] + ")，dp[" + total + "] += dp[" + (total - costs[j]) + "]（=" + dp[total - costs[j]] + "），得 " + old + " + " + dp[total - costs[j]] + " = " + dp[total] + "。",
              views: {
                vars: { n: n, w: w, total: total, j: j, "dp[total]": dp[total] },
                costs: { items: costs.slice(), highlights: [j] },
                dp: dpView(total)
              }
            });
          } else {
            steps.push({
              line: 16,
              msg: "total(" + total + ") < 面值(" + costs[j] + ")，跳过。",
              views: {
                vars: { n: n, w: w, total: total, j: j },
                costs: { items: costs.slice(), highlights: [j] },
                dp: dpView(total)
              }
            });
          }
        }
      }

      steps.push({
        line: 20,
        msg: "输出 dp[" + w + "] = " + dp[w] + "。",
        views: {
          vars: { n: n, w: w, total: null, j: null, "dp[w]": dp[w] },
          costs: { items: costs.slice() },
          dp: dpView(w)
        }
      });

      return { steps: steps, output: String(dp[w]) };
    }
  };
})(typeof window !== "undefined" ? window : this);