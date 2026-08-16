(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc322-零钱兑换-v2"] = {
    title: "322 零钱兑换 · 递归+记忆化",
    language: "python",
    code: [
      "class Solution:",
      "    def coinChange(self, coins: List[int], amount: int) -> int:",
      "        if amount < 0:",
      "            return -1",
      "        elif amount == 0:",
      "            return 0",
      "        elif not hasattr(self, 'coinCache'):",
      "            self.coinCache = [float('inf')] * (amount + 1)",
      "            self.coinCache[0] = 0",
      "        elif hasattr(self, 'coinCache') and self.coinCache[amount] != float('inf'):",
      "            return self.coinCache[amount]",
      "",
      "        minCnt = float('inf')",
      "        for coin in coins:",
      "            cnt = self.coinChange(coins, amount - coin)",
      "            if cnt == -1:",
      "                continue",
      "            minCnt = min(minCnt, cnt + 1)",
      "        if minCnt == float('inf'):",
      "            self.coinCache[amount] = -1",
      "            return -1",
      "        else:",
      "            self.coinCache[amount] = minCnt",
      "            return minCnt"
    ].join("\n"),

    defaultInput: "coins = [1, 2, 5]\namount = 11",
    inputHint: "每行一个变量，格式如 coins = [1, 2, 5] / amount = 11",

    testInputs: [
      "coins = [2]\namount = 3",
      "coins = [1]\namount = 0"
    ],
    expectedOutputs: [
      "-1",
      "0"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      cache: { type: "array", title: "coinCache" },
      callstack: { type: "callstack", title: "递归调用栈" }
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
      var coins = input.coins;
      var amount = input.amount;
      var steps = [];
      var cache = null; // null 表示尚未初始化
      var callStack = [];

      var cacheView = function (hotIdx) {
        if (!cache) return { items: [], showIndex: true };
        var items = cache.slice();
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) highlights.push(hotIdx);
        return { items: items, highlights: highlights, showIndex: true };
      };

      var callStackView = function () {
        return { frames: callStack.slice() };
      };

      function coinChange(coins, amount, depth) {
        // 对应 Python 第 3 行：if amount < 0:
        steps.push({
          line: 3,
          msg: "调用 coinChange(amount=" + amount + ")，先判断 amount 是否小于 0。",
          views: {
            vars: { coins: coins, amount: amount, minCnt: "inf", cnt: null },
            cache: cacheView(),
            callstack: callStackView()
          }
        });
        if (amount < 0) {
          steps.push({
            line: 4,
            msg: "amount=" + amount + " < 0，无法凑出，返回 -1。",
            views: {
              vars: { coins: coins, amount: amount, "返回值": -1 },
              cache: cacheView(),
              callstack: callStackView()
            }
          });
          return -1;
        }

        // 对应 Python 第 5 行：elif amount == 0:
        steps.push({
          line: 5,
          msg: "amount=" + amount + "，判断是否等于 0。",
          views: {
            vars: { coins: coins, amount: amount, minCnt: "inf", cnt: null },
            cache: cacheView(),
            callstack: callStackView()
          }
        });
        if (amount === 0) {
          steps.push({
            line: 6,
            msg: "amount=0，凑出 0 需要 0 枚硬币，返回 0。",
            views: {
              vars: { coins: coins, amount: amount, "返回值": 0 },
              cache: cacheView(),
              callstack: callStackView()
            }
          });
          return 0;
        }

        // 对应 Python 第 7 行：elif not hasattr(self, 'coinCache'):
        if (!cache) {
          steps.push({
            line: 7,
            msg: "coinCache 尚未初始化，开始初始化长度为 " + (amount + 1) + " 的缓存数组。",
            views: {
              vars: { coins: coins, amount: amount, minCnt: "inf", cnt: null },
              cache: cacheView(),
              callstack: callStackView()
            }
          });
          // 对应 Python 第 8 行：self.coinCache = [float('inf')] * (amount + 1)
          cache = [];
          for (var i = 0; i <= amount; i++) cache.push(Infinity);
          steps.push({
            line: 8,
            msg: "初始化 coinCache 为全 inf（长度为 " + (amount + 1) + "）。",
            views: {
              vars: { coins: coins, amount: amount, minCnt: "inf", cnt: null },
              cache: cacheView(),
              callstack: callStackView()
            }
          });
          // 对应 Python 第 9 行：self.coinCache[0] = 0
          cache[0] = 0;
          steps.push({
            line: 9,
            msg: "设置 coinCache[0] = 0（凑出 0 需要 0 枚硬币）。",
            views: {
              vars: { coins: coins, amount: amount, minCnt: "inf", cnt: null },
              cache: cacheView(0),
              callstack: callStackView()
            }
          });
        } else {
          // 对应 Python 第 10 行：elif hasattr(self, 'coinCache') and self.coinCache[amount] != float('inf'):
          steps.push({
            line: 10,
            msg: "检查 coinCache[" + amount + "] 是否已有结果（非 inf）。",
            views: {
              vars: { coins: coins, amount: amount, minCnt: "inf", cnt: null },
              cache: cacheView(amount),
              callstack: callStackView()
            }
          });
          if (cache[amount] !== Infinity) {
            steps.push({
              line: 11,
              msg: "coinCache[" + amount + "] = " + cache[amount] + " 已计算过，直接返回。",
              views: {
                vars: { coins: coins, amount: amount, "返回值": cache[amount] },
                cache: cacheView(amount),
                callstack: callStackView()
              }
            });
            return cache[amount];
          }
        }

        // 对应 Python 第 13 行：minCnt = float('inf')
        var minCnt = Infinity;
        steps.push({
          line: 13,
          msg: "初始化 minCnt = inf，准备遍历硬币。",
          views: {
            vars: { coins: coins, amount: amount, minCnt: "inf", cnt: null },
            cache: cacheView(),
            callstack: callStackView()
          }
        });

        // 对应 Python 第 14 行：for coin in coins:
        for (var j = 0; j < coins.length; j++) {
          var coin = coins[j];
          steps.push({
            line: 14,
            msg: "尝试硬币 coin=" + coin + "，递归计算 amount - coin = " + (amount - coin) + "。",
            views: {
              vars: { coins: coins, amount: amount, minCnt: minCnt === Infinity ? "inf" : minCnt, coin: coin, cnt: null },
              cache: cacheView(),
              callstack: callStackView()
            }
          });

          // 对应 Python 第 15 行：cnt = self.coinChange(coins, amount - coin)
          callStack.push("coinChange(" + amount + ")");
          var cnt = coinChange(coins, amount - coin, depth + 1);
          callStack.pop();

          steps.push({
            line: 15,
            msg: "子问题 coinChange(" + (amount - coin) + ") 返回 cnt=" + cnt + "。",
            views: {
              vars: { coins: coins, amount: amount, minCnt: minCnt === Infinity ? "inf" : minCnt, coin: coin, cnt: cnt },
              cache: cacheView(),
              callstack: callStackView()
            }
          });

          // 对应 Python 第 16 行：if cnt == -1:
          if (cnt === -1) {
            steps.push({
              line: 16,
              msg: "cnt=-1，说明用硬币 " + coin + " 无法凑出 " + (amount - coin) + "，跳过。",
              views: {
                vars: { coins: coins, amount: amount, minCnt: minCnt === Infinity ? "inf" : minCnt, coin: coin, cnt: cnt },
                cache: cacheView(),
                callstack: callStackView()
              }
            });
            continue;
          }

          // 对应 Python 第 18 行：minCnt = min(minCnt, cnt + 1)
          var newVal = cnt + 1;
          var oldMin = minCnt;
          if (newVal < minCnt) minCnt = newVal;
          steps.push({
            line: 18,
            msg: "更新 minCnt：min(" + (oldMin === Infinity ? "inf" : oldMin) + ", " + cnt + "+1=" + newVal + ") = " + (minCnt === Infinity ? "inf" : minCnt) + "。",
            views: {
              vars: { coins: coins, amount: amount, minCnt: minCnt === Infinity ? "inf" : minCnt, coin: coin, cnt: cnt },
              cache: cacheView(),
              callstack: callStackView()
            }
          });
        }

        // 对应 Python 第 19 行：if minCnt == float('inf'):
        steps.push({
          line: 19,
          msg: "遍历完所有硬币，检查 minCnt 是否仍为 inf。",
          views: {
            vars: { coins: coins, amount: amount, minCnt: minCnt === Infinity ? "inf" : minCnt },
            cache: cacheView(),
            callstack: callStackView()
          }
        });
        if (minCnt === Infinity) {
          // 对应 Python 第 20 行：self.coinCache[amount] = -1
          cache[amount] = -1;
          steps.push({
            line: 20,
            msg: "无法凑出 " + amount + "，设置 coinCache[" + amount + "] = -1。",
            views: {
              vars: { coins: coins, amount: amount, minCnt: "inf" },
              cache: cacheView(amount),
              callstack: callStackView()
            }
          });
          // 对应 Python 第 21 行：return -1
          steps.push({
            line: 21,
            msg: "返回 -1（无法凑出）。",
            views: {
              vars: { coins: coins, amount: amount, "返回值": -1 },
              cache: cacheView(amount),
              callstack: callStackView()
            }
          });
          return -1;
        } else {
          // 对应 Python 第 23 行：self.coinCache[amount] = minCnt
          cache[amount] = minCnt;
          steps.push({
            line: 23,
            msg: "凑出 " + amount + " 最少需要 " + minCnt + " 枚硬币，存入 coinCache[" + amount + "] = " + minCnt + "。",
            views: {
              vars: { coins: coins, amount: amount, minCnt: minCnt },
              cache: cacheView(amount),
              callstack: callStackView()
            }
          });
          // 对应 Python 第 24 行：return minCnt
          steps.push({
            line: 24,
            msg: "返回 minCnt=" + minCnt + "。",
            views: {
              vars: { coins: coins, amount: amount, "返回值": minCnt },
              cache: cacheView(amount),
              callstack: callStackView()
            }
          });
          return minCnt;
        }
      }

      // 初始步骤
      steps.push({
        line: 2,
        msg: "开始：用硬币 " + JSON.stringify(coins) + " 凑出金额 " + amount + "。",
        views: {
          vars: { coins: coins, amount: amount, minCnt: null, cnt: null },
          cache: { items: [], showIndex: true },
          callstack: { frames: [] }
        }
      });

      var result = coinChange(coins, amount, 0);

      steps.push({
        line: 2,
        msg: "计算完成，最终结果：" + result + "。",
        views: {
          vars: { coins: coins, amount: amount, "最终结果": result },
          cache: cacheView(),
          callstack: { frames: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);