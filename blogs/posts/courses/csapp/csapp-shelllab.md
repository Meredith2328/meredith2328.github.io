---
preview_image: posts/migrated/post-images/csapp-shelllab.png
title: 'CSAPP · Shelllab'
date: 2024-06-27 13:15:58
tags:
- CSAPP
published: true
hideInList: false
feature: posts/migrated/post-images/csapp-shelllab.png
isTop: false
---
> 待修改：当前仅仅包含了作业报告的提交内容。

## 效果

以`test16`为例，其余效果相似。
![](posts/migrated/post-images/1719465528078.png)

## 知识整理

根据课本，我们在编写信号处理程序时应当遵守以下规则~~类怪谈~~：

> 0. 处理程序要尽可能简单。
> 1. 在处理程序中只调用异步信号安全的函数。
> 2. 保存和恢复 `errno`。
> 3. **阻塞所有的信号**，保护对共享**全局**数据结构的访问。
> 4. 用volatile声明全局变量。
> 5. 用sig_atomic_t声明标志。

我们为了阻塞信号，提供的主要函数有：

```
/* 初始化 */
sigset_t mask_all, mask_chld, prev_mask;

Sigfillset(&mask_all); // 将mask_all设置为包含所有信号的mask

Sigemptyset(&mask_chld); 
Sigaddset(&mask_chld, SIGCHLD); // 将mask_all设置为只包含SIGCHLD的mask
```

```
/* 阻塞与取消阻塞 */

// 阻塞所有信号，并将原mask存入prev_mask中
Sigprocmask(SIG_SETMASK, &mask_all, &prev_mask);

// 只阻塞SIGCHLD信号
Sigprocmask(SIG_BLOCK, &mask_chld, &prev_mask);

// 取消阻塞所有信号，恢复mask为prev_mask
Sigprocmask(SIG_SETMASK, &prev_mask, NULL);
```

## eval

### 思路

课本（中文）8.4.6节（P525）提供了不回收后台子进程的eval缺陷版本，在此之上加入信号处理：

1. 改变全局变量前后需要阻塞和取消阻塞全部信号，保证原子性；
2. 在使用Fork之前阻塞`SIGCHLD`，防止子进程在`fork`之后、`addjob`之前终止并被`handler`回收。同时要在子进程中取消阻塞`SIGCHLD`。

上述两条信号处理是基于下列文档提示的。

### 关于信号处理的文档提示

**eval block:**

> In eval, the parent must use sigprocmask to block SIGCHLD signals before it forks the child,
> and then unblock these signals, again using sigprocmask after it adds the child to the job list by calling addjob. Since children inherit the blocked vectors of their parents, the child must be sure to then unblock SIGCHLD signals before it execs the new program. The parent needs to block the SIGCHLD signals in this way in order to avoid the race condition where the child is reaped by sigchld handler (and thus removed from the job list) before the parent calls addjob.

**process group:**

> When you run your shell from the standard Unix shell, your shell is running in the foreground process group. If your shell then creates a child process, by default that child will also be a member of the foreground process group.
>  Since typing ctrl-c sends a SIGINT to every process in the foreground group, typing ctrl-c will send a SIGINT to your shell, as well as to every process that your shell created, which obviously isn’t correct.
>  Here is the workaround: After the fork, but before the execve, the child process should call setpgid(0, 0), which puts the child in a new process group whose group ID is identical to the child’s PID.
>  This ensures that there will be only one process, your shell, in the foreground process group.
>  When you type ctrl-c, the shell should catch the resulting SIGINT and then forward it to the appropriate foreground job (or more precisely, the process group that contains the foreground job).

### 具体实现

```c
void eval(char *cmdline) 
{
    char *argv[MAXARGS];
    char buf[MAXLINE];
    int bg;
    pid_t pid;

    strcpy(buf, cmdline); // dest, src
    bg = parseline(buf, argv);
    if (argv[0] == NULL)
        return; // Ignore empty lines

    if (!builtin_cmd(argv)) { // create a new job
        // init mask_chld = {SIGCHLD};
        sigset_t mask_all, mask_chld, prev_mask;
        sigfillset(&mask_all);
        sigemptyset(&mask_chld);
        sigaddset(&mask_chld, SIGCHLD);

        /* Fork, addjob */
        sigprocmask(SIG_BLOCK, &mask_chld, &prev_mask); // Block SIGCHLD, store prev_mask
        if ((pid = fork()) == 0) { // Child runs user job
            sigprocmask(SIG_SETMASK, &prev_mask, NULL); // Unblock SIGCHLD in the child
            setpgid(0, 0); // Note: each child process must have a unique process group ID
            if (execve(argv[0], argv, environ) < 0) {
                printf("%s: Command not found.\n", argv[0]);
                exit(0);
            }
        }
        // addjob changes the global variable "pid", so block all
        sigprocmask(SIG_BLOCK, &mask_all, NULL);
        addjob(jobs, pid, bg?BG:FG, cmdline);
        sigprocmask(SIG_SETMASK, &prev_mask, NULL); // restore prev_mask

        /* printf */
        // Before operating, block the SIGCHLD
        sigprocmask(SIG_BLOCK, &mask_chld, NULL);
        // Parent waits for foreground job to terminate
        if (!bg) {
            waitfg(pid);
        }
        else {
            // When doing printf, block all signals
            sigprocmask(SIG_BLOCK, &mask_all, NULL);
            printf("[%d] (%d) %s", pid2jid(pid), pid, cmdline); // Background
        }
        sigprocmask(SIG_SETMASK, &prev_mask, NULL); // After all operations, restore prev_mask
    }
    return;
}
```

