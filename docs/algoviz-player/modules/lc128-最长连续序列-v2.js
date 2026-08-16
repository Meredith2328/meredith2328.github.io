(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc128-最长连续序列-v2"] = {
    title: "128 最长连续序列",
    language: "python",
    code: [
      "class Solution:",
      "    def subarraySum(self, nums: List[int], k: int) -> int:",
      "        prefix_sum = defaultdict(int) # 前缀和:个数",
      "        prefix_sum[0] = 1",
      "        cur_sum = 0",
      "        res = 0",
      "        for num in nums:",
      "            cur_sum += num",
      "            if cur_sum - k in prefix_sum:",
      "                res += prefix_sum[cur_sum - k]",
      "            prefix_sum[cur_sum] += 1",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [1, 2, 3, 1, -1, 2]\nk = 3",
    inputHint: "每行一个变量，格式如 nums = [1, 2, 3]  /  k = 3",

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      prefix: { type: "vars", title: "prefix_sum" }
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
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...] ");
      if (typeof env.k !== "number") throw new Error("缺少 k = 数字");
      return env;
    },

    run: function (input) {
      var nums = input.nums;
      var k = input.k;
      var prefix = {};
      var cur_sum = 0;
      var res = 0;
      var steps = [];

      function prefixView(hotKey) {
        var o = {};
        var keys = Object.keys(prefix);
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          if (hotKey != null && String(key) === String(hotKey)) {
            o[key] = { value: prefix[key], __hot: true };
          } else {
            o[key] = prefix[key];
          }
        }
        return o;
      }

      function baseVars(numVal) {
        var v = { k: k, cur_sum: cur_sum, res: res };
        if (numVal !== undefined) v.num = numVal;
        return v;
      }

      // 第3行：初始化 prefix_sum
      steps.push({
        line: 3,
        msg: "初始化前缀和哈希表 prefix_sum，用于记录每个前缀和出现的次数。",
        views: {
          vars: baseVars(null),
          nums: { items: nums.slice() },
          prefix: {}
        }
      });

      // 第4行：prefix_sum[0] = 1
      prefix[0] = 1;
      steps.push({
        line: 4,
        msg: "设置 prefix_sum[0] = 1：前缀和为 0 出现 1 次（空子数组）。",
        views: {
          vars: baseVars(null),
          nums: { items: nums.slice() },
          prefix: prefixView("0")
        }
      });

      // 第5行：cur_sum = 0
      steps.push({
        line: 5,
        msg: "将当前前缀和 cur_sum 初始化为 0。",
        views: {
          vars: baseVars(null),
          nums: { items: nums.slice() },
          prefix: prefixView()
        }
      });

      // 第6行：res = 0
      steps.push({
        line: 6,
        msg: "将结果 res 初始化为 0。",
        views: {
          vars: baseVars(null),
          nums: { items: nums.slice() },
          prefix: prefixView()
        }
      });

      // 第7~11行：循环
      for (var i = 0; i < nums.length; i++) {
        var num = nums[i];
        var old_cur = cur_sum;
        var need;

        // 第7行：for num in nums
        steps.push({
          line: 7,
          msg: "进入循环：取出 nums[" + i + "] = " + num + "。",
          views: {
            vars: baseVars(num),
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            prefix: prefixView()
          }
        });

        // 第8行：cur_sum += num
        cur_sum = old_cur + num;
        steps.push({
          line: 8,
          msg: "更新当前前缀和：cur_sum = " + old_cur + " + " + num + " = " + cur_sum + "。",
          views: {
            vars: baseVars(num),
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            prefix: prefixView()
          }
        });

        // 第9行：if cur_sum - k in prefix_sum
        need = cur_sum - k;
        var found = prefix.hasOwnProperty(need);
        steps.push({
          line: 9,
          msg: "检查 cur_sum - k = " + need + " 是否已经出现在 prefix_sum 中。",
          views: {
            vars: baseVars(num),
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            prefix: prefixView()
          }
        });

        if (found) {
          var cnt = prefix[need];
          // 第10行：res += prefix_sum[cur_sum - k]
          res += cnt;
          steps.push({
            line: 10,
            msg: "找到前缀和 " + need + "，它出现了 " + cnt + " 次，所以 res 增加 " + cnt + "，res = " + res + "。",
            views: {
              vars: baseVars(num),
              nums: { items: nums.slice(), highlights: [i], ok: [i], pointers: { i: i } },
              prefix: prefixView(String(need))
            }
          });
        }

        // 第11行：prefix_sum[cur_sum] += 1
        prefix[cur_sum] = (prefix[cur_sum] || 0) + 1;
        steps.push({
          line: 11,
          msg: "当前前缀和 " + cur_sum + " 出现的次数增加 1，变为 " + prefix[cur_sum] + "。",
          views: {
            vars: baseVars(num),
            nums: { items: nums.slice(), highlights: [i], pointers: { i: i } },
            prefix: prefixView(String(cur_sum))
          }
        });
      }

      // 第12行：return res
      steps.push({
        line: 12,
        msg: "遍历结束，返回结果 res = " + res + "。",
        views: {
          vars: { k: k, cur_sum: cur_sum, res: res, num: null },
          nums: { items: nums.slice() },
          prefix: prefixView()
        }
      });

      return { steps: steps, output: JSON.stringify(res) };
    }
  };
})(typeof window !== "undefined" ? window : this);