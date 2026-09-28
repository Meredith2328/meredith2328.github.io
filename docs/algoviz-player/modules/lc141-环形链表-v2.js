(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc141-环形链表-v2"] = {
    title: "141 环形链表 · 快慢指针",
    link: "https://leetcode.cn/problems/linked-list-cycle/",
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
      "        fast, slow = head, head",
      "        while fast != None and fast.next != None:",
      "            fast = fast.next.next",
      "            slow = slow.next",
      "            if fast == slow:",
      "                return True",
      "        return False"
    ].join("\n"),

    defaultInput: "head = [3, 2, 0, -4]\npos = -1",
    inputHint: "每行一个变量：head = [3, 2, 0, -4]（链表值），pos = -1（-1 表示无环，>=0 表示环入口下标）",

    views: {
      vars: { type: "vars", title: "变量" },
      list: { type: "array", title: "链表" },
      pointers: { type: "array", title: "快慢指针" }
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
      if (!Array.isArray(env.head)) throw new Error("缺少 head = [...]（链表值数组）");
      if (typeof env.pos !== "number" || env.pos < -1 || env.pos >= env.head.length) 
        throw new Error("pos 必须是 -1 或 0 到 head.length-1 的整数");
      return env;
    },

    run: function (input) {
      var head = input.head, pos = input.pos;
      var steps = [];
      var n = head.length;

      // 构建链表节点（用对象模拟）
      var nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({ val: head[i], next: null, idx: i });
      }
      for (var i = 0; i < n - 1; i++) {
        nodes[i].next = nodes[i + 1];
      }
      if (pos >= 0 && n > 0) {
        nodes[n - 1].next = nodes[pos]; // 形成环
      }

      var listView = function (hi, okIdx) {
        var items = head.slice();
        var highlights = hi || [];
        var ok = okIdx || [];
        return { items: items, highlights: highlights, ok: ok, showIndex: true };
      };

      var ptrView = function (fastIdx, slowIdx) {
        var items = [];
        for (var i = 0; i < n; i++) items.push("·");
        var highlights = [];
        if (fastIdx >= 0) { items[fastIdx] = "F"; highlights.push(fastIdx); }
        if (slowIdx >= 0) { items[slowIdx] = "S"; highlights.push(slowIdx); }
        return { items: items, highlights: highlights, pointers: { fast: fastIdx, slow: slowIdx }, showIndex: true };
      };

      // 初始状态
      steps.push({
        line: 8,
        msg: "初始化：快指针 fast 和慢指针 slow 都指向头节点。",
        views: {
          vars: { fast: 0, slow: 0, "环入口": pos >= 0 ? pos : "无" },
          list: listView([0], []),
          pointers: ptrView(0, 0)
        }
      });

      var fastIdx = 0, slowIdx = 0;
      var fastNode = nodes[0] || null, slowNode = nodes[0] || null;
      var stepsCount = 0;

      while (fastNode != null && fastNode.next != null) {
        // 快指针走两步
        fastNode = fastNode.next.next;
        fastIdx = fastNode ? fastNode.idx : -1;
        steps.push({
          line: 10,
          msg: "快指针前进两步，到达下标 " + (fastIdx >= 0 ? fastIdx : "末尾") + "。",
          views: {
            vars: { fast: fastIdx, slow: slowIdx, "环入口": pos >= 0 ? pos : "无" },
            list: listView([fastIdx], []),
            pointers: ptrView(fastIdx, slowIdx)
          }
        });
        stepsCount++;
        if (stepsCount > 100) break; // 安全保护

        // 慢指针走一步
        slowNode = slowNode.next;
        slowIdx = slowNode ? slowNode.idx : -1;
        steps.push({
          line: 11,
          msg: "慢指针前进一步，到达下标 " + slowIdx + "。",
          views: {
            vars: { fast: fastIdx, slow: slowIdx, "环入口": pos >= 0 ? pos : "无" },
            list: listView([slowIdx], []),
            pointers: ptrView(fastIdx, slowIdx)
          }
        });
        stepsCount++;
        if (stepsCount > 100) break;

        // 检查相遇
        if (fastIdx === slowIdx) {
          steps.push({
            line: 12,
            msg: "快慢指针相遇在下标 " + fastIdx + "，说明链表有环！",
            views: {
              vars: { fast: fastIdx, slow: slowIdx, "相遇": true, "环入口": pos >= 0 ? pos : "无" },
              list: listView([fastIdx], [fastIdx]),
              pointers: ptrView(fastIdx, slowIdx)
            }
          });
          steps.push({
            line: 13,
            msg: "返回 True：链表存在环。",
            views: {
              vars: { "返回值": true },
              list: listView([], [fastIdx]),
              pointers: ptrView(fastIdx, slowIdx)
            }
          });
          return { steps: steps, output: "true" };
        }
      }

      // 循环结束，无环
      steps.push({
        line: 14,
        msg: "快指针到达末尾，链表无环。",
        views: {
          vars: { fast: fastIdx, slow: slowIdx, "环入口": "无" },
          list: listView([], []),
          pointers: ptrView(fastIdx, slowIdx)
        }
      });
      steps.push({
        line: 14,
        msg: "返回 False：链表没有环。",
        views: {
          vars: { "返回值": false },
          list: listView([], []),
          pointers: ptrView(fastIdx, slowIdx)
        }
      });
      return { steps: steps, output: "false" };
    },

    testInputs: [
      "head = [1, 2]\npos = -1",
      "head = [1]\npos = -1"
    ],
    expectedOutputs: [
      "false",
      "false"
    ]
  };
})(typeof window !== "undefined" ? window : this);