(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc139-单词拆分"] = {
    title: "139 单词拆分 · 动态规划",
    language: "python",
    code: [
      "class Solution:",
      "    def wordBreak(self, s: str, wordDict: List[str]) -> bool:",
      "        # 对于字符串的dp, 要意识到字符串一般都是从左往右遍历下标.",
      "        # 那么对于结尾为i(开)的字符串s[0..i],可以分割意味着存在分割点j, 使得dp[j]=True且s[j..i]在wordDict中.",
      "        wordDict = set(wordDict) # 会快很多",
      "        n = len(s)",
      "        dp = [False] * (n + 1)",
      "        dp[0] = True # 空串",
      "        for i in range(n + 1):",
      "            for j in range(i):",
      "                if dp[j] and s[j:i] in wordDict:",
      "                    dp[i] = True",
      "        return dp[n]"
    ].join("\n"),

    defaultInput: "s = \"leetcode\"\nwordDict = [\"leet\", \"code\"]",
    inputHint: "每行一个变量，格式如 s = \"leetcode\" / wordDict = [\"leet\", \"code\"]",

    testInputs: [
      "s = \"applepenapple\"\nwordDict = [\"apple\", \"pen\"]",
      "s = \"catsandog\"\nwordDict = [\"cats\", \"dog\", \"sand\", \"and\", \"cat\"]"
    ],
    expectedOutputs: [
      "true",
      "false"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      dp: { type: "array", title: "dp" },
      s: { type: "array", title: "s 字符" },
      dict: { type: "vars", title: "wordDict 集合" }
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
      if (!Array.isArray(env.wordDict)) throw new Error("缺少 wordDict = [\"单词\", ...]");
      return env;
    },

    run: function (input) {
      var s = input.s;
      var wordDict = input.wordDict;
      var steps = [];
      var dictSet = {};
      var n = s.length;
      var dp = [];
      var i, j;

      // 初始化 wordDict 集合视图
      for (i = 0; i < wordDict.length; i++) {
        dictSet[wordDict[i]] = true;
      }

      // 辅助：dp 视图
      var dpView = function (hotIdx) {
        var items = [];
        for (var k = 0; k <= n; k++) {
          items.push(dp[k] === true);
        }
        var view = { items: items, showIndex: true };
        if (hotIdx != null) view.highlights = [hotIdx];
        return view;
      };

      // 辅助：s 字符视图
      var sView = function (highlightStart, highlightEnd) {
        var chars = [];
        for (var k = 0; k < s.length; k++) chars.push(s[k]);
        var view = { items: chars, showIndex: true };
        if (highlightStart != null && highlightEnd != null) {
          var h = [];
          for (var k2 = highlightStart; k2 < highlightEnd; k2++) h.push(k2);
          view.highlights = h;
        }
        return view;
      };

      // 辅助：dict 视图
      var dictView = function (hotKey) {
        var o = {};
        Object.keys(dictSet).forEach(function (k) { o[k] = true; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: true, __hot: true };
        return o;
      };

      // 步骤 1：初始化
      steps.push({
        line: 4,
        msg: "将 wordDict 转为集合，便于 O(1) 查找。",
        views: {
          vars: { s: s, n: n, i: null, j: null },
          dp: dpView(),
          s: sView(),
          dict: dictView()
        }
      });

      // 步骤 2：n = len(s)
      steps.push({
        line: 5,
        msg: "计算字符串长度 n = " + n + "。",
        views: {
          vars: { s: s, n: n, i: null, j: null },
          dp: dpView(),
          s: sView(),
          dict: dictView()
        }
      });

      // 步骤 3：初始化 dp 数组
      dp = [];
      for (i = 0; i <= n; i++) dp.push(false);
      steps.push({
        line: 6,
        msg: "初始化 dp 数组，长度 n+1，全部为 False。",
        views: {
          vars: { s: s, n: n, i: null, j: null },
          dp: dpView(),
          s: sView(),
          dict: dictView()
        }
      });

      // 步骤 4：dp[0] = True
      dp[0] = true;
      steps.push({
        line: 7,
        msg: "dp[0] = True，表示空串可以分割。",
        views: {
          vars: { s: s, n: n, i: null, j: null },
          dp: dpView(0),
          s: sView(),
          dict: dictView()
        }
      });

      // 主循环
      for (i = 0; i <= n; i++) {
        steps.push({
          line: 8,
          msg: "外层循环：i = " + i + "，考虑前缀 s[0.." + i + ")。",
          views: {
            vars: { s: s, n: n, i: i, j: null },
            dp: dpView(i),
            s: sView(0, i),
            dict: dictView()
          }
        });

        for (j = 0; j < i; j++) {
          var sub = s.substring(j, i);
          var inDict = dictSet[sub] === true;
          steps.push({
            line: 9,
            msg: "内层循环：j = " + j + "，检查子串 \"" + sub + "\" 是否在字典中。",
            views: {
              vars: { s: s, n: n, i: i, j: j, "s[j:i]": sub },
              dp: dpView(i),
              s: sView(j, i),
              dict: dictView(sub)
            }
          });

          if (dp[j] === true && inDict) {
            dp[i] = true;
            steps.push({
              line: 10,
              msg: "dp[" + j + "] = True 且 \"" + sub + "\" 在字典中，所以 dp[" + i + "] = True。",
              views: {
                vars: { s: s, n: n, i: i, j: j, "s[j:i]": sub },
                dp: dpView(i),
                s: sView(j, i),
                dict: dictView(sub)
              }
            });
            break; // 找到分割点，跳出内层循环
          }
        }
      }

      // 返回结果
      steps.push({
        line: 11,
        msg: "返回 dp[" + n + "] = " + (dp[n] ? "True" : "False") + "，表示整个字符串是否可以分割。",
        views: {
          vars: { s: s, n: n, i: n, j: null, "返回值": dp[n] },
          dp: dpView(n),
          s: sView(),
          dict: dictView()
        }
      });

      return { steps: steps, output: dp[n] ? "true" : "false" };
    }
  };
})(typeof window !== "undefined" ? window : this);