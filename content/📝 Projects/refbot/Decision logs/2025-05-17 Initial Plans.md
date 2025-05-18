---
title: 2025-05-17 Initial Plans
tags:
  - github
  - "#obsidian"
url: refbot-2025-05-17
---
## Problem
The anthopedia is full of "how-tos" on different software and tech, as well as references to bugs in certain opensource & proprietary software. 

As time goes on it is inevitable that these docs will become outdated. Articles with tips and tricks will one day contain referenced to deprecated and long gone commands, whereas notes on bugs and workarounds will reference issues that have since been solved (I hope). 

As the anthopedia grows over the years, it will become harder and more time consuming to manually keep track of notes and their references to see if they're still up to date. We need some way to help automate this *checking*.

Also, I would only want to track the versions of software where it matters. This is pretty much the core software being talked about in an issue and I'd want it tracked except for when there's a bug, since the bug is being tracked instead.
## Potential Solutions 
it would be good to have some kind of automated process, such as a bot or cron-job that:
1. Looks at the anthopedia for a specific file, which lists pages with references to Software and the version of said software, as well as issue references (e.g. GitHub issues). This is better than scraping each page for something or scraping each page for the front-matter, since it's faster and not as ugly in obsidian
2. Checks the latest version of the software and compares the documented and latest version.
	1. If the versioning follows semantic versioning and there has been a new major release, it should raise an issue in the anthopedia Github to prompt me to check if the documentation is up to date.
	2. If the documented version is over 6 months old, it should raise an issue too.
