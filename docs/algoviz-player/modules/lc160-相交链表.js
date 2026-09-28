(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc160-相交链表"] = {
    title: "160 相交链表 · 双指针",
    link: "https://leetcode.cn/problems/intersection-of-two-linked-lists/",
    language: "python",
    code: [
      "# Definition for singly-linked list.",
      "# class ListNode:",
      "#     def __init__(self, x):",
      "#         self.val = x",
      "#         self.next = None",
      "",
      "class Solution:",
      "    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:",
      "        A, B = headA, headB",
      "        while A != B:",
      "            A = A.next if A else headB",
      "            B = B.next if B else headA",
      "        return A"
    ].join("\n"),

    defaultInput: "listA = [4,1,8,4,5]\nlistB = [5,6,1,8,4,5]\nskipA = 2\nskipB = 3",
    inputHint: "每行一个变量：listA = [4,1,8,4,5] / listB = [5,6,1,8,4,5] / skipA = 2 / skipB = 3（skip 表示相交节点在各自链表中的下标，从 0 开始）",
    testInputs: [
      "listA = [1,9,1,2,4]\nlistB = [3,2,4]\nskipA = 3\nskipB = 1",
      "listA = [2,6,4]\nlistB = [1,5]\nskipA = 3\nskipB = 2"
    ],
    expectedOutputs: [
      "8",
      "null"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      listA: { type: "array", title: "链表 A" },
      listB: { type: "array", title: "链表 B" },
      pointers: { type: "array", title: "指针移动" }
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
      if (!Array.isArray(env.listA) || !Array.isArray(env.listB)) throw new Error("缺少 listA = [...] 或 listB = [...]");
      if (typeof env.skipA !== "number" || typeof env.skipB !== "number") throw new Error("缺少 skipA = 数字 或 skipB = 数字");
      return env;
    },

    run: function (input) {
      var listA = input.listA, listB = input.listB, skipA = input.skipA, skipB = input.skipB;
      var steps = [];
      var lenA = listA.length, lenB = listB.length;
      var interVal = null;
      if (skipA < lenA && skipB < lenB && listA[skipA] === listB[skipB]) interVal = listA[skipA];

      // 构造链表节点（用对象模拟）
      function makeList(arr) {
        var head = null, tail = null;
        for (var i = 0; i < arr.length; i++) {
          var node = { val: arr[i], next: null };
          if (!head) head = node; else tail.next = node;
          tail = node;
        }
        return head;
      }
      var headA = makeList(listA), headB = makeList(listB);

      // 视图辅助：把链表转成数组（带指针标记）
      function listView(head, ptrName, ptrNode) {
        var items = [], ptrs = {};
        var cur = head, idx = 0;
        while (cur) {
          items.push(cur.val);
          if (cur === ptrNode) ptrs[ptrName] = idx;
          cur = cur.next; idx++;
        }
        return { items: items, pointers: ptrs, showIndex: true };
      }

      var A = headA, B = headB;
      var stepCount = 0;

      steps.push({
        line: 8, msg: "初始化：A 指向链表 A 的头节点，B 指向链表 B 的头节点。",
        views: {
          vars: { A: A ? A.val : null, B: B ? B.val : null },
          listA: listView(headA, "A", A),
          listB: listView(headB, "B", B),
          pointers: { items: ["A→" + (A ? A.val : "null"), "B→" + (B ? B.val : "null")] }
        }
      });

      while (A !== B) {
        stepCount++;
        if (stepCount > 100) break; // 安全保护

        steps.push({
          line: 9, msg: "判断 A 和 B 是否相等：当前 A=" + (A ? A.val : "null") + "，B=" + (B ? B.val : "null") + "，不相等，继续循环。",
          views: {
            vars: { A: A ? A.val : null, B: B ? B.val : null },
            listA: listView(headA, "A", A),
            listB: listView(headB, "B", B),
            pointers: { items: ["A→" + (A ? A.val : "null"), "B→" + (B ? B.val : "null")] }
          }
        });

        // A = A.next if A else headB
        var oldA = A;
        A = A ? A.next : headB;
        steps.push({
          line: 10, msg: "A 向后移动：" + (oldA ? oldA.val : "null") + " → " + (A ? A.val : "null") + (oldA ? "" : "（A 已到末尾，跳到 B 的头）"),
          views: {
            vars: { A: A ? A.val : null, B: B ? B.val : null },
            listA: listView(headA, "A", A),
            listB: listView(headB, "B", B),
            pointers: { items: ["A→" + (A ? A.val : "null"), "B→" + (B ? B.val : "null")] }
          }
        });

        // B = B.next if B else headA
        var oldB = B;
        B = B ? B.next : headA;
        steps.push({
          line: 11, msg: "B 向后移动：" + (oldB ? oldB.val : "null") + " → " + (B ? B.val : "null") + (oldB ? "" : "（B 已到末尾，跳到 A 的头）"),
          views: {
            vars: { A: A ? A.val : null, B: B ? B.val : null },
            listA: listView(headA, "A", A),
            listB: listView(headB, "B", B),
            pointers: { items: ["A→" + (A ? A.val : "null"), "B→" + (B ? B.val : "null")] }
          }
        });
      }

      if (A) {
        steps.push({
          line: 12, msg: "A 和 B 相遇，返回相交节点 " + A.val + "。",
          views: {
            vars: { "返回值": A.val },
            listA: listView(headA, "A", A),
            listB: listView(headB, "B", B),
            pointers: { items: ["A→" + A.val, "B→" + B.val], highlights: [0, 1] }
          }
        });
        return { steps: steps, output: JSON.stringify(A.val) };
      } else {
        steps.push({
          line: 12, msg: "A 和 B 都为 null，说明没有相交节点，返回 null。",
          views: {
            vars: { "返回值": null },
            listA: listView(headA, "A", null),
            listB: listView(headB, "B", null),
            pointers: { items: ["A→null", "B→null"] }
          }
        });
        return { steps: steps, output: "null" };
      }
    }
  };
})(typeof window !== "undefined" ? window : this);