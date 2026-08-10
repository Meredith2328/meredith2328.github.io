---
title: 值得顺便掌握一下的那些linux指令
date: 2026-03-10 11:14:01
tags:
- 工具
published: true
hideInList: false
feature: null
isTop: false
---

命令行能够即时地做很多事情，甚至代表一种简洁而切题的计算机哲学。
为了直接进入正题，省略诸如 `cd` 这样的广为人知的基础指令，直接看那些显著提升体验的东西。

<!-- more -->

> edit time: 2026-03-10 11:31:56
## df

用于查看磁盘空间。使用场景比如训模型会保存很多中间文件，可以这样看看需要清理哪些。

使用效果：
比如 `fuse-overlayfs` 是这个实例本身的存储， `shared-nvme` 是它的外接可持久化存储，使用率分别为 `50%` 和 `40%` 。

```
(cs336) root@p-4e088649b993-ackcs-00gjgdno:~# df
Filesystem              1K-blocks        Used  Available Use% Mounted on
fuse-overlayfs           31457280    15468244   15989036  50% /
/dev/sda3               931347132    85832692  845514440  10% /base
tmpfs                       65536           0      65536   0% /dev
tmpfs                   528231156          12  528231144   1% /proc/driver/nvidia
tmpfs                   528231156           0  528231156   0% /proc/asound
tmpfs                   528231156           0  528231156   0% /proc/acpi
tmpfs                       65536           0      65536   0% /dev/tty
tmpfs                   528231156           0  528231156   0% /proc/scsi
JuiceFS:public-juice3 21474836480 16810363272 4664473208  79% /shared-public
tmpfs                   528231156           0  528231156   0% /sys/firmware
tmpfs                   528231156           0  528231156   0% /sys/devices/virtual/powercap
/dev/xvdb               308521792    15468280  277308488   6% /etc/hosts
tmpfs                    62914560         112   62914448   1% /dev/shm
JuiceFS:shared-juice3   104857600    41665660   63191940  40% /root/shared-nvme
overlay                 931347132    85832692  845514440  10% /run/init
tmpfs                   105646232       57136  105589096   1% /run/nvidia-persistenced/socket
```

至于要看哪几个文件最大，可以和 `ncdu` 这样的工具搭配使用。
## grep

查找关键词，关键词可以写正则。
通常和其他指令通过管道搭配使用，简单的用法、强大的功能。

使用效果：

```
(cs336) root@p-4e088649b993-ackcs-00gjgdno:~# df | grep /dev
/dev/sda3               931347132    85849780  845497352  10% /base
tmpfs                       65536           0      65536   0% /dev
tmpfs                       65536           0      65536   0% /dev/tty
tmpfs                   528231156           0  528231156   0% /sys/devices/virtual/powercap
/dev/xvdb               308521792    15468280  277308488   6% /etc/hosts
tmpfs                    62914560         112   62914448   1% /dev/shm
```

也可以加 `-i` 参数用于忽略大小写。
## ps

`ps aux` 用于查看当前用户的进程。
但是输出往往很冗长。我只关心我运行的实验，怎么做？
答案很方便：管道加grep！

```
(cs336) root@p-4e088649b993-ackcs-00gjgdno:~# ps aux | grep uv
root        7482  0.0  0.0 232328 36616 pts/0    Sl+  11:02   0:00 uv run scripts/batch_sweep.sh --use-wandb --train-data data/tinystories_train.bin --val-data data/tinystories_val.b
root        7512  0.0  0.0 232332 36100 pts/0    Sl+  11:02   0:00 uv run python -m cs336_basics.train --train-data data/tinystories_train.bin --data-dtype uint16 --vocab-size 10000 
root        8012  0.0  0.0   3960  1976 pts/1    S+   11:27   0:00 grep --color=auto uv
```

作为对比，以下是原始输出。信息量比较大，不便于我们立即锁定自己需要的东西。

