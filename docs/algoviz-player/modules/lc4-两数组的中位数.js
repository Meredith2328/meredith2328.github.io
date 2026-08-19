(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc4-两数组的中位数"] = {
    title: "4 寻找两个正序数组的中位数 · 二分切割",
    language: "python",
    code: [
      "class Solution:",
      "    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:",
      "        # 在nums1某处切一刀, nums2某处切一刀",
      "        # 使得两刀左边整体都比右边整体小.",
      "",
      "        # 二分查找确定nums1要取的元素个数i, 然后左半部分元素个数应该恰好均分, 从而确定nums2要取的元素个数j.",
      "        # 假如数组长度是5+6，则左半总共6个.",
      "        # 假如数组长度是5+5, 则左半总共5个.",
      "        if len(nums1) > len(nums2):",
      "            nums1, nums2 = nums2, nums1",
      "        m, n = len(nums1), len(nums2)",
      "        # 左半的元素总数, 上取整, 从而使得中位数基本上落入左半边",
      "        total_left = (m + n + 1) // 2",
      "",
      "        l, r = 0, m # i最少取0个, 最多取m个, 要确定所取个数",
      "        while l <= r:",
      "            i = (l + r) // 2",
      "            j = total_left - i",
      "            lmax_1 = float('-inf') if i == 0 else nums1[i - 1]",
      "            rmin_1 = float('inf') if i == m else nums1[i]",
      "            lmax_2 = float('-inf') if j == 0 else nums2[j - 1]",
      "            rmin_2 = float('inf') if j == n else nums2[j]",
      "",
      "            if lmax_1 <= rmin_2 and lmax_2 <= rmin_1: # 已找到",
      "                if not (m + n) % 2:",
      "                    return (max(lmax_1, lmax_2) + min(rmin_1, rmin_2)) / 2",
      "                else:",
      "                    return max(lmax_1, lmax_2)",
      "",
      "            elif lmax_1 > rmin_2:",
      "                r = i - 1",
      "            else:",
      "                l = i + 1",
      "",
      "        return 0"
    ].join("\n"),

    defaultInput: "nums1 = [1, 3]\nnums2 = [2]",
    inputHint: "每行一个变量，格式如 nums1 = [1, 3] / nums2 = [2]",
    testInputs: [
      "nums1 = [1, 2]\nnums2 = [3, 4]",
      "nums1 = [0, 0]\nnums2 = [0, 0]"
    ],
    expectedOutputs: [
      "2.0",
      "2.5",
      "0.0"
    ],

    views: {
      vars: { type: "vars", title: "变量" },
      nums1: { type: "array", title: "nums1" },
      nums2: { type: "array", title: "nums2" },
      cuts: { type: "bars", title: "切割位置" }
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
      if (!Array.isArray(env.nums1)) throw new Error("缺少 nums1 = [...]");
      if (!Array.isArray(env.nums2)) throw new Error("缺少 nums2 = [...]");
      return env;
    },

    run: function (input) {
      var nums1 = input.nums1.slice();
      var nums2 = input.nums2.slice();
      var steps = [];
      var swapped = false;

      var m, n, total_left, l, r, i, j, lmax_1, rmin_1, lmax_2, rmin_2;
      m = nums1.length; n = nums2.length;
      total_left = (m + n + 1) >> 1;
      l = 0; r = m;
      i = 0; j = 0;
      lmax_1 = -Infinity; rmin_1 = Infinity; lmax_2 = -Infinity; rmin_2 = Infinity;

      var varsView = function (extra) {
        var o = {
          m: m, n: n, total_left: total_left,
          l: l, r: r, i: i, j: j,
          lmax_1: lmax_1 === -Infinity ? "-∞" : lmax_1,
          rmin_1: rmin_1 === Infinity ? "+∞" : rmin_1,
          lmax_2: lmax_2 === -Infinity ? "-∞" : lmax_2,
          rmin_2: rmin_2 === Infinity ? "+∞" : rmin_2
        };
        for (var k in extra) o[k] = extra[k];
        return o;
      };

      var cutsView = function (iVal, jVal) {
        var bars = [];
        var minVal = 0, maxVal = 0;
        if (nums1.length > 0) { minVal = nums1[0]; maxVal = nums1[nums1.length-1]; }
        if (nums2.length > 0) {
          if (nums2[0] < minVal) minVal = nums2[0];
          if (nums2[nums2.length-1] > maxVal) maxVal = nums2[nums2.length-1];
        }
        if (nums1.length > 0) {
          bars.push({ start: minVal, end: iVal > 0 ? nums1[iVal-1] : minVal, label: "nums1左", status: "ok" });
          if (iVal < nums1.length) bars.push({ start: nums1[iVal], end: maxVal, label: "nums1右", status: "bad" });
        }
        if (nums2.length > 0) {
          bars.push({ start: minVal, end: jVal > 0 ? nums2[jVal-1] : minVal, label: "nums2左", status: "ok" });
          if (jVal < nums2.length) bars.push({ start: nums2[jVal], end: maxVal, label: "nums2右", status: "bad" });
        }
        return { bars: bars, axis: { min: minVal, max: maxVal, ticks: [minVal, maxVal] } };
      };

      steps.push({
        line: 10, msg: "开始：nums1=" + JSON.stringify(nums1) + "，nums2=" + JSON.stringify(nums2) + "。",
        views: {
          vars: varsView({}),
          nums1: { items: nums1.slice() },
          nums2: { items: nums2.slice() },
          cuts: cutsView(0, 0)
        }
      });

      if (nums1.length > nums2.length) {
        var tmp = nums1; nums1 = nums2; nums2 = tmp;
        swapped = true;
        m = nums1.length; n = nums2.length;
        total_left = (m + n + 1) >> 1;
        l = 0; r = m;
        steps.push({
          line: 10, msg: "nums1 比 nums2 长，交换两者，保证 nums1 较短。",
          views: {
            vars: varsView({}),
            nums1: { items: nums1.slice() },
            nums2: { items: nums2.slice() },
            cuts: cutsView(0, 0)
          }
        });
      }

      steps.push({
        line: 11, msg: "m=" + m + "，n=" + n + "。",
        views: {
          vars: varsView({}),
          nums1: { items: nums1.slice() },
          nums2: { items: nums2.slice() },
          cuts: cutsView(0, 0)
        }
      });

      steps.push({
        line: 13, msg: "左半元素总数 total_left = (m+n+1)//2 = " + total_left + "。",
        views: {
          vars: varsView({}),
          nums1: { items: nums1.slice() },
          nums2: { items: nums2.slice() },
          cuts: cutsView(0, 0)
        }
      });

      steps.push({
        line: 15, msg: "二分查找范围：l=0，r=m=" + m + "。",
        views: {
          vars: varsView({}),
          nums1: { items: nums1.slice() },
          nums2: { items: nums2.slice() },
          cuts: cutsView(0, 0)
        }
      });

      var result = 0;

      while (l <= r) {
        i = (l + r) >> 1;
        j = total_left - i;

        steps.push({
          line: 17, msg: "取 i=" + i + "，则 j=" + j + "。",
          views: {
            vars: varsView({}),
            nums1: { items: nums1.slice(), highlights: i > 0 ? [i-1] : [], pointers: { cut: i } },
            nums2: { items: nums2.slice(), highlights: j > 0 ? [j-1] : [], pointers: { cut: j } },
            cuts: cutsView(i, j)
          }
        });

        lmax_1 = (i === 0) ? -Infinity : nums1[i - 1];
        rmin_1 = (i === m) ? Infinity : nums1[i];
        lmax_2 = (j === 0) ? -Infinity : nums2[j - 1];
        rmin_2 = (j === n) ? Infinity : nums2[j];

        steps.push({
          line: 19, msg: "lmax_1=" + (lmax_1 === -Infinity ? "-∞" : lmax_1) + "，rmin_1=" + (rmin_1 === Infinity ? "+∞" : rmin_1) + "。",
          views: {
            vars: varsView({}),
            nums1: { items: nums1.slice(), highlights: i > 0 ? [i-1] : [], pointers: { cut: i } },
            nums2: { items: nums2.slice(), highlights: j > 0 ? [j-1] : [], pointers: { cut: j } },
            cuts: cutsView(i, j)
          }
        });

        steps.push({
          line: 20, msg: "lmax_2=" + (lmax_2 === -Infinity ? "-∞" : lmax_2) + "，rmin_2=" + (rmin_2 === Infinity ? "+∞" : rmin_2) + "。",
          views: {
            vars: varsView({}),
            nums1: { items: nums1.slice(), highlights: i > 0 ? [i-1] : [], pointers: { cut: i } },
            nums2: { items: nums2.slice(), highlights: j > 0 ? [j-1] : [], pointers: { cut: j } },
            cuts: cutsView(i, j)
          }
        });

        if (lmax_1 <= rmin_2 && lmax_2 <= rmin_1) {
          steps.push({
            line: 22, msg: "满足 lmax_1 ≤ rmin_2 且 lmax_2 ≤ rmin_1，切割位置正确！",
            views: {
              vars: varsView({}),
              nums1: { items: nums1.slice(), ok: i > 0 ? [i-1] : [], highlights: i > 0 ? [i-1] : [] },
              nums2: { items: nums2.slice(), ok: j > 0 ? [j-1] : [], highlights: j > 0 ? [j-1] : [] },
              cuts: cutsView(i, j)
            }
          });
          if ((m + n) % 2 === 0) {
            result = (Math.max(lmax_1, lmax_2) + Math.min(rmin_1, rmin_2)) / 2;
            steps.push({
              line: 23, msg: "总长度是偶数，中位数 = (max(" + (lmax_1 === -Infinity ? "-∞" : lmax_1) + "," + (lmax_2 === -Infinity ? "-∞" : lmax_2) + ") + min(" + (rmin_1 === Infinity ? "+∞" : rmin_1) + "," + (rmin_2 === Infinity ? "+∞" : rmin_2) + ")) / 2 = " + result + "。",
              views: {
                vars: varsView({ "返回值": result }),
                nums1: { items: nums1.slice(), ok: i > 0 ? [i-1] : [] },
                nums2: { items: nums2.slice(), ok: j > 0 ? [j-1] : [] },
                cuts: cutsView(i, j)
              }
            });
            steps.push({
              line: 24, msg: "返回 " + result + "。",
              views: {
                vars: varsView({ "返回值": result }),
                nums1: { items: nums1.slice(), ok: i > 0 ? [i-1] : [] },
                nums2: { items: nums2.slice(), ok: j > 0 ? [j-1] : [] },
                cuts: cutsView(i, j)
              }
            });
            return { steps: steps, output: result.toFixed(1) };
          } else {
            result = Math.max(lmax_1, lmax_2);
            steps.push({
              line: 26, msg: "总长度是奇数，中位数 = max(" + (lmax_1 === -Infinity ? "-∞" : lmax_1) + ", " + (lmax_2 === -Infinity ? "-∞" : lmax_2) + ") = " + result + "。",
              views: {
                vars: varsView({ "返回值": result }),
                nums1: { items: nums1.slice(), ok: i > 0 ? [i-1] : [] },
                nums2: { items: nums2.slice(), ok: j > 0 ? [j-1] : [] },
                cuts: cutsView(i, j)
              }
            });
            steps.push({
              line: 27, msg: "返回 " + result + "。",
              views: {
                vars: varsView({ "返回值": result }),
                nums1: { items: nums1.slice(), ok: i > 0 ? [i-1] : [] },
                nums2: { items: nums2.slice(), ok: j > 0 ? [j-1] : [] },
                cuts: cutsView(i, j)
              }
            });
            return { steps: steps, output: result.toFixed(1) };
          }
        } else if (lmax_1 > rmin_2) {
          steps.push({
            line: 29, msg: "lmax_1 > rmin_2，nums1 取多了，向左调整：r = i - 1 = " + (i - 1) + "。",
            views: {
              vars: varsView({}),
              nums1: { items: nums1.slice(), highlights: i > 0 ? [i-1] : [], bad: i > 0 ? [i-1] : [] },
              nums2: { items: nums2.slice(), highlights: j < n ? [j] : [], bad: j < n ? [j] : [] },
              cuts: cutsView(i, j)
            }
          });
          r = i - 1;
        } else {
          steps.push({
            line: 31, msg: "lmax_2 > rmin_1，nums1 取少了，向右调整：l = i + 1 = " + (i + 1) + "。",
            views: {
              vars: varsView({}),
              nums1: { items: nums1.slice(), highlights: i < m ? [i] : [], bad: i < m ? [i] : [] },
              nums2: { items: nums2.slice(), highlights: j > 0 ? [j-1] : [], bad: j > 0 ? [j-1] : [] },
              cuts: cutsView(i, j)
            }
          });
          l = i + 1;
        }
      }

      steps.push({
        line: 33, msg: "循环结束，未找到合适切割（不应发生），返回 0。",
        views: {
          vars: varsView({ "返回值": 0 }),
          nums1: { items: nums1.slice() },
          nums2: { items: nums2.slice() },
          cuts: cutsView(i, j)
        }
      });
      return { steps: steps, output: "0.0" };
    }
  };
})(typeof window !== "undefined" ? window : this);