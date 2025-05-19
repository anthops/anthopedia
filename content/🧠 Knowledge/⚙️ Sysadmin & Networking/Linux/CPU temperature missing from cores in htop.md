---
title: CPU temperature missing from cores in htop
tags:
  - linux
  - troubleshooting
url: linux-htop-missing-cpu-temps
---
>[!info]- Software versions used
>- Run on [Ubuntu 24.04.2 LTS](https://releases.ubuntu.com/24.04.2/)
>- [htop 3.3.0](https://launchpad.net/ubuntu/+source/htop/3.3.0-4build1) (the version installed with Ubuntu 24.04.2)

>[!bug]+ Referenced Issues
>- [htop #1680](https://github.com/htop-dev/htop/issues/1680)
>	- Fixed by pull request: [CPU temperatures shown as N/A in htop 3.4.0 and above](https://github.com/htop-dev/htop/pull/1682)
>	- The PR says it was an issue in `htop 3.4.0` and above but is also an issue in earlier versions that was partially solved by pull request: [linux: assign CPU temperatures by package/core or CCD](https://github.com/htop-dev/htop/pull/1352)

>[!todo]
>- Write about this properly lol
>- Mention build instructions are only for  before 3.5.0 is released

Issue where even with `libsensors`, Ubuntu machine would show `N/A` on most CPU cores in `htop`. Notice that only cores 1 and 2 show a temperature:
![[broken-htop.png]]

The PR with the fix implies that this is specific to AMD.

Until `htop` 3.5.0 is released we need to build main from source:
1. Remove old instance of `htop`
	```sh
	audo apt remove htop --purge
	```
2. Clone repo (obviously `cd` into it afterwards)
	```sh
	git clone git@github.com:htop-dev/htop.git
	```
3. Install dependencies
	```sh
	sudo apt install libncursesw5-dev autotools-dev autoconf automake build-essential libcap-dev libsensors-dev
	```
4. Compile
	```sh
	./autogen.sh && ./configure --enable-sensors --enable-capabilities && make
	```
5. Install (requires `sudo` to install to `/usr/local/bin`)
	```sh
	sudo make install
	```

You should now see all the temperatures in `htop` (you might need to `source ~/.bashrc` or restart the shell for the changes to apply):
![[working-htop.png]]