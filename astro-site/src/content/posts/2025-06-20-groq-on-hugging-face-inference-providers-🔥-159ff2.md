---
title: Groq on Hugging Face Inference Providers 🔥
description: ''
pubDate: Mon, 16 Jun 2025 00:00:00 GMT
source: Hugging Face Blog
tags:
- huggingface
- transformers
- nlp
url: https://huggingface.co/blog/inference-providers-groq
---

Groq on Hugging Face Inference Providers 🔥
We're thrilled to share that Groq is now a supported Inference Provider on the Hugging Face Hub! Groq joins our growing ecosystem, enhancing the breadth and capabilities of serverless inference directly on the Hub’s model pages. Inference Providers are also seamlessly integrated into our client SDKs (for both JS and Python), making it super easy to use a wide variety of models with your preferred providers.
Groq supports a wide variety of text and conversational models, including the latest open-source models such as Meta's LLama 4, Qwen's QWQ-32B, ad many more.
At the heart of Groq's technology is the Language Processing Unit (LPU™), a new type of end-to-end processing unit system that provides the fastest inference for computationally intensive applications with a sequential component, such as Large Language Models (LLMs). LPUs are designed to overcome the limitations of GPUs for inference, offering significantly lower latency and higher throughput. This makes them ideal for real-time AI applications.
Groq offers fast AI inference for openly-available models. They provide an API that allows developers to easily integrate these models into their applications. It offers an on-demand, pay-as-you-go model for accessing a wide range of openly-available LLMs.
You can now use Groq's Inference API as an Inference Provider on Huggingface. We're quite excited to see what you'll build with this new provider.
Read more about how to use Groq as Inference Provider in its dedicated documentation page.
See the list of supported models here.
How it works
In the website UI
- In your user account settings, you are able to:
- Set your own API keys for the providers you’ve signed up with. If no custom key is set, your requests will be routed through HF.
- Order providers by preference. This applies to the widget and code snippets in the model pages.
- As mentioned, there are two modes when calling Inference Providers:
- Custom key (calls go directly to the inference provider, using your own API key of the corresponding inference provider)
- Routed by HF (in that case, you don't need a token from the provider, and the charges are applied directly to your HF account rather than the provider's account)
- Model pages showcase third-party inference providers (the ones that are compatible with the current model, sorted by user preference)
From the client SDKs
from Python, using huggingface_hub
The following example shows how to use Meta's LLama 4 using Groq as the inference provider. You can use a Hugging Face token for automatic routing through Hugging Face, or your own Groq API key if you have one.
Install huggingface_hub
from source (see instructions). Official support will be released soon in version v0.33.0.
import os
from huggingface_hub import InferenceClient
client = InferenceClient(
provider="groq",
api_key=os.environ["HF_TOKEN"],
)
messages = [
{
"role": "user",
"content": "What is the capital of France?"
}
]
completion = client.chat.completions.create(
model="meta-llama/Llama-4-Scout-17B-16E-Instruct",
messages=messages,
)
print(completion.choices[0].message)
from JS using @huggingface/inference
import { InferenceClient } from "@huggingface/inference";
const client = new InferenceClient(process.env.HF_TOKEN);
const chatCompletion = await client.chatCompletion({
model: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
messages: [
{
role: "user",
content: "What is the capital of France?",
},
],
provider: "groq",
});
console.log(chatCompletion.choices[0].message);
Billing
For direct requests, i.e. when you use the key from an inference provider, you are billed by the corresponding provider. For instance, if you use a Groq API key you're billed on your Groq account.
For routed requests, i.e. when you authenticate via the Hugging Face Hub, you'll only pay the standard provider API rates. There's no additional markup from us, we just pass through the provider costs directly. (In the future, we may establish revenue-sharing agreements with our provider partners.)
Important Note ‼️ PRO users get $2 worth of Inference credits every month. You can use them across providers. 🔥
Subscribe to the Hugging Face PRO plan to get access to Inference credits, ZeroGPU, Spaces Dev Mode, 20x higher limits, and more.
We also provide free inference with a small quota for our signed-in free users, but please upgrade to PRO if you can!
Feedback and next steps
We would love to get your feedback! Share your thoughts and/or comments here: https://huggingface.co/spaces/huggingface/HuggingDiscussions/discussions/49