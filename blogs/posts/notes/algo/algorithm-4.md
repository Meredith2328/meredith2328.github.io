---
title: 数据结构与算法 · 04 · LeetCode HOT 100 in Python（前50）
date: 2026-03-02 11:36:27
tags:
- 数据结构与算法
published: true
hideInList: false
feature: null
isTop: false
chapters_per_page: 1
---
哈希，双指针，滑动窗口，子串，数组，矩阵，链表，二叉树，图。

<!-- more -->

![](posts/migrated/post-images/20260302113711.png)

专题1 哈希
需要什么就哈希记录什么。
专题2 双指针
对双指针的理解是：两个指针向中间收缩的问题，收缩的一般是“不收缩的话，后续搜索得到的解均不符合题意”的那个指针。
专题3 滑动窗口
滑动窗口往往是把右边延长到满足条件，之后把左边收缩到差点不满足条件。
专题4 子串
专题5 数组
专题6 矩阵
专题7 链表
链表的一个重要工具是prev指针，用于指示前一个节点。
专题8 二叉树
专题9 图

### 专题一 哈希

1 两数之和

需要返回索引，所以记录索引。

在遍历的同时，将已遍历过的元素索引记录在哈希表中，即可确定与当前元素组成两数之和的数是否存在。

```
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        d = {} # 从val到i的map
        for i, val in enumerate(nums):
            if (target - val) in d:
                return [i, d[target - val]]
            d[val] = i
```

49 字母异位词分组

相当于把所有字符串s按照sorted(s)分组。

```
class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        group = {}
        for s in strs:
            sorted_s = ''.join(sorted(s))
            if sorted_s not in group:
                group[sorted_s] = [s]
            else:
                group[sorted_s].append(s)

        return list(group.values())
```

128 最长连续序列

要通过一次遍历确定最长连续序列。方法是以每个元素开始，依次看它递增的这些元素是否在集合中。

剪枝：只判断连续序列的开头，即num - 1不在集合中。

由于各个连续序列长度总和不会超过整个列表长度，两层循环对各个元素的迭代总和是O(n)的。

```
class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        num_set = set(nums)
        sz = 0
        for num in num_set:
            # 剪枝: 只判断连续序列的开头元素.
            if num - 1 in num_set:
                continue
            cur_sz = 1
            cur_num = num + 1
            while cur_num in num_set:
                cur_sz += 1
                cur_num += 1
            sz = max(sz, cur_sz)
        return sz
```

### 专题二 双指针

283 移动零

两侧两个指针，一个负责寻找非0元素，一个负责记录0元素的位置。

实际上使用一个指针应该也可以，两个指针只是为了方便我们确定指针交换元素已经处理了前面所有的元素，后面的都是我们添加上去的0。

双指针注意数组边界条件。

```
class Solution:
    def moveZeroes(self, nums: List[int]) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        sz = len(nums)
        if sz == 1:
            return
        i, j = 0, sz - 1
        while (i < j) and (i < sz) and (j >= 0):
            while i < sz and nums[i] != 0:
                i += 1
            while j >= 0 and nums[j] == 0:
                j -= 1
            if i < j:
                # 如果不需要保持其他元素的顺序, 把下面两行换成 nums[i], nums[j] = nums[j], nums[i]即可
                nums.pop(i)
                nums.append(0)
```

11 盛最多水的容器

当前容器的面积取决于两侧高度中更短的那个。

我们每次移动两侧中高度较低的那个指针，一定能覆盖到面积最大的那个解。证明如下：

初始取距离最大。

我们的距离是从大到小的。每当缩短距离时，只有高度变大，才可能面积比原来大。因此只有移动高度较低的那个指针得到的可能性是我们需要考虑的，_移动高度较高的那个指针的可能性一定可以排除_。

（缩短搜索空间）

由上述“剪枝”，事实上高效地完成了答案的搜索。

```
class Solution:
    def maxArea(self, height: List[int]) -> int:
        sz = len(height)
        max_area = 0
        i, j = 0, sz - 1
        while i < j:
            cur_area = min(height[i], height[j]) * (j - i)
            max_area = max(max_area, cur_area)
            if height[i] < height[j]:
                i += 1
            else:
                j -= 1

        return max_area
```

15 三数之和

貌似可以转化成两数之和的问题，

按说是O(n²)，但是TLE。

```
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        res = []
        # 对于给定的nums[k], 相当于两数之和.
        for k, num in enumerate(nums):
            # 值到下标的map, 因为要返回下标
            adict = {}
            for i, num_i in enumerate(nums):
                if i == k:
                    continue
                val_list = tuple(sorted([num, num_i, -num - num_i]))
                if -num - num_i in adict:
                    res.append(val_list)
                adict[num_i] = i
                
        # 去重
        res = list(set(res))
        return res
```

考虑到相当于是三重循环优化到O(n²)，我们大可直接做一个排序，然后再考虑这样的问题：

对于某个特定的数nums[i]，我们可以用l和r两个指针从两侧往中间搜索满足条件的数，很像上一道11题的缩减搜索空间：如果三数之和大于0，则收缩大的数。

双指针需要仔细处理边界条件：跳出、越界。

```
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        # 固定一个左指针, 从右往左拉, 如果能重合则左指针以后的情况全部剪枝
        nums.sort()
        n = len(nums)
        res = []
        for k in range(n):
            # 遍历的数不能重复
            if (k > 0 and nums[k] == nums[k - 1]):
                continue
            target = -nums[k]
            j = n - 1 # 玄妙: 对于更大的i, 一定不需要已遍历过的j
            for i in range(k + 1, n):
                if (i > k+1 and nums[i] == nums[i - 1]):
                    continue
                while (i < j and nums[i] + nums[j] > target):
                       j -= 1
                       if i == j:
                       break
                       if nums[i] + nums[j] == target:
                       res.append([nums[i], nums[j], nums[k]])
                       return res
```

42 接雨水

![](posts/migrated/post-images/20260302113945.png)

