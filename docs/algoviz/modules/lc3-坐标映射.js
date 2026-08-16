(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc3-坐标映射"] = {
    title: "3 坐标映射很像PyTorch的Tensor。函数参数使用的坐标是1~16，为了把它映射到行号和列号，需要先映射到0~15，然后使用整除`/`和取模`%`（本质是移位和位与）。而块号可以由行号和列号映射得到。当然也可以直接用原始坐标求得，见下。",
    language: "python",
    code: [
      "def map_number(n):",
      "\t'''将n: 1~16映射到00110011 22332233.'''",
      "\t",
      "\tidx = n - 1",
      "\t# 高2位决定基本值: 00->0, 01->0, 10->2, 11->2",
      "\thigh_bits = (idx >> 2) & 0b10",
      "\t# 低2位决定是否+1: 00->0, 01->0, 10->1, 11->1",
      "\tlow_bits = (idx & 0b10) >> 1",
      "\treturn high_bits + low_bits"
    ].join("\n"),

    defaultInput: "n = 1",
    inputHint: "每行一个变量，格式如 n = 1",

    views: {
      vars: { type: "vars", title: "变量" },
      bits: { type: "array", title: "idx 的二进制位" },
      mapping: { type: "array", title: "映射表" }
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
      if (typeof env.n !== "number") throw new Error("缺少 n = 数字");
      return env;
    },

    run: function (input) {
      var n = input.n;
      var steps = [];
      var idx = n - 1;

      // 预计算映射表（用于展示）
      var mappingTable = [];
      for (var k = 1; k <= 16; k++) {
        var tIdx = k - 1;
        var tHigh = (tIdx >> 2) & 0b10;
        var tLow = (tIdx & 0b10) >> 1;
        mappingTable.push(tHigh + tLow);
      }

      // 辅助：把 idx 的二进制位展示成数组（低4位，从低位到高位）
      var bitsView = function (val, hotIdx) {
        var bits = [];
        for (var b = 0; b < 4; b++) {
          bits.push((val >> b) & 1);
        }
        var highlights = [];
        if (hotIdx != null) highlights.push(hotIdx);
        return { items: bits, highlights: highlights, showIndex: true };
      };

      steps.push({
        line: 1, msg: "开始：将 n=" + n + " 映射到 0~3 的块号。",
        views: {
          vars: { n: n, idx: null, high_bits: null, low_bits: null },
          bits: bitsView(0),
          mapping: { items: mappingTable.slice(), highlights: [n - 1] }
        }
      });

      steps.push({
        line: 4, msg: "计算 idx = n - 1 = " + idx + "（把 1~16 映射到 0~15）。",
        views: {
          vars: { n: n, idx: idx, high_bits: null, low_bits: null },
          bits: bitsView(idx),
          mapping: { items: mappingTable.slice(), highlights: [n - 1] }
        }
      });

      var highBits = (idx >> 2) & 0b10;
      steps.push({
        line: 6, msg: "高2位 (idx >> 2) & 0b10 = " + highBits + "（决定基本值 0 或 2）。",
        views: {
          vars: { n: n, idx: idx, high_bits: highBits, low_bits: null },
          bits: bitsView(idx, 2),
          mapping: { items: mappingTable.slice(), highlights: [n - 1] }
        }
      });

      var lowBits = (idx & 0b10) >> 1;
      steps.push({
        line: 8, msg: "低2位 (idx & 0b10) >> 1 = " + lowBits + "（决定是否 +1）。",
        views: {
          vars: { n: n, idx: idx, high_bits: highBits, low_bits: lowBits },
          bits: bitsView(idx, 1),
          mapping: { items: mappingTable.slice(), highlights: [n - 1] }
        }
      });

      var result = highBits + lowBits;
      steps.push({
        line: 9, msg: "返回 high_bits + low_bits = " + result + "。",
        views: {
          vars: { n: n, idx: idx, high_bits: highBits, low_bits: lowBits, "返回值": result },
          bits: bitsView(idx),
          mapping: { items: mappingTable.slice(), highlights: [n - 1], ok: [n - 1] }
        }
      });

      return { steps: steps, output: JSON.stringify(result) };
    }
  };
})(typeof window !== "undefined" ? window : this);