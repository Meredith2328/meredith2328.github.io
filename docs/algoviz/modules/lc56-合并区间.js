(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc56-合并区间"] = {
    title: "56 合并区间 · 排序+扫描",
    language: "python",
    code: [
      "class Solution:",
      "    def merge(self, intervals: List[List[int]]) -> List[List[int]]:",
      "        intervals.sort(key=lambda x: x[0])",
      "        res = []",
      "        l, r = intervals[0][0], intervals[0][1]",
      "        for i in range(1, len(intervals)):",
      "            if intervals[i][0] > r:",
      "                # 无法合并, 更新为新区间",
      "                res.append([l, r])",
      "                l, r = intervals[i][0], intervals[i][1]",
      "            else:",
      "                # 可以合并, 更新右端点",
      "                r = max(r, intervals[i][1])",
      "        if [l,r] not in res:",
      "            res.append([l,r])",
      "        return res"
    ].join("\n"),

    defaultInput: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
    inputHint: "每行一个变量，格式如 intervals = [[1,3],[2,6],[8,10],[15,18]]",
    testInputs: [
      "intervals = [[1,4],[4,5]]",
      "intervals = [[1,4],[2,3]]"
    ],
    expectedOutputs: [
      "[[1,5]]",
      "[[1,4]]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      intervals: { type: "array", title: "intervals" },
      res: { type: "array", title: "res" }
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
      if (!Array.isArray(env.intervals) || !env.intervals.every(function (x) { return Array.isArray(x) && x.length === 2; })) {
        throw new Error("缺少 intervals = [[a,b], ...] 或格式错误");
      }
      return env;
    },

    run: function (input) {
      var intervals = input.intervals.map(function (x) { return x.slice(); });
      var steps = [];
      var res = [];
      var resView = function (hotIdx) {
        var items = res.map(function (x) { return x.slice(); });
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) highlights.push(hotIdx);
        return { items: items, highlights: highlights };
      };

      steps.push({
        line: 2, msg: "开始合并区间，共 " + intervals.length + " 个区间。",
        views: {
          vars: { l: null, r: null, i: null },
          intervals: { items: intervals.slice() },
          res: { items: [] }
        }
      });

      // 排序
      intervals.sort(function (a, b) { return a[0] - b[0]; });
      steps.push({
        line: 3, msg: "按左端点排序后：[" + intervals.map(function (x) { return "[" + x.join(",") + "]"; }).join(", ") + "]。",
        views: {
          vars: { l: null, r: null, i: null },
          intervals: { items: intervals.slice() },
          res: { items: [] }
        }
      });

      steps.push({
        line: 4, msg: "初始化结果列表 res 为空。",
        views: {
          vars: { l: null, r: null, i: null },
          intervals: { items: intervals.slice() },
          res: { items: [] }
        }
      });

      var l = intervals[0][0], r = intervals[0][1];
      steps.push({
        line: 5, msg: "取第一个区间作为当前合并区间：l=" + l + ", r=" + r + "。",
        views: {
          vars: { l: l, r: r, i: null },
          intervals: { items: intervals.slice(), highlights: [0] },
          res: { items: [] }
        }
      });

      for (var i = 1; i < intervals.length; i++) {
        steps.push({
          line: 6, msg: "遍历第 " + i + " 个区间 [" + intervals[i][0] + "," + intervals[i][1] + "]。",
          views: {
            vars: { l: l, r: r, i: i },
            intervals: { items: intervals.slice(), highlights: [i] },
            res: resView()
          }
        });

        if (intervals[i][0] > r) {
          steps.push({
            line: 7, msg: "当前区间左端点 " + intervals[i][0] + " > 当前右端点 " + r + "，无法合并。",
            views: {
              vars: { l: l, r: r, i: i },
              intervals: { items: intervals.slice(), highlights: [i] },
              res: resView()
            }
          });

          res.push([l, r]);
          steps.push({
            line: 9, msg: "将当前合并区间 [" + l + "," + r + "] 加入结果 res。",
            views: {
              vars: { l: l, r: r, i: i },
              intervals: { items: intervals.slice(), highlights: [i] },
              res: resView(res.length - 1)
            }
          });

          l = intervals[i][0];
          r = intervals[i][1];
          steps.push({
            line: 10, msg: "更新当前合并区间为 [" + l + "," + r + "]。",
            views: {
              vars: { l: l, r: r, i: i },
              intervals: { items: intervals.slice(), highlights: [i] },
              res: resView()
            }
          });
        } else {
          steps.push({
            line: 12, msg: "当前区间左端点 " + intervals[i][0] + " ≤ 当前右端点 " + r + "，可以合并。",
            views: {
              vars: { l: l, r: r, i: i },
              intervals: { items: intervals.slice(), highlights: [i] },
              res: resView()
            }
          });

          var oldR = r;
          r = Math.max(r, intervals[i][1]);
          steps.push({
            line: 14, msg: "更新右端点：max(" + oldR + ", " + intervals[i][1] + ") = " + r + "。",
            views: {
              vars: { l: l, r: r, i: i },
              intervals: { items: intervals.slice(), highlights: [i] },
              res: resView()
            }
          });
        }
      }

      var exists = false;
      for (var j = 0; j < res.length; j++) {
        if (res[j][0] === l && res[j][1] === r) { exists = true; break; }
      }
      if (!exists) {
        res.push([l, r]);
        steps.push({
          line: 15, msg: "将最后一个合并区间 [" + l + "," + r + "] 加入结果 res。",
          views: {
            vars: { l: l, r: r, i: i },
            intervals: { items: intervals.slice() },
            res: resView(res.length - 1)
          }
        });
      } else {
        steps.push({
          line: 15, msg: "最后一个合并区间 [" + l + "," + r + "] 已在 res 中，无需重复添加。",
          views: {
            vars: { l: l, r: r, i: i },
            intervals: { items: intervals.slice() },
            res: resView()
          }
        });
      }

      steps.push({
        line: 16, msg: "返回合并后的区间列表。",
        views: {
          vars: { l: l, r: r, i: i },
          intervals: { items: intervals.slice() },
          res: resView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);