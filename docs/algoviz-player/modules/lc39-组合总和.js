(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc39-组合总和"] = {
    title: "39 组合总和 · 回溯",
    link: "https://leetcode.cn/problems/combination-sum/",
    language: "python",
    code: [
      "class Solution:",
      "    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:",
      "        res = []",
      "",
      "        def backtrack(path, cur, start):",
      "            if cur == 0:",
      "                res.append(path[:])",
      "                return",
      "",
      "            for i in range(start, len(candidates)):",
      "                if candidates[i] > cur:",
      "                    continue",
      "                path.append(candidates[i])",
      "                backtrack(path, cur - candidates[i], i) # 细节: 可以重复使用, 所以是i",
      "                path.pop()",
      "",
      "        candidates.sort() # 排序优化剪枝",
      "        backtrack([], target, 0)",
      "        return res"
    ].join("\n"),

    defaultInput: "candidates = [2, 3, 6, 7]\ntarget = 7",
    inputHint: "每行一个变量，格式如 candidates = [2, 3, 6, 7] / target = 7",

    testInputs: [
      "candidates = [2, 3, 5]\ntarget = 8",
      "candidates = [2]\ntarget = 1"
    ],
    expectedOutputs: ["[[2,2,3],[7]]", "[[2,2,2,2],[2,3,3],[3,5]]", "[]"],

    views: {
      vars: { type: "vars", title: "变量" },
      path: { type: "array", title: "path" },
      cand: { type: "array", title: "candidates" },
      res: { type: "vars", title: "res" }
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
        return { items: path.slice(), showIndex: true };
      }
      function resView() {
        var o = {};
        res.forEach(function (r, idx) { o["res[" + idx + "]"] = r.slice(); });
        return o;
      }
      function candView(highlights, ok, bad) {
        return {
          items: candidates.slice(),
          highlights: highlights || [],
          ok: ok || [],
          bad: bad || [],
          showIndex: true
        };
      }

      // 初始状态
      steps.push({
        line: 2,
        msg: "开始：candidates = [" + candidates.join(", ") + "]，target = " + target + "。",
        views: {
          vars: { target: target, cur: null, start: null },
          path: pathView(),
          cand: candView(),
          res: resView()
        }
      });

      // 排序
      candidates.sort(function (a, b) { return a - b; });
      steps.push({
        line: 13,
        msg: "排序优化剪枝：candidates 排序为 [" + candidates.join(", ") + "]。",
        views: {
          vars: { target: target, cur: null, start: null },
          path: pathView(),
          cand: candView(),
          res: resView()
        }
      });

      // 回溯函数（递归模拟）
      function backtrack(cur, start, depth) {
        // 对应 line 5
        steps.push({
          line: 5,
          msg: "进入 backtrack：cur=" + cur + "，start=" + start + "，path=[" + path.join(", ") + "]。",
          views: {
            vars: { target: target, cur: cur, start: start, depth: depth },
            path: pathView(),
            cand: candView([], [], []),
            res: resView()
          }
        });

        if (cur === 0) {
          // line 6
          steps.push({
            line: 6,
            msg: "cur == 0，找到一个组合：[" + path.join(", ") + "]，加入 res。",
            views: {
              vars: { target: target, cur: cur, start: start, depth: depth },
              path: pathView(),
              cand: candView([], [], []),
              res: resView()
            }
          });
          res.push(path.slice());
          // line 7
          steps.push({
            line: 7,
            msg: "记录结果后返回。",
            views: {
              vars: { target: target, cur: cur, start: start, depth: depth },
              path: pathView(),
              cand: candView([], [], []),
              res: resView()
            }
          });
          return;
        }

        // line 9: for 循环
        for (var i = start; i < candidates.length; i++) {
          // line 9
          steps.push({
            line: 9,
            msg: "for 循环：i=" + i + "，candidates[" + i + "]=" + candidates[i] + "。",
            views: {
              vars: { target: target, cur: cur, start: start, i: i, depth: depth },
              path: pathView(),
              cand: candView([i], [], []),
              res: resView()
            }
          });

          // line 10
          if (candidates[i] > cur) {
            steps.push({
              line: 10,
              msg: "candidates[" + i + "]=" + candidates[i] + " > cur=" + cur + "，剪枝跳过。",
              views: {
                vars: { target: target, cur: cur, start: start, i: i, depth: depth },
                path: pathView(),
                cand: candView([i], [], [i]),
                res: resView()
              }
            });
            continue;
          }

          // line 11
          path.push(candidates[i]);
          steps.push({
            line: 11,
            msg: "path 加入 " + candidates[i] + "，path=[" + path.join(", ") + "]。",
            views: {
              vars: { target: target, cur: cur, start: start, i: i, depth: depth },
              path: pathView(),
              cand: candView([i], [], []),
              res: resView()
            }
          });

          // line 12: 递归调用
          backtrack(cur - candidates[i], i, depth + 1);

          // line 13: 回溯
          path.pop();
          steps.push({
            line: 13,
            msg: "回溯：path 弹出 " + candidates[i] + "，path=[" + path.join(", ") + "]。",
            views: {
              vars: { target: target, cur: cur, start: start, i: i, depth: depth },
              path: pathView(),
              cand: candView([i], [], []),
              res: resView()
            }
          });
        }
      }

      // 调用回溯
      backtrack(target, 0, 0);

      // 返回结果
      steps.push({
        line: 15,
        msg: "回溯结束，返回 res = " + JSON.stringify(res) + "。",
        views: {
          vars: { target: target },
          path: pathView(),
          cand: candView(),
          res: resView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);