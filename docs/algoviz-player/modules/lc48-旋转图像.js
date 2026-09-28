(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc48-旋转图像"] = {
    title: "48 旋转图像 · 转置+翻转",
    link: "https://leetcode.cn/problems/rotate-image/",
    language: "python",
    code: [
      "class Solution:",
      "    def rotate(self, matrix: List[List[int]]) -> None:",
      "        \"\"\"",
      "        Do not return anything, modify matrix in-place instead.",
      "        \"\"\"",
      "        # 顺时针90度",
      "        # 等于主轴对称+左右对称",
      "        n = len(matrix)",
      "        for i in range(n):",
      "            for j in range(i):",
      "                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]",
      "",
      "        for i in range(n):",
      "            for j in range(int(n / 2)):",
      "                matrix[i][j], matrix[i][n - j - 1] = matrix[i][n - j - 1], matrix[i][j]"
    ].join("\n"),

    defaultInput: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
    inputHint: "每行一个变量，格式如 matrix = [[1,2,3],[4,5,6],[7,8,9]]",
    testInputs: [
      "matrix = [[1]]",
      "matrix = [[1,2],[3,4]]"
    ],
    expectedOutputs: [
      "[[7,4,1],[8,5,2],[9,6,3]]",
      "[[1]]",
      "[[3,1],[4,2]]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      matrix: { type: "grid", title: "matrix" },
      phase: { type: "text", title: "阶段" }
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
      var n = matrix.length;
      var steps = [];

      var gridView = function (hi, ok, bad) {
        return {
          cells: matrix.map(function (row) { return row.slice(); }),
          highlights: hi || [],
          ok: ok || [],
          bad: bad || []
        };
      };

      steps.push({
        line: 7,
        msg: "开始：矩阵大小为 " + n + "×" + n + "。旋转 = 先沿主对角线转置，再左右翻转。",
        views: {
          vars: { n: n, i: null, j: null },
          matrix: gridView(),
          phase: "准备"
        }
      });

      // 阶段1：转置
      steps.push({
        line: 8,
        msg: "阶段1：沿主对角线转置（交换 matrix[i][j] 与 matrix[j][i]，j < i）。",
        views: {
          vars: { n: n, i: null, j: null },
          matrix: gridView(),
          phase: "转置"
        }
      });

      for (var i = 0; i < n; i++) {
        steps.push({
          line: 8,
          msg: "外层循环 i=" + i + "，处理第 " + i + " 行。",
          views: {
            vars: { n: n, i: i, j: null },
            matrix: gridView([[i, 0]]),
            phase: "转置"
          }
        });
        for (var j = 0; j < i; j++) {
          var tmp = matrix[i][j];
          matrix[i][j] = matrix[j][i];
          matrix[j][i] = tmp;
          steps.push({
            line: 9,
            msg: "交换 matrix[" + i + "][" + j + "]=" + matrix[i][j] + " 与 matrix[" + j + "][" + i + "]=" + matrix[j][i] + "。",
            views: {
              vars: { n: n, i: i, j: j, "交换": [matrix[i][j], matrix[j][i]] },
              matrix: gridView([[i, j], [j, i]], [[i, j], [j, i]]),
              phase: "转置"
            }
          });
        }
      }

      // 阶段2：左右翻转
      steps.push({
        line: 11,
        msg: "阶段2：左右翻转（交换 matrix[i][j] 与 matrix[i][n-j-1]，j < n/2）。",
        views: {
          vars: { n: n, i: null, j: null },
          matrix: gridView(),
          phase: "左右翻转"
        }
      });

      for (var i2 = 0; i2 < n; i2++) {
        steps.push({
          line: 11,
          msg: "外层循环 i=" + i2 + "，处理第 " + i2 + " 行。",
          views: {
            vars: { n: n, i: i2, j: null },
            matrix: gridView([[i2, 0]]),
            phase: "左右翻转"
          }
        });
        for (var j2 = 0; j2 < Math.floor(n / 2); j2++) {
          var tmp2 = matrix[i2][j2];
          matrix[i2][j2] = matrix[i2][n - j2 - 1];
          matrix[i2][n - j2 - 1] = tmp2;
          steps.push({
            line: 12,
            msg: "交换 matrix[" + i2 + "][" + j2 + "]=" + matrix[i2][j2] + " 与 matrix[" + i2 + "][" + (n - j2 - 1) + "]=" + matrix[i2][n - j2 - 1] + "。",
            views: {
              vars: { n: n, i: i2, j: j2, "交换": [matrix[i2][j2], matrix[i2][n - j2 - 1]] },
              matrix: gridView([[i2, j2], [i2, n - j2 - 1]], [[i2, j2], [i2, n - j2 - 1]]),
              phase: "左右翻转"
            }
          });
        }
      }

      steps.push({
        line: 12,
        msg: "完成！矩阵已顺时针旋转 90 度。",
        views: {
          vars: { n: n },
          matrix: gridView(),
          phase: "完成"
        }
      });

      return { steps: steps, output: JSON.stringify(matrix) };
    }
  };
})(typeof window !== "undefined" ? window : this);