---
title: CS61A · Disc 04 · 树的递归
date: 2023-08-30 09:57:10
tags:
- CS61A
published: true
hideInList: false
feature: null
isTop: false
---
> edit time: 2024-07-19 19:11:45
## describing the recursive case in words

For the following questions, don't start trying to write code right away. Instead, start by **describing the recursive case in words**. Some examples:

- In `fib` from lecture, the recursive case is to add together the previous two Fibonacci numbers.
- In `double_eights` from lab, the recursive case is to check for double eights in the rest of the number.
- In `count_partitions` from lecture, the recursive case is to partition `n-m` using parts up to size `m` **and** to partition `n` using parts up to size `m-1`.

## Q1: Insect Combinatorics

基础情况略。
递归情况：从左下出发的路径的可能数，是第一步往上走、之后的路径的可能数 加 第一步往右走，之后的路径的可能数。

```python
def paths(m, n):
    """Return the number of paths from one corner of an
    M by N grid to the opposite corner.

    >>> paths(2, 2)
    2
    >>> paths(5, 7)
    210
    >>> paths(117, 1)
    1
    >>> paths(1, 157)
    1
    """
    "*** YOUR CODE HERE ***"
    if m == 1 or n == 1:
        return 1
    return paths(m - 1, n) + paths(m, n - 1)
```

## Q2: Even weighted

先理解题目含义：
`x = [1, 2, 3, 4, 5, 6]`，下标从0开始，只留下标为`0, 2, 4`的三个元素即 `[1, 3, 5]` ，之后将每个元素与之前提到的偶数下标相乘，即 `[1 * 0, 3 * 2, 5 * 4] = [0, 6, 20]`。

```python
def even_weighted_loop(s):
    """
    >>> x = [1, 2, 3, 4, 5, 6]
    >>> even_weighted_loop(x)
    [0, 6, 20]
    """
    "*** YOUR CODE HERE ***"

    result = []
    for i in range(len(s)):
        if (i % 2 == 0):
            result += [s[i] * i]
    return result
```

```python
def even_weighted_comprehension(s):
    """
    >>> x = [1, 2, 3, 4, 5, 6]
    >>> even_weighted_comprehension(x)
    [0, 6, 20]
    """
    return [s[i] * i for i in range(len(s)) if i % 2 == 0]
```

## Q3: Has Path

递归情况：如果本节点值等于路径第一位，子分支中存在一个分支满足路径的剩余部分，则返回真。
硬控我好几分钟的地方是python的列表切片后如果长度为1，仍然是一个列表。令人忍俊不禁。

```python
def has_path(t, p):
    """Return whether tree t has a path from the root with labels p.

    >>> t2 = tree(5, [tree(6), tree(7)])
    >>> t1 = tree(3, [tree(4), t2])
    >>> has_path(t1, [5, 6])        # This path is not from the root of t1
    False
    >>> has_path(t2, [5, 6])        # This path is from the root of t2
    True
    >>> has_path(t1, [3, 5])        # This path does not go to a leaf, but that's ok
    True
    >>> has_path(t1, [3, 5, 6])     # This path goes to a leaf
    True
    >>> has_path(t1, [3, 4, 5, 6])  # There is no path with these labels
    False
    """
    if p == [label(t)]:  # when len(p) is 1
        return True
    elif label(t) != p[0]:
        return False
    else:
        "*** YOUR CODE HERE ***"
        for child in branches(t):
            if has_path(child, p[1:]):
                return True
        return False
        # one line version:
        # return True in [has_path(child, p[1:]) for child in branches(t)]
```

## Q4: Find Path

不妨先抛弃题目模板，自行思考。
仍然满足上一题“子情况中存在一个满足则返回该子情况，子情况全部不满足才返回不满足”。

```python
def find_path(t, x):
    """
    >>> t2 = tree(5, [tree(6), tree(7)])
    >>> t1 = tree(3, [tree(4), t2])
    >>> find_path(t1, 5)
    [3, 5]
    >>> find_path(t1, 4)
    [3, 4]
    >>> find_path(t1, 6)
    [3, 5, 6]
    >>> find_path(t2, 6)
    [5, 6]
    >>> print(find_path(t1, 2))
    None
    """
    if label(t) == x:
        return [label(t)]
    else:
        for child in branches(t):
            if find_path(child, x):
                return [label(t)] + find_path(child, x)
        return None
```

之后尝试与题目模板格式匹配：

```python
def find_path(t, x):
    """
    >>> t2 = tree(5, [tree(6), tree(7)])
    >>> t1 = tree(3, [tree(4), t2])
    >>> find_path(t1, 5)
    [3, 5]
    >>> find_path(t1, 4)
    [3, 4]
    >>> find_path(t1, 6)
    [3, 5, 6]
    >>> find_path(t2, 6)
    [5, 6]
    >>> print(find_path(t1, 2))
    None
    """
    if label(t) == x:
        return [label(t)]
    for child in branches(t):
        path = find_path(child, x)
        if path:
            return [label(t)] + path
    return None
```

（当时在`for`那里的空填了`else`，想到一个 `path = any([find_path(child, x) for child in branches(t)])`，之后会麻烦亿点、而且跟`path`这个变量名不匹配，xsl）

## Q5: Sprout Leaves

注意题目要求构造`tree`，而且在`branches`里的也是`tree`。
思路很简单：
如果是叶，则构造一个标签相同、带了新叶的树返回；
如果不是叶，则构造一个标签相同、每个分支完成了`sprout leaves`（即题设要求的函数）的树返回。

```python
def sprout_leaves(t, leaves):
    """Sprout new leaves containing the labels in leaves at each leaf of
    the original tree t and return the resulting tree.

    >>> t1 = tree(1, [tree(2), tree(3)])
    >>> print_tree(t1)
    1
      2
      3
    >>> new1 = sprout_leaves(t1, [4, 5])
    >>> print_tree(new1)
    1
      2
        4
        5
      3
        4
        5

    >>> t2 = tree(1, [tree(2, [tree(3)])])
    >>> print_tree(t2)
    1
      2
        3
    >>> new2 = sprout_leaves(t2, [6, 1, 2])
    >>> print_tree(new2)
    1
      2
        3
          6
          1
          2
    """
    "*** YOUR CODE HERE ***"
    if is_leaf(t):
        return tree(label(t), [tree(val) for val in leaves])
    return tree(label(t), [sprout_leaves(branch, leaves) for branch in branches(t)])
```

## Q6: Tree Deciphering

`result`的值是`t1`和`t2`中较大的那棵树的所有子分支中最小的分支的标签。
“大”与“小”通过比较`label(t)`判断。
（`max(s, key=f)` returns the item `x` in `s` for which `f(x)` is largest.
`max([t1, t2], key=label)` returns the tree with the largest label, in this case `t2`.）

```python
def tree(label, branches=[]):
    for branch in branches:
        assert is_tree(branch), 'branches must be trees'
    return [label] + list(branches)

def label(tree):
    return tree[0]

def branches(tree):
    return tree[1:]

def is_leaf(tree):
    return not branches(tree)

def is_tree(tree):
    if type(tree) != list or len(tree) < 1:
        return False
    for branch in branches(tree):
        if not is_tree(branch):
            return False
    return True

t2 = tree(5, [tree(6), tree(7)])
t1 = tree(3, [tree(4), t2])
result = label(min(branches(max([t1, t2], key=label)), key=label))
print(result)
```

上一篇：[[cs61a-disc03|Disc 03 递归]] · 下一篇：[[cs61a-disc05|Disc 05 迭代、时空复杂度]] · 另见：[[cs61a-disc07|Disc 07 树、链表]]
