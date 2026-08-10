---
preview_image: posts/migrated/post-images/csapp-bomblab.png
title: 'CSAPP · Bomblab'
date: 2024-04-30 11:09:39
tags:
- CSAPP
published: true
hideInList: false
feature: posts/migrated/post-images/csapp-bomblab.png
isTop: false
---
> 最近真没写什么其他好玩的东西，所以拿课堂作业报告水一水Blog。
> 因为写这个的时间很有限，可能不像datalab那样精致，是边做边记的，逻辑有点混乱，也有不少错误。

## 效果截图

![](posts/migrated/post-images/1714446702306.png)

各phase答案:

```
sudo hostnamectl set-hostname ubuntu

Brownie, you are doing a heck of a job.
0 1 1 2 3 5
0 u 81
5 15 DrEvil
5>:?70
5 1 2 3 6 4
50
```

## secret_phase: 二叉树搜索

读入整数，整数，字符串
`b secret_phase`
edx: a
esi: 0
rdi: &input_str
rbx: rax=int(input_str)=input_int
rax: input_int - 1
u<=3e8, so 1 ≤ input_int ≤ 3e9
esi: input_int
`x/512x 0x604110`

![](posts/migrated/post-images/1714446733981.png)
![](posts/migrated/post-images/1714446738318.png)
![](posts/migrated/post-images/1714446742148.png)

24
8    **32 (50)**
6  16  2d  6b
1 7  14 23  28 2f(47)  63 3e9(1001)

要求fun7的返回值为1
**fun7**
参数1: edi=edx，开始时是树的根节点
参数2: esi，input_int

if (input_int >= 根节点的值):
	+28
	eax = 0
	edx = input_int时直接跳出返回
	否则参数1: edi根节点变右节点，嵌套一层，但注意这里是**call**而不是jump，意味着过去完还要回来的，而且保存返回值
	走右边: 返回值翻倍再加一
< :
	+15
	去左节点: 返回值翻倍

但注意上述返回值的变化是从叶到根生效，是倒序的
所以大于就往右走，小于就往左走
既然返回值为1，而返回值初始为0，往右走一步就跳出就可以，意味着被调用函数返回值为0，之后向右执行一步得到1，返回即可。
注意读到的0x32等于`50`。

## phase_6: 链表排序

读入六个整数
rsi: %rsp，其实是&num1


循环1开头:
r12: &num1
r13d: 0
rbp: &num1
eax: num1 - 1 unsigned <= 5
要求num1 - 1 >= 0，1 <= num1 ≤ 6
r13d: 1
执行满六次之后跳+134

循环2:
+73到+98
ebx: 1
eax: num2
要求num1 != num2
ebx++，小于等于5时继续循环这一块，如上执行五次，
要求num1 != num2, num2 != num3, num3 != num4, num4 != num5, num5 != num6

循环1结尾:
+100
r12: &num1→&num2
所以意味着以上类似要求执行了6次，
即要求 1 <= num1, ..., num6 ＜= 6
之后跳134

+134
esi = 0
+139开始是第三循环体
ecx = num1
eax = 1
edx = node1
if (num1＞1):
	goto 106
else (num1 == 1):
	goto 117

![](posts/migrated/post-images/1714446756176.png)

+117
rsp+20 = node1
再执行5次，也就是挑好了合适的，numx的值为y则对应nodey

+159跳出第三循环体，进入第四循环（其实还有第五循环套在这一层外面）
rbx=node1，不是->val

第四循环
rax=node1
rsi=node6
rcx=node1->val?还是node1? node1吧
循环体：+177
rdx=node2
node1->next=node2?
rax=node2
rcx=node2
总之第四循环就是把node1到6按顺序连起来
吧

+197跳出第四循环，回到第五循环
node6->next = null
ebp=5
rax=node2->val
要求node1->val > node2->val
rbx变node2，ebp--，循环五次意味着节点值从node1到node6递减
因此只要找合适的num值使前述节点排列成递减即可，即值顺序为 `5 1 2 3 6 4`。

综上，这次phase没有a\[i] = 7 - a\[i]，应该相对还行。


## phase_5

### 版本1: 数组对应

输入字符串长度为6
%rax: &字符串，之后右移，属于循环变量
%rbx: &字符串
%rdi: 字符串结尾，属于循环条件
%ecx: 0
%edx: 第一个字符与0xf，即取低四位作为数组下标，对应出另一个整数，加到%ecx中
观察`x/16 0x402780`得到如下关系：

![](posts/migrated/post-images/1714446769510.png)

