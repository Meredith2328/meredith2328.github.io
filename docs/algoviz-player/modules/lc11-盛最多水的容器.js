(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc11-盛最多水的容器"] = {
    title: "11 盛最多水的容器",
    link: "https://leetcode.cn/problems/container-with-most-water/",
    language: "python",
    code: [
      "class Solution:",
      "    def maxArea(self, height: List[int]) -> int:",
      "        sz = len(height)",
      "        max_area = 0",
      "        i, j = 0, sz - 1",
      "        while i < j:",
      "            cur_area = min(height[i], height[j]) * (j - i)",
      "            max_area = max(max_area, cur_area)",
      "            if height[i] < height[j]:",
      "                i += 1",
      "            else:",
      "                j -= 1",
      "",
      "        return max_area"
    ].join("\n"),

    defaultInput: "height = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
    inputHint: "每行一个变量，如 height = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
    testInputs: [
      "height = [1, 1]",
      "height = [1, 2, 3, 4]"
    ],
    expectedOutputs: [
      "49",
      "1",
      "4"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      height: { type: "array", title: "height" }
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
      var steps = [];
      var sz = height.length;
      var max_area = 0;
      var i = 0, j = sz - 1;

      function heightView(hi, hj) {
        var items = height.slice();
        var highlights = [];
        if (hi !== undefined && hi >= 0 && hi < height.length) highlights.push(hi);
        if (hj !== undefined && hj >= 0 && hj < height.length && hj !== hi) highlights.push(hj);
        var view = { items: items, highlights: highlights, pointers: {} };
        if (hi !== undefined && hi >= 0 && hi < height.length) view.pointers.i = hi;
        if (hj !== undefined && hj >= 0 && hj < height.length) view.pointers.j = hj;
        return view;
      }

      function varsView(extra) {
        var o = { sz: sz, max_area: max_area, i: i, j: j };
        if (extra) {
          for (var k in extra) {
            if (Object.prototype.hasOwnProperty.call(extra, k)) o[k] = extra[k];
          }
        }
        return o;
      }

      // line 3: sz = len(height)
      steps.push({
        line: 3,
        msg: "计算数组长度 sz = " + sz + "。",
        views: {
          vars: { sz: sz, max_area: 0, i: null, j: null },
          height: heightView()
        }
      });

      // line 4: max_area = 0
      steps.push({
        line: 4,
        msg: "初始化最大面积为 0。",
        views: {
          vars: { sz: sz, max_area: 0, i: null, j: null },
          height: heightView()
        }
      });

      // line 5: i, j = 0, sz - 1
      i = 0;
      j = sz - 1;
      steps.push({
        line: 5,
        msg: "双指针初始化：i = " + i + "，j = " + j + "。",
        views: {
          vars: varsView(),
          height: heightView(i, j)
        }
      });

      // while i < j
      while (i < j) {
        // line 6: while condition
        steps.push({
          line: 6,
          msg: "while 条件成立（i=" + i + " < j=" + j + "），进入循环。",
          views: {
            vars: varsView(),
            height: heightView(i, j)
          }
        });

        // line 7: cur_area = ...
        var cur_area = Math.min(height[i], height[j]) * (j - i);
        steps.push({
          line: 7,
          msg: "计算当前面积 cur_area = min(" + height[i] + ", " + height[j] + ") * " + (j - i) + " = " + cur_area + "。",
          views: {
            vars: varsView({ cur_area: cur_area }),
            height: heightView(i, j)
          }
        });

        // line 8: max_area = max(...)
        max_area = Math.max(max_area, cur_area);
        steps.push({
          line: 8,
          msg: "更新最大面积 max_area = " + max_area + "。",
          views: {
            vars: varsView({ cur_area: cur_area }),
            height: heightView(i, j)
          }
        });

        // line 9: if height[i] < height[j]
        if (height[i] < height[j]) {
          steps.push({
            line: 9,
            msg: "height[" + i + "]=" + height[i] + " < height[" + j + "]=" + height[j] + "，进入 if 分支。",
            views: {
              vars: varsView({ cur_area: cur_area }),
              height: heightView(i, j)
            }
          });

          // line 10: i += 1
          i += 1;
          steps.push({
            line: 10,
            msg: "i 自增为 " + i + "。",
            views: {
              vars: varsView(),
              height: heightView(i, j)
            }
          });
        } else {
          steps.push({
            line: 9,
            msg: "height[" + i + "]=" + height[i] + " 不小于 height[" + j + "]=" + height[j] + "，进入 else 分支。",
            views: {
              vars: varsView({ cur_area: cur_area }),
              height: heightView(i, j)
            }
          });

          // line 11: else:
          steps.push({
            line: 11,
            msg: "执行 else 分支：移动右指针。",
            views: {
              vars: varsView({ cur_area: cur_area }),
              height: heightView(i, j)
            }
          });

          // line 12: j -= 1
          j -= 1;
          steps.push({
            line: 12,
            msg: "j 自减为 " + j + "。",
            views: {
              vars: varsView(),
              height: heightView(i, j)
            }
          });
        }
      }

      // line 6: loop condition fails
      steps.push({
        line: 6,
        msg: "while 条件不再成立（i=" + i + ", j=" + j + "），退出循环。",
        views: {
          vars: varsView(),
          height: heightView(i, j)
        }
      });

      // line 14: return max_area
      steps.push({
        line: 14,
        msg: "返回最大面积 " + max_area + "。",
        views: {
          vars: varsView(),
          height: heightView()
        }
      });

      return { steps: steps, output: JSON.stringify(max_area) };
    }
  };
})(typeof window !== "undefined" ? window : this);