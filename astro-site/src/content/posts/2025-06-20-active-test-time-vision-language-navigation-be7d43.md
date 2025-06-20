---
title: Active Test-time Vision-Language Navigation
description: "arXiv:2506.06630v1 Announce Type: cross \nAbstract: Vision-Language\
  \ Navigation (VLN) policies trained on offline datasets often exhibit degraded task\
  \ performance when deployed in unfamiliar navigation environments at test time,\
  \ where agents are typically evaluated without access to external interaction or\
  \ feedback. Entropy minimization has emerged as a practical solution for reducing\
  \ prediction uncertainty at test time; however, it can suffer from accumulated errors,\
  \ as agents may become overconfident in incorrect actions without sufficient contextual\
  \ grounding. To tackle these challenges, we introduce ATENA (Active TEst-time Navigation\
  \ Agent), a test-time active learning framework that enables a practical human-robot\
  \ interaction via episodic feedback on uncertain navigation outcomes. In particular,\
  \ ATENA learns to increase certainty in successful episodes and decrease it in failed\
  \ ones, improving uncertainty calibration. Here, we propose mixture entropy optimization,\
  \ where entropy is obtained from a combination of the action and pseudo-expert distributions-a\
  \ hypothetical action distribution assuming the agent's selected action to be optimal-controlling\
  \ both prediction confidence and action preference. In addition, we propose a self-active\
  \ learning strategy that enables an agent to evaluate its navigation outcomes based\
  \ on confident predictions. As a result, the agent stays actively engaged throughout\
  \ all iterations, leading to well-grounded and adaptive decision-making. Extensive\
  \ evaluations on challenging VLN benchmarks-REVERIE, R2R, and R2R-CE-demonstrate\
  \ that ATENA successfully overcomes distributional shifts at test time, outperforming\
  \ the compared baseline methods across various settings."
pubDate: Fri, 20 Jun 2025 00:00:00 -0400
source: arXiv AI
tags:
- arxiv
- ai
- research
url: https://arxiv.org/abs/2506.06630
---

Computer Science > Robotics
[Submitted on 7 Jun 2025]
Title:Active Test-time Vision-Language Navigation
View PDF HTML (experimental)Abstract:Vision-Language Navigation (VLN) policies trained on offline datasets often exhibit degraded task performance when deployed in unfamiliar navigation environments at test time, where agents are typically evaluated without access to external interaction or feedback. Entropy minimization has emerged as a practical solution for reducing prediction uncertainty at test time; however, it can suffer from accumulated errors, as agents may become overconfident in incorrect actions without sufficient contextual grounding. To tackle these challenges, we introduce ATENA (Active TEst-time Navigation Agent), a test-time active learning framework that enables a practical human-robot interaction via episodic feedback on uncertain navigation outcomes. In particular, ATENA learns to increase certainty in successful episodes and decrease it in failed ones, improving uncertainty calibration. Here, we propose mixture entropy optimization, where entropy is obtained from a combination of the action and pseudo-expert distributions-a hypothetical action distribution assuming the agent's selected action to be optimal-controlling both prediction confidence and action preference. In addition, we propose a self-active learning strategy that enables an agent to evaluate its navigation outcomes based on confident predictions. As a result, the agent stays actively engaged throughout all iterations, leading to well-grounded and adaptive decision-making. Extensive evaluations on challenging VLN benchmarks-REVERIE, R2R, and R2R-CE-demonstrate that ATENA successfully overcomes distributional shifts at test time, outperforming the compared baseline methods across various settings.
References & Citations
Bibliographic and Citation Tools
Bibliographic Explorer (What is the Explorer?)
Connected Papers (What is Connected Papers?)
Litmaps (What is Litmaps?)
scite Smart Citations (What are Smart Citations?)
Code, Data and Media Associated with this Article
alphaXiv (What is alphaXiv?)
CatalyzeX Code Finder for Papers (What is CatalyzeX?)
DagsHub (What is DagsHub?)
Gotit.pub (What is GotitPub?)
Hugging Face (What is Huggingface?)
Papers with Code (What is Papers with Code?)
ScienceCast (What is ScienceCast?)
Demos
Recommenders and Search Tools
Influence Flower (What are Influence Flowers?)
CORE Recommender (What is CORE?)
arXivLabs: experimental projects with community collaborators
arXivLabs is a framework that allows collaborators to develop and share new arXiv features directly on our website.
Both individuals and organizations that work with arXivLabs have embraced and accepted our values of openness, community, excellence, and user data privacy. arXiv is committed to these values and only works with partners that adhere to them.
Have an idea for a project that will add value for arXiv's community? Learn more about arXivLabs.