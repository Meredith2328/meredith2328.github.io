(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc240-搜索二维矩阵-ii"] = {
    title: "240 搜索二维矩阵 II · 逐行二分",
    link: "https://leetcode.cn/problems/search-a-2d-matrix-ii/",
    language: "python",
    code: [
      "class Solution:",
      "    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:",
      "        for row in matrix:",
      "            idx = bisect.bisect_left(row, target)",
      "            if idx < len(row) and row[idx] == target:",
      "                return True",
      "        return False"
    ].join("\n"),

    defaultInput: "matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]]\ntarget = 5",
    inputHint: "每行一个变量，格式如 matrix = [[...],[...]] / target = 数字",

    testInputs: [
      "matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]]\ntarget = 20",
      "matrix = [[1,2,3],[4,5,6]]\ntarget = 7"
    ],
    expectedOutputs: ["true", "false", "false"],

    views: {
      vars: { type: "vars", title: "变量" },
      matrix: { type: "grid", title: "matrix" },
      row: { type: "array", title: "当前行 row" }
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
      if (!Array.isArray(env.matrix) || !Array.isArray(env.matrix[0])) throw new Error("缺少 matrix = [[...],[...]]");
      if (typeof env.target !== "number") throw new Error("缺少 target = 数字");
      return env;
    },

    run: function (input) {
      var matrix = input.matrix, target = input.target;
      var steps = [];
      var rows = matrix.length;
      var cols = rows > 0 ? matrix[0].length : 0;

      // 辅助：二分查找（bisect_left）
      function bisectLeft(arr, x) {
        var lo = 0, hi = arr.length;
        while (lo < hi) {
          var mid = Math.floor((lo + hi) / 2);
          if (arr[mid] < x) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      // 辅助：生成 matrix 视图
      function matrixView(highlightRow, highlightCell, okCell) {
        var cells = [];
        for (var r = 0; r < rows; r++) {
          var rowArr = [];
          for (var c = 0; c < cols; c++) {
            rowArr.push(matrix[r][c]);
          }
          cells.push(rowArr);
        }
        var view = { cells: cells };
        if (highlightRow != null) {
          var hl = [];
          for (var c = 0; c < cols; c++) hl.push([highlightRow, c]);
          view.highlights = hl;
        }
        if (highlightCell) view.highlights = [highlightCell];
        if (okCell) view.ok = [okCell];
        return view;
      }

      steps.push({
        line: 2,
        msg: "开始：在 " + rows + "x" + cols + " 矩阵中查找目标值 " + target + "。",
        views: {
          vars: { target: target, row: null, idx: null },
          matrix: matrixView(),
          row: { items: [] }
        }
      });

      for (var r = 0; r < rows; r++) {
        var row = matrix[r];
        steps.push({
          line: 3,
          msg: "取第 " + r + " 行作为当前行。",
          views: {
            vars: { target: target, row: r, idx: null },
            matrix: matrixView(r),
            row: { items: row.slice(), highlights: [] }
          }
        });

        var idx = bisectLeft(row, target);
        steps.push({
          line: 4,
          msg: "对当前行做二分查找（bisect_left），找到第一个 >= " + target + " 的位置 idx=" + idx + "。",
          views: {
            vars: { target: target, row: r, idx: idx },
            matrix: matrixView(r),
            row: { items: row.slice(), highlights: [idx] }
          }
        });

        if (idx < row.length && row[idx] === target) {
          steps.push({
            line: 5,
            msg: "idx=" + idx + " 在行内且 row[" + idx + "]=" + row[idx] + " 等于目标值，找到了！",
            views: {
              vars: { target: target, row: r, idx: idx, "row[idx]": row[idx] },
              matrix: matrixView(null, [r, idx], [r, idx]),
              row: { items: row.slice(), highlights: [idx], ok: [idx] }
            }
          });
          steps.push({
            line: 6,
            msg: "返回 true。",
            views: {
              vars: { "返回值": true },
              matrix: matrixView(null, null, [r, idx]),
              row: { items: row.slice(), ok: [idx] }
            }
          });
          return { steps: steps, output: "true" };
        }

        steps.push({
          line: 5,
          msg: "idx=" + idx + " 越界或 row[" + idx + "]=" + (idx < row.length ? row[idx] : "无") + " 不等于目标值，继续下一行。",
          views: {
            vars: { target: target, row: r, idx: idx },
            matrix: matrixView(r),
            row: { items: row.slice(), highlights: [idx], bad: [idx] }
          }
        });
      }

      steps.push({
        line: 7,
        msg: "所有行都检查完毕，未找到目标值 " + target + "。",
        views: {
          vars: { target: target, row: null, idx: null },
          matrix: matrixView(),
          row: { items: [] }
        }
      });
      return { steps: steps, output: "false" };
    }
  };
})(typeof window !== "undefined" ? window : this);