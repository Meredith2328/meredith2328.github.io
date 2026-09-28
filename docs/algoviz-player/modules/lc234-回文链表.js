(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc234-回文链表"] = {
    title: "234 回文链表 · 转数组比较",
    link: "https://leetcode.cn/problems/palindrome-linked-list/",
    language: "python",
    code: [
      "# Definition for singly-linked list.",
      "# class ListNode:",
      "#     def __init__(self, val=0, next=None):",
      "#         self.val = val",
      "#         self.next = next",
      "class Solution:",
      "    def isPalindrome(self, head: Optional[ListNode]) -> bool:",
      "        alist = []",
      "        while head:",
      "            alist.append(head.val)",
      "            head = head.next",
      "        return list(reversed(alist)) == alist"
    ].join("\n"),

    defaultInput: "head = [1, 2, 2, 1]",
    inputHint: "每行一个变量，格式如 head = [1, 2, 2, 1]（链表用数组表示）",
    testInputs: ["head = [1, 2, 3, 2, 1]", "head = [1, 2]"],
    expectedOutputs: ["true", "true", "false"],

    views: {
      vars: { type: "vars", title: "变量" },
      list: { type: "array", title: "链表节点" },
      alist: { type: "array", title: "alist" },
      reversed: { type: "array", title: "反转后" }
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
      if (!Array.isArray(env.head)) throw new Error("缺少 head = [...]（链表用数组表示）");
      return env;
    },

    run: function (input) {
      var headArr = input.head;
      var steps = [];
      var alist = [];
      var reversed = [];

      steps.push({
        line: 6,
        msg: "开始判断链表是否为回文链表。",
        views: {
          vars: { head: headArr.slice(), alist: [], reversed: [] },
          list: { items: headArr.slice(), showIndex: true },
          alist: { items: [], showIndex: true },
          reversed: { items: [], showIndex: true }
        }
      });

      steps.push({
        line: 7,
        msg: "初始化空列表 alist，用于存储链表的所有节点值。",
        views: {
          vars: { head: headArr.slice(), alist: [], reversed: [] },
          list: { items: headArr.slice(), showIndex: true },
          alist: { items: [], showIndex: true },
          reversed: { items: [], showIndex: true }
        }
      });

      var i = 0;
      while (i < headArr.length) {
        var val = headArr[i];
        steps.push({
          line: 8,
          msg: "当前节点 head 不为空，进入循环。",
          views: {
            vars: { head: headArr.slice(i), alist: alist.slice(), reversed: [] },
            list: { items: headArr.slice(), highlights: [i], pointers: { head: i }, showIndex: true },
            alist: { items: alist.slice(), showIndex: true },
            reversed: { items: [], showIndex: true }
          }
        });

        alist.push(val);
        steps.push({
          line: 9,
          msg: "将当前节点值 " + val + " 追加到 alist。",
          views: {
            vars: { head: headArr.slice(i + 1), alist: alist.slice(), reversed: [] },
            list: { items: headArr.slice(), highlights: [i], pointers: { head: i }, showIndex: true },
            alist: { items: alist.slice(), highlights: [alist.length - 1], showIndex: true },
            reversed: { items: [], showIndex: true }
          }
        });

        i++;
        steps.push({
          line: 10,
          msg: "head 移动到下一个节点。",
          views: {
            vars: { head: headArr.slice(i), alist: alist.slice(), reversed: [] },
            list: { items: headArr.slice(), highlights: [i], pointers: { head: i }, showIndex: true },
            alist: { items: alist.slice(), showIndex: true },
            reversed: { items: [], showIndex: true }
          }
        });
      }

      steps.push({
        line: 8,
        msg: "链表遍历完毕，head 为空，退出循环。",
        views: {
          vars: { head: [], alist: alist.slice(), reversed: [] },
          list: { items: headArr.slice(), showIndex: true },
          alist: { items: alist.slice(), showIndex: true },
          reversed: { items: [], showIndex: true }
        }
      });

      reversed = alist.slice().reverse();
      steps.push({
        line: 11,
        msg: "将 alist 反转得到 reversed，准备比较。",
        views: {
          vars: { head: [], alist: alist.slice(), reversed: reversed.slice() },
          list: { items: headArr.slice(), showIndex: true },
          alist: { items: alist.slice(), showIndex: true },
          reversed: { items: reversed.slice(), showIndex: true }
        }
      });

      var isPal = true;
      for (var j = 0; j < alist.length; j++) {
        if (alist[j] !== reversed[j]) {
          isPal = false;
          steps.push({
            line: 11,
            msg: "比较发现 alist[" + j + "]=" + alist[j] + " 与 reversed[" + j + "]=" + reversed[j] + " 不同，不是回文。",
            views: {
              vars: { head: [], alist: alist.slice(), reversed: reversed.slice(), "比较结果": "false" },
              list: { items: headArr.slice(), showIndex: true },
              alist: { items: alist.slice(), highlights: [j], bad: [j], showIndex: true },
              reversed: { items: reversed.slice(), highlights: [j], bad: [j], showIndex: true }
            }
          });
          break;
        } else {
          steps.push({
            line: 11,
            msg: "alist[" + j + "]=" + alist[j] + " 与 reversed[" + j + "]=" + reversed[j] + " 相同，继续比较。",
            views: {
              vars: { head: [], alist: alist.slice(), reversed: reversed.slice(), "比较结果": "true" },
              list: { items: headArr.slice(), showIndex: true },
              alist: { items: alist.slice(), highlights: [j], ok: [j], showIndex: true },
              reversed: { items: reversed.slice(), highlights: [j], ok: [j], showIndex: true }
            }
          });
        }
      }

      steps.push({
        line: 11,
        msg: "比较完成，最终结果为 " + (isPal ? "true（是回文）" : "false（不是回文）") + "。",
        views: {
          vars: { head: [], alist: alist.slice(), reversed: reversed.slice(), "比较结果": isPal ? "true" : "false" },
          list: { items: headArr.slice(), showIndex: true },
          alist: { items: alist.slice(), showIndex: true },
          reversed: { items: reversed.slice(), showIndex: true }
        }
      });

      return { steps: steps, output: isPal ? "true" : "false" };
    }
  };
})(typeof window !== "undefined" ? window : this);