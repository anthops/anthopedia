---
title: Squashing Commits
tags:
  - git
---
>[!danger]+ Leaked Secrets
>If you have leaked an API key to GitHub or some other remote, squashing alone is not a safe solution. Consider the key compromised - **the only safe solution** is to rotate the key.

Sometimes when working on a feature, you might end up making a series of small, messy commits like "fix typo", "try again", or "oops". While this is fine during development, it's not ideal to leave a cluttered commit history — especially in a shared or public repository.

Squashing commits allows you to **clean up your Git history** by combining multiple commits into a single, meaningful one. This makes your history easier to read and more useful for collaborators or future you.

>[!tip]+ 
>If you're working on a branch that's going to be merged via a PR or MR on platforms like GitHub or Gitlab, you can skip manual squashing since they provide built-in options to *Squash and merge*, flattening all the commits into one during the merge itself.
## Squashing the last *n* commits
The simplest case of squashing commits is squashing the last *n* commits in your branch:
1. Initiate an interactive rebase. For example, squashing the last 2 commits into one:
	```sh
	git rebase -i HEAD~2
	```
2. This will bring up the editor with your commits, each prefixed with `pick`. Simply leave the top commit as is and then replace `pick` with `squash` or `s` for the commits below it:
	```log
	pick e1a2b3c feat: add some feature
	squash f4d5e6a aaa bad commit message
	```
3. Save and then when prompted replace the commit message with a cleaned-up version:
	```log
	feat: some better message
	```
4. Finally, push the commits. If these commits were already pushed then you'll have to add `--force-with-lease`:
	```sh
	git push --force-with-lease
	```
## Squashing a Series of Earlier Commits
Sometimes you might want to squash a **range of commits that are not the latest**, e.g. from `db29964` to `ab82224`, but **leave newer commits untouched**.

For example:
```log
HEAD -> cfcd147  <-- newer commit (should be preserved)
        a354e77  <-- newer commit (should be preserved)
        ab82224  <-- last commit to squash
        ...      <-- all commits between should be squashed
        db29964  <-- first commit to squash
```

1. The first step is to start an interactive rebase from the commit before the range (the oldest commit we want to squash). Don't forget the `^` at the end of the command to refer to the parent.
	```sh
	git rebase -i db2996452f5ec3866cf6b5621654b8da73f85230^
	```
2. In the editor, squash the desired commits:
	```log
	pick db29964 Oldest commit to squash in range
	squash ...
	squash ...
	squash ab82224 Most recent commit to squash in range
	pick a354e77 Leave intact
	pick cfcd147 Leave intact
	```
3. Save and then edit the commit message to consolidate and explain the changes. This will default to a list of all the previous commits so make sure to replace that with just the squashed commit:
	```log
	feat: some message that reflects all the changes in the range
	```
4. Push the commits. Add `--force-with-lease` if the squashed commits had already been pushed to the remote:
	```sh
	git push --force-with-lease
	```