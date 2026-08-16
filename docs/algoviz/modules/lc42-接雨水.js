(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc42-接雨水"] = {
    title: "42 接雨水 · 动态规划",
    language: "python",
    code: [
      "class Solution:",
      "    def trap(self, height: List[int]) -> int:",
      "        n = len(height)",
      "        res = 0",
      "        # dp存储每个位置的lmax, rmax",
      "        # 通过从左往右和从右往左两次遍历便捷实现",
      "        lmax, rmax = [0] * n, [0] * n",
      "        lmax[0] = height[0]",
      "        for i in range(1, n):",
      "            lmax[i] = max(height[i], lmax[i - 1])",
      "        rmax[n-1] = height[n-1]",
      "        for i in range(n-2, -1, -1):",
      "            rmax[i] = max(height[i], rmax[i + 1])",
      "        # 根据高度差得到每个位置接的雨水",
      "        for i in range(n):",
      "            min_max = min(lmax[i], rmax[i])",
      "            if min_max > height[i]:",
      "                res += min_max - height[i]",
      "        return res"
    ].join("\n"),

    defaultInput: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
    inputHint: "每行一个变量，格式如 height = [0,1,0,2,1,0,1,3,2,1,2,1]",
    testInputs: [
      "height = [4,2,0,3,2,5]",
      "height = [1,2,3,4,5]"
    ],
    expectedOutputs: [
      "9",
      "0"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      height: { type: "array", title: "height" },
      lmax: { type: "array", title: "lmax" },
      rmax: { type: "array", title: "rmax" }
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
      if (!Array.isArray(env.height)) throw new Error("缺少 height = [...]");
      return env;
    },

    run: function (input) {
      var height = input.height;
      var n = height.length;
      var steps = [];
      var res = 0;
      var lmax = [], rmax = [];

      // 初始化视图辅助函数
      function lmaxView(hotIdx) {
        var items = lmax.slice();
        var highlights = [];
        if (hotIdx != null) highlights.push(hotIdx);
        return { items: items, highlights: highlights, showIndex: true };
      }
      function rmaxView(hotIdx) {
        var items = rmax.slice();
        var highlights = [];
        if (hotIdx != null) highlights.push(hotIdx);
        return { items: items, highlights: highlights, showIndex: true };
      }

      // 初始化
      steps.push({
        line: 2,
        msg: "开始：计算接雨水的总量。数组长度 n = " + n + "。",
        views: {
          vars: { n: n, res: 0, i: null, min_max: null },
          height: { items: height.slice(), showIndex: true },
          lmax: { items: [], showIndex: true },
          rmax: { items: [], showIndex: true }
        }
      });

      // 初始化 lmax, rmax 数组
      for (var i = 0; i < n; i++) { lmax.push(0); rmax.push(0); }
      steps.push({
        line: 6,
        msg: "初始化 lmax 和 rmax 数组，长度均为 " + n + "，初始值全为 0。",
        views: {
          vars: { n: n, res: 0, i: null, min_max: null },
          height: { items: height.slice(), showIndex: true },
          lmax: lmaxView(),
          rmax: rmaxView()
        }
      });

      // lmax[0] = height[0]
      lmax[0] = height[0];
      steps.push({
        line: 7,
        msg: "lmax[0] = height[0] = " + height[0] + "，第一个位置的左侧最大高度就是它本身。",
        views: {
          vars: { n: n, res: 0, i: 0, min_max: null },
          height: { items: height.slice(), highlights: [0], showIndex: true },
          lmax: lmaxView(0),
          rmax: rmaxView()
        }
      });

      // 从左往右计算 lmax
      for (var i = 1; i < n; i++) {
        lmax[i] = Math.max(height[i], lmax[i - 1]);
        steps.push({
          line: 9,
          msg: "lmax[" + i + "] = max(height[" + i + "]=" + height[i] + ", lmax[" + (i-1) + "]=" + lmax[i-1] + ") = " + lmax[i] + "。",
          views: {
            vars: { n: n, res: 0, i: i, min_max: null },
            height: { items: height.slice(), highlights: [i], showIndex: true },
            lmax: lmaxView(i),
            rmax: rmaxView()
          }
        });
      }

      // rmax[n-1] = height[n-1]
      rmax[n-1] = height[n-1];
      steps.push({
        line: 10,
        msg: "rmax[" + (n-1) + "] = height[" + (n-1) + "] = " + height[n-1] + "，最后一个位置的右侧最大高度就是它本身。",
        views: {
          vars: { n: n, res: 0, i: n-1, min_max: null },
          height: { items: height.slice(), highlights: [n-1], showIndex: true },
          lmax: lmaxView(),
          rmax: rmaxView(n-1)
        }
      });

      // 从右往左计算 rmax
      for (var i = n-2; i >= 0; i--) {
        rmax[i] = Math.max(height[i], rmax[i + 1]);
        steps.push({
          line: 12,
          msg: "rmax[" + i + "] = max(height[" + i + "]=" + height[i] + ", rmax[" + (i+1) + "]=" + rmax[i+1] + ") = " + rmax[i] + "。",
          views: {
            vars: { n: n, res: 0, i: i, min_max: null },
            height: { items: height.slice(), highlights: [i], showIndex: true },
            lmax: lmaxView(),
            rmax: rmaxView(i)
          }
        });
      }

      // 计算雨水
      for (var i = 0; i < n; i++) {
        var min_max = Math.min(lmax[i], rmax[i]);
        steps.push({
          line: 15,
          msg: "位置 " + i + "：min(lmax=" + lmax[i] + ", rmax=" + rmax[i] + ") = " + min_max + "。",
          views: {
            vars: { n: n, res: res, i: i, min_max: min_max },
            height: { items: height.slice(), highlights: [i], showIndex: true },
            lmax: lmaxView(i),
            rmax: rmaxView(i)
          }
        });

        if (min_max > height[i]) {
          var add = min_max - height[i];
          res += add;
          steps.push({
            line: 17,
            msg: "min_max(" + min_max + ") > height[" + i + "](" + height[i] + ")，此位置可接 " + add + " 单位雨水，累计 res = " + res + "。",
            views: {
              vars: { n: n, res: res, i: i, min_max: min_max, "增加": add },
              height: { items: height.slice(), highlights: [i], ok: [i], showIndex: true },
              lmax: lmaxView(i),
              rmax: rmaxView(i)
            }
          });
        } else {
          steps.push({
            line: 17,
            msg: "min_max(" + min_max + ") 不大于 height[" + i + "](" + height[i] + ")，此位置不接雨水。",
            views: {
              vars: { n: n, res: res, i: i, min_max: min_max },
              height: { items: height.slice(), highlights: [i], showIndex: true },
              lmax: lmaxView(i),
              rmax: rmaxView(i)
            }
          });
        }
      }

      steps.push({
        line: 18,
        msg: "遍历结束，总共接雨水 " + res + " 单位。",
        views: {
          vars: { n: n, res: res, i: n-1, min_max: null },
          height: { items: height.slice(), showIndex: true },
          lmax: lmaxView(),
          rmax: rmaxView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);