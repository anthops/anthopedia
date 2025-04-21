---
title: Determining Linux File System Usage
tags:
  - linux
  - file-system
url: linux-fs-usage
---
Much like with [[Linux File System Navigation|navigating the Linux file system]], determining file system usage and pinpointing where and what is taking up space is a lot more difficult than in more user friendly operating systems - when we're working exclusively in the CLI that is. This page outlines a few tools that are necessary for determining file system usage in Linux systems.
## Viewing file system usage
As we saw, `ls` isn't great at reporting the overall storage usage of a system. So what if we wanted to get a rough idea of how much of our file system was used up?

An ideal tool for this is `df`, which reports the percentage of each file system mount-point that has been used up.

> [!info] If you want to get the size of a specific folder then skip to the next section.

To use `df`, simply run the following in the terminal:
```sh
df -h
```
This will return something like the following:

![[df.png|500]]
If the machine you're using has a lot of network based mounts that you don't care about then run the following to only show local file systems:
```sh
df -lh
```
## Getting the size of a directory
As shown above, `ls` cannot be used to get the overall size of a directory, since it really only shows the metadata size of the directory. `df` is also only useful for seeing overall file system usage. If we want to get the size of specific directories, we'll need something else.

The most common tool for this is `du`. This is especially useful when determining why your server has ran out of storage and where the culprit is.

> [!tip] **Spoiler alert** - you've probably forgotten to auto-rotate your logs 😋

The way I prefer to use `du` is to start at the root of whatever partition I'm working with and working up from there. So:
```sh
du --time -h -d 1 <directory>
```
This will then return all files within the specified folder with their size in a human-readable format and their last modified date shown. The `-d 1` sets the *maximum depth* to 1, since there's not really any point on recursing through the folders. Here's some example output:

![[du.png]]

If trying to find where the storage blew up, I'd follow the trail of the next largest directory.
## A better (and faster) way to get the size of a directory
The previous example is a pretty convenient for most use-cases. However, what if you were dealing with a really slow and large file system? Say, an NFS mount with a few terabytes of storage - yikes! Unfortunately, `du` is quite slow and there's no way of telling how far through the directory you are. Also, once you've identified the next directory, you'd have to run `du` again.. and again.. and again.

Luckily, there's a better version of this with a CLI UI! Enter `ncdu`, [NCurses Disk Usage](https://dev.yorhel.nl/ncdu). You can install it directly with your package manager. e.g. on a debian system:
```sh
sudo apt install ncdu
```

Once installed, just run the following:
```sh
ncdu -e -r <directory>
```

> [!warning] Important Tip
> Unless you plan on deleting files via the `ncdu` UI, you should **always** use `-r` which opens it in read-only mode.  The `-e` isn't necessary and just allows for extended information like timestamps.


This will start fully scanning your directory:

![[ncdu-scan.png|750]]

Once loaded, you'll be able to easily navigate the file system, jumping in and out of directories without having to load everything again:

![[ncdu-navigation.png|750]]
Another thing to note is that you can exclude certain file patterns. This is especially useful when scanning an NFS mount that has large snapshots stored at `.snapshot`. So, for example you could run:
```sh
ncdu -e -r --exclude .snapshot <directory>
```