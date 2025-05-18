---
title: Recovering lost Commits in GitHub
tags:
  - git
  - github
url: github-recovering-lost-commits
---
>[!info]- Software versions used
>- [GitHub 2025-05-16 Release](https://github.blog/changelog/2025-05-16-github-copilot-premium-request-report-available-today/)

Disaster! You've just done a `git reset --hard` and lost a bunch of commits. Worse still, you've somehow expired the local [[Git Reflog|reflog]]. All hope is lost... or is it? If you just force pushed to GitHub then you're in luck. For better or for worse, the commits are actually still accessible via the GitHub API.

If you're trying to recover lost commits then this is a blessing in disguise. However, if you've just pushed a secret then this page should serve as just one reminder why a pushed secret is compromised. 
## Recovering the Secret
1. Find the commit ID before you pushed your changes by using the Events API:
	```sh
	curl -u <username> https://api.github.com/repos/<owner>/<repo>/events
	```
2. This should return an array of JSON objects. You'll have to look through them manually to find the exact commit you want. Each object looks something like this:
	```json
	{
		"id": "49336935740",
		"type": "PushEvent",
		"actor": {
			// ...
		},
		"repo": {
			// ...
		},
		"payload": {
			// ...
			"commits": [
				{
					"sha": "5a7dffbbb58e12ac8ea4264d38283f437ec9ea16",
					"author": {
						"email": "32993852+anthops@users.noreply.github.com",
						"name": "Tony"
					},
					"message": "docs(git): add note regarding retroactive git commits",
					"distinct": true,
					"url": "https://api.github.com/repos/anthops/anthopedia/commits/5a7dffbbb58e12ac8ea4264d38283f437ec9ea16"
				}
			]
		},
		"public": true,
		"created_at": "2025-05-04T11:22:11Z"
	}
	```
3. You can then directly access the repository at in the same state it was at the commit via GitHub
	```md
	https://github.com/<owner>/<repo>/tree/<sha>
	```
4. Alternatively, you could use the API directly to create a branch from the missing commit:
	```sh
  curl -u <username> -X Post -d '{"ref": "refs/heads/<new-branch-name>", "sha": "<sha>"}' https://api.github.com/repos/<owner>/<repo>
	```
## Other considerations
In step 3 you would have noticed that the repository contains the following disclaimer when accessing a lost commit:

![[lost-commit.png|850]]

This is because GitHub has the commit object but no reference (branch, tag, etc) to it. Also, notice how the commit date in that screenshot is from **2010**. It's a pretty crazy example I stumbled upon which [you can find here](https://github.com/nylen/connectbot/tree/1cd775d3f826ddad6806ddd2b745dd2eaf9a4521). 
This really goes to show how often GitHub garbage collects dangling commits - pretty much never unless you [explicitly request it from support](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository#about-sensitive-data-exposure).

This brings us to another point - couldn't someone just delete their repository, effectively removing all the commits? Well.. [[Accessing Deleted & Private Repository Data|not quite]].