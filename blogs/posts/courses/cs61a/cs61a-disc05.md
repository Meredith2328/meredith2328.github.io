---
title: CS61A · Disc 05 · 迭代、时空复杂度
date: 2023-08-30 09:57:27
tags:
- CS61A
published: true
hideInList: false
feature: null
isTop: false
---

> edit time: 2024-07-24 12:19:44
## Q1: WWPD: Iterators

```python
>>> s = "cs61a"
>>> s_iter = iter(s)
>>> next(s_iter)
'c'
>>> next(s_iter)
's'
>>> list(s_iter)
['6', '1', 'a']
>>> s = 1, 2, 3, 4
>>> i = iter(s)
>>> j = iter(next(i))
>>> next(j)
1
>>> s.append(5)
>>> next(i)
5
>>> next(j)
2
>>> list(j)
[3, 4]
>>> next(i)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
StopIteration
```

## Q2: Repeated

```python
def repeated(t, k):
    """Return the first value in iterator t that appears k times in a row,
    calling next on t as few times as possible.

    >>> s = iter([10, 9, 10, 9, 9, 10, 8, 8, 8, 7])
    >>> repeated(s, 2)
    9
    >>> t = iter([10, 9, 10, 9, 9, 10, 8, 8, 8, 7])
    >>> repeated(t, 3)
    8
    >>> u = iter([3, 2, 2, 2, 1, 2, 1, 4, 4, 5, 5, 5])
    >>> repeated(u, 3)
    2
    >>> repeated(u, 3)
    5
    >>> v = iter([4, 1, 6, 6, 7, 7, 8, 8, 2, 2, 2, 5])
    >>> repeated(v, 3)
    2
    """
    assert k > 1
    "*** YOUR CODE HERE ***"
    count = 0
    num = 0
    for e in t:
        if e != num:
            count = 1
            num = e
        else:
            count += 1
        if count == k:
            return num
```

## Q3: Something Different

使用`try-except`块是为了在循环内调用`next(t)`足够多次、通过`StopIteration`退出循环时将其处理掉。

```python
def differences(t):
    """Yield the differences between adjacent values from iterator t.

    >>> list(differences(iter([5, 2, -100, 103])))
    [-3, -102, 203]
    >>> next(differences(iter([39, 100])))
    61
    """
    "*** YOUR CODE HERE ***"
    val = next(t)
    try:
        while True:
            next_val = next(t)
            yield next_val - val
            val = next_val
    except StopIteration:
        pass
```
## Q4: Primes Generator

用`for`还是很直接的，重点提一下用`yield from`构造生成函数的递归。

```python
def primes_gen(n):
    """Generates primes in decreasing order.
    >>> pg = primes_gen(7)
    >>> list(pg)
    [7, 5, 3, 2]
    """
    "*** YOUR CODE HERE ***"
    for i in range(n, 1, -1):
        if is_prime(i):
            yield i
```

首先理解`yield from`，它是使用另外一个迭代器，效果类似于 `for item in iterable: yield item`。

```python
def generatorUsed():
	yield 'Q'
	yield 'A'
	yield 'Q'

def generatorUser():
	yield '233'
	yield from generatorUsed()
```

仅此还不够直观，不妨了解一个词语：“**委派**”：上述的`generatorUser`在第一次`__next__()`时产生`233`（“自己负责的”），而在后续`__next__()`时，就“交给`generatorUsed`来负责了”，`generatorUsed`负责处理后续的三次`__next__()`。
~~おまかせ~~

这件事和我们所学的**过程-抽象**其实是很类似的，以一道递归题目（disc03中Q3: Skip Factorial）为例：

```python
def skip_factorial(n):
    """Return the product of positive integers n * (n - 2) * (n - 4) * ...

    >>> skip_factorial(5) # 5 * 3 * 1
    15
    >>> skip_factorial(8) # 8 * 6 * 4 * 2
    384
    """
    if n == 1 or n == 2:
        return n
    else:
        return n * skip_factorial(n - 2)
```

