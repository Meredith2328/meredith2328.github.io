---
title: CS61A · Disc 07 · 树、链表
date: 2023-08-30 09:57:47
tags:
- CS61A
published: true
hideInList: false
feature: null
isTop: false
---
## Q1: Is BST

左子树的所有节点的值都小于等于父节点的值，
右子树的所有节点的值都大于父节点的值。

```python
def is_bst(t):
    """Returns True if the Tree t has the structure of a valid BST.

    >>> t1 = Tree(6, [Tree(2, [Tree(1), Tree(4)]), Tree(7, [Tree(7), Tree(8)])])
    >>> is_bst(t1)
    True
    >>> t2 = Tree(8, [Tree(2, [Tree(9), Tree(1)]), Tree(3, [Tree(6)]), Tree(5)])
    >>> is_bst(t2)
    False
    >>> t3 = Tree(6, [Tree(2, [Tree(4), Tree(1)]), Tree(7, [Tree(7), Tree(8)])])
    >>> is_bst(t3)
    False
    >>> t4 = Tree(1, [Tree(2, [Tree(3, [Tree(4)])])])
    >>> is_bst(t4)
    True
    >>> t5 = Tree(1, [Tree(0, [Tree(-1, [Tree(-2)])])])
    >>> is_bst(t5)
    True
    >>> t6 = Tree(1, [Tree(4, [Tree(2, [Tree(3)])])])
    >>> is_bst(t6)
    True
    >>> t7 = Tree(2, [Tree(1, [Tree(5)]), Tree(4)])
    >>> is_bst(t7)
    False
    """
    "*** YOUR CODE HERE ***"
    def bst_max(t):
        if t.is_leaf():
            return t.label
        return max(t.label, max([bst_max(b) for b in t.branches]))

    def bst_min(t):
        if t.is_leaf():
            return t.label
        return min(t.label, min([bst_min(b) for b in t.branches]))

    if t.is_leaf():
        return True
    if len(t.branches) > 2:
        return False
    elif len(t.branches) == 1:
        branch = t.branches[0]
        if is_bst(branch):
            return True
        else:
            return False
    else: # len(t.branches) == 2
        l, r = t.branches
        if bst_max(l) <= t.label and t.label < bst_min(r) and is_bst(l) and is_bst(r):
            return True
        else:
            return False
```

## Q2: Prune Small

Solution 1
```python
def prune_small(t, n):
    """Prune the tree mutatively, keeping only the n branches
    of each node with the smallest labels.

    >>> t1 = Tree(6)
    >>> prune_small(t1, 2)
    >>> t1
    Tree(6)
    >>> t2 = Tree(6, [Tree(3), Tree(4)])
    >>> prune_small(t2, 1)
    >>> t2
    Tree(6, [Tree(3)])
    >>> t3 = Tree(6, [Tree(1), Tree(3, [Tree(1), Tree(2), Tree(3)]), Tree(5, [Tree(3), Tree(4)])])
    >>> prune_small(t3, 2)
    >>> t3
    Tree(6, [Tree(1), Tree(3, [Tree(1), Tree(2)])])
    """
    if t.is_leaf():
        return
    if len(t.branches) > n:
        t.branches = [t.branches[i] for i in range(n)] # Only n left
    for b in t.branches:
        prune_small(b, n)
```

Solution 2
```python
    while len(t.branches) > n:
        largest = max(t.branches, key=lambda x: x.label)
        t.branches.remove(largest)
    for b in t.branches:
        prune_small(b, n)
```

## Q3: Sum Two Ways

```python
def sum_rec(s):
    """
    Returns the sum of the elements in s.

    >>> a = Link(1, Link(6, Link(7)))
    >>> sum_rec(a)
    14
    >>> sum_rec(Link.empty)
    0
    """
    # Use a recursive call to sum_rec
    "*** YOUR CODE HERE ***"
    if s is Link.empty:
        return 0
    return s.first + sum_rec(s.rest)

def sum_iter(s):
    """
    Returns the sum of the elements in s.

    >>> a = Link(1, Link(6, Link(7)))
    >>> sum_iter(a)
    14
    >>> sum_iter(Link.empty)
    0
    """
    # Don't call sum_rec or sum_iter
    "*** YOUR CODE HERE ***"
    sum = 0
    p = s
    while p is not Link.empty:
        sum += p.first
        p = p.rest
    return sum
```

## Q4: Overlap

