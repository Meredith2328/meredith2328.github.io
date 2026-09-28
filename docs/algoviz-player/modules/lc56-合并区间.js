(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc56-合并区间"] = {
    title: "56 合并区间 · 排序+扫描",
    language: "python",
    link: "https://leetcode.cn/problems/merge-intervals/",
    code: [
      "class Solution:",
      "    def merge(self, intervals: List[List[int]]) -> List[List[int]]:",
      "        if not intervals:",
      "            return []",
      "        intervals.sort()",
      "        res = [intervals[0]]",
      "        for start, end in intervals[1:]:",
      "            if start <= res[-1][1]: # 可合并",
      "                res[-1][1] = max(res[-1][1], end)",
      "            else:",
      "                res.append([start, end])",
      "        return res"
    ].join("\n"),

    defaultInput: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
    inputHint: "每行一个变量，格式如 intervals = [[1,3],[2,6],[8,10],[15,18]]",
    testInputs: [
      "intervals = [[1,4],[4,5]]",
      "intervals = []"
    ],
    expectedOutputs: ["[[1,6],[8,10],[15,18]]", "[[1,5]]", "[]"],

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
      if (!Array.isArray(env.intervals)) throw new Error("缺少 intervals = [[...]]");
      return env;
    },

    run: function (input) {
      var intervals = input.intervals;
      var steps = [];
      var res = [];

      var intervalsView = function (highlights, ok) {
        return {
          items: intervals.map(function (iv) { return "[" + iv[0] + "," + iv[1] + "]"; }),
          highlights: highlights || [],
          ok: ok || []
        };
      };

      var resView = function (highlights, ok) {
        return {
          items: res.map(function (iv) { return "[" + iv[0] + "," + iv[1] + "]"; }),
          highlights: highlights || [],
          ok: ok || []
        };
      };

      // 空输入
      steps.push({
        line: 3,
        msg: "检查 intervals 是否为空。",
        views: {
          vars: { intervals: intervals.length },
          intervals: intervalsView(),
          res: resView()
        }
      });
      if (intervals.length === 0) {
        steps.push({
          line: 4,
          msg: "intervals 为空，直接返回 []。",
          views: {
            vars: { intervals: intervals.length },
            intervals: intervalsView(),
            res: resView()
          }
        });
        return { steps: steps, output: "[]" };
      }

      // 排序
      var sorted = intervals.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
      intervals = sorted;
      steps.push({
        line: 5,
        msg: "按区间起点排序 intervals。",
        views: {
          vars: { intervals: intervals.length },
          intervals: intervalsView(),
          res: resView()
        }
      });

      // 初始化 res
      res = [intervals[0].slice()];
      steps.push({
        line: 6,
        msg: "res 初始化为第一个区间 [" + res[0][0] + "," + res[0][1] + "]。",
        views: {
          vars: { intervals: intervals.length, res: res.length },
          intervals: intervalsView([0]),
          res: resView([0])
        }
      });

      // 遍历
      for (var i = 1; i < intervals.length; i++) {
        var start = intervals[i][0], end = intervals[i][1];
        steps.push({
          line: 7,
          msg: "遍历到第 " + i + " 个区间 [" + start + "," + end + "]。",
          views: {
            vars: { i: i, start: start, end: end, res: res.length },
            intervals: intervalsView([i]),
            res: resView()
          }
        });

        if (start <= res[res.length - 1][1]) {
          steps.push({
            line: 8,
            msg: "start=" + start + " <= res 末尾右端点 " + res[res.length - 1][1] + "，可以合并。",
            views: {
              vars: { i: i, start: start, end: end, res: res.length },
              intervals: intervalsView([i]),
              res: resView([res.length - 1])
            }
          });
          var oldEnd = res[res.length - 1][1];
          res[res.length - 1][1] = Math.max(oldEnd, end);
          steps.push({
            line: 9,
            msg: "更新 res 末尾右端点：max(" + oldEnd + ", " + end + ") = " + res[res.length - 1][1] + "。",
            views: {
              vars: { i: i, start: start, end: end, res: res.length },
              intervals: intervalsView([i]),
              res: resView([res.length - 1])
            }
          });
        } else {
          steps.push({
            line: 10,
            msg: "start=" + start + " > res 末尾右端点 " + res[res.length - 1][1] + "，不能合并。",
            views: {
              vars: { i: i, start: start, end: end, res: res.length },
              intervals: intervalsView([i]),
              res: resView([res.length - 1])
            }
          });
          res.push([start, end]);
          steps.push({
            line: 11,
            msg: "将 [" + start + "," + end + "] 追加到 res。",
            views: {
              vars: { i: i, start: start, end: end, res: res.length },
              intervals: intervalsView([i]),
              res: resView([res.length - 1])
            }
          });
        }
      }

      steps.push({
        line: 12,
        msg: "遍历结束，返回合并后的区间。",
        views: {
          vars: { res: res.length },
          intervals: intervalsView(),
          res: resView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);