3. Checks if there are any referenced Issues (e.g. GitHub issues) that have been solved.
	1. Raises an Issue to the anthopedia GitHub that the bug has been solved so I can check the documentation. (I'd then be able to make a comment at the start of the note saying that the bug impacts all versions of said software prior to `<fixed version>`)
## Decision Log
### Project name
The project has been created (privately so far) and called [refbot](https://github.com/anthops/refbot).
### Tracking requirements
>[!note]
>The Initial `references.yml` could potentially be automatically generated via a script as well.

Create a `./refbot` folder in the root of the project. It must contain a `references.yml` file, which is the main file used by `refbot`. This is the structure:

>[!warning] Separate doc
>`rules` and `notes` **MUST** be separated by `---` as explained under [[2025-05-17 Initial Plans#rules (optional)|rules (optional)]].

```yml
---
rules:
	- "<path to another file>"
---
notes:
  - path: "<path to note (can have file globs to match many)>"
    referenced_software:
      - name: "<software-name>"
        version_tracking:
          releases: "<release-feed-url>"
          referenced_version: "<specific-version>"
          version_pattern: "<version-pattern with named groups>"      
          tracking_policy:                        
            <named group>:
              type: "<alert | delta>"
              threshold: <number> # if type is delta
        date_tracking:
          referenced_date: "<ISO 8601 date>" 
          time_elapsed: "<ISO 8601 duration>"
    referenced_issues:
      - issue: "<issue-tracker-url>"
```
#### notes
`notes` is an array listing all files & directories that `refbot` should track. Each note entry contains the following fields:
##### `path:`
  The path to the note file(s) to track. This can include glob patterns to match multiple files. For example, `"content/Programming/*"` will match all notes under that directory and `"content/Programming/**/*"` will match all files at any depth
##### `referenced_software:`
A list of software items referenced by the note. If this is specified, `reference_issues` doesn't have to be set, although both be set if needed. Each software entry includes:
- `name:`
  The software's name (e.g., "GitLab") - used as the display name in Issues the bot raises
  
- `version_tracking`
  Contains rules for version-based tracking. If this is defined, `date_tracking` doesn't need to be assigned. Both can be set however.
	- `releases`:
	  A URL to the software’s release or tag feed (e.g., GitHub tags or a release page).
	- `referenced_version:`
	  The version currently referenced in the note (e.g., `"v17.9.2-ee"`).
	- `version_pattern:`
	  A regex pattern that uses **named capture groups** (`(?<name>...)`) to extract parts of the version string for tracking policies.
	- `tracking_policy:`
	  Defines how version changes should trigger alerts. For example, an alert on major version changes or on minor version increases beyond a threshold. Each field defaults to none but at least one field **must** be specified
	  
- `date_tracking`
  Contains rules for time-based tracking. If this is defined, `version_tracking` doesn't need to be assigned. Both can be set however.
	- `referenced_date:` *(optional)*
	  This is an optional field that if specified, must be coupled with `time_elapsed`. This will then instruct the bot to check if the current date is `time_elapsed` later than the `referenced_date`. If so, it will raise an issue. When used, the reference-based tracking doesn't have to be used. It can also be coupled with it. 
	- `time_elapsed:`*(optional)*
	  This is an optional field that if specified, must be coupled with `referenced_date`.  See the `referenced_date` description to see what this command does.
##### `referenced_issues:` 
  A list of issue tracker URLs relevant to the note. If this is specified, `referenced_software` doesn't have to be set, although both be set if needed. `refbot` will monitor these issues and can raise alerts or notifications when an issue is closed or updated, helping track unresolved bugs or feature requests linked to the note. For now, we'll focus on getting it to work for GitHub and GitLab Issues, then decide on how to reference more complex sources like the NVIDIA forums at a later date.

For example:
```yml
notes:
  - path: "content/🧠 Knowledge/🚀 DevSecOps & Platforms/CICD/GitLab CI/*"
    referenced_software:
      - name: "GitLab"
        version_tracking:
          releases: "https://gitlab.com/gitlab-org/gitlab/-/tags"
          referenced_version: "v17.9.2-ee"
          version_pattern: "v(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)-ee"
          tracking_policy:
            major:
              type: alert  # Alert on any major version increase
            minor:
              type: delta
              threshold: 2  # Alert if minor increases by 2+

  - path: "content/🧠 Knowledge/🚀 DevSecOps & Platforms/GitHub/**/*"
    referenced_software:
      - name: "GitHub"
        date_tracking:
          referenced_date: "2025-05-18" # ISO 8601 date
          time_elapsed: "P3M" # ISO 8601 duration specifying the current date must be 3 months past referenced_version

  - path: "content/🧠 Knowledge/🧑🏼‍💻 Programming/Languages/JavaScript & Typescript/Libraries/PixiJS/PixiJS rendering failure.md"
    referenced_issues:
      - issue: "https://github.com/pixijs/pixijs/issues/11389"
```

In the above example, the bot will look check https://gitlab.com/gitlab-org/gitlab/-/tags for tags that match a strict semver, so that it is of similar pattern to the referenced version `v17.9.2-ee`. It will then only create an issue if the major increase or minor increases by 2.

On the other-hand, GitHub uses date-based tracking, since GitHub doesn't actually release *versions*. 

The PixiJs note will have an issue raised if it's referenced issue is closed on GitHub. Also, notice how it is configured to only track by Issue. This is because the version doesn't really matter since the note is only scoped to the issue. Once resolved, it will only be relevant to versions prior to when the issue was fixed.

Issues don't necessarily have to be about bugs but could also be about feature requests. In this case, there might be reason to add a `referenced_software` entry, especially after the issue has been resolved.
##### version patterns & tracking policy 

Notice in the above example the use of `v(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)-ee`. It uses named capture groups that it matches against so we can use them to decide what constitutes a big enough version change.

Here are some examples:

| Version String               | Pattern                                                 | Tracked Components                                   |
| ---------------------------- | ------------------------------------------------------- | ---------------------------------------------------- |
| `v2.4.1`                     | `v(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)`     | major=2, minor=4, patch=1                            |
| `2025.1.3` or `2025.1`       | `(?<year>\\d+)\\.(?<month>\\d+)\\.?(?<build>\\d+)?`     | year=2025, month=1, build=3 or<br>year=2025, month=1 |
| `jdk-24-ga`                  | `jdk-(?<version>\\d+)-ga`                               | version=24                                           |
| `24.04 LTS` or `24.04.2 LTS` | `(?<year>\\d+)\\.(?<month>\\d+)\\.?(?<build>\\d+)? LTS` | year=24, month=04 or<br>year=24, month=04, build=2   |
Then there are 3 possibilities for tracking types:
- `alert` - raises an issue on any increment
- `delta` - raises an issue when the value increments by `threshold`, which much must be specified
- no tracking type - the value is ignored.

`alert` to match any increment or `delta` with a respective `threshold` for a specific change.
#### rules (optional)
Before delving into what this does, consider the scenario where there are many references using the same version rules or even the same software reference with associated version rules. Things would get cluttered.

You *could* do something like this, utilising YAML anchors defined at the top of your file:

```yml
_shared_config:
  - &ubuntu # define shared Ubuntu config
    name: "Ubuntu" 
    version_tracking:
      releases: "https://wiki.ubuntu.com/Releases"
      referenced_version: "24.04.2 LTS"
      version_pattern: "(?<year>\\d+)\\.(?<month>\\d+)(\\.?<build>\\d+)? LTS"
      tracking_policy:
        major:
          type: alert
        minor:
          type: delta
        threshold: 6
  - &semver # define shared semver config
    version_pattern: "v(?<major>\\d+)\\.(?<minor>\\d+)\\.(?<patch>\\d+)"
    tracking_policy:
      major:
        type: alert
      minor:
        type: delta
        threshold: 3

notes:
  - path: "content/🧠 Knowledge/🧑🏼‍💻 Programming/Languages/Java/Frameworks/Java Spring Boot/*"
    referenced_software:
      - *ubuntu # reference Ubuntu
      - name: "Spring Boot"
        version_tracking:
        releases: "https://github.com/spring-projects/spring-boot/tags"
        referenced_version: "v3.4.5"
        <<: *semver # include the semver config
        tracking_policy: # override the tracking_policy
          minor:
            type: delta
            threshold: 5
```


What the `rules` section does instead is allow you to define as many external `.yml` files  consisting of said rules as anchors that you can then reference in `references.yml`. The `---` is required to separate `rules` and `notes` into different YAML docs so that the bot can process `references.yml` when there are "broken" anchor links (prior to them being merged in). 

So you could then have:

```log
.refbot/
    references.yml
    rules.yml
    more_rules.yml
```

- `./refbot/references.yml`
	```yml
	---
	rules:
		- "rules.yml"
		- "more_rules.yml"
	---
	notes:
		...
	```
- `./refbot/rules.yml`
	```yml
	_rules:
	  - &something
	    # shared config here
	  - &something_else
	    # another shared config
	```
- `./refbot/more_rules.yml`
	```yml
	_more_rules:
	  - &more_rules
	    # more shared config
	```

### Merging & Overrides
Consider the case where you have:

```yml
- path: "content/programming/java/**/*"
  referenced_software:
    - name: "OpenJDK"
      version_tracking:
        referenced_version: "jdk-24-ga"

- path: "content/programming/java/spring-boot/**/*"
  referenced_software:
    - name: "Spring Boot"
      version_tracking:
        referenced_version: "v3.4.5"
```

Since the Spring Boot docs are a subset of the Java docs, which covers the whole subtree, the bot should combine these without overriding the OpenJDK reference.  
So for a specific file in the Spring Boot folder, the bot should merge the software references as:
```yml
- path: "content/programming/java/spring-boot/some-file.md"
  referenced_software:
    - name: "OpenJDK"
      version_tracking:
        referenced_version: "jdk-24-ga"
    - name: "Spring Boot"
      version_tracking:
        referenced_version: "v3.4.5"
```

This is because the `name:` entries are different.
Now, if the names are the same, the more specific path overrides the more general one. For example:

```yml
- path: "content/programming/java/**/*"
  referenced_software:
    - name: "OpenJDK"
      version_tracking:
        referenced_version: "jdk-21-ga"

- path: "content/programming/java/spring-boot/**/*"
  referenced_software:
-   - name: "OpenJDK"
      version_tracking:
        referenced_version: "jdk-24-ga"
    - name: "Spring Boot"
      version_tracking:
        referenced_version: "v3.4.5"
```

Would result in:
```yml
- path: "content/programming/java/spring-boot/some-file.md"
  referenced_software:
    - name: "OpenJDK"
      version_tracking:
        referenced_version: "jdk-24-ga"
    - name: "Spring Boot"
      version_tracking:
        referenced_version: "v3.4.5"
```
### Bot order of actions
1. Whenever the bot runs, it will check for `rules:` in `references.yml` and merge the files into one
2. It will then iterate over each item defined under `notes:` in `references.yml`.
3. For each instance of `referenced_software` it will use the `releases` URL to check for `referenced_version` and any *newer* versions. The way it does this will be different depending on the URL too:
	 - If it is a GitHub or GitLab URL, it will use the respective API to obtain the latest version
	 - If it is a launchpad URL, that can be programmatically accessed too
	 - If more software release URLs that have APIs are discovered over time, the bot will be updated to recognise them and use the API as well
	 - If it is a non-API supported URL, the bot will scrape and look for a most recent version by both version number and release date
4. If a newer version is found that is either at least 6 months older or 1 major version larger, the bot will raise an Issue in the anthopedia. This will use `path` and the referenced software's `name` / referenced issue's `issue` variable in the GitHub Issue title and body
### Documentation requirements for the anthopedia (Unrelated to the development of `refbot`)
Although the bot will use the `references.yml` file for all of it's functionality, each page in the anthopedia that talks about software or respective issues, regardless if they are to be tracked or not, should contain the following:
- A callout at the top with a list of each referenced software's version and a link to said release. Should be titled with
  `[!info]- Software versions used.
- A callout at the top with a list of relevant Issues and link to said issues (or forums). Should be titled with
  `[!bug]- Referenced Issues`.
### Next steps
- Apply [[2025-05-17 Initial Plans#Documentation requirements|documentation requirements]] to all existing notes
- Create `references.yml` file in the Anthopedia
- Start drafting a plan for bot or cron-job that could do this
- Look into [Renovate](https://github.com/renovatebot/renovate) as a potential or partial solution if it can be configured enough to do this