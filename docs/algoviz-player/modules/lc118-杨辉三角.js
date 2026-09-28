(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc118-杨辉三角"] = {
    title: "118 杨辉三角",
    link: "https://leetcode.cn/problems/pascals-triangle/",
    language: "python",
    code: [
      "class Solution:",
      "    def generate(self, numRows: int) -> List[List[int]]:",
      "        if numRows == 1:",
      "            return 1",
      "        elif numRows == 2:",
      "            return [[1], [1, 1]]",
      "        else:",
      "            cur_list = [[1], [1, 1]]",
      "            for i in range(2, numRows):",
      "                cur_list.append([1] * (i + 1))",
      "                # eg. i = 3时, j从1到2",
      "                for j in range(1, i):",
      "                    cur_list[i][j] = cur_list[i - 1][j - 1] + cur_list[i - 1][j]",
      "            return cur_list"
    ].join("\n"),

    defaultInput: "numRows = 1",
    inputHint: "每行一个变量，格式如 numRows = 5",
    testInputs: ["numRows = 3", "numRows = 5"],
    expectedOutputs: ["1", "[[1],[1,1],[1,2,1]]", "[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]"],

    views: {
      vars: { type: "vars", title: "变量" },
      triangle: { type: "grid", title: "杨辉三角" },
      cur_list: { type: "array", title: "cur_list" }
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
      if (typeof env.numRows !== "number") throw new Error("缺少 numRows = 数字");
      return env;
    },

    run: function (input) {
      var numRows = input.numRows;
      var steps = [];
      var cur_list = [];
      var gridView = function (highlights, ok, bad) {
        var rows = [];
        for (var r = 0; r < cur_list.length; r++) {
          var row = cur_list[r].slice();
          rows.push(row);
        }
        return { cells: rows, highlights: highlights || [], ok: ok || [], bad: bad || [] };
      };
      var listView = function (highlights) {
        return { items: cur_list.map(function (row) { return row.slice(); }), highlights: highlights || [] };
      };

      steps.push({
        line: 2, msg: "开始：生成 " + numRows + " 行的杨辉三角。",
        views: {
          vars: { numRows: numRows, i: null, j: null },
          triangle: gridView(),
          cur_list: listView()
        }
      });

      if (numRows === 1) {
        steps.push({
          line: 3, msg: "numRows 为 1，直接返回 1（注意：这是题目示例的特殊情况）。",
          views: {
            vars: { numRows: numRows, "返回值": 1 },
            triangle: gridView(),
            cur_list: listView()
          }
        });
        return { steps: steps, output: "1" };
      }

      if (numRows === 2) {
        cur_list = [[1], [1, 1]];
        steps.push({
          line: 5, msg: "numRows 为 2，直接返回 [[1], [1, 1]]。",
          views: {
            vars: { numRows: numRows, "返回值": [[1], [1, 1]] },
            triangle: gridView(),
            cur_list: listView()
          }
        });
        return { steps: steps, output: JSON.stringify([[1], [1, 1]]) };
      }

      cur_list = [[1], [1, 1]];
      steps.push({
        line: 7, msg: "初始化 cur_list 为前两行：[[1], [1, 1]]。",
        views: {
          vars: { numRows: numRows, i: null, j: null },
          triangle: gridView(),
          cur_list: listView()
        }
      });

      for (var i = 2; i < numRows; i++) {
        steps.push({
          line: 8, msg: "开始生成第 " + (i + 1) + " 行（i=" + i + "）。",
          views: {
            vars: { numRows: numRows, i: i, j: null },
            triangle: gridView([[i]]),
            cur_list: listView([i])
          }
        });

        cur_list.push([]);
        for (var k = 0; k <= i; k++) cur_list[i].push(1);
        steps.push({
          line: 9, msg: "创建第 " + (i + 1) + " 行，初始全为 1（长度 " + (i + 1) + "）。",
          views: {
            vars: { numRows: numRows, i: i, j: null },
            triangle: gridView([[i]]),
            cur_list: listView([i])
          }
        });

        for (var j = 1; j < i; j++) {
          var sum = cur_list[i - 1][j - 1] + cur_list[i - 1][j];
          cur_list[i][j] = sum;
          steps.push({
            line: 11, msg: "计算第 " + (i + 1) + " 行第 " + (j + 1) + " 个元素：上一行相邻两数 " + cur_list[i - 1][j - 1] + " + " + cur_list[i - 1][j] + " = " + sum + "。",
            views: {
              vars: { numRows: numRows, i: i, j: j, "cur_list[i][j]": sum },
              triangle: gridView([[i, j]], [[i - 1, j - 1], [i - 1, j]]),
              cur_list: listView([i])
            }
          });
        }
      }

      steps.push({
        line: 13, msg: "生成完毕，返回整个杨辉三角。",
        views: {
          vars: { numRows: numRows, "返回值": cur_list },
          triangle: gridView(),
          cur_list: listView()
        }
      });
      return { steps: steps, output: JSON.stringify(cur_list) };
    }
  };
})(typeof window !== "undefined" ? window : this);