# Selah

> *Be still, and know.*

Selah is a prayer and scripture companion built for women — for the moments you actually reach for your phone. Mood-based verse discovery, a daily bite of scripture, guided spiritual paths, and a private space to trace your journey with God.

---

## What it is

A minimal iOS app built around one question: *how are you right now?* Tap a mood, receive a verse and a companion prayer. No feed, no social layer, no noise.

**Core features**
- 16 mood states → curated KJV verse + companion prayer
- Daily Bite — one verse per day with a reflection question, stable across opens
- Verse Traces — a one-line reflection anchored to the verse you were reading, timestamped
- Guided Paths — structured 5–7 day spiritual journeys (5 paths at launch)
- 6 curated collections including cycle-aware scripture
- Daily streak + smart notification scheduling
- 9-step onboarding with personalisation and Selah Plus paywall
- Drip funnel — a timed re-engagement offer for users who skip the paywall

---

## Stack

- **React Native** (Expo) — iOS
- **AsyncStorage** — all user data stored locally, no backend
- **RevenueCat** — subscription management (Selah Plus)
- **expo-notifications** — local push notifications, no server required

---

## Content

- 149 KJV verses across Psalms, Isaiah, Proverbs, Romans, Philippians, Lamentations, Zephaniah
- 16 companion prayers — one per mood tag
- 5 Guided Paths — 31 days of content with verse, prayer, and daily practice per day
- All content stored in `assets/data/library.json` and `assets/data/prayers.json`
- Source of truth: `library.jsonl` and `prayers.jsonl` (human-editable, one entry per line)

---

## Legal

This repository contains the website for the Selah iOS app.

- [Terms of Service](terms.html)
- [Privacy Policy](privacy.html)

Selah is a trading name of Evie Maxine ROSE, a sole trader registered in New Zealand. NZBN: 9429049441673.

---

*Built by one woman, for women.*
