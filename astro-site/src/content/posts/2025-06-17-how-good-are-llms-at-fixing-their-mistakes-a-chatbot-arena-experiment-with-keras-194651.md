---
title: How good are LLMs at fixing their mistakes? A chatbot arena experiment with
  Keras and TPUs
description: ''
pubDate: Thu, 05 Dec 2024 00:00:00 GMT
source: Hugging Face Blog
tags:
- huggingface
- transformers
- nlp
url: https://huggingface.co/blog/keras-chatbot-arena
---

How good are LLMs at fixing their mistakes?
A chatbot arena experiment with Keras and TPUs
while you read. Click here to open it in a new tab. 👈
Table of contents
1. Introduction
2. The experiment
3. Keras chatbot arena tech: Spaces, Gradio, TPUs, JAX and Keras
3.1 Why TPUs?
3.2 Why JAX and Keras?
3.3 Sharding Models?
3.4 Which models?
4. Results
4.1 Reliability
4.2 The complete chat - fixing mistakes
4.3 More mistake fixing
5. Recap
1. Introduction
I'm not interested in having LLMs solve big problems, quite the opposite. I want them to dispatch drudgery, and if they don't get it right on the first try, a short English sentence should be enough to fix it. In short, I want an assistant, like the computers in old sci-fi movies, minus the "I'm sorry Dave, I'm afraid I can't do that" bit 😅.
This paper explores such a tool for coding. Setting aside the creative title claim (No, AI is not beating Kaggle gandmasters yet), what the paper authors did was to manually break various Kaggle problems into micro-tasks, have an LLM generate code for them and iterate until unit tests pass. An example micro-task could be, for an image classification problem, to "figure out the format of the input data and reformat it into a CSV with columns 'id', 'image_filename' and 'class'".
I like that approach because that's how I would like to work on my projects with AI in the future. Have AI generate the boring pieces of code, like data reformatting, so I can focus on the interesting bits: correctly framing the problem and devising the steps that will lead to a solution.
But this interactive coding assistant must be able to listen to feedback in plain English and fix mistakes in its code. With LLM's ability to infer information from knowledge and context, this could be a very efficient computer interface. But if LLM's quirks like hallucinations or lack of formal logic get in the way, we could end up with a case of "artificial stupidity" rather than AI.
So I decided to run a little test with today's LLMs. A super-simplified one, to see how effectively LLMs fix their mistakes when you point them out to them.
2. The experiment
Here is the scenario:
System prompt:
You are a helpful vocal assistant on a mobile device. Your job is to translate user requests into API calls using this Python API:
action.add_calendar_entry(title, date="YYYY-MM-DD", time="HH:MM", duration=m) # duration in minutes action.remove_calendar_entry(title, date, time)
You can use 30 minutes as the default duration for new events. Respond to every request with a single line of executable code.
| Dialog prompts | Expected output |
|---|---|
| Add a meeting with Fred on Nov 11 at 5PM | action.add_calendar_entry("Meeting with Fred", date="2023-11-11", time="17:00", duration=30) |
| The current year is 2024. | action.add_calendar_entry("Meeting with Fred", date="2024-11-11", time="17:00", duration=30) |
| I'm going to a rock concert in the evening of the same day at 8pm. Add a calendar entry for that. |
action.add_calendar_entry("Rock Concert", date="2024-11-11", time="20:00", duration=30) |
| Set the duration to 3 hours. | action.add_calendar_entry("Rock Concert", date="2024-11-11", time="20:00", duration=60*3) |
| Add a meeting with Paul on the next day at 8am. 1/2h. | action.add_calendar_entry("Meeting with Paul", date="2024-11-12", time="08:00", duration=30) |
| Cancel the meeting with Fred. | action.remove_calendar_entry("Meeting with Fred", "2024-11-11", "17:00") |
That's it. Very simple, but can LLMs handle this? And when they make a mistake, can you simply tell them what it is and expect a fix?
To test this, I needed an environment to quickly interact with multiple chatbots at once, here is how I set it up.
3. Keras chatbot arena tech: Spaces, Gradio, TPUs, JAX and Keras
To experiment with this scenario, I wanted to be able to conduct two conversations at once, with different LLMs, and pause one side while asking another to fix a mistake in its output. Here is what it looks like. It is built with Gradio on Spaces and uses Keras, JAX and TPUs:
A couple of notes on how this was built before we go back to the serious matter of chit-chatting with LLMs.
3.1 Why TPUs?
For their fast inference and large memory. A TPU v5e 2x4 has 8 cores and 16GB of RAM per core for an aggregate 128GB of memory. With this much memory, we can load multiple LLMs at once, provided we shard them across all cores, and switch between them at will in the UI. In this experiment, I have been able to load five ∼8B params models (one more would OOM) and three ∼2B models for a total of 7 LLMs in memory at once, in bfloat16 format.
3.2 Why JAX and Keras?
JAX is the preferred ML environment for TPUs, thanks to its powerful XLA compiler. Keras, which now runs natively on top of JAX (as well as PyTorch and TensorFlow) is my favorite modeling environment and it has a nice selection of pretrained LLMs in its sister library KerasHub. It can even load selected non-Keras checkpoints from Hugging Face, which will be useful for comparisons. I wrote about this previously here: Llama 3.2 in Keras.
3.3 Sharding Models?
I also use Keras because it has by far the most user-friendly API for model parallelism. Here, I wanted to load as many models as possible in the TPU memory at once. For this, the model must be sharded across the memory of all 8 TPU cores. Fortunately most of them come with a default layout map that does exactly that. For example:
layout_map = keras_hub.models.Llama3Backbone.get_layout_map(device_mesh)
For the full loading code, and more background info on model parallelism, see my earlier post here. You will also find in that post a code snippet for visualizing the shardings actually applied once the model is loaded. Very useful for debugging. And yes, debugging and a few layout map adjustments were necessary.
3.4 Which models?
For this experiment, I chose sub-10B param LLMs, mostly for their practicality as many of them could be loaded at the same time. But also, what the experiment is testing is fairly simple and should be within reach of these smaller models. All the models are instruction-tuned so that a dialog is possible. You can see their chat templates in the demo's implementation. Feel free to copy-paste the code for your own Keras chatbot needs. The models are from the Gemma, Llama3, Mistral and Vicuna families. See the result tabes below for a full list.
4. Results
4.1 Reliability
First, let's first see if our LLMs can answer the first question reliably. The system prompt and first question "Add a meeting with Fred on Nov 11 at 5PM" were repeated five times.
Color code:
- A ✓ check mark is awarded if the model produces the expected output, i.e. the API call
action.add_calendar_entry("Meeting with Fred", date="2023-11-11", time="17:00", duration=30)
- A 🍄 red poisonous mushroom means that the answer was mostly correct but contained a mistake (for ex: wrong date)
- The 🔥 dumpster fire means the response was garbage, with no recognizable API call.
| Model | first question only, five attempts |
|---|---|
| Gemma 2 9B-instr | ✓ ✓ ✓ ✓ ✓ |
| Llama-3.1 8B-instr | ✓ ✓ ✓ ✓ ✓ |
| Llama 3.2 3B-instr | ✓ ✓ ✓ ✓ ✓ |
| Llama 3.2 1B-instr | 🔥 🍄 🔥 🔥 🔥 |
| Gemma2B-instr | 🍄 🍄 🍄 🍄 ✓ |
| Codegemma7B-instr | ✓ ✓ ✓ ✓ ✓ |
| vicuna 1.5 7b-instr | ✓ 🔥 🔥 ✓ 🔥 |
| Mistral 7B-instr | ✓ ✓ 🍄 ✓ 🍄 |
The good news is that some models got this right every time and all of them managed to answer with an API call (more or less correct) at least once. However, The smaller 1-2B params models and the older models like Vicuna struggle. They respond badly most of the time.
4.2 The complete chat - fixing mistakes
Now, let's run through the full dialog two models at a time. If a model makes a mistake, I attempt to steer it back on track. Let's see if it works.
Color code:
- A ✔︎ check mark means a valid API call was produced
- A 🍄 red poisonous mushroom is when the model makes a single mistake
- A 🥦 green broccoli is given to the model if it can fix the mistake successfully when asked
Shortened prompts are used in the table to save screen space. The first question is voluntarily imprecise: a month, day and time are given for the meeting, but not the year. This is to make sure that all models make at least one mistake and get tested on their capacity to fix it.
| Conversation (full transcript) | Gemma 2 9B-instr |
Conversation (full transcript) | Llama-3.1 8B-instr |
Conversation (full transcript) | Gemini online |
||
|---|---|---|---|---|---|---|---|
| Add a meeting with Fred… | ✔︎ 🍄 | Add a meeting with Fred… | ✔︎ 🍄 | Add a meeting with Fred… | ✔︎ 🍄 | ||
Current year is 2024 |
🥦 | Current year is 2024 |
🍄 | Current year is 2024 |
🍄 | ||
Fix the year in the API… |
🥦 | Fix the year in the API… |
🥦 | ||||
| I'm going to a rock concert… | ✔︎ | I'm going to a rock concert… | ✔︎ | I'm going to a rock concert… | ✔︎ 🍄 | ||
| Set the duration to 3 hours | ✔︎ | Set the duration to 3 hours | ✔︎ | Duration is required… |
🍄 | ||
| Add meeting with Paul on next day… | ✔︎ | Add meeting with Paul on next day… | ✔︎ | Use the default duration… |
🥦 | ||
| Cancel meeting with Fred | ✔︎ | Cancel meeting with Fred | ✔︎ | Set the duration to 3 hours | ✔︎ | ||
| Add meeting with Paul on next day… | ✔︎ 🍄 | ||||||
Wrong next day… |
🥦 | ||||||
| Cancel meeting with Fred | ✔︎ |
Gemma2 9B and Llama 3.1 8B both succeed. Llama needed one extra "fix it" prompt but managed to get its broccoli 🥦.
A run with Google's Gemini (online) is given in the third column for comparison. This is a massively larger model than the other two and surprisingly, it's not the best. It required slightly different prompts because Gemini can actually add entries to your Google Calendar, so it had to be reminded to "answer with an API call from the provided API" every time. Even so, it made several mistakes and even got the date wrong on the last prompt. This shows that a massive model is not necessarily better for this task.
Let's move on to the small models: Llama 3.2 3B, Llama 3.2 1B and Gemma 2B. This exercise seems to be overwhelmingly difficult for these models. New symbols are required here:
- A 🔥🔥 dumpster fire for responses with 3 or more mistakes. Attempts at fixing them one by one are useless.
- The (🍄) red mushroom in parentheses indicates a recurring mistake, the same on every line
And remember that these are the best runs. As seen in the "reliability" section above, some models were able to get past the first questions only once out of five attempts.
| Conversation (full transcript) | Llama 3.2 3b-instr |
Conversation (full transcript) | Llama 3.2 1B-instr |
Conversation (full transcript) | Gemma 2B-instr |
||
|---|---|---|---|---|---|---|---|
| Add a meeting with Fred… | ✔︎ 🍄 | Add a meeting with Fred… | ✔︎ 🍄 | Add a meeting with Fred… | ✔︎ 🍄 | ||
current year is 2024 |
🥦 | Just the API call… |
🥦 🍄 | The time is wrong… |
🥦 (🍄) | ||
| I'm going to a rock concert… | ✔︎ | Respect date format… |
🥦 | Just the API call… |
🥦 | ||
| Set the duration to 3 hours | ✔︎ 🍄 | Current year is 2024 |
✔︎ | Current year is 2024 |
🥦 (🍄) | ||
Wrong API call… |
🥦 | I'm going to a rock concert… | 🔥🔥 | I'm going to a rock concert… | ✔︎ 🍄 | ||
| Add a meeting with Paul… | ✔︎ 🍄 | Duration required… |
🥦 🔥 | The time is wrong… |
🥦 (🍄) | ||
Respect date format… |
🔥🔥 | Extra parenthesis… |
🔥🔥 | Set the duration to 3 hours | ✔︎ (🍄) | ||
| Cancel meeting with Fred | 🔥🔥 | Set the duration to 3 hours | 🔥🔥 | Add a meeting with Paul… | ✔︎ | ||
--giving up-- |
Cancel meeting with Fred | ✔︎ 🍄 | |||||
API requires three params… |
🥦 (🍄) |
Among the small models, only Gemma 2B manages to finish the dialog albeit with a recurrent mistake (🍄): it could not refrain from being chatty and adding stuff on top of the requested API calls. Stuff like "Sure, here's the updated code…". It also kept mixing up dates and times. However, it was able to fix the mistakes, when asked 🥦.
Finally, let's try some older models like Vicuna 1.5 7B and Mistral 7B. They are pitted against Codegemma 7B which should be the ideal model for this task but as you can see, all three models struggle.
| Conversation (full transcript) | Codegemma 7B-instr |
Conversation (full transcript) | vicuna 1.5 7b-instr |
Conversation (full transcript) | Mistral 7B-instr |
||
|---|---|---|---|---|---|---|---|
| Add a meeting with Fred… | ✔︎ 🍄 | Add a meeting with Fred… | ✔︎ 🍄 | Add a meeting with Fred… | ✔︎ 🍄 | ||
current year is 2024 |
🥦 (🍄) | current year is 2024 |
🥦 | Respect the date format… |
🥦 🍄 | ||
The year is mistyped… |
(🍄) | I'm going to a rock concert… | ✔︎ | Time in 24h format… |
🥦 | ||
| I'm going to a rock concert… | ✔︎ (🍄) | Set the duration to 3 hours | 🔥🔥 | Current year is 2024 |
🥦 🍄 | ||
| Set the duration to 3 hours | ✔︎ (🍄) | Just the API call… |
🔥🔥 | Just the API call… |
🥦 | ||
| Add a meeting with Paul… | ✔︎ (🍄) | Add a meeting with Paul… | ✔︎ 🍄 | I'm going to a rock concert… | 🍄 | ||
| Cancel meeting with Fred | ✔︎ 🍄 (🍄) | Just one API call… |
🍄 | You don't ned that info… |
✔︎ 🥦 | ||
API requires three params… |
🥦 🍄 (🍄) | Cancel meeting with Fred | ✔︎ 🍄 | Set the duration to 3 hours | ✔︎ | ||
It's the wrong event now… |
🥦 (🍄) | Add a meeting with Paul… | ✔︎ 🍄 | ||||
Mistake in the year… |
🥦🍄 | ||||||
| Cancel meeting with Fred | ✔︎ |
Codegemma got affected by a sticky recurrent mistake (🍄): it would start spelling the year as "20 24" with a space and would not fix it. Vicuna 1.5 7B is probably too old. At one point it starts repeating itself 🔥🔥, outputting multiple duplicate API calls and other junk. It gets back on track to some extent but with remaining mistakes. Finally, Mistral makes mistakes everywhere but is also able to fix them. Lots of interactions needed but 6 broccoli 🥦 earned for fixed mistakes.
4.3 More mistake fixing
Some of these models cruised through the exercise with few mistakes and therefore few chances to fix them and earn a broccoli 🥦. Using the Keras chatbot arena UI, we can run them on mistakes 🍄 made by other LLMs and see if they can fix them.
Same color coding as before: green broccoli 🥦 for correctly fixing the error, red poisonous mushroom 🍄 if the error is still there, dumpster fire 🔥 for multiple errors. The full transcript of the conversations is here.
| Model | Wrong time… 3 attempts |
API only… 3 attempts |
Wrong API… 3 attempts |
|---|---|---|---|
| Gemma 2 9B-instr | 🥦 🥦 🥦 | 🥦 🥦 🥦 | 🍄 🍄 🍄 (1) |
| Llama-3.1 8B-instr | 🥦 🥦 🥦 | 🥦 🥦 🥦 | 🥦 🍄 🔥 |
| Llama 3.2 3B-instr | 🥦 🥦 🍄 | 🍄 🥦 🍄 | 🍄 🔥 🍄 |
| Llama 3.2 1B-instr | 🔥 🔥 🔥 | 🥦 🍄 🍄 | 🔥 🔥 🔥 |
| Gemma2B-instr | 🥦 🥦 🥦 | 🥦 🥦 🥦 | 🔥 🔥 🔥 |
| Codegemma7B-instr | 🥦 🥦 🥦 | 🥦 🥦 🥦 | 🍄 🍄 🍄 (1) |
| vicuna 1.5 7b-instr | 🥦 🔥 🔥 | 🍄 🥦 🍄 | 🔥 🔥 🔥 |
| Mistral 7B-instr | 🥦 🔥 🥦 | 🥦 🥦 🍄 | 🍄 🔥 🍄(1) |
(1) recurrent mistake: outputs apology next to correct API call. For Gemma this is reliably fixed by asking for “API call only please”. It works for Llama too but not reliably.
This was a good reality check for the models. Gemma 2 9B and Codegemma 7B get it almost right but keep apologizing for some mistakes instead of outputting a clean API call. Llama 3.1 8B is a close second but has difficulties fixing a wrong API call reliably. And all the others are a 🔥 dumpster fire.
5. Recap
I did not know what to expect before starting this test. The API the models were playing with is unrealistically simple. Just 2 API calls 'add_calendar_entry' and 'remove_calendar_entry'. So I thought this might be super easy for the models, and with a little bit of corrective prompting, all of them would ace through every time. On the other hand, I knew that LLMs are probabilistic inference machines that do not really listen to what you say. Prompts merely change the probability distribution of the output and some outputs are just hard to get.
The reality is interesting as only one model, Gemma 9B, managed to get through the test almost perfectly. Here is a recap of all the ✔︎ checks (correct answer), 🥦 broccoli (mistake fix), 🍄 poisonous mushrooms (mistake) and 🔥 dumpster fires (many mistakes in one answer) the models got across all tests. This is not the most scientific way of summarizing the results but it gives a pretty good picture:
| Rank | Model | response ratings |
|---|---|---|
| #1 | Gemma 2 9B-instr | ✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎🥦🥦🥦🥦🥦🥦🥦🍄🍄🍄🍄 |
| #2 | Llama-3.1 8B-instr | ✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎🥦🥦🥦🥦🥦🥦🥦🥦🍄🍄🍄🔥 |
| #3 | Codegemma7B-instr | ✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎🥦🥦🥦🥦🥦🥦🥦🥦🥦🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄 |
| #4 | Mistral 7B-instr | ✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎🥦🥦🥦🥦🥦🥦🥦🥦🥦🥦🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🔥🔥 |
| #5 | Gemma2B-instr | ✔︎✔︎✔︎✔︎✔︎✔︎🥦🥦🥦🥦🥦🥦🥦🥦🥦🥦🥦🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🍄🔥🔥🔥 |
| #6 | Llama 3.2 3B-instr | ✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎✔︎🥦🥦🥦🥦🥦🍄🍄🍄🍄🍄🍄🍄🍄🔥🔥🔥🔥🔥 |
| #7 | vicuna 1.5 7b-instr | ✔︎✔︎✔︎✔︎✔︎✔︎🥦🥦🥦🍄🍄🍄🍄🍄🍄🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 |
| #8 | Llama 3.2 1B-instr | ✔︎✔︎🥦🥦🥦🥦🍄🍄🍄🍄🍄🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 |
I have no doubt that some fine-tuning could greatly improve those results. This is left for readers to explore. There is more information on Keras, including a Keras LLM fine-tuning example in this blog post. Also feel free to clone the Keras Chatbot Arena to test your fine-tuned models. Happy 🥦!