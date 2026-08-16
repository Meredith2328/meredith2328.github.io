(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc131-分割回文串"] = {
    title: "131 分割回文串 · 回溯",
    language: "python",
    code: [
      "class Solution:",
      "    def partition(self, s: str) -> List[List[str]]:",
      "        res = []",
      "        def backtrack(start, path):",
      "            if start == len(s):",
      "                res.append(path[:])",
      "",
      "            for end in range(start, len(s)):",
      "                subs = s[start:end + 1]",
      "                if subs[::-1] == subs:",
      "                    path.append(subs)",
      "                    backtrack(end + 1, path)",
      "                    path.pop()",
      "        backtrack(0, [])",
      "        return res"
    ].join("\n"),

    defaultInput: "s = \"aab\"",
    inputHint: "每行一个变量，格式如 s = \"aab\"",
    testInputs: ["s = \"a\"", "s = \"aba\""],
    expectedOutputs: [
      "[[\"a\",\"a\",\"b\"],[\"aa\",\"b\"]]",
      "[[\"a\"]]",
      "[[\"a\",\"b\",\"a\"],[\"aba\"]]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      path: { type: "array", title: "当前分割 path" },
      s: { type: "array", title: "字符串 s" },
      res: { type: "array", title: "结果 res" }
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
      if (typeof env.s !== "string") throw new Error("缺少 s = \"字符串\"");
      return env;
    },

    run: function (input) {
      var s = input.s;
      var steps = [];
      var res = [];
      var path = [];

      // 辅助：把字符串转成字符数组视图
      var sItems = s.split("");

      // 辅助：生成 path 视图（显示为字符串列表）
      var pathView = function (hotIdx) {
        var items = path.slice();
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) highlights.push(hotIdx);
        return { items: items, highlights: highlights };
      };

      // 辅助：生成 res 视图（显示为二维数组）
      var resView = function () {
        return { items: res.map(function (p) { return p.slice(); }) };
      };

      // 辅助：生成 s 视图，高亮当前区间 [start, end]
      var sView = function (start, end, okStart, okEnd) {
        var highlights = [];
        var ok = [];
        if (start != null && end != null) {
          for (var i = start; i <= end; i++) highlights.push(i);
        }
        if (okStart != null && okEnd != null) {
          for (var j = okStart; j <= okEnd; j++) ok.push(j);
        }
        return { items: sItems.slice(), highlights: highlights, ok: ok, showIndex: true };
      };

      // 辅助：vars 视图
      var varsView = function (start, end, subs, isPal) {
        var o = { "s": s, "start": start, "end": end, "subs": subs, "isPalindrome": isPal };
        return o;
      };

      // 初始状态
      steps.push({
        line: 3,
        msg: "初始化结果列表 res 为空。",
        views: {
          vars: { s: s, start: null, end: null, subs: null, isPalindrome: null },
          path: { items: [] },
          s: sView(null, null),
          res: resView()
        }
      });

      // 定义回溯函数（用闭包模拟）
      function backtrack(start, depth) {
        // 显示进入 backtrack
        steps.push({
          line: 4,
          msg: "进入 backtrack(start=" + start + ", path=" + JSON.stringify(path) + ")",
          views: {
            vars: varsView(start, null, null, null),
            path: pathView(),
            s: sView(start, null),
            res: resView()
          }
        });

        // 终止条件
        if (start === s.length) {
          steps.push({
            line: 5,
            msg: "start=" + start + " 等于字符串长度，找到一个完整分割，将当前 path 加入 res。",
            views: {
              vars: varsView(start, null, null, null),
              path: pathView(),
              s: sView(null, null),
              res: resView()
            }
          });
          res.push(path.slice());
          steps.push({
            line: 6,
            msg: "res 现在为 " + JSON.stringify(res) + "。",
            views: {
              vars: varsView(start, null, null, null),
              path: pathView(),
              s: sView(null, null),
              res: resView()
            }
          });
          return;
        }

        // 遍历所有可能的结束位置
        for (var end = start; end < s.length; end++) {
          var subs = s.substring(start, end + 1);
          var isPal = subs === subs.split("").reverse().join("");

          steps.push({
            line: 8,
            msg: "尝试子串 s[" + start + ":" + (end + 1) + "] = \"" + subs + "\"，判断是否回文。",
            views: {
              vars: varsView(start, end, subs, isPal),
              path: pathView(),
              s: sView(start, end),
              res: resView()
            }
          });

          if (isPal) {
            steps.push({
              line: 9,
              msg: "\"" + subs + "\" 是回文，将其加入当前 path。",
              views: {
                vars: varsView(start, end, subs, isPal),
                path: pathView(),
                s: sView(start, end, start, end),
                res: resView()
              }
            });
            path.push(subs);
            steps.push({
              line: 10,
              msg: "path 变为 " + JSON.stringify(path) + "，递归调用 backtrack(" + (end + 1) + ", path)。",
              views: {
                vars: varsView(start, end, subs, isPal),
                path: pathView(path.length - 1),
                s: sView(start, end, start, end),
                res: resView()
              }
            });
            backtrack(end + 1, depth + 1);
            path.pop();
            steps.push({
              line: 11,
              msg: "回溯：从 path 中弹出 \"" + subs + "\"，path 恢复为 " + JSON.stringify(path) + "。",
              views: {
                vars: varsView(start, end, subs, isPal),
                path: pathView(),
                s: sView(start, end),
                res: resView()
              }
            });
          } else {
            steps.push({
              line: 9,
              msg: "\"" + subs + "\" 不是回文，跳过。",
              views: {
                vars: varsView(start, end, subs, isPal),
                path: pathView(),
                s: sView(start, end),
                res: resView()
              }
            });
          }
        }
      }

      // 调用入口
      steps.push({
        line: 12,
        msg: "调用 backtrack(0, []) 开始回溯搜索。",
        views: {
          vars: { s: s, start: 0, end: null, subs: null, isPalindrome: null },
          path: { items: [] },
          s: sView(0, null),
          res: resView()
        }
      });
      backtrack(0, 0);

      // 返回结果
      steps.push({
        line: 13,
        msg: "回溯结束，返回所有分割方案 " + JSON.stringify(res) + "。",
        views: {
          vars: { s: s, start: null, end: null, subs: null, isPalindrome: null },
          path: { items: [] },
          s: sView(null, null),
          res: resView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);