(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};
  global.AlgoVizModules["lc394-字符串解码"] = {
    title: "394 字符串解码 · 双栈",
    language: "python",
    code: [
      "class Solution:",
      "    def decodeString(self, s: str) -> str:",
      "        numStk = []",
      "        strStk = []",
      "        curNum = 0",
      "        curStr = ''",
      "",
      "        for c in s:",
      "            if c.isdigit():",
      "                curNum = 10 * curNum + int(c)",
      "            elif c == '[':",
      "                # 构造完毕, 当前数字和字符串入栈",
      "                numStk.append(curNum)",
      "                strStk.append(curStr) # 临时存放, 便于一会取出作为prevStr",
      "                curNum = 0",
      "                curStr = ''",
      "            elif c == ']':",
      "                repeat_times = numStk.pop()",
      "                prevStr = strStk.pop()",
      "                curStr = prevStr + curStr * repeat_times",
      "            else:",
      "                curStr += c",
      "",
      "        return curStr"
    ].join("\n"),

    defaultInput: "s = \"3[a2[c]]\"",
    inputHint: "每行一个变量，格式如 s = \"3[a2[c]]\"",
    testInputs: ["s = \"2[abc]3[cd]ef\"", "s = \"3[a]2[bc]\""],
    expectedOutputs: ["\"accaccacc\"", "\"abcabccdcdcdef\"", "\"aaabcbc\""],

    views: {
      vars: { type: "vars", title: "变量" },
      numStk: { type: "stack", title: "numStk" },
      strStk: { type: "stack", title: "strStk" },
      curStr: { type: "text", title: "curStr" }
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
      if (typeof env.s !== "string") throw new Error("缺少 s = \"...\"");
      return env;
    },

    run: function (input) {
      var s = input.s;
      var steps = [];
      var numStk = [], strStk = [];
      var curNum = 0, curStr = "";

      var numStkView = function (hotIdx) {
        var items = numStk.slice();
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) highlights.push(hotIdx);
        return { items: items, highlights: highlights };
      };
      var strStkView = function (hotIdx) {
        var items = strStk.slice();
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) highlights.push(hotIdx);
        return { items: items, highlights: highlights };
      };
      var varsView = function (hotKey) {
        var o = { curNum: curNum, curStr: curStr };
        if (hotKey === "curNum") o.curNum = { value: curNum, __hot: true };
        if (hotKey === "curStr") o.curStr = { value: curStr, __hot: true };
        return o;
      };

      steps.push({
        line: 3, msg: "初始化：两个空栈 numStk 和 strStk，当前数字 curNum=0，当前字符串 curStr=''。",
        views: {
          vars: varsView(),
          numStk: numStkView(),
          strStk: strStkView(),
          curStr: "''"
        }
      });

      for (var i = 0; i < s.length; i++) {
        var c = s[i];
        if (c >= '0' && c <= '9') {
          curNum = 10 * curNum + parseInt(c, 10);
          steps.push({
            line: 8, msg: "字符 '" + c + "' 是数字，更新 curNum = " + curNum + "。",
            views: {
              vars: varsView("curNum"),
              numStk: numStkView(),
              strStk: strStkView(),
              curStr: curStr === "" ? "''" : curStr
            }
          });
        } else if (c === '[') {
          steps.push({
            line: 10, msg: "遇到 '['，将 curNum=" + curNum + " 压入 numStk，curStr='" + curStr + "' 压入 strStk，然后重置 curNum=0、curStr=''。",
            views: {
              vars: varsView(),
              numStk: numStkView(),
              strStk: strStkView(),
              curStr: "''"
            }
          });
          numStk.push(curNum);
          strStk.push(curStr);
          curNum = 0;
          curStr = "";
          steps.push({
            line: 11, msg: "入栈完成：numStk=" + JSON.stringify(numStk) + "，strStk=" + JSON.stringify(strStk) + "。",
            views: {
              vars: varsView(),
              numStk: numStkView(numStk.length - 1),
              strStk: strStkView(strStk.length - 1),
              curStr: "''"
            }
          });
        } else if (c === ']') {
          var repeat_times = numStk.pop();
          var prevStr = strStk.pop();
          curStr = prevStr + curStr.repeat(repeat_times);
          steps.push({
            line: 15, msg: "遇到 ']'，弹出 repeat_times=" + repeat_times + " 和 prevStr='" + prevStr + "'，更新 curStr = '" + curStr + "'。",
            views: {
              vars: varsView("curStr"),
              numStk: numStkView(),
              strStk: strStkView(),
              curStr: curStr
            }
          });
        } else {
          curStr += c;
          steps.push({
            line: 18, msg: "字符 '" + c + "' 是普通字符，追加到 curStr，现在 curStr='" + curStr + "'。",
            views: {
              vars: varsView("curStr"),
              numStk: numStkView(),
              strStk: strStkView(),
              curStr: curStr
            }
          });
        }
      }

      steps.push({
        line: 20, msg: "遍历结束，返回最终结果 curStr='" + curStr + "'。",
        views: {
          vars: varsView(),
          numStk: numStkView(),
          strStk: strStkView(),
          curStr: curStr
        }
      });
      return { steps: steps, output: JSON.stringify(curStr) };
    }
  };
})(typeof window !== "undefined" ? window : this);