---
title: Retroactive Commits
tags:
  - git
url: git-retroactive-commits
---
Imagine that you're working on a project you want to publish or share with others. You look at your commit history and realize you squashed commits a little too much. There are commits combining multiple unrelated changes, and you wish you could go back in time and break them down properly.

Thankfully, Git allows you to do this. While it’s not exactly a quick task, using **interactive rebase** makes it possible to split old commits while preserving history, authorship, and dates — and avoids the risks and pitfalls of orphan branches or force-rebuilding your repo from scratch.
## The Process
>[!warning] Backup!  
>Before making history changes, make a backup branch or clone the repo. If anything goes wrong, you’ll be glad you did.

1. Figure out how far back you want to start adding retroactive commits in the past. Use `git log` and identify the **parent commit** of the one you want to start making commits from. For example, in the log below we want to start making commits from `d22135`, so we'd choose it's parent, `d22135^` 
	```log
	commit 514f026d7895f38e8526d255444169bcdef8aed2 (HEAD -> main, origin/main, origin/HEAD)
	Author: Tony <32993852+anthops@users.noreply.github.com>
	Date:   Fri Apr 25 08:28:00 2025 +0930
	
			style(quartz): set code indent tab-size to 2 and change margins on images after a paragraph

			⋮

	commit d22135af0b6f4bb89e0fd9c21e44a2f3f6bb82d3
	Author: Tony <32993852+anthops@users.noreply.github.com>
	Date:   Tue Apr 8 16:41:00 2025 +0930
	
			docs(springboot): add note on java springboot project layout
	```
2. Start an interactive rebase using the parent commit:
	```sh
	git rebase -i d22135^
	```
3. In the editor that opens, find the commits you want to split into multiple and change `pick` to `edit` for those lines. For example:
	```log
	edit d22135a docs(springboot): add note on java springboot project layout
	pick 162d6aa docs(licensing): add initial notes on software licensing
	edit 791c39d docs: add lots of notes in one big commit
	pick 514f026 style(quartz): set code indent tab-size to 2 and change margins on images after a paragraph
	```
4. When editing each commit, unstage everything in the commit (this keeps the changes in your working directory so you can manually commit each one):
	```sh
	git reset HEAD~
	```
5. Create smaller commits manually, making sure to manually specify the commit date to be somewhat consistent with the original commit you're splitting up. 
   
   Note the use of both `GIT_COMMITTER_DATE` and `--date`. Both are required if you want remote repositories like GitHub to show the correct commit dates in the repository:
	```sh
	git add some-file
	GIT_COMMITTER_DATE="Fri, Apr 25 08:28:00 2025 +0930" git commit --date="Fri, Apr 25 08:28:00 2025 +0930" -m "feat: a more specific commit"

	git add another-file
	GIT_COMMITTER_DATE="Fri, Apr 25 08:47:00 2025 +0930" git commit --date="Fri, Apr 25 08:47:00 2025 +0930" -m "feat: another more specific commit"
	```
6. Continue the rebase until finished:
	```sh
	git rebase --continue
	```
7. Once you're done, force push the updated history:
	```sh
	git push --force-with-lease
	```