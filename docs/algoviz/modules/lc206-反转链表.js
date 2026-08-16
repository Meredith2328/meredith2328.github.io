(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc206-反转链表"] = {
    title: "206 反转链表 · 迭代",
    language: "python",
    code: [
      "# Definition for singly-linked list.",
      "# class ListNode:",
      "#     def __init__(self, val=0, next=None):",
      "#         self.val = val",
      "#         self.next = next",
      "class Solution:",
      "    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:",
      "        prev, cur = None, head",
      "        while cur:",
      "            next_temp = cur.next",
      "            cur.next = prev",
      "            prev = cur",
      "            cur = next_temp",
      "        return prev"
    ].join("\n"),

    defaultInput: "head = [1, 2, 3, 4, 5]",
    inputHint: "每行一个变量，格式如 head = [1, 2, 3, 4, 5]（空链表用 head = []）",
    testInputs: ["head = []", "head = [1]"],
    expectedOutputs: ["[5,4,3,2,1]", "[]", "[1]"],

    views: {
      vars: { type: "vars", title: "变量" },
      list: { type: "array", title: "链表" },
      result: { type: "array", title: "已反转部分" }
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
      if (!Array.isArray(env.head)) throw new Error("缺少 head = [...]");
      return env;
    },

    run: function (input) {
      var head = input.head;
      var steps = [];
      var n = head.length;

      // 辅助函数：生成链表视图（当前链表 + 已反转部分）
      function listView(curIdx, revArr) {
        var items = head.slice();
        var highlights = [];
        if (curIdx >= 0 && curIdx < n) highlights.push(curIdx);
        return { items: items, highlights: highlights, pointers: { cur: curIdx } };
      }

      function revView(revArr) {
        return { items: revArr.slice() };
      }

      // 初始状态
      steps.push({
        line: 7,
        msg: "初始化：prev = None，cur 指向链表头。",
        views: {
          vars: { prev: null, cur: 0, next_temp: null },
          list: listView(0, []),
          result: revView([])
        }
      });

      var prev = null;
      var cur = 0;
      var rev = []; // 已反转部分（从尾到头）

      while (cur < n) {
        var next_temp = cur + 1;
        steps.push({
          line: 9,
          msg: "保存 cur 的下一个节点 next_temp = " + (next_temp < n ? head[next_temp] : "None") + "。",
          views: {
            vars: { prev: prev, cur: cur, next_temp: next_temp < n ? next_temp : null },
            list: listView(cur, rev),
            result: revView(rev)
          }
        });

        // cur.next = prev（在数组视图中，将当前节点加入已反转部分）
        rev.unshift(head[cur]);
        steps.push({
          line: 10,
          msg: "将当前节点 " + head[cur] + " 的 next 指向 prev（即 " + (prev === null ? "None" : head[prev]) + "）。",
          views: {
            vars: { prev: prev, cur: cur, next_temp: next_temp < n ? next_temp : null },
            list: listView(cur, rev),
            result: revView(rev)
          }
        });

        // prev = cur
        prev = cur;
        steps.push({
          line: 11,
          msg: "prev 移动到当前节点（" + head[prev] + "）。",
          views: {
            vars: { prev: prev, cur: cur, next_temp: next_temp < n ? next_temp : null },
            list: listView(cur, rev),
            result: revView(rev)
          }
        });

        // cur = next_temp
        cur = next_temp;
        if (cur < n) {
          steps.push({
            line: 12,
            msg: "cur 移动到下一个节点（" + head[cur] + "）。",
            views: {
              vars: { prev: prev, cur: cur, next_temp: null },
              list: listView(cur, rev),
              result: revView(rev)
            }
          });
        } else {
          steps.push({
            line: 12,
            msg: "cur 移动到 None，循环结束。",
            views: {
              vars: { prev: prev, cur: null, next_temp: null },
              list: listView(-1, rev),
              result: revView(rev)
            }
          });
        }
      }

      steps.push({
        line: 13,
        msg: "返回 prev（新的头节点），即反转后的链表。",
        views: {
          vars: { prev: prev, cur: null, next_temp: null },
          list: listView(-1, rev),
          result: revView(rev)
        }
      });

      return { steps: steps, output: JSON.stringify(rev) };
    }
  };
})(typeof window !== "undefined" ? window : this);