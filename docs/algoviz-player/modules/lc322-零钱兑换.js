(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc322-零钱兑换"] = {
    title: "322 零钱兑换 · 递归",
    link: "https://leetcode.cn/problems/coin-change/",
    language: "python",
    code: [
      "class Solution:",
      "    def coinChange(self, coins: List[int], amount: int) -> int:",
      "        if amount < 0:",
      "            return -1",
      "        elif amount == 0:",
      "            return 0",
      "        minCnt = float('inf')",
      "        for coin in coins:",
      "            cnt = self.coinChange(coins, amount - coin)",
      "            if cnt == -1:",
      "                continue",
      "            minCnt = min(minCnt, cnt + 1)",
      "        if minCnt == float('inf'):",
      "            return -1",
      "        else:",
      "            return minCnt"
    ].join("\n"),

    defaultInput: "coins = [1, 2, 5]\namount = 11",
    inputHint: "每行一个变量，格式如 coins = [1, 2, 5] / amount = 11",

    testInputs: [
      "coins = [2]\namount = 3",
      "coins = [1]\namount = 0"
    ],
    expectedOutputs: ["3", "-1", "0"],

    views: {
      vars: { type: "vars", title: "变量" },
      callstack: { type: "callstack", title: "递归调用栈" },
      coins: { type: "array", title: "coins" }
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
      if (!Array.isArray(env.coins)) throw new Error("缺少 coins = [...]");
      if (typeof env.amount !== "number") throw new Error("缺少 amount = 数字");
      return env;
    },

    run: function (input) {
      var coins = input.coins, amount = input.amount;
      var steps = [];
      var callStack = [];
      var memo = {};

      function coinChange(amt) {
        if (amt < 0) {
          steps.push({
            line: 3, msg: "amount = " + amt + " < 0，返回 -1（无效）。",
            views: {
              vars: { amount: amt, minCnt: "inf" },
              callstack: { frames: callStack.slice() },
              coins: { items: coins.slice() }
            }
          });
          return -1;
        }
        if (amt === 0) {
          steps.push({
            line: 5, msg: "amount = 0，返回 0（不需要硬币）。",
            views: {
              vars: { amount: amt, minCnt: "inf" },
              callstack: { frames: callStack.slice() },
              coins: { items: coins.slice() }
            }
          });
          return 0;
        }
        if (memo[amt] !== undefined) {
          steps.push({
            line: 2, msg: "amount = " + amt + " 已计算过，直接返回 " + memo[amt] + "。",
            views: {
              vars: { amount: amt, minCnt: memo[amt] },
              callstack: { frames: callStack.slice() },
              coins: { items: coins.slice() }
            }
          });
          return memo[amt];
        }

        var minCnt = Infinity;
        steps.push({
          line: 6, msg: "amount = " + amt + "，初始化 minCnt = ∞。",
          views: {
            vars: { amount: amt, minCnt: "∞" },
            callstack: { frames: callStack.slice() },
            coins: { items: coins.slice() }
          }
        });

        for (var i = 0; i < coins.length; i++) {
          var coin = coins[i];
          steps.push({
            line: 7, msg: "尝试硬币 " + coin + "，递归计算 amount - coin = " + (amt - coin) + "。",
            views: {
              vars: { amount: amt, coin: coin, minCnt: minCnt === Infinity ? "∞" : minCnt },
              callstack: { frames: callStack.slice() },
              coins: { items: coins.slice(), highlights: [i] }
            }
          });

          callStack.push("coinChange(" + (amt - coin) + ")");
          var cnt = coinChange(amt - coin);
          callStack.pop();

          if (cnt === -1) {
            steps.push({
              line: 8, msg: "子问题返回 -1，跳过该硬币。",
              views: {
                vars: { amount: amt, coin: coin, cnt: cnt, minCnt: minCnt === Infinity ? "∞" : minCnt },
                callstack: { frames: callStack.slice() },
                coins: { items: coins.slice(), highlights: [i] }
              }
            });
            continue;
          }

          minCnt = Math.min(minCnt, cnt + 1);
          steps.push({
            line: 9, msg: "子问题返回 " + cnt + "，更新 minCnt = min(" + minCnt + ", " + (cnt + 1) + ") = " + minCnt + "。",
            views: {
              vars: { amount: amt, coin: coin, cnt: cnt, minCnt: minCnt },
              callstack: { frames: callStack.slice() },
              coins: { items: coins.slice(), highlights: [i] }
            }
          });
        }

        if (minCnt === Infinity) {
          steps.push({
            line: 10, msg: "minCnt 仍为 ∞，返回 -1。",
            views: {
              vars: { amount: amt, minCnt: "∞" },
              callstack: { frames: callStack.slice() },
              coins: { items: coins.slice() }
            }
          });
          memo[amt] = -1;
          return -1;
        } else {
          steps.push({
            line: 12, msg: "返回 minCnt = " + minCnt + "。",
            views: {
              vars: { amount: amt, minCnt: minCnt },
              callstack: { frames: callStack.slice() },
              coins: { items: coins.slice() }
            }
          });
          memo[amt] = minCnt;
          return minCnt;
        }
      }

      steps.push({
        line: 2, msg: "开始计算 coinChange(" + amount + ")。",
        views: {
          vars: { amount: amount, minCnt: "∞" },
          callstack: { frames: [] },
          coins: { items: coins.slice() }
        }
      });

      callStack.push("coinChange(" + amount + ")");
      var result = coinChange(amount);
      callStack.pop();

      steps.push({
        line: 2, msg: "最终结果：" + result + "。",
        views: {
          vars: { amount: amount, result: result },
          callstack: { frames: [] },
          coins: { items: coins.slice() }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);