---
title: "Advancing Gemini's security safeguards"
description: "We’ve made Gemini 2.5 our most secure model family to date."
summary: "We’ve made Gemini 2.5 our most secure model family to date."
pubDate: "Tue, 20 May 2025 09:45:00 +0000"
source: "DeepMind Blog"
url: "https://deepmind.google/discover/blog/advancing-geminis-security-safeguards/"
thumbnail: "https://lh3.googleusercontent.com/Uh_O6Nx1GWznAfODatYYz2sxiDekdb6HWnnSsy-cfmTxfjdUEEleh9w4cBdwUfBnyQBS-t1xW4UZXrMmC-rI6bz31hCrm5nHLt6Cp1FJAT7X9Upv5g=w528-h297-n-nu-rw"
---

Responsibility & Safety
Advancing Gemini's security safeguards
We’re publishing a new white paper outlining how we’ve made Gemini 2.5 our most secure model family to date.
Imagine asking your AI agent to summarize your latest emails — a seemingly straightforward task. Gemini and other large language models (LLMs) are consistently improving at performing such tasks, by accessing information like our documents, calendars, or external websites. But what if one of those emails contains hidden, malicious instructions, designed to trick the AI into sharing private data or misusing its permissions?
Indirect prompt injection presents a real cybersecurity challenge where AI models sometimes struggle to differentiate between genuine user instructions and manipulative commands embedded within the data they retrieve. Our new white paper, Lessons from Defending Gemini Against Indirect Prompt Injections, lays out our strategic blueprint for tackling indirect prompt injections that make agentic AI tools, supported by advanced large language models, targets for such attacks.
Our commitment to build not just capable, but secure AI agents, means we’re continually working to understand how Gemini might respond to indirect prompt injections and make it more resilient against them.
Evaluating baseline defense strategies
Indirect prompt injection attacks are complex and require constant vigilance and multiple layers of defense. Google DeepMind’s Security and Privacy Research team specialises in protecting our AI models from deliberate, malicious attacks. Trying to find these vulnerabilities manually is slow and inefficient, especially as models evolve rapidly. That's one of the reasons we built an automated system to relentlessly probe Gemini’s defenses.
Using automated red-teaming to make Gemini more secure
A core part of our security strategy is automated red teaming (ART), where our internal Gemini team constantly attacks Gemini in realistic ways to uncover potential security weaknesses in the model. Using this technique, among other efforts detailed in our white paper, has helped significantly increase Gemini’s protection rate against indirect prompt injection attacks during tool-use, making Gemini 2.5 our most secure model family to date.
We tested several defense strategies suggested by the research community, as well as some of our own ideas:
Tailoring evaluations for adaptive attacks
Baseline mitigations showed promise against basic, non-adaptive attacks, significantly reducing the attack success rate. However, malicious actors increasingly use adaptive attacks that are specifically designed to evolve and adapt with ART to circumvent the defense being tested.
Successful baseline defenses like Spotlighting or Self-reflection became much less effective against adaptive attacks learning how to deal with and bypass static defense approaches.
This finding illustrates a key point: relying on defenses tested only against static attacks offers a false sense of security. For robust security, it is critical to evaluate adaptive attacks that evolve in response to potential defenses.
Building inherent resilience through model hardening
While external defenses and system-level guardrails are important, enhancing the AI model’s intrinsic ability to recognize and disregard malicious instructions embedded in data is also crucial. We call this process ‘model hardening’.
We fine-tuned Gemini on a large dataset of realistic scenarios, where ART generates effective indirect prompt injections targeting sensitive information. This taught Gemini to ignore the malicious embedded instruction and follow the original user request, thereby only providing the correct, safe response it should give. This allows the model to innately understand how to handle compromised information that evolves over time as part of adaptive attacks.
This model hardening has significantly boosted Gemini’s ability to identify and ignore injected instructions, lowering its attack success rate. And importantly, without significantly impacting the model’s performance on normal tasks.
It’s important to note that even with model hardening, no model is completely immune. Determined attackers might still find new vulnerabilities. Therefore, our goal is to make attacks much harder, costlier, and more complex for adversaries.
Taking a holistic approach to model security
Protecting AI models against attacks like indirect prompt injections requires “defense-in-depth” – using multiple layers of protection, including model hardening, input/output checks (like classifiers), and system-level guardrails. Combating indirect prompt injections is a key way we’re implementing our agentic security principles and guidelines to develop agents responsibly.
Securing advanced AI systems against specific, evolving threats like indirect prompt injection is an ongoing process. It demands pursuing continuous and adaptive evaluation, improving existing defenses and exploring new ones, and building inherent resilience into the models themselves. By layering defenses and learning constantly, we can enable AI assistants like Gemini to continue to be both incredibly helpful and trustworthy.
To learn more about the defenses we built into Gemini and our recommendation for using more challenging, adaptive attacks to evaluate model robustness, please refer to the GDM white paper, Lessons from Defending Gemini Against Indirect Prompt Injections.