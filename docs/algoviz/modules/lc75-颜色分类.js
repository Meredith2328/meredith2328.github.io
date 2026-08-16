(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc75-颜色分类"] = {
    title: "75 颜色分类 · 三指针",
    language: "python",
    code: [
      "class Solution:",
      "    def sortColors(self, nums: List[int]) -> None:",
      "        \"\"\"",
      "        Do not return anything, modify nums in-place instead.",
      "        \"\"\"",
      "        # l和r是待分配位置, cur是正在扫描的元素",
      "        l, cur, r = 0, 0, len(nums) - 1",
      "        while cur <= r:",
      "            if nums[cur] == 0:",
      "                nums[cur], nums[l] = nums[l], nums[cur]",
      "                l += 1",
      "                cur += 1",
      "            elif nums[cur] == 2:",
      "                nums[cur], nums[r] = nums[r], nums[cur]",
      "                r -= 1",
      "                # 注意！！这里cur不增加, 因为交换过来的数还没处理",
      "            else:",
      "                cur += 1"
    ].join("\n"),

    defaultInput: "nums = [2, 0, 2, 1, 1, 0]",
    inputHint: "每行一个变量，格式如 nums = [2, 0, 2, 1, 1, 0]",
    testInputs: ["nums = [0, 0, 1, 2, 2]", "nums = [2, 1, 0]"],
    expectedOutputs: ["[0, 0, 1, 1, 2, 2]", "[0, 0, 1, 2, 2]", "[0, 1, 2]"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" }
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
      var nums = input.nums.slice();
      var steps = [];
      var l = 0, cur = 0, r = nums.length - 1;

      var varsView = function (hot) {
        var o = { l: l, cur: cur, r: r };
        if (hot) o[hot] = { value: o[hot], __hot: true };
        return o;
      };

      var numsView = function (highlights, ok, bad) {
        return {
          items: nums.slice(),
          highlights: highlights || [],
          ok: ok || [],
          bad: bad || [],
          pointers: { l: l, cur: cur, r: r },
          showIndex: true
        };
      };

      steps.push({
        line: 6,
        msg: "初始化三个指针：l=0（下一个放0的位置），cur=0（当前扫描位置），r=" + r + "（下一个放2的位置）。",
        views: {
          vars: varsView(),
          nums: numsView([], [], [])
        }
      });

      while (cur <= r) {
        steps.push({
          line: 7,
          msg: "进入循环：cur=" + cur + " <= r=" + r + "，继续扫描。",
          views: {
            vars: varsView(),
            nums: numsView([cur])
          }
        });

        if (nums[cur] === 0) {
          steps.push({
            line: 8,
            msg: "nums[cur]=" + nums[cur] + "，是0，需要放到左边。",
            views: {
              vars: varsView(),
              nums: numsView([cur, l], [], [])
            }
          });

          // swap nums[cur] and nums[l]
          var tmp = nums[cur];
          nums[cur] = nums[l];
          nums[l] = tmp;

          steps.push({
            line: 9,
            msg: "交换 nums[cur] 和 nums[l]：现在 nums[l]=" + nums[l] + "，nums[cur]=" + nums[cur] + "。",
            views: {
              vars: varsView(),
              nums: numsView([cur, l], [l], [])
            }
          });

          l += 1;
          cur += 1;

          steps.push({
            line: 10,
            msg: "l 和 cur 都右移一位：l=" + l + "，cur=" + cur + "。",
            views: {
              vars: varsView("l"),
              nums: numsView([cur], [l - 1], [])
            }
          });
        } else if (nums[cur] === 2) {
          steps.push({
            line: 12,
            msg: "nums[cur]=" + nums[cur] + "，是2，需要放到右边。",
            views: {
              vars: varsView(),
              nums: numsView([cur, r], [], [])
            }
          });

          // swap nums[cur] and nums[r]
          var tmp2 = nums[cur];
          nums[cur] = nums[r];
          nums[r] = tmp2;

          steps.push({
            line: 13,
            msg: "交换 nums[cur] 和 nums[r]：现在 nums[cur]=" + nums[cur] + "，nums[r]=" + nums[r] + "。",
            views: {
              vars: varsView(),
              nums: numsView([cur, r], [r], [])
            }
          });

          r -= 1;

          steps.push({
            line: 14,
            msg: "r 左移一位：r=" + r + "。注意 cur 不增加，因为交换过来的数还没处理。",
            views: {
              vars: varsView("r"),
              nums: numsView([cur], [r + 1], [])
            }
          });
        } else {
          steps.push({
            line: 17,
            msg: "nums[cur]=" + nums[cur] + "，是1，位置正确，cur 右移一位。",
            views: {
              vars: varsView(),
              nums: numsView([cur])
            }
          });

          cur += 1;

          steps.push({
            line: 18,
            msg: "cur=" + cur + "。",
            views: {
              vars: varsView("cur"),
              nums: numsView([cur])
            }
          });
        }
      }

      steps.push({
        line: 7,
        msg: "循环结束：cur=" + cur + " > r=" + r + "，数组已排序完成。",
        views: {
          vars: varsView(),
          nums: numsView([], [], [])
        }
      });

      return { steps: steps, output: JSON.stringify(nums) };
    }
  };
})(typeof window !== "undefined" ? window : this);