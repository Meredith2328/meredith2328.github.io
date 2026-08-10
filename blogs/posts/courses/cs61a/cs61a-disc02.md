---
title: CS61A · Disc 02 · 高阶函数
date: 2023-07-17 22:45:22
tags:
- CS61A
published: true
hideInList: false
feature: null
isTop: false
---
[Discussion 2 | CS 61A Summer 2024](https://cs61a.org/disc/disc02/)
## Q1: Warm Up

这里的等号是数学等号，不是赋值↓

`(lambda x:3)(4)` = 3
`(lambda x:  2 * 3 * x)(5)` = 30
## ~~Q2/Q3~~

对Environment Diagram不太有兴趣，Q2和Q3就跳过了qwq
## Q4: Make Keeper

思路：还是符合上一次disc提到的解决问题的迭代与抽象方式。
首先取`make_keeper(5)(is_even)`，描述它的执行过程：
`make_keeper(5)`返回一个这样的函数，它的循环变量`i`从1到5递增，如果`cond(i)`，则打印`i`。
根据这个抽象，我们发现我们并不需要知道`cond`函数的具体细节，只是“用”就好了。因此，我们先描述出符合上述要求的函数，再把该函数的函数名（函数指针）作为外层函数的返回值即可。
完成函数编写之后，将已有例子代入考虑执行过程，发现是合理的。

```python
def make_keeper(n):
    """Returns a function that takes one parameter cond and prints
    out all integers 1..i..n where calling cond(i) returns True.

    >>> def is_even(x): # Even numbers have remainder 0 when divided by 2.
    ...     return x % 2 == 0
    >>> make_keeper(5)(is_even)
    2
    4
    >>> make_keeper(5)(lambda x: True)
    1
    2
    3
    4
    5
    >>> make_keeper(5)(lambda x: False)  # Nothing is printed
    """
    "*** YOUR CODE HERE ***"
    def printer(cond):
        for i in range(1, n + 1):
            if cond(i):
                print(i)
    return printer
```

额外一点话：
这道题体现出了Python中的函数名可以作为返回值、函数参数。
Higher Order Function/高阶函数看起来很有趣。我们返回的函数作用域以内实际上可以用到内外作用域的两个变量，但我们把这两个变量拆分给两个函数分别构造。
## Q5: Digit Finder

先简化问题：我们不考虑`lambda`表达式，怎样构造符合题目条件的函数，将其函数名返回？

```python
def find_digit(k):
    """Returns a function that returns the kth digit of x.

    >>> find_digit(2)(3456)
    5
    >>> find_digit(2)(5678)
    7
    >>> find_digit(1)(10)
    0
    >>> find_digit(4)(789)
    0
    """
    assert k > 0
    "*** YOUR CODE HERE ***"

    def get_kth_digit(x):
        return (x // (pow(10, k - 1))) % 10
    return get_kth_digit
```

之后再根据题目将其写为`lambda`表达式，是很自然的。

```python
return lambda x : (x // (pow(10, k - 1))) % 10
```

## Q6: Match Maker

依旧将循环拆分，通过迭代抽象来完成题目目标。
我个人的习惯是先不看题目给出的函数结构、试着自己做一下。
取案例`match_k(2)(1010)`，它可能经过这样的过程：
首先取最低位`0`（`x % 10`），
取与其相差距离为 `2` 的较高位（`x // (pow(10, 2)) % 10`，
判断这两位是否相同，如不相同，返回`False`，否则令`x //= 10`，重新执行上一步，除非较高位即`x // (pow(10, 2)) % 10`为0，跳出循环，返回`True`。
再把距离换为`k`即可。
对照题目模板，恰好匹配，塔诺西。

```python
def match_k(k):
    """Returns a function that checks if digits k apart match.

    >>> match_k(2)(1010)
    True
    >>> match_k(2)(2010)
    False
    >>> match_k(1)(1010)
    False
    >>> match_k(1)(1)
    True
    >>> match_k(1)(2111111111111111)
    False
    >>> match_k(3)(123123)
    True
    >>> match_k(2)(123123)
    False
    """
    def check(x):
        while x // (10 ** k) > 0:
            if (x % 10) != (x // (10 ** k) % 10):
                return False
            x //= 10
        return True
    return check
```
## 总结

上一次disc用到的那些思想的含金量还在增加！

Remember the problem-solving approach from last discussion; it works just as well for implementing higher-order functions.

1. Pick an example input and corresponding output. _(This time it might be a function.)_
2. Describe a process (in English) that computes the output from the input using simple steps.
3. Figure out what additional names you'll need to carry out this process.
4. Implement the process in code using those additional names.
5. Determine whether the implementation really works on your original example.
6. Determine whether the implementation really works on other examples. (If not, you might need to revise step 2.)

上一篇：[[cs61a-disc01|Disc 01 迭代与抽象]] · 下一篇：[[cs61a-disc03|Disc 03 递归]]
