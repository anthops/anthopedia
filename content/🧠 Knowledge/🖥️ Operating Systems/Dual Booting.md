---
title: Dual Booting
tags:
  - windows
  - linux
  - "#troubleshooting"
url: dual-booting
---
>[!info]- Software versions used
>- [Ubuntu 24.04.2 LTS](https://releases.ubuntu.com/24.04.2/)
>- [Windows 11 24H2](https://support.microsoft.com/en-au/topic/windows-11-version-24h2-update-history-0929c747-1815-4543-8461-0160d16f15e5)
## Wrong time in Windows after Dual boot
>[!info]+ 
>This fix will only work for Linux distributions that use `systemd`. This includes Ubuntu, RHEL, Arch Linux, etc.

After creating a dual boot between your Windows and Linux partitions, you'll likely encounter an issue where upon returning to your Windows OS the time is out of whack.

The reason for this is because by default, Linux assumes that the time stored in the hardware clock is in UTC, not local time. On the other hand, Windows assumes that the time stored on the hardware clock is in local time.

Luckily, the fix for this is simple. Boot into your Linux partition and run the following command:
```bash
sudo timedatectl set-local-rtc 1 
```