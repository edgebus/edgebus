# EdgeBus

[EdgeBus](https://docs.edgebus.io) is an application level network edge bus that adds connectivity, auditability, and observability to your apps with no code changes.

## Workspace

This is `workspace` branch of **EdgeBus** multi project repository based on [orphan](https://git-scm.com/docs/git-checkout#Documentation/git-checkout.txt---orphanltnew-branchgt) branches.

The branch contains [VSCode's workspace](https://code.visualstudio.com/docs/editor/workspaces).

| Branch                                                                     | Description                                                               |
|----------------------------------------------------------------------------|---------------------------------------------------------------------------|
| [docs](../../tree/docs)                                                    | Sources of [EdgeBus documentation](https://docs.edgebus.io).              |
| [src-dart-console](../../tree/src-dart-console-master)                     | Dart sources of an Administrator Console Web Application.                 |
| [src-typescript-service](../../tree/src-typescript-service-master)         | TypeScript sources of a Service Application.                              |

## Get Started

1. Clone the repository
	```shell
	git clone --branch workspace git@github.com:edgebus/edgebus.git
	cd edgebus
	```
1. Initialize [worktree](https://git-scm.com/docs/git-worktree) by execute following commands
	```shell
	git worktree add docs docs
	git worktree add src-dart-console src-dart-console-master
	git worktree add src-typescript-service src-typescript-service-master
	```
1. Open VSCode Workspace
	```shell
	code "EdgeBus.code-workspace"
	```

## Notes

Add new orphan branch

```shell
NEW_BRANCH=...
git worktree add --detach "./${NEW_BRANCH}"
cd "./${NEW_BRANCH}"
git checkout --orphan "${NEW_BRANCH}"
git reset --hard
git commit --allow-empty -m "Initial Commit"
git push origin "${NEW_BRANCH}"
```
