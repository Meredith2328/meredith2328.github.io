(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc279-完全平方数-v2"] = {
    title: "279 完全平方数 · 递归记忆化",
    language: "python",
    code: [
      "class Solution:",
      "    def numSquares(self, n: int) -> int:",
      "        if n == 0:",
      "            return 0",
      "        elif not hasattr(self, 'numCache'):",
      "            self.numCache = [float('inf')] * (n + 1)",
      "            self.numCache[0] = 0",
      "        elif hasattr(self, 'numCache') and self.numCache[n] != float('inf'):",
      "            return self.numCache[n]",
      "",
      "        minCnt = n",
      "        for i in range(1, int(sqrt(n)) + 1):",
      "            minCnt = min(minCnt, self.numSquares(n - i * i) + 1)",
      "        self.numCache[n] = minCnt",
      "        return minCnt"
    ].join("\n"),

    defaultInput: "n = 12",
    inputHint: "每行一个变量，格式如 n = 12",
    testInputs: ["n = 1", "n = 0"],
    expectedOutputs: ["3", "1", "0"],

    views: {
      vars: { type: "vars", title: "变量" },
      cache: { type: "array", title: "numCache" },
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
      if (typeof env.n !== "number" || env.n < 0 || !isFinite(env.n)) throw new Error("缺少 n = 非负整数");
      return env;
    },

    run: function (input) {
      var n = input.n;
      var steps = [];
      var cache = null;
      var callStack = [];

      function cacheView(hotIdx) {
        if (!cache) return { items: [], showIndex: true };
        var items = cache.slice();
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) {
          items[hotIdx] = { value: items[hotIdx], __hot: true };
        }
        return { items: items, showIndex: true };
      }

      function varsView(extra) {
        var o = { n: n };
        for (var k in extra) o[k] = extra[k];
        return o;
      }

      function callView() {
        return { frames: callStack.slice() };
      }

      function numSquares(m, depth) {
        // line 3
        steps.push({
          line: 3, msg: "进入 numSquares(" + m + ")，检查是否等于 0。",
          views: {
            vars: varsView({ m: m, minCnt: null, i: null }),
            cache: cacheView(),
            callstack: callView()
          }
        });
        if (m === 0) {
          steps.push({
            line: 4, msg: "n=0，直接返回 0。",
            views: {
              vars: varsView({ m: m, "返回值": 0 }),
              cache: cacheView(),
              callstack: callView()
            }
          });
          return 0;
        }

        // line 5
        steps.push({
          line: 5, msg: "检查缓存是否已初始化。",
          views: {
            vars: varsView({ m: m }),
            cache: cacheView(),
            callstack: callView()
          }
        });
        if (!cache) {
          cache = [];
          for (var k = 0; k <= n; k++) cache.push(Infinity);
          cache[0] = 0;
          steps.push({
            line: 6, msg: "初始化 numCache 数组，长度为 " + (n + 1) + "，全部设为无穷大。",
            views: {
              vars: varsView({ m: m }),
              cache: cacheView(),
              callstack: callView()
            }
          });
          steps.push({
            line: 7, msg: "设置 numCache[0] = 0。",
            views: {
              vars: varsView({ m: m }),
              cache: cacheView(0),
              callstack: callView()
            }
          });
        } else {
          steps.push({
            line: 8, msg: "缓存已存在，检查 numCache[" + m + "] 是否已计算。",
            views: {
              vars: varsView({ m: m }),
              cache: cacheView(m),
              callstack: callView()
            }
          });
          if (cache[m] !== Infinity) {
            steps.push({
              line: 9, msg: "numCache[" + m + "] = " + cache[m] + "，直接返回缓存值。",
              views: {
                vars: varsView({ m: m, "返回值": cache[m] }),
                cache: cacheView(m),
                callstack: callView()
              }
            });
            return cache[m];
          }
        }

        // line 11
        var minCnt = m;
        steps.push({
          line: 11, msg: "初始化 minCnt = " + m + "（最坏情况：全用 1 的平方）。",
          views: {
            vars: varsView({ m: m, minCnt: minCnt, i: null }),
            cache: cacheView(),
            callstack: callView()
          }
        });

        var limit = Math.floor(Math.sqrt(m));
        for (var i = 1; i <= limit; i++) {
          steps.push({
            line: 12, msg: "尝试平方数 " + i + "²=" + (i * i) + "，递归求解 " + (m - i * i) + "。",
            views: {
              vars: varsView({ m: m, minCnt: minCnt, i: i }),
              cache: cacheView(),
              callstack: callView()
            }
          });
          callStack.push("numSquares(" + m + ")");
          var sub = numSquares(m - i * i, depth + 1);
          callStack.pop();
          var candidate = sub + 1;
          steps.push({
            line: 13, msg: "子问题结果 " + sub + "，候选值 " + candidate + "，更新 minCnt = " + Math.min(minCnt, candidate) + "。",
            views: {
              vars: varsView({ m: m, minCnt: Math.min(minCnt, candidate), i: i, "子结果": sub, "候选": candidate }),
              cache: cacheView(),
              callstack: callView()
            }
          });
          minCnt = Math.min(minCnt, candidate);
        }

        cache[m] = minCnt;
        steps.push({
          line: 14, msg: "将 numCache[" + m + "] 设为 " + minCnt + "。",
          views: {
            vars: varsView({ m: m, minCnt: minCnt }),
            cache: cacheView(m),
            callstack: callView()
          }
        });
        steps.push({
          line: 15, msg: "返回 " + minCnt + "。",
          views: {
            vars: varsView({ m: m, "返回值": minCnt }),
            cache: cacheView(m),
            callstack: callView()
          }
        });
        return minCnt;
      }

      var result = numSquares(n, 0);
      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);