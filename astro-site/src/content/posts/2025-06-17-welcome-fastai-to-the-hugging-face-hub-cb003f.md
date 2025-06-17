---
title: Welcome fastai to the Hugging Face Hub
description: ''
pubDate: Fri, 06 May 2022 00:00:00 GMT
source: Hugging Face Blog
tags:
- huggingface
- transformers
- nlp
url: https://huggingface.co/blog/fastai
---

Welcome fastai to the Hugging Face Hub
Making neural nets uncool again... and sharing them
Few have done as much as the fast.ai ecosystem to make Deep Learning accessible. Our mission at Hugging Face is to democratize good Machine Learning. Let's make exclusivity in access to Machine Learning, including pre-trained models, a thing of the past and let's push this amazing field even further.
fastai is an open-source Deep Learning library that leverages PyTorch and Python to provide high-level components to train fast and accurate neural networks with state-of-the-art outputs on text, vision, and tabular data. However, fast.ai, the company, is more than just a library; it has grown into a thriving ecosystem of open source contributors and people learning about neural networks. As some examples, check out their book and courses. Join the fast.ai Discord and forums. It is a guarantee that you will learn by being part of their community!
Because of all this, and more (the writer of this post started his journey thanks to the fast.ai course), we are proud to announce that fastai practitioners can now share and upload models to Hugging Face Hub with a single line of Python.
👉 In this post, we will introduce the integration between fastai and the Hub. Additionally, you can open this tutorial as a Colab notebook.
We want to thank the fast.ai community, notably Jeremy Howard, Wayde Gilliam, and Zach Mueller for their feedback 🤗. This blog is heavily inspired by the Hugging Face Hub section in the fastai docs.
Why share to the Hub?
The Hub is a central platform where anyone can share and explore models, datasets, and ML demos. It has the most extensive collection of Open Source models, datasets, and demos.
Sharing on the Hub amplifies the impact of your fastai models by making them available for others to download and explore. You can also use transfer learning with fastai models; load someone else's model as the basis for your task.
Anyone can access all the fastai models in the Hub by filtering the hf.co/models webpage by the fastai library, as in the image below.
In addition to free model hosting and exposure to the broader community, the Hub has built-in version control based on git (git-lfs, for large files) and model cards for discoverability and reproducibility. For more information on navigating the Hub, see this introduction.
Joining Hugging Face and installation
To share models in the Hub, you will need to have a user. Create it on the Hugging Face website.
The huggingface_hub
library is a lightweight Python client with utility functions to interact with the Hugging Face Hub. To push fastai models to the hub, you need to have some libraries pre-installed (fastai>=2.4, fastcore>=1.3.27 and toml). You can install them automatically by specifying ["fastai"] when installing huggingface_hub
, and your environment is good to go:
pip install huggingface_hub["fastai"]
Creating a fastai Learner
Here we train the first model in the fastbook to identify cats 🐱. We fully recommended reading the entire fastbook.
# Training of 6 lines in chapter 1 of the fastbook.
from fastai.vision.all import *
path = untar_data(URLs.PETS)/'images'
def is_cat(x): return x[0].isupper()
dls = ImageDataLoaders.from_name_func(
path, get_image_files(path), valid_pct=0.2, seed=42,
label_func=is_cat, item_tfms=Resize(224))
learn = vision_learner(dls, resnet34, metrics=error_rate)
learn.fine_tune(1)
Sharing a Learner
to the Hub
A Learner
is a fastai object that bundles a model, data loaders, and a loss function. We will use the words Learner
and Model interchangeably throughout this post.
First, log in to the Hugging Face Hub. You will need to create a write
token in your Account Settings. Then there are three options to log in:
Type
huggingface-cli login
in your terminal and enter your token.If in a python notebook, you can use
notebook_login
.
from huggingface_hub import notebook_login
notebook_login()
- Use the
token
argument of thepush_to_hub_fastai
function.
You can input push_to_hub_fastai
with the Learner
you want to upload and the repository id for the Hub in the format of "namespace/repo_name". The namespace can be an individual account or an organization you have write access to (for example, 'fastai/stanza-de'). For more details, refer to the Hub Client documentation.
from huggingface_hub import push_to_hub_fastai
# repo_id = "YOUR_USERNAME/YOUR_LEARNER_NAME"
repo_id = "espejelomar/identify-my-cat"
push_to_hub_fastai(learner=learn, repo_id=repo_id)
The Learner
is now in the Hub in the repo named espejelomar/identify-my-cat
. An automatic model card is created with some links and next steps. When uploading a fastai Learner
(or any other model) to the Hub, it is helpful to edit its model card (image below) so that others better understand your work (refer to the Hugging Face documentation).
if you want to learn more about push_to_hub_fastai
go to the Hub Client Documentation. There are some cool arguments you might be interested in 👀. Remember, your model is a Git repository with all the advantages that this entails: version control, commits, branches...
Loading a Learner
from the Hugging Face Hub
Loading a model from the Hub is even simpler. We will load our Learner
, "espejelomar/identify-my-cat", and test it with a cat image (🦮?). This code is adapted from
the first chapter of the fastbook.
First, upload an image of a cat (or possibly a dog?). The Colab notebook with this tutorial uses ipywidgets
to interactively upload a cat image (or not?). Here we will use this cute cat 🐅:
Now let's load the Learner
we just shared in the Hub and test it.
from huggingface_hub import from_pretrained_fastai
# repo_id = "YOUR_USERNAME/YOUR_LEARNER_NAME"
repo_id = "espejelomar/identify-my-cat"
learner = from_pretrained_fastai(repo_id)
It works 👇!
_,_,probs = learner.predict(img)
print(f"Probability it's a cat: {100*probs[1].item():.2f}%")
Probability it's a cat: 100.00%
The Hub Client documentation includes addtional details on from_pretrained_fastai
.
Blurr
to mix fastai and Hugging Face Transformers (and share them)!
[Blurr is] a library designed for fastai developers who want to train and deploy Hugging Face transformers - Blurr Docs.
We will:
- Train a
blurr
Learner with the high-level Blurr API. It will load thedistilbert-base-uncased
model from the Hugging Face Hub and prepare a sequence classification model. - Share it to the Hub with the namespace
fastai/blurr_IMDB_distilbert_classification
usingpush_to_hub_fastai
. - Load it with
from_pretrained_fastai
and try it withlearner_blurr.predict()
.
Collaboration and open-source are fantastic!
First, install blurr
and train the Learner.
git clone https://github.com/ohmeow/blurr.git
cd blurr
pip install -e ".[dev]"
import torch
import transformers
from fastai.text.all import *
from blurr.text.data.all import *
from blurr.text.modeling.all import *
path = untar_data(URLs.IMDB_SAMPLE)
model_path = Path("models")
imdb_df = pd.read_csv(path / "texts.csv")
learn_blurr = BlearnerForSequenceClassification.from_data(imdb_df, "distilbert-base-uncased", dl_kwargs={"bs": 4})
learn_blurr.fit_one_cycle(1, lr_max=1e-3)
Use push_to_hub_fastai
to share with the Hub.
from huggingface_hub import push_to_hub_fastai
# repo_id = "YOUR_USERNAME/YOUR_LEARNER_NAME"
repo_id = "fastai/blurr_IMDB_distilbert_classification"
push_to_hub_fastai(learn_blurr, repo_id)
Use from_pretrained_fastai
to load a blurr
model from the Hub.
from huggingface_hub import from_pretrained_fastai
# repo_id = "YOUR_USERNAME/YOUR_LEARNER_NAME"
repo_id = "fastai/blurr_IMDB_distilbert_classification"
learner_blurr = from_pretrained_fastai(repo_id)
Try it with a couple sentences and review their sentiment (negative or positive) with learner_blurr.predict()
.
sentences = ["This integration is amazing!",
"I hate this was not available before."]
probs = learner_blurr.predict(sentences)
print(f"Probability that sentence '{sentences[0]}' is negative is: {100*probs[0]['probs'][0]:.2f}%")
print(f"Probability that sentence '{sentences[1]}' is negative is: {100*probs[1]['probs'][0]:.2f}%")
Again, it works!
Probability that sentence 'This integration is amazing!' is negative is: 29.46%
Probability that sentence 'I hate this was not available before.' is negative is: 70.04%
What's next?
Take the fast.ai course (a new version is coming soon), follow Jeremy Howard and fast.ai on Twitter for updates, and start sharing your fastai models on the Hub 🤗. Or load one of the models that are already in the Hub.
📧 Feel free to contact us via the Hugging Face Discord and share if you have an idea for a project. We would love to hear your feedback 💖.
Would you like to integrate your library to the Hub?
This integration is made possible by the huggingface_hub
library. If you want to add your library to the Hub, we have a guide for you! Or simply tag someone from the Hugging Face team.
A shout out to the Hugging Face team for all the work on this integration, in particular @osanseviero 🦙.
Thank you fastlearners and hugging learners 🤗.