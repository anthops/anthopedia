---
title: License Types
tags:
  - licensing
---
>[!warning] Disclaimer
>This note contains **personal interpretations** of software licenses. I am **NOT A LAWYER** and this is **NOT LEGAL ADVICE**. Inaccuracies may exist. Always consult a licensed attorney for legal matters.

In the digital age, controlling how your work is used is critical. Software licenses govern how code can be used, shared, and modified. They strike a balance between protecting creators’ rights and fostering collaboration
## Proprietary
Proprietary licenses make use of copyright law to reserve all rights for the creator. Source code is kept secret, and users must purchase a license to access the software. Modifications and redistribution are strictly prohibited unless explicitly permitted. These licenses prioritise control and monetisation, making them common in commercial software like _Microsoft Windows_ or _Adobe Photoshop_.
## Copyleft
Copyleft is a licensing strategy that *uses* copyright law to enforce openness. Copyleft licenses grant users freedom to use, modify and distribute software, with a critical condition:
- If you create a [[Derivatives, Copies & Aggregations|copy]] or [[Derivatives, Copies & Aggregations#Derivatives|derivative work]], some or all of your software may inherit the copyleft license. This means you may have to share some or all of your source code when *distributing* your software - depending on the copyleft license of the software your work derives from.

Copyleft licenses vary in strength depending on:
1. The license's definition of distributing software
	- Most copyleft licenses just restrict this to giving away or selling software. 
	- Some licenses, like AGPL & SSPL, treat SaaS as a form of distribution.
2.  The nature of the derivative
	- Whether the software just links copyleft libraries or modifies them
	- How the libraries are linked (static vs dynamic)
3. What must be shared
	- The whole project or just the modified copyleft elements
	- Sometimes even the whole stack (in the case of SSPL)
4. License propagation
	- Whether the derivative work must inherit the copylefted software's license or just the modified copyleft elements.

Some common copyleft licenses include:
- [[GPL-2.0]]
- GPL-3.0
- [[LGPL-2.1]]
- AGPL
- MPL 1.1
## Permissive
Permissive licenses impose minimal restrictions, letting users modify and redistribute code freely, even in proprietary projects. They typically stipulate limited requirements, such that the original authors must be credited. Common permissive licenses include:
- BSD
- MIT
- Apache
## Public Domain
Public domain software has no copyright restrictions. Creators waive ownership, allowing anyone to use, modify, or sell the code without obligations. Some common public domain licenses are:
- Unlicense
- CC0
## Source Available
Not to be confused with open-source, a source-available license grants users access to source code, allowing them to view, modify, and sometimes distribute the code. However, there may be restrictions or limitations imposed. 

These restrictions most often include limitations on commercial use, restrictions on redistributing modified versions, or requirements to share modifications with the original developer without necessarily making them public.

The specific restrictions depend on the exact source-available license used. Some popular source-available licenses include:
- BSL (Business Source License)
- SSPL (Server Side Public License)
- Elastic License
## Unlicensed
Not to be confused with the Unlicensed public domain license, unlicensed software refers to software that has no license associated with it. For example, a GitHub repository where the creator didn't include a license.

One might think that the absence of a license means the code is free game. However, it's quite the opposite. Due to copyright laws, since there is no explicit grant of rights from the creator, you are **not permitted** to use, modify or distribute the component.
