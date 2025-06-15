---
title: External connection issues
tags:
  - containerisation
  - networking
  - firewall
  - troubleshooting
url: podman-external-connection-issues
---
When trying to connect from an external machine to a service running inside a Podman container, the connection may fail even though the container is listening and the port is exposed. This is often caused by UFW blocking forwarded traffic between the host's external interface and the Podman bridge interface when running *rootful* containers.
## Symptoms
Trying to connect to a container port on the host from an external machine hangs and then fails:

```sh
sudo telnet -d 192.168.0.209 8021
Trying 192.168.0.209...
telnet: Unable to connect to remote host: Connection refused
```
Even though UFW settings on the host show the port as allowed:

```sh
Status: active

To                         Action      From
--                         ------      ----
8021                       ALLOW       Anywhere                  
22                         ALLOW       Anywhere                  
8021 (v6)                  ALLOW       Anywhere (v6)             
22 (v6)                    ALLOW       Anywhere (v6)             
```
There will be no logs in the container since traffic never reaches it. The key indicator is found by checking UFW logs:
```sh
sudo journalctl -g BLOCK
```

Which may show blocked forwarded packets from the external interface (e.g., `ens18`) to the Podman bridge (e.g., `podman0`):

```log
Jun 15 19:29:06 hostname kernel: [UFW BLOCK] IN=ens18 OUT=podman0 MAC=bc:24:11:94:9b:a7:02:8a:d3:a5:ef:9b:08:00 SRC=192.168.0.98 DST=10.88.0.51 LEN=60 TOS=0x00 PREC=0x00 TTL=63 ID=28647 DF PROTO=TCP SPT=46210 DPT=8021 WINDOW=64240 RES=0x00 SYN URGP=0 

```
## Cause
This is a result of the networking design of *rootful* containers in podman, e.g. ones spun up via `sudo podman run`. Unlike *rootless* containers which use `slirp4nets`, *rootful* containers create networking interfaces on the host, relying on the host to forward incoming packets from the external interface to the Podman bridge, e.g. `ens18` -> `podman0`.

UFW is setup to block forwarding between interfaces by default, resulting in the hanging we see. If IP forwarding on the host is disabled there will be connectivity issues as well.
## Solution
>[!warning] Note
>The UFW rule will have to be applied for every *rootful* podman network (those created with `sudo podman network create`) since each network creates a new interface. The name of the created interface can be found via 
>```sh
>    sudo podman network inspect freeswitch-net | jq -r '.[0].network_interface'
>```
>Consider scripting this process if you're automating network creation and UFW configuration


This solution consists of two parts, the first of which can be done in two ways. For the first step you can either:

1. Add an explicit UFW route forwarding rule to allow traffic from the external interface to the podman bridge:
	```sh
	sudo ufw route allow in on <external interface> out on <podman interface>
	```

2. Or allow forwarding of *all* traffic by default (less secure than the first option since it applies to everything)
	```sh
	sudo ufw default allow FORWARD
	```

and then reload UFW to apply changes:
```sh
sudo ufw reload
```

Next, ensure that IP forwarding is enabled by editing `/etc/sysctl.conf` and uncommenting or adding the line:
```log
net.ipv4.ip_forward=1
```
Then reload the `sysctl` configuration:
```sh
sudo sysctl -p
```

