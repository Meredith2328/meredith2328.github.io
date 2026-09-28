(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};
  global.AlgoVizModules["lgp2834-纸币问题3"] = {
    title: "P2834 纸币问题3 · 完全背包DP",
    language: "cpp",
    link: "https://www.luogu.com.cn/problem/P2834",
    code: [
      "#include <cstdio>",
      "using namespace std;",
      "int a[1010];",
      "int dp[10010];",
      "const int MOD = 1e9 + 7;",
      "int main() {",
      "    int n, w;",
      "    scanf(\"%d%d\", &n, &w);",
      "    for (int i = 0; i < n; i++) {",
      "        scanf(\"%d\", &a[i]);",
      "    }",
      "    // dp[i][j]: 用i种纸币凑出金额j的种数",
      "    dp[0] = 1;",
      "    for (int i = 0; i < n; i++) { // 当前只有x种纸币, 构造所有可能的金额 ",
      "        for (int j = a[i]; j <= w; j++) {",
      "            dp[j] = (dp[j] + dp[j - a[i]]) % MOD;",
      "        }",
      "    }",
      "    printf(\"%d\\n\", dp[w]);",
      "    return 0;",
      "}"
    ].join("\n"),

    defaultInput: "3 5\n1 2 3",
    inputHint: "第一行两个整数 n w（纸币种数、目标金额），第二行 n 个整数 a[i]（面值）",
    testInputs: [
      "2 10\n5 5",
      "1 0\n7"
    ],
    expectedOutputs: ["5", "3", "1"],

    views: {
      vars: { type: "vars", title: "变量" },
      dp: { type: "array", title: "dp（凑出金额j的种数）" },
      coins: { type: "array", title: "a（纸币面值）" }
    },

    parseInput: function (text) {
      return text;
    },

    run: function (input) {
      var lines = input.trim().split(/\n/);
      var first = lines[0].trim().split(/\s+/);
      var n = parseInt(first[0], 10);
      var w = parseInt(first[1], 10);
      var a = [];
      if (lines.length > 1) {
        var parts = lines[1].trim().split(/\s+/);
        for (var k = 0; k < n; k++) a.push(parseInt(parts[k], 10));
      }
      var MOD = 1000000007;
      var dp = new Array(w + 1);
      for (var t = 0; t <= w; t++) dp[t] = 0;
      var steps = [];

      var dpView = function (hotIdx) {
        var items = [];
        for (var i = 0; i <= w; i++) items.push(dp[i]);
        var v = { items: items, showIndex: true };
        if (hotIdx != null) v.highlights = [hotIdx];
        return v;
      };

      steps.push({
        line: 6,
        msg: "开始：n=" + n + " 种纸币，目标金额 w=" + w + "。",
        views: {
          vars: { n: n, w: w, i: null, j: null },
          coins: { items: a.slice(), showIndex: true },
          dp: dpView()
        }
      });

      steps.push({
        line: 8,
        msg: "读取所有纸币面值：" + a.join(", ") + "。",
        views: {
          vars: { n: n, w: w, i: null, j: null },
          coins: { items: a.slice(), showIndex: true },
          dp: dpView()
        }
      });

      steps.push({
        line: 11,
        msg: "初始化 dp[0]=1（凑出金额0有1种方案：什么都不选）。",
        views: {
          vars: { n: n, w: w, i: null, j: null, "dp[0]": 1 },
          coins: { items: a.slice(), showIndex: true },
          dp: dpView(0)
        }
      });
      dp[0] = 1;

      for (var i = 0; i < n; i++) {
        steps.push({
          line: 12,
          msg: "第 " + (i + 1) + " 种纸币，面值 " + a[i] + "。开始用它更新所有金额。",
          views: {
            vars: { n: n, w: w, i: i, j: null, "当前面值": a[i] },
            coins: { items: a.slice(), highlights: [i], showIndex: true },
            dp: dpView()
          }
        });

        for (var j = a[i]; j <= w; j++) {
          var old = dp[j];
          dp[j] = (dp[j] + dp[j - a[i]]) % MOD;
          steps.push({
            line: 13,
            msg: "金额 j=" + j + "：dp[" + j + "] = " + old + " + dp[" + (j - a[i]) + "] = " + old + " + " + (old === dp[j] ? "0" : dp[j - a[i]]) + " = " + dp[j] + "（取模后）。",
            views: {
              vars: { n: n, w: w, i: i, j: j, "当前面值": a[i], "dp[j]": dp[j] },
              coins: { items: a.slice(), highlights: [i], showIndex: true },
              dp: dpView(j)
            }
          });
        }
      }

      steps.push({
        line: 15,
        msg: "所有纸币处理完毕，dp[" + w + "]=" + dp[w] + "，输出答案。",
        views: {
          vars: { n: n, w: w, i: n, j: null, "答案": dp[w] },
          coins: { items: a.slice(), showIndex: true },
          dp: dpView(w)
        }
      });

      return { steps: steps, output: String(dp[w]) };
    }
  };
})(typeof window !== "undefined" ? window : this);