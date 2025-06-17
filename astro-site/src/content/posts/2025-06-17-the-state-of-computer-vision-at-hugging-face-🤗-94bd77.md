---
title: The State of Computer Vision at Hugging Face 🤗
description: ''
pubDate: Mon, 30 Jan 2023 00:00:00 GMT
source: Hugging Face Blog
tags:
- huggingface
- transformers
- nlp
url: https://huggingface.co/blog/cv_state
---

The State of Computer Vision at Hugging Face 🤗
At Hugging Face, we pride ourselves on democratizing the field of artificial intelligence together with the community. As a part of that mission, we began focusing our efforts on computer vision over the last year. What started as a PR for having Vision Transformers (ViT) in 🤗 Transformers has now grown into something much bigger – 8 core vision tasks, over 3000 models, and over 100 datasets on the Hugging Face Hub.
A lot of exciting things have happened since ViTs joined the Hub. In this blog post, we’ll summarize what went down and what’s coming to support the continuous progress of Computer Vision from the 🤗 ecosystem.
Here is a list of things we’ll cover:
- Supported vision tasks and Pipelines
- Training your own vision models
- Integration with
timm
- Diffusers
- Support for third-party libraries
- Deployment
- and much more!
Enabling the community: One task at a time 👁
The Hugging Face Hub is home to over 100,000 public models for different tasks such as next-word prediction, mask filling, token classification, sequence classification, and so on. As of today, we support 8 core vision tasks providing many model checkpoints:
- Image classification
- Image segmentation
- (Zero-shot) object detection
- Video classification
- Depth estimation
- Image-to-image synthesis
- Unconditional image generation
- Zero-shot image classification
Each of these tasks comes with at least 10 model checkpoints on the Hub for you to explore. Furthermore, we support tasks that lie at the intersection of vision and language such as:
- Image-to-text (image captioning, OCR)
- Text-to-image
- Document question-answering
- Visual question-answering
These tasks entail not only state-of-the-art Transformer-based architectures such as ViT, Swin, DETR but also pure convolutional architectures like ConvNeXt, ResNet, RegNet, and more! Architectures like ResNets are still very much relevant for a myriad of industrial use cases and hence the support of these non-Transformer architectures in 🤗 Transformers.
It’s also important to note that the models on the Hub are not just from the Transformers library but also from other third-party libraries. For example, even though we support tasks like unconditional image generation on the Hub, we don’t have any models supporting that task in Transformers yet (such as this). Supporting all ML tasks, whether they are solved with Transformers or a third-party library is a part of our mission to foster a collaborative open-source Machine Learning ecosystem.
Support for Pipelines
We developed Pipelines to equip practitioners with the tools they need to easily incorporate machine learning into their toolbox. They provide an easy way to perform inference on a given input with respect to a task. We have support for seven vision tasks in Pipelines. Here is an example of using Pipelines for depth estimation:
from transformers import pipeline
depth_estimator = pipeline(task="depth-estimation", model="Intel/dpt-large")
output = depth_estimator("http://images.cocodataset.org/val2017/000000039769.jpg")
# This is a tensor with the values being the depth expressed
# in meters for each pixel
output["depth"]
The interface remains the same even for tasks like visual question-answering:
from transformers import pipeline
oracle = pipeline(model="dandelin/vilt-b32-finetuned-vqa")
image_url = "https://huggingface.co/datasets/mishig/sample_images/resolve/main/tiger.jpg"
oracle(question="What's the animal doing?", image=image_url, top_k=1)
# [{'score': 0.778620, 'answer': 'laying down'}]
Training your own models
While being able to use a model for off-the-shelf inference is a great way to get started, fine-tuning is where the community gets the most benefits. This is especially true when your datasets are custom, and you’re not getting good performance out of the pre-trained models.
Transformers provides a Trainer API for everything related to training. Currently, Trainer
seamlessly supports the following tasks: image classification, image segmentation, video classification, object detection, and depth estimation. Fine-tuning models for other vision tasks are also supported, just not by Trainer
.
As long as the loss computation is included in a model from Transformers computes loss for a given task, it should be eligible for fine-tuning for the task. If you find issues, please report them on GitHub.
Where do I find the code?
Hugging Face example scripts include different self-supervised pre-training strategies like MAE, and contrastive image-text pre-training strategies like CLIP. These scripts are valuable resources for the research community as well as for practitioners willing to run pre-training from scratch on custom data corpora.
Some tasks are not inherently meant for fine-tuning, though. Examples include zero-shot image classification (such as CLIP), zero-shot object detection (such as OWL-ViT), and zero-shot segmentation (such as CLIPSeg). We’ll revisit these models in this post.
Integrations with Datasets
Datasets provides easy access to thousands of datasets of different modalities. As mentioned earlier, the Hub has over 100 datasets for computer vision. Some examples worth noting here: ImageNet-1k, Scene Parsing, NYU Depth V2, COYO-700M, and LAION-400M. With these datasets being on the Hub, one can easily load them with just two lines of code:
from datasets import load_dataset
dataset = load_dataset("scene_parse_150")
Besides these datasets, we provide integration support with augmentation libraries like albumentations and Kornia. The community can take advantage of the flexibility and performance of Datasets and powerful augmentation transformations provided by these libraries. In addition to these, we also provide dedicated data-loading guides for core vision tasks: image classification, image segmentation, object detection, and depth estimation.
🤗 🤝 timm
timm
, also known as pytorch-image-models, is an open-source collection of state-of-the-art PyTorch image models, pre-trained weights, and utility scripts for training, inference, and validation.
We have over 200 models from timm
on the Hub and more are on the way. Check out the documentation to know more about this integration.
🧨 Diffusers
Diffusers provides pre-trained vision and audio diffusion models, and serves as a modular toolbox for inference and training. With this library, you can generate plausible images from natural language inputs amongst other creative use cases. Here is an example:
from diffusers import DiffusionPipeline
generator = DiffusionPipeline.from_pretrained("CompVis/stable-diffusion-v1-4")
generator.to(“cuda”)
image = generator("An image of a squirrel in Picasso style").images[0]
This type of technology can empower a new generation of creative applications and also aid artists coming from different backgrounds. To know more about Diffusers and the different use cases, check out the official documentation.
The literature on Diffusion-based models is developing at a rapid pace which is why we partnered with Jonathan Whitaker to develop a course on it. The course is free, and you can check it out here.
Support for third-party libraries
Central to the Hugging Face ecosystem is the Hugging Face Hub, which lets people collaborate effectively on Machine Learning. As mentioned earlier, we not only support models from 🤗 Transformers on the Hub but also models from other third-party libraries. To this end, we provide several utilities so that you can integrate your own library with the Hub. One of the primary advantages of doing this is that it becomes very easy to share artifacts (such as models and datasets) with the community, thereby making it easier for your users to try out your models.
When you have your models hosted on the Hub, you can also add custom inference widgets for them. Inference widgets allow users to quickly check out the models. This helps with improving user engagement.
Spaces for computer vision demos
With Spaces, one can easily demonstrate their Machine Learning models. Spaces support direct integrations with Gradio, Streamlit, and Docker empowering practitioners to have a great amount of flexibility while showcasing their models. You can bring in your own Machine Learning framework to build a demo with Spaces.
The Gradio library provides several components for building Computer Vision applications on Spaces such as Video, Gallery, and Model3D. The community has been hard at work building some amazing Computer Vision applications that are powered by Spaces:
- Generate 3D voxels from a predicted depth map of an input image
- Open vocabulary semantic segmentation
- Narrate videos by generating captions
- Classify videos from YouTube
- Zero-shot video classification
- Visual question-answering
- Use zero-shot image classification to find best captions for an image to generate similar images
🤗 AutoTrain
AutoTrain provides a “no-code” solution to train state-of-the-art Machine Learning models for tasks like text classification, text summarization, named entity recognition, and more. For Computer Vision, we currently support image classification, but one can expect more task coverage.
AutoTrain also enables automatic model evaluation. This application allows you to evaluate 🤗 Transformers models across a wide variety of datasets on the Hub. The results of your evaluation will be displayed on the public leaderboards. You can check this blog post for more details.
The technical philosophy
In this section, we wanted to share our philosophy behind adding support for Computer Vision in 🤗 Transformers so that the community is aware of the design choices specific to this area.
Even though Transformers started with NLP, we support multiple modalities today, for example – vision, audio, vision-language, and Reinforcement Learning. For all of these modalities, all the corresponding models from Transformers enjoy some common benefits:
- Easy model download with a single line of code with
from_pretrained()
- Easy model upload with
push_to_hub()
- Support for loading huge checkpoints with efficient checkpoint sharding techniques
- Optimization support (with tools like Optimum)
- Initialization from model configurations
- Support for both PyTorch and TensorFlow (non-exhaustive)
- and many more
Unlike tokenizers, we have preprocessors (such as this) that take care of preparing data for the vision models. We have worked hard to ensure the user experience of using a vision model still feels easy and similar:
from transformers import ViTImageProcessor, ViTForImageClassification
import torch
from datasets import load_dataset
dataset = load_dataset("huggingface/cats-image")
image = dataset["test"]["image"][0]
image_processor = ViTImageProcessor.from_pretrained("google/vit-base-patch16-224")
model = ViTForImageClassification.from_pretrained("google/vit-base-patch16-224")
inputs = image_processor(image, return_tensors="pt")
with torch.no_grad():
logits = model(**inputs).logits
# model predicts one of the 1000 ImageNet classes
predicted_label = logits.argmax(-1).item()
print(model.config.id2label[predicted_label])
# Egyptian cat
Even for a difficult task like object detection, the user experience doesn’t change very much:
from transformers import AutoImageProcessor, AutoModelForObjectDetection
from PIL import Image
import requests
url = "http://images.cocodataset.org/val2017/000000039769.jpg"
image = Image.open(requests.get(url, stream=True).raw)
image_processor = AutoImageProcessor.from_pretrained("microsoft/conditional-detr-resnet-50")
model = AutoModelForObjectDetection.from_pretrained("microsoft/conditional-detr-resnet-50")
inputs = image_processor(images=image, return_tensors="pt")
outputs = model(**inputs)
# convert outputs (bounding boxes and class logits) to COCO API
target_sizes = torch.tensor([image.size[::-1]])
results = image_processor.post_process_object_detection(
outputs, threshold=0.5, target_sizes=target_sizes
)[0]
for score, label, box in zip(results["scores"], results["labels"], results["boxes"]):
box = [round(i, 2) for i in box.tolist()]
print(
f"Detected {model.config.id2label[label.item()]} with confidence "
f"{round(score.item(), 3)} at location {box}"
)
Leads to:
Detected remote with confidence 0.833 at location [38.31, 72.1, 177.63, 118.45]
Detected cat with confidence 0.831 at location [9.2, 51.38, 321.13, 469.0]
Detected cat with confidence 0.804 at location [340.3, 16.85, 642.93, 370.95]
Detected remote with confidence 0.683 at location [334.48, 73.49, 366.37, 190.01]
Detected couch with confidence 0.535 at location [0.52, 1.19, 640.35, 475.1]
Zero-shot models for vision
There’s been a surge of models that reformulate core vision tasks like segmentation and detection in interesting ways and introduce even more flexibility. We support a few of those from Transformers:
- CLIP that enables zero-shot image classification with prompts. Given an image, you’d prompt the CLIP model with a natural language query like “an image of {}”. The hope is to get the class label as the answer.
- OWL-ViT that allows for language-conditioned zero-shot object detection and image-conditioned one-shot object detection. This means you can detect objects in an image even if the underlying model didn’t learn to detect them during training! You can refer to this notebook to know more.
- CLIPSeg that supports language-conditioned zero-shot image segmentation and image-conditioned one-shot image segmentation. This means you can segment objects in an image even if the underlying model didn’t learn to segment them during training! You can refer to this blog post that illustrates this idea. GroupViT also supports the task of zero-shot segmentation.
- X-CLIP that showcases zero-shot generalization to videos. Precisely, it supports zero-shot video classification. Check out this notebook for more details.
The community can expect to see more zero-shot models for computer vision being supported from 🤗Transformers in the coming days.
Deployment
As our CTO Julien says - “real artists ship” 🚀
We support the deployment of these vision models through 🤗Inference Endpoints. Inference Endpoints integrates directly with compatible models pertaining to image classification, object detection, and image segmentation. For other tasks, you can use the custom handlers. Since we also provide many vision models in TensorFlow from 🤗Transformers for their deployment, we either recommend using the custom handlers or following these resources:
- Deploying TensorFlow Vision Models in Hugging Face with TF Serving
- Deploying 🤗 ViT on Kubernetes with TF Serving
- Deploying 🤗 ViT on Vertex AI
- Deploying ViT with TFX and Vertex AI
Conclusion
In this post, we gave you a rundown of the things currently supported from the Hugging Face ecosystem to empower the next generation of Computer Vision applications. We hope you’ll enjoy using these offerings to build reliably and responsibly.
There is a lot to be done, though. Here are some things you can expect to see:
- Direct support of videos from 🤗 Datasets
- Supporting more industry-relevant tasks like image similarity
- Interoperability of the image datasets with TensorFlow
- A course on Computer Vision from the 🤗 community
As always, we welcome your patches, PRs, model checkpoints, datasets, and other contributions! 🤗
Acknowlegements: Thanks to Omar Sanseviero, Nate Raw, Niels Rogge, Alara Dirik, Amy Roberts, Maria Khalusova, and Lysandre Debut for their rigorous and timely reviews on the blog draft. Thanks to Chunte Lee for creating the blog thumbnail.