## builtin_cmd

### 思路

照猫画虎：课本（中文）8.4.6节。相应结构作用相当于Java语言（C语言的`switch`不能直接比较字符串）中的`switch`：

```java
switch (argv[0]){
	case "quit":
	...
}
```

注意遵守“规则”，即在使用全局变量 `jobs` 时阻塞所有信号。

### 具体实现

```c
int builtin_cmd(char **argv) 
{
    /* If first arg is a builtin command (quit, jobs, bg or fg), 
     * run it and return true.
     */ 
    // switch(argv[0]) case "quit":
    if (!strcmp(argv[0], "quit")) /* quit command */
        exit(0);
    if (!strcmp(argv[0], "bg") || !strcmp(argv[0], "fg")) {
        /* bg or fg */
        do_bgfg(argv);
        return 1;
    }
    if (!strcmp(argv[0], "jobs")) {
        // Since we access the global variable "jobs", block all signals.
        sigset_t mask_all, prev_mask;
        sigfillset(&mask_all);
        sigprocmask(SIG_SETMASK, &mask_all, &prev_mask);
        listjobs(jobs);
        sigprocmask(SIG_SETMASK, &prev_mask, NULL);
        return 1;
    }
    if (!strcmp(argv[0], "&")) /* Ignore singleton & */
        return 1;
    return 0;     /* not a builtin command */
}
```

## waitfg

### 思路

参考课本8.5.7节“显式地等待信号”(P543)的相关部分，利用`while`循环和`sigsuspend`维护，直到相应前台进程终止（循环是为了保证只能因为该条件停止、而非收到`Ctrl-C`等对应的信号）时再停止等待。

由于我们此处等待的`job`运行在前台，在该进程终止时，首先发出`SIGCHLD`信号给父进程，父进程此时在`sigsuspend`（相当于原子的`pause`），收到信号后，控制从`waitfg`先转移到`handler`，`handler`确认收到该信号对应终止的所有子进程（收到信号意味着至少有一个进程终止）中包含前台进程（见下`sigchld_handler`中的`if (job->state == FG)`），则在“`handler`运行结束、控制返回`waitfg`、`waitfg`的`pause`因为信号处理程序执行完毕而返回”的之后需要让`waitfg`跳出循环。因此设置了一个`fg_child_flag`变量作为循环条件，用于达成上述效果。

### 具体实现

```c
void waitfg(pid_t pid)
{
	sigset_t mask_empty;
	sigemptyset(&mask_empty);
	fg_child_flag = 0;
	while(!fg_child_flag){
        // hang the process, until we get a signal
		sigsuspend(&mask_empty);
	}
}
```



## sigchld_handler

### 课本提示

> • The waitpid, kill, fork, execve, setpgid, and sigprocmask functions will come in very handy. The WUNTRACED and WNOHANG options to waitpid will also be useful.
> • When you implement your signal handlers, be sure to send SIGINT and SIGTSTP signals to the entire foreground process group, using ”-pid” instead of ”pid” in the argument to the kill function. The sdriver.pl program tests for this error.
> • One of the tricky parts of the assignment is deciding on the allocation of work between the waitfg and sigchld handler functions. We recommend the following approach:
> – In waitfg, use a busy loop around the sleep function.
> – In sigchld handler, use exactly one call to waitpid.
> While other solutions are possible, such as calling waitpid in both waitfg and sigchld handler, these can be very confusing. It is simpler to do all reaping in the handler.

### 思路

照猫画虎：课本（中文）8.5.6节。
之后按照`job`结束状态打印相关信息。这些信息是根据`sdriver.pl`和各`trace`比对`tsh`和`tshref`的结果（记得先`make`）比较得到的。

### 具体实现

