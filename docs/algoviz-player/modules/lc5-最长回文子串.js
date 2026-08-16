(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc5-最长回文子串"] = {
    title: "5 最长回文子串 · 动态规划",
    language: "python",
    code: [
      "class Solution:",
      "    def longestPalindrome(self, s: str) -> str:",
      "        n = len(s)",
      "        if n == 1:",
      "            return s",
      "",
      "        # dp[i][j]表示s[i:j+1]是否回文",
      "        dp = [[False] * n for _ in range(n)]",
      "        start = 0 # 用于返回解",
      "        maxlen = 1",
      "",
      "        for i in range(n):",
      "            dp[i][i] = True",
      "",
      "        # 字符串是s[i:i+length]",
      "        # 字符串最后一个字符是s[i + length - 1]",
      "        for length in range(2, n + 1):",
      "            for i in range(n - length + 1):",
      "                j = i + length - 1",
      "                if s[i] == s[j]:",
      "                    if length == 2:",
      "                        dp[i][j] = True",
      "                    else:",
      "                        dp[i][j] = dp[i+1][j-1]",
      "                    if dp[i][j] and length > maxlen:",
      "                        maxlen = length",
      "                        start = i",
      "        return s[start:start + maxlen]"
    ].join("\n"),

    defaultInput: "s = \"babad\"",
    inputHint: "每行一个变量，格式如 s = \"babad\"",
    testInputs: ["s = \"cbbd\"", "s = \"a\""],
    expectedOutputs: ["\"bab\"", "\"bb\"", "\"a\""],

    views: {
      vars: { type: "vars", title: "变量" },
      dp: { type: "grid", title: "dp 表" },
      s: { type: "array", title: "s" }
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
      var n = s.length;
      var steps = [];
      var dp = [];
      var start = 0, maxlen = 1;

      var dpView = function (hotCell) {
        var cells = [];
        for (var r = 0; r < n; r++) {
          var row = [];
          for (var c = 0; c < n; c++) {
            row.push(dp[r] ? !!dp[r][c] : false);
          }
          cells.push(row);
        }
        var view = { cells: cells };
        if (hotCell) view.hot = [hotCell];
        return view;
      };

      var sItems = s.split("");

      steps.push({
        line: 3, msg: "开始：字符串 s = \"" + s + "\"，长度 n = " + n + "。",
        views: {
          vars: { n: n, start: start, maxlen: maxlen, length: null, i: null, j: null },
          dp: dpView(),
          s: { items: sItems }
        }
      });

      if (n === 1) {
        steps.push({
          line: 4, msg: "长度为 1，直接返回 s。",
          views: {
            vars: { n: n, start: start, maxlen: maxlen },
            dp: dpView(),
            s: { items: sItems }
          }
        });
        return { steps: steps, output: JSON.stringify(s) };
      }

      for (var i = 0; i < n; i++) {
        dp[i] = [];
        for (var j = 0; j < n; j++) dp[i][j] = false;
      }

      steps.push({
        line: 8, msg: "初始化 dp 表为全 False（n×n 矩阵）。",
        views: {
          vars: { n: n, start: start, maxlen: maxlen, length: null, i: null, j: null },
          dp: dpView(),
          s: { items: sItems }
        }
      });

      for (i = 0; i < n; i++) {
        dp[i][i] = true;
        steps.push({
          line: 11, msg: "单个字符 s[" + i + "]=\"" + s[i] + "\" 是回文，dp[" + i + "][" + i + "] = True。",
          views: {
            vars: { n: n, start: start, maxlen: maxlen, length: null, i: i, j: i },
            dp: dpView([i, i]),
            s: { items: sItems, highlights: [i] }
          }
        });
      }

      for (var length = 2; length <= n; length++) {
        steps.push({
          line: 15, msg: "开始处理长度为 " + length + " 的子串。",
          views: {
            vars: { n: n, start: start, maxlen: maxlen, length: length, i: null, j: null },
            dp: dpView(),
            s: { items: sItems }
          }
        });

        for (i = 0; i <= n - length; i++) {
          var j = i + length - 1;
          steps.push({
            line: 17, msg: "子串 s[" + i + ":" + (j + 1) + "] = \"" + s.substring(i, j + 1) + "\"，检查两端字符。",
            views: {
              vars: { n: n, start: start, maxlen: maxlen, length: length, i: i, j: j },
              dp: dpView(),
              s: { items: sItems, highlights: [i, j] }
            }
          });

          if (s[i] === s[j]) {
            if (length === 2) {
              dp[i][j] = true;
              steps.push({
                line: 20, msg: "两端字符相同且长度为 2，dp[" + i + "][" + j + "] = True。",
                views: {
                  vars: { n: n, start: start, maxlen: maxlen, length: length, i: i, j: j },
                  dp: dpView([i, j]),
                  s: { items: sItems, highlights: [i, j], ok: [i, j] }
                }
              });
            } else {
              dp[i][j] = dp[i + 1][j - 1];
              steps.push({
                line: 22, msg: "两端相同，dp[" + i + "][" + j + "] = dp[" + (i + 1) + "][" + (j - 1) + "] = " + (dp[i][j] ? "True" : "False") + "。",
                views: {
                  vars: { n: n, start: start, maxlen: maxlen, length: length, i: i, j: j },
                  dp: dpView([i, j]),
                  s: { items: sItems, highlights: [i, j] }
                }
              });
            }

            if (dp[i][j] && length > maxlen) {
              maxlen = length;
              start = i;
              steps.push({
                line: 24, msg: "发现更长的回文子串 \"" + s.substring(start, start + maxlen) + "\"，更新 maxlen=" + maxlen + "，start=" + start + "。",
                views: {
                  vars: { n: n, start: start, maxlen: maxlen, length: length, i: i, j: j },
                  dp: dpView([i, j]),
                  s: { items: sItems, highlights: [i, j], ok: [i, j] }
                }
              });
            }
          } else {
            steps.push({
              line: 18, msg: "两端字符不同（s[" + i + "]=\"" + s[i] + "\"，s[" + j + "]=\"" + s[j] + "\"），dp[" + i + "][" + j + "] 保持 False。",
              views: {
                vars: { n: n, start: start, maxlen: maxlen, length: length, i: i, j: j },
                dp: dpView(),
                s: { items: sItems, highlights: [i, j], bad: [i, j] }
              }
            });
          }
        }
      }

      var result = s.substring(start, start + maxlen);
      steps.push({
        line: 26, msg: "最终结果：最长回文子串是 \"" + result + "\"（start=" + start + "，maxlen=" + maxlen + "）。",
        views: {
          vars: { n: n, start: start, maxlen: maxlen, "结果": result },
          dp: dpView(),
          s: { items: sItems, ok: [start, start + maxlen - 1] }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);