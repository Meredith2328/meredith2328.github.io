(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc54-螺旋矩阵"] = {
    title: "54 螺旋矩阵 · 模拟",
    language: "python",
    code: [
      "class Solution:",
      "    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:",
      "        m, n = len(matrix), len(matrix[0])",
      "        visited = [n * [0] for _ in range(m)]",
      "",
      "        # 顺时针",
      "        dx = [0, 1, 0, -1]",
      "        dy = [1, 0, -1, 0]",
      "        x, y = 0, 0",
      "        d = 0",
      "        res = []",
      "",
      "        for _ in range(m * n):",
      "            res.append(matrix[x][y])",
      "            visited[x][y] = 1",
      "",
      "            # 行, 列",
      "            nx, ny = x + dx[d], y + dy[d]",
      "            if (0 <= nx < m) and (0 <= ny < n) and (not visited[nx][ny]):",
      "                x, y = nx, ny",
      "            else:",
      "                d = (d + 1) % 4",
      "                x, y = x + dx[d], y + dy[d]",
      "",
      "        return res"
    ].join("\n"),

    defaultInput: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
    inputHint: "每行一个变量，格式如 matrix = [[1,2,3],[4,5,6],[7,8,9]]",
    testInputs: [
      "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]",
      "matrix = [[1]]"
    ],
    expectedOutputs: [
      "[1,2,3,6,9,8,7,4,5]",
      "[1]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      grid: { type: "grid", title: "matrix" },
      visited: { type: "grid", title: "visited" },
      res: { type: "array", title: "res" }
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
      var matrix = input.matrix;
      var m = matrix.length, n = matrix[0].length;
      var steps = [];

      var visited = [];
      for (var i = 0; i < m; i++) {
        visited.push([]);
        for (var j = 0; j < n; j++) visited[i].push(0);
      }

      var dx = [0, 1, 0, -1];
      var dy = [1, 0, -1, 0];
      var x = 0, y = 0, d = 0;
      var res = [];

      var gridView = function (hl, ok) {
        var cells = [];
        for (var i = 0; i < m; i++) {
          var row = [];
          for (var j = 0; j < n; j++) row.push(matrix[i][j]);
          cells.push(row);
        }
        var v = { cells: cells };
        if (hl) v.highlights = [hl];
        if (ok) v.ok = [ok];
        return v;
      };

      var visitedView = function (hl) {
        var cells = [];
        for (var i = 0; i < m; i++) {
          var row = [];
          for (var j = 0; j < n; j++) row.push(visited[i][j]);
          cells.push(row);
        }
        var v = { cells: cells };
        if (hl) v.highlights = [hl];
        return v;
      };

      steps.push({
        line: 3, msg: "矩阵大小 m=" + m + ", n=" + n + "，初始化 visited 全 0。",
        views: {
          vars: { m: m, n: n, x: null, y: null, d: null, res: [] },
          grid: gridView(),
          visited: visitedView(),
          res: { items: [] }
        }
      });

      steps.push({
        line: 6, msg: "方向数组：右(0,1)、下(1,0)、左(0,-1)、上(-1,0)。",
        views: {
          vars: { m: m, n: n, dx: dx, dy: dy, x: 0, y: 0, d: 0, res: [] },
          grid: gridView(),
          visited: visitedView(),
          res: { items: [] }
        }
      });

      steps.push({
        line: 8, msg: "从 (0,0) 出发，方向 d=0（向右）。",
        views: {
          vars: { m: m, n: n, dx: dx, dy: dy, x: 0, y: 0, d: 0, res: [] },
          grid: gridView([0, 0]),
          visited: visitedView(),
          res: { items: [] }
        }
      });

      for (var step = 0; step < m * n; step++) {
        steps.push({
          line: 12, msg: "第 " + (step + 1) + " 步：把 matrix[" + x + "][" + y + "]=" + matrix[x][y] + " 加入结果。",
          views: {
            vars: { m: m, n: n, x: x, y: y, d: d, res: res.slice() },
            grid: gridView([x, y]),
            visited: visitedView(),
            res: { items: res.slice(), highlights: [res.length] }
          }
        });
        res.push(matrix[x][y]);
        visited[x][y] = 1;

        steps.push({
          line: 13, msg: "标记 visited[" + x + "][" + y + "] = 1。",
          views: {
            vars: { m: m, n: n, x: x, y: y, d: d, res: res.slice() },
            grid: gridView([x, y], [x, y]),
            visited: visitedView([x, y]),
            res: { items: res.slice(), highlights: [res.length - 1] }
          }
        });

        var nx = x + dx[d], ny = y + dy[d];
        steps.push({
          line: 16, msg: "尝试下一步 (" + nx + "," + ny + ")。",
          views: {
            vars: { m: m, n: n, x: x, y: y, d: d, nx: nx, ny: ny, res: res.slice() },
            grid: gridView([x, y]),
            visited: visitedView(),
            res: { items: res.slice() }
          }
        });

        if (nx >= 0 && nx < m && ny >= 0 && ny < n && !visited[nx][ny]) {
          x = nx; y = ny;
          steps.push({
            line: 18, msg: "可以走，移动到 (" + x + "," + y + ")。",
            views: {
              vars: { m: m, n: n, x: x, y: y, d: d, res: res.slice() },
              grid: gridView([x, y]),
              visited: visitedView(),
              res: { items: res.slice() }
            }
          });
        } else {
          d = (d + 1) % 4;
          x = x + dx[d]; y = y + dy[d];
          steps.push({
            line: 20, msg: "不能走，转向 d=" + d + "，移动到 (" + x + "," + y + ")。",
            views: {
              vars: { m: m, n: n, x: x, y: y, d: d, res: res.slice() },
              grid: gridView([x, y]),
              visited: visitedView(),
              res: { items: res.slice() }
            }
          });
        }
      }

      steps.push({
        line: 23, msg: "遍历完成，返回结果。",
        views: {
          vars: { m: m, n: n, x: x, y: y, d: d, res: res.slice() },
          grid: gridView(),
          visited: visitedView(),
          res: { items: res.slice(), ok: res.map(function (_, i) { return i; }) }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);