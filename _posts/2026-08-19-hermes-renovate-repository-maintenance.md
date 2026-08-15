---
title: "How I Automated Managing an Open Source Project"
date: 2026-08-19
layout: post
categories: blog
tags: [DevOps, AI, Hermes, GitHub, Home-Assistant, RustDesk, Open-Source]
excerpt: "What changed when a real user asked whether my Home Assistant RustDesk project would stay maintained — and I stopped treating dependency updates as the same thing as release engineering."
---

A user of one of my smaller open-source projects recently asked a pretty reasonable question:

**Will this actually stay maintained when the next important update lands?**

The project is [`ha-rustdesk-server`](https://github.com/SankeerthBoddu/ha-rustdesk-server), a Home Assistant App that runs the RustDesk ID/rendezvous and relay services. The practical value is simple: I can self-host the server side of RustDesk instead of depending entirely on the public RustDesk infrastructure.

Renovate was already watching dependencies.

But I realized that **detecting an update is not the same thing as having a maintenance system**.

That sent me back through the build, CI, security, release, support, and now agent workflow around the repository.

![Renovate, Hermes, CI and release flow]({{ '/assets/images/hermes-rustdesk-maintenance-flow.svg' | relative_url }})

## Not every Renovate PR means the same thing

This is probably the most useful distinction I ended up making.

A GitHub Actions update changes how the repository is tested.

A Home Assistant base-image update changes the container I eventually ship.

A RustDesk Server update changes the actual remote-access software users are running.

Those should not all trigger the same release behavior.

I now treat them as three classes:

```text
A. CI / tooling
   review + CI
   merge when safe
   no Home Assistant App release

B. runtime / base image
   review + CI
   packaging revision when I want users to receive it

C. RustDesk upstream
   release/security notes
   new binary checksums
   new App version
   full release path
```

So Renovate is useful, but I do not want it to become the release authority.

**Renovate proposes. The rest of the system decides what the proposal means.**

## The App manifest became the version contract

RustDesk Server can be `1.1.16` while the Home Assistant App is `1.1.16-2`.

The suffix matters.

`1.1.16-2` means I am still packaging RustDesk `1.1.16`, but this is the second Home Assistant packaging revision.

That lets me fix the container, documentation, or release process without pretending upstream RustDesk changed.

I made `rustdesk-server/config.yaml` the release-version authority.

```yaml
version: "1.1.16-2"
```

From there:

```text
config.yaml
    ↓
1.1.16-2
    ↓
GitHub release v1.1.16-2
    ↓
container release 1.1.16-2
```

Deploy also verifies that the release tag matches the App version.

I would rather fail a release than have two systems guessing what version should exist.

## I also wanted the upstream RustDesk binaries inside the trust boundary

The container downloads upstream RustDesk Server release ZIPs.

Previously, a successful HTTPS download was effectively enough.

Now the Dockerfile pins an expected SHA-256 digest for each supported architecture and verifies the downloaded file before extracting it.

```text
RustDesk release asset
        ↓
download exact asset
        ↓
SHA-256 verification
   ├── mismatch → build stops
   └── match    → continue
```

That makes an upstream RustDesk Renovate PR intentionally incomplete by itself.

Renovate can tell me:

```text
1.1.16 → 1.1.17
```

But the release also needs new verified digests for both binaries, a new App version, and a changelog entry.

That little bit of friction is useful.

## The build path needed modernization

The repository was still on Home Assistant's older builder path.

I migrated it to the current BuildKit-based actions and native builds for the two architectures this App supports:

- `amd64`
- `aarch64`

The release publishes one multi-architecture image to GHCR.

Conceptually:

```text
             ha-rustdesk-server:<version>
                       │
             multi-arch manifest
                  ┌────┴────┐
                  │         │
               amd64     aarch64
```

Users reference one package. The registry resolves the correct image.

## Security scanning became part of CI

I added Trivy to the build path.

One detail I did not want to hide was inherited risk.

A fixable HIGH/CRITICAL OS package finding blocks the build.

Library findings inherited from the current Home Assistant base image stay visible, but I do not pretend this repository can rebuild an upstream binary it does not own.

That distinction matters to me:

**visibility is not the same thing as ownership, but lack of ownership is not a reason to hide the finding.**

## The best bugs showed up only when I ran a real release

This was the most useful part of the work.

The individual YAML files could look correct and the jobs could pass independently.

The end-to-end chain still broke.

### GitHub release events did not behave the way I expected

I originally expected:

```text
workflow publishes GitHub Release
        ↓
release event
        ↓
Deploy runs
```

The release was published.

Deploy did not appear.

The issue was GitHub's protection around events generated with a workflow's own `GITHUB_TOKEN`. A workflow-created event does not necessarily recursively start the next workflow the way a human-created event would.

The release path now makes that handoff explicit:

```text
Release Drafter
       ↓
publish exact GitHub Release
       ↓
explicitly dispatch Deploy(tag)
```

That is one of those problems I would not have found by only linting the workflow.

### A metadata value was correct, but its representation was not

The second issue was subtler.

Home Assistant helper output crossed a serialization boundary and values could arrive with JSON string quoting.

Logically:

```text
1.1.16-2
```

Operationally, I was sometimes comparing something closer to:

```text
"1.1.16-2"
```

The image still built, so it was easy to miss.

The strict release-tag check exposed it.

I normalized the metadata before using it for comparisons and container labels.

The broader lesson was simple:

**tool boundaries fail on representation as often as they fail on logic.**

## Then I added Hermes to the loop

This is where the repository became a useful agent experiment for me.

I already run Hermes on Azure and talk to it through Discord and Telegram.

I also use Mnemosyne as an external memory layer.

I did not want to give Hermes a giant prompt saying "maintain this repo."

I wanted the operating procedure to be explicit.

So I created a custom Hermes skill:

`ha-rustdesk-server-maintainer`

The skill knows things like:

- where the version authority lives
- how to classify Renovate changes
- which checksums need verification
- what a RustDesk release requires
- how to diagnose CI
- what Hermes can safely do on a branch
- where it must stop and ask me

The separation matters:

```text
Mnemosyne
    durable context

Hermes skill
    operating procedure

GitHub
    current state

CI
    machine-verifiable policy

Me
    merge / release accountability
```

I specifically do **not** want long-term memory to be the source of truth for the current version, open PRs, current `main` SHA, or CI status.

Those facts expire.

Hermes refreshes them from GitHub.

## What I am comfortable letting the agent do

The agent can automate quite a lot of the reversible work:

- inspect the repository
- review Renovate PRs
- read upstream release notes
- verify checksums
- create a non-main branch
- make a scoped change
- open/update a draft PR
- diagnose CI
- prepare a release candidate

It does not get to decide to ship.

For now, merge and release stay behind an explicit human gate.

And before I widen that autonomy, I also want GitHub rules protecting `main` so the control exists in the platform, not only in the skill instructions.

That gives me two layers:

```text
skill:  do not push directly to main

GitHub: cannot push directly to main
```

That is a much stronger boundary.

## I am packaging the skill separately

The repo-specific skill is useful enough that I am packaging the reusable pattern separately under:

`hermes-repo-maintainer-skills`

The idea is not to publish one universal "AI maintainer."

It is to collect repository-specific operating skills where the rules, checks, and authority boundaries are visible.

The first one is the `ha-rustdesk-server` maintainer skill.

I will link the public skill repository here once it is live.

## Where this ended up

What started as "there is a new RustDesk version" turned into a small but useful operating system around the repository:

```text
Renovate
    detect / propose
        ↓
Hermes + repo skill
    inspect / classify / prepare
        ↓
GitHub Actions
    lint / build / checksum / scan
        ↓
human approval
    merge / ship
        ↓
deterministic release
        ↓
signed amd64 + aarch64 image
        ↓
Home Assistant users can upgrade
```

The part I find interesting is not that an AI agent can edit YAML.

It is deciding:

- what belongs in durable memory
- what belongs in a skill
- what must be read live
- what CI should enforce
- and what still requires human authority

That feels much closer to real platform engineering than simply giving an agent write access and calling it autonomous.
