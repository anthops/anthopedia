---
title: Transparent Proxying
tags:
  - containerisation
  - nginx
  - proxy
url: nginx-transparent-proxying
---
>[!todo]
>- properly write this out
>- create a mermaid diagram for the flow
>- explain why I was using *rootful* podman
>- link back to UFW 53/udp issues in rootful podman
>- link back to UFW issues for interface forwarding in rootful podman

Nginx's `stream` module supports TCP-level proxying with **transparent source IP spoofing**, using

```nginx
proxy_bind $remote_addr transparent;
```
This tells Nginx to _bind the outbound connection to the client’s original IP address_, making it appear as though the upstream server is being contacted directly by the original client.

This is useful in cases where NAT causes issues with the upstream. In my case, I was having issues with a program on another server trying to connect with FreeSWITCH's event socket, which was sitting in a podman container behind an nginx container

```sh
192.168.0.98 --> 192.168.0.204 --> podman network --> Nginx container --> FreeSWITCH container
```

A simple solution was to create the following `/etc/nginx/nginx.conf`

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
and then run the container like so:
```sh
sudo podman run -d --name nginx --network freeswitch-net --cap-add=NET_RAW -p 8022:8022 -v $(pwd)/nginx.conf:/etc/nginx/nginx.conf docker.io/nginx
```