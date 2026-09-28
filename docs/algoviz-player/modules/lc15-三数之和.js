(function (global) {
  global.AlgoVizModules = global.AlgoVizModules || {};

  global.AlgoVizModules["lc15-三数之和"] = {
    title: "15 三数之和 · 暴力+哈希",
    link: "https://leetcode.cn/problems/3sum/",
    language: "python",
    code: [
      "class Solution:",
      "    def threeSum(self, nums: List[int]) -> List[List[int]]:",
      "        res = []",
      "        # 对于给定的nums[k], 相当于两数之和.",
      "        for k, num in enumerate(nums):",
      "            # 值到下标的map, 因为要返回下标",
      "            adict = {}",
      "            for i, num_i in enumerate(nums):",
      "                if i == k:",
      "                    continue",
      "                val_list = tuple(sorted([num, num_i, -num - num_i]))",
      "                if -num - num_i in adict:",
      "                    res.append(val_list)",
      "                adict[num_i] = i",
      "                ",
      "        # 去重",
      "        res = list(set(res))",
      "        return res"
    ].join("\n"),

    defaultInput: "nums = [-1, 0, 1, 2, -1, -4]",
    inputHint: "每行一个变量，格式如 nums = [-1, 0, 1, 2, -1, -4]",
    testInputs: ["nums = [0, 0, 0]", "nums = [1, 2, -3, 0]"],
    expectedOutputs: ["[[-1, 0, 1], [-1, -1, 2]]", "[[0, 0, 0]]", "[[-3, 1, 2]]"],

    views: {
      vars: { type: "vars", title: "变量" },
      nums: { type: "array", title: "nums" },
      hash: { type: "vars", title: "哈希表 adict" },
      res: { type: "array", title: "res" }
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
      var res = [];
      var resView = function (hotIdx) {
        var items = res.map(function (t) { return t.slice(); });
        var highlights = [];
        if (hotIdx != null && hotIdx >= 0 && hotIdx < items.length) highlights.push(hotIdx);
        return { items: items, highlights: highlights };
      };
      var hashView = function (hotKey) {
        var o = {};
        Object.keys(adict).forEach(function (k) { o[k] = adict[k]; });
        if (hotKey != null && o[hotKey] !== undefined) o[hotKey] = { value: o[hotKey], __hot: true };
        return o;
      };

      steps.push({
        line: 3, msg: "开始：初始化结果列表 res 为空。",
        views: {
          vars: { k: null, num: null, i: null, num_i: null, "val_list": null },
          nums: { items: nums.slice() },
          hash: {},
          res: resView()
        }
      });

      for (var k = 0; k < nums.length; k++) {
        var num = nums[k];
        var adict = {};
        steps.push({
          line: 5, msg: "外层循环：k=" + k + "，固定元素 num=" + num + "，问题转化为两数之和。",
          views: {
            vars: { k: k, num: num, i: null, num_i: null, "val_list": null },
            nums: { items: nums.slice(), highlights: [k], pointers: { k: k } },
            hash: {},
            res: resView()
          }
        });

        steps.push({
          line: 6, msg: "初始化哈希表 adict 为空。",
          views: {
            vars: { k: k, num: num, i: null, num_i: null, "val_list": null },
            nums: { items: nums.slice(), highlights: [k], pointers: { k: k } },
            hash: {},
            res: resView()
          }
        });

        for (var i = 0; i < nums.length; i++) {
          var num_i = nums[i];
          steps.push({
            line: 7, msg: "内层循环：i=" + i + "，当前元素 num_i=" + num_i + "。",
            views: {
              vars: { k: k, num: num, i: i, num_i: num_i, "val_list": null },
              nums: { items: nums.slice(), highlights: [k, i], pointers: { k: k, i: i } },
              hash: hashView(),
              res: resView()
            }
          });

          if (i === k) {
            steps.push({
              line: 8, msg: "i 等于 k，跳过自身，避免重复使用同一个元素。",
              views: {
                vars: { k: k, num: num, i: i, num_i: num_i, "val_list": null },
                nums: { items: nums.slice(), highlights: [k, i], bad: [i], pointers: { k: k, i: i } },
                hash: hashView(),
                res: resView()
              }
            });
            continue;
          }

          var need = -num - num_i;
          var val_list = [num, num_i, need].sort(function (a, b) { return a - b; });
          steps.push({
            line: 9, msg: "计算第三个需要的数 need=" + need + "，三元组排序后为 [" + val_list.join(", ") + "]。",
            views: {
              vars: { k: k, num: num, i: i, num_i: num_i, "val_list": val_list, "need": need },
              nums: { items: nums.slice(), highlights: [k, i], pointers: { k: k, i: i } },
              hash: hashView(),
              res: resView()
            }
          });

          if (need in adict) {
            res.push(val_list);
            steps.push({
              line: 10, msg: "需要的数 " + need + " 在哈希表中（下标 " + adict[need] + "），找到一组解，加入 res。",
              views: {
                vars: { k: k, num: num, i: i, num_i: num_i, "val_list": val_list, "need": need },
                nums: { items: nums.slice(), highlights: [k, adict[need], i], ok: [k, adict[need], i], pointers: { k: k, i: i } },
                hash: hashView(String(need)),
                res: resView(res.length - 1)
              }
            });
          }

          adict[num_i] = i;
          steps.push({
            line: 11, msg: "把 " + num_i + " -> " + i + " 存入哈希表。",
            views: {
              vars: { k: k, num: num, i: i, num_i: num_i, "val_list": val_list, "need": need },
              nums: { items: nums.slice(), highlights: [k, i], pointers: { k: k, i: i } },
              hash: hashView(String(num_i)),
              res: resView()
            }
          });
        }
      }

      // 去重
      var seen = {};
      var uniqueRes = [];
      for (var r = 0; r < res.length; r++) {
        var key = res[r].join(",");
        if (!seen[key]) {
          seen[key] = true;
          uniqueRes.push(res[r]);
        }
      }
      res = uniqueRes;

      steps.push({
        line: 14, msg: "去重后，最终结果共有 " + res.length + " 组三元组。",
        views: {
          vars: { "最终结果": res },
          nums: { items: nums.slice() },
          hash: {},
          res: resView()
        }
      });

      steps.push({
        line: 15, msg: "返回最终结果。",
        views: {
          vars: { "返回值": res },
          nums: { items: nums.slice() },
          hash: {},
          res: resView()
        }
      });

      return { steps: steps, output: JSON.stringify(res).replace(/,/g, ", ") };
    }
  };
})(typeof window !== "undefined" ? window : this);