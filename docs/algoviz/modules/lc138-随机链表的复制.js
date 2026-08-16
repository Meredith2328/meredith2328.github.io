(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc138-随机链表的复制"] = {
    title: "138 随机链表的复制 · 哈希映射",
    language: "python",
    code: [
      '"""',
      "# Definition for a Node.",
      "class Node:",
      "    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):",
      "        self.val = int(x)",
      "        self.next = next",
      "        self.random = random",
      '"""',
      "",
      "class Solution:",
      "    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':",
      "        # 想法是, 用哈希存储节点到节点的映射",
      "        adict = {}",
      "",
      "        dummy = Node(0)",
      "        cur = dummy",
      "        # 第一遍扫描先创建新链表节点",
      "        headcur = head",
      "        while headcur:",
      "            cur.next = Node(headcur.val, None, None)",
      "            adict[headcur] = cur.next",
      "            cur = cur.next",
      "            headcur = headcur.next",
      "",
      "        # 第二遍扫描借助哈希表填入random",
      "        headcur = head",
      "        while headcur:",
      "            if headcur.random == None:",
      "                adict[headcur].random = None",
      "            else:",
      "                adict[headcur].random = adict[headcur.random]",
      "",
      "            headcur = headcur.next",
      "",
      "        return dummy.next"
    ].join("\n"),

    defaultInput: "head = [[7,null],[13,0],[11,4],[10,2],[1,0]]",
    inputHint: "输入格式：head = [[val, random_index], ...]，其中 random_index 为 null 或指向原链表的下标（0-based）",
    testInputs: [
      "head = [[1,1],[2,1]]",
      "head = [[3,null],[3,0],[3,null]]"
    ],
    expectedOutputs: [
      "[[7,null],[13,0],[11,4],[10,2],[1,0]]",
      "[[1,1],[2,1]]",
      "[[3,null],[3,0],[3,null]]"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      orig: { type: "array", title: "原链表" },
      copy: { type: "array", title: "新链表" },
      hash: { type: "vars", title: "哈希表 adict" }
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
      if (!Array.isArray(env.head)) throw new Error("缺少 head = [[val, random_index], ...]");
      return env;
    },

    run: function (input) {
      var head = input.head;
      var steps = [];
      var n = head.length;

      // 构建原链表节点数组
      var origNodes = [];
      for (var i = 0; i < n; i++) {
        origNodes.push({ val: head[i][0], random: head[i][1], next: null });
      }
      for (var i = 0; i < n; i++) {
        if (i < n - 1) origNodes[i].next = origNodes[i + 1];
      }

      // 辅助函数：显示原链表
      function origView(highlightIdx) {
        var items = [];
        for (var i = 0; i < n; i++) {
          items.push(origNodes[i].val);
        }
        var v = { items: items, showIndex: true };
        if (highlightIdx != null) v.highlights = [highlightIdx];
        return v;
      }

      // 辅助函数：显示新链表（基于 adict 和 dummy）
      function copyView(highlightIdx) {
        var items = [];
        var node = dummy.next;
        while (node) {
          items.push(node.val);
          node = node.next;
        }
        var v = { items: items, showIndex: true };
        if (highlightIdx != null) v.highlights = [highlightIdx];
        return v;
      }

      // 辅助函数：显示哈希表
      function hashView(hotKey) {
        var o = {};
        Object.keys(adict).forEach(function (k) {
          var key = "节点" + k;
          o[key] = "节点" + adict[k].val;
        });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      }

      // 模拟 Node 类
      function Node(val, next, random) {
        this.val = val;
        this.next = next || null;
        this.random = random || null;
      }

      var adict = {};
      var dummy = new Node(0);
      var cur = dummy;
      var headcur = origNodes[0] || null;

      // 步骤 1：初始化
      steps.push({
        line: 11,
        msg: "开始复制随机链表。先创建哈希表 adict 和虚拟头节点 dummy。",
        views: {
          vars: { adict: "{}", dummy: "Node(0)", cur: "dummy", headcur: headcur ? "head" : "null" },
          orig: origView(),
          copy: { items: [], showIndex: true },
          hash: {}
        }
      });

      // 第一遍扫描
      var idx = 0;
      while (headcur) {
        // 创建新节点
        cur.next = new Node(headcur.val, null, null);
        steps.push({
          line: 17,
          msg: "为原链表节点 " + idx + "（值 " + headcur.val + "）创建新节点。",
          views: {
            vars: { adict: "{}", dummy: "Node(0)", cur: "dummy", headcur: "节点" + idx },
            orig: origView(idx),
            copy: copyView(idx),
            hash: hashView()
          }
        });

        // 存入哈希表
        adict[idx] = cur.next;
        steps.push({
          line: 18,
          msg: "将原节点 " + idx + " 映射到新节点（值 " + headcur.val + "）。",
          views: {
            vars: { adict: "{}", dummy: "Node(0)", cur: "dummy", headcur: "节点" + idx },
            orig: origView(idx),
            copy: copyView(idx),
            hash: hashView("节点" + idx)
          }
        });

        // 移动 cur 和 headcur
        cur = cur.next;
        headcur = headcur.next;
        idx++;
        steps.push({
          line: 19,
          msg: "移动 cur 和 headcur 到下一个节点。",
          views: {
            vars: { adict: "{}", dummy: "Node(0)", cur: "新节点" + (idx - 1), headcur: headcur ? "节点" + idx : "null" },
            orig: origView(idx < n ? idx : null),
            copy: copyView(idx - 1),
            hash: hashView()
          }
        });
      }

      // 第二遍扫描
      headcur = origNodes[0] || null;
      idx = 0;
      steps.push({
        line: 23,
        msg: "第二遍扫描：开始填充新节点的 random 指针。",
        views: {
          vars: { adict: "已填充", dummy: "Node(0)", cur: "新链表尾", headcur: headcur ? "head" : "null" },
          orig: origView(),
          copy: copyView(),
          hash: hashView()
        }
      });

      while (headcur) {
        if (headcur.random === null) {
          adict[idx].random = null;
          steps.push({
            line: 25,
            msg: "原节点 " + idx + " 的 random 为 null，新节点的 random 也设为 null。",
            views: {
              vars: { adict: "已填充", dummy: "Node(0)", cur: "新链表尾", headcur: "节点" + idx },
              orig: origView(idx),
              copy: copyView(idx),
              hash: hashView()
            }
          });
        } else {
          adict[idx].random = adict[headcur.random];
          steps.push({
            line: 27,
            msg: "原节点 " + idx + " 的 random 指向节点 " + headcur.random + "，新节点的 random 指向对应的新节点。",
            views: {
              vars: { adict: "已填充", dummy: "Node(0)", cur: "新链表尾", headcur: "节点" + idx },
              orig: origView(idx),
              copy: copyView(idx),
              hash: hashView()
            }
          });
        }
        headcur = headcur.next;
        idx++;
        steps.push({
          line: 29,
          msg: "移动到下一个原节点。",
          views: {
            vars: { adict: "已填充", dummy: "Node(0)", cur: "新链表尾", headcur: headcur ? "节点" + idx : "null" },
            orig: origView(idx < n ? idx : null),
            copy: copyView(),
            hash: hashView()
          }
        });
      }

      // 返回结果
      steps.push({
        line: 31,
        msg: "复制完成，返回新链表的头节点（dummy.next）。",
        views: {
          vars: { adict: "已填充", dummy: "Node(0)", cur: "新链表尾", headcur: "null" },
          orig: origView(),
          copy: copyView(),
          hash: hashView()
        }
      });

      // 构造输出
      var outputArr = [];
      var node = dummy.next;
      while (node) {
        var randIdx = null;
        if (node.random) {
          // 找到 random 对应的原节点下标
          for (var j = 0; j < n; j++) {
            if (adict[j] === node.random) {
              randIdx = j;
              break;
            }
          }
        }
        outputArr.push([node.val, randIdx]);
        node = node.next;
      }

      return { steps: steps, output: JSON.stringify(outputArr) };
    }
  };
})(typeof window !== "undefined" ? window : this);