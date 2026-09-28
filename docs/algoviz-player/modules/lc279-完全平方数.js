(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc279-完全平方数"] = {
    title: "279 完全平方数 · 动态规划",
    link: "https://leetcode.cn/problems/perfect-squares/",
    language: "python",
    code: [
      "class Solution:",
      "    def numSquares(self, n: int) -> int:",
      "        dp = [float('inf')] * (n + 1)",
      "        dp[0], dp[1] = 0, 1",
      "        for i in range(2, n + 1):",
      "            for j in range(1, int(sqrt(i)) + 1):",
      "                dp[i] = min(dp[i], dp[i - j * j] + 1)",
      "        return dp[n]"
    ].join("\n"),

    defaultInput: "n = 12",
    inputHint: "每行一个变量，格式如 n = 12",
    testInputs: ["n = 1", "n = 13"],
    expectedOutputs: ["3", "1", "2"],

    views: {
      vars: { type: "vars", title: "变量" },
      dp: { type: "array", title: "dp 数组" },
      squares: { type: "array", title: "平方数 j*j" }
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
      if (typeof env.n !== "number" || env.n < 0 || !isFinite(env.n)) throw new Error("缺少 n = 非负整数");
      return env;
    },

    run: function (input) {
      var n = input.n;
      var steps = [];
      var dp = [];
      var i, j;

      // 初始化 dp 数组
      for (i = 0; i <= n; i++) dp.push(Infinity);
      dp[0] = 0;
      if (n >= 1) dp[1] = 1;

      steps.push({
        line: 3, msg: "初始化 dp 数组，长度为 n+1=" + (n + 1) + "，全部设为无穷大。",
        views: {
          vars: { n: n, i: null, j: null },
          dp: { items: dp.slice(), highlights: [], showIndex: true },
          squares: { items: [], showIndex: true }
        }
      });

      steps.push({
        line: 4, msg: "设置边界条件：dp[0]=0（0 需要 0 个完全平方数），dp[1]=1（1 需要 1 个完全平方数）。",
        views: {
          vars: { n: n, i: null, j: null },
          dp: { items: dp.slice(), highlights: [0, 1], ok: [0, 1], showIndex: true },
          squares: { items: [], showIndex: true }
        }
      });

      // 主循环
      for (i = 2; i <= n; i++) {
        var sqrtI = Math.floor(Math.sqrt(i));
        var squaresList = [];
        for (j = 1; j <= sqrtI; j++) squaresList.push(j * j);

        steps.push({
          line: 5, msg: "计算 dp[" + i + "]：遍历所有不超过 " + i + " 的平方数。",
          views: {
            vars: { n: n, i: i, j: null, "sqrt(i)": sqrtI },
            dp: { items: dp.slice(), highlights: [i], showIndex: true },
            squares: { items: squaresList.slice(), showIndex: true }
          }
        });

        for (j = 1; j <= sqrtI; j++) {
          var sq = j * j;
          var candidate = dp[i - sq] + 1;
          var oldVal = dp[i];
          if (candidate < dp[i]) dp[i] = candidate;

          steps.push({
            line: 6, msg: "尝试平方数 " + sq + "：dp[" + i + "-" + sq + "]=" + dp[i - sq] + "，候选值 " + candidate + "，更新 dp[" + i + "]=" + dp[i] + "。",
            views: {
              vars: { n: n, i: i, j: j, "j*j": sq, "候选值": candidate },
              dp: { items: dp.slice(), highlights: [i, i - sq], showIndex: true },
              squares: { items: squaresList.slice(), highlights: [j - 1], showIndex: true }
            }
          });
        }
      }

      steps.push({
        line: 7, msg: "返回 dp[" + n + "]=" + dp[n] + "，即 " + n + " 最少需要 " + dp[n] + " 个完全平方数。",
        views: {
          vars: { n: n, "结果": dp[n] },
          dp: { items: dp.slice(), ok: [n], showIndex: true },
          squares: { items: [], showIndex: true }
        }
      });

      return { steps: steps, output: JSON.stringify(dp[n]) };
    }
  };
})(typeof window !== "undefined" ? window : this);