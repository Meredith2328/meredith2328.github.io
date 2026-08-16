(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc240-搜索二维矩阵-ii-v2"] = {
    title: "240 搜索二维矩阵 II · 右上角收缩",
    language: "python",
    code: [
      "class Solution:",
      "    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:",
      "        x, y = 0, len(matrix[0]) - 1",
      "        while x < len(matrix) and y >= 0:",
      "            if target == matrix[x][y]:",
      "                return True",
      "            elif target < matrix[x][y]:",
      "                y -= 1",
      "            else:",
      "                x += 1",
      "        return False"
    ].join("\n"),

    defaultInput: "matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]]\ntarget = 5",
    inputHint: "每行一个变量，格式如 matrix = [[...]] / target = 数字",
    testInputs: [
      "matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]]\ntarget = 20",
      "matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]]\ntarget = 30"
    ],
    expectedOutputs: ["true", "false", "true"],

    views: {
      vars: { type: "vars", title: "变量" },
      grid: { type: "grid", title: "matrix" },
      pos: { type: "vars", title: "当前位置" }
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
      if (!Array.isArray(env.matrix) || !Array.isArray(env.matrix[0])) throw new Error("缺少 matrix = [[...]]");
      if (typeof env.target !== "number") throw new Error("缺少 target = 数字");
      return env;
    },

    run: function (input) {
      var matrix = input.matrix, target = input.target;
      var steps = [];
      var rows = matrix.length, cols = matrix[0].length;
      var x = 0, y = cols - 1;

      var gridView = function (hi, ok, bad) {
        var cells = [];
        for (var r = 0; r < rows; r++) {
          var row = [];
          for (var c = 0; c < cols; c++) {
            row.push(matrix[r][c]);
          }
          cells.push(row);
        }
        var v = { cells: cells };
        if (hi) v.highlights = [hi];
        if (ok) v.ok = [ok];
        if (bad) v.bad = [bad];
        return v;
      };

      steps.push({
        line: 3, msg: "初始化：从右上角开始，x=0, y=" + y + "。",
        views: {
          vars: { target: target, x: x, y: y },
          grid: gridView([x, y]),
          pos: { x: x, y: y }
        }
      });

      while (x < rows && y >= 0) {
        var cur = matrix[x][y];
        steps.push({
          line: 4, msg: "当前在 (" + x + ", " + y + ")，值为 " + cur + "。",
          views: {
            vars: { target: target, x: x, y: y, "matrix[x][y]": cur },
            grid: gridView([x, y]),
            pos: { x: x, y: y }
          }
        });

        if (target === cur) {
          steps.push({
            line: 5, msg: "找到目标 " + target + "，返回 true。",
            views: {
              vars: { target: target, x: x, y: y, "matrix[x][y]": cur },
              grid: gridView([x, y], [x, y]),
              pos: { x: x, y: y }
            }
          });
          return { steps: steps, output: "true" };
        }

        if (target < cur) {
          y -= 1;
          steps.push({
            line: 6, msg: "目标 " + target + " 小于当前值 " + cur + "，向左移动（y=" + y + "）。",
            views: {
              vars: { target: target, x: x, y: y },
              grid: gridView([x, y]),
              pos: { x: x, y: y }
            }
          });
        } else {
          x += 1;
          steps.push({
            line: 8, msg: "目标 " + target + " 大于当前值 " + cur + "，向下移动（x=" + x + "）。",
            views: {
              vars: { target: target, x: x, y: y },
              grid: gridView([x, y]),
              pos: { x: x, y: y }
            }
          });
        }
      }

      steps.push({
        line: 9, msg: "超出边界，未找到目标 " + target + "，返回 false。",
        views: {
          vars: { target: target, x: x, y: y },
          grid: gridView(),
          pos: { x: x, y: y }
        }
      });
      return { steps: steps, output: "false" };
    }
  };
})(typeof window !== "undefined" ? window : this);