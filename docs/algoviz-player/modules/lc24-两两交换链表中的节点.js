(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc24-两两交换链表中的节点"] = {
    title: "24 两两交换链表中的节点 · 值交换",
    link: "https://leetcode.cn/problems/swap-nodes-in-pairs/",
    language: "python",
    code: [
      "# Definition for singly-linked list.",
      "# class ListNode:",
      "#     def __init__(self, val=0, next=None):",
      "#         self.val = val",
      "#         self.next = next",
      "class Solution:",
      "    def swapPairs(self, head: Optional[ListNode]) -> Optional[ListNode]:",
      "        if head == None or head.next == None:",
      "            return head",
      "        prev = None",
      "        cur1, cur2 = head, head.next",
      "        while cur2 != None:",
      "            cur1.val, cur2.val = cur2.val, cur1.val",
      "            cur1 = cur1.next.next",
      "            if cur2.next == None:",
      "                break",
      "            cur2 = cur2.next.next",
      "        return head"
    ].join("\n"),

    defaultInput: "head = [1, 2, 3, 4]",
    inputHint: "每行一个变量，格式如 head = [1, 2, 3, 4]",
    testInputs: ["head = [1, 2, 3]", "head = [1]"],
    expectedOutputs: ["[2,1,4,3]", "[2,1,3]", "[1]"],

    views: {
      vars: { type: "vars", title: "变量" },
      list: { type: "array", title: "链表" },
      pointers: { type: "array", title: "指针" }
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
      var headArr = input.head;
      var steps = [];
      var n = headArr.length;

      // Build linked list nodes
      var nodes = [];
      for (var i = 0; i < n; i++) {
        nodes.push({ val: headArr[i], next: null });
      }
      for (var i = 0; i < n - 1; i++) {
        nodes[i].next = nodes[i + 1];
      }
      var head = n > 0 ? nodes[0] : null;

      var listView = function (highlights, ok, bad) {
        var items = [];
        for (var i = 0; i < n; i++) items.push(nodes[i].val);
        return { items: items, highlights: highlights || [], ok: ok || [], bad: bad || [] };
      };

      var ptrView = function (cur1Idx, cur2Idx) {
        var items = [];
        for (var i = 0; i < n; i++) items.push(nodes[i].val);
        var pointers = {};
        if (cur1Idx != null) pointers.cur1 = cur1Idx;
        if (cur2Idx != null) pointers.cur2 = cur2Idx;
        return { items: items, pointers: pointers };
      };

      // Step 1: initial
      steps.push({
        line: 7,
        msg: "开始：链表为 [" + headArr.join(", ") + "]。",
        views: {
          vars: { head: headArr.slice(), prev: null, cur1: null, cur2: null },
          list: listView(),
          pointers: ptrView(null, null)
        }
      });

      // Step 2: check empty/single
      if (n === 0 || n === 1) {
        steps.push({
          line: 8,
          msg: n === 0 ? "链表为空，直接返回。" : "链表只有一个节点，无需交换，直接返回。",
          views: {
            vars: { head: headArr.slice(), prev: null, cur1: null, cur2: null },
            list: listView(),
            pointers: ptrView(null, null)
          }
        });
        steps.push({
          line: 9,
          msg: "返回原链表。",
          views: {
            vars: { "返回值": headArr.slice() },
            list: listView(),
            pointers: ptrView(null, null)
          }
        });
        return { steps: steps, output: JSON.stringify(headArr.slice()) };
      }

      // Step 3: init prev, cur1, cur2
      var cur1 = head;
      var cur2 = head.next;
      var cur1Idx = 0, cur2Idx = 1;
      steps.push({
        line: 10,
        msg: "初始化 prev = None，cur1 指向第 1 个节点，cur2 指向第 2 个节点。",
        views: {
          vars: { head: headArr.slice(), prev: null, cur1: cur1.val, cur2: cur2.val },
          list: listView(),
          pointers: ptrView(cur1Idx, cur2Idx)
        }
      });

      // Step 4: while loop
      var loopCount = 0;
      while (cur2 != null) {
        loopCount++;
        // Step: swap values
        var tmp = cur1.val;
        cur1.val = cur2.val;
        cur2.val = tmp;
        steps.push({
          line: 12,
          msg: "交换 cur1 和 cur2 的值：" + cur1.val + " 和 " + cur2.val + "。",
          views: {
            vars: { head: headArr.slice(), prev: null, cur1: cur1.val, cur2: cur2.val },
            list: listView([cur1Idx, cur2Idx], [cur1Idx, cur2Idx]),
            pointers: ptrView(cur1Idx, cur2Idx)
          }
        });

        // Step: move cur1
        cur1 = cur1.next.next;
        cur1Idx += 2;
        steps.push({
          line: 13,
          msg: "cur1 向后移动两个节点" + (cur1 != null ? "，现在指向第 " + (cur1Idx + 1) + " 个节点。" : "，现在为 null。"),
          views: {
            vars: { head: headArr.slice(), prev: null, cur1: cur1 != null ? cur1.val : null, cur2: cur2.val },
            list: listView(),
            pointers: ptrView(cur1Idx, cur2Idx)
          }
        });

        // Step: check cur2.next
        if (cur2.next == null) {
          steps.push({
            line: 14,
            msg: "cur2.next 为 null，说明这是最后一对，跳出循环。",
            views: {
              vars: { head: headArr.slice(), prev: null, cur1: cur1 != null ? cur1.val : null, cur2: cur2.val },
              list: listView(),
              pointers: ptrView(cur1Idx, cur2Idx)
            }
          });
          break;
        }

        // Step: move cur2
        cur2 = cur2.next.next;
        cur2Idx += 2;
        steps.push({
          line: 16,
          msg: "cur2 向后移动两个节点" + (cur2 != null ? "，现在指向第 " + (cur2Idx + 1) + " 个节点。" : "，现在为 null。"),
          views: {
            vars: { head: headArr.slice(), prev: null, cur1: cur1 != null ? cur1.val : null, cur2: cur2 != null ? cur2.val : null },
            list: listView(),
            pointers: ptrView(cur1Idx, cur2Idx)
          }
        });
      }

      // Step: return
      var result = [];
      for (var i = 0; i < n; i++) result.push(nodes[i].val);
      steps.push({
        line: 17,
        msg: "循环结束，返回交换后的链表：[" + result.join(", ") + "]。",
        views: {
          vars: { "返回值": result.slice() },
          list: listView(),
          pointers: ptrView(null, null)
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);