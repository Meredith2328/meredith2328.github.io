---
title: minitorch
date: 2026-01-05 20:26:02
tags:
- 机器学习
published: true
hideInList: false
feature: null
isTop: false
---

项目文档链接：[MiniTorch](https://minitorch.github.io/)
项目仓库：[minitorch/minitorch: The full minitorch student suite.](https://github.com/minitorch/minitorch)

我的实现：[Meredith2328/minitorch: The full minitorch student suite.](https://github.com/Meredith2328/minitorch)
（完成√并整理√了Fundamentals, ML Primer, AutoDiff, Tensors, 
完成了Efficiency部分，未涉及Networks部分。）

另外推荐参考这个，写得比我多得多：[MiniTorch-学习全攻略.pdf](https://dezeming.top/wp-content/uploads/2022/02/MiniTorch-%E5%AD%A6%E4%B9%A0%E5%85%A8%E6%94%BB%E7%95%A5.pdf)
## 项目整体介绍

MiniTorch是一个基于Python基础语法或Numpy，并进一步使用Numba和CUDA对矩阵运算进行优化，以实现符合PyTorch接口的一个简易版PyTorch的项目。
原项目来自于康奈尔大学由Sasha Rush老师教授的机器学习系统课程 [MiniTorch](https://minitorch.github.io/) 。

目录：
- Fundamentals
- AutoDiff
- Tensor
- Efficiency
- Network

## 安装环境

![](posts/migrated/post-images/20250702081943.png)

将以下内容保存为requirements.txt并替换原始项目使用的requirements.txt和requirements.txt.extra：
```
backports.tarfile==1.2.0
colorama==0.4.6
datasets==2.21.0
embeddings==0.0.8
hypothesis==6.111.2
importlib-metadata==6.11.0
importlib-resources==6.4.0
jaraco.text==3.12.1
mypy==1.11.2
numba==0.60.0
plotly==5.24.0
pre-commit==3.8.0
pydot==3.0.1
pytest-env==1.1.3
pytest-runner==6.0.1
python-mnist==0.7
streamlit-ace==0.1.1
tomli==2.0.1
torch==2.4.0
numpy==1.24.0
streamlit==1.26.0
```

关于requirements的说明：
```
conda create -n myminitorch python==3.11
官方setup给的requirements有conflict，参考了pr里的requirements进行了修改
pip install -r requirements.txt
pip install -Ue .
之后发现torch版本很新、自动装的2.0的numpy不兼容，手动降级一下：
pip install numpy==1.24
以及跑Task0.5出了一些id重复的报错，判断是Streamlit版本新了一点加了检查，为了省去改代码的麻烦手动降级一下：
pip install streamlit==1.26.0

之后做到Efficiency(Task3那些)要用CUDA，我本地机CUDA==12.6，所以参考了pytorch官网的指令在环境里装gpu的pytorch：
pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu126
```

运行测试的方法举例：
```
pytest tests/ -m task3_1
```
## Fundamentals

Fundamentals：torch的算子`Operator`，模块`Module`等。
### 整体概念

> 我们在什么抽象层级下，使用什么工具，做成了什么事情？

抽象层级：Python和PyTorch基础函数之间
使用工具：Python基础（如math库、列表推导式、函数式编程等）
做成事情：实现除了最重要的数据结构“向量/矩阵”之外的PyTorch基础数据结构与函数

Task 0.1: Operators
使用Python的math库，开发诸如sigmoid, add, mul之类的函数。

Task 0.2: Testing and Debugging
编写Pytest。

Task 0.3: Functional Python
使用Higher order function、Currying、列表推导式等技巧编写map、zip、reduce。

Task 0.4: Modules
PyTorch的基本数据结构，概念上是一个树的节点，节点值包括 `Parameter` 的字典、和 `training` 等属性。比如自定义一个网络就要继承 `nn.Module` 。
输入数据集，插入我们自定义的前述算子和模块，利用Streamlit库可视化，确保效果正确。在 `datasets.py` 中自定义了一些随机数据点（`d=2`），用于简单的演示。
概念上这里的数据点 `X.shape = (N, 2)` ，画在图像上即是xOy平面的一些数据。绘制时，x的范围为0~1，y的范围为0或1。

Task 0.5: Visualization
之前的数据集是直接随机设置的，现在需要用PyTorch实现网络和数据集。`run_torch.py` 提供最小的网络和训练循环实现。
### 实现细节

1. 注意true置为1.0，false置为0.0。

2. 类型标识
> modern python语法: `Callable[[inputs], output]`
> 所有输入参数传为第一个列表参数 `[type]` ，输出为 `type` ，表示一个以`[type]`为输入参数、`type`为返回值的函数

```python
def map(fn: Callable[[float], float]) 
-> CallableIterable[float, Iterable[float]]:
```

解读为：
传入一个函数参数`fn`，输出一个函数。
`fn`的性质是输入一个`float`，输出`float`。
输出函数的性质是输入一个`Iterable[float]`即`float`的列表，输出`Iterable[float]`。

3. 关于 `sth.__dict__('attribute')` 的使用
传入字符串 `'attribute'` ，以获取 `sth.attribute` 。实现Module时需要。

4. 浮点用assert_close
多用`assert_close`而非`==`。

5. 关于nonlocal的使用
在嵌套函数中对自由变量(外部函数的)进行赋值时需要使用nonlocal，
只是读值时不需要。

6. 读一读run_torch.py
里面Linear在初始化时，有一个 `2 * (torch.rand(...) - 0.5)` 的操作。
这是因为 `torch.rand` 初始化得到的范围在 `[0, 1)` ，先 `-0.5` 、再 `*2` 得到 `[-1, 1)` 的范围。这样得到的均匀初始化值正负值平衡，范围合理。这个在这种简单的浅层网络是简单易行的初始化方法。
而对于稍微复杂一些的网络，像CNN、RNN之类的，则需要采用Kaiming和Xavier等初始化方法。
### 结果

最终成功跑通：
![](posts/migrated/post-images/20250702170517.png)
看起来streamlit是一个类似于tensorflow playground的可视化模块。

跑通task0_1到task0_4：
![](posts/migrated/post-images/20250702171057.png)
![](posts/migrated/post-images/20250702171143.png)

> ps. 这里有一个实现细节踩坑：
> operators.py里的函数不能相互依赖，比如sigmoid不能用同模块下的exp，但是可以用math.exp等，这是为了Efficiency一章numba能够识别相关函数。
## ML Primer

ML Primer：讲了一点机器学习基础，以二分类为例，无代码作业。

文中对ReLU的理解例子十分有趣，看一看：

> Neural networks are compound model classes that divide classification into two or more **stages**. Each stage uses a linear model to seperate the data. And then an _activation_ function to reshape it.
> 
> We would like **only** points in the green or yellow sections to be classified as X's.
> To do this, we employ an activation function that **filters** out only these points. This function is known as a **ReLU** function, which is a fancy way of saying "threshold".

![](posts/migrated/post-images/20250702173828.png)
![](posts/migrated/post-images/20250702173835.png)
只考虑其中一个分类边界，wx+b之后进行ReLU，只保留了黄色部分的z值、而负半轴的z值置为0（ReLU正半轴，对应前述黄色部分），
相当于对所有初始数据进行的一种变换h1得到了下述的h1值，可以把它们画到黄色轴上。
![](posts/migrated/post-images/20250702175034.png)
![](posts/migrated/post-images/20250702174044.png)

同理我们也可以对所有初始数据进行另一个变换得到h2，我们可以把它们画到上述绿色轴上。
![](posts/migrated/post-images/20250702175242.png)

有点像是把它们降维到轴上之后就很容易划分出两个轴上的边界点，从而得到边界线，即将两个不同的变换值整合在一块的一个线性变换：
![](posts/migrated/post-images/20250702175305.png)
![](posts/migrated/post-images/20250702174044.png)

再升维回去，直接考虑整个图像的效果就得到了一个非线性的分类边界：
![](posts/migrated/post-images/20250702174129.png)

> Mathematically we can think of the transformed data as values h1,h2 which we get from applying separators with different parameters to the original data. 
> The final prediction then applies a separator to h1,h2.
![](posts/migrated/post-images/20250702174343.png)


## AutoDiff
### 整体概念

> edit time: 2026-03-02 18:21:05

Autodiff：实现标量`scalar`，自动求导，并实现反向传播算法。
（这时候已经能拿来跑模型训练了，但是因为没有并行所以效率很低）
代码范围：`autodiff.py` ，`scalar_functions.py` ，`scalar.py` 。

Task 1.1: Numerical Derivatives
为了优化模型参数，我们需要求出损失函数对参数的导数。而对于模型形式比较复杂的情况时，我们不太能（同时也不划算）通过求表达式的方式求得导数，而应该使用中心微分这样的数值方法得到导数的近似。
形式化地，为了求得 $\frac{\partial L}{\partial x}$ ，我们使用 $\frac{\partial L(x + \epsilon) - L(x - \epsilon)} {2\epsilon}$ 。

Task 1.2: Scalars
实现第一个最重要的数据结构：退化的Tensor，即Scalar。
在每个scalar进行forward时，需要存储一些内容用于backward计算。
`x.backward()` 实际上是给构造 `x` 所需的所有变量填入导数的过程。

Task 1.3: Chain Rule
拿来已经算好的，算完自己的，乘上去整理一下就返回。

Task 1.4: Backpropagation
实现就两句话：
得到逆拓扑排序。逆拓扑排序是正拓扑排序反过来，正拓扑排序是后根遍历dfs。
有了排序顺序，按顺序调用并计算导数。叶子节点积累上去，中间节点给别人做嫁衣。

Task 1.5: Training
已经可以实现训练了。在一些数据点上做简单的训练。

总而言之，Autodiff在标量 `Scalar` 尺度上，建立了整个计算图的概念。
### Numerical Derivatives

> modern python语法：**打包与解包**
> 
> 打包：函数内使用参数
> `def central_difference(f: Any, *vals: Any, arg: int = 0, epsilon: float = 1e-6) -> Any:` 
> （这里会把中间的参数全部打包成一整个元组vals）
> 
> 解包：函数外传入参数
> `return (f(*valsAdd) - f(*valsSub)) / (2 * epsilon)`
> （这里需要在元组前加入解包的\*符号才能传入n个参数）

注意使用中心差分，所以是 `(f(x + h) - f(x - h)) / 2h` 而不是我们习惯的单`h`求导方式
~~查完wiki发现MiniTorch的页面有写知识点hhhhhh~~

### Scalar
#### ScalarHistory

> Autodifferentiation works by **collecting information about the computation path** used within the function, and then transforming this information into a procedure for computing derivatives. Unlike the black-box method, autodifferentiation will allow us to use this information to compute each step more precisely.

需要实现**跟踪计算**。

在每个scalar进行forward时，需要存储一些内容用于backward计算。这就是ScalarHistory的作用。

ScalarHistory包括：
某个Scalar所执行的最后一个ScalarFunction，
调用该函数时的输入参数inputs，
执行backward所需的“Context”（是否启用grad、以及forward时存储的内容）。

举个例子：
```
>>> import minitorch
>>> x1 = minitorch.Scalar(10)
>>> x2 = minitorch.Scalar(20)
>>> y = x1 + x2
>>> y.history
ScalarHistory(last_fn=<class 'minitorch.scalar_functions.Add'>, ctx=Context(no_grad=False, saved_values=()), inputs=[Scalar(10.000000), Scalar(20.000000)])
```

所以这里的思想同样是通过每一步多记录信息（包括将数值和计算函数进行包装），为我们整体求导提供方便。
#### 类方法、工厂方法知识

> modern python语法：**类方法**

在 Python 中，_cls_ 是类方法的第一个参数，用于表示类本身。
它类似于实例方法中的 _self_，但 _self_ 代表的是类的实例对象，而 _cls_ 代表的是类对象。

- 类方法：使用 _@classmethod_ 装饰器定义，第一个参数必须是 _cls_，用于访问类变量和其他类方法。
- 静态方法：使用 _@staticmethod_ 装饰器定义，不需要 _self_ 或 _cls_ 参数，不能访问类变量。

```python
class MyClass:
	class_variable = "I am a class variable"
	
	@staticmethod
	def static_method():
		print("I am a static method")
	
	@classmethod
	def class_method(cls):
		print(cls.class_variable)
```

之后理一下ScalarFunction的结构：
这里使用了静态类和cls上下文来组织代码。
cls是具体的类，所有类都需要在调用自身实现的forward的同时，进行统一输入类型、和创建context等操作，所以将这些统一的操作写到静态的ScalarFunction里。
这样的好处是，**每个具体类都只需要关心具体的function实现**，而无须考虑接口处理问题。

> 软件工程知识：**工厂方法**

定义一个工厂类（`ScalarFunction`），它可以根据参数的不同返回不同类的实例（apply类方法），被创建的实例通常都具有共同的父类（Scalar），这正是*简单工厂模式*。
（重复一遍，简单工厂模式根据不同传入参数创建不同实例。）
而将实例创建的具体逻辑不统一在工厂类、而是交予专门的工厂子类完成（如Add等），这正是更进一步的**工厂方法模式**。工厂类只要简单地调用工厂子类变量`cls`即可。

```python
class ScalarFunction:

    @classmethod
    def _backward(cls, ctx: Context, d_out: float) -> Tuple[float, ...]:
        return wrap_tuple(cls.backward(ctx, d_out))  # type: ignore

    @classmethod
    def _forward(cls, ctx: Context, *inps: float) -> float:
	    # _forward和_backward一个解包一个装包, 规整一点, 具体逻辑留给具体类
        return cls.forward(ctx, *inps)  # type: ignore

    @classmethod
    def apply(cls, *vals: "ScalarLike") -> Scalar:
	    ...
	    # 感觉这里也可以直接调用cls.forward呢，
	    # 或许是为了代码规整，一个_forward一个_backward都写在静态类里
	    # 这样的话forward只用写具体逻辑了
        c = cls._forward(ctx, *raw_vals)
```

#### Protocol知识

> edit time: 2026-03-02 16:48:31

在autodiff.py中有这样一个地方引起了我的注意：
```python
from typing_extensions import Protocol

class Variable(Protocol):
    def accumulate_derivative(self, x: Any) -> None:
        pass

    @property
    def unique_id(self) -> int:
        pass

    def is_leaf(self) -> bool:
        pass

    def is_constant(self) -> bool:
        pass

    @property
    def parents(self) -> Iterable["Variable"]:
        pass

    def chain_rule(self, d_output: Any) -> Iterable[Tuple["Variable", Any]]:
        pass
```

之前在听C++之父的讲座时就注意到了“Protocol”这个名词，但没有了解过。正好趁这个机会看一看它和抽象基类的区别：
这里有特别形象的叫法“鸭子类型”，源自“长得像鸭子、叫声像鸭子”的那个说法：
例如我在使用变量时“约定”需要某些方法，这些方法整理到Variable类里。
而在实现自己的Scalar和Tensor、并用作变量时，Scalar和Tensor不必显式继承Variable，而是直接实现Variable中提到的方法，编译器就知道所有方法满足了，确实是一个Variable，从而可以使用。
传统方法是必须有一个抽象基类有这些方法、子类实现这些方法：“必须继承，必须是鸭子的后代”。Protocol相对来说解耦更好、更灵活轻量。

| 场景     | 推荐           | 原因             |
| ------ | ------------ | -------------- |
| 自己的小项目 | 都可以          | 怎么舒服怎么来        |
| 库/框架设计 | **Protocol** | 不强迫用户继承你的类     |
| 需要默认实现 | ABC          | Protocol 不能有实现 |
| 第三方库集成 | **Protocol** | 不能修改别人的代码      |
| 明确继承关系 | ABC          | "is-a" 关系明确时   |

#### 其他实现细节

1. debug

```python
        c = cls._forward(ctx, *raw_vals)
>       assert isinstance(c, float), "Expected return type float got %s" % (type(c))
E       AssertionError: Expected return type float got <class 'int'>
E       Falsifying example: test_one_args(
E           fn=('exp', exp, exp),
E           t1=Scalar(0.000000),  # or any other generated value
E       )

minitorch\scalar_functions.py:64: AssertionError
```

思考：为什么c是int，为什么_forward返回了一个int。追踪！
通过给Neg加print打印类型检错，发现传入int之后加neg还是int。
在operator里加了个强制转换，解决了问题。
```python
def forward(ctx: Context, a: float) -> float:
	# print('type of a here is ', type(a))
	# print('type of neg(a) here is ', type(operators.neg(a)))
	return operators.neg(a) # 这里需要强制加个转换, 好奇怪
```

```
type of a here is  <class 'int'>
type of neg(a) here is  <class 'int'>
```

```python
def neg(x: float) -> float:
    "$f(x) = -x$"
    return -float(x)
```

2. 关于Scalar Sandbox的mean
可能会看到在Streamlit打开的Scalar Sandbox里面，Function Type选择Reduce时会报错，显示AttributeError: 'list' object has no attribute 'mean'之类的。
这是正常的。 ~~其实是原作者的小巧思~~ 因为我们的 `class Scalar` （scalar.py）并没有实现mean方法：一个标量有什么平均值可言呢？
相比起来，`class Tensor` （tensor.py）的相关方法就不报错了。

3. 关于类的定义
在写完Scalar这样一个有丰富的方法的类之后，我觉得很值得开一个解释器把minitorch给import进来，然后开始玩。用 `x.__dict__` 获取 `x` 的所有属性、或者用 `dir(x)` 获取 `x` 的所有方法，然后逐个地玩一玩看看是不是理解它们的作用了。
“随便玩一玩”对于理解一个模型太重要了。理解绝对不能停留在文章写出来的和测试测出来的，而是要通过“自己提出的测试”全面地认识它。

以下是一些基础的玩：

```
(myminitorch) PS D:\_Project\minitorch> python
Python 3.11.0 | packaged by conda-forge | (main, Oct 25 2022, 06:12:32) [MSC v.1929 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>> import minitorch
>>> x1 = minitorch.Scalar(10)
>>> x2 = minitorch.Scalar(20)
>>> y = x1 + x2
>>> y.history
ScalarHistory(last_fn=<class 'minitorch.scalar_functions.Add'>, ctx=Context(no_grad=False, saved_values=()), inputs=[Scalar(10.000000), Scalar(20.000000)])
>>> dir(y)
['__add__', '__annotations__', '__bool__', '__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__getstate__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__mul__', '__ne__', '__neg__', '__new__', '__radd__', '__reduce__', '__reduce_ex__', '__repr__', '__rmul__', '__rtruediv__', '__setattr__', '__sizeof__', '__str__', '__sub__', '__subclasshook__', '__truediv__', '__weakref__', 'accumulate_derivative', 'backward', 'chain_rule', 'data', 'derivative', 'exp', 'history', 'is_constant', 'is_leaf', 'log', 'name', 'parents', 'relu', 'sigmoid', 'unique_id']
>>> y.__dict__
{'unique_id': 3, 'data': 30.0, 'history': ScalarHistory(last_fn=<class 'minitorch.scalar_functions.Add'>, ctx=Context(no_grad=False, saved_values=()), inputs=[Scalar(10.000000), Scalar(20.000000)]), 'derivative': None, 'name': '3'}
>>> y.data
30.0
>>> y
Scalar(30.000000)
>>> y * 2
Scalar(60.000000)
>>> y / 2
Scalar(15.000000)
>>> y is True
False
>>> y == True
Scalar(0.000000)
>>> if y:
...     print(1)
...
1
>>> y < 50
Scalar(1.000000)
>>> y.log()
Scalar(3.401197)
>>> y.exp()
Scalar(10686474581524.462891)
>>> y.sigmoid()
Scalar(1.000000)
>>> y.relu()
Scalar(30.000000)
```

以下通过玩，意识到了accumulate_derivative的含义（真的是在“累加”梯度，即如果有多个变量依赖于相同变量，则它们backward的梯度会被累加！）。
与此同时，意识到在多次backward之间，应该清空梯度，不然多次反向传播的值会累加在一起，得到无意义的值。
ps. 在Scalar的实现中的梯度叫做x.derivative，而不是PyTorch的Tensor的x.grad。要注意。

```
>>> y = 3 * x1 + x2
>>> x1.__dict__
{'unique_id': 1, 'data': 10.0, 'history': ScalarHistory(last_fn=None, ctx=None, inputs=()), 'derivative': 2.0, 'name': '1'}
>>> y.__dict__
{'unique_id': 22, 'data': 50.0, 'history': ScalarHistory(last_fn=<class 'minitorch.scalar_functions.Add'>, ctx=Context(no_grad=False, saved_values=()), inputs=[Scalar(30.000000), Scalar(20.000000)]), 'derivative': None, 'name': '22'}

>>> y.backward()
>>> x1.__dict__
{'unique_id': 1, 'data': 10.0, 'history': ScalarHistory(last_fn=None, ctx=None, inputs=()), 'derivative': 5.0, 'name': '1'}
>>> x2.__dict__
{'unique_id': 2, 'data': 20.0, 'history': ScalarHistory(last_fn=None, ctx=None, inputs=()), 'derivative': 2.0, 'name': '2'}

>>> x1.derivative = 0.0
>>> x2.derivative = 0.0
>>> y.backward()
>>> x1.__dict__
{'unique_id': 1, 'data': 10.0, 'history': ScalarHistory(last_fn=None, ctx=None, inputs=()), 'derivative': 3.0, 'name': '1'}
>>> x2.__dict__
{'unique_id': 2, 'data': 20.0, 'history': ScalarHistory(last_fn=None, ctx=None, inputs=()), 'derivative': 1.0, 'name': '2'}
```

这个对应于PyTorch的以下做法：
```
import torch
x = torch.tensor(2.0, requires_grad=True)
optimizer.zero_grad()  # 或 x.grad.zero_()
```

### Chain Rule

#### 整体理解

$$\frac{dz}{dx}=\frac{dz}{dy} \cdot \frac{dy}{dx}$$
对于函数 $y(x, \dots)$ ，
要求 $z$ 对 $x$ 的导数，只需要求出当前函数 $y$ 对 $x$ 的导数，然后把以前计算过的导数乘到前面（例如 $z$ 对 $y$ ）。这就是链式法则。

链式法则的实现被包装到了scalar_functions.py中每个函数的 `backward` 方法中。
这个方法接受 `d_output` （“以前计算过的导数”），把它乘到当前函数求得的导数上。
上述实际上应该是每个函数内部的抽象层级，而不是整体计算图的抽象层级。

这样的思考解耦并简化了我们对整个反向传播过程的思考：我们只要按照逆拓扑排序顺序，对每个函数执行 `backward` 、并逐个地对它们的父节点也执行 `backward` 即可。
#### 关键代码

调用 `_backward` 对当前函数求导并乘以以前计算过的导数。

```python
    def chain_rule(self, d_output: Any) -> Iterable[Tuple[Variable, Any]]:
        '''计算当前函数对所有变量的偏导数, 并将它们与对应变量配对返回。'''
        h = self.history
        assert h is not None
        assert h.last_fn is not None
        assert h.ctx is not None
        
        derivatives: Tuple[float, ...] = h.last_fn._backward(h.ctx, d_output) # Tuple[float, ...] 得到了对每个输入变量的偏导
        variables: Sequence[Scalar] = h.inputs
        return zip(variables, derivatives)
        

    def backward(self, d_output: Optional[float] = None) -> None:
        """
        Calls autodiff to fill in the derivatives for the history of this object.

        Args:
            d_output (number, opt): starting derivative to backpropagate through the model
                                   (typically left out, and assumed to be 1.0).
        """
        if d_output is None:
            d_output = 1.0
        backpropagate(self, d_output)
```


****

#### 实现细节

将每个函数理解成一个黑箱操作，输入了上一个黑箱的结果，函数调用层层**嵌套**，
每次求导就是逆黑箱的过程，输入了上一次逆黑箱的结果，求导结果依次**相乘**。

每次backward就是每个逆黑箱求导的具体过程，即求导并乘d_output。
例如forward是log(a)，一个输入变量a，
那么backward输出也只有结果对a求导得到的一个值再乘d_output，即d_output / a。
再例如forward是a+b，两个输入变量a和b，
那么backward输出是结果对两个变量分别求偏导得到的两个值、每个值乘d_output，即d_output和d_output。

```python
class Log(ScalarFunction):
    "Log function $f(x) = log(x)$"

    @staticmethod
    def forward(ctx: Context, a: float) -> float:
        '''保存a, 计算log(a)并返回'''
        ctx.save_for_backward(a)
        return operators.log(a)

    @staticmethod
    def backward(ctx: Context, d_output: float) -> float:
        '''取出保存的a, 根据传回的d_output, 计算d_output/a并返回, 即d_output f\'(x)'''
        (a,) = ctx.saved_values
        return operators.log_back(a, d_output)
```

那么chain rule就是将层层嵌套得到的最终函数一步步逆黑箱，得到计算结果。
为了编写chain rule，我们需要每个黑箱的信息。看看history是怎么记录的。
ps. last_fn其实是当前要计算处理的function的意思，至于为什么叫last后面就知道了
```python
    last_fn: Optional[Type[ScalarFunction]] = None
    ctx: Optional[Context] = None
    inputs: Sequence[Scalar] = ()
```

scalar实例是由一系列scalarFunction操作得到的。
在scalarFunction这个黑盒进行apply时将history以以下形式组织：

```python
# Create a new variable from the result with a new history.
back = minitorch.scalar.ScalarHistory(cls, ctx, scalars)
return minitorch.scalar.Scalar(c, back)
```

即back存储了当前黑盒的cls、ctx和输入值scalars。这足以逆黑盒计算导数。
cls: 当前黑盒是什么scalarFunction
scalars: 当前黑盒的全部输入变量
ctx: forward时记录的变量，现在直接传进去用就行，后面应该会提到

回到scalar定义的chain_rule接口及相关要求。
```python
def chain_rule(self, d_output: Any) -> Iterable[Tuple[Variable, Any]]:
```

> Implement the chain_rule function in Scalar for functions of arbitrary arguments. This function should be able to backward process a function by passing it in a context and \(d\) and then **collecting the local derivatives**.
>  It should then **pair these with the right variables** and return them.
>  This function is also where we filter out constants that were used on the forward pass, but do not need derivatives.

d_output我们知道是backward里面用到要乘的数值，我们要计算的是 d_output \* f'(x)。
仍然以一个简单的例子为例：
假设输入值为`2.0`, 经过一个`log`，得到了`log(2.0)`。设`d_output = 1`
那么我们当前一步的求导一定是：`1 * log'(2.0)`
即执行了：
1. collecting the local derivatives，即对last_fn进行backward得到全部偏导组成的tuple。
2. pair these with the right variables，即再进行一个zip操作。

根据测试里的顺序可以看到每个pair的variable在前面、derivative在后面。
### Backpropagate

#### 整体理解

随着计算图的构建，
一开始的变量（输入变量）作为叶子节点，最终的变量作为树根，形成了一个树结构。
反向传播就是由最终节点（往往是损失函数）的值，通过链式法则，获得输入变量的导数的过程。我们只需要填入输入变量（如下述 `z1` ）的导数，而不需要管其他变量（如下述 `z2`）。

反向传播实际要做的事情是：
对整个计算图的所有函数节点按照逆拓扑排序顺序（先叶子、再父节点）调用 `backward` 。

```
>>> z1 = minitorch.Scalar(50)
>>> z2 = z1 * 2
>>> z3 = z2 * 3
>>> z3.backward()
>>> z1.__dict__
{'unique_id': 23, 'data': 50.0, 'history': ScalarHistory(last_fn=None, ctx=None, inputs=()), 'derivative': 6.0, 'name': '23'}
>>> z2.__dict__
{'unique_id': 25, 'data': 100.0, 'history': ScalarHistory(last_fn=<class 'minitorch.scalar_functions.Mul'>, ctx=Context(no_grad=False, saved_values=(50.0, 2)), inputs=[Scalar(50.000000), Scalar(2.000000)]), 'derivative': None, 'name': '25'}
>>> z3.__dict__
{'unique_id': 27, 'data': 300.0, 'history': ScalarHistory(last_fn=<class 'minitorch.scalar_functions.Mul'>, ctx=Context(no_grad=False, saved_values=(100.0, 3)), inputs=[Scalar(100.000000), Scalar(3.000000)]), 'derivative': None, 'name': '27'}
```

#### 关键代码

首先获得正拓扑排序（通过dfs），然后整个逆序就得到了逆拓扑排序。

以下是“正”拓扑排序的思考：
符合后序遍历的顺序，即“**一定先处理完所有依赖，才能处理当前节点**”。
这样的话，我们对最终的节点调用了拓扑排序，生成一个从依赖开始的拓扑排序顺序。

再把它倒过来：
我们这里不是前序计算结果，而是后序计算梯度，需要从把值（前述“计算过的梯度”）从依赖节点传播向被依赖节点。因此需要在上述“正”拓扑排序的基础上整个倒过来，变成逆拓扑排序。
这样的话相当于从最终函数开始传播，直到传播到输入变量，谓之“反向传播”是也。

```python
def topological_sort(variable: Variable) -> Iterable[Variable]:
    """
    Computes the topological order of the computation graph.

    Args:
        variable: The right-most variable

    Returns:
        Non-constant Variables in topological order starting from the right.
    """
    visited = set()
    order = []

    def dfs(node: Variable):
        if node.unique_id in visited or node.history is None:
            return
        visited.add(node.unique_id)
        for parent in node.parents:
            dfs(parent)
        order.append(node) # 这里生成正拓扑排序
        
    dfs(variable)
    return order[::-1]
```

已经得到了var的chain_rule调用和积累顺序，把中间值临时存在 `deriv_dict` 里。
对于每一个变量，从 `deriv_dict` 取得当前已积累给这个变量的 `d_out` ，
如果已经到输入变量则写入，否则将 `d_out` 传入并调用该变量的 `chain_rule` ，以获得信息写入 `deriv_dict` 。
叶子节点做积累，中间节点积累别人。

```python
def backpropagate(variable: Variable, deriv: Any) -> None:
    """
    Runs backpropagation on the computation graph in order to
    compute derivatives for the leave nodes.

    Args:
        variable: The right-most variable
        deriv  : Its derivative that we want to propagate backward to the leaves.

    No return. Should write to its results to the derivative values of each leaf through `accumulate_derivative`.
    """
    sorted_vars_order: Iterable[Variable] = topological_sort(variable)
    deriv_dict = {variable.unique_id: deriv}
    for var in sorted_vars_order:
        d_out = deriv_dict.get(var.unique_id, None)
        if (var.is_leaf()):
            var.accumulate_derivative(d_out)
        else:
            for parent, d_parent in var.chain_rule(d_out):
                if (parent.unique_id not in deriv_dict):
                    deriv_dict[parent.unique_id] = d_parent
                else:
                    deriv_dict[parent.unique_id] += d_parent
```


****

> The key implementation challenge of backpropagation is to make sure that we process each node in the correct order, i.e. we have first processed every node that uses a Variable before that varible itself.

[Backpropagate - MiniTorch](https://minitorch.github.io/module1/backpropagate/#running-example)

这一段看起来难理解一点，那就慢慢读，步步为营，小步快跑
![](posts/migrated/post-images/20250707212822.png)

![](posts/migrated/post-images/20250707213331.png)
- 第一层
首先是最后一个黑盒 ~~橘盒~~ 即 $+$ 输出的 $h(a, b)=a + b, a = log(z), b = exp(z)$
**每次反黑盒都是黑盒的输出变量通过黑盒的函数形式对输入变量逐个求偏导的过程。**
进行第一个反黑盒backward计算，得到$h$对两个输入变量$a, b$各自的偏导数。

- 第二层
接下来假设先对上面那个节点进行处理，a自顾自地对z反黑盒（先拿到了偏导数用来乘，再让a对z求导，把用来乘的值和求导值乘起来）
![](posts/migrated/post-images/20250707213447.png)

再对下面黑盒处理，b对z反黑盒
![](posts/migrated/post-images/20250707213747.png)

根据链式法则，为了将这一步两个反黑盒与前一步反黑盒结合起来、得到h对z的导数，除了前述“拿到偏导数用来**乘**”的步骤，还要把这一步两个反黑盒得到的值**加**起来。
（某一层有多个对相同变量的反黑盒，得到的导数要加起来）

- 第三层
最后一层反黑盒。拿汇合的导数值作为乘数，乘以z分别对x和y的偏导，就得到了结果： `x.derivative`和`y.derivative`，即**h对x和y的偏导**。
![](posts/migrated/post-images/20250707214230.png)
有趣的是，在以上的过程中，每个变量及中间变量（如h、a、b、x、y）都有保存的导数。
第一层反黑盒传入的导数是h对h，输出了**h对a**和**h对b**；
第二层反黑盒传入的导数是h对a和h对b，先计算了a对z和b对z，再输出了**h对z**；
第三层反黑盒传入的导数是h对z，先计算了z对x和z对y，再输出了h对x和h对y。
上述加粗的存储入以被求导变量为键的字典用于后续计算使用，而最后的变量（leaf variable, x和y）被存储（如 `x.derivative, y.derivative`）。

> Backpropagate Algorithm：反向传播算法

0. Call topological sort to get an ordered queue
1. Create a dictionary of Scalars and current derivatives
2. For each node in backward order, pull a completed Scalar and derivative from the queue: 
- a. if the Scalar is a leaf, add its final derivative (`accumulate_derivative`) and loop to (1) 
- b. if the Scalar is not a leaf,
	- a. call `.chain_rule` on the last function with $d_{out}$
	- b. loop through all the Scalars+derivative produced by the chain rule
	- c. accumulate derivatives for the Scalar in a dictionary

之后实现了拓扑排序、实现了反向传播，再实现算子的backward，就搞定了这一段。
其中实现算子的backward时，需要什么变量，forward就存过来什么变量。（也可以为了节省计算而存入一些计算好的值，我这里直接传变量再算一遍了）
完结撒花。

![](posts/migrated/post-images/20250707232057.png)

## Tensors

### 整体概念

> edit time: 2026-03-04 20:34:31

Tensor：把标量`scalar`扩充成张量`Tensor`，与Pytorch使用的数据结构保持一致。
本部分的重点在于“数据并行”。写适宜于并行的方法，写适宜于并行的结构，符合实际的工程实践，并为以后的进一步优化做准备。
在Autodiff（Scalar）基础上主要引入的新东西是index和broadcasting，以及三个operations的实现。值得好好思考。

Tasks 2.1: Tensor Data - Indexing
引入了index, stride和shape的三大概念，理解tensor内部实际上始终是一维数组，只是可以通过index这样元组式的索引方式进行访问。这样除了引入了清晰性，还方便了broadcasting的实现。

Tasks 2.2: Tensor Broadcasting
广播。某个维度为1时可以广播复制，维度不够时可以在高维处添加1。

Tasks 2.3: Tensor Operations
在类似Scalar的实现基础上，为了能够把相同的操作广播到整个tensor上，引入了map、zip和reduce这三个关键函数。它们三个也正是下一章Efficiency的关键研究对象。

Tasks 2.4: Gradients and Autograd
和Autodiff部分相似，略。

Tasks 2.5: Training
和Autodiff部分相似，略。
### Tensor Data

> 彻底地重新读并整理了一遍tensor_data.py。
> edit time: 2026-03-04 16:37:57

TensorData是这样定义的：

```python
class TensorData:
    def __init__(
        self,
        storage: Union[Sequence[float], Storage],
        shape: UserShape,
        strides: Optional[UserStrides] = None,
    ):
```

要做这一部分，不如先玩一玩PyTorch本身的storage，shape和strides。
```
>>> import torch
>>> x = torch.tensor([1, 2, 3, 4, 5, 6])
>>> y = x[2:5]
>>> x
tensor([1, 2, 3, 4, 5, 6])
>>> y
tensor([3, 4, 5])
>>> x.storage()
 1
 2
 3
 4
 5
 6
[torch.storage.TypedStorage(dtype=torch.int64, device=cpu) of size 6]
>>> y.storage()
 1
 2
 3
 4
 5
 6
[torch.storage.TypedStorage(dtype=torch.int64, device=cpu) of size 6]
>>> x.storage()[2] = 100
>>> x
tensor([  1,   2, 100,   4,   5,   6])
>>> y
tensor([100,   4,   5])
>>> storage = torch.Storage([1.0, 2.0, 3.0, 4.0, 5.0, 6.0])
>>> t1 = torch.Tensor(storage).reshape(2, 3)
>>> t1
tensor([[1., 2., 3.],
        [4., 5., 6.]])
>>> x.storage_offset()
0
>>> y.storage_offset()
2
>>> t1.shape
torch.Size([2, 3])
>>> t1.stride()
(3, 1)
```

如果期望直观理解本部分的内容，可以通过streamlit的可视化显示进行debug。
非常直观。
#### index_to_position

由TensorData的index方法调用。

stride是在Tensor指定维度中从一个元素跳到下一个元素的步长，而shape是Tensor的形状。
也就是说stride是可以从shape推断得到的。直觉上，有：

```
position = np.dot(index, strides)
```

其中 `position` 是一维数组storage的索引，index是多维数组视角的元组索引，strides则是shape的另一种体现。
写成循环就是：

```python
def index_to_position(index: Index, strides: Strides) -> int:
    pos: int = 0
    for i, s in zip(index, strides):
        pos += i * s
    return pos
```

> 应该写循环而不是 `np.dot` ，不然后面写numba会报不支持。
> 唉，debug。

感觉stride是一个非常有用的思考方式，把多维的index映射到了一维的position，而且更大的步长总是位于index左边。
一开始没看知识讲解，看了之后感觉醍醐灌顶。
#### to_index（position_to_index）

在引入广播之后，index和position不再是一一对应。
引入广播时，我们没有改变低层的position，
而是创造了多组不同的index可以映射到相同的position。
但是反之，我们要求position（这里称为ordinal）所产生的index必须是唯一的，ordinal从 `0` 到 `size - 1` 应该得到如 `(0, 0), (0, 1), (0, 2), (1, 0), ...` 等等连续、唯一且不重复的index。
为此我们考察一下函数定义：

```
def to_index(ordinal: int, shape: Shape, out_index: OutIndex) -> None:
```

以上述的 `shape = (2, 3)` 为例，它对应了 `(3, 1)` 的stride，
从 `0` 到 `5` 的ordinal应该得到 `(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)` 。
观察发现，最右边的值是 `ordinal % 3` ，最左边的值是 `ordinal // 3` 。

如果还是想不太明白这里的实现，可以进一步考虑更复杂的例子：
`shape = (2, 3, 4), stride = (12, 4, 1)`
`(0, 0, 0), (0, 0, 1), ..., (0, 0, 3), (0, 1, 0), ..., (2, 2, 1), ...`
可见，从右往左为 `ordinal % shape[-1], ordinal // shape[-1] % shape[-2], ...` 
即把ordinal首先整除shape直到相应index位置，然后取模。

进而这里的实现就很明晰了：用一个中间变量存储对应当前位的ordinal值，取模得到当前位，然后整除得到下一次迭代的中间变量。

```python
def to_index(ordinal: int, shape: Shape, out_index: OutIndex) -> None:
    cur_pos = ordinal + 0 # 为了Module3并行, 不能修改循环变量的trick
    for i in range(len(shape) - 1, -1, -1):
        sh = shape[i]
        out_index[i] = int(cur_pos % sh)
        cur_pos = cur_pos // sh
```

不妨读读从shape到stride转换的代码以加深理解：
```python
>>> def strides_from_shape(shape):
...     strides = []
...     stride = 1
...     for dim in reversed(shape):
...         strides.append(stride)
...         stride *= dim
...     return tuple(reversed(strides))
...
>>> strides_from_shape((2, 3, 4))
(12, 4, 1)
>>> strides_from_shape((5,))
(1,)
>>> strides_from_shape((2, 2))
(2, 1)
```
#### permute

重排维度。其本质是重排了stride。
以PyTorch的使用例子为例：

```
>>> x = torch.arange(24).reshape(2, 3, 4)
>>> x.shape
torch.Size([2, 3, 4])
>>> p1 = x.permute(0, 2, 1)
>>> p1.shape
torch.Size([2, 4, 3])
>>> p2 = x.permute(2, 1, 0)
>>> p2.shape
torch.Size([4, 3, 2])
```

> 在学习了CS336 Assignment 1之后，加入了einops包的可读性例子。
> edit time: 2026-03-04 14:46:37

`x.permute(0, 2, 1)` 效果相当于 `einops.rearrange` 的：
```python
from einops import rearrange
rearrange(x, 
'd0 d1 d2 -> d0 d2 d1'
)
```

新的shape很好想，就是permute传入顺序，在构造索引时映射得到新shape。
但是新的stride呢？
这里有一个可能与直觉不符的知识。PyTorch这里保持一个行为的不变性：不管如何permute，相同的index一定访问相同的元素。因此，stride不应该调用 `strides_from_shape` 对新shape重新计算，而是应该和shape一样直接映射得到新stride。

> 相同的逻辑索引（考虑维度映射后）访问相同的元素。

```python
    def permute(self, *order: int) -> TensorData:
        return TensorData(self._storage, 
        tuple([self.shape[i] for i in order]), 
        tuple([self.strides[i] for i in order]))

```

这样的话，虽然 `strides_from_shape` 初始构造的stride最后一维一定为1（**此时stride降序，称layout is contiguous**），但是经过permute之后就未必为1了。这样的好处是把逻辑索引和物理存储完全分离。以后index就会很适宜于做broadcasting之类的操作。
### broadcasting

过了一下TensorData，发现除了broadcast之外的其他部分都比较有数了。把一个一个函数收起来的感觉还挺爽的。再接再厉。

> 广播的规则：
> （Rule 1）**对于某个维度位置**，维度值为1时，可以广播到值为n。
> （Rule 2/3）**对于维度数量不同时**，可以在数量较小的维度左侧添加维度值“1”。

**Rule 1**: Any dimension of size 1 can be zipped with dimensions of size n > 1 by assuming the dimension is copied n times.

```
(3,) + (1,) = (3,)
(5, 1) + (5, 3) = (5, 3)
```

**Rule 2**: Extra dimensions of shape 1 can be added to a tensor to ensure the same number of dimensions with another tensor.
**Rule 3**: Any extra dimension of size 1 can only be implicitly added **on the left side** of the shape.

```
(3,) + (5, 3) = (1, 3) + (5, 3) = (5, 3)
(2, 3, 1) + (7, 2, 1, 5) = (1, 2, 3, 1) + (7, 2, 1, 5) = (7, 2, 3, 5)
```

![](posts/migrated/post-images/20250713170442.png)

在实际实践中，广播行为是很有趣的。其实它并没有真的去创建那个被广播变大的tensor、并把两个tensor操作到一起，而是“即用即算”，不进行实际的内存复制，而是借助索引实现并行。可以硬件级并行多个线程、每个线程读共享数据，实现高效。
#### broadcast_index

把对应于原来的 `big_shape` 的 `big_index` 转成对应于 `shape` 的 `out_index` 。
注意：直观感觉，前面两个参数的shape和index是大的，得到后面的两个参数是小的。
例如：
`big_shape = (2, 3, 4), big_index = (1, 2, 3)`
要转到 `shape = (3, 4)` ，则把多余那个维度删掉，`out_index = (2, 3)` 。
再比如某个维度值为0时，应该把此处的index值置为0。

```python
>>> def broadcast_index(big_index, big_shape, shape, out_index):
...     for i, s in enumerate(shape):
...         if s > 1:
...             out_index[i] = big_index[i + len(big_shape) - len(shape)]
...         else:
...             out_index[i] = 0
...
>>> out_index = [1, 1]
>>> broadcast_index((1, 2, 3), (2, 3, 4), (3, 4), out_index)
>>> out_index
[2, 3]
```

这个函数可能一开始会不容易想明白它的写法以及用途。
其实就是，可能会有多个 `big_index` ，对应到小的 `out_index` 。
思考下面的例子：
```python
>>> from minitorch import broadcast_index
>>> out_index = [1, 1]
>>> broadcast_index((0, 2, 3), (2, 3, 4), (3, 4), out_index)
>>> out_index
[2, 3]
>>> broadcast_index((1, 2, 3), (2, 3, 4), (3, 4), out_index)
>>> out_index
[2, 3]
```

这时候假如我们有某个函数，函数结果写入结果tensor的 `big_index` 指向的元素、而函数参数来自 `broadcast_index` 后面两个参数“小的index”，我们在已知 `big_index` 的值时，就可以借助 `broadcast_index` 推导得到“小的index”了。
这里的语言可能很绕，但是是理解后面的tensor_map等等一系列函数实现的关键。

多用终端单独拎出来玩一玩这些函数，而不是每次都跑完整的测试框架，会想明白很多。
#### shape_broadcasting

就是之前那个例子的实现：
```
(2, 3, 1) + (7, 2, 1, 5) = (1, 2, 3, 1) + (7, 2, 1, 5) = (7, 2, 3, 5)
```

其实就是从低位到高位逐位取最大值。
在某个shape用完后，其余的部分直接取更大的剩余部分。

可以拿以下代码简单单元测试一下。
```python
def test_shape_broadcast():
    """测试广播形状计算"""
    test_cases = [
        # (shape1, shape2, expected)
        ((2, 3), (1, 3), (2, 3)),      # 基本广播
        ((3, 1), (3, 4), (3, 4)),      # 广播第二维
        ((1,), (5, 3), (5, 3)),        # 标量广播
        ((5, 1, 4), (3, 4), (5, 3, 4)), # 多维广播
        ((3, 4), (1, 1), (3, 4)),       # 广播多个1
        ((1, 1, 1), (5, 3, 4), (5, 3, 4)), # 全1广播
    ]
    
    error_cases = [
        ((2, 3), (2, 4)),  # 维度3 vs 4 不匹配
        ((3, 5), (4, 5)),  # 维度3 vs 4 不匹配
    ]
    
    print("测试正常广播:")
    for s1, s2, expected in test_cases:
        result = shape_broadcast(s1, s2)
        print(f"{str(s1):12} + {str(s2):12} = {str(result):12} (期望 {expected})")
        assert result == expected, f"期望 {expected}, 得到 {result}"
    
    print("\n测试错误情况:")
    for s1, s2 in error_cases:
        try:
            shape_broadcast(s1, s2)
            print(f"{str(s1):12} + {str(s2):12} = ❌ 应该报错但没报")
        except IndexingError:
            print(f"{str(s1):12} + {str(s2):12} = ✓ 正确报错")
```
### Tensor Operations

#### 整体结构与设计模式

首先看真实的PyTorch。
可见，每个自定义函数都继承了 `torch.autograd.Function` （类比于我们继承的 `Function` ），在 `Function` 中提供 `apply` 方法，取这个函数名就得到了像模块化一样可调用的函数，这个函数的应用就是对一些Tensor执行操作并得到新的Tensor。

```python
import torch

class MyReLU(torch.autograd.Function):
    """
    自定义ReLU函数的完整实现
    """
    @staticmethod
    def forward(ctx, input):
        """
        前向传播
        ctx: 上下文对象，用于保存反向传播需要的信息
        """
        ctx.save_for_backward(input)  # 保存输入供反向使用
        return input.clamp(min=0)      # ReLU: max(0, x)

    @staticmethod
    def backward(ctx, grad_output):
        """
        反向传播
        grad_output: 上游传来的梯度
        """
        input, = ctx.saved_tensors      # 取出保存的输入
        grad_input = grad_output.clone()
        grad_input[input < 0] = 0       # x<0的部分梯度为0
        return grad_input

# 使用自定义Function
x = torch.tensor([-1.0, 0.0, 1.0, 2.0], requires_grad=True)
relu = MyReLU.apply  # 获取可调用的apply方法
y = relu(x)          # 前向传播
print(y)  # tensor([0., 0., 1., 2.])

y.sum().backward()   # 反向传播
print(x.grad)  # tensor([0., 0., 1., 1.])
```

`tensor_functions.py` 的其余部分没有什么好说的。

然后再从设计模式的角度看看 `TensorBackend` 和 `TensorOps` 的关系。
通过跟ai交流我才知道，不同于Java，Python并没有专门的“接口”，而是用Protocol或者ABC做的。
先看 `TensorBackend` 。它传入一个 `TensorOps` 。

```python
class TensorBackend: # 使用Ops的类
    def __init__(self, ops: Type[TensorOps]):
        # Maps
        self.neg_map = ops.map(operators.neg)
        ...
```

这里写了一个典型的“依赖倒置”：外部通过传参、而不是硬编码 `TensorOps` 的具体实现类，这样的话可以很方便切换不同的 `TensorOps` 实现。
画出来其实就是一个抽象类、三个实现和一个使用的关系。

![](posts/migrated/post-images/ops_uml.png)

#### tensor_map和tensor_zip

```python
def tensor_map(
    fn: Callable[[float], float]
) -> Callable[[Storage, Shape, Strides, Storage, Shape, Strides], None]:
    
    def _map(
        out: Storage,
        out_shape: Shape,
        out_strides: Strides,
        in_storage: Storage,
        in_shape: Shape,
        in_strides: Strides,
    ) -> None:
	    ...
	    
	return _map
```

我们理解一下这样一个 `_map` 函数的流程。
对于特定的index指向的元素，调用所给的fn函数这一步我们是会做的。如果给tensor那就对应index，如果给storage那就对应position。
而我们需要对整个tensor的所有元素调用，因此考虑生成所有的index，然后对每个index执行这样的操作。

那么问题转化为：给定一小一大两个shape（`in_shape smaller than out_shape`），如何生成它们对应的所有的index？
(1) 对out_shape，我们实际上就是要生成所有可能的index，这个我们熟，之前的 `to_index(i, out_shape, out_index)` 函数就是在干这个。写个for循环让i从0开始累加一直到out_size就可以了。
(2) 对某个特定的out_index（大的），我们可以获得in_index（小的），方法正是我们之前写过的 `broadcast_index(out_index, out_shape, in_shape, in_index)` ！前面两个参数写大的，后面两个写小的。

整理一下，核心代码实际上就是：
```python
for i in range(out_size): # 通过for循环生成从 0 到 out_size - 1
	to_index(i, out_shape, out_index) # 转为 out_index
	broadcast_index(out_index, out_shape, in_shape, in_index) # 获得 in_index
	out_pos = index_to_position(out_index, out_strides) # 转为storage需要的out_pos
	in_pos = index_to_position(in_index, in_strides) # 转为in_pos
	out[out_pos] = fn(in_storage[in_pos]) # 对相应元素调用fn
```

`tensor_zip` 和 `tensor_map` 同理，只是输入变量从一个变成了两个。

恭喜我自己写出了从这里开始到下一部分“Efficiency”最关键的要优化的代码部分。
#### tensor_reduce

这里别的部分和`map`、`zip`差不多，除了对于某个特定的 `out_index` ，该位置的元素计算结果应该来自 `reduce_size` 个元素（需要写一个内层的循环），这里的 `reduce_size = a_shape[reduce_dim]` 。
比如Layer Norm对 `hidden_dim` 做 `mean` 操作，则此时的 `reduce_size = hidden_dim` 。

```python
for i in range(out_size):
	to_index(i, out_shape, out_index) 
	broadcast_index(out_index, out_shape, a_shape, a_index)
	
	a_index[reduce_dim] = 0
	start_pos = index_to_position(a_index, a_strides)
	result = a_storage[start_pos]
	for j in range(1, reduce_size): # 跳过第0个元素
		a_index[reduce_dim] = j
		pos = index_to_position(a_index, a_strides)
		result = fn(result, a_storage[pos])
		
	out_pos = index_to_position(out_index, out_strides)
	out[out_pos] = result
```

### Autograd

先看autograd的API效果：
```python
>>> import torch
>>> tensor1 = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
>>> out = tensor1.sum()
>>> out.backward()
>>> print(tensor1.grad)
tensor([1., 1., 1.])
>>>
```

原因：执行了一个sum函数（当然梯度是不因tensor初始值发生变化的，只取决于执行的函数）
```
out = sum([x1, x2, x3]) = x1 + x2 + x3
所以out对x的梯度是[1., 1., 1.]
```

再比如说执行乘和求和两个函数，函数梯度再发生变化：
```python
>>> tensor1 = torch.tensor([1.0, 2.0, 3.0], requires_grad=True)
>>> out = (tensor1 * 2).sum()
>>> out.backward()
>>> print(tensor1.grad)
tensor([2., 2., 2.])
```

>  It turns out that you can do most of machine learning without ever thinking in higher dimensions.

这里别的都好说，硬算就行，
permute函数的backward需要通过实验额外说明一下：

```python
>>> x = torch.randn(2, 3, 4, requires_grad = True)
>>> y = x.permute(2, 0, 1)
>>> y.shape
torch.Size([4, 2, 3])
>>> loss = y.sum()
>>> loss.backward()
>>> x.grad.shape
torch.Size([2, 3, 4])
```

```python
>>> x = torch.randn(2, 3, 4, requires_grad = True)
>>> loss = x.sum()
>>> loss.backward()
>>> x.grad.shape
torch.Size([2, 3, 4])
```

x先执行了permute，再执行了sum，之后执行backward。
从两个实验可以看出，无论是否执行permute，对完整过程执行backward得到的是一样的。**这说明permute的backward事实上是一个逆向permute的过程，将gradient与输入张量对齐。这个符合我们的直觉：前向对这些变量进行交换，从而grad也做了交换。后向把grad按照反方向交换回去，和相应的变量对齐。**

由此可以得到以下的实现：
```python
    @staticmethod
    def backward(ctx: Context, grad_output: Tensor) -> Tuple[Tensor, float]:
		# 第一个是把grad_output按照a的shape和strides重排, 第二个是order的梯度为0.0
        (a,) = ctx.saved_values
        return Tensor.make(grad_output._tensor._storage, a.shape, a.strides, grad_output.backend), 0.0
```

之后2.4和2.5逐渐遇到一些小的神奇的bug（修完忘记记录了，可惜），不知道是框架代码写错了还是我写错了。反正修改掉其中一者之后最后能跑就行。

只需要实现各个函数的backward，就可以复用和第三部分一样的Autodiff、Backpropagation逻辑。
## Efficiency

Efficiency：使用`numba`并行和CUDA编程等方式提升效率。

参考了：
1. [Minitorch项目文档](https://minitorch.github.io/)
2. numba的文档相关部分（[Automatic parallelization with @jit](https://numba.readthedocs.io/en/stable/user/parallel.html)）
3. https://github.com/mukobi/Minitorch-Self-Study-Guide-SAIA

### parallelization

Numba教程属于是。
比较：
```python
def map(fn):
    # Change 1: Move function from Python to JIT version.
    fn = njit()(fn)

    def _map(out, input):
        for i in range(len(out)):
            out[i] = fn(input[i])

    # Change 2: Internal _map must be JIT version as well.
    return njit()(_map)
```

```python
def map(fn): 
	fn = njit()(fn) 
	
	def _map(out, input): 
		# Change 3: Run the loop in parallel (prange) 
		for i in prange(len(out)): 
			out[i] = fn(input[i]) 
			
	return njit(parallel=True)(_map)
```

三个优化目标：
* Main loop in parallel （用 `numba.prange` 替代 `range`）
* All indices use numpy buffers （所有索引计算都使用ndarray，而非list或tuple）
* When `out` and `in` are stride-aligned, avoid indexing（跳过索引计算，直接线性遍历）
（ps. 搞不懂reduce的不要调用函数是啥意思。查阅了其他github fork的实现，都调用了函数。我后面的理解是，好像不能调用numpy等包的`.dot`之类的实现，只能写原生python）

这里有个搞笑的事情：在tensor_data/to_index函数的实现中，要加个trick：
把ordinal改成cur_pos，为了不是改变同一变量ordinal，加个0。
```
cur_pos = ordinal + 0 # 为了Module3并行, 不能修改循环变量的trick
for i in range(len(shape) - 1, -1, -1): # 倒序
	out_index[i] = cur_pos % shape[i]
	cur_pos = cur_pos // shape[i]
```

之后parallel_check三个函数都得到以下结果了：
```
------------------------------ After Optimisation ------------------------------
Parallel structure is already optimal.
--------------------------------------------------------------------------------
```

写这个task踩的一些坑：
1. 把parallel=True关掉再看看。控制变量，从而确定是并行的问题、还是改函数的时候把函数逻辑改错了。
2. 一点一点改。先跟原来的实现保持完全一致，然后慢慢加prange和快速路径等等，小步快跑，这样出错了可以发现问题在哪里。一口气全加上去了，报错还是得一点一点改。
3. 到了并行，似乎很多时候调试器也不完全能解决问题。就像我拿pdb调到那里、自己调用相关函数跑发现addConstant确实把`[[0.00], [0.00]]`加成`[[5.00], [5.00]]`了，明明跑的跟代码一模一样的函数，结果它并行起来就变成`[0.00, 5.00]`了。这是什么事嘛。

之后先把另外两个的parallel给关了，专心调map的问题。
#### Cannot determine Numba type

这里报了一个神奇的错误 `Untyped global name 'exp': Cannot determine Numba type of <class 'function'>`，需要回去改operators.py：
我在sigmoid实现中用到了同模块的exp函数，这是不被numba识别的，将其修改为math.exp或np.exp即可。
同理，在operators.py中的每个函数都不能互相依赖，而只能引用math或np库。

一开始：
```python
def sigmoid(x: float) -> float:
    if x >= 0:
        return 1.0 / (1.0 + exp(-x))
    else:
        return exp(x) / (1.0 + exp(x))
```

修改后：
```python
def sigmoid(x: float) -> float:
    if x >= 0:
        return 1.0 / (1.0 + math.exp(-x))
    else:
        return math.exp(x) / (1.0 + math.exp(x))
```

修改完保险起见把之前的测试用例再跑了一遍，没什么问题。
开着parallel=False先改完这个bug、task3.1可以全部通过。再把parallel=True打开跑跑看。
发现直接改prange解决不了问题。去读读numba的文档（[Automatic parallelization with @jit](https://numba.readthedocs.io/en/stable/user/parallel.html)）。

#### race

里面讲了一个race的案例。先拿串行测试一下正常情况：
```python
>>> x = np.ones(4)
>>> n = x.shape[0]
>>> n
4
>>> y = np.zeros(4)
>>> for i in range(n):
...     y[:] += x[i]
...
>>> y
array([4., 4., 4., 4.])
```

如果写得不对，结果会如下：
```python
>>> from numba import njit, prange
>>> @njit(parallel=True)
... def prange_wrong_result(x):
...     n = x.shape[0]
...     y = np.zeros(4)          # y = [0, 0, 0, 0]
...     for i in prange(n):      # 并行循环，i 同时跑
...         y[:] += x[i]         # 每个线程都在改 y 的全部元素
...     return y
...

>>> prange_wrong_result(x)
array([4., 4., 4., 4.])
>>> prange_wrong_result(x)
array([3., 3., 4., 4.])
>>> prange_wrong_result(x)
array([4., 4., 4., 4.])
>>> prange_wrong_result(x)
array([3., 2., 2., 2.])
>>> prange_wrong_result(x)
array([2., 2., 2., 2.])
```

我们可以查一下，发现numba会自动根据CPU核数把循环拆成多个线程来跑：
```python
>>> from numba import config
>>> print("Numba 并行线程数：", config.NUMBA_NUM_THREADS)    
Numba 并行线程数： 16
```

所以上述循环会拆成以下的效果，造成同时读写的冲突：
```
- 线程 A：执行 `y[:] += 1`
- 线程 B：执行 `y[:] += 1`
- 线程 C：执行 `y[:] += 1`
- 线程 D：执行 `y[:] += 1`
```

但如果通过 `y += x[i]` 等 Numba 能识别的 “规约操作”（reduction），Numba 会自动把 `y += x[i]` 转换成线程安全的加法，不会多个线程同时写同一个位置，不会race。

> A reduction is inferred automatically if a variable is updated by a supported binary function/operator using its previous value in the loop body.
>  The following functions/operators are supported: `+=`, `+`, `-=`, `-`, `*=`, `*`, `/=`, `/`, `max()`, `min()`.
>  The initial value of the reduction is inferred automatically for the supported operators (i.e., not the `max` and `min` functions).
>  Note that the `//=` operator is not supported because in the general case the result depends on the order in which the divisors are applied.
>  However, if all divisors are integers then the programmer may be able to rewrite the `//=` reduction as a `*=` reduction followed by a single floor division after the parallel region where the divisor is the accumulated product.
>  For the `max` and `min` functions, the reduction variable should hold the identity value right before entering the `prange` loop.
>  Reductions in this manner are supported for scalars and for arrays of arbitrary dimensions. （numba文档）

因此排除发现，是我把out_index和in_index的初始化拿出循环的锅，出现race了。
它们的初始化应该是每个线程（每次循环迭代）独立的，这样就会保证各个线程之间不会race。

修改后如下：
```python
def tensor_map(
    fn: Callable[[float], float]
) -> Callable[[Storage, Shape, Strides, Storage, Shape, Strides], None]:
    def _map(
        out: Storage,
        out_shape: Shape,
        out_strides: Strides,
        in_storage: Storage,
        in_shape: Shape,
        in_strides: Strides,
    ) -> None:
        # 3. stride-aligned, 快速路径
        if (
            len(out_shape) == len(in_shape) and
            (out_shape == in_shape).all() and
            (out_strides == in_strides).all()
        ):
            for i in prange(len(out)): # 1. parallel
                out[i] = fn(in_storage[i])
        else:
            # 2. ndarray
            for out_i in prange(len(out)): # 1. parallel
                # 不要把out_index和in_index拿出循环, 不然会race
                out_index = np.empty(len(out_shape), dtype=np.int32)
                in_index = np.empty(len(in_shape), dtype=np.int32)
                to_index(out_i, out_shape, out_index)
                broadcast_index(out_index, out_shape, in_shape, in_index)
                out_pos = index_to_position(out_index, out_strides)
                in_pos = index_to_position(in_index, in_strides)
                out[out_pos] = fn(in_storage[in_pos])

    return njit(parallel=True)(_map)  # type: ignore
```

如法炮制、修改zip和reduce，成功通过task3.1。
### Matrix Multiplication

根据矩阵微积分的性质有：
![](posts/migrated/post-images/20250717195114.png)
优化要求：
- Outer loop in parallel
- No index buffers or function calls
- Inner loop should have no global writes, 1 multiply.

outer loop很好理解，就是遍历结果矩阵index的那个loop，这个肯定是prange就搞定了的。
第二个没有函数调用同上，还是不知道啥意思，略过。（我后面的理解是，好像不能调用numpy等包的`.dot`之类的实现，只能写原生python）
第三个是理所应当的，按照numba优化的写法把reduction变量写在外面、里面+=。
### 关于numba.cuda

之后看了一眼 `projects/run_fast_tensor.py` ，发现我用pip安装的`numba==0.60.0`没有`numba.cuda`，于是`pip uninstall`了一下，又用`conda`安装了`numba`和`cudatoolkit`。
```
pip uninstall numba
conda install numba==0.60.0 cudatoolkit -c conda-forge -y
```
然后拿以下指令查了一下：
```
>>> from numba import cuda
>>> print(cuda.gpus)
<Managed Device 0>
```
感觉是minitorch的代码和我numba版本不匹配，把`numba.cuda.is_available()`改了一下：
```python
from numba import cuda
if cuda.gpus:
    GPUBackend = minitorch.TensorBackend(minitorch.CudaOps)
```
### CUDA operations and Matrix Multiplication

由于不是个人学习该项目的重心，直接在代码中参考了github上可通过测试的开源实现。
Task3.3: [atgctg/minitorch: Solutions for http://minitorch.github.io](https://github.com/atgctg/minitorch)
Task3.4: [feimos32/Minitorch-Learning-Introduction](https://github.com/feimos32/Minitorch-Learning-Introduction)

感谢先行者！
## Network

Networks：已经开发出一个很简单的pytorch了，来拿它搞个卷积神经网络进行图像分类这种上游任务吧！
不是个人学习的重点，直接合并了 Task4: [Dearkano/MiniTorch: Cornell CS5781 Machine Learning Engineering](https://github.com/Dearkano/MiniTorch/) 以保证完整性。
感谢先行者！

nn.py里面的class Max有问题
TODO
## 附: 基于Pytorch代码，讲讲反向传播和计算图

以下代码选取自PyTorch官方的 [Quickstart — PyTorch Tutorials](https://docs.pytorch.org/tutorials/beginner/basics/quickstart_tutorial.html)
省略了`import`，数据集加载，设置`DataLoader`，建立模型，设置损失函数和优化器。

```python
def train(dataloader, model, loss_fn, optimizer):
    size = len(dataloader.dataset)
    model.train() # 将模型设置为训练模式
    for batch, (X, y) in enumerate(dataloader):
        X, y = X.to(device), y.to(device)

        # Compute prediction error
        pred = model(X) # 模型前向传播, 得到预测值
        loss = loss_fn(pred, y) # 根据预测值和实际值, 得到loss

        # Backpropagation
        loss.backward() # !Autograd主要干了这个函数的事情!
        optimizer.step() # 优化一轮参数
        optimizer.zero_grad() # 将梯度清零

        if batch % 100 == 0:
            loss, current = loss.item(), (batch + 1) * len(X)
            print(f"loss: {loss:>7f}  [{current:>5d}/{size:>5d}]")
```

```python
def test(dataloader, model, loss_fn):
    size = len(dataloader.dataset)
    num_batches = len(dataloader)
    model.eval()
    test_loss, correct = 0, 0
    with torch.no_grad(): # 为了加快推理, 所有前向操作都不计算梯度
        for X, y in dataloader:
            X, y = X.to(device), y.to(device)
            pred = model(X) # 上面设置后, 这里面的每一步前向操作都不计算梯度
            test_loss += loss_fn(pred, y).item()
            correct += (pred.argmax(1) == y).type(torch.float).sum().item()
    test_loss /= num_batches
    correct /= size
    print(f"Test Error: \n Accuracy: {(100*correct):>0.1f}%, Avg loss: {test_loss:>8f} \n")
```

我们知道，在前向传播的同时也建立了计算图。用以下数值例子举例。
ps. 数值例子由GPT生成，可能存在计算错误。
### 单变量标量函数

前向传播：
$$L = (x + 2)^2, x = 1$$
计算图：
```
    x=1     2
     \     /
      + --> a=3
        \
         \
          **2 --> y=9 --> L=9
```

由$a=x+2, y=a^2, L=y$，依次用$L$计算$y,a,x$的偏导数。

首先计算 $\frac{\partial L}{\partial y} = 1$, 
再计算 
$$\frac{\partial L}{\partial a} = \frac{\partial L}{\partial y} \cdot \frac{\partial y}{\partial a} = 1 \times 6=6$$
最后计算
$$\frac{\partial L}{\partial x} = \frac{\partial L}{\partial a} \cdot \frac{\partial a}{\partial x} = 6 \times 1=6$$
可见每一步的共同点：以计算 $\frac{\partial L}{\partial a}$ 为例，
都是把上一步的梯度计算结果（如 $\frac{\partial L}{\partial y}$ ）拿过来，乘以这一步计算出的梯度（如 $\frac{\partial y}{\partial a}$ ）。

我们可以把**正向**的过程看作正向的一个黑箱操作（即构造的计算图），
**由上一步传播过来的值进行了函数运算得到另一个值、传播的是函数值，**
而**反向**的过程看作反向的一个黑箱操作（即计算图的逆向），
**由上一步传播过来的导数值乘以当前步的求导运算得到另一个导数值，传播的是导数值。**

### 多变量标量函数

前向传播：
$$L=(w⋅x+b)^2,w=2,x=3,b=1$$
计算图：
```
  w=2   x=3       b=1
   \   /          |
    * --> a=6     |
      \          /
       + --> z=7
         \
          \
           **2 --> L=49
```

$$\frac{\partial L}{\partial z} = 2 \times 7 = 14$$
$$\frac{\partial L}{\partial a} = \frac{\partial L}{\partial z} \cdot \frac{\partial z}{\partial a} = 14 \times 1 = 14$$
$$\frac{\partial L}{\partial w} = \frac{\partial L}{\partial a} \cdot \frac{\partial a}{\partial w} = 14 \times 3 = 42$$
$$\frac{\partial L}{\partial x} = \frac{\partial L}{\partial a} \cdot \frac{\partial a}{\partial x} = 14 \times 2 = 28$$
$$\frac{\partial L}{\partial b} = \frac{\partial L}{\partial z} \cdot \frac{\partial z}{\partial b} = 14 \times 1 = 14$$

这里重点关注两个点：一是两个变量的加法，二是两个变量的乘法。
将两个变量加在一起时（如$z=a+b$），对每个变量的偏导值均为1。所以要得到$L$对每个变量的偏导，只需**把上一步传播过来的值乘以1即可**。
将两个变量乘在一起时（如$a=wx$），$a$对$w$求导得到的是$x$的值，反之对$x$求导得到的是$w$的值。所以要得到$L$对每个变量的偏导，只需**把上一步传播过来的值乘以另一个变量即可**。这一事实也会运用到后面的矩阵乘法上。 

### 矩阵乘法

$$X = \begin{bmatrix} 1 & 2 \\ 3 & 4 \end{bmatrix}, \quad
W = \begin{bmatrix} 1 & 0 \\ 2 & 1 \end{bmatrix}$$
前向传播：
$$h = X @ W = 
\begin{bmatrix}
1 \cdot 1 + 2 \cdot 2 & 1 \cdot 0 + 2 \cdot 1 \\
3 \cdot 1 + 4 \cdot 2 & 3 \cdot 0 + 4 \cdot 1
\end{bmatrix} =
\begin{bmatrix}
5 & 2 \\
11 & 4
\end{bmatrix}$$
$$L = \|h\|^2 = \sum h_{ij}^2 = 5^2 + 2^2 + 11^2 + 4^2 = 25 + 4 + 121 + 16 = 166$$
计算图：
```
     X        W
      \      /
       @ --> h (2x2)
         \
          \
           sum(h²) --> L=166
```

反向传播：要求 $\frac{\partial L}{\partial X}$ 和 $\frac{\partial L}{\partial W}$ 。
根据矩阵微分的知识，
$$\frac{\partial L}{\partial h} = 2h = 2 \cdot \begin{bmatrix} 5 & 2 \\ 11 & 4 \end{bmatrix} = \begin{bmatrix} 10 & 4 \\ 22 & 8 \end{bmatrix}$$
$$\frac{\partial L}{\partial W} = X^T @ \frac{\partial L}{\partial h} =
\begin{bmatrix} 1 & 3 \\ 2 & 4 \end{bmatrix} @
\begin{bmatrix} 10 & 4 \\ 22 & 8 \end{bmatrix} =
\begin{bmatrix}
1 \cdot 10 + 3 \cdot 22 & 1 \cdot 4 + 3 \cdot 8 \\
2 \cdot 10 + 4 \cdot 22 & 2 \cdot 4 + 4 \cdot 8
\end{bmatrix} =
\begin{bmatrix}
76 & 28 \\
108 & 40
\end{bmatrix}$$
$$\frac{\partial L}{\partial X} = \frac{\partial L}{\partial h} @ W^T =
\begin{bmatrix} 10 & 4 \\ 22 & 8 \end{bmatrix} @
\begin{bmatrix} 1 & 2 \\ 0 & 1 \end{bmatrix} =
\begin{bmatrix}
10 \cdot 1 + 4 \cdot 0 & 10 \cdot 2 + 4 \cdot 1 \\
22 \cdot 1 + 8 \cdot 0 & 22 \cdot 2 + 8 \cdot 1
\end{bmatrix} =
\begin{bmatrix}
10 & 24 \\
22 & 52
\end{bmatrix}$$
ps. 这里的矩阵乘法反向传播同样遵循“L对某个变量求导，就是拿传播值乘以另一个变量”，与前述“多变量标量函数”部分有共通之处。
### MiniTorch相关代码参考

以 `ScalarFunction` 中的 `Log` 函数举例：
在forward时，传入 $a$ ，计算 $\log a$ 并返回。
在backward时，传入 $d_{output}$ 即上一步得到的导数，计算它与本步骤的导数 （ $\frac{1}{a}$ ） 的乘积并返回，即得到误差函数 $L$ 对变量 $a$ 的导数。
为了在backward时计算本步骤的导数（ $\frac{1}{a}$ ），需要在forward中将 $a$ 的值记入Context中，从而在backward计算时取出。

```python
class Log(ScalarFunction):
    "Log function $f(x) = log(x)$"

    @staticmethod
    def forward(ctx: Context, a: float) -> float:
        '''保存a, 计算log(a)并返回'''
        ctx.save_for_backward(a)
        return operators.log(a)

    @staticmethod
    def backward(ctx: Context, d_output: float) -> float:
        '''取出保存的a, 根据传回的d_output, 计算d_output / f\'(x)并返回, 即d_output / a'''
        (a,) = ctx.saved_values
        return operators.log_back(a, d_output)
```
### 总结

由上述案例可知，**计算图**是描述前向传播、反向传播过程的一个通用手段。
它将反向传播中每一步的导数计算简化为**上一步传播的值 乘以 这一步的导数**，
通过记录前向传播中经历的函数过程及相应变量的值，达成了反向传播的计算。


**前向传播**即是由输入变量经过模型（即一系列的函数操作）得到输出变量的过程。
（输出变量经历激活函数，与实际变量通过损失函数计算出损失）
**反向传播**即是由损失值逆着模型（即一系列的求导运算）计算出损失函数对各个输入变量的偏导数。
（得到偏导数是为了优化器可以采用梯度下降等方式更新模型参数）


在这样观察了之后，对PyTorch的训练与推理的函数过程就了解得比较完整了。

> edit time: 2025-07-02 17:07:11 （Fundamentals√）
> edit time: 2025-07-02 17:54:05 （ML Primer√）
> edit time: 2025-07-07 23:33:57 （AutoDiff√）
> edit time: 2025-07-15 17:18:18 （Tensors√）
> edit time: 2025-07-23 22:29:56‎ （Efficiency√）
> edit time: 2025-08-03 22:09:45 （附: 基于Pytorch代码，讲讲反向传播和计算图√）

相关：[[optimizer|优化器]] · [[softmax|在线 Softmax]] · [[einops|einops]]
