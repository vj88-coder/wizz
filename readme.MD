# Wizz · Progressive Unlock

Interactive prototype for a Progressive Unlock feature on Wizz.
Profile content unlocks gradually as users exchange messages, giving them a reason to keep talking beyond the first match.

---

## Feature

### Unlock Flow

| Messages | What unlocks | What's visible |
|----------|-------------|----------------|
| **0** (match) | - | Photo 1 + Name + Age + Country. All other content blurred with "🔓 Send 3 messages to unlock" |
| **3** | Bio + Interest stickers + Zodiac | Celebratory animation in chat. Both users see it |
| **5** | Deezer music + Photos 2-3 | Same animation pattern |
| **10** (MD) | Full profile + Video + Full Profile badge | Badge visible to other users in swipe stack |

### Reveal Shortcut

At any locked milestone, a "Reveal Now" button appears. Costs 100 WiCoins via the existing Reveal booster. Unlocks next tier only (not full profile).

### Edge Cases

| Case | Behavior |
|------|----------|
| Empty profiles (< 3 photos AND no bio/music) | Feature disabled for that profile. Gate behind completeness ≥ "Good" |
| One-sided conversation | Both must exchange N messages total (prevents spam-unlocking) |
| Block / report | Unlocked content re-locks immediately |
| Existing conversations at launch | Already past msg 10 = all content visible, no retroactive locking |
| Profile edits post-unlock | New content is visible, no re-locking |

---

## KPIs

| Type | Metric |
|------|--------|
| **Primary** | % DAU reaching MD (10 messages) |
| **Secondary** | Message 5+ rate |
| **Secondary** | Reveal booster purchases/day |
| **Secondary** | Profile completion rate |
| **Guardrail** | D7 retention by gender (especially female) |
| **Guardrail** | Match acceptance rate |

---

## Tracking Plan

| Event | Trigger | Properties | Measures |
|-------|---------|------------|----------|
| `progressive_unlock.milestone_reached` | Conversation hits msg 3, 5, or 10 | `milestone`, `conversation_id`, `time_since_match`, `user_gender` | MD conversion funnel by stage |
| `progressive_unlock.animation_viewed` | Unlock animation displays | `milestone`, `conversation_id` | Feature visibility |
| `progressive_unlock.reveal_tapped` | User taps "Reveal Now" | `milestone`, `conversation_id` | Monetization intent |
| `progressive_unlock.reveal_purchased` | Reveal purchase completes | `milestone`, `wicoins_spent`, `conversation_id` | ARPPU impact, WiCoin sink velocity |
| `progressive_unlock.reveal_abandoned` | User taps Reveal but doesn't buy | `milestone`, `reason` (insufficient_wicoins / cancelled) | Conversion friction |

---

## Testing Strategy

| Phase | Timeline | Scope | Criteria to advance |
|-------|----------|-------|---------------------|
| **1** | Week 1-2 | A/B 50/50 new users in Australia | D7 + D14: MD ≥ +2pts, female retention flat, acceptance ≥ -3pts |
| **2** | Week 3 | Replicate A/B 50/50 in UK or Canada | Same thresholds, rules out country-specific effects |
| **3** | Week 4-6 | US: 10% → 20% → 50% → 100% new users | Same go/no-go checked daily |

Sample size: ~5K users per group to detect +2pt MD lift with 80% power.

### Go / no-go (at every stage)

- MD rate ≥ +2pts vs. control
- Female D7 retention flat or positive
- Match acceptance rate not down > 3pts
- Any guardrail breaks = immediate rollback + cohort analysis by gender/age

### Expected results

| Metric | Expected |
|--------|----------|
| MD rate | +3-5pts |
| Reveal purchases | 3-5% of users at a locked milestone |
| Profile completion | +10-15% users reaching "Good" score |