```
(cs336) root@p-4e088649b993-ackcs-00gjgdno:~# ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         189  0.0  0.0   1128     4 ?        S    08:24   0:00 catatonit -P
root         468  0.0  0.0  11868 10472 ?        Ss   08:24   0:00 /usr/bin/fuse-overlayfs -o lowerdir=/pcs/image_storage/overlay/l/FYLFLVKOA36HFQA3YPVYA4TOPN:/pcs/image_storage/over
root         730  0.0  0.0 11642352 42724 ?      Sl   08:24   0:10 podman start -a -l
root         804  0.0  0.0 140084  2080 ?        Ssl  08:24   0:00 /usr/libexec/podman/conmon --api-version 1 -c 21cc623ce89ebf5b23d24fab89813f67368a3a7d85627ea813d278eceae6b5d2 -u 2
root         809  0.0  0.0   4884  3516 ?        Ss   08:24   0:00 /bin/bash /run/init
root        4497  0.0  0.0  37064 31664 ?        S    08:24   0:01 /base/mambaforge/bin/python /base/mambaforge/bin/supervisord -n
root        4804  0.0  0.0   4752  3404 ?        S    08:24   0:00 bash -lc  while true; do /base/mambaforge/bin/jupyter lab --ip 0.0.0.0 --port 8888 --no-browser  --ServerApp.root_d
root        4805  0.0  0.0   4752  3400 ?        S    08:24   0:00 bash -lc  while true; do /base/mambaforge/bin/sshd -D -e; sleep 3; done; 
root        4833  0.0  0.0   9888  7600 ?        S    08:24   0:00 sshd: /base/mambaforge/bin/sshd -D -e [listener] 0 of 10-100 startups
root        4839  0.2  0.0 17700160 209192 ?     Sl   08:24   0:23 /base/mambaforge/bin/python3.10 /base/mambaforge/bin/jupyter-lab --ip 0.0.0.0 --port 8888 --no-browser --ServerApp.
root        5156  0.0  0.0   5124  4280 pts/0    Ss   08:26   0:00 /bin/bash -l
root        5629  0.0  0.0   5124  4248 pts/1    Ss   08:36   0:00 /bin/bash -l
root        7482  0.0  0.0 232328 36616 pts/0    Sl+  11:02   0:00 uv run scripts/batch_sweep.sh --use-wandb --train-data data/tinystories_train.bin --val-data data/tinystories_val.b
root        7485  0.0  0.0   4892  3612 pts/0    S+   11:02   0:00 bash scripts/batch_sweep.sh --use-wandb --train-data data/tinystories_train.bin --val-data data/tinystories_val.bin
root        7512  0.0  0.0 232332 36100 pts/0    Sl+  11:02   0:00 uv run python -m cs336_basics.train --train-data data/tinystories_train.bin --data-dtype uint16 --vocab-size 10000 
root        7515 98.0  0.2 31912736 2677372 pts/0 Sl+ 11:02  23:36 /root/shared-nvme/cs336/.venv/bin/python3 -m cs336_basics.train --train-data data/tinystories_train.bin --data-dtyp
root        7651  0.2  0.0 1270524 45484 ?       Ssl  11:03   0:03 /root/shared-nvme/cs336/.venv/lib/python3.12/site-packages/wandb/bin/wandb-core --port-filename /tmp/tmpucm1x3jq/po
root        7671  0.0  0.0 1180028 24544 ?       Sl   11:03   0:00 /root/shared-nvme/cs336/.venv/lib/python3.12/site-packages/wandb/bin/gpu_stats --portfile /tmp/wandb-system-monitor
root        7782  0.0  0.0  12164  9020 ?        Ss   11:09   0:00 sshd-session: root [priv]
root        7784  0.0  0.0  12424  6496 ?        S    11:09   0:00 sshd-session: root@notty
root        7785  0.2  0.0   2844  2048 ?        Ss   11:09   0:02 /base/mambaforge/libexec/sftp-server
root        8008  0.0  0.0   8468  4276 pts/1    R+   11:27   0:00 ps aux
```
## nvidia-smi