```python
def overlap(s, t):
    """For increasing s and t, count the numbers that appear in both.

    >>> a = Link(3, Link(4, Link(6, Link(7, Link(9, Link(10))))))
    >>> b = Link(1, Link(3, Link(5, Link(7, Link(8)))))
    >>> overlap(a, b)  # 3 and 7
    2
    >>> overlap(a.rest, b)  # just 7
    1
    >>> overlap(Link(0, a), Link(0, b))
    3
    """
    "*** YOUR CODE HERE ***"
    if s is Link.empty or t is Link.empty:
        return 0
    if s.first == t.first:
        return 1 + overlap(s.rest, t.rest)
    elif s.first < t.first:
        return overlap(s.rest, t)
    else:
        return overlap(s, t.rest)

def overlap_iterative(s, t):
    """For increasing s and t, count the numbers that appear in both.

    >>> a = Link(3, Link(4, Link(6, Link(7, Link(9, Link(10))))))
    >>> b = Link(1, Link(3, Link(5, Link(7, Link(8)))))
    >>> overlap(a, b)  # 3 and 7
    2
    >>> overlap(a.rest, b)  # just 7
    1
    >>> overlap(Link(0, a), Link(0, b))
    3
    """
    "*** YOUR CODE HERE ***"
    count = 0
    while (s is not Link.empty and t is not Link.empty):
        if s.first == t.first:
            count += 1
            s, t = s.rest, t.rest
        elif s.first < t.first:
            s = s.rest
        else:
            t = t.rest
    return count
```

## Q5: Duplicate Link

```python
def duplicate_link(s, val):
    """Mutates s so that each element equal to val is followed by another val.

    >>> x = Link(5, Link(4, Link(5)))
    >>> duplicate_link(x, 5)
    >>> x
    Link(5, Link(5, Link(4, Link(5, Link(5)))))
    >>> y = Link(2, Link(4, Link(6, Link(8))))
    >>> duplicate_link(y, 10)
    >>> y
    Link(2, Link(4, Link(6, Link(8))))
    >>> z = Link(1, Link(2, (Link(2, Link(3)))))
    >>> duplicate_link(z, 2) # ensures that back to back links with val are both duplicated
    >>> z
    Link(1, Link(2, Link(2, Link(2, Link(2, Link(3))))))
    """
    "*** YOUR CODE HERE ***"
    p = s
    while (p is not Link.empty):
        if p.first == val:
            p.rest = Link(val, p.rest)
            p = p.rest.rest
        else:
            p = p.rest
```

## Q6: Decimal Expansion

Hint写得很清楚，摘抄一下。

**Hint: Approach**
Place the division pattern from the example above in a `while` statement:

```
>>> q, r = 10 * n // d, 10 * n % d
>>> tail.rest = Link(q)
>>> tail = tail.rest
>>> n = r
```

While constructing the decimal expansion, store the `tail` for each `n` in a dictionary keyed by `n`. When some `n` appears a second time, instead of constructing a new `Link`, set its original link as the rest of the previous link. That will form a cycle of the appropriate length.

```python
def divide(n, d):
    """Return a linked list with a cycle containing the digits of n/d.

    >>> display(divide(5, 6))
    0.8333333333...
    >>> display(divide(2, 7))
    0.2857142857...
    >>> display(divide(1, 2500))
    0.0004000000...
    >>> display(divide(3, 11))
    0.2727272727...
    >>> display(divide(3, 99))
    0.0303030303...
    >>> display(divide(2, 31), 50)
    0.06451612903225806451612903225806451612903225806451...
    """
    assert n > 0 and n < d
    result = Link(0)  # The zero before the decimal point
    "*** YOUR CODE HERE ***"
    tail_dict = {}
    tail = result
    while (n not in tail_dict):
        q, r = 10 * n // d, 10 * n % d # eg. 8, 2
        tail.rest = Link(q)
        tail = tail.rest
        tail_dict[n] = tail
        n = r
    tail.rest = tail_dict[n]
    return result

```

## HW05Q6: Store Digits

（懒得再开一个HW05页了，这一道题比较经典，顺手标记一下）
经典老题，把整数的每一位作为链表的节点值构造链表。
关键是要想到：我们容易得到的是 `n // 10` 和 `n % 10`。
以`2345`举例，构造`2345`时是在已知`234`而非`345`的构造的情况下。
因此我们要做的就是在`234`构造的末尾加上一个`5`（先遍历到末尾节点、再添加），
而非在`345`的开头加上一个`2`（直接构造 `Link(2, 345的Link)`。

```python
def store_digits(n):
    """Stores the digits of a positive number n in a linked list.

    >>> s = store_digits(1)
    >>> s
    Link(1)
    >>> store_digits(2345)
    Link(2, Link(3, Link(4, Link(5))))
    >>> store_digits(876)
    Link(8, Link(7, Link(6)))
    >>> store_digits(2450)
    Link(2, Link(4, Link(5, Link(0))))
    >>> # a check for restricted functions
    >>> import inspect, re
    >>> cleaned = re.sub(r"#.*\\n", '', re.sub(r'"{3}[\s\S]*?"{3}', '', inspect.getsource(store_digits)))
    >>> print("Do not use str or reversed!") if any([r in cleaned for r in ["str", "reversed"]]) else None
    """
    "*** YOUR CODE HERE ***"
    if n < 10:
        return Link(n)
    before = store_digits(n // 10)
    p = before
    while p.rest != Link.empty:
        p = p.rest
    p.rest = Link(n % 10)
    return before
```

上一篇：[[cs61a-disc05|Disc 05 迭代、时空复杂度]]
