---
title: Deleting Users & Groups in a Realm
tags:
  - bash
url: keycloak-deleting-realm-users-and-groups
---
>[!todo]
>Tidy up note and add a reason why this might be done. E.g:
>- Removing a federation doesn't remove the users & groups so we want to tidy them up (note that this nukes all users & groups, not federation specific)
>- Maybe create another note on the multiple parents issue with LDAP syncs when trying to preserve inheritance, which contains the "workaround" (yet to be tested if it actually works) where you exclude the specific groups you want to preserve inheritance on and then make a group mapper specifically for them, preserving inheritance. 
>- Link to the the preserved inheritance note explaining that this deletion of users & groups may be required if you attempt to implement the workaround *after* every group and user has already been synced in a flat structure.
>- Maybe make this parallel

>[!danger]
>The scripts below target ALL users & groups in the specified realm, not just those associated with a specific user federation (e.g. LDAP).
>This action is also destructive and irreversible  

Need to use `kcadm` to do this. You'll have to install it and configure it to point to your server with the admin credentials:
```sh
kcadm.sh config credentials \
  --server <your keycloak server URL> \
  --realm master \
  --user admin \
  --client <admin-cli ID>
  --password <admin-password>
```

This can also be done from within the container running keycloak (e.g. on docker or K8s). For example:
```sh
/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --client <admin-cli ID>
  --password <admin-password>
```


For the following, set the `$REALM` value with `export REALM=<your realm>` first.
Next, delete all groups in a Realm
```sh
for gid in $(kcadm get groups -r $REALM | jq -r '.[].id'); do
  echo "Deleting group: $gid"
  kcadm delete groups/$gid -r $REALM
done
```

Then to delete all users (this one batches them into 500 at a time in-case there's heaps):
```sh
kcadm get users -r $REALM --fields id,firstName,lastName | \
  jq -r '.[] | select(.firstName != null and .lastName != null) | .id' > /tmp/user_ids.txt

split -l 500 /tmp/user_ids.txt /tmp/user_batch_

for batch in /tmp/user_batch_*; do
  echo "Processing batch $batch"
  while IFS= read -r uid; do
    echo "Deleting user: $uid"
    kcadm delete users/"$uid" -r $REALM
  done < "$batch"
done

rm /tmp/user_batch_* /tmp/user_ids.txt
```

