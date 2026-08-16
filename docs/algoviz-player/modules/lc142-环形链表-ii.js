(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc142-环形链表-ii"] = {
    title: "142 环形链表 II · 哈希集合",
    language: "python",
    code: [
      "# Definition for singly-linked list.",
      "# class ListNode:",
      "#     def __init__(self, x):",
      "#         self.val = x",
      "#         self.next = None",
      "",
      "class Solution:",
      "    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:",
      "        visited = set()",
      "        while head:",
      "            if head in visited:",
      "                return head",
      "            visited.add(head)",
      "            head = head.next",
      "        return None"
    ].join("\n"),

    defaultInput: "head = [3, 2, 0, -4]\npos = 1",
    inputHint: "每行一个变量：head = [3, 2, 0, -4]（链表值，按顺序），pos = 1（环入口下标，-1 表示无环）",
    testInputs: ["head = [1, 2]\npos = 0", "head = [1]\npos = -1"],
    expectedOutputs: ["2", "1", "null"],

    views: {
      vars: { type: "vars", title: "变量" },
      list: { type: "array", title: "链表（值）" },
      visited: { type: "vars", title: "已访问节点" }
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
      if (typeof env.pos !== "number") throw new Error("缺少 pos = 数字（-1 表示无环）");
      return env;
    },

    run: function (input) {
      var vals = input.head, pos = input.pos;
      var steps = [];
      var visited = {};
      var visitedView = function (hotKey) {
        var o = {};
        Object.keys(visited).forEach(function (k) { o[k] = visited[k]; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      };

      // 构建链表
      var nodes = [];
      for (var i = 0; i < vals.length; i++) {
        nodes.push({ val: vals[i], next: null, id: i });
      }
      for (var j = 0; j < nodes.length - 1; j++) {
        nodes[j].next = nodes[j + 1];
      }
      if (pos >= 0 && pos < nodes.length) {
        nodes[nodes.length - 1].next = nodes[pos];
      }
      var head = nodes.length > 0 ? nodes[0] : null;

      var listItems = vals.slice();
      var listView = function (highlightIdx, okIdx) {
        var v = { items: listItems.slice() };
        if (highlightIdx != null) v.highlights = [highlightIdx];
        if (okIdx != null) v.ok = [okIdx];
        return v;
      };

      var cur = head;
      var curIdx = 0;

      steps.push({
        line: 8, msg: "初始化：visited 集合为空，从链表头开始。",
        views: {
          vars: { head: head ? head.val : null, cur: null, visitedCount: 0 },
          list: listView(),
          visited: {}
        }
      });

      while (cur) {
        steps.push({
          line: 9, msg: "当前节点值为 " + cur.val + "（下标 " + curIdx + "），检查是否已访问过。",
          views: {
            vars: { head: head ? head.val : null, cur: cur.val, visitedCount: Object.keys(visited).length },
            list: listView(curIdx),
            visited: visitedView()
          }
        });

        if (visited[cur.id] !== undefined) {
          steps.push({
            line: 10, msg: "节点 " + cur.val + " 已在 visited 中，说明它是环的入口，返回它。",
            views: {
              vars: { head: head ? head.val : null, cur: cur.val, visitedCount: Object.keys(visited).length },
              list: listView(curIdx, curIdx),
              visited: visitedView(String(cur.id))
            }
          });
          steps.push({
            line: 11, msg: "返回环入口节点，值为 " + cur.val + "。",
            views: {
              vars: { "返回值": cur.val },
              list: listView(curIdx, curIdx),
              visited: visitedView()
            }
          });
          return { steps: steps, output: JSON.stringify(cur.val) };
        }

        visited[cur.id] = cur.val;
        steps.push({
          line: 12, msg: "把节点 " + cur.val + " 加入 visited 集合。",
          views: {
            vars: { head: head ? head.val : null, cur: cur.val, visitedCount: Object.keys(visited).length },
            list: listView(curIdx),
            visited: visitedView(String(cur.id))
          }
        });

        cur = cur.next;
        curIdx++;
        steps.push({
          line: 13, msg: "移动到下一个节点" + (cur ? "（值为 " + cur.val + "）" : "（链表结束）") + "。",
          views: {
            vars: { head: head ? head.val : null, cur: cur ? cur.val : null, visitedCount: Object.keys(visited).length },
            list: listView(cur ? curIdx : null),
            visited: visitedView()
          }
        });
      }

      steps.push({
        line: 14, msg: "链表遍历结束，没有环，返回 None。",
        views: {
          vars: { head: head ? head.val : null, cur: null, visitedCount: Object.keys(visited).length },
          list: listView(),
          visited: visitedView()
        }
      });
      return { steps: steps, output: "null" };
    }
  };
})(typeof window !== "undefined" ? window : this);