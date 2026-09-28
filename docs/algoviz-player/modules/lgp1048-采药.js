(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};
  global.AlgoVizModules["lgp1048-采药"] = {
    title: "P1048 采药 · 0/1背包",
    language: "cpp",
    link: "https://www.luogu.com.cn/problem/P1048",
    code: [
      "#include <cstdio>",
      "#include <algorithm>",
      "using namespace std;",
      "int dp[1010];",
      "int main() {",
      "    int T, M, t, v;",
      "    scanf(\"%d%d\", &T, &M);",
      "    // dp[i][j]表示前i种草药在j时间内能获得的最大价值",
      "    for (int i = 0; i < M; i++) {",
      "        scanf(\"%d%d\", &t, &v);",
      "        for (int j = T; j >= t; j--) {",
      "            dp[j] = max(dp[j], dp[j - t] + v);",
      "        }",
      "    }",
      "    printf(\"%d\\n\", dp[T]);",
      "    return 0;",
      "}"
    ].join("\n"),

    defaultInput: "10 3\n3 4\n4 5\n5 6",
    inputHint: "第一行：T M（总时间、草药数）；接下来 M 行：每行 t v（采摘时间、价值）",
    testInputs: [
      "5 2\n2 3\n3 4",
      "1 1\n2 5"
    ],
    expectedOutputs: ["11", "7", "0"],

    views: {
      vars: { type: "vars", title: "变量" },
      dp: { type: "array", title: "dp（一维滚动数组）" },
      herbs: { type: "array", title: "草药列表" }
    },

    parseInput: function (text) {
      return text;
    },

    run: function (input) {
      var lines = input.trim().split(/\n/);
      var first = lines[0].trim().split(/\s+/);
      var T = parseInt(first[0], 10);
      var M = parseInt(first[1], 10);
      var herbs = [];
      for (var i = 1; i <= M; i++) {
        var parts = lines[i].trim().split(/\s+/);
        herbs.push({ t: parseInt(parts[0], 10), v: parseInt(parts[1], 10) });
      }

      var steps = [];
      var dp = new Array(T + 1);
      for (var j = 0; j <= T; j++) dp[j] = 0;

      var dpView = function (hotIdx) {
        var items = dp.slice();
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx <= T) highlights.push(hotIdx);
        return { items: items, highlights: highlights, showIndex: true };
      };

      var herbsView = function (cur) {
        var items = [];
        for (var i = 0; i < herbs.length; i++) {
          items.push("(" + herbs[i].t + "," + herbs[i].v + ")");
        }
        var highlights = [];
        if (cur != null && cur >= 0 && cur < herbs.length) highlights.push(cur);
        return { items: items, highlights: highlights, showIndex: true };
      };

      steps.push({
        line: 5,
        msg: "开始：总时间 T=" + T + "，草药数 M=" + M + "。dp 数组初始化为 0。",
        views: {
          vars: { T: T, M: M, t: null, v: null, i: null, j: null },
          dp: dpView(),
          herbs: herbsView()
        }
      });

      for (var i = 0; i < M; i++) {
        var t = herbs[i].t;
        var v = herbs[i].v;
        steps.push({
          line: 8,
          msg: "第 " + (i + 1) + " 种草药：时间 t=" + t + "，价值 v=" + v + "。",
          views: {
            vars: { T: T, M: M, t: t, v: v, i: i, j: null },
            dp: dpView(),
            herbs: herbsView(i)
          }
        });

        for (var j = T; j >= t; j--) {
          var old = dp[j];
          var cand = dp[j - t] + v;
          var newVal = old > cand ? old : cand;
          dp[j] = newVal;
          steps.push({
            line: 10,
            msg: "j=" + j + "：dp[" + j + "] = max(" + old + ", dp[" + (j - t) + "] + " + v + ") = max(" + old + ", " + cand + ") = " + newVal + "。",
            views: {
              vars: { T: T, M: M, t: t, v: v, i: i, j: j, "dp[j-t]": dp[j - t], "候选值": cand },
              dp: dpView(j),
              herbs: herbsView(i)
            }
          });
        }
      }

      steps.push({
        line: 13,
        msg: "所有草药处理完毕，最大价值为 dp[" + T + "] = " + dp[T] + "。",
        views: {
          vars: { T: T, M: M, "最终答案": dp[T] },
          dp: dpView(T),
          herbs: herbsView()
        }
      });

      return { steps: steps, output: String(dp[T]) };
    }
  };
})(typeof window !== "undefined" ? window : this);