在跳回之前我们观察结束条件，%ecx=0x3f=63，也就是六个字符的下标对应出的数字之和为63.
可取16+15+14+13+3+2，即下标为5, 14, 10, 15, 7, 0, 比如可以取48+这些数：`5>:?70`
注意不能用32+这些数，因为空格会在类scanf的函数中读值时自动被忽略掉。

### 版本2: 数组跳转

| 数组下标 | 值   |     | 数组下标 | 值   |
| ---- | --- | --- | ---- | --- |
| 0    | a   |     | 8    | 0   |
| 1    | 2   |     | 9    | 4   |
| 2    | e   |     | a    | 1   |
| 3    | 7   |     | b    | d   |
| 4    | 8   |     | c    | 3   |
| 5    | c   |     | d    | 9   |
| 6    | f   |     | e    | 6   |
| 7    | b   |     | f    | 5   |

第一个数只取最低四位做入口，x/不能等于0xf
第一个数edx加完后 = 0xf，执行15次
第二个数等于rcx

读出该程序干的事情是加15次数组元素，其中最后一次一定加的是f，我们需要输入的是第一个下标以及加和。
不妨倒推，f+6+e+2+1 +a+0+8+4+9 +d+b+7+3+c = 115
那么我们第一个下标对应值c，即入口是5，加和是115。

## phase_4: 二分查找

读入整数：
rcx(arg4) = rsp + 4 = &num2
rdx(arg3) = rsp = &num1
esi(arg2) = "%d %d"

需要我们输入两个整数，盲猜可以进secret phase。
要求0 <= num1 <= 0xe，
rdx = 0xe(arg3) 上界
esi = 0(arg2) 下界
edi = num1(arg1)
call func4, **要求返回值等于0xf**
要求num2=0xf，此时phase_4全部结束

**func4**
传入了三个参数: num1(edi), 0(下界, esi)，0xe(上界, rdx)
eax = 0xe - 0 = 0xe
ebx = 0xe 逻辑右移 0x1f=31位，变0了吧，目测是看符号位
eax = 0xe + 0 = 0xe，算术右移变0x111=7，也就是做了作差除以2下取整
ebx = 0x(7 + 0)=0x7，中点值
跳+33
eax=0x7
ebx>=num1时直接返回
...
是二分查找，差值是符号判断，如果上面的差值为负值，则ebx得1，挪一挪eax，防止死循环的，所以不去考虑它也完全没关系

可以暴力从0x0到0xe直接试一遍，虽然容易手误
如果要仔细推理：在num为0到14，low初始为0，high初始为14的情况下怎样返回15呢？
尤其是，为什么num == 5时会返回15？因为我们每次都加了每次计算出的中间值，
所以：
左右端点为0和14时返回值+7，
左右端点为0和6时返回值+3；
左右端点为4和6时返回值+5。
返回值初始为0，完成上述查找得到返回15。

## phase_3: 跳转表

注意输入是 `%d %c %d`
分别传到 %rsp+10, %rsp+f, %rsp+14，换回了数字 数字 字符的顺序
num1 unsigned > 7时，炸
也就是说0 <= num1 ≤ 6，
根据num1的值跳到跳转表相应位置，从而执行相应switch的结构。
既然switch的default执行+319，我们先不看跳转表，直接看+319。
传入的%c等于%rax的最低位字符即可。
接下来看跳转表。
我们用 `x/a 0x402740`发现为+77，意味着%rax=num1=0时，执行+77，此时：
%eax=0x75，num2 = 0x51=81。所以c = 0x75=`u`即可，这个字符可通过 `Alt + 小键盘117` 得到。
答案为 `0 u 81`

## phase_2: 斐波那契数列

%rsi参数2的值是%rsp，给read_six_numbers
利用read_six_numbers将参数3-8读入%rsi, %rsi+4, ..., %rsi+14共六处，对应于%rsp, %rsp+4, ..., %rsp+14共六处
num1=0
num2=1
%rbx=&num1
%rbp=&num5

%eax = num2 = 1
num2 += num1 = 1
num3 = %eax = 1
%rbx = &num2

%eax = num3 = 1
%eax += num2 = 1+1=2
num4 = %eax = 2

0 1 1 2 3 5

## phase_1: 比较字符串

strings_not_equal的返回值(%eax)为0就跳出去，意味着要求All strings are created equal. 识得唔识得啊。

从相应位置读入所需字符串即可。

上一篇：[[csapp-datalab|Datalab]] · 下一篇：[[csapp-attacklab|Attacklab]]
