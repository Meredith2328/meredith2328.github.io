(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc763-划分字母区间"] = {
    title: "763 划分字母区间",
    language: "python",
    code: [
      "class Solution:",
      "    def partitionLabels(self, s: str) -> List[int]:",
      "        last_pos = {}",
      "        for i, ch in enumerate(s):",
      "            last_pos[ch] = i",
      "        res = []",
      "        start = 0",
      "        end = 0",
      "        for i, ch in enumerate(s):",
      "            end = max(end, last_pos[ch])",
      "            if i == end:",
      "                res.append(end - start + 1)",
      "                start = i + 1",
      "        return res"
    ].join("\n"),

    defaultInput: "s = \"ababcbacadefegdehijhklij\"",
    inputHint: "每行一个变量，格式如 s = \"ababcbacadefegdehijhklij\"",
    testInputs: [
      "s = \"abc\"",
      "s = \"a\""
    ],
    expectedOutputs: [
      "[9,7,8]",
      "[1,1,1]",
      "[1]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      s: { type: "array", title: "s" },
      last: { type: "vars", title: "last_pos" },
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
      if (typeof env.s !== "string") throw new Error("缺少 s = \"字符串\"");
      return env;
    },

    run: function (input) {
      var s = input.s;
      var steps = [];
      var last_pos = {};
      var res = [];
      var start = 0, end = 0;

      var lastView = function (hotKey) {
        var o = {};
        Object.keys(last_pos).forEach(function (k) { o[k] = last_pos[k]; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      };
      var sItems = function () { return s.split(""); };

      steps.push({
        line: 2, msg: "开始：字符串 s = \"" + s + "\"，目标是划分出尽可能多的片段，使每个字母只出现在一个片段中。",
        views: {
          vars: { s: s, start: 0, end: 0, i: null, ch: null },
          s: { items: sItems(), showIndex: true },
          last: {},
          res: { items: [] }
        }
      });

      // 第一遍：记录每个字符最后出现的位置
      steps.push({
        line: 3, msg: "第一遍扫描：建立每个字符最后出现位置的映射。",
        views: {
          vars: { s: s, start: 0, end: 0, i: null, ch: null },
          s: { items: sItems(), showIndex: true },
          last: {},
          res: { items: [] }
        }
      });

      for (var i = 0; i < s.length; i++) {
        var ch = s[i];
        last_pos[ch] = i;
        steps.push({
          line: 4, msg: "字符 '" + ch + "' 最后出现位置更新为 " + i + "。",
          views: {
            vars: { s: s, start: 0, end: 0, i: i, ch: ch },
            s: { items: sItems(), highlights: [i], pointers: { i: i }, showIndex: true },
            last: lastView(ch),
            res: { items: [] }
          }
        });
      }

      // 第二遍：划分片段
      steps.push({
        line: 5, msg: "第二遍扫描：根据每个字符的最后位置划分片段。",
        views: {
          vars: { s: s, start: 0, end: 0, i: null, ch: null, res: [] },
          s: { items: sItems(), showIndex: true },
          last: lastView(),
          res: { items: [] }
        }
      });

      for (var i2 = 0; i2 < s.length; i2++) {
        var ch2 = s[i2];
        steps.push({
          line: 8, msg: "遍历到 i=" + i2 + "，字符 '" + ch2 + "'，当前片段起点 start=" + start + "，终点 end=" + end + "。",
          views: {
            vars: { s: s, start: start, end: end, i: i2, ch: ch2, res: res.slice() },
            s: { items: sItems(), highlights: [i2], pointers: { i: i2 }, showIndex: true },
            last: lastView(ch2),
            res: { items: res.slice() }
          }
        });

        var newEnd = Math.max(end, last_pos[ch2]);
        if (newEnd !== end) {
          end = newEnd;
          steps.push({
            line: 9, msg: "字符 '" + ch2 + "' 最后出现在 " + last_pos[ch2] + "，扩展片段终点 end=" + end + "。",
            views: {
              vars: { s: s, start: start, end: end, i: i2, ch: ch2, res: res.slice() },
              s: { items: sItems(), highlights: [i2], pointers: { i: i2 }, showIndex: true },
              last: lastView(ch2),
              res: { items: res.slice() }
            }
          });
        } else {
          steps.push({
            line: 9, msg: "字符 '" + ch2 + "' 最后出现在 " + last_pos[ch2] + "，end 不变（" + end + "）。",
            views: {
              vars: { s: s, start: start, end: end, i: i2, ch: ch2, res: res.slice() },
              s: { items: sItems(), highlights: [i2], pointers: { i: i2 }, showIndex: true },
              last: lastView(ch2),
              res: { items: res.slice() }
            }
          });
        }

        if (i2 === end) {
          var len = end - start + 1;
          res.push(len);
          steps.push({
            line: 10, msg: "i=" + i2 + " 到达片段终点，片段长度 " + len + " 加入结果。",
            views: {
              vars: { s: s, start: start, end: end, i: i2, ch: ch2, res: res.slice() },
              s: { items: sItems(), highlights: [start, end], ok: [start, end], pointers: { i: i2 }, showIndex: true },
              last: lastView(),
              res: { items: res.slice(), highlights: [res.length - 1] }
            }
          });
          start = i2 + 1;
          steps.push({
            line: 11, msg: "更新下一个片段起点 start=" + start + "。",
            views: {
              vars: { s: s, start: start, end: end, i: i2, ch: ch2, res: res.slice() },
              s: { items: sItems(), highlights: [i2], pointers: { start: start }, showIndex: true },
              last: lastView(),
              res: { items: res.slice() }
            }
          });
        }
      }

      steps.push({
        line: 12, msg: "扫描结束，返回结果 [" + res.join(", ") + "]。",
        views: {
          vars: { s: s, start: start, end: end, i: s.length - 1, ch: s[s.length - 1], res: res.slice() },
          s: { items: sItems(), showIndex: true },
          last: lastView(),
          res: { items: res.slice(), ok: res.map(function (_, idx) { return idx; }) }
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);