# EdgeBus

[EdgeBus](https://docs.edgebus.io) is an application level network edge bus that adds connectivity, auditability, and observability to your apps with no code changes.

## Workspace

This is `workspace` branch of **EdgeBus** multi project repository based on [orphan](https://git-scm.com/docs/git-checkout#Documentation/git-checkout.txt---orphanltnew-branchgt) branches.

The branch contains [VSCode's workspace](https://code.visualstudio.com/docs/editor/workspaces).

| Branch                                                       | Description                                                               |
|--------------------------------------------------------------|---------------------------------------------------------------------------|
| [docs](../../tree/docs)                                      | Sources of [EdgeBus documentation](https://docs.edgebus.io).  |
| [src/dart/console](../../tree/src/dart/console)              | Dart sources of an Administrator Console Web Application.                 |
| [src/typescript/service](../../tree/src/typescript/service)  | TypeScript sources of a Service Application.                              |

## Get Started

1. Clone the repository
	```shell
	git clone --branch workspace git@github.com:edgebus/edgebus.git
	```
1. Enter into cloned directory
	```shell
	cd edgebus
	```
1. Initialize [worktree](https://git-scm.com/docs/git-worktree) by execute following commands
	```shell
	for BRANCH in $(cat README.md | tail -n +11 | grep -E '^\| \[([a-z\-\/]+)\]' | awk -F'[][]' '{print $2}'); do git worktree add "${BRANCH}" "${BRANCH}"; done
	```
1. Open VSCode Workspace
	```shell
	code "EdgeBus.code-workspace"
	```

## Notes

Add new orphan branch

```shell
NEW_ORPHAN_BRANCH=mybranch
git switch --orphan  "${NEW_ORPHAN_BRANCH}"
git commit --allow-empty -m "Initial Commit"
git push origin "${NEW_ORPHAN_BRANCH}"
```
