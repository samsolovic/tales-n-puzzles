# Seedream Art Generation

This folder is reserved for the automated image generation pipeline.

## Why API instead of driving the Doubao web UI

The Doubao consumer app does not expose a public "chat with this image" API for this workflow. The official programmatic route is Volcengine Ark:

- [Image generation API](https://docs.volcengine.com/docs/ark/image-generation-api?lang=zh)
- [API key setup](https://docs.volcengine.com/docs/ark/api-key?lang=zh)
- [Base URL and authentication](https://docs.volcengine.com/docs/ark/base-url-and-authentication?lang=zh)
- [Seedream 4.0 model page](https://console.volcengine.com/ark/region:cn-beijing/model/detail?name=doubao-seedream-4-0)

Driving the web UI with Playwright is technically possible, but it needs your logged-in session, can hit captcha or UI changes, and is not a reliable production pipeline.

## Setup

1. Open Volcengine Ark and activate the Seedream image model.
2. Create an API key with image-generation access.
3. Copy `.env.example` to `.env`.
4. Fill in `ARK_API_KEY`, `ARK_IMAGE_MODEL`, and the base URL.
5. Do not commit `.env`; it is ignored.
6. Keep a billing cap and use a low-cost first test.

## Intended pipeline

```text
tools/art/prompts/*.json   prompts, reference image paths, aspect ratio, variants
tools/art/generate.mjs     calls Ark, downloads results
docs/art/scenes/           generated attempts
docs/art/contact-sheets/   comparison sheets
```

The generator will:

- load the prompt and reference image
- request 1–4 variants with fixed seeds where supported
- save the images with model/seed/prompt metadata
- create a contact sheet for review
- never place the API key in logs or git

## First test

Do not start with 20 images. Generate **one** 9:16 Act 1 attempt first, check billing, latency, reference consistency, and output size. Then batch.

## Notes

- Seedream 4.0 supports reference-image workflows; use the approved 女娃 v3 and 精卫 v2 as references.
- Keep prompts in `docs/art/jingwei-art-brief.md` as the source of truth.
- Use ChatGPT only for edits/cutouts if needed; the main generation should be Seedream.
- Confirm the commercial terms of the API plan before shipping generated assets.
