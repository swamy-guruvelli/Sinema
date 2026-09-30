# AWS beginner video: research + visual directions

Research pass completed 2026-09-18. This is a visual planning document only; no new script, voice generation, dialogue sync, or final video render is authorized by this pass.

## Reference captures

The browser captures live in `output/playwright/`:

- `aws-research-architecture-icons.png` — AWS-approved architecture icon/toolkit page.
- `aws-research-ec2-getting-started.png` — official EC2 beginner flow: account, launch, configure, connect, terminate.
- `aws-research-s3-getting-started.png` — official S3 beginner flow: account, bucket, object, start building.

Use these captures as composition references for a browser-window treatment. For production, prefer approved AWS icon assets and small, readable crops; do not lift an entire page as if it were our own UI.

## Official links

- [AWS Architecture Icons](https://aws.amazon.com/architecture/icons/) — approved icon/toolkit source for architecture diagrams and presentation-style materials.
- [Getting Started with Amazon EC2](https://aws.amazon.com/ec2/getting-started/) — compute explanation and beginner sequence.
- [Getting started with Amazon S3](https://aws.amazon.com/s3/getting-started/) — object storage, buckets, and beginner sequence.
- [EC2 user-guide getting started](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/EC2_GetStarted.html) — virtual-server components and cost/safety reminders.
- [S3 user-guide getting started](https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html) — the bucket/object mental model.
- [AWS branding resources](https://aws.amazon.com/partners/branding/) — brand-use reference to check before using AWS marks in a final public video.
- [Official AWS: What is AWS?](https://www.youtube.com/watch?v=a9__D53WsUs) — pacing/reference only.
- [Official AWS: What Is AWS? Explained Clearly](https://www.youtube.com/watch?v=VwF6wrYYbyE) — pacing/reference only.

Non-official beginner explainers were also checked for pacing, but they are not production assets. Do not reuse their footage, screenshots, music, or wording.

## Three visual directions

### 1. Browser-first: “Show me where it happens” — recommended

Rick presents the beginner problem on the left while a clean browser window opens on the right. Stewie challenges each claim; the browser scrolls to one official phrase, then that phrase transforms into a simple diagram.

- EC2 page becomes “rent a computer” and a small compute card.
- S3 page becomes “a box for files” and a bucket/object card.
- Architecture Icons page becomes the final connected map.
- Motion: browser slide-in, cursor click, highlighted text, crop/zoom, icon snap, and one short pan per concept.

This gives the requested browser-window feel while keeping the explanation concrete and easy to follow.

### 2. Explain-like-I’m-five: “Cloud as a helpful toy shelf”

Start with a familiar physical problem: one tiny laptop, too many visitors, and files spilling everywhere. Each AWS concept is introduced as a simple object before a small browser crop confirms the real service.

- EC2 = borrow a bigger helper computer.
- S3 = a labeled storage box for files.
- Database = a notebook that remembers structured facts.
- Scaling = add helpers when the queue grows, remove them when it shrinks.
- Motion: object pop-up, handoff arrows, one-to-one comparisons, and a gentle camera push rather than repeated card fades.

This is the clearest option for a five-year-old audience, with official screenshots used as evidence rather than as the whole screen.

### 3. Debate board: “Problem / evidence / solution”

Every beat is a three-column board: the real beginner problem, an official AWS browser snippet, and the plain-English solution. Rick argues from the problem; Stewie asks the skeptical question; the middle column reveals the evidence.

- Use a progress rail: Compute → Storage → Data → Scale → Safety.
- Motion: wipe between columns, stamp/check reveal, service-icon handoff, and occasional full-board zoom-out.
- Keep each board to one idea so the debate stays readable instead of becoming a wall of text.

This is the most structured and easiest to extend into future beginner videos.

## Proposed direction for approval

Use Direction 1 as the base, borrow Direction 2’s toy analogies, and use Direction 3’s progress rail. The browser is a small, stylized evidence window with a short crop/phrase—not a full webpage screenshot. That gives us a consistent browser frame with enough visual variety:

1. problem card / character reaction;
2. browser evidence;
3. highlighted phrase;
4. plain-English object or service card;
5. small connected diagram;
6. return to the debate.

No full voice/script pass should begin until this direction is approved. Once approved, render three silent proof stills first: the EC2 browser transformation, the S3 browser transformation, and the final connected architecture board. Then review the audio waveform for silence/beep artifacts before any character sync.
