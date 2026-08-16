(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc128-最长连续序列"] = {
    title: "128 最长连续序列 · HashSet剪枝",
    language: "python",
    code: [
      "class Solution:",
      "    def longestConsecutive(self, nums: List[int]) -> int:",
      "        num_set = set(nums)",
      "        sz = 0",
      "        for num in num_set:",
      "            # 剪枝: 只判断连续序列的开头元素.",
      "            if num - 1 in num_set:",
      "                continue",
      "            cur_sz = 1",
      "            cur_num = num + 1",
      "            while cur_num in num_set:",
      "                cur_sz += 1",
      "                cur_num += 1",
      "            sz = max(sz, cur_sz)",
      "        return sz"
    ].join("\n"),

    defaultInput: "nums = [100, 4, 200, 1, 3, 2]",
    inputHint: "每行一个变量，格式如 nums = [100, 4, 200, 1, 3, 2]",
    testInputs: [
      "nums = [1, 2, 0, 1]",
      "nums = []"
    ],
    expectedOutputs: [
      "4",
      "3",
      "0"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "原始 nums" },
      setview: { type: "array", title: "num_set（集合）" }
    },

    parseInput: function (text) {
      var env = {};
      text.split(/\n/).forEach(function (line) {
        var m = /^\s*([A-Za-z_]\w*)\s*=\s*(.+?)\s*$/.exec(line);
        if (!m) return;
        try { env[m[1]] = JSON.parse(m[2].replace(/'/g, '"')); }
        catch (e) { env[m[1]] = m[2]; }
      });
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...] ");
      return env;
    },

    run: function (input) {
      var nums = input.nums || [];
      var steps = [];

      // 模拟 set 的哈希集合，保存元素去重后的顺序按首次出现顺序
      var setItems = [];
      var inSet = function (x) {
        for (var i = 0; i < setItems.length; i++) if (setItems[i] === x) return true;
        return false;
      };

      steps.push({
        line: 2,
        msg: "开始计算最长连续序列。先构建集合 num_set = set(nums)。",
        views: {
          vars: { num_set: "{}", sz: 0, num: null, cur_sz: null, cur_num: null },
          nums: { items: nums.slice() },
          setview: { items: [], highlights: [] }
        }
      });

      // 构建集合
      for (var i = 0; i < nums.length; i++) {
        if (!inSet(nums[i])) setItems.push(nums[i]);
      }

      steps.push({
        line: 2,
        msg: "集合构建完成：{" + setItems.join(", ") + "}，共 " + setItems.length + " 个不同元素。",
        views: {
          vars: { num_set: "{" + setItems.join(", ") + "}", sz: 0, num: null, cur_sz: null, cur_num: null },
          nums: { items: nums.slice() },
          setview: { items: setItems.slice(), highlights: [] }
        }
      });

      var sz = 0;
      // 用于记录当前外层循环遍历到的元素下标（在 setItems 中的位置）
      var loopIdx = 0;

      steps.push({
        line: 3,
        msg: "初始化最长长度 sz = 0。",
        views: {
          vars: { num_set: "{" + setItems.join(", ") + "}", sz: 0, num: null, cur_sz: null, cur_num: null },
          nums: { items: nums.slice() },
          setview: { items: setItems.slice(), highlights: [] }
        }
      });

      for (; loopIdx < setItems.length; loopIdx++) {
        var num = setItems[loopIdx];

        steps.push({
          line: 4,
          msg: "外层循环：从集合中取出 num = " + num + "。",
          views: {
            vars: { num_set: "{" + setItems.join(", ") + "}", sz: sz, num: num, cur_sz: null, cur_num: null },
            nums: { items: nums.slice() },
            setview: { items: setItems.slice(), highlights: [loopIdx] }
          }
        });

        // 判断 num - 1 是否在集合中
        var prevExists = inSet(num - 1);

        if (prevExists) {
          steps.push({
            line: 5,
            msg: "剪枝：num - 1 = " + (num - 1) + " 在集合中，" + num + " 不是连续序列的开头，跳过。",
            views: {
              vars: { num_set: "{" + setItems.join(", ") + "}", sz: sz, num: num, cur_sz: null, cur_num: null },
              nums: { items: nums.slice() },
              setview: { items: setItems.slice(), highlights: [loopIdx] }
            }
          });
          steps.push({
            line: 6,
            msg: "continue 到下一个集合元素。",
            views: {
              vars: { num_set: "{" + setItems.join(", ") + "}", sz: sz, num: num, cur_sz: null, cur_num: null },
              nums: { items: nums.slice() },
              setview: { items: setItems.slice(), highlights: [loopIdx] }
            }
          });
          continue;
        }

        // 是序列开头
        var cur_sz = 1;
        var cur_num = num + 1;

        steps.push({
          line: 8,
          msg: num + " 是序列起点，初始化 cur_sz = " + cur_sz + "，cur_num = " + cur_num + "。",
          views: {
            vars: { num_set: "{" + setItems.join(", ") + "}", sz: sz, num: num, cur_sz: cur_sz, cur_num: cur_num },
            nums: { items: nums.slice(), highlights: [nums.indexOf(num)] },
            setview: { items: setItems.slice(), highlights: [loopIdx] }
          }
        });

        // 模拟 while cur_num in num_set
        while (inSet(cur_num)) {
          cur_sz += 1;
          cur_num += 1;

          steps.push({
            line: 10,
            msg: "cur_num = " + cur_num + " 在集合中，长度增加到 " + cur_sz + "，继续向后探测。",
            views: {
              vars: { num_set: "{" + setItems.join(", ") + "}", sz: sz, num: num, cur_sz: cur_sz, cur_num: cur_num },
              nums: { items: nums.slice(), highlights: [nums.indexOf(num)] },
              setview: { items: setItems.slice(), highlights: [loopIdx] }
            }
          });
        }

        // 退出 while，记录一步
        steps.push({
          line: 10,
          msg: "cur_num = " + cur_num + " 不在集合中，以 " + num + " 开头的连续序列长度为 " + cur_sz + "。",
          views: {
            vars: { num_set: "{" + setItems.join(", ") + "}", sz: sz, num: num, cur_sz: cur_sz, cur_num: cur_num },
            nums: { items: nums.slice(), highlights: [nums.indexOf(num)] },
            setview: { items: setItems.slice(), highlights: [loopIdx] }
          }
        });

        // 更新最大值
        var oldSz = sz;
        sz = Math.max(sz, cur_sz);

        steps.push({
          line: 11,
          msg: "更新最大值：" + oldSz + " 和 " + cur_sz + " 取大，得到 sz = " + sz + "。",
          views: {
            vars: { num_set: "{" + setItems.join(", ") + "}", sz: sz, num: num, cur_sz: cur_sz, cur_num: cur_num },
            nums: { items: nums.slice(), highlights: [nums.indexOf(num)] },
            setview: { items: setItems.slice(), highlights: [loopIdx] }
          }
        });
      }

      // 循环结束
      steps.push({
        line: 12,
        msg: "所有元素遍历完毕，返回最长连续序列长度 " + sz + "。",
        views: {
          vars: { num_set: "{" + setItems.join(", ") + "}", sz: sz, "返回值": sz },
          nums: { items: nums.slice() },
          setview: { items: setItems.slice(), highlights: [] }
        }
      });

      return { steps: steps, output: JSON.stringify(sz) };
    }
  };
})(typeof window !== "undefined" ? window : this);