---
title: Linux Freezing after Suspend
tags:
  - linux
  - troubleshooting
  - X11
  - NVIDIA
  - gpu
  - "#bug"
  - "#bug-open"
url: linux-freeze-post-suspend
---
>[!info]- Software versions used
>- Issue encountered on [Ubuntu 24.04.2 LTS](https://releases.ubuntu.com/24.04.2/) with **X11** ([xserver-xorg-core 21.1.11](https://answers.launchpad.net/ubuntu/noble/amd64/xserver-xorg-core/2:21.1.11-1ubuntu1))
>- [NVIDIA Linux x64 (AMD64/EM64T) Display Driver 570.124.04](https://www.nvidia.com/en-us/drivers/details/241089/).  

> [!bug]+ Referenced Issues:
> - [Extreme (growing) memory usage in X11 OpenGL or Vulkan applications after suspend+resume](https://forums.developer.nvidia.com/t/extreme-growing-memory-usage-in-x11-opengl-or-vulkan-applications-after-suspend-resume/329078) 
> - This problem is specific to X11 and NVIDIA GPUs

When using Linux on a system with an NVIDIA GPU and X11, you may experience a full desktop freeze except for the mouse which can move while not being able to interact with anything. This occurs some time after the computer has been suspended and then resumed. In my case, I was also was met with a popup regarding an internal error with `/usr/libexec/mutter-x11-frames` *after* I had rebooted my computer. 
## Suspected Root cause
The freeze appears to stem from a memory leak caused by NVIDIA drivers during X11 suspend / resume cycles. This seems to affect driver versions ≥ 550, with it affecting the latest at the time of writing, **21/04/2025**, which is [570.124.04](https://www.nvidia.com/en-us/drivers/details/241089/).  

When a user triggers a system suspend, the NVIDIA kernel driver receives callbacks from the Linux kernel. As a result:
1. The driver purges most GPU objects (textures, buffers, fences) from its handle tables to conserve RAM (not VRAM). These objects **remain in the GPU's VRAM** but are marked as invalid
2. The driver retains only essential display state. All other metadata about GPU resources is discarded

After resuming from the suspend, OpenGL / Vulkan applications (and compositors like Mutter) that were running prior to the suspend **retain references to GPU resources** (e.g. buffers or textures) that the driver no longer keeps track of. When these applications attempt to render new frames (using calls like `glXSwapBuffers()` or Vulkan’s `vkQueuePresentKHR()`), they unknowingly operate on invalid references. Rather than crash, the driver silently allocates **new GPU objects** to back the rendering operations. However, since these objects were created in response to untracked/stale references, the driver **has no way to associate them with the application's lifecycle**, resulting in **orphaned allocations** that cannot be freed.

Over time, each new frame rendered by these pre-suspend processes creates additional orphaned objects. These accumulate in kernel memory (specifically, slab allocations), **rapidly increasing memory usage** by several megabytes per frame. Eventually, the system runs out of kernel memory, leading to compositor crashes and a frozen UI — though the mouse may still move, as input remains handled in the kernel.

Pre-550 NVIDIA drivers retained more metadata by default, accidentally avoiding orphaned allocations. Newer drivers optimise this process but introduced the bug.
## The solution
> [!warning] Potential Issues
> Unfortunately, the solution below has some issues. When resuming from a suspend you may find yourself faced with a black screen where only the cursor can move. Try hitting the space-bar every now and then until the login shows. I assume this is because it takes some time to load everything from Disk. It also sometimes black-screens without ever going to the login screen.
> 
> The good news is the bug  with plans for it to be resolved in a future update. However, there is a solution that can be used for the time being.

Until NVIDIA creates a proper fix for this we can configure the NVIDIA kernel driver to preserve all VRAM allocations before suspending the system:  
1. First, create the following file:
	```sh
	sudo nano /etc/modprobe.d/nvidia-preserve-vram.conf
	```
2. Add this line to preserve the VRAM allocations:
	```c
	options nvidia NVreg_PreserveVideoMemoryAllocations=1
	```
3. An important thing to note is that by default, the NVIDIA driver will store the VRAM content in `/tmp`. This **must** be at least as large as the total video memory of all NVIDIA GPUs on the system + 5% margin. If `/tmp` won't suffice then specify a temporary file path in the above file like so:
	```c
	NVreg_TemporaryFilePath=/some/path
	```
4. Save and exit. Then rebuild `initramfs`:
	```sh
	sudo update-initramfs -u
	```
5. Make sure the required NVIDIA `systemd` services are enabled:
	```sh
	sudo systemctl enable nvidia-suspend.service nvidia-resume.service
	```
6. Finally, reboot the system!
	```sh
	sudo reboot
	```