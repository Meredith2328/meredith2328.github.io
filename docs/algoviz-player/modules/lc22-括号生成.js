(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc22-括号生成"] = {
    title: "22 括号生成 · 回溯",
    link: "https://leetcode.cn/problems/generate-parentheses/",
    language: "python",
    code: [
      "class Solution:",
      "    def generateParenthesis(self, n: int) -> List[str]:",
      "        res = []",
      "",
      "        def backtrack(path, left, right):",
      "            if len(path) == 2 * n:",
      "                res.append(''.join(path))",
      "            # 可以加左括号的条件",
      "            if left < n:",
      "                path.append('(')",
      "                backtrack(path, left + 1, right)",
      "                path.pop()",
      "",
      "            # 可以加右括号的条件: 右括号数量小于左括号数量",
      "            if right < left:",
      "                path.append(')')",
      "                backtrack(path, left, right + 1)",
      "                path.pop()",
      "",
      "        backtrack([], 0, 0)",
      "        return res"
    ].join("\n"),

    defaultInput: "n = 3",
    inputHint: "每行一个变量，格式如 n = 3",
    testInputs: ["n = 1", "n = 0"],
    expectedOutputs: ["[\"((()))\",\"(()())\",\"(())()\",\"()(())\",\"()()()\"]", "[\"()\"]", "[\"\"]"],

    views: {
      vars: { type: "vars", title: "变量" },
      path: { type: "array", title: "path" },
      res: { type: "array", title: "res" },
      callstack: { type: "callstack", title: "调用栈" }
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
      if (typeof env.n !== "number" || env.n < 0 || env.n % 1 !== 0) throw new Error("缺少 n = 非负整数");
      return env;
    },

    run: function (input) {
      var n = input.n;
      var steps = [];
      var res = [];
      var callStack = [];

      function resView() {
        return { items: res.slice() };
      }

      function pathView(path, highlights) {
        return { items: path.slice(), highlights: highlights || [] };
      }

      function varsView(path, left, right, extra) {
        var o = { n: n, left: left, right: right, "path长度": path.length };
        if (extra) {
          for (var k in extra) o[k] = extra[k];
        }
        return o;
      }

      function callStackView() {
        return { frames: callStack.slice() };
      }

      steps.push({
        line: 3,
        msg: "初始化结果列表 res 为空。",
        views: {
          vars: { n: n, left: null, right: null, "path长度": 0 },
          path: { items: [] },
          res: resView(),
          callstack: callStackView()
        }
      });

      function backtrack(path, left, right) {
        var frame = "backtrack(" + path.join("") + ", " + left + ", " + right + ")";
        callStack.push(frame);

        steps.push({
          line: 5,
          msg: "进入回溯调用：" + frame + "。",
          views: {
            vars: varsView(path, left, right),
            path: pathView(path),
            res: resView(),
            callstack: callStackView()
          }
        });

        if (path.length === 2 * n) {
          var s = path.join("");
          res.push(s);
          steps.push({
            line: 6,
            msg: "path 长度达到 2n=" + (2 * n) + "，找到一个合法括号组合：" + s + "，加入 res。",
            views: {
              vars: varsView(path, left, right, { "新结果": s }),
              path: pathView(path, []),
              res: { items: res.slice(), highlights: [res.length - 1], ok: [res.length - 1] },
              callstack: callStackView()
            }
          });
          steps.push({
            line: 7,
            msg: "记录结果后，本层调用即将返回。",
            views: {
              vars: varsView(path, left, right),
              path: pathView(path),
              res: resView(),
              callstack: callStackView()
            }
          });
          callStack.pop();
          return;
        }

        if (left < n) {
          path.push('(');
          steps.push({
            line: 9,
            msg: "left=" + left + " < n=" + n + "，可以添加左括号 '('，path 变为 " + path.join("") + "。",
            views: {
              vars: varsView(path, left, right),
              path: pathView(path, [path.length - 1]),
              res: resView(),
              callstack: callStackView()
            }
          });
          backtrack(path, left + 1, right);
          path.pop();
          steps.push({
            line: 11,
            msg: "回溯：撤销左括号，path 恢复为 " + path.join("") + "。",
            views: {
              vars: varsView(path, left, right),
              path: pathView(path),
              res: resView(),
              callstack: callStackView()
            }
          });
        }

        if (right < left) {
          path.push(')');
          steps.push({
            line: 14,
            msg: "right=" + right + " < left=" + left + "，可以添加右括号 ')'，path 变为 " + path.join("") + "。",
            views: {
              vars: varsView(path, left, right),
              path: pathView(path, [path.length - 1]),
              res: resView(),
              callstack: callStackView()
            }
          });
          backtrack(path, left, right + 1);
          path.pop();
          steps.push({
            line: 16,
            msg: "回溯：撤销右括号，path 恢复为 " + path.join("") + "。",
            views: {
              vars: varsView(path, left, right),
              path: pathView(path),
              res: resView(),
              callstack: callStackView()
            }
          });
        }

        callStack.pop();
        steps.push({
          line: 5,
          msg: "本层调用结束，返回上一层。",
          views: {
            vars: varsView(path, left, right),
            path: pathView(path),
            res: resView(),
            callstack: callStackView()
          }
        });
      }

      steps.push({
        line: 18,
        msg: "调用 backtrack([], 0, 0) 开始回溯搜索。",
        views: {
          vars: varsView([], 0, 0),
          path: { items: [] },
          res: resView(),
          callstack: callStackView()
        }
      });

      backtrack([], 0, 0);

      steps.push({
        line: 19,
        msg: "回溯结束，返回所有 " + res.length + " 个合法括号组合。",
        views: {
          vars: { n: n, "结果数量": res.length },
          path: { items: [] },
          res: resView(),
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);