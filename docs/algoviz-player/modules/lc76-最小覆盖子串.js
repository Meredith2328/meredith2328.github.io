(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc76-最小覆盖子串"] = {
    title: "76 最小覆盖子串 · 滑动窗口",
    language: "python",
    code: [
      "class Solution:",
      "    def minWindow(self, s: str, t: str) -> str:",
      "        # 代码其实很直接.",
      "        # 两个Counter利用>=处理\"包含, 包括重复字符\",",
      "        # 伸展滑动窗口右指针, 如果成功包含, 则缩短左指针直到最小.",
      "        cnt_s = Counter()",
      "        cnt_t = Counter(t)",
      "",
      "        ans_left, ans_right = -1, len(s) # 找到最短",
      "        left = 0",
      "        for right, c in enumerate(s):",
      "            cnt_s[c] += 1",
      "            while cnt_s >= cnt_t: # 涵盖",
      "                if right - left < ans_right - ans_left:",
      "                    ans_left, ans_right = left, right",
      "                cnt_s[s[left]] -= 1",
      "                left += 1",
      "        return \"\" if ans_left < 0 else s[ans_left: ans_right + 1]"
    ].join("\n"),

    defaultInput: "s = \"ADOBECODEBANC\"\nt = \"ABC\"",
    inputHint: "每行一个变量，格式如 s = \"ADOBECODEBANC\" / t = \"ABC\"",
    testInputs: [
      "s = \"a\"\nt = \"a\"",
      "s = \"a\"\nt = \"aa\""
    ],
    expectedOutputs: [
      "\"BANC\"",
      "\"a\"",
      "\"\""
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      s: { type: "array", title: "s" },
      cnt_s: { type: "vars", title: "cnt_s" },
      cnt_t: { type: "vars", title: "cnt_t" }
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
      if (typeof env.s !== "string") throw new Error("缺少 s = \"字符串\"");
      if (typeof env.t !== "string") throw new Error("缺少 t = \"字符串\"");
      return env;
    },

    run: function (input) {
      var s = input.s, t = input.t;
      var steps = [];
      var cnt_s = {};
      var cnt_t = {};
      var i, c;
      for (i = 0; i < t.length; i++) {
        c = t[i];
        cnt_t[c] = (cnt_t[c] || 0) + 1;
      }

      var cntView = function (obj, hotKey) {
        var o = {};
        Object.keys(obj).forEach(function (k) { o[k] = obj[k]; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      };

      var sItems = s.split("");

      var covers = function () {
        for (var k in cnt_t) {
          if ((cnt_s[k] || 0) < cnt_t[k]) return false;
        }
        return true;
      };

      steps.push({
        line: 2, msg: "开始：在 s 中找包含 t 所有字符（含重复）的最短子串。",
        views: {
          vars: { "ans_left": -1, "ans_right": s.length, "left": 0, "right": null },
          s: { items: sItems.slice() },
          cnt_s: {},
          cnt_t: cntView(cnt_t)
        }
      });

      steps.push({
        line: 5, msg: "初始化 cnt_t 为 t 中每个字符的出现次数。",
        views: {
          vars: { "ans_left": -1, "ans_right": s.length, "left": 0, "right": null },
          s: { items: sItems.slice() },
          cnt_s: {},
          cnt_t: cntView(cnt_t)
        }
      });

      steps.push({
        line: 8, msg: "初始化答案区间为 [-1, len(s)]，左指针 left=0。",
        views: {
          vars: { "ans_left": -1, "ans_right": s.length, "left": 0, "right": null },
          s: { items: sItems.slice() },
          cnt_s: {},
          cnt_t: cntView(cnt_t)
        }
      });

      var ans_left = -1, ans_right = s.length, left = 0;
      for (var right = 0; right < s.length; right++) {
        c = s[right];
        cnt_s[c] = (cnt_s[c] || 0) + 1;
        steps.push({
          line: 10, msg: "右指针 right=" + right + "，字符 '" + c + "' 加入窗口，cnt_s['" + c + "']=" + cnt_s[c] + "。",
          views: {
            vars: { "ans_left": ans_left, "ans_right": ans_right, "left": left, "right": right },
            s: { items: sItems.slice(), highlights: [right], pointers: { left: left, right: right } },
            cnt_s: cntView(cnt_s, c),
            cnt_t: cntView(cnt_t)
          }
        });

        while (covers()) {
          if (right - left < ans_right - ans_left) {
            ans_left = left;
            ans_right = right;
            steps.push({
              line: 12, msg: "窗口涵盖 t，且长度 " + (right - left + 1) + " 更短，更新答案区间 [" + ans_left + ", " + ans_right + "]（子串 \"" + s.substring(ans_left, ans_right + 1) + "\"）。",
              views: {
                vars: { "ans_left": ans_left, "ans_right": ans_right, "left": left, "right": right },
                s: { items: sItems.slice(), highlights: [left, right], ok: [left, right], pointers: { left: left, right: right } },
                cnt_s: cntView(cnt_s),
                cnt_t: cntView(cnt_t)
              }
            });
          } else {
            steps.push({
              line: 12, msg: "窗口涵盖 t，但长度 " + (right - left + 1) + " 不短于当前答案，不更新。",
              views: {
                vars: { "ans_left": ans_left, "ans_right": ans_right, "left": left, "right": right },
                s: { items: sItems.slice(), highlights: [left, right], pointers: { left: left, right: right } },
                cnt_s: cntView(cnt_s),
                cnt_t: cntView(cnt_t)
              }
            });
          }

          var leftChar = s[left];
          cnt_s[leftChar] -= 1;
          if (cnt_s[leftChar] === 0) delete cnt_s[leftChar];
          left++;
          steps.push({
            line: 13, msg: "左指针 left=" + (left - 1) + " 的字符 '" + leftChar + "' 移出窗口，cnt_s['" + leftChar + "']=" + (cnt_s[leftChar] || 0) + "，left 变为 " + left + "。",
            views: {
              vars: { "ans_left": ans_left, "ans_right": ans_right, "left": left, "right": right },
              s: { items: sItems.slice(), highlights: [left - 1], pointers: { left: left, right: right } },
              cnt_s: cntView(cnt_s, leftChar),
              cnt_t: cntView(cnt_t)
            }
          });
        }
      }

      var output = ans_left < 0 ? "" : s.substring(ans_left, ans_right + 1);
      steps.push({
        line: 15, msg: "遍历结束，最终答案为 \"" + output + "\"。",
        views: {
          vars: { "ans_left": ans_left, "ans_right": ans_right, "left": left, "right": s.length - 1 },
          s: { items: sItems.slice(), ok: ans_left >= 0 ? [ans_left, ans_right] : [] },
          cnt_s: cntView(cnt_s),
          cnt_t: cntView(cnt_t)
        }
      });

      return { steps: steps, output: JSON.stringify(output) };
    }
  };
})(typeof window !== "undefined" ? window : this);