```
class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        res = 0
        # dp存储每个位置的lmax, rmax
        # 通过从左往右和从右往左两次遍历便捷实现
        lmax, rmax = [0] * n, [0] * n
        lmax[0] = height[0]
        for i in range(1, n):
            lmax[i] = max(height[i], lmax[i - 1])
        rmax[n-1] = height[n-1]
        for i in range(n-2, -1, -1):
            rmax[i] = max(height[i], rmax[i + 1])
        # 根据高度差得到每个位置接的雨水
        for i in range(n):
            min_max = min(lmax[i], rmax[i])
            if min_max > height[i]:
                res += min_max - height[i]
        return res
```

这个dp可以优化为双指针，从两边往中间收缩，只使用常数空间边遍历边累加结果。

```
class Solution:
    def trap(self, height: List[int]) -> int:
        ans = 0
        left, right = 0, len(height) - 1
        leftMax = rightMax = 0

        while left < right:
            leftMax = max(leftMax, height[left])
            rightMax = max(rightMax, height[right])
            if height[left] < height[right]:
                ans += leftMax - height[left]
                left += 1
            else:
                ans += rightMax - height[right]
                right -= 1

        return ans
```

### 专题三 滑动窗口

3 无重复字符的最长子串

```
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # eg. abcabcbb
        # 滑动窗口: l始终从左往右移动.
        # 对于当前的l, r向右延伸试探, 如果添加了新的元素之后出现了重复, 则将l向右收缩直到无重复.
        n = len(s)
        if n == 0:
            return 0

        l, r = 0, 0
        res = 1
        alphabet = [s[0]]
        while l < n:
            r += 1
            if r == n:
                break
            while l < n and s[r] in alphabet:
                alphabet.remove(s[l])
                l += 1
            if l > r or l == n:
                break
            alphabet.append(s[r])
            res = max(res, r - l + 1)
        return res
```

438 找到字符串中所有字母异位词

字母异位词还是通过统计字母频率的方式去做。

```
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        # 最简单的思路是遍历所有子串进行对比.
        n, m = len(s), len(p)
        p = sorted(p)
        res = []
        for l in range(n - m + 1):
            if sorted(s[l:l+m]) == p:
                res.append(l)
        return res
```

更好的思路应该是统计滑动窗口和子串每种字母的个数.（异位词使用字母个数）

```
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        n, m, res = len(s), len(p), []
        if n < m:
            return res
        p_cnt = [0] * 200
        s_cnt = [0] * 200

        for i in range(m):
            p_cnt[ord(p[i])] += 1

        l = 0
        for r in range(n):
            # 添加右边的字母, 删掉左边的
            cur_r = ord(s[r])
            s_cnt[cur_r] += 1
            while (s_cnt[cur_r] > p_cnt[cur_r]):
                cur_l = ord(s[l])
                s_cnt[cur_l] -= 1
                l += 1
            if (r - l + 1) == m:
                # s_cnt和p_cnt完全相同
                res.append(l)
        return res
```

### 专题四 子串

560 和为 K 的子数组

最容易想到的是遍历全部子数组。当然，过不了用例。

```
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        n, res = len(nums), 0
        for i in range(n):
            for j in range(i, n):
                if sum(nums[i:j+1]) == k:
                    res += 1
        return res
```

接下来考虑转化为前缀和的差分问题。

对于前缀和，注意比原数组多一项 `s[0] = 0`。

对于差分问题，一定要想到是：“曾经有多少个”，而不能把当前数本身加进来。即**先计数、再加入**。

```
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        # 首先计算前缀和数组. 注意前缀和数组比原数组多一项s[0] = 0.
        s = [0] * (len(nums) + 1)
        for i, x in enumerate(nums):
            s[i + 1] = s[i] + x
        
        adict = defaultdict(int)
        res = 0
        for sj in s:
            # 注意枚举的是"曾经有过多少个sj - k"
            # 所以应该先加res, 而不能把sj本身计入
            res += adict[sj - k]
            adict[sj] += 1
        return res
```

239 滑动窗口最大值

方法一当然是模拟。然后方法二再考虑处理窗口差分。

```
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        # 方法一当然是模拟.
        res, n = [], len(nums)
        for i in range(n):
            j = i + k
            if j > n:
                break
            res.append(max(nums[i:j]))
        return res
```

TODO

76 最小覆盖子串

新语法：Counter，相当于一个dict，用于计数某个字符串. `<=`非常方便涵盖。

```
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        # 代码其实很直接.
        # 两个Counter利用>=处理"包含, 包括重复字符",
        # 伸展滑动窗口右指针, 如果成功包含, 则缩短左指针直到最小.
        cnt_s = Counter()
        cnt_t = Counter(t)

        ans_left, ans_right = -1, len(s) # 找到最短
        left = 0
        for right, c in enumerate(s):
            cnt_s[c] += 1
            while cnt_s >= cnt_t: # 涵盖
                if right - left < ans_right - ans_left:
                    ans_left, ans_right = left, right
                cnt_s[s[left]] -= 1
                left += 1
        return "" if ans_left < 0 else s[ans_left: ans_right + 1]
```

### 专题五 数组

53 最大子数组和

（解法一 前缀和）

要找到哪一段的和最大，首先转换成前缀和，

然后相当于求最大的差分。

一种思路是，固定当前的数，但是被减去的数维护为最小，这样遍历一遍即可得到最大的差分。

```
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        s = [0] * (len(nums) + 1)
        for i, num in enumerate(nums):
            s[i+1] = s[i] + num
        maxval = -2147483647
        minval = 2147483647
        for i in range(1, len(nums) + 1):
            if s[i-1] < minval:
                minval = s[i-1]
            val = s[i] - minval
            if val > maxval:
                maxval = val
        return maxval
```

（解法二 动态规划）

选择：连续段要么是新元素加上前面的一段，要么是新元素另起炉灶、不加上前面的一段。

只有这两种选择，取决于前面的一段是否是“拖油瓶”。

