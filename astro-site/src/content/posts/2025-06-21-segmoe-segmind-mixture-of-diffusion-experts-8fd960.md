---
title: "SegMoE: Segmind Mixture of Diffusion Experts"
description: ""
summary: ""
pubDate: "Sat, 03 Feb 2024 00:00:00 GMT"
source: "Hugging Face Blog"
url: "https://huggingface.co/blog/segmoe"
thumbnail: ""
---

SegMoE: Segmind Mixture of Diffusion Experts
SegMoE is an exciting framework for creating Mixture-of-Experts Diffusion models from scratch! SegMoE is comprehensively integrated within the Hugging Face ecosystem and comes supported with
diffusers
🔥!
Among the features and integrations being released today:
- Models on the Hub, with their model cards and licenses (Apache 2.0)
- Github Repository to create your own MoE-style models.
Table of Contents
- What is SegMoE
- Inference
- Comparison
- Creating your Own SegMoE
- Disclaimers and ongoing work
- Additional Resources
- Conclusion
What is SegMoE?
SegMoE models follow the same architecture as Stable Diffusion. Like Mixtral 8x7b, a SegMoE model comes with multiple models in one. The way this works is by replacing some Feed-Forward layers with a sparse MoE layer. A MoE layer contains a router network to select which experts process which tokens most efficiently.
You can use the segmoe
package to create your own MoE models! The process takes just a few minutes. For further information, please visit the Github Repository. We take inspiration from the popular library mergekit
to design segmoe
. We thank the contributors of mergekit
for such a useful library.
For more details on MoEs, see the Hugging Face 🤗 post: hf.co/blog/moe.
SegMoE release TL;DR;
- Release of SegMoE-4x2, SegMoE-2x1 and SegMoE-SD4x2 versions
- Release of custom MoE-making code
About the name
The SegMoE MoEs are called SegMoE-AxB, where A
refers to the number of expert models MoE-d together, while the second number refers to the number of experts involved in the generation of each image. Only some layers of the model (the feed-forward blocks, attentions, or all) are replicated depending on the configuration settings; the rest of the parameters are the same as in a Stable Diffusion model. For more details about how MoEs work, please refer to the "Mixture of Experts Explained" post.
Inference
We release 3 merges on the Hub:
- SegMoE 2x1 has two expert models.
- SegMoE 4x2 has four expert models.
- SegMoE SD 4x2 has four Stable Diffusion 1.5 expert models.
Samples
Images generated using SegMoE 4x2
Images generated using SegMoE 2x1:
Images generated using SegMoE SD 4x2
Using 🤗 Diffusers
Please, run the following command to install the segmoe
package. Make sure you have the latest version of diffusers
and transformers
installed.
pip install -U segmoe diffusers transformers
The following loads up the second model ("SegMoE 4x2") from the list above, and runs generation on it.
from segmoe import SegMoEPipeline
pipeline = SegMoEPipeline("segmind/SegMoE-4x2-v0", device="cuda")
prompt = "cosmic canvas, orange city background, painting of a chubby cat"
negative_prompt = "nsfw, bad quality, worse quality"
img = pipeline(
prompt=prompt,
negative_prompt=negative_prompt,
height=1024,
width=1024,
num_inference_steps=25,
guidance_scale=7.5,
).images[0]
img.save("image.png")
Using a Local Model
Alternatively, a local model can also be loaded up, here segmoe_v0
is the path to the directory containing the local SegMoE model. Checkout Creating your Own SegMoE to learn how to build your own!
from segmoe import SegMoEPipeline
pipeline = SegMoEPipeline("segmoe_v0", device="cuda")
prompt = "cosmic canvas, orange city background, painting of a chubby cat"
negative_prompt = "nsfw, bad quality, worse quality"
img = pipeline(
prompt=prompt,
negative_prompt=negative_prompt,
height=1024,
width=1024,
num_inference_steps=25,
guidance_scale=7.5,
).images[0]
img.save("image.png")
Comparison
Prompt understanding seems to improve, as shown in the images below. Each image shows the following models left to right: SegMoE-2x1-v0, SegMoE-4x2-v0, Base Model (RealVisXL_V3.0)
Creating your Own SegMoE
Simply prepare a config.yaml
file, with the following structure:
base_model: Base Model Path, Model Card or CivitAI Download Link
num_experts: Number of experts to use
moe_layers: Type of Layers to Mix (can be "ff", "attn" or "all"). Defaults to "attn"
num_experts_per_tok: Number of Experts to use
experts:
- source_model: Expert 1 Path, Model Card or CivitAI Download Link
positive_prompt: Positive Prompt for computing gate weights
negative_prompt: Negative Prompt for computing gate weights
- source_model: Expert 2 Path, Model Card or CivitAI Download Link
positive_prompt: Positive Prompt for computing gate weights
negative_prompt: Negative Prompt for computing gate weights
- source_model: Expert 3 Path, Model Card or CivitAI Download Link
positive_prompt: Positive Prompt for computing gate weights
negative_prompt: Negative Prompt for computing gate weights
- source_model: Expert 4 Path, Model Card or CivitAI Download Link
positive_prompt: Positive Prompt for computing gate weights
negative_prompt: Negative Prompt for computing gate weights
Any number of models can be combined. For detailed information on how to create a config file, please refer to the github repository
Note Both Hugging Face and CivitAI models are supported. For CivitAI models, paste the download link of the model, for example: "https://civitai.com/api/download/models/239306"
Then run the following command:
segmoe config.yaml segmoe_v0
This will create a folder called segmoe_v0
with the following structure:
├── model_index.json
├── scheduler
│ └── scheduler_config.json
├── text_encoder
│ ├── config.json
│ └── model.safetensors
├── text_encoder_2
│ ├── config.json
│ └── model.safetensors
├── tokenizer
│ ├── merges.txt
│ ├── special_tokens_map.json
│ ├── tokenizer_config.json
│ └── vocab.json
├── tokenizer_2
│ ├── merges.txt
│ ├── special_tokens_map.json
│ ├── tokenizer_config.json
│ └── vocab.json
├── unet
│ ├── config.json
│ └── diffusion_pytorch_model.safetensors
└──vae
├── config.json
└── diffusion_pytorch_model.safetensors
Alternatively, you can also use the Python API to create a mixture of experts model:
from segmoe import SegMoEPipeline
pipeline = SegMoEPipeline("config.yaml", device="cuda")
pipeline.save_pretrained("segmoe_v0")
Push to Hub
The Model can be pushed to the hub via the huggingface-cli
huggingface-cli upload segmind/segmoe_v0 ./segmoe_v0
The model can also be pushed to the Hub directly from Python:
from huggingface_hub import create_repo, upload_folder
model_id = "segmind/SegMoE-v0"
repo_id = create_repo(repo_id=model_id, exist_ok=True).repo_id
upload_folder(
repo_id=repo_id,
folder_path="segmoe_v0",
commit_message="Initial Commit",
ignore_patterns=["step_*", "epoch_*"],
)
Detailed usage can be found here
Disclaimers and ongoing work
Slower Speed: If the number of experts per token is larger than 1, the MoE performs computation across several expert models. This makes it slower than a single SD 1.5 or SDXL model.
High VRAM usage: MoEs run inference very quickly but still need a large amount of VRAM (and hence an expensive GPU). This makes it challenging to use them in local setups, but they are great for deployments with multiple GPUs. As a reference point, SegMoE-4x2 requires 24GB of VRAM in half-precision.
Conclusion
We built SegMoE to provide the community a new tool that can potentially create SOTA Diffusion Models with ease, just by combining pretrained models while keeping inference times low. We're excited to see what you can build with it!