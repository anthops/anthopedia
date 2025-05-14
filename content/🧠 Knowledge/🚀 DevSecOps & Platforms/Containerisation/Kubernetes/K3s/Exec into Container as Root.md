---
title: Exec into Container as Root
tags:
  - k8s
  - linux
url: k3s-exec-as-root
---
>[!todo]
>- Check if this runs when `runAsNonRoot: true` (It better not!)
>- Check if `readOnlyRootFilesystem: true` prevents writes in this mode (it better!)
>- Check the impact of other `securityContext` configurations like `allowPrivilegeEscalation` and `appArmorProfile`

1. Get container ID
	```sh
	sudo kubectl -n <namespace> describe pod <pod> | grep 'Container ID:'
	```
2. That will output something like the following. We want the UUID value after the `//`:
	```sh
	Container ID: containerd://f78375b1c487e03c9438c729345e54db9d20cfa2ac1fc3494b6eb60872e74778
	```
3. Exec into the container as root via `k3s ctr`:
	```sh
	sudo k3s ctr task exec -it --exec-id myshell --user root <uuid value> sh
	```