---
title: Order of Flags
tags:
  - linux
  - tar
url: linux-tar-order-of-flags
---
>[!todo]
>Write note about how the order of flags matters in `tar`, especially when it comes to `-f`

 E.g. the following will fail because `-f` actually needs to be at the end:

```sh
tar -vcfz filename.tar.gz
```

This will work:
```sh
tar -vczf filename.tar.gz
```




