(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc19-删除链表倒数第n节点"] = {
    title: "19 删除链表的倒数第n个节点 · 双指针",
    language: "python",
    code: [
      "# Definition for singly-linked list.",
      "# class ListNode:",
      "#     def __init__(self, val=0, next=None):",
      "#         self.val = val",
      "#         self.next = next",
      "class Solution:",
      "    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:",
      "        # 指示指针首先往右n格",
      "        cur = head",
      "        for i in range(n):",
      "            cur = cur.next",
      "",
      "        # 根据指示指针, 锁定待删除节点的位置",
      "        prev = None",
      "        deleted = head",
      "        while cur != None:",
      "            prev = deleted",
      "            cur = cur.next",
      "            deleted = deleted.next",
      "",
      "        if prev != None: # 要删除中间节点",
      "            prev.next = deleted.next",
      "        else: # 要删除头节点",
      "            head = head.next",
      "",
      "        return head"
    ].join("\n"),

    defaultInput: "head = [1,2,3,4,5]\nn = 2",
    inputHint: "每行一个变量，格式如 head = [1,2,3,4,5] / n = 2",

    views: {
      vars: { type: "vars", title: "变量" },
      list: { type: "array", title: "链表" },
      pointers: { type: "array", title: "指针位置" }
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
      if (typeof env.n !== "number") throw new Error("缺少 n = 数字");
      return env;
    },

    run: function (input) {
      var headArr = input.head;
      var n = input.n;
      var steps = [];
      var listView = function (highlights, ok, bad, pointers) {
        var view = { items: headArr.slice(), showIndex: true };
        if (highlights) view.highlights = highlights;
        if (ok) view.ok = ok;
        if (bad) view.bad = bad;
        if (pointers) view.pointers = pointers;
        return view;
      };

      // 模拟链表节点
      function ListNode(val, next) {
        this.val = val;
        this.next = next;
      }
      var nodes = [];
      for (var i = 0; i < headArr.length; i++) {
        nodes.push(new ListNode(headArr[i], null));
      }
      for (var j = 0; j < nodes.length - 1; j++) {
        nodes[j].next = nodes[j + 1];
      }
      var head = nodes.length > 0 ? nodes[0] : null;

      var cur = head;
      var prev = null;
      var deleted = head;

      steps.push({
        line: 7, msg: "开始：删除倒数第 " + n + " 个节点。",
        views: {
          vars: { n: n, cur: "head", prev: null, deleted: "head" },
          list: listView([], [], [], { cur: 0, deleted: 0 }),
          pointers: { items: ["cur", "deleted"], highlights: [0, 1] }
        }
      });

      // 指示指针首先往右n格
      steps.push({
        line: 8, msg: "cur 指向头节点。",
        views: {
          vars: { n: n, cur: "head", prev: null, deleted: "head" },
          list: listView([], [], [], { cur: 0, deleted: 0 }),
          pointers: { items: ["cur", "deleted"], highlights: [0, 1] }
        }
      });

      for (var i = 0; i < n; i++) {
        if (cur) {
          cur = cur.next;
          var curIdx = cur ? headArr.indexOf(cur.val) : -1;
          steps.push({
            line: 9, msg: "第 " + (i + 1) + " 步：cur 向右移动一格" + (cur ? "，指向 " + cur.val : "，指向 null（链表末尾）") + "。",
            views: {
              vars: { n: n, cur: cur ? cur.val : null, prev: prev ? prev.val : null, deleted: deleted ? deleted.val : null },
              list: listView([], [], [], { cur: curIdx, deleted: 0 }),
              pointers: { items: ["cur", "deleted"], highlights: [0, 1] }
            }
          });
        } else {
          steps.push({
            line: 9, msg: "cur 已经为 null，循环结束。",
            views: {
              vars: { n: n, cur: null, prev: prev ? prev.val : null, deleted: deleted ? deleted.val : null },
              list: listView([], [], [], { cur: -1, deleted: 0 }),
              pointers: { items: ["cur", "deleted"], highlights: [0, 1] }
            }
          });
          break;
        }
      }

      // 根据指示指针, 锁定待删除节点的位置
      steps.push({
        line: 12, msg: "开始移动 prev 和 deleted 指针，直到 cur 到达链表末尾。",
        views: {
          vars: { n: n, cur: cur ? cur.val : null, prev: null, deleted: deleted ? deleted.val : null },
          list: listView([], [], [], { cur: cur ? headArr.indexOf(cur.val) : -1, deleted: 0 }),
          pointers: { items: ["cur", "prev", "deleted"], highlights: [0, 1, 2] }
        }
      });

      steps.push({
        line: 13, msg: "prev 初始化为 null。",
        views: {
          vars: { n: n, cur: cur ? cur.val : null, prev: null, deleted: deleted ? deleted.val : null },
          list: listView([], [], [], { cur: cur ? headArr.indexOf(cur.val) : -1, deleted: 0 }),
          pointers: { items: ["cur", "prev", "deleted"], highlights: [0, 1, 2] }
        }
      });

      steps.push({
        line: 14, msg: "deleted 指向头节点。",
        views: {
          vars: { n: n, cur: cur ? cur.val : null, prev: null, deleted: deleted ? deleted.val : null },
          list: listView([], [], [], { cur: cur ? headArr.indexOf(cur.val) : -1, deleted: 0 }),
          pointers: { items: ["cur", "prev", "deleted"], highlights: [0, 1, 2] }
        }
      });

      while (cur != null) {
        var prevIdx = prev ? headArr.indexOf(prev.val) : -1;
        var deletedIdx = deleted ? headArr.indexOf(deleted.val) : -1;
        var curIdx = cur ? headArr.indexOf(cur.val) : -1;

        steps.push({
          line: 15, msg: "cur 不为 null，进入循环。",
          views: {
            vars: { n: n, cur: cur ? cur.val : null, prev: prev ? prev.val : null, deleted: deleted ? deleted.val : null },
            list: listView([], [], [], { cur: curIdx, prev: prevIdx, deleted: deletedIdx }),
            pointers: { items: ["cur", "prev", "deleted"], highlights: [0, 1, 2] }
          }
        });

        prev = deleted;
        prevIdx = prev ? headArr.indexOf(prev.val) : -1;
        steps.push({
          line: 16, msg: "prev 指向 deleted 当前节点（" + (prev ? prev.val : "null") + "）。",
          views: {
            vars: { n: n, cur: cur ? cur.val : null, prev: prev ? prev.val : null, deleted: deleted ? deleted.val : null },
            list: listView([], [], [], { cur: curIdx, prev: prevIdx, deleted: deletedIdx }),
            pointers: { items: ["cur", "prev", "deleted"], highlights: [0, 1, 2] }
          }
        });

        cur = cur.next;
        curIdx = cur ? headArr.indexOf(cur.val) : -1;
        steps.push({
          line: 17, msg: "cur 向右移动一格" + (cur ? "，指向 " + cur.val : "，指向 null（链表末尾）") + "。",
          views: {
            vars: { n: n, cur: cur ? cur.val : null, prev: prev ? prev.val : null, deleted: deleted ? deleted.val : null },
            list: listView([], [], [], { cur: curIdx, prev: prevIdx, deleted: deletedIdx }),
            pointers: { items: ["cur", "prev", "deleted"], highlights: [0, 1, 2] }
          }
        });

        deleted = deleted.next;
        deletedIdx = deleted ? headArr.indexOf(deleted.val) : -1;
        steps.push({
          line: 18, msg: "deleted 向右移动一格" + (deleted ? "，指向 " + deleted.val : "，指向 null（链表末尾）") + "。",
          views: {
            vars: { n: n, cur: cur ? cur.val : null, prev: prev ? prev.val : null, deleted: deleted ? deleted.val : null },
            list: listView([], [], [], { cur: curIdx, prev: prevIdx, deleted: deletedIdx }),
            pointers: { items: ["cur", "prev", "deleted"], highlights: [0, 1, 2] }
          }
        });
      }

      // 删除节点
      if (prev != null) {
        var delIdx = deleted ? headArr.indexOf(deleted.val) : -1;
        steps.push({
          line: 20, msg: "prev 不为 null，删除中间节点 " + (deleted ? deleted.val : "null") + "。",
          views: {
            vars: { n: n, cur: null, prev: prev ? prev.val : null, deleted: deleted ? deleted.val : null },
            list: listView([delIdx], [], [delIdx], { prev: prev ? headArr.indexOf(prev.val) : -1, deleted: delIdx }),
            pointers: { items: ["prev", "deleted"], highlights: [0, 1] }
          }
        });
        prev.next = deleted.next;
        steps.push({
          line: 21, msg: "将 prev.next 指向 deleted.next，跳过待删除节点。",
          views: {
            vars: { n: n, cur: null, prev: prev ? prev.val : null, deleted: deleted ? deleted.val : null },
            list: listView([], [prev ? headArr.indexOf(prev.val) : -1], [], { prev: prev ? headArr.indexOf(prev.val) : -1 }),
            pointers: { items: ["prev"], highlights: [0] }
          }
        });
      } else {
        steps.push({
          line: 22, msg: "prev 为 null，删除头节点。",
          views: {
            vars: { n: n, cur: null, prev: null, deleted: deleted ? deleted.val : null },
            list: listView([0], [], [0], { deleted: 0 }),
            pointers: { items: ["deleted"], highlights: [0] }
          }
        });
        head = head.next;
        steps.push({
          line: 23, msg: "将 head 指向 head.next，删除原头节点。",
          views: {
            vars: { n: n, cur: null, prev: null, deleted: deleted ? deleted.val : null, head: head ? head.val : null },
            list: listView([], [0], [], {}),
            pointers: { items: ["head"], highlights: [0] }
          }
        });
      }

      // 返回结果
      var resultArr = [];
      var temp = head;
      while (temp) {
        resultArr.push(temp.val);
        temp = temp.next;
      }
      steps.push({
        line: 25, msg: "返回删除后的链表：" + JSON.stringify(resultArr) + "。",
        views: {
          vars: { n: n, head: head ? head.val : null },
          list: listView([], [], [], {}),
          pointers: { items: ["head"], highlights: [0] }
        }
      });

      return { steps: steps, output: JSON.stringify(resultArr) };
    }
  };
})(typeof window !== "undefined" ? window : this);