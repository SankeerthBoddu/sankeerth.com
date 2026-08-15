---
title: "Giving an AI Agent a Real Repository to Maintain"
date: 2026-08-19
layout: post
categories: blog
tags: [AI, Hermes, GitHub, DevOps, Home-Assistant, supply-chain, agents]
excerpt: "What changed when I stopped treating repository maintenance as a few GitHub Actions and started treating it as an operating contract an agent could safely follow."
---

![Renovate, Hermes, CI and release flow]({{ '/assets/images/hermes-rustdesk-maintenance-flow.svg' | relative_url }})

A user of one of my smaller open-source projects recently asked a question that was more useful than it first sounded.

Basically: **will this still be maintained when the next important update comes out?**

The project packages **RustDesk Server as a Home Assistant App**. It lets you run your own RustDesk ID/rendezvous and relay services from Home Assistant instead of depending entirely on the public RustDesk infrastructure.

It isn't a huge codebase. Most of the interesting work is around packaging, networking, dependency updates, container builds, and releases.

My first instinct could have been to say, yes, Renovate watches the dependencies.

But that isn't really the same thing as having a maintenance system.

Renovate can tell me something changed. It can't decide what that change means for users.

That sent me back through the whole repository.

## Renovate is the sensor, not the release manager

A Renovate PR can mean very different things.

A GitHub Actions update might only change how CI runs.

A Home Assistant base-image update changes the container we ship.

A new RustDesk Server release changes the actual remote-access software.

Those shouldn't all follow the same path.

```text
Renovate detects a change
        |
        v
classify the update
        |
        +--> CI/tooling only --------> review + merge, no App release
        |
        +--> runtime/base image -----> packaging revision + release
        |
        +--> RustDesk upstream ------> release notes + checksums
                                       + App version + full release
```

That sounds obvious written down. It wasn't as explicit in the repository before.

## The App manifest became the release contract

RustDesk might be `1.1.16`, while the Home Assistant App is `1.1.16-2`.

That `-2` matters. It means I can fix packaging or the release pipeline without pretending RustDesk itself became a new version.

So I stopped letting generic release tooling infer what the next version should be.

`config.yaml` is now the authority.

If it says:

```yaml
version: "1.1.16-2"
```

then the release is `v1.1.16-2`, and Deploy refuses a tag that doesn't match.

Small rule, but it removes a whole category of ambiguity.

## I wanted the downloaded RustDesk binaries to be part of the trust boundary

The Dockerfile downloads the upstream RustDesk release binaries.

A successful download isn't enough for me.

The image now pins the expected SHA-256 digest for each architecture and verifies the ZIP before extracting it.

```text
RustDesk release asset
        |
        v
download exact amd64 / arm64v8 ZIP
        |
        v
compare SHA-256 with pinned digest
        |
        +--> mismatch: stop the build
        |
        +--> match: continue
```

This also changes what a Renovate RustDesk PR means.

Renovate can bump the version, but the build should not quietly sail through until the new upstream asset hashes have been intentionally reviewed.

That little bit of friction is useful.

## The build path needed modernization too

I was still using the older Home Assistant builder path.

I migrated the project to the current BuildKit-based actions and native builds for both supported architectures: `amd64` and `aarch64`.

The release then publishes one multi-architecture GHCR image. Home Assistant can reference the generic image name and the registry resolves the correct architecture.

I also added Trivy into CI.

The policy is intentionally not just "zero CVEs or fail." The scan distinguishes between actionable OS package findings and inherited library findings from the Home Assistant base image.

Fixable HIGH/CRITICAL OS findings block. Inherited findings stay visible so I know they exist, but I don't pretend this repository can rebuild an upstream binary it doesn't own.

## The most useful bugs only appeared during a real release

This was the part I liked the most.

All the YAML could look reasonable and individual jobs could work, but the end-to-end path still had problems.

The first one was GitHub Actions event behavior.

I expected:

```text
workflow publishes release
        |
        v
release event triggers Deploy
```

That didn't happen the way I expected because GitHub deliberately prevents some recursive workflow triggering when the event is generated with the repository's `GITHUB_TOKEN`.

The release was real. The next workflow just didn't appear.

The fix was to make the orchestration explicit:

```text
Release Drafter
      |
      v
publish exact GitHub Release
      |
      v
explicitly dispatch Deploy(tag)
```

The second issue was smaller but just as useful.

Home Assistant's metadata helper was crossing a serialization boundary. Values that were logically correct could arrive with JSON string quoting.

The image could still build, so it was easy to miss. Once I added a strict release-tag comparison, it surfaced.

That is the kind of bug I like because it changes how I think about workflow design:

**test the representation crossing tool boundaries, not only the value you think you're passing.**

## Renovate, Hermes, CI and the human each have different jobs

This is the operating model I'm moving toward now.

Renovate is the sensor.

Hermes is the operator.

The skill contains procedure.

Mnemosyne contains durable context.

GitHub is the source of live state.

CI is the verifier.

I am still the release authority.

## Why I don't want the agent to remember the current version

This is another distinction I'm becoming more opinionated about.

Long-term memory is useful for things like which repo I maintain, where the Azure checkout lives, how I prefer to be notified, and whether I want release approval before shipping.

It is a bad source of truth for the current RustDesk version, latest release, current `main` SHA, open PRs, or CI status. Those facts expire.

So the skill explicitly tells Hermes to refresh them from GitHub before acting.

```text
Mnemosyne = durable context
Skill     = operating procedure
GitHub    = current state
CI        = machine-verifiable policy
Human     = accountability
```

## How I want Hermes to work with Renovate

I don't want an agent blindly merging every dependency PR.

The skill classifies them first.

### CI/tooling dependency

Review it, run CI, merge when safe. No Home Assistant App release just because `actions/checkout` changed.

### Runtime/base-image dependency

If the shipped container changes and I want users to receive it, that needs a packaging revision.

### RustDesk upstream release

That gets the full path:

```text
new RustDesk version
    |
    v
read release/security notes
    |
    v
verify both architecture digests
    |
    v
update Dockerfile
    |
    v
App version <new version>-1
    |
    v
changelog
    |
    v
draft release PR
    |
    v
CI + native builds + scans
    |
    v
human release approval
```

That's the difference between dependency automation and release governance.

## The agent gets autonomy, but not accountability

I do want Hermes to be useful.

It should be able to inspect the repo, triage issues, review Renovate PRs, research upstream releases, verify checksums, create branches, make changes, open draft PRs, diagnose CI, and update those PRs.

Those are reversible, inspectable operations.

I don't want it autonomously pushing directly to `main`, bypassing CI, weakening a security gate, merging a release, publishing a release, changing encryption/network defaults, or posting a sensitive maintainer response.

That's not because the agent can't click the button.

It's because **permission and accountability are different things**.

## One more control I still want to add

The repository's `main` branch should be protected with a GitHub ruleset.

Right now the skill says: don't direct-push to `main`.

I also want GitHub to say: you can't direct-push to `main`.

That is the same pattern I use in enterprise platforms: policy in the workflow plus enforcement in the control plane.

## What this small project taught me

This started as maintenance on a Home Assistant App.

It turned into a useful little example of dependency automation, multi-architecture container builds, software supply-chain verification, vulnerability policy, deterministic release engineering, CI/CD event semantics, agent skills, external memory, and human approval boundaries.

The interesting question for me isn't whether an AI agent can edit YAML.

It is:

> **What should the agent decide, what should live systems supply as current truth, what should CI enforce, and what should a human still authorize?**

That feels much closer to the agentic platform-engineering problems I care about than a one-off demo where an agent happens to open a pull request.