仅适用于使用nvidia显卡的设备。
可以查看GPU情况，包括CUDA版本、有几个设备和设备的使用率等。

使用效果：
这里是单卡5090，CUDA版本为12.8，因此需要安装2.7.1等PyTorch版本。

```
(cs336) root@p-4e088649b993-ackcs-00gjgdno:~# nvidia-smi
Tue Mar 10 11:18:13 2026       
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 570.172.08             Driver Version: 570.172.08     CUDA Version: 12.8     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  NVIDIA GeForce RTX 5090        On  |   00000000:D8:00.0 Off |                  N/A |
|  0%   42C    P1            133W /  575W |    1114MiB /  32607MiB |     24%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
                                                                                         
+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI              PID   Type   Process name                        GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|    0   N/A  N/A            7515      C   ...-nvme/cs336/.venv/bin/python3       1104MiB |
+-----------------------------------------------------------------------------------------+
```
## -v -vv -vvv

严格来说这个不是指令，而是一个常见的命令参数。但好用。
有许多工具默认状态给你提供的信息是很有限的，比如 `pip` 。如果加了 `-v` ，它就会给你提供更多的信息；`-vv` 更多更多……
比如你怀疑某个指令是不是卡在网络连接问题上了、又没有信息，就可以加这个参数看看。

使用效果（不加参数）：

```
(pymc) PS C:\Users\10pi> pip install einops
Collecting einops
  Using cached einops-0.8.1-py3-none-any.whl.metadata (13 kB)
Using cached einops-0.8.1-py3-none-any.whl (64 kB)
Installing collected packages: einops
Successfully installed einops-0.8.1
```

使用效果（`-v`）：

```
(pymc) PS C:\Users\10pi> pip install -v einops
Using pip 24.3.1 from C:\Software\Miniconda\envs\pymc\lib\site-packages\pip (python 3.8)
  Link requires a different Python (3.8.0 not in: '>=3.9'): https://files.pythonhosted.org/packages/2a/09/f8d8f8f31e4483c10a906437b4ce31bdf3d6d417b73fe33f1a8b59e34228/einops-0.8.2-py3-none-any.whl (from https://pypi.org/simple/einops/) (requires-python:>=3.9)
  Link requires a different Python (3.8.0 not in: '>=3.9'): https://files.pythonhosted.org/packages/2c/77/850bef8d72ffb9219f0b1aac23fbc1bf7d038ee6ea666f331fa273031aa2/einops-0.8.2.tar.gz (from https://pypi.org/simple/einops/) (requires-python:>=3.9)
Collecting einops
  Obtaining dependency information for einops from https://files.pythonhosted.org/packages/87/62/9773de14fe6c45c23649e98b83231fffd7b9892b6cf863251dc2afa73643/einops-0.8.1-py3-none-any.whl.metadata
  Using cached einops-0.8.1-py3-none-any.whl.metadata (13 kB)
Using cached einops-0.8.1-py3-none-any.whl (64 kB)
Installing collected packages: einops
Successfully installed einops-0.8.1
```

使用效果（`-vv`）：（我省略了一部分内容）