```
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        n = len(nums)
        dp = [0] * (n + 1)
        dp[0] = nums[0]
        maxval = dp[0]

        for i in range(1, n):
            # 新元素一定被选择. 选择是是否包含前面的: 如果是拖油瓶(负值), 则轻装上阵.
            dp[i] = max(dp[i-1]+nums[i], nums[i])
            maxval = max(maxval, dp[i])
        return maxval
```

除此之外，这个动态规划由于每个元素都只取决于前一个，所以可以把数组优化为只用一个变量存储。

```
class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        n = len(nums)
        dp = nums[0]
        maxval = dp

        for i in range(1, n):
            # 新元素一定被选择. 选择是是否包含前面的: 如果是拖油瓶(负值), 则轻装上阵.
            dp = max(dp+nums[i], nums[i])
            maxval = max(maxval, dp)
        return maxval
```

56 合并区间

当我们按照左端点排序后，

可以合并的区间一定是连续的。

从而可以方便地通过遍历确定合并还是添加。

```
class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        intervals.sort(key=lambda x: x[0])
        res = []
        l, r = intervals[0][0], intervals[0][1]
        for i in range(1, len(intervals)):
            if intervals[i][0] > r:
                # 无法合并, 更新为新区间
                res.append([l, r])
                l, r = intervals[i][0], intervals[i][1]
            else:
                # 可以合并, 更新右端点
                r = max(r, intervals[i][1])
        if [l,r] not in res:
            res.append([l,r])
        return res
```

189 轮转数组

直接模拟。

```
class Solution:
    def rotate(self, nums: List[int], k: int) -> None:
        """
        Do not return anything, modify nums in-place instead.
        """
        new_nums = []
        mod_k = len(nums) - (k % len(nums))
        for num in nums[mod_k:]:
            new_nums.append(num)
        for num in nums[:mod_k]:
            new_nums.append(num)
        for i, num in enumerate(new_nums):
            nums[i] = num
```

238 除了自身以外数组的乘积

某个元素右边的乘积 等于 它右边的元素值 乘以 它右边的元素存的乘积。

```
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        # a = [1, 2, 3, 4]
        n = len(nums)
        right = [1] * n
        for i in range(n-2, -1, -1):
            right[i] = right[i+1] * nums[i+1]
        left = [1] * n
        for i in range(1, n):
            left[i] = left[i-1] * nums[i-1]

        res = [1] * n
        for i in range(n):
            res[i] *= left[i] * right[i]
        return res
```

41 缺失的第一个正数

这里问题在于需要在常数空间做哈希。

所以考虑把原来的数本身作为哈希：它的数值作为哈希索引，目标是把相应的数变为负值。

过不了用例版：

```
class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        for i in range(1, len(nums) + 2):
            if i not in nums:
                return i
```

可以过用例版：

（不熟练，请练习一下）

```
class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        n = len(nums)
        # 清除负值
        for i in range(n):
            if nums[i] <= 0:
                nums[i] = n + 1

        # 利用正值进行负值哈希
        for i in range(n):
            num = abs(nums[i])
            if num <= n:
                nums[num - 1] = -abs(nums[num - 1])

        # 第一个不是负值
        for i in range(n):
            if nums[i] > 0:
                return i + 1

        # 按顺序全部有, 那就肯定是更大的
        return n + 1
```

### 专题六 矩阵

73 矩阵置零

最基础的空间O(mn)的思路是把(row, col)保存下来，然后模拟。

```
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """
        waitlist = []
        for i in range(len(matrix)):
            for j in range(len(matrix[0])):
                if matrix[i][j] == 0:
                    waitlist.append((i,j))

        for row, col in waitlist:
            for j in range(len(matrix[0])):
                matrix[row][j] = 0
            for i in range(len(matrix)):
                matrix[i][col] = 0
```

然后并不需要保存所有坐标、而是只需要确定哪些行和哪些列需要清零。这样的话空间O(m+n)。

```
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """
        rows = [0] * len(matrix)
        cols = [0] * len(matrix[0])

        for i in range(len(rows)):
            for j in range(len(cols)):
                if matrix[i][j] == 0:
                    rows[i], cols[j] = 1, 1

        for i in range(len(rows)):
            if rows[i] != 0:
                for j in range(len(cols)):
                    matrix[i][j] = 0

        for j in range(len(cols)):
            if cols[j] != 0:
                for i in range(len(rows)):
                    matrix[i][j] = 0
```

那么受到之前的原地哈希的启发，我们当然可以通过第一行取零，原地保存哪些行和哪些列需要清零。

然后第一行好第一列原来需不需要清零可以用两个布尔变量保存。

```
class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        m, n = len(matrix), len(matrix[0])
        first_row_has_zero = 0 in matrix[0]  # 记录第一行是否包含 0
        first_col_has_zero = any(row[0] == 0 for row in matrix)  # 记录第一列是否包含 0

        # 用第一列 matrix[i][0] 保存 row_has_zero[i]
        # 用第一行 matrix[0][j] 保存 col_has_zero[j]
        for i in range(1, m):  # 无需遍历第一行，如果 matrix[0][j] 本身是 0，那么相当于 col_has_zero[j] 已经是 True
            for j in range(1, n):  # 无需遍历第一列，如果 matrix[i][0] 本身是 0，那么相当于 row_has_zero[i] 已经是 True
                if matrix[i][j] == 0:
                    matrix[i][0] = 0  # 相当于 row_has_zero[i] = True
                    matrix[0][j] = 0  # 相当于 col_has_zero[j] = True

        for i in range(1, m):  # 跳过第一行，留到最后修改
            for j in range(1, n):  # 跳过第一列，留到最后修改
                if matrix[i][0] == 0 or matrix[0][j] == 0:  # i 行或 j 列有 0
                    matrix[i][j] = 0

        # 如果第一列一开始就包含 0，那么把第一列全变成 0
        if first_col_has_zero:
            for row in matrix:
                row[0] = 0

        # 如果第一行一开始就包含 0，那么把第一行全变成 0
        if first_row_has_zero:
            for j in range(n):
                matrix[0][j] = 0
```

