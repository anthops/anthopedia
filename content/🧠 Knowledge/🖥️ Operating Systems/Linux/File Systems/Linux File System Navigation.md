---
title: Linux File System Navigation
tags:
  - linux
  - file-system
url: linux-fs-navigation
---
Unlike Windows & Mac, navigating files on Linux is a bit of a different beast. Well, you *could* use the GUI but a lot of the time you're not going to have that available, especially when SSHing into remote servers for debugging.
## Getting the current path
Not all terminals will bless you by showing you your current path. Instead, you'll need to use the following to get that:
```sh
pwd
```
Easy. Next..
## Viewing files within a directory
To get the files within a specific directory, use the `ls` command. You'll typically run it as:
```sh
ls -lah
```
Each flag does the following:
- `-l` prints the output in long-listed form
- `-a` shows hidden files (files that start with a `.`)
- `-h` prints the file sizes in a human-readable format (e.g. with KB)

This will then give you the output in the following format

![[ls.png]]

Notice how the size of the directories does not reflect the actual cumulative size, like you would expect when opening a folder in Windows file explorer. Instead, it shows the metadata size, which is equal to the block size of the system. You can obtain the block size from:
```sh
stat -fc %s .
```
If the amount of files within the directory were to greatly increase such that the metadata size were to exceed the block size, then it would increase by the block size. E.g. `4.0K` -> `8.0K`.

>[!info] XFS quirks
>
>Something interesting to be aware of is that different file system systems will have slightly different behaviours. For example, XFS allows very small directories to be stored inside inodes until the inode is full, where it will then use a block. (This means it will jump from about 155 bytes to 4.0K)

The total value is also something that can be a little confusing. You might assume that it would add up to the total of the file sizes and metadata sizes. However, that's clearly not the case in the above screenshot. Instead, it's actually equal to the total sum of blocks in use. This is easily seen if you were to run `ls -as`, were `-s` shows the *allocated* size of each file, in blocks:

![[ls-blocks.png]]

Including `-h` will show the size in kb:

![[ls-blocks-kb.png]]
Now this is a bit confusing at first, since you'd expect it to multiply 4 by the block size, return from the `stat` command above. However, when running `ls -s` it defaults the block size to a different number. This is 512 bytes in POSIX-compliant implementations and 1024 bytes in GNU `ls`, which is shipped with Ubuntu. This is why it's best to just use `-h`. 

Also, if you were to call the command without `-a` the total would be smaller since it won't count the blocks of hidden files or the current directory and parent directory:

![[ls-blocks-kb-no-hidden.png]]