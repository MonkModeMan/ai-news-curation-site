---
title: ScreenSuite - The most comprehensive evaluation suite for GUI Agents!
description: ''
pubDate: Fri, 06 Jun 2025 00:00:00 GMT
source: Hugging Face Blog
tags:
- huggingface
- transformers
- nlp
url: https://huggingface.co/blog/screensuite
---

ScreenSuite - The most comprehensive evaluation suite for GUI Agents!
Releasing ScreenSuite, the most comprehensive evaluation suite for GUI Agents!
TL;DR
Over the past few weeks, we’ve been working tirelessly on making GUI agents more open, accessible and easy to integrate. Along the way, we created the largest benchmarking suite for GUI agents performances 👉 let us introduce ScreenSuite.
We are very excited to share it with you today: ScreenSuite is the most comprehensive and easiest way to evaluate Vision Language Models (VLMs)across many agentic capabilities!
WTF is a GUI Agent?
GUI Agents in action - courtesy of OSWorld
In short, an AI Agent is a robot that acts in the virtual world. (more thorough definition here)
In particular, a “GUI Agent” is an agent that lives in a GUI. Think “an agent that can do clicks and navigate on my desktop or my phone”, à la Claude Computer Use.
This means in essence that the AI model powering the agent will be given a task like “Fill the rest of this Excel column”, along with screen captures of the GUI. Using this information, it will then decide to take action on the system : click(x=130, y=540)
to open a web browser, type(”Value for XYZ in 2025")
, scroll(down=2)
to read further… To see a GUI agent in action, you can try our Open Computer Agent, powered by Qwen2.5-VL-72B.
A good GUI agent will be able to navigate a computer just like we would, thus unlocking all computer tasks : scrolling through Google Maps, editing a file, buying an item online. This involves a variety of capabilities that can be hard to evaluate.
Introducing ScreenSuite 🥳
The literature, for instance Xu et al. (2025) or Qin et al. (2025), generally splits GUI agent abilities amongst several categories:
- Perception: correctly perceiving the informati displayed on screen
- Grounding: understanding the positioning of elements - this is paramount to click the correct place
- Single step actions: solving instructions correctly over one action
- Multi-step agents: solving a higher-level goal through several actions in a GUI environment.
So our first contribution is to gather and unify a comprehensive suite of 13 benchmarks spanning the full range of these GUI agent capabilities.
If you look at the last category listed above, evaluating Multi-step agentic capabilities is especially challenging as it requires virtual machines to run the agent’s environment, be it Windows, Android, Ubuntu... To address this, we provide support both for E2B desktop remote sandboxes, and we created from scratch a new option to easily launch Ubuntu or Android virtual machines in Docker!
| Category | Benchmark | Environment | Sample count |
|---|---|---|---|
| Perception / Grounding 👁️ | ScreenQA-Short | Mobile | 8.4k |
| ScreenQA-Complex | Mobile | 11.8k | |
| ScreenSpot-v2 | Desktop | 1.3k | |
| ScreenSpot-Pro | Desktop | 1.6k | |
| WebSRC | Web | 52k | |
| VisualWebBench | Web | 1.5k | |
| Single-Step Actions 🎯 | Showdown-clicks | Web | 0.6k |
| AndroidControl | Mobile | 3k | |
| Multimodal-Mind2web | Web | 6.4k | |
| Multi-Step Agents 🐾 | AndroidWorld (incl MobileMiniWob) | Mobile | 116 tasks, infinite |
| OSWorld | Desktop | 369 | |
| BrowseComp | Web | 1.27k | |
| GAIA-Web | Web | 132 | |
| Mind2Web-Live | Web | 208 |
Implementation details
We’ve carefully designed our benchmark suite with modularity and consistency in mind, ensuring strong alignment across tasks and environments. When required, especially for online benchmarks, we leverage smolagents as framework layer to streamline agent execution and orchestration.
To support reproducibility and ease of use, we’ve built custom Dockerized containers that allow local deployment of full Ubuntu Desktop or Android environments.
Unlike many existing GUI benchmarks that rely on accessibility trees or other metadata alongside visual input, our stack is intentionally vision-only. While this can result in different scores on some established leaderboards, we deem that it creates a more realistic and challenging setup, one that better reflects how humans perceive and interact with graphical interfaces.
– All agentic frameworks (Android World, OSWorld, GAIAWeb, Mind2Web) use smolagents and rely solely on vision, without any accessibility tree or DOM added (in contrast with evaluation settings reported in other sources). – Mind2Web (Multimodal) originally used element-name-based multi-choice selection based on the accessibility tree and screenshots, but was later adapted to click precision within bounding boxes using vision only, which significantly increases task difficulty.
Ranking leading VLMs on ScreenSuite 📊
We’ve evaluated leading VLMs on the benchmark
- The Qwen-2.5-VL series of models from 3B to 72B. These models are known for their amazing localization capabilities, in other words they know the coordinates of any element in an image which makes them suited for GUI agents that need to click precisely.
- UI-Tars-1.5-7B, the all-rounder by ByteDance.
- Holo1-7B, the latest model by H company, showing extremely performant localization for its size.
- GPT-4o
Our scores are in general agreement with the scores reported in various sources! With the caveat that we evaluate on vision only, causing some differences, see implementation details above.
💡 Note that ScreenSuite does not intend to exactly reproduce benchmarks published in the industry: we evaluate models on GUI agentic capabilities based on vision. As a result, on benchmarks like Mind2Web where other benchmarks gave the agent a view of information rich context like DOM or accessibility tree, our evaluation setting is much harder, thus ScreenSuite does not match other sources.
Start your custom evaluation in 30s ⚡️
Head to the repository.
- Clone the repository with submodules:
git clone --recurse-submodules git@github.com:huggingface/screensuite.git
- Install the package:
uv sync --extra submodules --python 3.11
- Run
python run.py
- Alternatively, run
python examples/run_benchmarks.py
for more fine-grained control, like running evaluations for several models in parallel.
- Alternatively, run
The multistep benchmarks requires a bare-metal machine to run and deploy desktop/mobile* environment *emulators (see README.md)
Next steps 🚀
Running consistent and meaningful evaluations easily allows the community to quickly iterate and make progress in this field, as we’ve seen with Eleuther LM evaluation harness, the Open LLM Leaderboard and the Chatbot Arena.
We hope to see much more capable open models in the coming month that can run a wide range of tasks reliably and even run locally!
To support this effort:
- ⭐️ Go star the ScreenSuite repo and give us feedback in issues/PRs!
- 👉 Follow the smolagents org to stay up-to-date.