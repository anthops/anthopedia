---
title: Event Socket Library (ESL)
tags:
  - telephony
  - freeswitch
url: freeswitch_esl
---
Requires at least following mods to be installed on FreeSWITCH (`/etc/freeswitch/autoload_configs/modules.conf.xml`)

```xml
<configuration name="modules.conf" description="Modules">
	<modules>
		<load module="mod_commands"/>       <!-- adds the underyling API commands used by ESL -->
		<load module="mod_event_socket"/>   <!-- adds the event socket -->
		<load module="mod_dptools"/>        <!-- needed for dialplans that route to esl client -->
		<load module="mod_sofia"/>          <!-- needed for inbound calls that trigger the dialplan -->
	</modules>
</configuration>
```

Then create `/etc/freeswitch/autoload_configs/event_socket.conf.xml` to configure it:
```xml
<configuration name="event_socket.conf" description="ESL Connection">
	<settings>
		<param name="listen-ip" value="0.0.0.0"/>           <!-- socket listens on localhost -->
		<param name="listen-port" value="8021"/>            <!-- socket port -->
		<param name="password" value="$${esl_password}"/>   <!-- password used to authenticate with esl (set elsewhere) -->
		<param name="apply-inbound-acl" value="esl"/>       <!-- ACL rules to only allow connections from certain IPs -->
	</settings>
</configuration>
```

The ACL config exists in `/etc/freeswitch/autoload_configs/acl.conf.xml`. For example, this will only allow connections from localhost as well as IPs `10.0.0.0` -> `10.0.0.255`

>The localhost is required if you want to use `fs_cli` on the same server or container

```xml
<configuration name="acl.conf">
	<network-lists>
		<list name="esl" default="deny">
			<node type="allow" cidr="0.0.0.0/32"/>
			<node type="allow" cidr="10.0.0.0/24"/>
		</list>
	</network-lists>
</configuration>
```