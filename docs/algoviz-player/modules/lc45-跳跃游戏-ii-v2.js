(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc45-跳跃游戏-ii-v2"] = {
    title: "45 跳跃游戏 II · 贪心",
    link: "https://leetcode.cn/problems/jump-game-ii/",
    language: "python",
    code: [
      "class Solution:",
      "    def jump(self, nums: List[int]) -> int:",
      "        n = len(nums)",
      "        if n == 1:",
      "            return 0",
      "        jumps = 0",
      "        cur_end = 0",
      "        farthest = 0",
      "        for i in range(n - 1):",
      "            farthest = max(farthest, i + nums[i])",
      "",
      "            if i == cur_end: # 需要多跳一次",
      "                jumps += 1",
      "                cur_end = farthest",
      "",
      "                # 注意这个剪枝不能写在farthest更新的下一行, 因为需要先更新完jump数.",
      "                if cur_end >= n - 1:",
      "                    break",
      "        return jumps"
    ].join("\n"),

    defaultInput: "nums = [2, 3, 1, 1, 4]",
    inputHint: "每行一个变量，格式如 nums = [2, 3, 1, 1, 4]",
    testInputs: ["nums = [1, 2, 3]", "nums = [0]"],
    expectedOutputs: ["2", "2", "0"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      reach: { type: "array", title: "可达范围" }
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
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...]");
      return env;
    },

    run: function (input) {
      var nums = input.nums;
      var steps = [];
      var n = nums.length;

      // 辅助：生成可达范围视图（每个位置显示从该位置能跳到的最远下标）
      var reachView = function (farthest, curEnd, i) {
        var items = [];
        for (var k = 0; k < n; k++) {
          items.push(k + nums[k]);
        }
        var highlights = [];
        if (i >= 0 && i < n) highlights.push(i);
        var pointers = {};
        if (curEnd >= 0 && curEnd < n) pointers["cur_end"] = curEnd;
        if (farthest >= 0 && farthest < n) pointers["farthest"] = farthest;
        return { items: items, highlights: highlights, pointers: pointers, showIndex: true };
      };

      steps.push({
        line: 3, msg: "数组长度 n = " + n + "。",
        views: {
          vars: { n: n, jumps: 0, cur_end: 0, farthest: 0, i: null },
          nums: { items: nums.slice() },
          reach: reachView(0, 0, -1)
        }
      });

      if (n === 1) {
        steps.push({
          line: 4, msg: "只有一个元素，不需要跳跃。",
          views: {
            vars: { n: n, jumps: 0, cur_end: 0, farthest: 0, i: null },
            nums: { items: nums.slice() },
            reach: reachView(0, 0, -1)
          }
        });
        steps.push({
          line: 5, msg: "返回 0。",
          views: {
            vars: { "返回值": 0 },
            nums: { items: nums.slice() },
            reach: reachView(0, 0, -1)
          }
        });
        return { steps: steps, output: "0" };
      }

      var jumps = 0, cur_end = 0, farthest = 0;

      steps.push({
        line: 6, msg: "初始化：jumps=0（跳跃次数），cur_end=0（当前跳跃的边界），farthest=0（能到的最远位置）。",
        views: {
          vars: { n: n, jumps: jumps, cur_end: cur_end, farthest: farthest, i: null },
          nums: { items: nums.slice() },
          reach: reachView(farthest, cur_end, -1)
        }
      });

      for (var i = 0; i < n - 1; i++) {
        steps.push({
          line: 9, msg: "遍历到位置 i=" + i + "，当前能跳到的最远位置 farthest=" + farthest + "。",
          views: {
            vars: { n: n, jumps: jumps, cur_end: cur_end, farthest: farthest, i: i },
            nums: { items: nums.slice(), highlights: [i] },
            reach: reachView(farthest, cur_end, i)
          }
        });

        var newFarthest = i + nums[i];
        if (newFarthest > farthest) farthest = newFarthest;

        steps.push({
          line: 10, msg: "更新 farthest = max(" + farthest + ", " + i + " + " + nums[i] + ") = " + farthest + "。",
          views: {
            vars: { n: n, jumps: jumps, cur_end: cur_end, farthest: farthest, i: i },
            nums: { items: nums.slice(), highlights: [i] },
            reach: reachView(farthest, cur_end, i)
          }
        });

        if (i === cur_end) {
          steps.push({
            line: 12, msg: "i=" + i + " 到达当前跳跃的边界 cur_end=" + cur_end + "，需要再跳一次。",
            views: {
              vars: { n: n, jumps: jumps, cur_end: cur_end, farthest: farthest, i: i },
              nums: { items: nums.slice(), highlights: [i] },
              reach: reachView(farthest, cur_end, i)
            }
          });

          jumps += 1;
          cur_end = farthest;

          steps.push({
            line: 13, msg: "跳跃次数 jumps 增加到 " + jumps + "，新的边界 cur_end 更新为 farthest=" + cur_end + "。",
            views: {
              vars: { n: n, jumps: jumps, cur_end: cur_end, farthest: farthest, i: i },
              nums: { items: nums.slice(), highlights: [i] },
              reach: reachView(farthest, cur_end, i)
            }
          });

          if (cur_end >= n - 1) {
            steps.push({
              line: 16, msg: "新的边界 cur_end=" + cur_end + " 已覆盖最后一个位置（下标 " + (n - 1) + "），提前结束。",
              views: {
                vars: { n: n, jumps: jumps, cur_end: cur_end, farthest: farthest, i: i },
                nums: { items: nums.slice(), ok: [n - 1] },
                reach: reachView(farthest, cur_end, i)
              }
            });
            steps.push({
              line: 17, msg: "跳出循环。",
              views: {
                vars: { n: n, jumps: jumps, cur_end: cur_end, farthest: farthest, i: i },
                nums: { items: nums.slice() },
                reach: reachView(farthest, cur_end, i)
              }
            });
            steps.push({
              line: 18, msg: "返回最少跳跃次数 " + jumps + "。",
              views: {
                vars: { "返回值": jumps },
                nums: { items: nums.slice() },
                reach: reachView(farthest, cur_end, i)
              }
            });
            return { steps: steps, output: JSON.stringify(jumps) };
          }
        }
      }

      steps.push({
        line: 18, msg: "循环结束，返回最少跳跃次数 " + jumps + "。",
        views: {
          vars: { "返回值": jumps },
          nums: { items: nums.slice() },
          reach: reachView(farthest, cur_end, n - 2)
        }
      });
      return { steps: steps, output: JSON.stringify(jumps) };
    }
  };
})(typeof window !== "undefined" ? window : this);