(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc73-矩阵置零"] = {
    title: "73 矩阵置零 · 暴力标记",
    link: "https://leetcode.cn/problems/set-matrix-zeroes/",
    language: "python",
    code: [
      "class Solution:",
      "    def setZeroes(self, matrix: List[List[int]]) -> None:",
      "        \"\"\"",
      "        Do not return anything, modify matrix in-place instead.",
      "        \"\"\"",
      "        waitlist = []",
      "        for i in range(len(matrix)):",
      "            for j in range(len(matrix[0])):",
      "                if matrix[i][j] == 0:",
      "                    waitlist.append((i,j))",
      "",
      "        for row, col in waitlist:",
      "            for j in range(len(matrix[0])):",
      "                matrix[row][j] = 0",
      "            for i in range(len(matrix)):",
      "                matrix[i][col] = 0"
    ].join("\n"),

    defaultInput: "matrix = [[1,1,1],[1,0,1],[1,1,1]]",
    inputHint: "每行一个变量，格式如 matrix = [[1,1,1],[1,0,1],[1,1,1]]",

    testInputs: [
      "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]",
      "matrix = [[1,2,3],[4,5,6]]"
    ],
    expectedOutputs: ["[[1,0,1],[0,0,0],[1,0,1]]", "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]", "[[1,2,3],[4,5,6]]"],

    views: {
      vars: { type: "vars", title: "变量" },
      matrix: { type: "grid", title: "matrix" },
      waitlist: { type: "array", title: "waitlist" }
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
      if (!Array.isArray(env.matrix) || !Array.isArray(env.matrix[0])) {
        throw new Error("缺少 matrix = [[...], [...]]");
      }
      return env;
    },

    run: function (input) {
      var matrix = input.matrix.map(function (row) { return row.slice(); });
      var rows = matrix.length, cols = matrix[0].length;
      var steps = [];
      var waitlist = [];

      var matrixView = function (hl, ok, bad) {
        return {
          cells: matrix.map(function (row) { return row.slice(); }),
          highlights: hl || [],
          ok: ok || [],
          bad: bad || []
        };
      };

      var waitlistView = function (hotIdx) {
        var items = waitlist.map(function (p) { return "(" + p[0] + "," + p[1] + ")"; });
        var hl = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) hl.push(hotIdx);
        return { items: items, highlights: hl };
      };

      steps.push({
        line: 5, msg: "开始：先扫描矩阵，记录所有值为 0 的位置。",
        views: {
          vars: { rows: rows, cols: cols, waitlist: [] },
          matrix: matrixView(),
          waitlist: waitlistView()
        }
      });

      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
          steps.push({
            line: 6, msg: "扫描第 " + i + " 行第 " + j + " 列，当前值 = " + matrix[i][j] + "。",
            views: {
              vars: { i: i, j: j, waitlist: waitlist.length },
              matrix: matrixView([[i, j]]),
              waitlist: waitlistView()
            }
          });
          if (matrix[i][j] === 0) {
            waitlist.push([i, j]);
            steps.push({
              line: 8, msg: "发现 0，记录位置 (" + i + "," + j + ") 到 waitlist。",
              views: {
                vars: { i: i, j: j, waitlist: waitlist.length },
                matrix: matrixView([[i, j]], [[i, j]]),
                waitlist: waitlistView(waitlist.length - 1)
              }
            });
          }
        }
      }

      steps.push({
        line: 10, msg: "扫描完成，共找到 " + waitlist.length + " 个 0。开始逐行逐列置零。",
        views: {
          vars: { waitlist: waitlist.length },
          matrix: matrixView(),
          waitlist: waitlistView()
        }
      });

      for (var k = 0; k < waitlist.length; k++) {
        var row = waitlist[k][0], col = waitlist[k][1];
        steps.push({
          line: 11, msg: "处理第 " + (k + 1) + " 个 0，位置 (" + row + "," + col + ")。",
          views: {
            vars: { row: row, col: col, waitlist: waitlist.length },
            matrix: matrixView([[row, col]], [[row, col]]),
            waitlist: waitlistView(k)
          }
        });

        for (var j2 = 0; j2 < cols; j2++) {
          matrix[row][j2] = 0;
        }
        steps.push({
          line: 12, msg: "将第 " + row + " 行整行置为 0。",
          views: {
            vars: { row: row, col: col },
            matrix: matrixView([], [[row, 0]]),
            waitlist: waitlistView(k)
          }
        });

        for (var i2 = 0; i2 < rows; i2++) {
          matrix[i2][col] = 0;
        }
        steps.push({
          line: 14, msg: "将第 " + col + " 列整列置为 0。",
          views: {
            vars: { row: row, col: col },
            matrix: matrixView([], [[0, col]]),
            waitlist: waitlistView(k)
          }
        });
      }

      steps.push({
        line: 10, msg: "所有 0 所在的行和列都已置零，完成。",
        views: {
          vars: { waitlist: waitlist.length },
          matrix: matrixView(),
          waitlist: waitlistView()
        }
      });

      return { steps: steps, output: JSON.stringify(matrix) };
    }
  };
})(typeof window !== "undefined" ? window : this);