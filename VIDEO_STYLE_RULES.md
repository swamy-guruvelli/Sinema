# Funny Doodle Video Rules

These are the house rules for future India videos, Shorts, and longer entertainment videos. They are intentionally practical: every rule should make the video clearer, funnier, or easier to revise.

## The north star

Make the viewer feel that a funny person is drawing an idea in front of them.

The video should feel hand-made and surprising, but never visually confusing. Motion is there to support the joke or the fact, not to prove that the software can move things.

## 1. Script before animation

- Write the voiceover first and read it aloud at the intended energy. The picture serves the sentence; do not animate a visual before knowing what the line is doing.
- One spoken sentence owns one primary visual action.
- Every beat must answer: “What does the viewer look at while this line is spoken?”
- Keep one idea, one fact, or one joke per beat. If a line needs two visuals, split the line or simplify it.
- Use conversational language: short sentences, contractions, specific nouns, and a point of view.
- Put the joke after the setup. Give the viewer a tiny anticipation pause before the punchline.
- Do not make history funny by making the facts vague. The fact stays accurate; the reaction, comparison, timing, or character behavior supplies the joke.

### Beat format

```text
time: 00:06–00:09
speaker: historian
voice: historian.wav
primary actor: reader.svg
primary action: points at the route
secondary action: skeptic leans away
screen text: one short label
sound: voice + one small accent
joke/payoff: “They had plumbing. Of course they did.”
```

## 2. Voice-to-doodle ownership

This is non-negotiable when more than one character is visible.

- Every dialogue line has a `speaker`, `actor`, `startFrame`, and `endFrame`.
- The speaking doodle must be visible, readable, and visually distinct during the line.
- Put the speaker’s name or role beside the active doodle or inside its bubble. Use a consistent color per voice.
- Give the speaking character the strongest contrast and motion. Other characters become still, smaller, quieter, or leave the frame.
- Do not show three characters with equal visual weight while one off-screen voice speaks.
- A voice change gets a visual handoff: cut, glance, head turn, bubble transfer, or a clear change in the active character.
- If the narrator is off-screen, show a narrator mark or keep the scene simple enough that the viewer cannot confuse the narrator with a character.
- Review the video once with sound only and once muted. The speaker identity should be understandable from the combination of voice, label, and active character.

## 3. Staging and overlap

The current test violated this rule by letting several assets occupy the same visual territory.

- One primary focal point per shot. Two secondary elements maximum.
- Divide the 16:9 canvas into three working zones: map/action at left or center, speaking character at right, captions in a quiet lower band.
- Keep a clear halo around the active face, map labels, route lines, and speech bubble. No asset may cross that halo.
- Never place a character over a map label, city pin, route, or another character unless the overlap is the joke and lasts less than a second.
- Use depth intentionally: background texture, map, foreground doodle, then caption. Do not stack everything on one z-index plane.
- When a new doodle enters, remove, park, or shrink the previous doodle. “Visible” is not the same as “useful.”
- Do not let speech bubbles touch another character’s head or point at the wrong character.
- Keep important text inside a 10% safe margin. Avoid the lower-right UI area used by Shorts overlays.

## 4. Map rules

- Treat a map as a stage, not a slide. The map can breathe, react, and receive marks, but it should not be continuously panned to hide a lack of action.
- Introduce geography in this order: landmass, one route or river, one active location, then supporting labels.
- Highlight one location at a time unless the comparison itself is the joke.
- Use one route color and one water color consistently. A route, river, and annotation must never look identical.
- Place labels outside busy shapes with short leader lines. Never make viewers search for a label inside a doodle.
- Use a traveling dot, hand, vehicle, animal, or character to give the map a reason to move.
- When geography changes, show the cause of the change—an arrow, flood, trade line, migration, or character action—not only a camera move.
- Maps do not need perfect scale in a comedy video, but the visual simplification must remain geographically legible.

## 5. Motion language

Use animation principles as a small vocabulary, not as decoration everywhere.

- Anticipation: 4–8 frames before a jump, reveal, turn, or punchline.
- Main action: clear and fast enough to read, usually 8–24 frames for a doodle reaction.
- Overshoot: 2–4 frames beyond the resting pose.
- Settle/follow-through: 6–12 frames for a head, arm, paper, sign, or bubble to finish moving.
- Use arcs for thrown objects, travelers, arms, and camera gestures. Avoid robotic straight-line motion.
- Use squash and stretch sparingly on the object that carries the joke.
- Let secondary motion lag behind the main action. Do not make every layer bounce on the same frame.
- Hold an important pose for at least 8 frames before replacing it.
- Prefer irregular timing: quick reaction, short hold, delayed response, then settle. Constant-speed movement reads as a presentation slide.
- Camera motion is a reveal or emphasis, not the default animation. A shot with no meaningful object action should not be rescued by a slow zoom.

