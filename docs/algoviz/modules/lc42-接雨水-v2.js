(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc42-接雨水-v2"] = {
    title: "42 接雨水 · 双指针",
    language: "python",
    code: [
      "class Solution:",
      "    def trap(self, height: List[int]) -> int:",
      "        ans = 0",
      "        left, right = 0, len(height) - 1",
      "        leftMax = rightMax = 0",
      "",
      "        while left < right:",
      "            leftMax = max(leftMax, height[left])",
      "            rightMax = max(rightMax, height[right])",
      "            if height[left] < height[right]:",
      "                ans += leftMax - height[left]",
      "                left += 1",
      "            else:",
      "                ans += rightMax - height[right]",
      "                right -= 1",
      "",
      "        return ans"
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
      bars: { type: "bars", title: "接水过程" }
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
      var ans = 0;
      var left = 0, right = height.length - 1;
      var leftMax = 0, rightMax = 0;

      var barsView = function (hl, ok, bad) {
        var bars = [];
        for (var i = 0; i < height.length; i++) {
          bars.push({ start: i, end: i + 1, label: String(height[i]), status: "" });
        }
        var v = { bars: bars, axis: { min: 0, max: height.length, ticks: height.length } };
        if (hl) v.highlights = hl;
        if (ok) v.ok = ok;
        if (bad) v.bad = bad;
        return v;
      };

      var varsView = function (hotKey) {
        var o = { ans: ans, left: left, right: right, leftMax: leftMax, rightMax: rightMax };
        if (hotKey != null) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      };

      steps.push({
        line: 3, msg: "初始化：ans=0，左右指针指向数组两端，左右最大高度均为 0。",
        views: {
          vars: varsView(),
          height: { items: height.slice(), pointers: { left: left, right: right } },
          bars: barsView()
        }
      });

      while (left < right) {
        steps.push({
          line: 7, msg: "进入循环：left=" + left + " < right=" + right + "，继续处理。",
          views: {
            vars: varsView(),
            height: { items: height.slice(), pointers: { left: left, right: right }, highlights: [left, right] },
            bars: barsView([left, right])
          }
        });

        leftMax = Math.max(leftMax, height[left]);
        steps.push({
          line: 8, msg: "更新 leftMax：max(" + leftMax + ", " + height[left] + ") = " + leftMax + "。",
          views: {
            vars: varsView("leftMax"),
            height: { items: height.slice(), pointers: { left: left, right: right }, highlights: [left] },
            bars: barsView([left])
          }
        });

        rightMax = Math.max(rightMax, height[right]);
        steps.push({
          line: 9, msg: "更新 rightMax：max(" + rightMax + ", " + height[right] + ") = " + rightMax + "。",
          views: {
            vars: varsView("rightMax"),
            height: { items: height.slice(), pointers: { left: left, right: right }, highlights: [right] },
            bars: barsView([right])
          }
        });

        if (height[left] < height[right]) {
          steps.push({
            line: 10, msg: "height[left]=" + height[left] + " < height[right]=" + height[right] + "，处理左指针。",
            views: {
              vars: varsView(),
              height: { items: height.slice(), pointers: { left: left, right: right }, highlights: [left, right] },
              bars: barsView([left, right])
            }
          });

          ans += leftMax - height[left];
          steps.push({
            line: 11, msg: "ans += " + leftMax + " - " + height[left] + " = " + ans + "（此处可接 " + (leftMax - height[left]) + " 单位水）。",
            views: {
              vars: varsView("ans"),
              height: { items: height.slice(), pointers: { left: left, right: right }, highlights: [left] },
              bars: barsView([left], [left])
            }
          });

          left += 1;
          steps.push({
            line: 12, msg: "左指针右移：left = " + left + "。",
            views: {
              vars: varsView("left"),
              height: { items: height.slice(), pointers: { left: left, right: right } },
              bars: barsView()
            }
          });
        } else {
          steps.push({
            line: 13, msg: "height[left]=" + height[left] + " >= height[right]=" + height[right] + "，处理右指针。",
            views: {
              vars: varsView(),
              height: { items: height.slice(), pointers: { left: left, right: right }, highlights: [left, right] },
              bars: barsView([left, right])
            }
          });

          ans += rightMax - height[right];
          steps.push({
            line: 14, msg: "ans += " + rightMax + " - " + height[right] + " = " + ans + "（此处可接 " + (rightMax - height[right]) + " 单位水）。",
            views: {
              vars: varsView("ans"),
              height: { items: height.slice(), pointers: { left: left, right: right }, highlights: [right] },
              bars: barsView([right], [right])
            }
          });

          right -= 1;
          steps.push({
            line: 15, msg: "右指针左移：right = " + right + "。",
            views: {
              vars: varsView("right"),
              height: { items: height.slice(), pointers: { left: left, right: right } },
              bars: barsView()
            }
          });
        }
      }

      steps.push({
        line: 17, msg: "循环结束（left=" + left + " >= right=" + right + "），返回 ans=" + ans + "。",
        views: {
          vars: varsView(),
          height: { items: height.slice(), pointers: { left: left, right: right } },
          bars: barsView()
        }
      });

      return { steps: steps, output: JSON.stringify(ans) };
    }
  };
})(typeof window !== "undefined" ? window : this);