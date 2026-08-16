(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc72-编辑距离-v2"] = {
    title: "312 戳气球 · 区间DP",
    language: "python",
    code: [
      "class Solution:",
      "    def maxCoins(self, nums: List[int]) -> int:",
      "        points = [1] + nums + [1]",
      "        n = len(points)",
      "        dp = [[0] * n for _ in range(n)]",
      "        for length in range(2, n): # 开区间 (i, j)",
      "            for i in range(0, n - length):",
      "                j = i + length",
      "                for k in range(i + 1, j):",
      "                    dp[i][j] = max(dp[i][j], points[i] * points[k] * points[j] + dp[i][k] + dp[k][j])",
      "        return dp[0][n - 1]"
    ].join("\n"),

    defaultInput: "nums = [3, 1, 5, 8]",
    inputHint: "每行一个变量，格式如 nums = [3, 1, 5, 8]",
    testInputs: ["nums = [1, 5]", "nums = [5]"],
    expectedOutputs: ["167", "10", "5"],

    views: {
      vars: { type: "vars", title: "变量" },
      points: { type: "array", title: "points" },
      dp: { type: "grid", title: "dp" }
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
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...]");
      return env;
    },

    run: function (input) {
      var nums = input.nums;
      var steps = [];
      var points = [1].concat(nums, [1]);
      var n = points.length;
      var dp = [];
      for (var i = 0; i < n; i++) {
        dp.push(new Array(n).fill(0));
      }

      var dpView = function (hotCell) {
        var cells = [];
        for (var r = 0; r < n; r++) {
          var row = [];
          for (var c = 0; c < n; c++) {
            row.push(dp[r][c]);
          }
          cells.push(row);
        }
        var view = { cells: cells };
        if (hotCell) {
          view.highlights = [hotCell];
        }
        return view;
      };

      steps.push({
        line: 3,
        msg: "构造 points 数组，在两端各加一个 1：[" + points.join(", ") + "]",
        views: {
          vars: { n: n, length: null, i: null, j: null, k: null },
          points: { items: points.slice() },
          dp: dpView()
        }
      });

      steps.push({
        line: 4,
        msg: "n = " + n + "，dp 是 " + n + "x" + n + " 的矩阵，初始全为 0。",
        views: {
          vars: { n: n, length: null, i: null, j: null, k: null },
          points: { items: points.slice() },
          dp: dpView()
        }
      });

      for (var length = 2; length < n; length++) {
        steps.push({
          line: 5,
          msg: "开始处理区间长度 length=" + length + "（开区间 (i, j) 的长度）。",
          views: {
            vars: { n: n, length: length, i: null, j: null, k: null },
            points: { items: points.slice() },
            dp: dpView()
          }
        });

        for (var i = 0; i < n - length; i++) {
          var j = i + length;
          steps.push({
            line: 6,
            msg: "枚举左端点 i=" + i + "，对应右端点 j=" + j + "。",
            views: {
              vars: { n: n, length: length, i: i, j: j, k: null },
              points: { items: points.slice(), highlights: [i, j] },
              dp: dpView()
            }
          });

          steps.push({
            line: 7,
            msg: "计算 j = i + length = " + i + " + " + length + " = " + j + "。",
            views: {
              vars: { n: n, length: length, i: i, j: j, k: null },
              points: { items: points.slice(), highlights: [i, j] },
              dp: dpView()
            }
          });

          for (var k = i + 1; k < j; k++) {
            var score = points[i] * points[k] * points[j] + dp[i][k] + dp[k][j];
            var oldVal = dp[i][j];
            if (score > oldVal) {
              dp[i][j] = score;
            }
            steps.push({
              line: 8,
              msg: "尝试 k=" + k + "：得分 " + points[i] + "*" + points[k] + "*" + points[j] + " + dp[" + i + "][" + k + "](" + dp[i][k] + ") + dp[" + k + "][" + j + "](" + dp[k][j] + ") = " + score + "，dp[" + i + "][" + j + "] 从 " + oldVal + " 更新为 " + dp[i][j] + "。",
              views: {
                vars: { n: n, length: length, i: i, j: j, k: k, "得分": score },
                points: { items: points.slice(), highlights: [i, k, j] },
                dp: dpView([i, j])
              }
            });
          }
        }
      }

      var result = dp[0][n - 1];
      steps.push({
        line: 9,
        msg: "最终答案 dp[0][" + (n - 1) + "] = " + result + "。",
        views: {
          vars: { "最终答案": result },
          points: { items: points.slice() },
          dp: dpView([0, n - 1])
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);