(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc51-n皇后"] = {
    title: "51 N皇后 · 回溯",
    link: "https://leetcode.cn/problems/n-queens/",
    language: "python",
    code: [
      "class Solution:",
      "    def solveNQueens(self, n: int) -> List[List[str]]:",
      "        res = []",
      "        board = [['.'] * n for _ in range(n)]",
      "        cols = set()",
      "        diag1 = set()",
      "        diag2 = set()",
      "",
      "        def backtrack(row):",
      "            if row == n:",
      "                res.append([''.join(board_row) for board_row in board])",
      "                return",
      "            for col in range(n):",
      "                if col in cols or (row - col) in diag1 or (row + col) in diag2:",
      "                    continue",
      "                # 做选择",
      "                board[row][col] = 'Q'",
      "                cols.add(col)",
      "                diag1.add(row - col)",
      "                diag2.add(row + col)",
      "                backtrack(row + 1)",
      "                board[row][col] = '.'",
      "                cols.remove(col)",
      "                diag1.remove(row - col)",
      "                diag2.remove(row + col)",
      "",
      "        backtrack(0)",
      "        return res"
    ].join("\n"),

    defaultInput: "n = 4",
    inputHint: "每行一个变量，格式如 n = 4",
    testInputs: ["n = 1", "n = 5"],
    expectedOutputs: ["[[\".Q..\",\"...Q\",\"Q...\",\"..Q.\"],[\"..Q.\",\"Q...\",\"...Q\",\".Q..\"]]", "[[\"Q\"]]", "[[\"Q....\",\"..Q..\",\"....Q\",\".Q...\",\"...Q.\"],[\"Q....\",\"...Q.\",\".Q...\",\"....Q\",\"..Q..\"],[\".Q...\",\"...Q.\",\"Q....\",\"..Q..\",\"....Q\"],[\".Q...\",\"....Q\",\"..Q..\",\"Q....\",\"...Q.\"],[\"..Q..\",\"Q....\",\"...Q.\",\".Q...\",\"....Q\"],[\"..Q..\",\"....Q\",\".Q...\",\"...Q.\",\"Q....\"],[\"...Q.\",\"Q....\",\"..Q..\",\"....Q\",\".Q...\"],[\"...Q.\",\".Q...\",\"....Q\",\"..Q..\",\"Q....\"],[\"....Q\",\".Q...\",\"...Q.\",\"Q....\",\"..Q..\"],[\"....Q\",\"..Q..\",\"Q....\",\"...Q.\",\".Q...\"]]"],

    views: {
      vars: { type: "vars", title: "变量" },
      board: { type: "grid", title: "棋盘" },
      sets: { type: "vars", title: "冲突集合" },
      callstack: { type: "callstack", title: "递归栈" }
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
      if (typeof env.n !== "number" || env.n < 1 || env.n % 1 !== 0) throw new Error("缺少 n = 正整数");
      return env;
    },

    run: function (input) {
      var n = input.n;
      var steps = [];
      var res = [];
      var board = [];
      for (var i = 0; i < n; i++) {
        board.push([]);
        for (var j = 0; j < n; j++) board[i].push('.');
      }
      var cols = {};
      var diag1 = {};
      var diag2 = {};
      var callstack = [];

      function setView(obj, hotKey) {
        var o = {};
        Object.keys(obj).forEach(function (k) { o[k] = obj[k]; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      }

      function boardView(highlights, ok) {
        var cells = [];
        for (var r = 0; r < n; r++) {
          cells.push(board[r].slice());
        }
        var v = { cells: cells };
        if (highlights) v.highlights = highlights;
        if (ok) v.ok = ok;
        return v;
      }

      function backtrack(row) {
        callstack.push("backtrack(" + row + ")");
        steps.push({
          line: 9, msg: "进入 backtrack(" + row + ")，当前行 " + row + "。",
          views: {
            vars: { n: n, row: row, res: res.length },
            board: boardView(),
            sets: { cols: setView(cols), diag1: setView(diag1), diag2: setView(diag2) },
            callstack: { frames: callstack.slice() }
          }
        });

        if (row === n) {
          var solution = [];
          for (var r = 0; r < n; r++) solution.push(board[r].join(''));
          res.push(solution);
          steps.push({
            line: 10, msg: "row == n，找到一个解，加入 res。当前解数：" + res.length + "。",
            views: {
              vars: { n: n, row: row, res: res.length },
              board: boardView(null, [[0,0]]),
              sets: { cols: setView(cols), diag1: setView(diag1), diag2: setView(diag2) },
              callstack: { frames: callstack.slice() }
            }
          });
          callstack.pop();
          return;
        }

        for (var col = 0; col < n; col++) {
          steps.push({
            line: 12, msg: "尝试第 " + row + " 行第 " + col + " 列。",
            views: {
              vars: { n: n, row: row, col: col, res: res.length },
              board: boardView([[row, col]]),
              sets: { cols: setView(cols), diag1: setView(diag1), diag2: setView(diag2) },
              callstack: { frames: callstack.slice() }
            }
          });

          if (cols[col] !== undefined || diag1[row - col] !== undefined || diag2[row + col] !== undefined) {
            steps.push({
              line: 13, msg: "列 " + col + " 或对角线冲突，跳过。",
              views: {
                vars: { n: n, row: row, col: col, res: res.length },
                board: boardView([[row, col]]),
                sets: { cols: setView(cols), diag1: setView(diag1), diag2: setView(diag2) },
                callstack: { frames: callstack.slice() }
              }
            });
            continue;
          }

          board[row][col] = 'Q';
          cols[col] = true;
          diag1[row - col] = true;
          diag2[row + col] = true;
          steps.push({
            line: 16, msg: "放置皇后在 (" + row + ", " + col + ")。",
            views: {
              vars: { n: n, row: row, col: col, res: res.length },
              board: boardView([[row, col]]),
              sets: { cols: setView(cols, String(col)), diag1: setView(diag1, String(row - col)), diag2: setView(diag2, String(row + col)) },
              callstack: { frames: callstack.slice() }
            }
          });

          backtrack(row + 1);

          board[row][col] = '.';
          delete cols[col];
          delete diag1[row - col];
          delete diag2[row + col];
          steps.push({
            line: 20, msg: "回溯：移除 (" + row + ", " + col + ") 的皇后。",
            views: {
              vars: { n: n, row: row, col: col, res: res.length },
              board: boardView([[row, col]]),
              sets: { cols: setView(cols), diag1: setView(diag1), diag2: setView(diag2) },
              callstack: { frames: callstack.slice() }
            }
          });
        }
        callstack.pop();
      }

      steps.push({
        line: 3, msg: "初始化：n=" + n + "，空棋盘，冲突集合为空。",
        views: {
          vars: { n: n, row: null, res: 0 },
          board: boardView(),
          sets: { cols: {}, diag1: {}, diag2: {} },
          callstack: { frames: [] }
        }
      });

      backtrack(0);

      steps.push({
        line: 24, msg: "回溯结束，共找到 " + res.length + " 个解。",
        views: {
          vars: { n: n, res: res.length },
          board: boardView(),
          sets: { cols: {}, diag1: {}, diag2: {} },
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);