54 螺旋矩阵

注意：创建矩阵时不能用 `m * [n * [0]]`，不然会创建多个指向同一列表的列表。

```
class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        m, n = len(matrix), len(matrix[0])
        visited = [n * [0] for _ in range(m)]

        # 顺时针
        dx = [0, 1, 0, -1]
        dy = [1, 0, -1, 0]
        x, y = 0, 0
        d = 0
        res = []

        for _ in range(m * n):
            res.append(matrix[x][y])
            visited[x][y] = 1

            # 行, 列
            nx, ny = x + dx[d], y + dy[d]
            if (0 <= nx < m) and (0 <= ny < n) and (not visited[nx][ny]):
                x, y = nx, ny
            else:
                d = (d + 1) % 4
                x, y = x + dx[d], y + dy[d]

        return res
```

48 旋转图像

```
class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """
        # 顺时针90度
        # 等于主轴对称+左右对称
        n = len(matrix)
        for i in range(n):
            for j in range(i):
                matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]

        for i in range(n):
            for j in range(int(n / 2)):
                matrix[i][j], matrix[i][n - j - 1] = matrix[i][n - j - 1], matrix[i][j]
```

240 搜索二维矩阵 II

可以对每一行进行二分查找。（bisect.bisect_left）

```
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        for row in matrix:
            idx = bisect.bisect_left(row, target)
            if idx < len(row) and row[idx] == target:
                return True
        return False
```

也可以借助一个点在左下或右下进行搜索。

```
class Solution:
    def searchMatrix(self, matrix: List[List[int]], target: int) -> bool:
        x, y = 0, len(matrix[0]) - 1
        while x < len(matrix) and y >= 0:
            if target == matrix[x][y]:
                return True
            elif target < matrix[x][y]:
                y -= 1
            else:
                x += 1
        return False
```

### 专题七 链表

160 相交链表

双指针每次都同时往右移动一格，

如果相交，要么是有交点，要么是都为None。

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def getIntersectionNode(self, headA: ListNode, headB: ListNode) -> Optional[ListNode]:
        A, B = headA, headB
while A != B:
    A = A.next if A else headB
    B = B.next if B else headA
return A
```

206 反转链表

直接反转. 利用prev作为反向链表的头指针.

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, cur = None, head
        while cur:
            next_temp = cur.next
            cur.next = prev
            prev = cur
            cur = next_temp
        return prev
```

234 回文链表

最简单的方法永远是转成数组去做。

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        alist = []
        while head:
            alist.append(head.val)
            head = head.next
        return list(reversed(alist)) == alist
```

141 环形链表

最简单的方法当然是用一个哈希表确定是否存在。

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        visited = set()
        while head:
            if head in visited:
                return True
            visited.add(head)
            head = head.next
```

另一种常数级空间消耗的是快慢指针跑一遍。

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        fast, slow = head, head
        while fast != None and fast.next != None:
            fast = fast.next.next
            slow = slow.next
            if fast == slow:
                return True
        return False
```

142 环形链表 II

哈希表照样可以做。

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        visited = set()
        while head:
            if head in visited:
                return head
            visited.add(head)
            head = head.next
        return None
```

快慢指针的话存在以下数值关系：

记快指针首先走a距离入环，在环内走了nc，最后再在环上走了b和慢指针相遇。

则有：a + nc + b = 2(a+b)

即 a = nc - b

则在相遇后，再设置一个指针从起点出发、慢指针同时从快慢指针相遇点出发，则它们会在环入口处相遇。

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, x):
#         self.val = x
#         self.next = None

class Solution:
    def detectCycle(self, head: Optional[ListNode]) -> Optional[ListNode]:
        fast, slow = head, head
        while fast != None and fast.next != None:
            fast = fast.next.next
            slow = slow.next
            if fast == slow:
                break

        if fast == None or fast.next == None:
            return None

        another = head
        while another != slow:
            another = another.next
            slow = slow.next
        return slow
```

21 合并两个有序链表

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        if list1 == None:
            return list2
        if list2 == None:
            return list1
        dummy = ListNode()
        cur = dummy
        while list1 != None and list2 != None:
            if list1.val <= list2.val:
                cur.next = ListNode(list1.val)
                list1 = list1.next
            else:
                cur.next = ListNode(list2.val)
                list2 = list2.next
            cur = cur.next

        if list1 == None:
            cur.next = list2
        else:
            cur.next = list1

        return dummy.next
```

