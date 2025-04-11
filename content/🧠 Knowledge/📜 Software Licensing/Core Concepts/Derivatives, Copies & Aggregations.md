---
title: Derivatives, Copies & Aggregations
tags:
  - licensing
---
>[!warning] Disclaimer
>This note contains **personal interpretations** of software licenses. I am **NOT A LAWYER** and this is **NOT LEGAL ADVICE**. Inaccuracies may exist. Always consult a licensed attorney for legal matters.

Understanding the difference between **derivative works**, **copies** and **aggregations** is critical for complying with [[License Types#Proprietary|proprietary]] and [[License Types#Copyleft|copyleft licenses]]. These terms define how licensing obligations propagate when combining or modifying code.
## Copy
The most simple of the three concepts is a copy. As the name suggests, copyright law is made to prevent unauthorised copies of original works. If you copy somebody's source code you are in violation of copyright law.
- **Proprietary Licenses** - copying without explicit permission breaches the license
- **Copyleft Licenses** - copying is permitted, but distribution triggers obligations (e.g. sharing source code under the same license)
## Derivative Work
Under copyright law, a derivative work is a creation based on or derived from one or more already existing works. A non-software example of this could be translating a novel written in English into another language, or a screenplay adapted from said novel.

>[!info] Clarification 
>An important distinction to make is that the definition of a derivative under copyright law does not change based on the type or strength of the copyleft license. A derivative is still a derivative, and the copyleft licenses define the conditions under which the work must be shared and what obligations follow.

In the context of software, a derivative work involves *building upon* / incorporating another software into yours. For example, the following are all considered derivative works:
- Software that is a modification of a library or software
- Software that is a translation of an existing software into another language (e.g. C++ -> Java)
- Software that copy pastes code from another software
- Software that uses another library

The last point is quite a controversial and debated topic. Some argue that using a library should only be considered derivative when [[Linkers#Static Linking|statically linking]] because it incorporates the code into the final derivative work (binary / executable). However, others believe that [[Linkers#Dynamic Linking|dynamically linked]] libraries - where the code remains separate but interacts at runtime - can still result in a derivative work.

Even though this remains a grey area, it's important to remember that derivative work is a **legal term** that does not account for technicalities. Also, at the time of writing, **07/04/2025**, and as far as I am aware - courts have yet to definitively rule whether dynamic linking creates a derivative. Most importantly, [the GPL FAQ explicitly states that dynamically linked libraries are a no-go](https://www.gnu.org/licenses/gpl-faq.html#GPLStaticVsDynamic). In short, this means it's probably not worth the risk. I am also of the belief that it is a derivative work since you might as well have copy-pasted the library into your code.

Fortunately, other libraries such as the [[LGPL-2.1]] explicitly allow for linking of licenses without causing the derived work to inherit the license. Note that there are some caveats when it comes to statically linking, which is described in the linked page.
## Aggregation
In the context of software licenses, an aggregation is the act of combining independent pieces of software into a single larger system without creating a derivative work of those individual pieces.

A simple example of this is a software stack. Let's say you have a:
1. Backend licensed under GPL
2. Frontend licensed under the MIT license
3. Database under a proprietary license
4. Prometheus monitoring under the Apache 2.0 license 

When these individual components are brought together to form a complete stack, they operate independently while serving a common purpose. Parts could also potentially be swapped for other equivalents without breaking anything. This is an **aggregation**.

Another common example of this is a Linux distribution, such as Ubuntu. The Linux kernel itself is licensed under [[GPL-2.0|GPL-2.0]], yet applications running on it can have completely different licenses, even proprietary. This is because the distribution is a collection of different software, many of which have little to no interaction with each other.

> [!info] Syscall Exception
> You might be thinking, "Hang on, won't some applications need to make syscalls to the kernel, thereby rendering them a derivative of Linux?", and you're correct! However, the Linux kernel includes the [syscall exception](https://github.com/torvalds/linux/blob/master/LICENSES/exceptions/Linux-syscall-note) which allows for this to occur without spreading the GPL license.

Finally, there's the case of container images. These are also considered an aggregation but have a lot more caveats that need to be considered, mostly due to their layers. This is [[Licensing Containers|discussed in greater detail here]].



