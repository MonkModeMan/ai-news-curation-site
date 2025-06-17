---
title: Enhancing Decision-Making of Large Language Models via Actor-Critic
description: "arXiv:2506.06376v1 Announce Type: cross \nAbstract: Large Language Models\
  \ (LLMs) have achieved remarkable advancements in natural language processing tasks,\
  \ yet they encounter challenges in complex decision-making scenarios that require\
  \ long-term reasoning and alignment with high-level objectives. Existing methods\
  \ either rely on short-term auto-regressive action generation or face limitations\
  \ in accurately simulating rollouts and assessing outcomes, leading to sub-optimal\
  \ decisions. This paper introduces a novel LLM-based Actor-Critic framework, termed\
  \ LAC, that effectively improves LLM policies with long-term action evaluations\
  \ in a principled and scalable way. Our approach addresses two key challenges: (1)\
  \ extracting robust action evaluations by computing Q-values via token logits associated\
  \ with positive/negative outcomes, enhanced by future trajectory rollouts and reasoning;\
  \ and (2) enabling efficient policy improvement through a gradient-free mechanism.\
  \ Experiments across diverse environments -- including high-level decision-making\
  \ (ALFWorld), low-level action spaces (BabyAI-Text), and large action spaces (WebShop)\
  \ -- demonstrate the framework's generality and superiority over state-of-the-art\
  \ methods. Notably, our approach achieves competitive performance using 7B/8B parameter\
  \ LLMs, even outperforming baseline methods employing GPT-4 in complex tasks. These\
  \ results underscore the potential of integrating structured policy optimization\
  \ with LLMs' intrinsic knowledge to advance decision-making capabilities in multi-step\
  \ environments."
pubDate: Tue, 10 Jun 2025 00:00:00 -0400
source: arXiv AI
tags:
- arxiv
- ai
- research
url: https://arxiv.org/abs/2506.06376
---

Computer Science > Computation and Language
[Submitted on 4 Jun 2025]
Title:Enhancing Decision-Making of Large Language Models via Actor-Critic
View PDF HTML (experimental)Abstract:Large Language Models (LLMs) have achieved remarkable advancements in natural language processing tasks, yet they encounter challenges in complex decision-making scenarios that require long-term reasoning and alignment with high-level objectives. Existing methods either rely on short-term auto-regressive action generation or face limitations in accurately simulating rollouts and assessing outcomes, leading to sub-optimal decisions. This paper introduces a novel LLM-based Actor-Critic framework, termed LAC, that effectively improves LLM policies with long-term action evaluations in a principled and scalable way. Our approach addresses two key challenges: (1) extracting robust action evaluations by computing Q-values via token logits associated with positive/negative outcomes, enhanced by future trajectory rollouts and reasoning; and (2) enabling efficient policy improvement through a gradient-free mechanism. Experiments across diverse environments -- including high-level decision-making (ALFWorld), low-level action spaces (BabyAI-Text), and large action spaces (WebShop) -- demonstrate the framework's generality and superiority over state-of-the-art methods. Notably, our approach achieves competitive performance using 7B/8B parameter LLMs, even outperforming baseline methods employing GPT-4 in complex tasks. These results underscore the potential of integrating structured policy optimization with LLMs' intrinsic knowledge to advance decision-making capabilities in multi-step environments.
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