它就像是本函数来负责某某情况，其他的情况处理一下之后就**交给** `skip_factorial(n - 2)`了。
这个“交给”正是与这一道涉及生成器的题目相同的抽象。下述是实现：

```python
def primes_gen(n):
    """Generates primes in decreasing order.
    >>> pg = primes_gen(7)
    >>> list(pg)
    [7, 5, 3, 2]
    """
    if n == 1:
        return
    if is_prime(n):
        yield n
    yield from primes_gen(n - 1)
```

上述对“交给”（委派）的阐述即是利用`yield from`构造了生成函数的递归。
## Q5: Partitions

注意这里的`for`遇到了 `yield` 时就与我们熟悉的执行顺序（一股脑全部执行完）不相同了：每次都会在`yield`那里“停一下”，直到进行下次迭代。

```python
def partition_gen(n, m):
    """Yield the partitions of n using parts up to size m.

    >>> for partition in sorted(partition_gen(6, 4)):
    ...     print(partition)
    1 + 1 + 1 + 1 + 1 + 1
    1 + 1 + 1 + 1 + 2
    1 + 1 + 1 + 3
    1 + 1 + 2 + 2
    1 + 1 + 4
    1 + 2 + 3
    2 + 2 + 2
    2 + 4
    3 + 3
    """
    assert n > 0 and m > 0
    if n == m:
        yield str(m)
    if n - m > 0:
        "*** YOUR CODE HERE ***"
        # 使用m的情况: n > m
        for p in partition_gen(n - m, m):
            yield p + ' + ' + str(m)
    if m > 1:
        "*** YOUR CODE HERE ***"
        # 不使用m的情况: 此时 n < m且m > 1
        yield from partition_gen(n, m - 1)


```
## Q6: Bonk

[Study Guide: Orders of Growth | CS 61A Summer 2024](https://cs61a.org/study-guide/orders-of-growth/)

> Q6-Q8仅凭自己理解大概写的，没有系统了解 *Big O* ($O$) 和 *Big Theta* ($\Theta$)，可能有明显的符号使用不规范或过程中的错误，还望不吝赐教。

- Logarithmic

记 $bonk(i)$ 为该函数在参数为$i$的执行次数，
设 $bonk(1)=C$ ，
注意到
$$bonk(n)=1+ \lfloor bonk(n / 2) \rfloor$$
故
$$bonk(2^n)=n \times C$$
即为Logarithmic.
## Q7: Boom

[Study Guide: Orders of Growth | CS 61A Summer 2024](https://cs61a.org/study-guide/orders-of-growth/)

> Q6-Q8仅凭自己理解大概写的，没有系统了解 *Big O* ($O$) 和 *Big Theta* ($\Theta$)，可能有明显的符号使用不规范或过程中的错误，还望不吝赐教。

$\Theta(n^4)$

因为是$\Theta(n^2) \times \Theta(n^2)$。
## Q8: Boink

[Study Guide: Orders of Growth | CS 61A Summer 2024](https://cs61a.org/study-guide/orders-of-growth/)

> Q6-Q8仅凭自己理解大概写的，没有系统了解 *Big O* ($O$) 和 *Big Theta* ($\Theta$)，可能有明显的符号使用不规范或过程中的错误，还望不吝赐教。

$O(2^n)$

记 $boink(i)$ 为该函数在参数为$i$的执行次数，设 $boink(1)=C$ ，注意到 n = k 时，执行次数为
$$boink(k) = boink(1) + boink(2) + ... + boink(k - 1)$$
上述类似于数列中的
$$a(n)=S(n - 1)$$
又根据前n项和的定义有
$$a(n)=S(n)-S(n - 1)$$
故
$$S(n)=2S(n-1)=2^nS(1)=C \times 2^n$$
则
$$a(n)=S(n-1)=C\times2^{n-1}$$
即为$O(2^n)$。

上一篇：[[cs61a-disc04|Disc 04 树的递归]] · 下一篇：[[cs61a-disc07|Disc 07 树、链表]]
