(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc39-组合总和-v2"] = {
    title: "39 组合总和 II · 回溯剪枝",
    language: "python",
    code: [
      "class Solution:",
      "    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:",
      "        res = []",
      "        def backtrack(path, start, remaining):",
      "            if remaining == 0:",
      "                res.append(path[:])",
      "                return",
      "",
      "            for i in range(start, len(candidates)):",
      "                if candidates[i] > remaining: # 剪枝",
      "                    return",
      "                if i > start and candidates[i] == candidates[i - 1]:",
      "                    continue",
      "                path.append(candidates[i])",
      "                backtrack(path, i + 1, remaining - candidates[i]) # 细节: i + 1",
      "                path.pop()",
      "",
      "        candidates.sort()",
      "        backtrack([], 0, target)",
      "        return res"
    ].join("\n"),

    defaultInput: "candidates = [10,1,2,7,6,1,5]\ntarget = 8",
    inputHint: "每行一个变量，格式如 candidates = [10,1,2,7,6,1,5] / target = 8",
    testInputs: [
      "candidates = [2,5,2,1,2]\ntarget = 5",
      "candidates = [1,1,1,2]\ntarget = 3"
    ],
    expectedOutputs: [
      "[[1,1,6],[1,2,5],[1,7],[2,6]]",
      "[[1,2,2],[5]]",
      "[[1,1,1],[1,2]]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      cand: { type: "array", title: "candidates" },
      path: { type: "array", title: "path" },
      res: { type: "vars", title: "结果 res" }
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
      if (!Array.isArray(env.candidates)) throw new Error("缺少 candidates = [...]");
      if (typeof env.target !== "number") throw new Error("缺少 target = 数字");
      return env;
    },

    run: function (input) {
      var candidates = input.candidates.slice();
      var target = input.target;
      var steps = [];
      var res = [];
      var path = [];

      // 视图辅助
      function pathView() {
        return { items: path.slice(), highlights: [] };
      }
      function resView() {
        var o = {};
        res.forEach(function (r, idx) { o["res[" + idx + "]"] = r; });
        return o;
      }
      function candView(highlights, ok, bad) {
        var v = { items: candidates.slice() };
        if (highlights) v.highlights = highlights;
        if (ok) v.ok = ok;
        if (bad) v.bad = bad;
        return v;
      }

      // 排序
      steps.push({
        line: 16, msg: "先对 candidates 排序，便于去重和剪枝。",
        views: {
          vars: { target: target, start: null, remaining: null, i: null },
          cand: candView(),
          path: pathView(),
          res: resView()
        }
      });
      candidates.sort(function (a, b) { return a - b; });
      steps.push({
        line: 16, msg: "排序后 candidates = [" + candidates.join(", ") + "]。",
        views: {
          vars: { target: target, start: null, remaining: null, i: null },
          cand: candView(),
          path: pathView(),
          res: resView()
        }
      });

      // 递归函数
      function backtrack(pathArr, start, remaining, depth) {
        // 进入函数
        steps.push({
          line: 4, msg: "进入 backtrack(path=" + JSON.stringify(pathArr) + ", start=" + start + ", remaining=" + remaining + ")。",
          views: {
            vars: { target: target, start: start, remaining: remaining, i: null, depth: depth },
            cand: candView(),
            path: { items: pathArr.slice() },
            res: resView()
          }
        });

        if (remaining === 0) {
          steps.push({
            line: 5, msg: "remaining == 0，找到一个组合 " + JSON.stringify(pathArr) + "，加入结果。",
            views: {
              vars: { target: target, start: start, remaining: remaining, i: null, depth: depth },
              cand: candView(),
              path: { items: pathArr.slice(), ok: pathArr.map(function (_, idx) { return idx; }) },
              res: resView()
            }
          });
          res.push(pathArr.slice());
          steps.push({
            line: 6, msg: "把 " + JSON.stringify(pathArr) + " 加入 res，然后返回。",
            views: {
              vars: { target: target, start: start, remaining: remaining, i: null, depth: depth },
              cand: candView(),
              path: { items: pathArr.slice() },
              res: resView()
            }
          });
          steps.push({
            line: 7, msg: "return，回溯到上一层。",
            views: {
              vars: { target: target, start: start, remaining: remaining, i: null, depth: depth },
              cand: candView(),
              path: { items: pathArr.slice() },
              res: resView()
            }
          });
          return;
        }

        // 循环
        for (var i = start; i < candidates.length; i++) {
          steps.push({
            line: 9, msg: "循环 i=" + i + "，candidates[" + i + "]=" + candidates[i] + "，remaining=" + remaining + "。",
            views: {
              vars: { target: target, start: start, remaining: remaining, i: i, depth: depth },
              cand: candView([i]),
              path: { items: pathArr.slice() },
              res: resView()
            }
          });

          if (candidates[i] > remaining) {
            steps.push({
              line: 10, msg: "candidates[" + i + "]=" + candidates[i] + " > remaining=" + remaining + "，剪枝返回。",
              views: {
                vars: { target: target, start: start, remaining: remaining, i: i, depth: depth },
                cand: candView([i], [], [i]),
                path: { items: pathArr.slice() },
                res: resView()
              }
            });
            steps.push({
              line: 11, msg: "return，因为后面元素更大，无需继续。",
              views: {
                vars: { target: target, start: start, remaining: remaining, i: i, depth: depth },
                cand: candView([i], [], [i]),
                path: { items: pathArr.slice() },
                res: resView()
              }
            });
            return;
          }

          if (i > start && candidates[i] === candidates[i - 1]) {
            steps.push({
              line: 12, msg: "candidates[" + i + "]=" + candidates[i] + " 与前一元素重复，跳过。",
              views: {
                vars: { target: target, start: start, remaining: remaining, i: i, depth: depth },
                cand: candView([i], [], [i]),
                path: { items: pathArr.slice() },
                res: resView()
              }
            });
            steps.push({
              line: 13, msg: "continue，跳过重复元素。",
              views: {
                vars: { target: target, start: start, remaining: remaining, i: i, depth: depth },
                cand: candView([i], [], [i]),
                path: { items: pathArr.slice() },
                res: resView()
              }
            });
            continue;
          }

          // 选择
          pathArr.push(candidates[i]);
          steps.push({
            line: 14, msg: "选择 " + candidates[i] + "，path 变为 " + JSON.stringify(pathArr) + "。",
            views: {
              vars: { target: target, start: start, remaining: remaining, i: i, depth: depth },
              cand: candView([i]),
              path: { items: pathArr.slice(), highlights: [pathArr.length - 1] },
              res: resView()
            }
          });

          // 递归
          backtrack(pathArr, i + 1, remaining - candidates[i], depth + 1);

          // 撤销
          pathArr.pop();
          steps.push({
            line: 15, msg: "撤销选择，path 恢复为 " + JSON.stringify(pathArr) + "。",
            views: {
              vars: { target: target, start: start, remaining: remaining, i: i, depth: depth },
              cand: candView([i]),
              path: { items: pathArr.slice() },
              res: resView()
            }
          });
        }

        steps.push({
          line: 9, msg: "循环结束，返回上一层。",
          views: {
            vars: { target: target, start: start, remaining: remaining, i: null, depth: depth },
            cand: candView(),
            path: { items: pathArr.slice() },
            res: resView()
          }
        });
      }

      // 初始调用
      steps.push({
        line: 17, msg: "调用 backtrack([], 0, " + target + ")。",
        views: {
          vars: { target: target, start: 0, remaining: target, i: null, depth: 0 },
          cand: candView(),
          path: pathView(),
          res: resView()
        }
      });
      backtrack([], 0, target, 0);

      steps.push({
        line: 18, msg: "回溯完成，返回最终结果。",
        views: {
          vars: { target: target, start: null, remaining: null, i: null, depth: null },
          cand: candView(),
          path: pathView(),
          res: resView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);