---
title: Git Reflog
tags:
  - git
url: git-reflog
---
Every time you move a branch pointer (like `HEAD` or `main`), Git records that change in a **reference log**, or **reflog**. This includes commits, checkouts, rebases, resets, and even stash applications. 

While `git log` only shows commits that are reachable from the current branch history, `git reflog` reveals a record of all reference updates in your local repository. This makes it invaluable for recovering "lost" work — such as after an accidental `reset --hard` or a mistaken `commit --amend`.

To view the reference log on the `HEAD`, simply run:
```sh
git reflog
```
The output will look something like this:
```log
f68f0e3 (HEAD -> main) HEAD@{0}: commit: fix broken API endpoint
bd04d1b HEAD@{1}: commit (amend): add logging
8fca3f7 HEAD@{2}: rebase -i (start): checkout main
5ab27f1 HEAD@{3}: reset: moving to HEAD~2
```

Notice how it includes rebases and resets — operations that **don't appear** in `git log`. The reflog for other branches can be obtained like so:
```sh
git reflog <branch name>
```
## Use cases
1. Immediately revert a `git commit --amend` and keep changes:
	```sh
	git reset --soft HEAD@{1}
	```
2. Immediately revert a `git commit --amend` and **discard** changes:
	```sh
	git reset --hard HEAD@{1}
	```
3. Recover changes from a lost commit
	```sh
	git cherry-pick HEAD@{n}
	```
4. Create a branch from a lost commit
	```sh
	git checkout -b <new branch name> HEAD@{n}
	```
5. Move current branch to point at lost commit (**discards current changes**)
	```sh
	git reset --hard HEAD@{n}
	```
## Managing the Reflog
By default:
- Reachable commits are kept for 90 days
- Unreachable commits (dangling, orphaned) are kept for 30 days

Entries can be manually expired by:
```sh
git reflog expire --expire=now --all
```

## Security Considerations

The reference log is a local construct which does not get pushed to remote repositories like GitHub, GitLab or Bitbucket. This means 
if you accidentally commit a secret **but never push it** and amend the commit, it only exists in your local `.git` directory - including the reflog and object store. You can rewrite history and prune it completely.

If you pushed the secret you **MUST** rotate the secret. Even after amending, squashing, or resetting commits the commit with the secret will remain in the remote for some time and be accessible. For example, [[Recovering lost Commits|lost commits in GitHub can be obtained via the API]].