```c
void sigchld_handler(int sig) 
{
    int olderrno = errno, status;
    sigset_t mask_all, prev_all;
    pid_t pid;

    sigfillset(&mask_all);
    while ((pid = waitpid(-1, &status, WNOHANG | WUNTRACED)) > 0) { /* Reap all zombie children */
        sigprocmask(SIG_BLOCK, &mask_all, &prev_all);
        struct job_t *job = getjobpid(jobs, pid);

		if (job->state == FG){ // for waitfg
			fg_child_flag = 1;
		}

        if (WIFEXITED(status)) { // normal exit
            deletejob(jobs, pid);
        }
        else if (WIFSIGNALED(status)) { // unhandled signal exit
            printf("Job [%d] (%d) terminated by signal %d\n", job->jid, pid, WTERMSIG(status));
            deletejob(jobs, pid);
        }
        else if (WIFSTOPPED(status)) { // stopped
            job->state = ST;
            printf("Job [%d] (%d) stopped by signal %d\n", job->jid, pid, WSTOPSIG(status));
        }
        sigprocmask(SIG_SETMASK, &prev_all, NULL);
    }

    errno = olderrno;
}
```




## sigint_handler

参考 `trace06` 微调输出。

由于所有的终止情况都包含子进程的终止，子进程终止时会发送`SIGCHLD`给父进程，所以我们不需要额外写信息输出。

```c
void sigint_handler(int sig) 
{
    // to "the foreground job"
    sigset_t mask_all, prev_all;
    sigfillset(&mask_all);
    
    sigprocmask(SIG_SETMASK, &mask_all, &prev_all);
    int pid = fgpid(jobs); // global variable: jobs
    sigprocmask(SIG_SETMASK, &prev_all, NULL);

    if (pid > 0) {
        kill(-pid, SIGINT);
        // output is in the sigchld_handler,
        // since when a child terminates,
        // the kernel will send a SIGCHLD to the parent.
    }
}
```

## sigtstp_handler

与`sigint_handler`基本完全相同。

```c
void sigtstp_handler(int sig) 
{
    // almost the same as sigint_handler
	sigset_t mask_all, prev_mask;
	sigfillset(&mask_all);
    
	sigprocmask(SIG_SETMASK, &mask_all, &prev_mask);
	int pid = fgpid(jobs);
	sigprocmask(SIG_SETMASK, &prev_mask, NULL);

	if(pid > 0){
		kill(-pid, SIGTSTP);
	}
}
```

## do_bgfg

### 思路

首先获取`pid`或`jid`。从`builtin_cmd`传入的参数是`argv*[]`，`pid`或`jid`保存在`argv[1]`处，其中`jid`以`'%'`打头，可以用`atoi(argv[1] + 1)`消去该字符。

在获取到`pid`或`jid`后，我们要获取需要被修改状态的进程，即根据`pid`或`jid`以及提供的相应封装函数来获取到我们需要切换`BG`或`FG`状态的`job`。

在获取到`job`后，`bg`指令对应切换到`BG`状态，`fg`指令对应切换到`FG`状态并开始`waitfg`。

### 具体实现

```c
void do_bgfg(char **argv) 
{
    /* Block the signals */
    sigset_t mask_all, prev_mask;
	sigfillset(&mask_all);
	sigprocmask(SIG_SETMASK, &mask_all, &prev_mask);
    struct job_t *job;
    int pid;

    /* Match pid/jid, get a pid. */
    char *id = argv[1];
	if(id == NULL){ // no PID(num) or JID(%num)
		printf("%s command requires PID or %%jobid argument\n", argv[0]);
		return;
	}
    else if (id[0] == '%') {
        int jid = atoi(id + 1); // JID, eliminate '%'
        job = getjobjid(jobs, jid);
        if (job == NULL) {
            printf("%%%d: No such job\n", jid);
			return;
        }
        pid = job->pid;
    }
    else {
        pid = atoi(id); // PID
        if(pid <= 0){
			printf("%s: argument must be a PID or %%jobid\n", argv[0]);
			return;
		}
        job = getjobpid(jobs, pid);
        if (job == NULL) {
            printf("(%d): No such process\n", pid);
			return;
        }
    }

    /* Switch the command. */
    if (!strcmp(argv[0], "bg")) {
        /* Change a stopped background job to a running background job. */
        job->state = BG;
        printf("[%d] (%d) %s", job->jid, pid, job->cmdline);
		sigprocmask(SIG_SETMASK, &prev_mask, NULL); // First stop blocking
		kill(-pid, SIGCONT); // Signal the child and its descendents
    }
	else if (!strcmp(argv[0], "fg")){
        /* Change a stopped or running background job to a running in the foreground. */
		job->state = FG;
		sigprocmask(SIG_SETMASK, &prev_mask, NULL);
		kill(-pid, SIGCONT);
		waitfg(pid); // Switch to the foreground, wait.
	}
}
```

上一篇：[[csapp-cachelab|Cachelab]] · 另见：[[linux-command|Linux 指令笔记]]
