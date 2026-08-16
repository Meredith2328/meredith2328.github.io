(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc2-两数相加"] = {
    title: "2 两数相加",
    language: "python",
    code: [
      "# Definition for singly-linked list.",
      "# class ListNode:",
      "#     def __init__(self, val=0, next=None):",
      "#         self.val = val",
      "#         self.next = next",
      "class Solution:",
      "    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:",
      "        # 把l2加到l1上",
      "        cur1, cur2 = l1, l2",
      "        while cur1.next != None and cur2.next != None:",
      "            cur1.val += cur2.val",
      "            cur1 = cur1.next",
      "            cur2 = cur2.next",
      "        if cur1.next == None:",
      "            cur1.next = cur2.next",
      "        cur1.val += cur2.val",
      "",
      "        # flatten",
      "        cur1 = l1",
      "        while cur1:",
      "            if cur1.val >= 10:",
      "                if cur1.next:",
      "                    cur1.next.val += cur1.val // 10",
      "                else:",
      "                    cur1.next = ListNode(cur1.val // 10)",
      "                cur1.val %= 10",
      "            cur1 = cur1.next",
      "",
      "        return l1"
    ].join("\n"),

    defaultInput: "l1 = [2, 4, 3]\nl2 = [5, 6, 4]",
    inputHint: "每行一个变量，格式如 l1 = [2, 4, 3] / l2 = [5, 6, 4]",
    testInputs: [
      "l1 = [9, 9, 9]\nl2 = [1]",
      "l1 = [0]\nl2 = [0]"
    ],
    expectedOutputs: [
      "[7, 0, 8]",
      "[0, 0, 0, 1]",
      "[0]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      l1: { type: "array", title: "l1" },
      l2: { type: "array", title: "l2" }
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
      if (!Array.isArray(env.l1)) throw new Error("缺少 l1 = [...]");
      if (!Array.isArray(env.l2)) throw new Error("缺少 l2 = [...]");
      return env;
    },

    run: function (input) {
      var l1Arr = input.l1.slice();
      var l2Arr = input.l2.slice();
      var steps = [];

      // 链表节点
      function ListNode(val, next) {
        this.val = val;
        this.next = next || null;
      }

      // 从数组构建链表
      function buildList(arr) {
        var dummy = new ListNode(0);
        var cur = dummy;
        for (var i = 0; i < arr.length; i++) {
          cur.next = new ListNode(arr[i]);
          cur = cur.next;
        }
        return dummy.next;
      }

      // 链表转数组（用于视图）
      function listToArray(head) {
        var arr = [];
        var cur = head;
        while (cur) {
          arr.push(cur.val);
          cur = cur.next;
        }
        return arr;
      }

      var l1 = buildList(l1Arr);
      var l2 = buildList(l2Arr);

      // 视图辅助
      function l1View(highlights, ok, bad) {
        return {
          items: listToArray(l1),
          highlights: highlights || [],
          ok: ok || [],
          bad: bad || []
        };
      }
      function l2View(highlights) {
        return {
          items: listToArray(l2),
          highlights: highlights || []
        };
      }

      // 步骤1：初始化
      steps.push({
        line: 8,
        msg: "开始：将 l2 加到 l1 上。初始化 cur1 指向 l1 头，cur2 指向 l2 头。",
        views: {
          vars: { cur1: 0, cur2: 0 },
          l1: l1View([0]),
          l2: l2View([0])
        }
      });

      var cur1 = l1, cur2 = l2;
      var idx1 = 0, idx2 = 0;

      // 主循环：把 l2 加到 l1 上
      while (cur1.next !== null && cur2.next !== null) {
        steps.push({
          line: 9,
          msg: "cur1 和 cur2 都有后继，进入循环。当前 cur1.val=" + cur1.val + "，cur2.val=" + cur2.val + "。",
          views: {
            vars: { cur1: idx1, cur2: idx2 },
            l1: l1View([idx1]),
            l2: l2View([idx2])
          }
        });

        cur1.val += cur2.val;
        steps.push({
          line: 10,
          msg: "将 cur2.val 加到 cur1.val 上：cur1.val = " + cur1.val + "。",
          views: {
            vars: { cur1: idx1, cur2: idx2 },
            l1: l1View([idx1]),
            l2: l2View([idx2])
          }
        });

        cur1 = cur1.next;
        cur2 = cur2.next;
        idx1++;
        idx2++;
        steps.push({
          line: 11,
          msg: "cur1 和 cur2 都向后移动一位。",
          views: {
            vars: { cur1: idx1, cur2: idx2 },
            l1: l1View([idx1]),
            l2: l2View([idx2])
          }
        });
      }

      // 处理剩余部分
      if (cur1.next === null) {
        cur1.next = cur2.next;
        steps.push({
          line: 14,
          msg: "cur1 没有后继了，把 cur2 的剩余部分接到 cur1 后面。",
          views: {
            vars: { cur1: idx1, cur2: idx2 },
            l1: l1View([idx1]),
            l2: l2View([idx2])
          }
        });
      }

      cur1.val += cur2.val;
      steps.push({
        line: 15,
        msg: "将 cur2.val 加到 cur1.val 上：cur1.val = " + cur1.val + "。",
        views: {
          vars: { cur1: idx1, cur2: idx2 },
          l1: l1View([idx1]),
          l2: l2View([idx2])
        }
      });

      // 进位处理
      cur1 = l1;
      idx1 = 0;
      steps.push({
        line: 19,
        msg: "开始处理进位：cur1 重新指向 l1 头。",
        views: {
          vars: { cur1: idx1 },
          l1: l1View([idx1]),
          l2: l2View()
        }
      });

      while (cur1) {
        if (cur1.val >= 10) {
          steps.push({
            line: 21,
            msg: "cur1.val=" + cur1.val + " ≥ 10，需要进位。",
            views: {
              vars: { cur1: idx1 },
              l1: l1View([idx1]),
              l2: l2View()
            }
          });

          if (cur1.next) {
            cur1.next.val += Math.floor(cur1.val / 10);
            steps.push({
              line: 23,
              msg: "有后继节点，把进位 " + Math.floor(cur1.val / 10) + " 加到下一个节点上。",
              views: {
                vars: { cur1: idx1 },
                l1: l1View([idx1, idx1 + 1]),
                l2: l2View()
              }
            });
          } else {
            cur1.next = new ListNode(Math.floor(cur1.val / 10));
            steps.push({
              line: 25,
              msg: "没有后继节点，创建新节点存放进位 " + Math.floor(cur1.val / 10) + "。",
              views: {
                vars: { cur1: idx1 },
                l1: l1View([idx1, idx1 + 1]),
                l2: l2View()
              }
            });
          }

          cur1.val %= 10;
          steps.push({
            line: 26,
            msg: "当前节点值取余：cur1.val = " + cur1.val + "。",
            views: {
              vars: { cur1: idx1 },
              l1: l1View([idx1]),
              l2: l2View()
            }
          });
        }

        cur1 = cur1.next;
        idx1++;
        steps.push({
          line: 27,
          msg: "cur1 向后移动一位。",
          views: {
            vars: { cur1: idx1 },
            l1: l1View([idx1]),
            l2: l2View()
          }
        });
      }

      steps.push({
        line: 29,
        msg: "返回 l1 链表。",
        views: {
          vars: {},
          l1: l1View(),
          l2: l2View()
        }
      });

      return {
        steps: steps,
        output: JSON.stringify(listToArray(l1)).replace(/,/g, ", ")
      };
    }
  };
})(typeof window !== "undefined" ? window : this);