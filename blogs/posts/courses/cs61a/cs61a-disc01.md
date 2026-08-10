---
title: CS61A · Disc 01 · 迭代与抽象
date: 2023-07-17 22:44:34
tags:
- CS61A
published: true
hideInList: false
feature: null
isTop: false
---
[Discussion 1 | CS 61A Summer 2024](https://cs61a.org/disc/disc01/)

> edit time: 2024-07-17 17:57:15

## 系列总览

CS61A 2024 summer Discussion 笔记（共六篇，disc06 没写）：

1. [[cs61a-disc01|Disc 01 迭代与抽象]]（本篇）
2. [[cs61a-disc02|Disc 02 高阶函数]]
3. [[cs61a-disc03|Disc 03 递归]]
4. [[cs61a-disc04|Disc 04 树的递归]]
5. [[cs61a-disc05|Disc 05 迭代、时空复杂度]]
6. [[cs61a-disc07|Disc 07 树、链表]]

## Q1: Race

eg. `race(3, 4)`

以下先考虑前10min中构造无限循环。
第一个条件显然不符合我们的需要。
因为第二个条件是 `tortoise - hare` ，若其为负值、则仍可以继续循环。
0-4min 由于`y>x`，`hare=my > tortoise=mx`，不可能追上。
5-9min 此时 `hare=5y` ，`tortoise=mx, m = 6, ..., 10`，恰好追上即`mx=5y`，即`6x=5y, 7x=5y, 8x=5y, 9x=5y, 10x=5y`这五种情况。
任意选择不满足这五种情况的值即可。

关于值有误的情况：举例为 `race(3,5)` ，按照上面的推理继续往后，实际是满足了 `25x=15y` 的情况，恰好不是无限循环。

懒得做一般推理了qwq读者有兴趣自便咯

## Q2: Fizzbuzz

```python
def fizzbuzz(n):
    for i in range(1, n + 1):
        if (i % 3 == 0):
            if (i % 5 == 0):
                print('fizzbuzz')
            else:
                print('fizz')
        else:
            if (i % 5 == 0):
                print('buzz')
            else:
                print(i)
```

## Q3: Is Prime?

虽然这道题实现很容易，而且很可能已经在读者的长期记忆中存下来了，但不妨去跟着hint想一下这个过程。

（1. Pick an example input and corresponding output.）
用 `n=10, return False` 举例，考虑详细过程 ：

（2. Describe a process (in English) that computes the output from the input using simple steps.）

检测是否为素数即该正整数（下简写为数）不被 `1` 和 `10` 整除。
`10` 显然不会被大于`10`的数整除。
因此我们要考虑的是：怎样描述一个过程，以检测`10` 是否被 `1` 到 `10` 中间的这些正整数整除。

可以从小到大按顺序依次递增检测：

检测`10`是否被`2`整除，即`10 % 2 == 0` ，若满足则返回`False` ，不满足则继续检测`3`；
检测`10`是否被`3`整除，即`10 % 3 == 0` ，若满足则返回`False` ，不满足则继续检测`4`；
...
直到全部检测完毕（即检测完`n-1`）为止，返回`True`。

（3. Figure out what additional names you'll need to carry out this process.）

> 这一步最为关键。
> 但没有上一步的准确描述，往往不能正确地完成这一步。

那么我们再做**抽象**：前面的步骤都有共同的结构，即检测 `10 % i == 0, 1 < i < 10`，若满足则返回`False` ，不满足则继续检测下一个数。
在这个抽象中，“additional name”是`i`，表示某一个特定的数。
我们可以取`i`初始为`2`，`i`的下一个数是`i+1`，这样可以覆盖到范围内所需的所有的数，达成了我们的需求。

（4. Implement the process in code using those additional names.）
那么对于上面这个非常符合直觉的检测过程，`python`提供了这个循环结构对应的函数：`for i in range(2, n)`，表示`i`的范围从`2`到`n-1`依次递增。代码如下：

```python
def is_prime(n):
	"""Haven't Finished."""
    for i in range(2, n):
        if (n % i == 0):
            return False
    return True
```

（5. Determine whether the implementation really works on your original example.）
我们将`n=10`代入其中考虑，发现`i=2`时满足`10%2==0`，得到`False`符合我们判断的结果。

（6. Determine whether the implementation really works on other examples. (If not, you might need to revise step 2.)）
可以尝试执行`is_prime(n), n = 1, 2, ..., 10`这样的方式，人工测试；或者通过确认无误的函数来对照检测该函数的正确性。
我们意识到（或通过测试发现）存在一个反例：`n=1`是无法满足的，但对于其他情况，我们上述的过程尚不存在反例。因此，我们考虑将`n=1`单独处理，见下。
（我认为，只有对算法过程从数学上严格证明不存在反例，才能保证算法的正确性；否则上述过程可能只能保证对测试用例有效）

```python
def is_prime(n):
    if n == 1:
        return False
    for i in range(2, n):
        if (n % i == 0):
            return False
    return True
```

## Q4: Unique Digits

```python
def unique_digits(n):
    """Return the number of unique digits in positive integer n.
    >>> unique_digits(8675309) # All are unique
    7
    >>> unique_digits(13173131) # 1, 3, and 7
    3
    >>> unique_digits(101) # 0 and 1
    2
    """
    "*** YOUR CODE HERE ***"
    count = 0
    for i in range(0, 10):
        if has_digit(n, i):
            count += 1
    return count
  
def has_digit(n, k):
    """Returns whether k is a digit in n.
    >>> has_digit(10, 1)
    True
    >>> has_digit(12, 7)
    False
    """
    assert k >= 0 and k < 10

    "*** YOUR CODE HERE ***"

    while (n > 0):
        if n % 10 == k:
            return True
        n //= 10
    return False
```

我们当然可以用其他的算法，也可以利用已经完成的函数。

这里依旧使用上一题的`Problem-Solving`思想：
考虑出一种包含基本（这里的simple含义我不是很确定：基本、简单，似乎都能说通）步骤的过程，
在这个过程中抽象出`additional names`即更一般的某个“东西”，把过程表示成对这些“东西”的操作。转化为代码，尝试引出这个过程的那个案例，再尝试其他案例，反复迭代修改过程。

用在本题中，“有数字”可以考虑的判断条件是“某一位数字是否等于已知数”，那么就要考虑怎样将所查数按顺序拆分成各数字，进而引出转化为字符串、或者整除运算等方法。
整除运算是很常见的用法，可以记忆并熟练运用。
## Q5: Ordered Digits

```python
def ordered_digits(x):
    """Return True if the (base 10) digits of X>0 are in non-decreasing
    order, and False otherwise.
    >>> ordered_digits(5)
    True
    >>> ordered_digits(11)
    True
    >>> ordered_digits(127)
    True
    >>> ordered_digits(1357)
    True
    >>> ordered_digits(21)
    False
    >>> result = ordered_digits(1375) # Return, don't print
    >>> result
    False
    """

    "*** YOUR CODE HERE ***"
    while (x > 0):
        if (x % 10) < (x // 10 % 10):
            return False
        x //= 10
    return True
```

类似上一题的思考：
逐个判断“是否有某一位数小于它的高位数”？
## 总结

很明显，Q3-Q5反映了相同的从一个具体案例，引出解决过程的描述、对该过程描述中的实体的抽象、再反过来利用抽象测试是否满足该案例，以及是否满足其他案例这样的“迭代过程”。
这个思想贯穿整个课程及教材，务必仔细体会。

如下摘录相关思想的原文。

> **Problem-Solving** from [Discussion 1 | CS 61A Summer 2024](https://cs61a.org/disc/disc01/)

A useful approach to implementing a function is to:

1. Pick an example input and corresponding output.
2. Describe a process (in English) that computes the output from the input using simple steps.
3. Figure out what additional names you'll need to carry out this process.
4. Implement the process in code using those additional names.
5. Determine whether the implementation really works on your original example.
6. Determine whether the implementation really works on other examples. (If not, you might need to revise step 2.)

Importantly, this approach doesn't go straight from reading a question to writing code.

For example, in the `is_prime` problem below, you could:

1. Pick `n` is 9 as the input and `False` as the output.
2. Here's a process: Check that `9` (`n`) is not a multiple of any integers between 1 and `9` (`n`).
3. Introduce `i` to represent each number between 1 and 9 (`n`).
4. Implement `is_prime` (you get to do this part with your group).
5. Check that `is_prime(9)` will return `False` by thinking through the execution of the code.
6. Check that `is_prime(3)` will return `True` and `is_prime(1)` will return `False`.

下一篇：[[cs61a-disc02|Disc 02 高阶函数]]
