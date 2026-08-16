(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc3-递归访问邻居-v2"] = {
    title: "3 递归访问邻居 · BFS",
    language: "python",
    code: [
      "from collections import deque",
      "",
      "def bfs(start, graph):",
      "    visited = set()",
      "    queue = deque([start])",
      "    visited.add(start)  # 注意这里！！！BFS 只要无脑在入队时标记时就可以了，防止重复入队",
      "",
      "    while queue:",
      "        node = queue.popleft()",
      "        print(node)",
      "        for neighbor in graph[node]:",
      "            if neighbor not in visited:",
      "                visited.add(neighbor) # 注意这里！！！同上",
      "                queue.append(neighbor)"
    ].join("\n"),

    defaultInput: "start = 0\ngraph = [[1, 2], [0, 3], [0], [1]]",
    inputHint: "每行一个变量，格式如 start = 0 / graph = [[1, 2], [0, 3], [0], [1]]",
    testInputs: [
      "start = 2\ngraph = [[1], [0, 2], [1]]",
      "start = 0\ngraph = [[1], [0]]"
    ],
    expectedOutputs: [
      "0\n1\n2\n3",
      "2\n1\n0",
      "0\n1"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      graph: { type: "graph", title: "图" },
      queue: { type: "queue", title: "队列" },
      visited: { type: "vars", title: "已访问" }
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
      if (typeof env.start !== "number") throw new Error("缺少 start = 数字");
      if (!Array.isArray(env.graph)) throw new Error("缺少 graph = [[...], ...]");
      return env;
    },

    run: function (input) {
      var start = input.start, graph = input.graph;
      var steps = [];
      var visited = {};
      var queue = [start];
      visited[start] = true;
      var outputLines = [];

      var graphView = function (highlights) {
        var nodes = [];
        for (var i = 0; i < graph.length; i++) {
          nodes.push({ id: i, val: i });
        }
        var edges = [];
        for (var i = 0; i < graph.length; i++) {
          for (var j = 0; j < graph[i].length; j++) {
            if (i < graph[i][j]) {
              edges.push([i, graph[i][j]]);
            }
          }
        }
        return { nodes: nodes, edges: edges, highlights: highlights || [] };
      };

      var visitedView = function (hotKey) {
        var o = {};
        Object.keys(visited).forEach(function (k) { o[k] = true; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: true, __hot: true };
        return o;
      };

      steps.push({
        line: 4, msg: "初始化：visited 为空集合，queue 初始包含起点 " + start + "。",
        views: {
          vars: { start: start, node: null, neighbor: null },
          graph: graphView([start]),
          queue: { items: queue.slice(), highlights: [0] },
          visited: {}
        }
      });

      steps.push({
        line: 5, msg: "将起点 " + start + " 加入 visited，防止重复入队。",
        views: {
          vars: { start: start, node: null, neighbor: null },
          graph: graphView([start]),
          queue: { items: queue.slice(), highlights: [0] },
          visited: visitedView(String(start))
        }
      });

      while (queue.length > 0) {
        var node = queue.shift();
        outputLines.push(String(node));
        steps.push({
          line: 8, msg: "从队列头部取出节点 " + node + "，并输出。",
          views: {
            vars: { start: start, node: node, neighbor: null },
            graph: graphView([node]),
            queue: { items: queue.slice() },
            visited: visitedView()
          }
        });

        for (var idx = 0; idx < graph[node].length; idx++) {
          var neighbor = graph[node][idx];
          steps.push({
            line: 9, msg: "遍历节点 " + node + " 的邻居 " + neighbor + "。",
            views: {
              vars: { start: start, node: node, neighbor: neighbor },
              graph: graphView([node, neighbor]),
              queue: { items: queue.slice() },
              visited: visitedView()
            }
          });

          if (!(neighbor in visited)) {
            visited[neighbor] = true;
            queue.push(neighbor);
            steps.push({
              line: 10, msg: "邻居 " + neighbor + " 未被访问，将其加入 visited。",
              views: {
                vars: { start: start, node: node, neighbor: neighbor },
                graph: graphView([node, neighbor]),
                queue: { items: queue.slice(), highlights: [queue.length - 1] },
                visited: visitedView(String(neighbor))
              }
            });
            steps.push({
              line: 11, msg: "将邻居 " + neighbor + " 加入队列尾部。",
              views: {
                vars: { start: start, node: node, neighbor: neighbor },
                graph: graphView([node, neighbor]),
                queue: { items: queue.slice(), highlights: [queue.length - 1] },
                visited: visitedView()
              }
            });
          } else {
            steps.push({
              line: 10, msg: "邻居 " + neighbor + " 已访问，跳过。",
              views: {
                vars: { start: start, node: node, neighbor: neighbor },
                graph: graphView([node, neighbor]),
                queue: { items: queue.slice() },
                visited: visitedView()
              }
            });
          }
        }
      }

      steps.push({
        line: 7, msg: "队列为空，BFS 结束。",
        views: {
          vars: { start: start, node: null, neighbor: null },
          graph: graphView(),
          queue: { items: [] },
          visited: visitedView()
        }
      });

      return { steps: steps, output: outputLines.join("\n") };
    }
  };
})(typeof window !== "undefined" ? window : this);