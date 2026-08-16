(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc73-矩阵置零-v2"] = {
    title: "73 矩阵置零 · 标记法",
    language: "python",
    code: [
      "class Solution:",
      "    def setZeroes(self, matrix: List[List[int]]) -> None:",
      "        \"\"\"",
      "        Do not return anything, modify matrix in-place instead.",
      "        \"\"\"",
      "        rows = [0] * len(matrix)",
      "        cols = [0] * len(matrix[0])",
      "",
      "        for i in range(len(rows)):",
      "            for j in range(len(cols)):",
      "                if matrix[i][j] == 0:",
      "                    rows[i], cols[j] = 1, 1",
      "",
      "        for i in range(len(rows)):",
      "            if rows[i] != 0:",
      "                for j in range(len(cols)):",
      "                    matrix[i][j] = 0",
      "",
      "        for j in range(len(cols)):",
      "            if cols[j] != 0:",
      "                for i in range(len(rows)):",
      "                    matrix[i][j] = 0"
    ].join("\n"),

    defaultInput: "matrix = [[1,1,1],[1,0,1],[1,1,1]]",
    inputHint: "每行一个变量，格式如 matrix = [[1,1,1],[1,0,1],[1,1,1]]",
    testInputs: [
      "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]",
      "matrix = [[1,2,3],[4,5,6]]"
    ],
    expectedOutputs: [
      "[[1,0,1],[0,0,0],[1,0,1]]",
      "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]",
      "[[1,2,3],[4,5,6]]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      matrix: { type: "grid", title: "matrix" },
      rows: { type: "array", title: "rows 标记" },
      cols: { type: "array", title: "cols 标记" }
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
      if (!Array.isArray(env.matrix) || !Array.isArray(env.matrix[0])) throw new Error("缺少 matrix = [[...], [...]]");
      return env;
    },

    run: function (input) {
      var matrix = input.matrix.map(function (row) { return row.slice(); });
      var rows = [], cols = [];
      var steps = [];
      var R = matrix.length, C = matrix[0].length;

      var gridView = function (hi, ok) {
        return { cells: matrix.map(function (r) { return r.slice(); }), highlights: hi || [], ok: ok || [] };
      };

      steps.push({
        line: 2, msg: "开始：将矩阵中所有含 0 的行和列全部置为 0。",
        views: {
          vars: { R: R, C: C },
          matrix: gridView(),
          rows: { items: [] },
          cols: { items: [] }
        }
      });

      for (var i = 0; i < R; i++) rows.push(0);
      for (var j = 0; j < C; j++) cols.push(0);

      steps.push({
        line: 5, msg: "初始化标记数组：rows 长度 " + R + "，cols 长度 " + C + "，全部为 0。",
        views: {
          vars: { R: R, C: C },
          matrix: gridView(),
          rows: { items: rows.slice() },
          cols: { items: cols.slice() }
        }
      });

      for (i = 0; i < R; i++) {
        for (j = 0; j < C; j++) {
          steps.push({
            line: 8, msg: "检查 matrix[" + i + "][" + j + "] = " + matrix[i][j] + "。",
            views: {
              vars: { i: i, j: j, val: matrix[i][j] },
              matrix: gridView([[i, j]]),
              rows: { items: rows.slice() },
              cols: { items: cols.slice() }
            }
          });
          if (matrix[i][j] === 0) {
            rows[i] = 1; cols[j] = 1;
            steps.push({
              line: 9, msg: "发现 0，标记 rows[" + i + "] = 1，cols[" + j + "] = 1。",
              views: {
                vars: { i: i, j: j, val: 0 },
                matrix: gridView([[i, j]], [[i, j]]),
                rows: { items: rows.slice(), highlights: [i] },
                cols: { items: cols.slice(), highlights: [j] }
              }
            });
          }
        }
      }

      for (i = 0; i < R; i++) {
        if (rows[i] !== 0) {
          steps.push({
            line: 12, msg: "第 " + i + " 行有 0，将该行全部置 0。",
            views: {
              vars: { i: i },
              matrix: gridView(),
              rows: { items: rows.slice(), highlights: [i] },
              cols: { items: cols.slice() }
            }
          });
          for (j = 0; j < C; j++) {
            matrix[i][j] = 0;
          }
          steps.push({
            line: 13, msg: "第 " + i + " 行已全部置为 0。",
            views: {
              vars: { i: i },
              matrix: gridView([[i, 0], [i, C - 1]], [[i, 0], [i, C - 1]]),
              rows: { items: rows.slice(), highlights: [i] },
              cols: { items: cols.slice() }
            }
          });
        }
      }

      for (j = 0; j < C; j++) {
        if (cols[j] !== 0) {
          steps.push({
            line: 16, msg: "第 " + j + " 列有 0，将该列全部置 0。",
            views: {
              vars: { j: j },
              matrix: gridView(),
              rows: { items: rows.slice() },
              cols: { items: cols.slice(), highlights: [j] }
            }
          });
          for (i = 0; i < R; i++) {
            matrix[i][j] = 0;
          }
          steps.push({
            line: 17, msg: "第 " + j + " 列已全部置为 0。",
            views: {
              vars: { j: j },
              matrix: gridView([[0, j], [R - 1, j]], [[0, j], [R - 1, j]]),
              rows: { items: rows.slice() },
              cols: { items: cols.slice(), highlights: [j] }
            }
          });
        }
      }

      steps.push({
        line: 17, msg: "完成！矩阵已原地修改。",
        views: {
          vars: {},
          matrix: gridView(),
          rows: { items: rows.slice() },
          cols: { items: cols.slice() }
        }
      });

      return { steps: steps, output: JSON.stringify(matrix) };
    }
  };
})(typeof window !== "undefined" ? window : this);