```
(pymc) PS C:\Users\10pi> pip install einops -vv
Using pip 24.3.1 from C:\Software\Miniconda\envs\pymc\lib\site-packages\pip (python 3.8)
Non-user install because site-packages writeable
Disabling truststore because Python version isn't 3.10+
Created temporary directory: C:\Users\10pi\AppData\Local\Temp\pip-build-tracker-hni59twj
Initialized build tracking at C:\Users\10pi\AppData\Local\Temp\pip-build-tracker-hni59twj
Created build tracker: C:\Users\10pi\AppData\Local\Temp\pip-build-tracker-hni59twj
Entered build tracker: C:\Users\10pi\AppData\Local\Temp\pip-build-tracker-hni59twj
Created temporary directory: C:\Users\10pi\AppData\Local\Temp\pip-install-8kirg154
Created temporary directory: C:\Users\10pi\AppData\Local\Temp\pip-ephem-wheel-cache-zt8dwlfm
1 location(s) to search for versions of einops:
* https://pypi.org/simple/einops/
Fetching project page and analyzing links: https://pypi.org/simple/einops/
Getting page https://pypi.org/simple/einops/
Found index url https://pypi.org/simple/
Looking up "https://pypi.org/simple/einops/" in the cache
Request header has "max_age" as 0, cache bypassed
Starting new HTTPS connection (1): pypi.org:443
https://pypi.org:443 "GET /simple/einops/ HTTP/1.1" 304 0
Fetched page https://pypi.org/simple/einops/ as application/vnd.pypi.simple.v1+json
  Found link https://files.pythonhosted.org/packages/36/1f/a5e6496a167b6e892123b201ccce251184457ce7a1b6c8e06662c09bfbab/einops-0.1.0-py3-none-any.whl (from https://pypi.org/simple/einops/), version: 0.1.0
  Found link ...
https://files.pythonhosted.org/packages/2c/77/850bef8d72ffb9219f0b1aac23fbc1bf7d038ee6ea666f331fa273031aa2/einops-0.8.2.tar.gz (from https://pypi.org/simple/einops/) (requires-python:>=3.9)
  Skipping link: 0.8.2 Requires-Python >=3.9: https://files.pythonhosted.org/packages/2c/77/850bef8d72ffb9219f0b1aac23fbc1bf7d038ee6ea666f331fa273031aa2/einops-0.8.2.tar.gz (from https://pypi.org/simple/einops/) (requires-python:>=3.9)
Skipping link: not a file: https://pypi.org/simple/einops/
Given no hashes to check 26 links for project 'einops': discarding no candidates
Collecting einops
  Obtaining dependency information for einops from https://files.pythonhosted.org/packages/87/62/9773de14fe6c45c23649e98b83231fffd7b9892b6cf863251dc2afa73643/einops-0.8.1-py3-none-any.whl.metadata
  Created temporary directory: C:\Users\10pi\AppData\Local\Temp\pip-unpack-g4cpg3nk
  Looking up "https://files.pythonhosted.org/packages/87/62/9773de14fe6c45c23649e98b83231fffd7b9892b6cf863251dc2afa73643/einops-0.8.1-py3-none-any.whl.metadata" in the cache
  Current age based on date: 19087633
  Ignoring unknown cache-control directive: immutable
  Freshness lifetime from max-age: 365000000
  The response is "fresh", returning cached response
  365000000 > 19087633
  Using cached einops-0.8.1-py3-none-any.whl.metadata (13 kB)
Created temporary directory: C:\Users\10pi\AppData\Local\Temp\pip-unpack-nq9eoxgz
Looking up "https://files.pythonhosted.org/packages/87/62/9773de14fe6c45c23649e98b83231fffd7b9892b6cf863251dc2afa73643/einops-0.8.1-py3-none-any.whl" in the cache
Current age based on date: 19087579
Ignoring unknown cache-control directive: immutable
Freshness lifetime from max-age: 365000000
The response is "fresh", returning cached response
365000000 > 19087579
Using cached einops-0.8.1-py3-none-any.whl (64 kB)
Downloading link https://files.pythonhosted.org/packages/87/62/9773de14fe6c45c23649e98b83231fffd7b9892b6cf863251dc2afa73643/einops-0.8.1-py3-none-any.whl (from https://pypi.org/simple/einops/) (requires-python:>=3.8) to C:\Users\10pi\AppData\Local\Temp\pip-unpack-nq9eoxgz\einops-0.8.1-py3-none-any.whl
Installing collected packages: einops

Successfully installed einops-0.8.1
Disabling truststore because Python version isn't 3.10+
Remote version of pip: 25.0.1
Local version of pip:  24.3.1
Was pip installed by pip? False
Removed build tracker: 'C:\\Users\\10pi\\AppData\\Local\\Temp\\pip-build-tracker-hni59twj'
```

`-vvv` 就不说了。肯定更多。

相关：[[csapp-shelllab|Shelllab]]
