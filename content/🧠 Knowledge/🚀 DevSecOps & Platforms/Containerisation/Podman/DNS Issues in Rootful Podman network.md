---
title: DNS Resolution Issues
tags:
  - containerisation
  - podman
  - firewall
  - dns
  - troubleshooting
url: podman-rootful-network-dns-issues
---

>[!todo]
>- Tidy this up
>- Double check that this is exclusive to *rootful* podman

>[!Note]
>This issue relates to the [[External connection Issues|external connection issues]] that be encountered with *rootful* podman when attempting to communicate with containers via an external device on the network

When running containers using *rootful* podman, DNS resolution of other containers by hostname can fail silently or cause startup errors. This occurs because rootful podman creates networking interfaces on the host, where DNS is provided via a local forwarder (e.g., `10.89.0.1:53`).

If a host firewall (e.g., **UFW**) is in place and blocks outbound DNS requests (UDP port 53) from the Podman bridge interface, containers won't be able to resolve any container names — even if they are on the same network.
## Troubleshooting with Nginx example

Given the following config in an Nginx container:

```nginx
events {}

stream {
    upstream freeswitch_esl {
        server freeswitch:8021;
    }

    server {
        listen 8022;
        proxy_bind $remote_addr transparent;
        proxy_pass freeswitch_esl;
    }
}

```

The container will crash and error out with the following logs:

```log
/docker-entrypoint.sh: Configuration complete; ready for start up
2025/06/15 14:32:22 [emerg] 1#1: host not found in upstream "freeswitch:8021" in /etc/nginx/nginx.conf:5
nginx: [emerg] host not found in upstream "freeswitch:8021" in /etc/nginx/nginx.conf:5
```

Meanwhile, UFW logs on the host system show the following (via `journalctl -g BLOCK`)

```log
Jun 16 00:02:32 freeswitch-node-1 kernel: [UFW BLOCK] IN=podman1 OUT= MAC=fe:8a:3d:4b:19:c7:ae:f2:11:bc:45:67:89:ab SRC=10.89.0.17 DST=10.89.0.1 LEN=56 TOS=0x00 PREC=0x00 TTL=64 ID=18601 DF PROTO=UDP SPT=38994 DPT=53 LEN=36 

```
## Solution
The solution involves allowing DNS traffic to flow from the Podman bridge interface:

```sh
sudo ufw allow in on <podman bridge interface> to any port 53 proto udp
sudo ufw reload
```

