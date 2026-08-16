(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc64-最小路径和"] = {
    title: "64 最小路径和 · 动态规划",
    language: "python",
    code: [
      "class Solution:",
      "    def minPathSum(self, grid: List[List[int]]) -> int:",
      "        m, n = len(grid), len(grid[0])",
      "        dp = [[float('inf')] * n for _ in range(m)]",
      "        dp[m - 1][n - 1] = grid[m - 1][n - 1]",
      "        for i in range(m - 2, -1, -1):",
      "            dp[i][n - 1] = dp[i + 1][n - 1] + grid[i][n - 1]",
      "        for j in range(n - 2, -1, -1):",
      "            dp[m - 1][j] = dp[m - 1][j + 1] + grid[m - 1][j]",
      "",
      "        for i in range(m - 2, -1, -1):",
      "            for j in range(n - 2, -1, -1):",
      "                # 下面右面二选一",
      "                dp[i][j] = min(dp[i + 1][j], dp[i][j + 1]) + grid[i][j]",
      "        return dp[0][0]"
    ].join("\n"),

    defaultInput: "grid = [[1,3,1],[1,5,1],[4,2,1]]",
    inputHint: "每行一个变量，格式如 grid = [[1,3,1],[1,5,1],[4,2,1]]",
    testInputs: [
      "grid = [[1,2,3],[4,5,6]]",
      "grid = [[5]]"
    ],
    expectedOutputs: [
      "7",
      "8",
      "5"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      grid: { type: "grid", title: "grid" },
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
      if (!Array.isArray(env.grid) || !Array.isArray(env.grid[0])) throw new Error("缺少 grid = [[...]]");
      return env;
    },

    run: function (input) {
      var grid = input.grid;
      var m = grid.length, n = grid[0].length;
      var steps = [];
      var INF = Infinity;

      var dp = [];
      for (var i = 0; i < m; i++) {
        dp.push(new Array(n).fill(INF));
      }

      var dpView = function (hotCell) {
        var cells = [];
        for (var i = 0; i < m; i++) {
          var row = [];
          for (var j = 0; j < n; j++) {
            row.push(dp[i][j] === INF ? "∞" : dp[i][j]);
          }
          cells.push(row);
        }
        var view = { cells: cells };
        if (hotCell) view.hot = [hotCell];
        return view;
      };

      var gridView = function (highlights) {
        return { cells: grid, highlights: highlights || [] };
      };

      steps.push({
        line: 3, msg: "开始：网格大小 m=" + m + ", n=" + n + "。",
        views: {
          vars: { m: m, n: n, i: null, j: null },
          grid: gridView(),
          dp: dpView()
        }
      });

      steps.push({
        line: 4, msg: "初始化 dp 为 m×n 的无穷大矩阵。",
        views: {
          vars: { m: m, n: n, i: null, j: null },
          grid: gridView(),
          dp: dpView()
        }
      });

      dp[m - 1][n - 1] = grid[m - 1][n - 1];
      steps.push({
        line: 5, msg: "终点 (" + (m - 1) + "," + (n - 1) + ") 的最小路径和就是它本身 " + grid[m - 1][n - 1] + "。",
        views: {
          vars: { m: m, n: n, i: null, j: null },
          grid: gridView([[m - 1, n - 1]]),
          dp: dpView([m - 1, n - 1])
        }
      });

      for (var i = m - 2; i >= 0; i--) {
        dp[i][n - 1] = dp[i + 1][n - 1] + grid[i][n - 1];
        steps.push({
          line: 6, msg: "处理最后一列：dp[" + i + "][" + (n - 1) + "] = dp[" + (i + 1) + "][" + (n - 1) + "] + grid[" + i + "][" + (n - 1) + "] = " + dp[i][n - 1] + "。",
          views: {
            vars: { m: m, n: n, i: i, j: n - 1 },
            grid: gridView([[i, n - 1]]),
            dp: dpView([i, n - 1])
          }
        });
      }

      for (var j = n - 2; j >= 0; j--) {
        dp[m - 1][j] = dp[m - 1][j + 1] + grid[m - 1][j];
        steps.push({
          line: 8, msg: "处理最后一行：dp[" + (m - 1) + "][" + j + "] = dp[" + (m - 1) + "][" + (j + 1) + "] + grid[" + (m - 1) + "][" + j + "] = " + dp[m - 1][j] + "。",
          views: {
            vars: { m: m, n: n, i: m - 1, j: j },
            grid: gridView([[m - 1, j]]),
            dp: dpView([m - 1, j])
          }
        });
      }

      for (var i = m - 2; i >= 0; i--) {
        for (var j = n - 2; j >= 0; j--) {
          var best = Math.min(dp[i + 1][j], dp[i][j + 1]);
          dp[i][j] = best + grid[i][j];
          steps.push({
            line: 12, msg: "dp[" + i + "][" + j + "] = min(dp[" + (i + 1) + "][" + j + "], dp[" + i + "][" + (j + 1) + "]) + grid[" + i + "][" + j + "] = " + best + " + " + grid[i][j] + " = " + dp[i][j] + "。",
            views: {
              vars: { m: m, n: n, i: i, j: j },
              grid: gridView([[i, j]]),
              dp: dpView([i, j])
            }
          });
        }
      }

      steps.push({
        line: 13, msg: "最终答案在 dp[0][0] = " + dp[0][0] + "。",
        views: {
          vars: { m: m, n: n, i: 0, j: 0, "答案": dp[0][0] },
          grid: gridView([[0, 0]]),
          dp: dpView([0, 0])
        }
      });

      return { steps: steps, output: JSON.stringify(dp[0][0]) };
    }
  };
})(typeof window !== "undefined" ? window : this);