2 两数相加

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        # 把l2加到l1上
        cur1, cur2 = l1, l2
        while cur1.next != None and cur2.next != None:
            cur1.val += cur2.val
            cur1 = cur1.next
            cur2 = cur2.next
        if cur1.next == None:
            cur1.next = cur2.next
        cur1.val += cur2.val

        # flatten
        cur1 = l1
        while cur1:
            if cur1.val >= 10:
                if cur1.next:
                    cur1.next.val += cur1.val // 10
                else:
                    cur1.next = ListNode(cur1.val // 10)
                cur1.val %= 10
            cur1 = cur1.next

        return l1
```

19 删除链表的倒数第n个节点

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        # 指示指针首先往右n格
        cur = head
        for i in range(n):
            cur = cur.next

        # 根据指示指针, 锁定待删除节点的位置
        prev = None
        deleted = head
        while cur != None:
            prev = deleted
            cur = cur.next
            deleted = deleted.next

        if prev != None: # 要删除中间节点
            prev.next = deleted.next
        else: # 要删除头节点
            head = head.next

        return head
```

24 两两交换链表中的节点

偷了个懒，直接交换节点值。

不然其实就是指针操作，稍微麻烦点。

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def swapPairs(self, head: Optional[ListNode]) -> Optional[ListNode]:
        if head == None or head.next == None:
            return head
        prev = None
        cur1, cur2 = head, head.next
        while cur2 != None:
            cur1.val, cur2.val = cur2.val, cur1.val
            cur1 = cur1.next.next
            if cur2.next == None:
                break
            cur2 = cur2.next.next
        return head
```



[25. K 个一组翻转链表](https://leetcode.cn/problems/reverse-nodes-in-k-group/)

~~跟接雨水坐一桌的字节高频面试题~~

这个题目要分两层去思考。

- 第一层是，如果拿到一个链表的闭区间 `[head, tail]` ，我们如何做到翻转。（`def reverse`）
- 第二层是，我们如何正确地拿到整个链表的每一段闭区间 `[head, tail]` 的端点。（`def reverseKGroup`）

对于第一层，我们的答案是：每次从头部取出一个节点插入尾部。

> `def reverse` 适用的方便记忆小tips：
>
> head和tail从来不会被改变。所以我们需要front和cur作为循环使用的变量。
>
> while循环里第一行是为了在改变指针前保存信息。这四行的写法恰好是首尾相接的（数据搬运环环相扣），干净得令人叹服。

对于第二层，我们的答案是：每次维护 `prev` ， `head` ，`tail` ，`nxt` 四个指针。

对 `[head, tail]` 这一段执行 `reverse` 函数，然后把这一段连回整个链表、并切换到下一段。

如果长度不够 `K` ，就提前返回。

```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        def reverse(head, tail): # head和tail从来都不动
            front = tail.next
            cur = head
            while front != tail:
                nxt = cur.next
                cur.next = front
                front = cur
                cur = nxt
            return tail, head
        
        dummy = ListNode(0, head)
        prev = dummy
        while head:
            tail = prev
            for _ in range(k):
                tail = tail.next
                if not tail:
                    return dummy.next
            
            nxt = tail.next
            head, tail = reverse(head, tail)
            prev.next = head
            tail.next = nxt
            prev = tail
            head = nxt

        return dummy.next
```





138 随机链表的复制

需要创建链表的深拷贝，关键是需要重新建立指针。

这里采用节点到节点的哈希实现：

第一遍扫描，将原链表节点哈希到新链表的对应节点。

第二遍扫描，将新链表random指针的值借助哈希对应到新链表的节点，从而完成了指针的重新建立。

```
"""
# Definition for a Node.
class Node:
    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
        self.val = int(x)
        self.next = next
        self.random = random
"""

class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        # 想法是, 用哈希存储节点到节点的映射
        adict = {}

        dummy = Node(0)
        cur = dummy
        # 第一遍扫描先创建新链表节点
        headcur = head
        while headcur:
            cur.next = Node(headcur.val, None, None)
            adict[headcur] = cur.next
            cur = cur.next
            headcur = headcur.next

        # 第二遍扫描借助哈希表填入random
        headcur = head
        while headcur:
            if headcur.random == None:
                adict[headcur].random = None
            else:
                adict[headcur].random = adict[headcur.random]

            headcur = headcur.next

        return dummy.next
```

23 合并k个升序链表

搞一个合并两个升序链表，然后归并。

```
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def merge2Lists(self, list1, list2):
        dummy = ListNode()
        cur = dummy
        while list1 and list2:
            if list1.val <= list2.val:
                node = list1
                list1 = list1.next
                node.next = None
                cur.next = node
            else:
                node = list2
                list2 = list2.next
                node.next = None
                cur.next = node
            cur = cur.next
        if list1:
            cur.next = list1
        else:
            cur.next = list2
        return dummy.next

    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        if len(lists) == 0:
            return None
        elif len(lists) == 1:
            return lists[0]
        elif len(lists) == 2:
            return self.merge2Lists(lists[0], lists[1])
        else:
            list1 = self.mergeKLists(lists[:int(len(lists) / 2)])
            list2 = self.mergeKLists(lists[int(len(lists) / 2):])
            return self.merge2Lists(list1, list2)
```



[146. LRU 缓存](https://leetcode.cn/problems/lru-cache/)

这个题目用于学习 **collections.OrderedDict** 的语法。这个结构在算法里常常用到：

我们需要把**dict**和**双向链表**这两个功能结合起来。这样又方便插入删除（从中间取出节点之类的）、又可以快速查找。有下述两个API：

- `move_to_end(key, last=True)` 用于把某个元素移动到末尾。

- `popitem(last=False)` 用于删除在开头的元素。

> 有些同学可能跟我一样常常分不清哪里是last和front。
>
> 可以试着直觉上想象一个“小火车”，所以front就是“车头”。
>
> 我自己更习惯于想：它总是按照内存顺序直觉上“从左往右排列”的，所以车头就朝向“右边”。
>
> 至于这道题，保证 `move_to_end` 和 `popitem` 用的 `last` 变量反过来就好啦。

```python
class LRUCache:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
```

### 专题八 二叉树

94 二叉树的中序遍历

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def inorderTraversal(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []
        return self.inorderTraversal(root.left) + [root.val] + self.inorderTraversal(root.right)
```

104 二叉树的最大深度

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
```

226 翻转二叉树

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return root
        l = self.invertTree(root.left)
        r = self.invertTree(root.right)
        root.left, root.right = r, l
        return root
```

101 对称二叉树

（递归）

写一个辅助函数，用于检查两棵树是否对称。

从而用于确认一整棵树是否轴对称。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def check2Trees(self, t1, t2):
        if not t1 and not t2:
            return True
        elif not t1 and t2:
            return False
        elif not t2 and t1:
            return False
        elif t1.val != t2.val:
            return False
        else:
            return self.check2Trees(t1.left, t2.right) and self.check2Trees(t1.right, t2.left)

    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        if not root:
            return True
        else:
            return self.check2Trees(root.left, root.right)
```

（迭代）

利用队列确定两棵树对应元素是否相同。

deque实现队列：使用append和popleft。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isSymmetric(self, root: Optional[TreeNode]) -> bool:
        if not root:
            return True

        # 要求“对应节点值相同”
        # 利用队列实现“对应节点”的获取
        q = deque([(root.left, root.right)])
        while q:
            left, right = q.popleft()
            if not left and not right:
                continue
            elif not left or not right or left.val != right.val:
                return False
            else:
                q.append((left.left, right.right))
                q.append((left.right, right.left))
        return True
```

543 二叉树的直径

首先路径长度可以转化为经过的节点数减一，

然后转化成求以某个节点为根的树中最长路径的问题。

最长路径要么不经过根节点（对子树调用函数），要么经过根节点（转化为深度：L+R+1）。这二者通过self.ans取max得到最大值。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        # 转化为经过的节点数
        self.ans = 1
        def depth(node):
            if not node:
                return 0

            l = depth(node.left)
            r = depth(node.right)
            self.ans = max(self.ans, l + r + 1)
            return max(l, r) + 1

        depth(root)
        return self.ans - 1 # 转化回长度
```

102 二叉树的层序遍历

本来如果只是单纯层序列表的话直接入队出队就行，

但现在需要把同一层的放在一个子列表里，因此考虑添加深度信息和缓冲区，当前深度全部放完后再加入。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        res, cur_res = list(), list()
        q = deque([(root, 1)])
        cur = 1

        while q:
            node, node_dep = q.popleft()
            if not node:
                continue
            elif node_dep > cur:
                # 清空缓冲区, 再添加新元素
                res.append(cur_res)
                cur_res = list()
                cur += 1

            cur_res.append(node.val)
            q.append((node.left, node_dep + 1))
            q.append((node.right, node_dep + 1))

        if cur_res:
            res.append(cur_res)
        return res
```

108 将有序数组转换为平衡二叉搜索树

要建立平衡BST，方法是取区间中点作为根节点，然后对左右两段区间递归建立子树。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def sortedArrayToBST(self, nums: List[int]) -> Optional[TreeNode]:
        def build(left, right):
            if left > right:
                return None

            mid = (left + right) // 2
            root = TreeNode(nums[mid])

            root.left = build(left, mid - 1)
            root.right = build(mid + 1, right)
            return root

        return build(0, len(nums) - 1)
```

98 验证二叉搜索树

最复杂的方式是每次都递归求左子树最大值、右子树最小值，并且递归验证每个树。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxVal(self, root):
        if root == None:
            return -float('inf')
        return max(root.val, self.maxVal(root.left), self.maxVal(root.right))

    def minVal(self, root):
        if root == None:
            return float('inf')
        return min(root.val, self.minVal(root.left), self.minVal(root.right))

    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        if root == None:
            return True
        if self.maxVal(root.left) >= root.val:
            return False
        if root.val >= self.minVal(root.right):
            return False
        return self.isValidBST(root.left) and self.isValidBST(root.right)
```

更好的方式是传递区间：根据每个节点的值，确定当前节点的值应该位于的区间，通过判断区间验证。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def validate(root, minVal, maxVal):
            if not root:
                return True
            if root.val <= minVal:
                return False
            if root.val >= maxVal:
                return False
            return validate(root.left, minVal, root.val) and validate(root.right, root.val, maxVal)

        return validate(root, -float('inf'), float('inf'))
```

230 二叉搜索树中第K小的元素

如果是一个数组，第K小只需要从前往后遍历到第K个。

而对于二叉搜索树，转成中序遍历即可从前往后遍历到第K个。为了在遍历到时直接返回、而不需要遍历整棵树，使用中序遍历的迭代写法。

中序遍历的迭代写法：需要先把左边全处理完，即从左记录到头才往回。栈中只需要记录往左的路径即可，这一点不同于根左右（记录待处理的右子树和左子树）。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stk = []
        curr = root
        while curr or stk:
            while curr:
                stk.append(curr)
                curr = curr.left
            curr = stk.pop()
            k -= 1
            if k == 0:
                return curr.val
            curr = curr.right
```

199 二叉树的右视图

基于层序遍历。层序遍历其实就是每次迭代时通过for循环取出当前层的所有节点（队列里的所有节点）。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        # 基于层序遍历
        if not root:
            return []

        q = deque([root])
        res = []

        while q:
            # 当前层的节点个数
            level_size = len(q)
            for i in range(level_size):
                node = q.popleft()
                if i == level_size - 1:
                    res.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)

        return res
