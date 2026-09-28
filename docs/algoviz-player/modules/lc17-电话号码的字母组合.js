(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc17-电话号码的字母组合"] = {
    title: "17 电话号码的字母组合 · 回溯",
    link: "https://leetcode.cn/problems/letter-combinations-of-a-phone-number/",
    language: "python",
    code: [
      "class Solution:",
      "    def letterCombinations(self, digits: str) -> List[str]:",
      "        adict = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}",
      "        res = []",
      "",
      "        def backtrack(path, cur):",
      "            if cur == len(digits):",
      "                res.append(''.join(path[:]))",
      "                return",
      "            for choice in adict[digits[cur]]:",
      "                path.append(choice)",
      "                backtrack(path, cur + 1)",
      "                path.pop()",
      "",
      "        backtrack([], 0)",
      "        return res"
    ].join("\n"),

    defaultInput: "digits = '23'",
    inputHint: "每行一个变量，格式如 digits = '23'",
    testInputs: ["digits = ''", "digits = '7'"],
    expectedOutputs: ["[\"ad\",\"ae\",\"af\",\"bd\",\"be\",\"bf\",\"cd\",\"ce\",\"cf\"]", "[\"\"]", "[\"p\",\"q\",\"r\",\"s\"]"],

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
      if (typeof env.digits !== "string") throw new Error("缺少 digits = '...'");
      return env;
    },

    run: function (input) {
      var digits = input.digits;
      var steps = [];
      var adict = { '2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz' };
      var res = [];
      var callStack = [];

      var pathView = function (path, highlights) {
        return { items: path.slice(), highlights: highlights || [] };
      };
      var resView = function () {
        return { items: res.slice() };
      };
      var callStackView = function () {
        return { frames: callStack.slice() };
      };

      steps.push({
        line: 2,
        msg: "开始：digits = '" + digits + "'，初始化结果列表 res 为空。",
        views: {
          vars: { digits: digits, cur: null, path: null },
          path: pathView([]),
          res: resView(),
          callstack: callStackView()
        }
      });

      function backtrack(path, cur) {
        callStack.push("backtrack(" + JSON.stringify(path) + ", " + cur + ")");
        steps.push({
          line: 6,
          msg: "进入 backtrack，当前路径 path = [" + path.join(', ') + "]，位置 cur = " + cur + "。",
          views: {
            vars: { digits: digits, cur: cur, path: path.slice() },
            path: pathView(path),
            res: resView(),
            callstack: callStackView()
          }
        });

        if (cur === digits.length) {
          var combo = path.join('');
          res.push(combo);
          steps.push({
            line: 7,
            msg: "cur 等于 digits 长度，找到一个组合：'" + combo + "'，加入 res。",
            views: {
              vars: { digits: digits, cur: cur, path: path.slice(), "新组合": combo },
              path: pathView(path),
              res: resView(),
              callstack: callStackView()
            }
          });
          steps.push({
            line: 8,
            msg: "返回上一层。",
            views: {
              vars: { digits: digits, cur: cur, path: path.slice() },
              path: pathView(path),
              res: resView(),
              callstack: callStackView()
            }
          });
          callStack.pop();
          return;
        }

        var choices = adict[digits[cur]];
        steps.push({
          line: 9,
          msg: "数字 " + digits[cur] + " 对应的字母有：'" + choices + "'，开始遍历。",
          views: {
            vars: { digits: digits, cur: cur, path: path.slice(), choices: choices },
            path: pathView(path),
            res: resView(),
            callstack: callStackView()
          }
        });

        for (var i = 0; i < choices.length; i++) {
          var choice = choices[i];
          steps.push({
            line: 10,
            msg: "选择字母 '" + choice + "'，加入 path。",
            views: {
              vars: { digits: digits, cur: cur, path: path.slice(), choice: choice },
              path: pathView(path.concat(choice), [path.length]),
              res: resView(),
              callstack: callStackView()
            }
          });
          path.push(choice);
          backtrack(path, cur + 1);
          path.pop();
          steps.push({
            line: 12,
            msg: "回溯：弹出字母 '" + choice + "'，恢复 path 为 [" + path.join(', ') + "]。",
            views: {
              vars: { digits: digits, cur: cur, path: path.slice() },
              path: pathView(path),
              res: resView(),
              callstack: callStackView()
            }
          });
        }
        callStack.pop();
      }

      if (digits.length > 0) {
        backtrack([], 0);
      } else {
        // 模拟 Python 中 backtrack([], 0) 的行为：cur == len(digits) 成立，加入空字符串
        res.push('');
        steps.push({
          line: 6,
          msg: "digits 为空，进入 backtrack([], 0)。",
          views: {
            vars: { digits: digits, cur: 0, path: [] },
            path: pathView([]),
            res: resView(),
            callstack: callStackView()
          }
        });
        steps.push({
          line: 7,
          msg: "cur 等于 digits 长度（0），加入空字符串 '' 到 res。",
          views: {
            vars: { digits: digits, cur: 0, path: [], "新组合": "" },
            path: pathView([]),
            res: resView(),
            callstack: callStackView()
          }
        });
        steps.push({
          line: 8,
          msg: "返回。",
          views: {
            vars: { digits: digits, cur: 0, path: [] },
            path: pathView([]),
            res: resView(),
            callstack: callStackView()
          }
        });
      }

      steps.push({
        line: 15,
        msg: "返回最终结果 res = [" + res.map(function (s) { return "'" + s + "'"; }).join(', ') + "]。",
        views: {
          vars: { digits: digits, "结果数量": res.length },
          path: pathView([]),
          res: resView(),
          callstack: callStackView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);