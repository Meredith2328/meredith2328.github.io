(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};
  global.AlgoVizModules["lgp2842-纸币问题1"] = {
    title: "P2842 纸币问题1 · 完全背包DP",
    language: "cpp",
    link: "https://www.luogu.com.cn/problem/P2842",
    code: [
      "#include <cstdio>",
      "#include <algorithm>",
      "#include <vector>",
      "using namespace std;",
      "",
      "const int INF = 0x3f3f3f3f;",
      "",
      "int main() {",
      "    int n, w;",
      "    scanf(\"%d%d\", &n, &w);",
      "    vector<int> costs(n);",
      "    for (int i = 0; i < n; i++) {",
      "        scanf(\"%d\", &costs[i]);",
      "    }",
      "    vector<int> dp(w + 10, INF);",
      "    dp[0] = 0;",
      "    for (int total = 1; total <= w; total++) {",
      "        for (int j = 0; j < n; j++) {",
      "            if (total >= costs[j] && dp[total - costs[j]] != INF) {",
      "                dp[total] = min(dp[total], dp[total - costs[j]] + 1);",
      "            }",
      "        }",
      "    }",
      "    printf(\"%d\\n\", dp[w]);",
      "    return 0;",
      "}"
    ].join("\n"),

    defaultInput: "3 5\n1 2 3",
    inputHint: "第一行：n w（纸币种类数、目标金额）；第二行：n 个纸币面额",
    testInputs: [
      "3 10\n2 3 5",
      "1 0\n7"
    ],
    expectedOutputs: ["2", "2", "0"],

    views: {
      vars: { type: "vars", title: "变量" },
      dp: { type: "array", title: "dp（最少张数）" },
      costs: { type: "array", title: "costs（面额）" }
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
        for (var i = 0; i < n && i < parts.length; i++) {
          costs.push(parseInt(parts[i], 10));
        }
      }
      var INF = 0x3f3f3f3f;
      var dp = [];
      for (var i = 0; i <= w + 9; i++) dp.push(INF);
      dp[0] = 0;

      var steps = [];
      var dpView = function (hotIdx) {
        var items = [];
        for (var i = 0; i <= w; i++) items.push(dp[i] === INF ? "∞" : dp[i]);
        var v = { items: items, showIndex: true };
        if (hotIdx != null) v.highlights = [hotIdx];
        return v;
      };

      steps.push({
        line: 8,
        msg: "读取输入：n=" + n + " 种纸币，目标金额 w=" + w + "。",
        views: {
          vars: { n: n, w: w, total: null, j: null },
          costs: { items: costs.slice() },
          dp: dpView()
        }
      });

      steps.push({
        line: 10,
        msg: "读取纸币面额：" + costs.join(", ") + "。",
        views: {
          vars: { n: n, w: w, total: null, j: null },
          costs: { items: costs.slice(), highlights: [] },
          dp: dpView()
        }
      });

      steps.push({
        line: 12,
        msg: "初始化 dp 数组，长度 w+10，全部设为 INF（表示不可达）。",
        views: {
          vars: { n: n, w: w, total: null, j: null },
          costs: { items: costs.slice() },
          dp: dpView()
        }
      });

      steps.push({
        line: 13,
        msg: "dp[0] = 0：凑出金额 0 需要 0 张纸币。",
        views: {
          vars: { n: n, w: w, total: null, j: null },
          costs: { items: costs.slice() },
          dp: dpView(0)
        }
      });

      for (var total = 1; total <= w; total++) {
        steps.push({
          line: 14,
          msg: "开始计算凑出金额 " + total + " 的最少张数。",
          views: {
            vars: { n: n, w: w, total: total, j: null },
            costs: { items: costs.slice() },
            dp: dpView(total)
          }
        });

        for (var j = 0; j < n; j++) {
          var cond = total >= costs[j] && dp[total - costs[j]] !== INF;
          steps.push({
            line: 16,
            msg: "考虑面额 " + costs[j] + "：金额 " + total + (cond ? " 可以用它凑。" : " 不能用它凑。"),
            views: {
              vars: { n: n, w: w, total: total, j: j },
              costs: { items: costs.slice(), highlights: [j] },
              dp: dpView(total)
            }
          });

          if (cond) {
            var candidate = dp[total - costs[j]] + 1;
            var old = dp[total];
            if (candidate < old) {
              dp[total] = candidate;
              steps.push({
                line: 17,
                msg: "dp[" + total + "] 从 " + (old === INF ? "∞" : old) + " 更新为 " + candidate + "（dp[" + (total - costs[j]) + "] + 1）。",
                views: {
                  vars: { n: n, w: w, total: total, j: j, "dp[total]": candidate },
                  costs: { items: costs.slice(), highlights: [j] },
                  dp: dpView(total)
                }
              });
            } else {
              steps.push({
                line: 17,
                msg: "dp[" + total + "] 保持 " + (old === INF ? "∞" : old) + "（候选值 " + candidate + " 不更优）。",
                views: {
                  vars: { n: n, w: w, total: total, j: j, "dp[total]": old },
                  costs: { items: costs.slice(), highlights: [j] },
                  dp: dpView(total)
                }
              });
            }
          }
        }
      }

      var ans = dp[w];
      steps.push({
        line: 19,
        msg: "输出 dp[" + w + "] = " + (ans === INF ? "∞（无法凑出）" : ans) + "。",
        views: {
          vars: { n: n, w: w, total: null, j: null, "答案": ans === INF ? "∞" : ans },
          costs: { items: costs.slice() },
          dp: dpView(w)
        }
      });

      return { steps: steps, output: String(ans === INF ? -1 : ans) };
    }
  };
})(typeof window !== "undefined" ? window : this);