(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc49-字母异位词分组"] = {
    title: "49 字母异位词分组 · 排序键哈希",
    link: "https://leetcode.cn/problems/group-anagrams/",
    language: "python",
    code: [
      "class Solution:",
      "    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:",
      "        group = {}",
      "        for s in strs:",
      "            sorted_s = ''.join(sorted(s))",
      "            if sorted_s not in group:",
      "                group[sorted_s] = [s]",
      "            else:",
      "                group[sorted_s].append(s)",
      "",
      "        return list(group.values())"
    ].join("\n"),

    defaultInput: "strs = [\"eat\", \"tea\", \"tan\", \"ate\", \"nat\", \"bat\"]",
    inputHint: "每行一个变量，格式如 strs = [\"eat\", \"tea\", \"tan\"]",

    testInputs: [
      "strs = [\"\"]",
      "strs = [\"a\"]"
    ],
    expectedOutputs: ["[[\"eat\",\"tea\",\"ate\"],[\"tan\",\"nat\"],[\"bat\"]]", "[[\"\"]]", "[[\"a\"]]"],

    views: {
      vars: { type: "vars", title: "变量" },
      strs: { type: "array", title: "strs" },
      group: { type: "vars", title: "哈希表 group" }
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
      if (!Array.isArray(env.strs)) throw new Error("缺少 strs = [...]");
      return env;
    },

    run: function (input) {
      var strs = input.strs;
      var steps = [];
      var group = {};
      var groupView = function (hotKey) {
        var o = {};
        Object.keys(group).forEach(function (k) {
          o[k] = group[k].slice();
        });
        if (hotKey != null && o[hotKey] !== undefined) {
          o[hotKey] = { value: o[hotKey], __hot: true };
        }
        return o;
      };

      steps.push({
        line: 3, msg: "开始：初始化空哈希表 group，用于按排序后的字符串分组。",
        views: {
          vars: { s: null, sorted_s: null },
          strs: { items: strs.slice() },
          group: {}
        }
      });

      for (var i = 0; i < strs.length; i++) {
        var s = strs[i];
        steps.push({
          line: 4, msg: "遍历到第 " + i + " 个字符串 s = \"" + s + "\"。",
          views: {
            vars: { s: s, sorted_s: null },
            strs: { items: strs.slice(), highlights: [i], pointers: { i: i } },
            group: groupView()
          }
        });

        var sorted_s = s.split('').sort().join('');
        steps.push({
          line: 5, msg: "将 \"" + s + "\" 的字符排序后得到 sorted_s = \"" + sorted_s + "\"。",
          views: {
            vars: { s: s, sorted_s: sorted_s },
            strs: { items: strs.slice(), highlights: [i] },
            group: groupView()
          }
        });

        if (!(sorted_s in group)) {
          group[sorted_s] = [s];
          steps.push({
            line: 7, msg: "sorted_s \"" + sorted_s + "\" 不在 group 中，新建键并放入 [\"" + s + "\"]。",
            views: {
              vars: { s: s, sorted_s: sorted_s },
              strs: { items: strs.slice(), highlights: [i] },
              group: groupView(sorted_s)
            }
          });
        } else {
          group[sorted_s].push(s);
          steps.push({
            line: 9, msg: "sorted_s \"" + sorted_s + "\" 已存在，将 \"" + s + "\" 追加到该组。",
            views: {
              vars: { s: s, sorted_s: sorted_s },
              strs: { items: strs.slice(), highlights: [i] },
              group: groupView(sorted_s)
            }
          });
        }
      }

      var result = [];
      Object.keys(group).forEach(function (k) {
        result.push(group[k].slice());
      });

      steps.push({
        line: 11, msg: "遍历结束，返回 group 的所有值（每组异位词列表）。",
        views: {
          vars: { "返回值": result },
          strs: { items: strs.slice() },
          group: groupView()
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);