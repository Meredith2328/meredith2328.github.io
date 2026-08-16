(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc141-环形链表"] = {
    title: "141 环形链表 · 哈希集合",
    language: "python",
    code: [
      "# Definition for singly-linked list.",
      "# class ListNode:",
      "#     def __init__(self, x):",
      "#         self.val = x",
      "#         self.next = None",
      "",
      "class Solution:",
      "    def hasCycle(self, head: Optional[ListNode]) -> bool:",
      "        visited = set()",
      "        while head:",
      "            if head in visited:",
      "                return True",
      "            visited.add(head)",
      "            head = head.next"
    ].join("\n"),

    defaultInput: "head = [3,2,0,-4]\npos = 1",
    inputHint: "每行一个变量：head = [3,2,0,-4]（链表值列表），pos = 1（环的入口下标，-1 表示无环）",
    testInputs: [
      "head = [1,2]\npos = 0",
      "head = [1]\npos = -1"
    ],
    expectedOutputs: [
      "true",
      "false"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      list: { type: "array", title: "链表节点" },
      visited: { type: "vars", title: "visited 集合" }
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
      if (env.pos < -1 || env.pos >= env.head.length) throw new Error("pos 必须在 -1 到 " + (env.head.length - 1) + " 之间");
      return env;
    },

    run: function (input) {
      var vals = input.head;
      var pos = input.pos;
      var steps = [];

      // 构建链表节点
      var nodes = [];
      for (var i = 0; i < vals.length; i++) {
        nodes.push({ val: vals[i], next: null, id: i });
      }
      for (var j = 0; j < nodes.length - 1; j++) {
        nodes[j].next = nodes[j + 1];
      }
      if (pos >= 0 && nodes.length > 0) {
        nodes[nodes.length - 1].next = nodes[pos];
      }

      var head = nodes.length > 0 ? nodes[0] : null;
      var visited = {};
      var visitedCount = 0;

      var visitedView = function (hotId) {
        var o = {};
        Object.keys(visited).forEach(function (k) {
          var node = visited[k];
          o["节点" + node.id + "(" + node.val + ")"] = node.id;
        });
        if (hotId != null && visited[hotId] !== undefined) {
          o["节点" + visited[hotId].id + "(" + visited[hotId].val + ")"] = { value: visited[hotId].id, __hot: true };
        }
        return o;
      };

      var listView = function (currentId, highlightId, okId) {
        var items = [];
        for (var i = 0; i < nodes.length; i++) {
          items.push(nodes[i].val);
        }
        var view = { items: items, showIndex: true };
        if (highlightId != null) view.highlights = [highlightId];
        if (okId != null) view.ok = [okId];
        if (currentId != null) view.pointers = { head: currentId };
        return view;
      };

      // 初始状态
      steps.push({
        line: 8,
        msg: "初始化 visited 为空集合，head 指向链表头节点。",
        views: {
          vars: { head: head ? "节点" + head.id + "(" + head.val + ")" : "null", visited: "空集合" },
          list: listView(head ? head.id : null),
          visited: {}
        }
      });

      var current = head;
      var stepCount = 0;

      while (current) {
        // 检查当前节点是否在 visited 中
        var key = "node" + current.id;
        if (visited[key] !== undefined) {
          steps.push({
            line: 10,
            msg: "当前节点 " + current.val + "（节点" + current.id + "）已在 visited 中，说明有环！",
            views: {
              vars: { head: "节点" + current.id + "(" + current.val + ")", visited: "包含节点" + current.id },
              list: listView(current.id, current.id, current.id),
              visited: visitedView(key)
            }
          });
          steps.push({
            line: 11,
            msg: "返回 true：链表存在环。",
            views: {
              vars: { "返回值": true },
              list: listView(current.id, current.id, current.id),
              visited: visitedView(key)
            }
          });
          return { steps: steps, output: "true" };
        }

        // 将当前节点加入 visited
        visited[key] = current;
        visitedCount++;
        steps.push({
          line: 12,
          msg: "将节点 " + current.val + "（节点" + current.id + "）加入 visited 集合。",
          views: {
            vars: { head: "节点" + current.id + "(" + current.val + ")", visited: "已访问 " + visitedCount + " 个节点" },
            list: listView(current.id, current.id),
            visited: visitedView(key)
          }
        });

        // 移动到下一个节点
        var nextNode = current.next;
        steps.push({
          line: 13,
          msg: "head 移动到下一个节点" + (nextNode ? "（节点" + nextNode.id + "，值 " + nextNode.val + "）" : "（null，链表结束）") + "。",
          views: {
            vars: { head: nextNode ? "节点" + nextNode.id + "(" + nextNode.val + ")" : "null", visited: "已访问 " + visitedCount + " 个节点" },
            list: listView(nextNode ? nextNode.id : null),
            visited: visitedView()
          }
        });

        current = nextNode;
        stepCount++;
        if (stepCount > 1000) break; // 安全保护
      }

      // 循环结束，无环
      steps.push({
        line: 9,
        msg: "head 为 null，循环结束，未发现环。",
        views: {
          vars: { head: "null", visited: "已访问 " + visitedCount + " 个节点" },
          list: listView(null),
          visited: visitedView()
        }
      });
      steps.push({
        line: 9,
        msg: "返回 false：链表无环。",
        views: {
          vars: { "返回值": false },
          list: listView(null),
          visited: visitedView()
        }
      });
      return { steps: steps, output: "false" };
    }
  };
})(typeof window !== "undefined" ? window : this);