## 6. Comedy rhythm

Use this repeatable pattern:

```text
setup → visual confirmation → character reaction → escalation → punchline → tiny reset
```

- Open with a hook in the first 1–2 seconds for a Short. Start with the odd claim, visual surprise, or argument—not a title card.
- Give the viewer a new readable event roughly every 0.5–1.5 seconds in a Short. The event can be a mark, glance, entrance, label, cut, or sound—not necessarily a new scene.
- Alternate information and reaction. Two explanation beats in a row need a visual gag or character interruption.
- Reuse a prop or character for a callback. A seal, drain, arrow, animal, or skeptical face is funnier the second time because the viewer remembers it.
- Escalate scale or attitude, not just volume: small claim → absurd comparison → character takes it literally.
- End on a button: a final look, reversal, visual tag, or callback. Do not let the video simply run out of narration.

## 7. Audio and captions

- Lock the rough voice track before final animation timing. Animation should react to the delivery, pauses, and interruptions.
- Keep one voice per role across a video. Voice personality is part of the character design.
- Leave a small pause before reactions and punchlines. Do not fill every gap with music.
- Use music as atmosphere only; the dialogue must remain intelligible without turning it up.
- Add one small sound accent for a meaningful visual action: pop, scribble, stamp, splash, or record scratch. Avoid a sound effect on every movement.
- Captions should identify the active speaker and preserve the joke. Never put a full paragraph on screen while a different visual demands attention.
- Check the mix on laptop speakers and headphones. If a line is unclear at low volume, fix the mix or writing rather than relying on subtitles.

## 8. Open-source and online assets

- Prefer SVG or transparent PNG assets that can be separated, recolored, and transformed.
- Keep external assets in `public/assets/<source>/` with a `SOURCES.md` file containing the source URL, creator, license, and download date.
- Never mix more than two unrelated illustration styles in one shot. If an asset is too polished, roughen it with scale, rotation, texture, and staging—but do not cover a mismatch with random filters.
- Use the source asset as a character or prop, not as a whole prebuilt scene. Our timing, camera, speech, and reactions should remain ours.
- Check licenses per asset. “Free download” is not a license; CC0, MIT, public domain, and an explicit commercial-use grant are different things.
- Keep an asset manifest so a future render can reproduce the video without depending on a hotlinked URL.

## 9. Formats

### Shorts

- Use a dedicated 9:16 composition with a 10% safe margin and larger captions.
- Hook immediately, keep the visual premise simple, and make the last beat loop or land cleanly.
- Keep the active speaker and important map detail in the central safe area so platform controls do not cover them.

### Longer videos

- Use 16:9 for the documentary/explainer canvas.
- Give each section a mini-arc: question, explanation, reaction, payoff, transition.
- Use quiet reset frames between dense historical ideas. A reset can be a character look, a clean map, or a single handwritten label.
- Reintroduce the main visual language every few minutes: the same narrator mark, map treatment, recurring skeptic, or callback prop.

## 10. Review gates

Do not expand from a pilot until it passes these checks:

1. Script read-through: funny and accurate without visuals.
2. Audio-only pass: every speaker is identifiable and the pacing has pauses.
3. Graybox pass: boxes replace assets; every line still has a clear visual owner.
4. Collision pass: no face, label, route, or bubble is obscured.
5. Motion pass: actions use anticipation, arcs, reaction timing, and settle; there is no filler camera pan.
6. Mute pass: the visual story still makes sense without audio.
7. Small-screen pass: captions, labels, and faces remain readable at phone size.
8. Export pass: verify duration, audio stream, safe margins, and deterministic rerender.

After publishing, use YouTube retention data to find the exact moments where viewers dip, spike, or rewatch. Move successful top moments earlier and rewrite confusing spikes instead of assuming every spike is a success.

## Sources and rationale

- [YouTube: Get started creating YouTube Shorts](https://support.google.com/youtube/answer/10059070?hl=en) and [Understand three-minute YouTube Shorts](https://support.google.com/youtube/answer/15424877?hl=en-GB) — current Shorts format and engaged-view context.
- [YouTube: Measure key moments for audience retention](https://support.google.com/youtube/answer/9314415?hl=en) — use dips, spikes, and top moments to revise pacing.
- [8frame: How to Storyboard an Explainer Video](https://www.8frame.co/blog/how-to-storyboard-an-explainer-video) — voiceover-first planning and one visual idea per beat.
- [Adobe: 12 principles of animation](https://www.adobe.com/in/creativecloud/roc/blog/video/animation-principles.html) — anticipation, arcs, secondary action, timing, exaggeration, and follow-through.
- [Open Doodles: About](https://www.opendoodles.com/about) — source artwork used in the current asset test; the creator describes the set as CC0.
