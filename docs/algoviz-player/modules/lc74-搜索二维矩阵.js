(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc74-搜索二维矩阵"] = {
    title: "74 搜索二维矩阵 · 逐行二分",
    link: "https://leetcode.cn/problems/search-a-2d-matrix/",
    language: "python",
    code: [
      "class Solution:",
      "    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:",
      "        m, n = len(matrix), len(matrix[0])",
      "        for i in range(m):",
      "            j = bisect.bisect_left(matrix[i], target)",
      "            if j < n and matrix[i][j] == target:",
      "                return True",
      "        return False"
    ].join("\n"),

    defaultInput: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]]\ntarget = 3",
    inputHint: "每行一个变量，格式如 matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]] / target = 3",

    views: {
      vars: { type: "vars", title: "变量" },
      matrix: { type: "grid", title: "matrix" },
      row: { type: "array", title: "当前行" }
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
      if (typeof env.target !== "number") throw new Error("缺少 target = 数字");
      return env;
    },

    run: function (input) {
      var matrix = input.matrix, target = input.target;
      var m = matrix.length, n = matrix[0].length;
      var steps = [];

      steps.push({
        line: 3, msg: "开始：矩阵有 " + m + " 行 " + n + " 列，目标值 target=" + target + "。",
        views: {
          vars: { m: m, n: n, target: target, i: null, j: null },
          matrix: { cells: matrix.map(function (r) { return r.slice(); }) },
          row: { items: [], showIndex: true }
        }
      });

      for (var i = 0; i < m; i++) {
        steps.push({
          line: 4, msg: "进入第 " + i + " 行（从 0 开始）。",
          views: {
            vars: { m: m, n: n, target: target, i: i, j: null },
            matrix: { cells: matrix.map(function (r) { return r.slice(); }), highlights: [[i, 0], [i, n - 1]] },
            row: { items: matrix[i].slice(), highlights: [], showIndex: true }
          }
        });

        var lo = 0, hi = n;
        var j = -1;
        var found = false;
        while (lo < hi) {
          var mid = Math.floor((lo + hi) / 2);
          steps.push({
            line: 5, msg: "二分查找：在行 " + i + " 中，区间 [" + lo + ", " + hi + ")，中点 mid=" + mid + "，值=" + matrix[i][mid] + "。",
            views: {
              vars: { m: m, n: n, target: target, i: i, j: null, lo: lo, hi: hi, mid: mid },
              matrix: { cells: matrix.map(function (r) { return r.slice(); }), highlights: [[i, mid]] },
              row: { items: matrix[i].slice(), highlights: [mid], pointers: { lo: lo, hi: hi, mid: mid }, showIndex: true }
            }
          });
          if (matrix[i][mid] < target) {
            lo = mid + 1;
            steps.push({
              line: 5, msg: "matrix[" + i + "][" + mid + "]=" + matrix[i][mid] + " < " + target + "，左边界移到 " + lo + "。",
              views: {
                vars: { m: m, n: n, target: target, i: i, j: null, lo: lo, hi: hi, mid: mid },
                matrix: { cells: matrix.map(function (r) { return r.slice(); }), highlights: [[i, mid]] },
                row: { items: matrix[i].slice(), highlights: [mid], pointers: { lo: lo, hi: hi }, showIndex: true }
              }
            });
          } else {
            hi = mid;
            steps.push({
              line: 5, msg: "matrix[" + i + "][" + mid + "]=" + matrix[i][mid] + " >= " + target + "，右边界移到 " + hi + "。",
              views: {
                vars: { m: m, n: n, target: target, i: i, j: null, lo: lo, hi: hi, mid: mid },
                matrix: { cells: matrix.map(function (r) { return r.slice(); }), highlights: [[i, mid]] },
                row: { items: matrix[i].slice(), highlights: [mid], pointers: { lo: lo, hi: hi }, showIndex: true }
              }
            });
          }
        }
        j = lo;
        steps.push({
          line: 5, msg: "二分结束，j=" + j + "（第一个 >= " + target + " 的位置）。",
          views: {
            vars: { m: m, n: n, target: target, i: i, j: j },
            matrix: { cells: matrix.map(function (r) { return r.slice(); }), highlights: [[i, j]] },
            row: { items: matrix[i].slice(), highlights: [j], pointers: { j: j }, showIndex: true }
          }
        });

        if (j < n && matrix[i][j] === target) {
          steps.push({
            line: 6, msg: "j=" + j + " 在范围内且 matrix[" + i + "][" + j + "]=" + matrix[i][j] + " 等于 " + target + "，找到！",
            views: {
              vars: { m: m, n: n, target: target, i: i, j: j },
              matrix: { cells: matrix.map(function (r) { return r.slice(); }), highlights: [[i, j]], ok: [[i, j]] },
              row: { items: matrix[i].slice(), highlights: [j], ok: [j], showIndex: true }
            }
          });
          steps.push({
            line: 7, msg: "返回 True。",
            views: {
              vars: { "返回值": true },
              matrix: { cells: matrix.map(function (r) { return r.slice(); }), ok: [[i, j]] },
              row: { items: matrix[i].slice(), ok: [j], showIndex: true }
            }
          });
          return { steps: steps, output: "true" };
        }
        steps.push({
          line: 6, msg: "j=" + j + " 越界或 matrix[" + i + "][" + j + "]=" + (j < n ? matrix[i][j] : "无") + " 不等于 " + target + "，继续下一行。",
          views: {
            vars: { m: m, n: n, target: target, i: i, j: j },
            matrix: { cells: matrix.map(function (r) { return r.slice(); }), highlights: [[i, j]] },
            row: { items: matrix[i].slice(), highlights: [j], showIndex: true }
          }
        });
      }

      steps.push({
        line: 8, msg: "所有行都检查完，没有找到 " + target + "，返回 False。",
        views: {
          vars: { "返回值": false },
          matrix: { cells: matrix.map(function (r) { return r.slice(); }) },
          row: { items: [], showIndex: true }
        }
      });
      return { steps: steps, output: "false" };
    }
  };
})(typeof window !== "undefined" ? window : this);