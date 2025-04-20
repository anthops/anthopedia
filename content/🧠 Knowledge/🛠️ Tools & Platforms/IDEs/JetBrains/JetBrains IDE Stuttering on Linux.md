---
title: JetBrains IDE Stuttering on Linux
tags:
  - IDE
  - linux
---
When working in JetBrains IDEs (like IntelliJ, PyCharm, or CLion) on Linux you might encounter UI stuttering, most noticeable when scrolling through code and navigating large files. This stuttering often manifests as laggy text rendering, choppy animations, or even audio glitches in other apps (like Discord calls). In my case, the stuttering was so severe that it caused Discord voice chat to cut out intermittently. 
## Root cause
>[!note] This is a suspected root cause - it could be entirely wrong

JetBrains IDEs are built on Java, which relies on the operating system's graphics stack for rendering. On Linux, JetBrains defaults to using **X11**, a decades-old windowing system designed for compatibility, not performance. The problem is X11 was created in an era when hardware acceleration didn’t exist. By default, it uses software rendering (via the CPU) for most UI operations, even on systems with powerful GPUs.

The reason JetBrain installations on Windows are smooth without stutter is because Windows relies on D3D (Direct3D), which primarily utilises the GPU.
## The solution
We can modify the IDE's VM options with JVM flags to resolve the issue. In the IDE, navigate to **Help > Edit Custom Vm Options** and add the following before restarting the IDE:

```ini
-Dsun.java2d.opengl=true
-Dsun.java2d.opengl.fbobject=false
```
The first option enables Java's OpenGL's rendering pipeline. Instead of relying on X11's software rendering, the GPU (via OpenGL) now handles UI drawing, composting, and anti-aliasing - drastically reducing CPU usage.

The second option disables OpenGL's Framebuffer Objects, a feature that can sometimes cause compatibility issues on NVIDIA's Linux drivers (you can exclude this flag if it doesn't cause issues). For example, the top left of my IDE looked like this without it:

![[opengl-glitchy-ui.png]]

>[!tip]+ X11 -> Wayland
>There are plans for JetBrains IDEs to eventually default to Wayland instead of X11, which *might* resolve or at least alleviate the issue without using this solution.

After doing this, it's recommended to preemptively follow [[Linux Freezing after Suspend#The solution|these instructions]] if you are using an NVIDIA GPU with an affected driver since the enabling of OpenGL will leave you susceptible to the bug.