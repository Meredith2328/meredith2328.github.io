(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc31-下一个排列"] = {
    title: "31 下一个排列 · 双指针翻转",
    link: "https://leetcode.cn/problems/next-permutation/",
    language: "python",
    code: [
      "class Solution:",
      "    def reverseNums(self, nums, i, j):",
      "        while i < j:",
      "            nums[i], nums[j] = nums[j], nums[i]",
      "            i += 1",
      "            j -= 1",
      "",
      "    def nextPermutation(self, nums: List[int]) -> None:",
      "        \"\"\"",
      "        Do not return anything, modify nums in-place instead.",
      "        \"\"\"",
      "        # [1,2,3] [1,3,2] [2,1,3] [2,3,1] [3,1,2] [3,2,1]",
      " ",
      "        # 定位从右往左第一个升序对 (nums[i], nums[i + 1]),",
      "        # 在nums[i+1:]中取大于nums[i]的最小值, 将最小值与nums[i]交换.",
      "        # 然后翻转nums[i+1:].",
      "        n = len(nums)",
      "        exist = False",
      "        for i in range(n - 2, -1, -1):",
      "            # 定位升序对",
      "            if nums[i] < nums[i + 1]:",
      "                exist = True",
      "                # 在i右边找最小元素作为待交换的元素, 注意有重复时应选择右边的",
      "                min_j = i + 1",
      "                for j in range(i + 2, n):",
      "                    if nums[i] < nums[j] <= nums[min_j]:",
      "                        min_j = j",
      "                # 交换, 然后把i右边翻转",
      "                nums[i], nums[min_j] = nums[min_j], nums[i]",
      "                self.reverseNums(nums, i + 1, len(nums) - 1)",
      "                break",
      "",
      "        if not exist:",
      "            self.reverseNums(nums, 0, len(nums) - 1)"
    ].join("\n"),

    defaultInput: "nums = [1, 2, 3]",
    inputHint: "每行一个变量，格式如 nums = [1, 2, 3]",
    testInputs: ["nums = [3, 2, 1]", "nums = [1, 1, 5]"],
    expectedOutputs: ["[1,3,2]", "[1,2,3]", "[1,5,1]"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
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
      if (!Array.isArray(env.nums)) throw new Error("缺少 nums = [...]");
      return env;
    },

    run: function (input) {
      var nums = input.nums.slice();
      var steps = [];
      var n = nums.length;

      var numsView = function (highlights, ok, bad, pointers) {
        var v = { items: nums.slice(), showIndex: true };
        if (highlights) v.highlights = highlights;
        if (ok) v.ok = ok;
        if (bad) v.bad = bad;
        if (pointers) v.pointers = pointers;
        return v;
      };

      var varsView = function (extra) {
        var v = { n: n, exist: exist, i: i, min_j: min_j };
        if (extra) {
          for (var k in extra) v[k] = extra[k];
        }
        return v;
      };

      var exist = false, i = -1, min_j = -1;

      steps.push({
        line: 15, msg: "开始：求数组的下一个排列，当前 nums = [" + nums.join(", ") + "]。",
        views: {
          vars: { n: n, exist: false, i: null, min_j: null },
          nums: numsView(),
          pointers: { items: nums.slice(), showIndex: true }
        }
      });

      // 主循环：从右往左找第一个升序对
      for (i = n - 2; i >= 0; i--) {
        steps.push({
          line: 17, msg: "从右往左检查 i=" + i + "，比较 nums[" + i + "]=" + nums[i] + " 和 nums[" + (i+1) + "]=" + nums[i+1] + "。",
          views: {
            vars: varsView(),
            nums: numsView([i, i+1], null, null, { i: i, "i+1": i+1 }),
            pointers: { items: nums.slice(), highlights: [i, i+1], pointers: { i: i, "i+1": i+1 }, showIndex: true }
          }
        });

        if (nums[i] < nums[i + 1]) {
          exist = true;
          steps.push({
            line: 19, msg: "找到升序对：nums[" + i + "]=" + nums[i] + " < nums[" + (i+1) + "]=" + nums[i+1] + "，标记 exist=True。",
            views: {
              vars: varsView(),
              nums: numsView([i, i+1], [i, i+1], null, { i: i, "i+1": i+1 }),
              pointers: { items: nums.slice(), highlights: [i, i+1], ok: [i, i+1], pointers: { i: i, "i+1": i+1 }, showIndex: true }
            }
          });

          // 在 i 右边找大于 nums[i] 的最小元素
          min_j = i + 1;
          steps.push({
            line: 22, msg: "初始化 min_j=" + min_j + "，在 i 右边找大于 " + nums[i] + " 的最小元素。",
            views: {
              vars: varsView(),
              nums: numsView([i, min_j], null, null, { i: i, min_j: min_j }),
              pointers: { items: nums.slice(), highlights: [i, min_j], pointers: { i: i, min_j: min_j }, showIndex: true }
            }
          });

          for (var j = i + 2; j < n; j++) {
            steps.push({
              line: 24, msg: "检查 j=" + j + "，nums[" + j + "]=" + nums[j] + "，当前 min_j=" + min_j + "（nums[" + min_j + "]=" + nums[min_j] + "）。",
              views: {
                vars: varsView({ j: j }),
                nums: numsView([i, j, min_j], null, null, { i: i, j: j, min_j: min_j }),
                pointers: { items: nums.slice(), highlights: [i, j, min_j], pointers: { i: i, j: j, min_j: min_j }, showIndex: true }
              }
            });
            if (nums[i] < nums[j] && nums[j] <= nums[min_j]) {
              min_j = j;
              steps.push({
                line: 25, msg: "nums[" + j + "]=" + nums[j] + " 满足条件，更新 min_j=" + j + "。",
                views: {
                  vars: varsView({ j: j }),
                  nums: numsView([i, min_j], null, null, { i: i, min_j: min_j }),
                  pointers: { items: nums.slice(), highlights: [i, min_j], pointers: { i: i, min_j: min_j }, showIndex: true }
                }
              });
            }
          }

          // 交换 nums[i] 和 nums[min_j]
          var temp = nums[i];
          nums[i] = nums[min_j];
          nums[min_j] = temp;
          steps.push({
            line: 28, msg: "交换 nums[" + i + "]=" + nums[i] + " 和 nums[" + min_j + "]=" + nums[min_j] + "。",
            views: {
              vars: varsView(),
              nums: numsView([i, min_j], [i, min_j], null, { i: i, min_j: min_j }),
              pointers: { items: nums.slice(), highlights: [i, min_j], ok: [i, min_j], pointers: { i: i, min_j: min_j }, showIndex: true }
            }
          });

          // 翻转 i+1 到末尾
          var left = i + 1, right = n - 1;
          steps.push({
            line: 29, msg: "翻转 nums[" + left + ":] 区间，使后半部分变为升序。",
            views: {
              vars: varsView({ left: left, right: right }),
              nums: numsView([left, right], null, null, { left: left, right: right }),
              pointers: { items: nums.slice(), highlights: [left, right], pointers: { left: left, right: right }, showIndex: true }
            }
          });

          while (left < right) {
            var t = nums[left];
            nums[left] = nums[right];
            nums[right] = t;
            steps.push({
              line: 3, msg: "交换 nums[" + left + "]=" + nums[left] + " 和 nums[" + right + "]=" + nums[right] + "。",
              views: {
                vars: varsView({ left: left, right: right }),
                nums: numsView([left, right], [left, right], null, { left: left, right: right }),
                pointers: { items: nums.slice(), highlights: [left, right], ok: [left, right], pointers: { left: left, right: right }, showIndex: true }
              }
            });
            left++;
            right--;
            steps.push({
              line: 4, msg: "左指针右移、右指针左移：left=" + left + ", right=" + right + "。",
              views: {
                vars: varsView({ left: left, right: right }),
                nums: numsView([left, right], null, null, { left: left, right: right }),
                pointers: { items: nums.slice(), highlights: [left, right], pointers: { left: left, right: right }, showIndex: true }
              }
            });
          }

          steps.push({
            line: 30, msg: "翻转完成，得到下一个排列：[" + nums.join(", ") + "]。",
            views: {
              vars: varsView(),
              nums: numsView(null, null, null, null),
              pointers: { items: nums.slice(), showIndex: true }
            }
          });
          break;
        }
      }

      // 如果没有找到升序对，翻转整个数组
      if (!exist) {
        steps.push({
          line: 33, msg: "整个数组是降序的，没有下一个排列，翻转整个数组。",
          views: {
            vars: varsView(),
            nums: numsView(),
            pointers: { items: nums.slice(), showIndex: true }
          }
        });
        var l = 0, r = n - 1;
        while (l < r) {
          var tmp = nums[l];
          nums[l] = nums[r];
          nums[r] = tmp;
          steps.push({
            line: 3, msg: "交换 nums[" + l + "]=" + nums[l] + " 和 nums[" + r + "]=" + nums[r] + "。",
            views: {
              vars: varsView({ l: l, r: r }),
              nums: numsView([l, r], [l, r], null, { l: l, r: r }),
              pointers: { items: nums.slice(), highlights: [l, r], ok: [l, r], pointers: { l: l, r: r }, showIndex: true }
            }
          });
          l++;
          r--;
        }
        steps.push({
          line: 33, msg: "翻转完成，得到最小排列：[" + nums.join(", ") + "]。",
          views: {
            vars: varsView(),
            nums: numsView(),
            pointers: { items: nums.slice(), showIndex: true }
          }
        });
      }

      return { steps: steps, output: JSON.stringify(nums) };
    }
  };
})(typeof window !== "undefined" ? window : this);