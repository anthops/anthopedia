---
title: Troubleshooting Network Connectivity
tags:
  - linux
  - networking
  - troubleshooting
url: linux-troubleshooting-network-connectivity
---
>[!todo]
>- Tidy up the notes of course since this is just a brain dump of commands lol
>- Make note somewhere about different interface types and naming conventions. E.g. `en` = ethernet, `vmbr` = proxmox virtual bridge
>- Add note about EUI-64

Check if you can hit anything
```sh
ping 8.8.8.8
ping <gateway>
```

View the network interfaces

```sh
ip link show
```

Example output like:
```log
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
		link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: eno1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq master vmbr0 state UP mode DEFAULT group default qlen 1000
		link/ether 5c:85:7e:43:a2:d1 brd ff:ff:ff:ff:ff:ff
		altname enp1s0f0
3: eno2: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
		link/ether 5c:85:7e:43:a2:d2 brd ff:ff:ff:ff:ff:ff
		altname enp1s0f1
4: eno3: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
		link/ether 5c:85:7e:43:a2:d3 brd ff:ff:ff:ff:ff:ff
		altname enp2s0f0
5: eno4: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN mode DEFAULT group default qlen 1000
		link/ether 5c:85:7e:43:a2:d4 brd ff:ff:ff:ff:ff:ff
		altname enp2s0f1
6: vmbr0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP mode DEFAULT group default qlen 1000
		link/ether 5c:85:7e:43:a2:d1 brd ff:ff:ff:ff:ff:ff
```


Look at a specific interface
```sh
ip link show <interface>
```

Example bad output:
```log
2: eno1: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc mq master vmbr0 state DOWN mode DEFAULT group default qlen 1000
		link/ether 5c:85:7e:43:a2:d1 brd ff:ff:ff:ff:ff:ff
		altname enp1s0f0
```
- `NO-CARRIER` = No cable detected or switch/router offline
- `UP` = Interface is administratively up
- `state DOWN` = Link state is down (due to no carrier or disabled bridge)
- `master vmbr0` = Interface is part of the Linux bridge `vmbr0`

Look at IP addressed for interfaces:

```sh
ip a
```

E.g. 
```log
2: eno1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.0.69/24 brd 192.168.0.255 scope global eno1
       valid_lft forever preferred_lft forever
    inet6 fe80::5e85:7eff:fe43:a2d1/64 scope link
       valid_lft forever preferred_lft forever
```
- `inet` = IPv4 address
- `inet6` = IPv6 link-local address
- `LOWER_UP` = Cable connected and link detected

Check for if you're plugged into the wrong device by making the selected physical port light up (obviously requires interface that's a physical NIC):
```sh
ethtool -p <interface> <time>
```
E.g. make `eno2` flash for 10 seconds
```sh
ethtool -p eno2 10
```

Look at kernel logs related to NICs
```sh
dmesg | grep -i eth
```
Get compact summary of interface status and related IPs
```sh
ip -br a
```
Outputs something like
```sh
lo               UNKNOWN        127.0.0.1/8 ::1/128 
eno1             UP             
eno2             DOWN           
eno3             DOWN           
eno4             DOWN           
vmbr0            UP             192.168.0.69/24 fe80::5e85:7eff:fe43:a2d1/64
```