```

114 二叉树展开为链表

用了一个列表组织前序遍历，然后遍历列表改变属性。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def flatten(self, root: Optional[TreeNode]) -> None:
        """
        Do not return anything, modify root in-place instead.
        """
        if not root:
            return

        def preorder(root):
            if not root:
                return []
            return [root] + preorder(root.left) + preorder(root.right)

        nodes = preorder(root)

        for i in range(len(nodes) - 1):
            nodes[i].left = None
            nodes[i].right = nodes[i + 1]
```

105 从前序和中序遍历序列构造二叉树

需要转成根据字符串的某些段构造二叉树，然后对于整个段执行初始函数。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        n = len(inorder)
        def build(l1, r1, l2, r2):
            if l1 > r1 or l2 > r2:
                return None

            root = preorder[l1]
            for i in range(n):
                if inorder[i] == root:
                    t = TreeNode(root)
                    t.left = build(l1 + 1, l1 + i - l2, l2, i - 1)
                    t.right = build(l1 + 1 + i - l2, r1, i + 1, r2)
                    return t

        return build(0, len(preorder) - 1, 0, len(preorder) - 1)
```

437 路径总和 III

求树中总和为targetSum的路径数量，起点任意。

这个问题很有趣：它其实来自“和为K的子数组”（子数组是连续的），而子数组问题我们知道有两种做法：

(1) 朴素做法，定起点、遍历终点，计数和为K的情况。

(2) 前缀和做法，维护一个从前缀和到数量的哈希，通过前缀和的差为K确定和为K的子数组的个数。

这正对应了下述两种做法。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        if not root:
            return 0

        def countPaths(node, targetSum):
            # 计算从某节点开始的和为targerSum的路径数量.
            # 注意, 这个数量是和从其他节点开始的和为targetSum的路径数量无关的.
            if not node:
                return 0
            count = 1 if node.val == targetSum else 0
            count += countPaths(node.left, targetSum - node.val)
            count += countPaths(node.right, targetSum - node.val)
            return count

        # 对所有节点调用countPaths并求和
        return countPaths(root, targetSum) + self.pathSum(root.left, targetSum) + self.pathSum(root.right, targetSum)

```

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def pathSum(self, root: Optional[TreeNode], targetSum: int) -> int:
        self.count = 0
        self.premap = defaultdict(int)
        self.premap[0] = 1
        self.target = targetSum

        def dfs(node, cursum):
            if not node:
                return

            cursum += node.val
            self.count += self.premap[cursum - self.target]
            self.premap[cursum] += 1
            dfs(node.left, cursum)
            dfs(node.right, cursum)
            self.premap[cursum] -= 1
        # 不同起点的dfs不能互相影响, 所以要用回溯写法

        dfs(root, 0)
        return self.count
