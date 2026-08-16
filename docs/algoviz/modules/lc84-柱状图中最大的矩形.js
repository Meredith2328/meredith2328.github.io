(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc84-柱状图中最大的矩形"] = {
    title: "84 柱状图中最大的矩形 · 单调栈",
    language: "python",
    code: [
      "class Solution:",
      "    def largestRectangleArea(self, heights: List[int]) -> int:",
      "        heights = [0] + heights + [0]",
      "        stack = []",
      "        # 如果高度为升序则直接存入",
      "        # 一旦有逆序即找到右边界",
      "        # 通过弹出直到找到左边界来确定面积",
      "        max_area = 0",
      "",
      "        for i in range(len(heights)):",
      "            # 满足栈顶大于nums[i]时, i即为右边界",
      "            # 满足栈中指向的某个元素小于nums[i]时, 该元素即为左边界",
      "            while stack and heights[i] < heights[stack[-1]]:",
      "                height = heights[stack.pop()]",
      "                width = i - stack[-1] - 1",
      "                max_area = max(max_area, height * width)",
      "            stack.append(i)",
      "",
      "        return max_area"
    ].join("\n"),

    defaultInput: "heights = [2, 1, 5, 6, 2, 3]",
    inputHint: "每行一个变量，格式如 heights = [2, 1, 5, 6, 2, 3]",
    testInputs: ["heights = [2, 4]", "heights = [2, 1, 2]"],
    expectedOutputs: ["10", "4", "3"],

    views: {
      vars: { type: "vars", title: "变量" },
      heights: { type: "array", title: "heights" },
      stack: { type: "stack", title: "栈（存下标）" }
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
      if (!Array.isArray(env.heights)) throw new Error("缺少 heights = [...]");
      return env;
    },

    run: function (input) {
      var heights = input.heights.slice();
      var steps = [];
      var stack = [];
      var max_area = 0;

      // 辅助：生成栈视图（显示下标对应的值）
      function stackView() {
        var items = [];
        for (var j = 0; j < stack.length; j++) {
          items.push({ index: stack[j], value: heights[stack[j]] });
        }
        return { items: items };
      }

      // 辅助：生成 heights 视图
      function heightsView(highlights, ok, bad, pointers) {
        var v = { items: heights.slice() };
        if (highlights) v.highlights = highlights;
        if (ok) v.ok = ok;
        if (bad) v.bad = bad;
        if (pointers) v.pointers = pointers;
        return v;
      }

      // 初始：加哨兵
      steps.push({
        line: 3,
        msg: "在 heights 两端各加一个高度为 0 的哨兵，方便处理边界。",
        views: {
          vars: { max_area: max_area, i: null, height: null, width: null },
          heights: heightsView(),
          stack: stackView()
        }
      });
      heights = [0].concat(heights, [0]);

      steps.push({
        line: 4,
        msg: "初始化空栈，栈中存下标。",
        views: {
          vars: { max_area: max_area, i: null, height: null, width: null },
          heights: heightsView(),
          stack: stackView()
        }
      });

      steps.push({
        line: 7,
        msg: "初始化最大面积 max_area = 0。",
        views: {
          vars: { max_area: max_area, i: null, height: null, width: null },
          heights: heightsView(),
          stack: stackView()
        }
      });

      for (var i = 0; i < heights.length; i++) {
        steps.push({
          line: 9,
          msg: "遍历到下标 i=" + i + "，高度为 " + heights[i] + "。",
          views: {
            vars: { max_area: max_area, i: i, height: null, width: null },
            heights: heightsView([i], null, null, { i: i }),
            stack: stackView()
          }
        });

        // while 循环
        while (stack.length > 0 && heights[i] < heights[stack[stack.length - 1]]) {
          var topIdx = stack[stack.length - 1];
          steps.push({
            line: 11,
            msg: "栈顶高度 " + heights[topIdx] + " 大于当前高度 " + heights[i] + "，i=" + i + " 是右边界，开始弹出。",
            views: {
              vars: { max_area: max_area, i: i, height: null, width: null },
              heights: heightsView([topIdx, i], null, [topIdx]),
              stack: stackView()
            }
          });

          var height = heights[stack.pop()];
          var width = i - stack[stack.length - 1] - 1;
          var area = height * width;
          max_area = Math.max(max_area, area);

          steps.push({
            line: 12,
            msg: "弹出下标 " + topIdx + "，高度 height=" + height + "，左边界为栈顶 " + (stack.length > 0 ? stack[stack.length - 1] : "无") + "，宽度 width=" + width + "，面积=" + area + "。",
            views: {
              vars: { max_area: max_area, i: i, height: height, width: width, area: area },
              heights: heightsView([i], null, [topIdx]),
              stack: stackView()
            }
          });

          steps.push({
            line: 13,
            msg: "更新最大面积 max_area = " + max_area + "。",
            views: {
              vars: { max_area: max_area, i: i, height: height, width: width, area: area },
              heights: heightsView(),
              stack: stackView()
            }
          });
        }

        stack.push(i);
        steps.push({
          line: 14,
          msg: "将当前下标 " + i + " 压入栈。",
          views: {
            vars: { max_area: max_area, i: i, height: null, width: null },
            heights: heightsView([i]),
            stack: stackView()
          }
        });
      }

      steps.push({
        line: 16,
        msg: "遍历结束，最大矩形面积为 " + max_area + "。",
        views: {
          vars: { max_area: max_area, i: null, height: null, width: null },
          heights: heightsView(),
          stack: stackView()
        }
      });

      return { steps: steps, output: JSON.stringify(max_area) };
    }
  };
})(typeof window !== "undefined" ? window : this);