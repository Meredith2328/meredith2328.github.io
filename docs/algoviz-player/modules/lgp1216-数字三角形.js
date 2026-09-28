(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lgp1216-数字三角形"] = {
    title: "P1216 数字三角形 · 动态规划",
    language: "cpp",
    link: "https://www.luogu.com.cn/problem/P1216",
    code: [
      "#include <cstdio>",
      "#include <vector>",
      "#include <algorithm>",
      "using namespace std;",
      "int main() {",
      "    int n;",
      "    scanf(\"%d\", &n);",
      "    vector<vector<int>> a(n, vector<int>(n, 0));",
      "    for (int i = 0; i < n; i++) {",
      "        for (int j = 0; j <= i; j++) {",
      "            scanf(\"%d\", &a[i][j]);",
      "            if (i > 0) {",
      "                if (j == 0){",
      "                    a[i][j] += a[i - 1][j];",
      "                } else {",
      "                    a[i][j] += max(a[i - 1][j], a[i - 1][j - 1]);",
      "                }",
      "            }",
      "        }",
      "    }",
      "    int res = 0;",
      "    for (int j = 0; j < n; j++) {",
      "        res = max(res, a[n - 1][j]);",
      "    }",
      "    printf(\"%d\", res);",
      "    return 0;",
      "}"
    ].join("\n"),

    defaultInput: "4\n7\n3 8\n8 1 0\n2 7 4 4",
    inputHint: "第一行 n，接下来 n 行，第 i 行有 i 个数（空格分隔）",
    testInputs: [
      "1\n5",
      "5\n1\n2 3\n4 5 6\n7 8 9 10\n11 12 13 14 15"
    ],
    expectedOutputs: ["25", "5", "35"],

    views: {
      vars: { type: "vars", title: "变量" },
      grid: { type: "grid", title: "三角形 a" },
      res: { type: "vars", title: "结果" }
    },

    parseInput: function (text) {
      return text;
    },

    run: function (input) {
      var lines = input.trim().split(/\n/);
      var n = parseInt(lines[0], 10);
      var a = [];
      for (var i = 0; i < n; i++) {
        a.push([]);
        for (var j = 0; j < n; j++) a[i].push(0);
      }
      var steps = [];
      var gridView = function (hi, ok) {
        var cells = [];
        for (var i = 0; i < n; i++) {
          var row = [];
          for (var j = 0; j < n; j++) {
            row.push(a[i][j]);
          }
          cells.push(row);
        }
        var v = { cells: cells };
        if (hi) v.highlights = [hi];
        if (ok) v.ok = [ok];
        return v;
      };

      steps.push({
        line: 6, msg: "读取三角形行数 n = " + n + "。",
        views: {
          vars: { n: n, i: null, j: null, res: 0 },
          grid: gridView(),
          res: { res: 0 }
        }
      });

      for (var i = 0; i < n; i++) {
        var rowTokens = lines[i + 1].trim().split(/\s+/);
        for (var j = 0; j <= i; j++) {
          a[i][j] = parseInt(rowTokens[j], 10);
          steps.push({
            line: 10, msg: "读取 a[" + i + "][" + j + "] = " + a[i][j] + "。",
            views: {
              vars: { n: n, i: i, j: j, res: 0 },
              grid: gridView([i, j]),
              res: { res: 0 }
            }
          });
          if (i > 0) {
            if (j === 0) {
              a[i][j] += a[i - 1][j];
              steps.push({
                line: 12, msg: "j=0，只能从上方下来：a[" + i + "][" + j + "] += a[" + (i - 1) + "][" + j + "] = " + a[i][j] + "。",
                views: {
                  vars: { n: n, i: i, j: j, res: 0 },
                  grid: gridView([i, j]),
                  res: { res: 0 }
                }
              });
            } else {
              var old = a[i][j];
              a[i][j] += Math.max(a[i - 1][j], a[i - 1][j - 1]);
              steps.push({
                line: 14, msg: "取上方 " + a[i - 1][j] + " 和左上 " + a[i - 1][j - 1] + " 的较大者，a[" + i + "][" + j + "] = " + old + " + " + Math.max(a[i - 1][j], a[i - 1][j - 1]) + " = " + a[i][j] + "。",
                views: {
                  vars: { n: n, i: i, j: j, res: 0 },
                  grid: gridView([i, j]),
                  res: { res: 0 }
                }
              });
            }
          }
        }
      }

      var res = 0;
      steps.push({
        line: 18, msg: "开始找最后一行最大值，res 初始为 0。",
        views: {
          vars: { n: n, i: null, j: null, res: res },
          grid: gridView(),
          res: { res: res }
        }
      });

      for (var j = 0; j < n; j++) {
        res = Math.max(res, a[n - 1][j]);
        steps.push({
          line: 20, msg: "比较 a[" + (n - 1) + "][" + j + "] = " + a[n - 1][j] + "，res 更新为 " + res + "。",
          views: {
            vars: { n: n, i: null, j: j, res: res },
            grid: gridView([n - 1, j]),
            res: { res: res }
          }
        });
      }

      steps.push({
        line: 21, msg: "输出结果 " + res + "。",
        views: {
          vars: { n: n, i: null, j: null, res: res },
          grid: gridView(),
          res: { res: res }
        }
      });

      return { steps: steps, output: String(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);