```

为了对比，将它们对应的“和为K的子数组”也列到下面。

事实上，唯一写法思路区别是递归和迭代。

```
def subarraySum(nums, k):
    count = 0
    n = len(nums)

    # 朴素做法：固定起点，累加找终点
    for start in range(n):
        curr_sum = 0
        for end in range(start, n):
            curr_sum += nums[end]
            if curr_sum == k:
                count += 1

    return count
```

```
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        premap = defaultdict(int)
        presum = 0
        premap[0] = 1

        count = 0

        for num in nums:
            # 如果presum - k出现过, 则它们的差为k.
            presum += num
            count += premap[presum - k]
            premap[presum] += 1

        return count
```

总之，对于数组，我们往往用迭代写法，因为递归写法往往是尾递归，没必要。

对于树和图，我们往往用递归写法，因为迭代写法需要手动维护栈或队列，写法略微复杂。

对于树和图的回溯问题，其实对应于各次迭代互相不影响的迭代循环。

236 二叉树的最近公共祖先

我们先考虑典型情况，然后再考虑为了实现典型情况所需的信息转移写法。

(1) p或q不在根的情况

如果左子树存在p或q节点 且 右子树存在p或q节点，则根为最近公共祖先。

如果二者中只有一者存在，则返回存在的那个。

如果都不存在，则返回None。

(2) p或q在根的情况

如果根不存在，返回None，否则一定返回根。

从上述来看，当前树的处理需要子树信息。因此应该用后序写法（左右根）。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, x):
#         self.val = x
#         self.left = None
#         self.right = None

class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if not root or root == p or root == q:
            return root

        # 后序写法
        left = self.lowestCommonAncestor(root.left, p, q)
        right = self.lowestCommonAncestor(root.right, p, q)
        if left and right:
            return root
        else:
            return left or right
```

124 二叉树中的最大路径和

子树对整体的贡献只能“二选一”，但是路径要包含根。

```
# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        self.res = -float('inf')
        
        def maxGain(node):
            if not node:
                return 0 # 不选
            
            # 以某个节点为根的最大贡献.
            l = max(maxGain(node.left), 0)
            r = max(maxGain(node.right), 0)
            pathSum = l + r + node.val
            self.res = max(self.res, pathSum)
            # 向上贡献时只能二选一.
            return max(l, r) + node.val
            
        maxGain(root)
        return self.res
```

### 专题九 图：DFS和BFS遍历

图这个专题是十分有趣的。最主要是DFS和BFS两种遍历方式。

为了两种写法都练得很熟练，我们往往可以把两种函数的接口设成高度相似的，这样可以无缝切换。

> 我们怎么样把图的DFS/BFS跟之前很好想的“树的DFS”给联系起来呢？
>
> 根本在于“**管好自己的，引出别人的。**”
>
> 不管是任何DFS/BFS，自己的部分都只**处理自己**这个节点。与此同时，它们又要在末尾“**引出邻居**”节点供处理。这是核心逻辑。
>
> 除此之外，就是利用 `visited` 来防止重复判断/重复入队了。

注意仔细观察以下三个模板，逐行仔细看。这里模板多花点时间，早点想清楚，就是为了以后刷题少花点时间。

**模板一：函数调用DFS**

“判断，标记，处理，邻居”

```python
def dfs(node, visited, graph):
    if node in visited:
        return
    # 1. 标记访问（关键！）
    visited.add(node)
    # 2. 处理当前节点（打印、统计等）
    print(node)
    # 3. 递归访问邻居
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(neighbor, visited, graph)
```

**模板二：显式栈DFS** （和队列BFS特别像！）

```python
def dfs_stack(start, graph):
    visited = set()
    stack = [start]
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        print(node)
        # 把未访问的邻居压入栈
        for neighbor in graph[node]:
            if neighbor not in visited:
                stack.append(neighbor)
```

**模板三：队列BFS**

BFS 只要无脑在入队时标记时就可以了，防止重复入队。

```python
from collections import deque

def bfs(start, graph):
    visited = set()
    queue = deque([start])
    visited.add(start)  # 注意这里！！！BFS 只要无脑在入队时标记时就可以了，防止重复入队

    while queue:
        node = queue.popleft()
        print(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor) # 注意这里！！！同上
                queue.append(neighbor)
```

把上述的邻接表换成网格，就变成了常考的网格模板。

```python
# 方向数组（常用技巧）
DIRS = [(1, 0), (-1, 0), (0, 1), (0, -1)]

def dfs_grid(grid, r, c):
    # 边界检查 + 访问检查（非0即1的网格通常直接将值改掉）
    if not (0 <= r < len(grid) and 0 <= c < len(grid[0])):
        return
    if grid[r][c] != '1':  # 假设'1'是未访问的陆地
        return

    grid[r][c] = '0'  # 标记已访问
    for dr, dc in DIRS:
        dfs_grid(grid, r + dr, c + dc)

def bfs_grid(grid, r, c):
    from collections import deque
    q = deque([(r, c)])
    grid[r][c] = '0'
    while q:
        r, c = q.popleft()
        for dr, dc in DIRS:
            nr, nc = r + dr, c + dc
            if 0 <= nr < len(grid) and 0 <= nc < len(grid[0]) and grid[nr][nc] == '1':
                grid[nr][nc] = '0'
                q.append((nr, nc))
```

仔细做好上面的模板，下面两道题目完全是手到擒来。

经典题目： [200. 岛屿数量](https://leetcode.cn/problems/number-of-islands/)

```python
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        DIR = [(1, 0), (-1, 0), (0, 1), (0, -1)]

        def dfs(r, c): # 用于消灭掉一大片的海洋
            if not (0 <= r < len(grid) and 0 <= c < len(grid[0])):
                return
            if grid[r][c] != '1':
                return
            grid[r][c] = '0'
            for dr, dc in DIR:
                dfs(r + dr, c + dc)

        def bfs(r, c):
            q = deque([(r, c)])
            grid[r][c] = '0'
            while q:
                row, col = q.popleft()
                for dr, dc in DIR:
                    nr, nc = row + dr, col + dc
                    if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])):
                        continue
                    if grid[nr][nc] == '0':
                        continue
                    q.append((nr, nc))
                    grid[nr][nc] = '0'

        count = 0
        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if grid[i][j] == '1':
                    count += 1
                    bfs(i, j)

        return count
```

再练一道：[695. 岛屿的最大面积](https://leetcode.cn/problems/max-area-of-island/) 。上面的模板以及上一道如果练熟了，这一道应该能很快地码出来（5分钟之类的）。

```python
class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        DIR = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        maxCount = 0
        curCount = 0
        def dfs(r, c):
            if not (0 <= r < len(grid) and 0 <= c < len(grid[0])):
                return
            if not grid[r][c] == 1:
                return
            grid[r][c] = 0
            nonlocal curCount
            curCount += 1
            for dr, dc in DIR:
                dfs(r + dr, c + dc)
        
        def bfs(r, c):
            q = deque([(r, c)])
            grid[r][c] = 0
            nonlocal curCount
            curCount += 1
            while q:
                row, col = q.popleft()
                for dr, dc in DIR:
                    nr, nc = row + dr, col + dc
                    if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])):
                        continue
                    if not grid[nr][nc] == 1:
                        continue
                    q.append((nr, nc))
                    grid[nr][nc] = 0
                    curCount += 1

        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if grid[i][j] == 1:
                    curCount = 0
                    bfs(i, j)
                    maxCount = max(maxCount, curCount)
        return maxCount
```



再来一道： [994. 腐烂的橘子](https://leetcode.cn/problems/rotting-oranges/)

“打窝”然后让它扩散开来。这个就十分bfs了。

```python
class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        DIR = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        queue = deque([])
        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if grid[i][j] == 2:
                    queue.append((i, j, 0))
        res = 0
        while queue:
            r, c, t = queue.popleft()
            for dr, dc in DIR:
                nr, nc = r + dr, c + dc
                if not (0 <= nr < len(grid) and 0 <= nc < len(grid[0])):
                    continue
                if grid[nr][nc] == 0 or grid[nr][nc] == 2:
                    continue
                grid[nr][nc] = 2
                queue.append((nr, nc, t + 1))
                res = max(res, t + 1)
        for i in range(len(grid)):
            for j in range(len(grid[0])):
                if grid[i][j] == 1:
                    return -1
        return res
```



[207. 课程表](https://leetcode.cn/problems/course-schedule/) / [210. 课程表 II](https://leetcode.cn/problems/course-schedule-ii/)

**模版四：拓扑排序**

拓扑排序其实也是基于BFS的。这里需要额外增加两个知识点：

- 需要知道怎么构建邻接表（pre->cur的有向边）。
- 需要记录并更新入度。**入队的永远是入度为0的点，出队永远用于更新邻接点的入度。**

```python
class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        graph = [[] for _ in range(numCourses)]
        indegree = [0] * numCourses
        for cur, pre in prerequisites:
            graph[pre].append(cur)
            indegree[cur] += 1
        queue = deque([i for i in range(numCourses) if indegree[i] == 0])
        count = 0
        while queue:
            node = queue.popleft()
            count += 1
            for neighbour in graph[node]:
                indegree[neighbour] -= 1
                if indegree[neighbour] == 0:
                    queue.append(neighbour)
        return count == numCourses
```



[208. 实现 Trie (前缀树)](https://leetcode.cn/problems/implement-trie-prefix-tree/)

> Trie树把“**字符串存在**”和“**树上某个位置的节点存在**”一一对应起来了。

脑补一下前缀树会发现它是一个十分有意思的东西：共用前缀的字符串一定共用前缀这一段路径。

我们对每个字符串的操作都是通过遍历字符串完成的，所以每个节点可以通向的节点应该对应字符的所有情况（$|\Sigma|=26$）。

因此，存在前缀就是存在相应的节点；存在字符串就是存在相应的节点且该节点可以作为字符串末尾。

时间复杂度：`insert`、`search` 、`startswith` 、`_findNode` 均为 $O(L)$ 。

空间复杂度：`insert` 为 $O(L)$ ，其余三个函数均为 $O(1)$ 。如果总共存储 $N$ 个字符串，则总复杂度上界为 $O(NL)$ 。

```python
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:

    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self._findNode(word)
        return node is not None and node.is_end

    def startsWith(self, prefix: str) -> bool:
        node = self._findNode(prefix)
        return node is not None

    def _findNode(self, prefix: str) -> TrieNode:
        node = self.root
        for ch in prefix: # O(L)
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node


# Your Trie object will be instantiated and called as such:
# obj = Trie()
# obj.insert(word)
# param_2 = obj.search(word)
# param_3 = obj.startsWith(prefix)
```

上一篇：[[algorithm-3|03 模板整理]] · 下一篇：[[algorithm-5|05 HOT 100（后 50）]]
