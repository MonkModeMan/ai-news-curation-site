---
title: Train 400x faster Static Embedding Models with Sentence Transformers
description: ''
summary: ''
pubDate: Wed, 15 Jan 2025 00:00:00 GMT
source: Hugging Face Blog
tags:
- huggingface
- transformers
- nlp
url: https://huggingface.co/blog/static-embeddings
---

Train 400x faster Static Embedding Models with Sentence Transformers
TL;DR
This blog post introduces a method to train static embedding models that run 100x to 400x faster on CPU than state-of-the-art embedding models, while retaining most of the quality. This unlocks a lot of exciting use cases, including on-device and in-browser execution, edge computing, low power and embedded applications.
We apply this recipe to train two extremely efficient embedding models: sentence-transformers/static-retrieval-mrl-en-v1 for English Retrieval, and sentence-transformers/static-similarity-mrl-multilingual-v1 for Multilingual Similarity tasks. These models are 100x to 400x faster on CPU than common counterparts like all-mpnet-base-v2 and multilingual-e5-small, while reaching at least 85% of their performance on various benchmarks.
Today, we are releasing:
- The two models (for English retrieval and for multilingual similarity) mentioned above.
- The detailed training strategy we followed, from ideation to dataset selection to implementation and evaluation.
- Two training scripts, based on the open-source sentence transformers library.
- Two Weights and Biases reports with training and evaluation metrics collected during training.
- The detailed list of datasets we used: 30 for training and 13 for evaluation.
We also discuss potential enhancements, and encourage the community to explore them and build on this work!
Click to see Usage Snippets for the released models
The usage of these models is very straightforward, identical to the normal Sentence Transformers flow:
English Retrieval
from sentence_transformers import SentenceTransformer
# Download from the 🤗 Hub
model = SentenceTransformer("sentence-transformers/static-retrieval-mrl-en-v1", device="cpu")
# Run inference
sentences = [
'Gadofosveset-enhanced MR angiography of carotid arteries: does steady-state imaging improve accuracy of first-pass imaging?',
'To evaluate the diagnostic accuracy of gadofosveset-enhanced magnetic resonance (MR) angiography in the assessment of carotid artery stenosis, with digital subtraction angiography (DSA) as the reference standard, and to determine the value of reading first-pass, steady-state, and "combined" (first-pass plus steady-state) MR angiograms.',
'In a longitudinal study we investigated in vivo alterations of CVO during neuroinflammation, applying Gadofluorine M- (Gf) enhanced magnetic resonance imaging (MRI) in experimental autoimmune encephalomyelitis, an animal model of multiple sclerosis. SJL/J mice were monitored by Gadopentate dimeglumine- (Gd-DTPA) and Gf-enhanced MRI after adoptive transfer of proteolipid-protein-specific T cells. Mean Gf intensity ratios were calculated individually for different CVO and correlated to the clinical disease course. Subsequently, the tissue distribution of fluorescence-labeled Gf as well as the extent of cellular inflammation was assessed in corresponding histological slices.',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 1024]
# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings[0], embeddings[1:])
print(similarities)
# tensor([[0.7649, 0.3279]])
Multilingual Similarity
from sentence_transformers import SentenceTransformer
# Download from the 🤗 Hub
model = SentenceTransformer("sentence-transformers/static-similarity-mrl-multilingual-v1", device="cpu")
# Run inference
sentences = [
'It is known for its dry red chili powder.',
'It is popular for dried red chili powder.',
'These monsters will move in large groups.',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 1024]
# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities)
# tensor([[ 1.0000, 0.8388, -0.0012],
# [ 0.8388, 1.0000, 0.0445],
# [-0.0012, 0.0445, 1.0000]])
Table of Contents
- TL;DR
- Table of Contents
- What are Embeddings?
- Our Method
- Training Details
- Usage
- Performance
- Conclusion
- Next Steps
What are Embeddings?
Embeddings are one of the most versatile tools in natural language processing, enabling practitioners to solve a large variety of tasks. In essence, an embedding is a numerical representation of a more complex object, like text, images, audio, etc.
The embedding model will always produce embeddings of the same fixed size. You can then compute the similarity of complex objects by computing the similarity of the respective embeddings.
This has a large amount of use cases, and serves as the backbone for recommendation systems, retrieval, outlier detection, one-shot or few-shot learning, similarity search, clustering, paraphrase detection, classification, and much more.
Modern Embeddings
Many of today's embedding models consist of a handful of conversion steps. Following these steps is called "inference".
The Tokenizer
and Pooler
are responsible for pre- and post-processing for the Encoder
, respectively. The former chops texts up into tokens (a.k.a. words or subwords) which can be understood by the Encoder
, whereas the latter combines the embeddings for all tokens into one embedding for the entire text.
Within this pipeline, the Encoder
is often a language model with attention layers, which allows each token to be computed within the context of the other tokens. For example, bank
might be a token, but the token embedding for that token will likely be different if the text refers to a "river bank" or the financial institution.
Large encoder models with a lot of attention layers will be effective at using the context to produce useful embeddings, but they do so at a high price of slow inference. Notably, in the pipeline, the Encoder
step is generally responsible for almost all of the computational time.
Static Embeddings
Static Embeddings refers to a group of Encoder
models that don't use large and slow attention-based models, but instead rely on pre-computed token embeddings. Static embeddings were used years before the transformer architecture was developed. Common examples include GLoVe and word2vec. Recently, Model2Vec has been used to convert pre-trained embedding models into Static Embedding models.
For Static Embeddings, the Encoder
step is as simple as a dictionary lookup: given the token, return the pre-computed token embedding. Consequently, inference is suddenly no longer bottlenecked by the Encoder
phase, resulting in speedups of several orders of magnitude. This blogpost shows that the hit on quality can be quite small!
Our Method
We set out to revisit Static Embeddings models, using modern techniques to train them. Most of our gains come from the use of a contrastive learning loss function, as we'll explain shortly. Optionally, we can get additional speed improvements by using Matryoshka Representation Learning, which makes it possible to use truncated versions of the embedding vectors.
We'll be using the Sentence Transformers library for training. For a more general overview on how this library can be used to train embedding models, consider reading the Training and Finetuning Embedding Models with Sentence Transformers v3 blogpost or the Sentence Transformers Training Overview documentation.
Training Details
The objective with these reimagined Static Embeddings is to experiment with modern embedding model finetuning techniques on these highly efficient embedding models. In particular, unlike GLoVe and word2vec, we will be using:
Contrastive Learning: With most machine learning, you take input $X$ and expect output $Y$, and then train a model such that $X$ fed through the model produces something close to $Y$. For embedding models, we don't have $Y$: we don't know what a good embedding would be beforehand.
Instead, with Contrastive Learning, we have multiple inputs $X_1$ and $X_2$, and a similarity. We feed both inputs through the model, after which we can contrast the two embeddings resulting in a predicted similarity. We can then push the embeddings further apart if the true similarity is low, or pull the embeddings closer together if the true similarity is high.
Matryoshka Representation Learning (MRL): Matryoshka Embedding Models (blogpost) is a clever training approach that allows users to truncate embedding models to smaller dimensions at a minimal performance hit. It involves using the contrastive loss function not just with the normal-sized embedding, but also with truncated versions of them. Consequently, the model learns to store information primarily at the start of the embeddings.
Truncated embeddings will be faster with downstream applications, such as retrieval, classification, and clustering.
For future research, we leave various other modern training approaches for improving data quality. See Next Steps for concrete ideas.
Training Requirements
As shown in the Training Overview documentation in Sentence Transformers, training consists of 3 to 5 components:
- Dataset
- Loss Function
- Training Arguments (Optional)
- Evaluator (Optional)
- Trainer
In the following sections, we'll go through our thought processes for each of these.
Model Inspiration
In our experience, embedding models are either used 1) exclusively for retrieval or 2) for every task under the sun (classification, clustering, semantic textual similarity, etc.). We set out to train one of each.
For the retrieval model, there is only a limited amount of multilingual retrieval training data available, and hence we chose to opt for an English-only model. In contrast, we decided to train a multilingual general similarity model because multilingual data was much easier to acquire for this task.
For these models, we would like to use the StaticEmbedding
module, which implements an efficient tokenize
method that avoids padding, and an efficient forward
method that takes care of computing and pooling embeddings. It's as simple as using a torch
EmbeddingBag
, which is nothing more than an efficient Embedding
(i.e. a lookup table for embeddings) with mean pooling.
We can initialize it in a few ways: StaticEmbedding.from_model2vec
to load a Model2Vec model, StaticEmbedding.from_distillation
to perform Model2Vec-style distillation, or initializing it with a Tokenizer
and an embedding dimension to get random weights.
Based on our findings, the last option works best when fully training with a large amount of data. Matching common models like all-mpnet-base-v2 or bge-large-en-v1.5, we are choosing an embedding dimensionality of 1024, i.e. our embedding vectors consist of 1024 values each.
English Retrieval
For the English Retrieval model, we rely on the google-bert/bert-base-uncased
tokenizer. As such, initializing the model looks like this:
from sentence_transformers import SentenceTransformer
from sentence_transformers.models import StaticEmbedding
from tokenizers import Tokenizer
tokenizer = Tokenizer.from_pretrained("google-bert/bert-base-uncased")
static_embedding = StaticEmbedding(tokenizer, embedding_dim=1024)
model = SentenceTransformer(modules=[static_embedding])
The first entry in the modules
list must implement tokenize
, and the last one must produce pooled embeddings. Both is the case here, so we're good to start training this model.
Multilingual Similarity
For the Multilingual Similarity model, we instead rely on the google-bert/bert-base-multilingual-uncased
tokenizer, and that's the only thing we change in our initialization code:
from sentence_transformers import SentenceTransformer
from sentence_transformers.models import StaticEmbedding
from tokenizers import Tokenizer
tokenizer = Tokenizer.from_pretrained("google-bert/bert-base-multilingual-uncased")
static_embedding = StaticEmbedding(tokenizer, embedding_dim=1024)
model = SentenceTransformer(modules=[static_embedding])
Training Dataset Selection
Alongside dozens of Sentence Transformer models, the Sentence Transformers organization on Hugging Face also hosts 70+ datasets (at the time of writing):
Beyond that, many datasets have been tagged with sentence-transformers
to mark that they're useful for training embedding models:
English Retrieval
For the English Retrieval datasets, we are primarily looking for any dataset with:
- question-answer pairs, optionally with negatives (i.e. wrong answers) as well, and
- no overlap with the BEIR benchmark, a.k.a. the Retrieval tab on MTEB. Our goal is to avoid training on these datasets so we can use MTEB as a 0-shot benchmark.
We selected the following datasets:
- gooaq
- msmarco - the "triplet" subset
- squad
- s2orc - the "title-abstract-pair" subset
- allnli - the "triplet" subset
- paq
- trivia_qa
- msmarco_10m
- swim_ir - the "en" subset
- pubmedqa - the "triplet-20" subset
- miracl - the "en-triplet-all" subset
- mldr - the "en-triplet-all" subset
- mr_tydi - the "en-triplet-all" subset
Multilingual Similarity
For the Multilingual Similarity datasets, we aimed for datasets with:
- parallel sentences across languages, i.e. the same text in multiple languages, or
- positive pairs, i.e. pairs with high similarity, optionally with negatives (i.e. low similarity).
We selected the following datasets as they contain parallel sentences:
And these datasets as they contain positive pairs of some kind:
- stackexchange - the "post-post-pair" subset
- quora - the "triplet" subset
- wikianswers_duplicates
- all_nli - the "triplet" subset
- simple_wiki
- altlex
- flickr30k_captions
- coco_captions
- nli_for_simcse
- negation
Code
Loading these datasets is rather simple, e.g.:
from datasets import load_dataset, Dataset
gooaq_dataset = load_dataset("sentence-transformers/gooaq", split="train")
gooaq_dataset_dict = gooaq_dataset.train_test_split(test_size=10_000, seed=12)
gooaq_train_dataset: Dataset = gooaq_dataset_dict["train"]
gooaq_eval_dataset: Dataset = gooaq_dataset_dict["test"]
print(gooaq_train_dataset)
"""
Dataset({
features: ['question', 'answer'],
num_rows: 3002496
})
"""
print(gooaq_eval_dataset)
"""
Dataset({
features: ['question', 'answer'],
num_rows: 10000
})
"""
The gooaq dataset doesn't already have a train-eval split, so we can make one with train_test_split
. Otherwise, we can just load a precomputed split with e.g. split="eval"
.
Note that train_test_split
does mean that the dataset has to be loaded into memory, whereas it is otherwise just kept on disk. This increased memory is not ideal when training, so it's recommended to 1) load the data, 2) split it, and 3) save it to disk with save_to_disk
. Before training, you can then use load_from_disk
to load it again.
Loss Function Selection
Within Sentence Transformers, your loss model must match your training data format. The Loss Overview is designed as an overview of which losses are compatible with which formats.
In particular, we currently have the following formats in our data:
- (anchor, positive) pair, no label
- (anchor, positive, negative) triplet, no label
- (anchor, positive, negative_1, ..., negative_n) tuples, no label
For these formats, we have some excellent choices:
MultipleNegativesRankingLoss
(MNRL): Also known as in-batch negatives loss or InfoNCE loss, this loss has been used to train modern embedding models for a handful of years. In short, the loss optimizes the following:Given an anchor (e.g. a question), assign the highest similarity to the corresponding positive (i.e. answer) out of all positives and negatives (e.g. all answers) in the batch.
If you provide the optional negatives, they will only be used as extra options (also known as in-batch negatives) from which the model must pick the correct positive. Within reason, the harder this "picking" is, the stronger the model will become. Because of this, higher batch sizes result in more in-batch negatives, which then increase performance (to a point).
CachedMultipleNegativesRankingLoss
(CMNRL): This is an extension of MNRL that implements GradCache, an approach that allows for arbitrarily increasing the batch size without increasing the memory.This loss is recommended over MNRL unless you can already fit a large enough batch size in memory with just MNRL. In that case, you can use MNRL to save the 20% training speed cost that CMNRL adds.
GISTEmbedLoss
(GIST): This is also an extension of MNRL, it uses aguide
Sentence Transformer model to remove potential false negatives from the list of options that the model must "pick" the correct positive from.False negatives can hurt performance, but hard true negatives (texts that are close to correct, but not quite) can help performance, so this filtering is a fine line to walk.
Because these static embedding models are extremely small, it is possible to fit our desired batch size of 2048 samples on our hardware: a single RTX 3090 with 24GB, so we don't need to use CMNRL.
Additionally, because we're training such fast models, the guide
from the GISTEmbedLoss
would make the training much slower. Because of this, we've opted to use MultipleNegativesRankingLoss
for our models.
If we were to try these experiments again, we would pick a larger batch size, e.g. 16384 with CMNRL. If you try, please let us know how it goes!
Code
The usage is rather simple:
from sentence_transformers import SentenceTransformer
from sentence_transformers.losses import MultipleNegativesRankingLoss
# Prepare a model to train
tokenizer = Tokenizer.from_pretrained("google-bert/bert-base-uncased")
static_embedding = StaticEmbedding(tokenizer, embedding_dim=1024)
model = SentenceTransformer(modules=[static_embedding])
# Initialize the MNRL loss given the model
loss = MultipleNegativesRankingLoss(model)
Matryoshka Representation Learning
Beyond regular loss functions, Sentence Transformers also implements a handful of Loss modifiers. These work on top of standard loss functions, but apply them in different ways to try and instil useful properties into the trained embedding model.
A very interesting one is the MatryoshkaLoss
, which turns the trained model into a Matryoshka Model. This allows users to truncate the output embeddings at a minimal loss of performance, meaning that retrieval or clustering can be sped up due to the smaller dimensionalities.
Code
The MatryoshkaLoss
is applied on top of a normal loss. It's recommended to also include the normal embedding dimensionality in the list of matryoshka_dims
:
from sentence_transformers import SentenceTransformer
from sentence_transformers.losses import MultipleNegativesRankingLoss, MatryoshkaLoss
# Prepare a model to train
tokenizer = Tokenizer.from_pretrained("google-bert/bert-base-uncased")
static_embedding = StaticEmbedding(tokenizer, embedding_dim=1024)
model = SentenceTransformer(modules=[static_embedding])
# Initialize the MNRL loss given the model
base_loss = MultipleNegativesRankingLoss(model)
loss = MatryoshkaLoss(model, base_loss, matryoshka_dims=[1024, 768, 512, 256, 128, 64, 32])
Training Arguments Selection
Sentence Transformers supports a lot of training arguments, the most valuable of which have been listed in the Training Overview > Training Arguments documentation.
We used the same core training parameters to train both models:
num_train_epochs
: 1- We have sufficient data, should we want to train for more, then we can add more data instead of training with the same data multiple times.
per_device_train_batch_size
/per_device_eval_batch_size
: 2048- 2048 dimensions fit comfortably on our RTX 3090. Various papers (Xiao et al., Li et al.) show that even larger batch sizes still improve performance. For future versions, we will apply
CachedMultipleNegativesRankingLoss
with a larger batch size, e.g. 16384.
- 2048 dimensions fit comfortably on our RTX 3090. Various papers (Xiao et al., Li et al.) show that even larger batch sizes still improve performance. For future versions, we will apply
learning_rate
: 2e-1- Note! This is much larger than with normal embedding model training, which often uses a loss around 2e-5.
warmup_ratio
: 0.1- 0.1 or 10% is a pretty standard warmup ratio to smoothly introduce the high learning rate to the model.
bf16
: True- If your GPU(s) support(s)
bf16
- it tends to make sense to train with it. Otherwise you can usefp16=True
if that's supported instead.
- If your GPU(s) support(s)
batch_sampler
:BatchSamplers.NO_DUPLICATES
- All losses with in-batch negatives (such as MNRL) benefit from this batch sampler that avoids duplicates within the batch. Duplicates often result in false negatives, weakening the trained model.
multi_dataset_batch_sampler
:MultiDatasetBatchSamplers.PROPORTIONAL
- When you're training with multiple datasets, it's common that not all datasets are the same size. When that happens, you can either:
- Round Robin: sample the same amount of batches from each dataset until one is exhausted. You'll have an equal distribution of data, but not all data will be used.
- Proportional: sample each dataset until all are exhausted. You'll use up all data, but you won't have an equal distribution of data. We chose this one as we're not too concerned with a data imbalance.
- When you're training with multiple datasets, it's common that not all datasets are the same size. When that happens, you can either:
Beyond these core arguments, we also set a few training arguments for tracking and debugging: eval_strategy
, eval_steps
, save_strategy
, save_steps
, save_total_limit
, logging_steps
, logging_first_step
, and run_name
.
Code
In the end, we used these SentenceTransformerTrainingArguments
for the two models:
run_name = "static-retrieval-mrl-en-v1"
# or
# run_name = "static-similarity-mrl-multilingual-v1"
args = SentenceTransformerTrainingArguments(
# Required parameter:
output_dir=f"models/{run_name}",
# Optional training parameters:
num_train_epochs=1,
per_device_train_batch_size=2048,
per_device_eval_batch_size=2048,
learning_rate=2e-1,
warmup_ratio=0.1,
fp16=False, # Set to False if you get an error that your GPU can't run on FP16
bf16=True, # Set to True if you have a GPU that supports BF16
batch_sampler=BatchSamplers.NO_DUPLICATES, # MultipleNegativesRankingLoss benefits from no duplicate samples in a batch
multi_dataset_batch_sampler=MultiDatasetBatchSamplers.PROPORTIONAL,
# Optional tracking/debugging parameters:
eval_strategy="steps",
eval_steps=1000,
save_strategy="steps",
save_steps=1000,
save_total_limit=2,
logging_steps=1000,
logging_first_step=True,
run_name=run_name, # Used if `wandb`, `tensorboard`, or `neptune`, etc. is installed
)
Evaluator Selection
If we provide an evaluation dataset to the Sentence Transformer Trainer, then upon evaluation we will get an evaluation loss. This'll be useful to track whether we're overfitting or not, but not so meaningful when it comes to real downstream performance.
Because of this, Sentence Transformers additionally supports Evaluators. Unlike the training loss, these give qualitative metrics like NDCG, MAP, MRR for Information Retrieval, Spearman Correlation for Semantic Textual Similarity, or Triplet accuracy (number of samples where similarity(anchor, positive)
> similarity(anchor, negative)
).
Due to its simplicity, we will be using the NanoBEIREvaluator
for the retrieval model. This evaluator runs Information Retrieval benchmarks on the NanoBEIR collection of datasets. This dataset is a subset of the much larger (and thus slower) BEIR benchmark, which is commonly used as the Retrieval tab in the MTEB Leaderboard.
Code
Because all datasets are already pre-defined, we can load the evaluator without any arguments:
from sentence_transformers import SentenceTransformer
from sentence_transformers.evaluation import NanoBEIREvaluator
# Load an example pre-trained model to finetune further
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
# Initialize the NanoBEIR Evaluator
evaluator = NanoBEIREvaluator()
# Run it on any Sentence Transformer model
evaluator(model)
Hardware Details
We're training these models on consumer-level hardware, specifically:
- GPU: RTX 3090
- CPU: i7-13700K
- RAM: 32GB
Overall Training Scripts
This section contains the final training scripts for both models with all of the previously described components (datasets, loss functions, training arguments, evaluator, trainer) combined.
English Retrieval
Click to expand
import random
import logging
from datasets import load_dataset, Dataset, DatasetDict
from sentence_transformers import (
SentenceTransformer,
SentenceTransformerTrainer,
SentenceTransformerTrainingArguments,
SentenceTransformerModelCardData,
)
from sentence_transformers.losses import MatryoshkaLoss, MultipleNegativesRankingLoss
from sentence_transformers.training_args import BatchSamplers, MultiDatasetBatchSamplers
from sentence_transformers.evaluation import NanoBEIREvaluator
from sentence_transformers.models.StaticEmbedding import StaticEmbedding
from transformers import AutoTokenizer
logging.basicConfig(
format="%(asctime)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S", level=logging.INFO
)
random.seed(12)
def load_train_eval_datasets():
"""
Either load the train and eval datasets from disk or load them from the datasets library & save them to disk.
Upon saving to disk, we quit() to ensure that the datasets are not loaded into memory before training.
"""
try:
train_dataset = DatasetDict.load_from_disk("datasets/train_dataset")
eval_dataset = DatasetDict.load_from_disk("datasets/eval_dataset")
return train_dataset, eval_dataset
except FileNotFoundError:
print("Loading gooaq dataset...")
gooaq_dataset = load_dataset("sentence-transformers/gooaq", split="train")
gooaq_dataset_dict = gooaq_dataset.train_test_split(test_size=10_000, seed=12)
gooaq_train_dataset: Dataset = gooaq_dataset_dict["train"]
gooaq_eval_dataset: Dataset = gooaq_dataset_dict["test"]
print("Loaded gooaq dataset.")
print("Loading msmarco dataset...")
msmarco_dataset = load_dataset("sentence-transformers/msmarco-co-condenser-margin-mse-sym-mnrl-mean-v1", "triplet", split="train")
msmarco_dataset_dict = msmarco_dataset.train_test_split(test_size=10_000, seed=12)
msmarco_train_dataset: Dataset = msmarco_dataset_dict["train"]
msmarco_eval_dataset: Dataset = msmarco_dataset_dict["test"]
print("Loaded msmarco dataset.")
print("Loading squad dataset...")
squad_dataset = load_dataset("sentence-transformers/squad", split="train")
squad_dataset_dict = squad_dataset.train_test_split(test_size=10_000, seed=12)
squad_train_dataset: Dataset = squad_dataset_dict["train"]
squad_eval_dataset: Dataset = squad_dataset_dict["test"]
print("Loaded squad dataset.")
print("Loading s2orc dataset...")
s2orc_dataset = load_dataset("sentence-transformers/s2orc", "title-abstract-pair", split="train[:100000]")
s2orc_dataset_dict = s2orc_dataset.train_test_split(test_size=10_000, seed=12)
s2orc_train_dataset: Dataset = s2orc_dataset_dict["train"]
s2orc_eval_dataset: Dataset = s2orc_dataset_dict["test"]
print("Loaded s2orc dataset.")
print("Loading allnli dataset...")
allnli_train_dataset = load_dataset("sentence-transformers/all-nli", "triplet", split="train")
allnli_eval_dataset = load_dataset("sentence-transformers/all-nli", "triplet", split="dev")
print("Loaded allnli dataset.")
print("Loading paq dataset...")
paq_dataset = load_dataset("sentence-transformers/paq", split="train")
paq_dataset_dict = paq_dataset.train_test_split(test_size=10_000, seed=12)
paq_train_dataset: Dataset = paq_dataset_dict["train"]
paq_eval_dataset: Dataset = paq_dataset_dict["test"]
print("Loaded paq dataset.")
print("Loading trivia_qa dataset...")
trivia_qa = load_dataset("sentence-transformers/trivia-qa", split="train")
trivia_qa_dataset_dict = trivia_qa.train_test_split(test_size=5_000, seed=12)
trivia_qa_train_dataset: Dataset = trivia_qa_dataset_dict["train"]
trivia_qa_eval_dataset: Dataset = trivia_qa_dataset_dict["test"]
print("Loaded trivia_qa dataset.")
print("Loading msmarco_10m dataset...")
msmarco_10m_dataset = load_dataset("bclavie/msmarco-10m-triplets", split="train")
msmarco_10m_dataset_dict = msmarco_10m_dataset.train_test_split(test_size=10_000, seed=12)
msmarco_10m_train_dataset: Dataset = msmarco_10m_dataset_dict["train"]
msmarco_10m_eval_dataset: Dataset = msmarco_10m_dataset_dict["test"]
print("Loaded msmarco_10m dataset.")
print("Loading swim_ir dataset...")
swim_ir_dataset = load_dataset("nthakur/swim-ir-monolingual", "en", split="train").select_columns(["query", "text"])
swim_ir_dataset_dict = swim_ir_dataset.train_test_split(test_size=10_000, seed=12)
swim_ir_train_dataset: Dataset = swim_ir_dataset_dict["train"]
swim_ir_eval_dataset: Dataset = swim_ir_dataset_dict["test"]
print("Loaded swim_ir dataset.")
# NOTE: 20 negatives
print("Loading pubmedqa dataset...")
pubmedqa_dataset = load_dataset("sentence-transformers/pubmedqa", "triplet-20", split="train")
pubmedqa_dataset_dict = pubmedqa_dataset.train_test_split(test_size=100, seed=12)
pubmedqa_train_dataset: Dataset = pubmedqa_dataset_dict["train"]
pubmedqa_eval_dataset: Dataset = pubmedqa_dataset_dict["test"]
print("Loaded pubmedqa dataset.")
# NOTE: A lot of overlap with anchor/positives
print("Loading miracl dataset...")
miracl_dataset = load_dataset("sentence-transformers/miracl", "en-triplet-all", split="train")
miracl_dataset_dict = miracl_dataset.train_test_split(test_size=10_000, seed=12)
miracl_train_dataset: Dataset = miracl_dataset_dict["train"]
miracl_eval_dataset: Dataset = miracl_dataset_dict["test"]
print("Loaded miracl dataset.")
# NOTE: A lot of overlap with anchor/positives
print("Loading mldr dataset...")
mldr_dataset = load_dataset("sentence-transformers/mldr", "en-triplet-all", split="train")
mldr_dataset_dict = mldr_dataset.train_test_split(test_size=10_000, seed=12)
mldr_train_dataset: Dataset = mldr_dataset_dict["train"]
mldr_eval_dataset: Dataset = mldr_dataset_dict["test"]
print("Loaded mldr dataset.")
# NOTE: A lot of overlap with anchor/positives
print("Loading mr_tydi dataset...")
mr_tydi_dataset = load_dataset("sentence-transformers/mr-tydi", "en-triplet-all", split="train")
mr_tydi_dataset_dict = mr_tydi_dataset.train_test_split(test_size=10_000, seed=12)
mr_tydi_train_dataset: Dataset = mr_tydi_dataset_dict["train"]
mr_tydi_eval_dataset: Dataset = mr_tydi_dataset_dict["test"]
print("Loaded mr_tydi dataset.")
train_dataset = DatasetDict({
"gooaq": gooaq_train_dataset,
"msmarco": msmarco_train_dataset,
"squad": squad_train_dataset,
"s2orc": s2orc_train_dataset,
"allnli": allnli_train_dataset,
"paq": paq_train_dataset,
"trivia_qa": trivia_qa_train_dataset,
"msmarco_10m": msmarco_10m_train_dataset,
"swim_ir": swim_ir_train_dataset,
"pubmedqa": pubmedqa_train_dataset,
"miracl": miracl_train_dataset,
"mldr": mldr_train_dataset,
"mr_tydi": mr_tydi_train_dataset,
})
eval_dataset = DatasetDict({
"gooaq": gooaq_eval_dataset,
"msmarco": msmarco_eval_dataset,
"squad": squad_eval_dataset,
"s2orc": s2orc_eval_dataset,
"allnli": allnli_eval_dataset,
"paq": paq_eval_dataset,
"trivia_qa": trivia_qa_eval_dataset,
"msmarco_10m": msmarco_10m_eval_dataset,
"swim_ir": swim_ir_eval_dataset,
"pubmedqa": pubmedqa_eval_dataset,
"miracl": miracl_eval_dataset,
"mldr": mldr_eval_dataset,
"mr_tydi": mr_tydi_eval_dataset,
})
train_dataset.save_to_disk("datasets/train_dataset")
eval_dataset.save_to_disk("datasets/eval_dataset")
# The `train_test_split` calls have put a lot of the datasets in memory, while we want it to just be on disk
quit()
def main():
# 1. Load a model to finetune with 2. (Optional) model card data
static_embedding = StaticEmbedding(AutoTokenizer.from_pretrained("google-bert/bert-base-uncased"), embedding_dim=1024)
model = SentenceTransformer(
modules=[static_embedding],
model_card_data=SentenceTransformerModelCardData(
language="en",
license="apache-2.0",
model_name="Static Embeddings with BERT uncased tokenizer finetuned on various datasets",
),
)
# 3. Set up training & evaluation datasets - each dataset is trained with MNRL (with MRL)
train_dataset, eval_dataset = load_train_eval_datasets()
print(train_dataset)
# 4. Define a loss function
loss = MultipleNegativesRankingLoss(model)
loss = MatryoshkaLoss(model, loss, matryoshka_dims=[32, 64, 128, 256, 512, 1024])
# 5. (Optional) Specify training arguments
run_name = "static-retrieval-mrl-en-v1"
args = SentenceTransformerTrainingArguments(
# Required parameter:
output_dir=f"models/{run_name}",
# Optional training parameters:
num_train_epochs=1,
per_device_train_batch_size=2048,
per_device_eval_batch_size=2048,
learning_rate=2e-1,
warmup_ratio=0.1,
fp16=False, # Set to False if you get an error that your GPU can't run on FP16
bf16=True, # Set to True if you have a GPU that supports BF16
batch_sampler=BatchSamplers.NO_DUPLICATES, # MultipleNegativesRankingLoss benefits from no duplicate samples in a batch
multi_dataset_batch_sampler=MultiDatasetBatchSamplers.PROPORTIONAL,
# Optional tracking/debugging parameters:
eval_strategy="steps",
eval_steps=250,
save_strategy="steps",
save_steps=250,
save_total_limit=2,
logging_steps=250,
logging_first_step=True,
run_name=run_name, # Will be used in W&B if `wandb` is installed
)
# 6. (Optional) Create an evaluator & evaluate the base model
evaluator = NanoBEIREvaluator()
evaluator(model)
# 7. Create a trainer & train
trainer = SentenceTransformerTrainer(
model=model,
args=args,
train_dataset=train_dataset,
eval_dataset=eval_dataset,
loss=loss,
evaluator=evaluator,
)
trainer.train()
# (Optional) Evaluate the trained model on the evaluator after training
evaluator(model)
# 8. Save the trained model
model.save_pretrained(f"models/{run_name}/final")
# 9. (Optional) Push it to the Hugging Face Hub
model.push_to_hub(run_name, private=True)
if __name__ == "__main__":
main()
This script produced sentence-transformers/static-retrieval-mrl-en-v1 after 17.8 hours of training. In total, it consumed 2.6 kWh of energy and emitted 1kg of CO2. That is roughly equivalent to the amount of CO2 an average person exhales per day.
See our Weights and Biases report for the training and evaluation metrics collected during training.
Multilingual Similarity
Click to expand
import random
import logging
from datasets import load_dataset, Dataset, DatasetDict
from sentence_transformers import (
SentenceTransformer,
SentenceTransformerTrainer,
SentenceTransformerTrainingArguments,
SentenceTransformerModelCardData,
)
from sentence_transformers.losses import MatryoshkaLoss, MultipleNegativesRankingLoss
from sentence_transformers.training_args import BatchSamplers, MultiDatasetBatchSamplers
from sentence_transformers.models.StaticEmbedding import StaticEmbedding
from transformers import AutoTokenizer
logging.basicConfig(
format="%(asctime)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S", level=logging.INFO
)
random.seed(12)
def load_train_eval_datasets():
"""
Either load the train and eval datasets from disk or load them from the datasets library & save them to disk.
Upon saving to disk, we quit() to ensure that the datasets are not loaded into memory before training.
"""
try:
train_dataset = DatasetDict.load_from_disk("datasets/train_dataset")
eval_dataset = DatasetDict.load_from_disk("datasets/eval_dataset")
return train_dataset, eval_dataset
except FileNotFoundError:
print("Loading wikititles dataset...")
wikititles_dataset = load_dataset("sentence-transformers/parallel-sentences-wikititles", split="train")
wikititles_dataset_dict = wikititles_dataset.train_test_split(test_size=10_000, seed=12)
wikititles_train_dataset: Dataset = wikititles_dataset_dict["train"]
wikititles_eval_dataset: Dataset = wikititles_dataset_dict["test"]
print("Loaded wikititles dataset.")
print("Loading tatoeba dataset...")
tatoeba_dataset = load_dataset("sentence-transformers/parallel-sentences-tatoeba", "all", split="train")
tatoeba_dataset_dict = tatoeba_dataset.train_test_split(test_size=10_000, seed=12)
tatoeba_train_dataset: Dataset = tatoeba_dataset_dict["train"]
tatoeba_eval_dataset: Dataset = tatoeba_dataset_dict["test"]
print("Loaded tatoeba dataset.")
print("Loading talks dataset...")
talks_dataset = load_dataset("sentence-transformers/parallel-sentences-talks", "all", split="train")
talks_dataset_dict = talks_dataset.train_test_split(test_size=10_000, seed=12)
talks_train_dataset: Dataset = talks_dataset_dict["train"]
talks_eval_dataset: Dataset = talks_dataset_dict["test"]
print("Loaded talks dataset.")
print("Loading europarl dataset...")
europarl_dataset = load_dataset("sentence-transformers/parallel-sentences-europarl", "all", split="train[:5000000]")
europarl_dataset_dict = europarl_dataset.train_test_split(test_size=10_000, seed=12)
europarl_train_dataset: Dataset = europarl_dataset_dict["train"]
europarl_eval_dataset: Dataset = europarl_dataset_dict["test"]
print("Loaded europarl dataset.")
print("Loading global voices dataset...")
global_voices_dataset = load_dataset("sentence-transformers/parallel-sentences-global-voices", "all", split="train")
global_voices_dataset_dict = global_voices_dataset.train_test_split(test_size=10_000, seed=12)
global_voices_train_dataset: Dataset = global_voices_dataset_dict["train"]
global_voices_eval_dataset: Dataset = global_voices_dataset_dict["test"]
print("Loaded global voices dataset.")
print("Loading jw300 dataset...")
jw300_dataset = load_dataset("sentence-transformers/parallel-sentences-jw300", "all", split="train")
jw300_dataset_dict = jw300_dataset.train_test_split(test_size=10_000, seed=12)
jw300_train_dataset: Dataset = jw300_dataset_dict["train"]
jw300_eval_dataset: Dataset = jw300_dataset_dict["test"]
print("Loaded jw300 dataset.")
print("Loading muse dataset...")
muse_dataset = load_dataset("sentence-transformers/parallel-sentences-muse", split="train")
muse_dataset_dict = muse_dataset.train_test_split(test_size=10_000, seed=12)
muse_train_dataset: Dataset = muse_dataset_dict["train"]
muse_eval_dataset: Dataset = muse_dataset_dict["test"]
print("Loaded muse dataset.")
print("Loading wikimatrix dataset...")
wikimatrix_dataset = load_dataset("sentence-transformers/parallel-sentences-wikimatrix", "all", split="train")
wikimatrix_dataset_dict = wikimatrix_dataset.train_test_split(test_size=10_000, seed=12)
wikimatrix_train_dataset: Dataset = wikimatrix_dataset_dict["train"]
wikimatrix_eval_dataset: Dataset = wikimatrix_dataset_dict["test"]
print("Loaded wikimatrix dataset.")
print("Loading opensubtitles dataset...")
opensubtitles_dataset = load_dataset("sentence-transformers/parallel-sentences-opensubtitles", "all", split="train[:5000000]")
opensubtitles_dataset_dict = opensubtitles_dataset.train_test_split(test_size=10_000, seed=12)
opensubtitles_train_dataset: Dataset = opensubtitles_dataset_dict["train"]
opensubtitles_eval_dataset: Dataset = opensubtitles_dataset_dict["test"]
print("Loaded opensubtitles dataset.")
print("Loading stackexchange dataset...")
stackexchange_dataset = load_dataset("sentence-transformers/stackexchange-duplicates", "post-post-pair", split="train")
stackexchange_dataset_dict = stackexchange_dataset.train_test_split(test_size=10_000, seed=12)
stackexchange_train_dataset: Dataset = stackexchange_dataset_dict["train"]
stackexchange_eval_dataset: Dataset = stackexchange_dataset_dict["test"]
print("Loaded stackexchange dataset.")
print("Loading quora dataset...")
quora_dataset = load_dataset("sentence-transformers/quora-duplicates", "triplet", split="train")
quora_dataset_dict = quora_dataset.train_test_split(test_size=10_000, seed=12)
quora_train_dataset: Dataset = quora_dataset_dict["train"]
quora_eval_dataset: Dataset = quora_dataset_dict["test"]
print("Loaded quora dataset.")
print("Loading wikianswers duplicates dataset...")
wikianswers_duplicates_dataset = load_dataset("sentence-transformers/wikianswers-duplicates", split="train[:10000000]")
wikianswers_duplicates_dict = wikianswers_duplicates_dataset.train_test_split(test_size=10_000, seed=12)
wikianswers_duplicates_train_dataset: Dataset = wikianswers_duplicates_dict["train"]
wikianswers_duplicates_eval_dataset: Dataset = wikianswers_duplicates_dict["test"]
print("Loaded wikianswers duplicates dataset.")
print("Loading all nli dataset...")
all_nli_train_dataset = load_dataset("sentence-transformers/all-nli", "triplet", split="train")
all_nli_eval_dataset = load_dataset("sentence-transformers/all-nli", "triplet", split="dev")
print("Loaded all nli dataset.")
print("Loading simple wiki dataset...")
simple_wiki_dataset = load_dataset("sentence-transformers/simple-wiki", split="train")
simple_wiki_dataset_dict = simple_wiki_dataset.train_test_split(test_size=10_000, seed=12)
simple_wiki_train_dataset: Dataset = simple_wiki_dataset_dict["train"]
simple_wiki_eval_dataset: Dataset = simple_wiki_dataset_dict["test"]
print("Loaded simple wiki dataset.")
print("Loading altlex dataset...")
altlex_dataset = load_dataset("sentence-transformers/altlex", split="train")
altlex_dataset_dict = altlex_dataset.train_test_split(test_size=10_000, seed=12)
altlex_train_dataset: Dataset = altlex_dataset_dict["train"]
altlex_eval_dataset: Dataset = altlex_dataset_dict["test"]
print("Loaded altlex dataset.")
print("Loading flickr30k captions dataset...")
flickr30k_captions_dataset = load_dataset("sentence-transformers/flickr30k-captions", split="train")
flickr30k_captions_dataset_dict = flickr30k_captions_dataset.train_test_split(test_size=10_000, seed=12)
flickr30k_captions_train_dataset: Dataset = flickr30k_captions_dataset_dict["train"]
flickr30k_captions_eval_dataset: Dataset = flickr30k_captions_dataset_dict["test"]
print("Loaded flickr30k captions dataset.")
print("Loading coco captions dataset...")
coco_captions_dataset = load_dataset("sentence-transformers/coco-captions", split="train")
coco_captions_dataset_dict = coco_captions_dataset.train_test_split(test_size=10_000, seed=12)
coco_captions_train_dataset: Dataset = coco_captions_dataset_dict["train"]
coco_captions_eval_dataset: Dataset = coco_captions_dataset_dict["test"]
print("Loaded coco captions dataset.")
print("Loading nli for simcse dataset...")
nli_for_simcse_dataset = load_dataset("sentence-transformers/nli-for-simcse", "triplet", split="train")
nli_for_simcse_dataset_dict = nli_for_simcse_dataset.train_test_split(test_size=10_000, seed=12)
nli_for_simcse_train_dataset: Dataset = nli_for_simcse_dataset_dict["train"]
nli_for_simcse_eval_dataset: Dataset = nli_for_simcse_dataset_dict["test"]
print("Loaded nli for simcse dataset.")
print("Loading negation dataset...")
negation_dataset = load_dataset("jinaai/negation-dataset", split="train")
negation_dataset_dict = negation_dataset.train_test_split(test_size=100, seed=12)
negation_train_dataset: Dataset = negation_dataset_dict["train"]
negation_eval_dataset: Dataset = negation_dataset_dict["test"]
print("Loaded negation dataset.")
train_dataset = DatasetDict({
"wikititles": wikititles_train_dataset,
"tatoeba": tatoeba_train_dataset,
"talks": talks_train_dataset,
"europarl": europarl_train_dataset,
"global_voices": global_voices_train_dataset,
"jw300": jw300_train_dataset,
"muse": muse_train_dataset,
"wikimatrix": wikimatrix_train_dataset,
"opensubtitles": opensubtitles_train_dataset,
"stackexchange": stackexchange_train_dataset,
"quora": quora_train_dataset,
"wikianswers_duplicates": wikianswers_duplicates_train_dataset,
"all_nli": all_nli_train_dataset,
"simple_wiki": simple_wiki_train_dataset,
"altlex": altlex_train_dataset,
"flickr30k_captions": flickr30k_captions_train_dataset,
"coco_captions": coco_captions_train_dataset,
"nli_for_simcse": nli_for_simcse_train_dataset,
"negation": negation_train_dataset,
})
eval_dataset = DatasetDict({
"wikititles": wikititles_eval_dataset,
"tatoeba": tatoeba_eval_dataset,
"talks": talks_eval_dataset,
"europarl": europarl_eval_dataset,
"global_voices": global_voices_eval_dataset,
"jw300": jw300_eval_dataset,
"muse": muse_eval_dataset,
"wikimatrix": wikimatrix_eval_dataset,
"opensubtitles": opensubtitles_eval_dataset,
"stackexchange": stackexchange_eval_dataset,
"quora": quora_eval_dataset,
"wikianswers_duplicates": wikianswers_duplicates_eval_dataset,
"all_nli": all_nli_eval_dataset,
"simple_wiki": simple_wiki_eval_dataset,
"altlex": altlex_eval_dataset,
"flickr30k_captions": flickr30k_captions_eval_dataset,
"coco_captions": coco_captions_eval_dataset,
"nli_for_simcse": nli_for_simcse_eval_dataset,
"negation": negation_eval_dataset,
})
train_dataset.save_to_disk("datasets/train_dataset")
eval_dataset.save_to_disk("datasets/eval_dataset")
# The `train_test_split` calls have put a lot of the datasets in memory, while we want it to just be on disk
quit()
def main():
# 1. Load a model to finetune with 2. (Optional) model card data
static_embedding = StaticEmbedding(AutoTokenizer.from_pretrained("google-bert/bert-base-multilingual-uncased"), embedding_dim=1024)
model = SentenceTransformer(
modules=[static_embedding],
model_card_data=SentenceTransformerModelCardData(
license="apache-2.0",
model_name="Static Embeddings with BERT Multilingual uncased tokenizer finetuned on various datasets",
),
)
# 3. Set up training & evaluation datasets - each dataset is trained with MNRL (with MRL)
train_dataset, eval_dataset = load_train_eval_datasets()
print(train_dataset)
# 4. Define a loss function
loss = MultipleNegativesRankingLoss(model)
loss = MatryoshkaLoss(model, loss, matryoshka_dims=[32, 64, 128, 256, 512, 1024])
# 5. (Optional) Specify training arguments
run_name = "static-similarity-mrl-multilingual-v1"
args = SentenceTransformerTrainingArguments(
# Required parameter:
output_dir=f"models/{run_name}",
# Optional training parameters:
num_train_epochs=1,
per_device_train_batch_size=2048,
per_device_eval_batch_size=2048,
learning_rate=2e-1,
warmup_ratio=0.1,
fp16=False, # Set to False if you get an error that your GPU can't run on FP16
bf16=True, # Set to True if you have a GPU that supports BF16
batch_sampler=BatchSamplers.NO_DUPLICATES, # MultipleNegativesRankingLoss benefits from no duplicate samples in a batch
multi_dataset_batch_sampler=MultiDatasetBatchSamplers.PROPORTIONAL,
# Optional tracking/debugging parameters:
eval_strategy="steps",
eval_steps=1000,
save_strategy="steps",
save_steps=1000,
save_total_limit=2,
logging_steps=1000,
logging_first_step=True,
run_name=run_name, # Will be used in W&B if `wandb` is installed
)
# 6. Create a trainer & train
trainer = SentenceTransformerTrainer(
model=model,
args=args,
train_dataset=train_dataset,
eval_dataset=eval_dataset,
loss=loss,
)
trainer.train()
# 7. Save the trained model
model.save_pretrained(f"models/{run_name}/final")
# 8. (Optional) Push it to the Hugging Face Hub
model.push_to_hub(run_name, private=True)
if __name__ == "__main__":
main()
This script produced sentence-transformers/static-similarity-mrl-multilingual-v1 after 3.1 hours of training. In total, it consumed 0.5 kWh of energy and emitted 0.2kg of CO2. That is roughly 20% of the CO2 that an average person exhales per day.
See our Weights and Biases report for the training and evaluation losses collected during training.
Usage
The usage of these models is very straightforward, identical to the normal Sentence Transformers flow:
English Retrieval
from sentence_transformers import SentenceTransformer
# Download from the 🤗 Hub
model = SentenceTransformer("sentence-transformers/static-retrieval-mrl-en-v1", device="cpu")
# Run inference
sentences = [
'Gadofosveset-enhanced MR angiography of carotid arteries: does steady-state imaging improve accuracy of first-pass imaging?',
'To evaluate the diagnostic accuracy of gadofosveset-enhanced magnetic resonance (MR) angiography in the assessment of carotid artery stenosis, with digital subtraction angiography (DSA) as the reference standard, and to determine the value of reading first-pass, steady-state, and "combined" (first-pass plus steady-state) MR angiograms.',
'In a longitudinal study we investigated in vivo alterations of CVO during neuroinflammation, applying Gadofluorine M- (Gf) enhanced magnetic resonance imaging (MRI) in experimental autoimmune encephalomyelitis, an animal model of multiple sclerosis. SJL/J mice were monitored by Gadopentate dimeglumine- (Gd-DTPA) and Gf-enhanced MRI after adoptive transfer of proteolipid-protein-specific T cells. Mean Gf intensity ratios were calculated individually for different CVO and correlated to the clinical disease course. Subsequently, the tissue distribution of fluorescence-labeled Gf as well as the extent of cellular inflammation was assessed in corresponding histological slices.',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 1024]
# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings[0], embeddings[1:])
print(similarities)
# tensor([[0.7649, 0.3279]])
The upcoming Performance > English Retrieval section will show that these results are quite solid, within 15% of commonly used Transformer-based encoder models like all-mpnet-base-v2.
SentenceTransformer
API Reference.SentenceTransformer.encode
API Reference.SentenceTransformer.similarity
API Reference.
Multilingual Similarity
from sentence_transformers import SentenceTransformer
# Download from the 🤗 Hub
model = SentenceTransformer("sentence-transformers/static-similarity-mrl-multilingual-v1", device="cpu")
# Run inference
sentences = [
'It is known for its dry red chili powder.',
'It is popular for dried red chili powder.',
'These monsters will move in large groups.',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 1024]
# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings, embeddings)
print(similarities)
# tensor([[ 1.0000, 0.8388, -0.0012],
# [ 0.8388, 1.0000, 0.0445],
# [-0.0012, 0.0445, 1.0000]])
This model only loses about 8% of performance compared to the popular but much slower multilingual-e5-small, as shown in the upcoming Performance > Multilingual Similarity section.
SentenceTransformer
API Reference.SentenceTransformer.encode
API Reference.SentenceTransformer.similarity
API Reference.
Matryoshka Dimensionality Truncation
To reduce the dimensionality of your calculated embeddings, you can simply pass the truncate_dim
parameter. This works for all Sentence Transformer models.
from sentence_transformers import SentenceTransformer
# Download from the 🤗 Hub
model = SentenceTransformer(
"sentence-transformers/static-retrieval-mrl-en-v1",
device="cpu",
truncate_dim=256,
)
# Run inference
sentences = [
'Gadofosveset-enhanced MR angiography of carotid arteries: does steady-state imaging improve accuracy of first-pass imaging?',
'To evaluate the diagnostic accuracy of gadofosveset-enhanced magnetic resonance (MR) angiography in the assessment of carotid artery stenosis, with digital subtraction angiography (DSA) as the reference standard, and to determine the value of reading first-pass, steady-state, and "combined" (first-pass plus steady-state) MR angiograms.',
'In a longitudinal study we investigated in vivo alterations of CVO during neuroinflammation, applying Gadofluorine M- (Gf) enhanced magnetic resonance imaging (MRI) in experimental autoimmune encephalomyelitis, an animal model of multiple sclerosis. SJL/J mice were monitored by Gadopentate dimeglumine- (Gd-DTPA) and Gf-enhanced MRI after adoptive transfer of proteolipid-protein-specific T cells. Mean Gf intensity ratios were calculated individually for different CVO and correlated to the clinical disease course. Subsequently, the tissue distribution of fluorescence-labeled Gf as well as the extent of cellular inflammation was assessed in corresponding histological slices.',
]
embeddings = model.encode(sentences)
print(embeddings.shape)
# [3, 256]
# Get the similarity scores for the embeddings
similarities = model.similarity(embeddings[0], embeddings[1:])
print(similarities)
# tensor([[0.7844, 0.3561]])
Third Party libraries
This model also works out of the box in various third party libraries, for example LangChain, LlamaIndex, Haystack, and txtai.
LangChain
# pip install langchain langchain_huggingface
from langchain_huggingface import HuggingFaceEmbeddings
model_name = "sentence-transformers/static-retrieval-mrl-en-v1"
model_kwargs = {'device': 'cpu'} # you can use 'truncate_dim' here
model = HuggingFaceEmbeddings(
model_name=model_name,
model_kwargs=model_kwargs,
)
LlamaIndex
# pip install llama-index llama-index-embeddings-huggingface
from llama_index.core import Settings
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
# Set up the HuggingFaceEmbedding class with the required model to use with llamaindex core.
model_name = "sentence-transformers/static-retrieval-mrl-en-v1"
device = "cpu"
embed_model = HuggingFaceEmbedding(
model_name=model_name,
device=device,
# truncate_dim=256, # you can use 'truncate_dim' here
)
Settings.embed_model = embed_model
Haystack
# pip install haystack sentence-transformers
from haystack.components.embedders import (
SentenceTransformersDocumentEmbedder,
SentenceTransformersTextEmbedder,
)
model_name = "sentence-transformers/static-retrieval-mrl-en-v1"
device = "cpu"
document_embedder = SentenceTransformersDocumentEmbedder(
model=model_name,
device=device,
# truncate_dim=256, # you can use 'truncate_dim' here
)
text_embedder = SentenceTransformersTextEmbedder(
model=model_name,
device=device,
# truncate_dim=256, # you can use 'truncate_dim' here
)
txtai
# pip install txtai sentence-transformers
from txtai import Embeddings
model_name = "sentence-transformers/static-retrieval-mrl-en-v1"
embeddings = Embeddings(path=model_name)
Performance
English Retrieval
After training, we've evaluated the final model sentence-transformers/static-retrieval-mrl-en-v1 on NanoBEIR (normal dimensionality and with Matryoshka dimensions) as well as on BEIR.
NanoBEIR
We've evaluated sentence-transformers/static-retrieval-mrl-en-v1 on NanoBEIR and plotted it against the inference speed computed on our hardware. For the inference speed tests, we calculated the number of computed query embeddings of the GooAQ dataset per second, either on CPU or GPU.
We evaluate against 3 types of models:
Attention-based dense embedding models, e.g. traditional Sentence Transformer models like
all-mpnet-base-v2
,bge-base-en-v1.5
, andgte-large-en-v1.5
.Static Embedding-based models, e.g.
static-retrieval-mrl-en-v1
,potion-base-8M
,M2V_base_output
, andglove.6B.300d
.Sparse bag-of-words model, BM25, often a strong baseline.
Click to expand BM25 implementation details
We relied on the highly efficient bm25s implementation, using
model.get_scores()
on tokens after tokenization and stemming with the EnglishPyStemmer
.
NOTE: Many of the attention-based dense embedding models are finetuned on the training splits of the (Nano)BEIR evaluation datasets. This gives the models an unfair advantage in this benchmark and can result in lower downstream performance on real retrieval tasks.
static-retrieval-mrl-en-v1 is purposefully not trained on any of these datasets.
Click to see a table with all values from the next 2 Figures
| Model | NanoBEIR NDCG@10 | CPU (sentences per second) | GPU (sentences per second) |
|---|---|---|---|
| zeta-alpha-ai/Zeta-Alpha-E5-Mistral | 0.6860 | 0.00* | 0.00* |
| Alibaba-NLP/gte-large-en-v1.5 | 0.6808 | 56.01 | 965.95 |
| Salesforce/SFR-Embedding-Mistral | 0.6800 | 0.00* | 0.00* |
| mixedbread-ai/mxbai-embed-large-v1 | 0.6567 | 79.83 | 1376.80 |
| BAAI/bge-large-en-v1.5 | 0.6592 | 80.94 | 1315.03 |
| intfloat/e5-mistral-7b-instruct | 0.6530 | 0.00* | 0.00* |
| Alibaba-NLP/gte-base-en-v1.5 | 0.6411 | 197.85 | 3142.94 |
| BAAI/bge-base-en-v1.5 | 0.6376 | 264.83 | 4363.04 |
| BAAI/bge-small-en-v1.5 | 0.6267 | 888.46 | 10159.97 |
| nomic-ai/nomic-embed-text-v1.5 | 0.6179 | 86.86 | 2843.03 |
| jinaai/jina-embeddings-v3 | 0.6174 | 0.55 | 3377.56 |
| BAAI/bge-m3 | 0.6054 | 80.63 | 1434.82 |
| sentence-transformers/all-mpnet-base-v2 | 0.5757 | 270.40 | 4043.13 |
| TaylorAI/gte-tiny | 0.5692 | 1752.26 | 17215.15 |
| sentence-transformers/all-MiniLM-L6-v2 | 0.5623 | 1739.31 | 16942.46 |
| mixedbread-ai/mxbai-embed-xsmall-v1 | 0.5557 | 1749.42 | 16773.76 |
| sentence-transformers/all-MiniLM-L12-v2 | 0.5533 | 909.72 | 9915.69 |
| sentence-transformers/static-retrieval-mrl-en-v1 | 0.5032 | 107419.51 | 97171.47 |
| bm25 | 0.4518 | 49706.77 | 49706.77 |
| minishlab/potion-base-8M | 0.4421 | 124029.91 | 122384.10 |
| minishlab/potion-base-4M | 0.4225 | 123082.88 | 123612.54 |
| minishlab/M2V_base_glove | 0.4077 | 142173.77 | 146154.73 |
| minishlab/M2V_base_glove_subword | 0.3914 | 127426.83 | 131412.56 |
| minishlab/M2V_base_output | 0.3851 | 84191.93 | 85738.36 |
| minishlab/potion-base-2M | 0.3666 | 128994.27 | 122358.16 |
| sentence-transformers/glove.6B.300d | 0.3293 | 76519.74 | 62782.23 |
| sentence-transformers/glove.840B.300d | 0.2899 | 86348.98 | 75350.36 |
*
: For the 7B LLMs, we did not do inference experiments as their inference speed would be indistinguishable from 0 in the Figures.- We performed experiments to determine the optimal batch size for each model.
GPU
CPU
We can draw some notable conclusions from these figures:
static-retrieval-mrl-en-v1
outperforms all other Static Embedding models, like GloVe or Model2Vec.static-retrieval-mrl-en-v1
is the only Static Embedding model to outperform BM25.static-retrieval-mrl-en-v1
is- 87.4% as performant as the commonly used
all-mpnet-base-v2
, - 24x faster on GPU,
- 397x faster on CPU.
- 87.4% as performant as the commonly used
static-retrieval-mrl-en-v1
is quicker on CPU than on GPU: This model can run extraordinarily quickly everywhere, including consumer-grade PCs, tiny servers, phones, or in-browser.
Matryoshka Evaluation
Additionally, we experimented with the results on NanoBEIR performance when we performed Matryoshka-style dimensionality reduction by truncating the output embeddings to a lower dimensionality.
These findings show that reducing the dimensionality by e.g. 2x only has a 1.47% reduction in performance (0.5031 NDCG@10 vs 0.4957 NDCG@10), while realistically resulting in a 2x speedup in retrieval speed.
Multilingual Similarity
We've additionally evaluated the final sentence-transformers/static-similarity-mrl-multilingual-v1 model on 5 languages which have a lot of benchmarks across various tasks on MTEB.
We want to reiterate that this model is not intended for retrieval use cases. Instead, we evaluate on Semantic Textual Similarity (STS), Classification, and Pair Classification. We compare against the excellent and small multilingual-e5-small model.
Across all measured languages, static-similarity-mrl-multilingual-v1 reaches an average 92.3% for STS, 95.52% for Pair Classification, and 86.52% for Classification relative to multilingual-e5-small.
To make up for this performance reduction, static-similarity-mrl-multilingual-v1 is approximately ~125x faster on CPU and ~10x faster on GPU devices than multilingual-e5-small. Due to the super-linear nature of attention models, versus the linear nature of static embedding models, the speedup will only grow larger as the number of tokens to encode increases.
Matryoshka Evaluation
Lastly, we experimented with the impacts on English STS on MTEB performance when we did Matryoshka-style dimensionality reduction by truncating the output embeddings to a lower dimensionality.
As you can see, you can easily reduce the dimensionality by 2x or 4x with minor (0.15% or 0.56%) performance hits. If the speed of your downstream task or your storage costs are a bottleneck, this should allow you to alleviate some of those concerns.
Conclusion
This blogpost described all of the steps that we undertook from ideation to finished models, in addition to details regarding usage and evaluation of the two resulting models: static-retrieval-mrl-en-v1 and static-similarity-mrl-multilingual-v1.
The evaluations show that:
- Static Embedding-based models can exceed 85% of the performance of common attention-based dense models,
- Static Embedding-based models are realistically 10x to 25x faster on GPUs and 100x to 400x faster on CPUs than common efficient alternatives like all-mpnet-base-v2 and multilingual-e5-small. This speedup only grows larger with longer texts.
- Training with a Matryoshka Loss allows significant preservation of downstream performance:
- 4x smaller gives a 0.56% performance decrease by static-similarity-mrl-multilingual-v1 for English STS, and
- 2x smaller gives a 1.47% performance decrease by static-retrieval-mrl-en-v1 for English Retrieval.
Should you need an efficient CPU-only dense embedding model for your retrieval or similarity tasks, then static-retrieval-mrl-en-v1 and static-similarity-mrl-multilingual-v1 will be extremely performant solutions at minimal costs that get surprisingly close to the attention-based dense models.
Next Steps
Try it out! If you already use a Sentence Transformer model somewhere, feel free to swap it out for static-retrieval-mrl-en-v1 or static-similarity-mrl-multilingual-v1. Or, better yet: train your own models on data that is representative for the task and language of your interest.
Furthermore, some questions remain about the trained models:
Because Static Embedding-based models aren't bottlenecked by positional embeddings or superlinear time complexity, they can have arbitrarily high maximum sequence lengths. However, at some point the law of large numbers is likely to "normalize" all embeddings for really long documents, such that they aren't useful anymore.
More experiments are required to determine what a good cutoff point is. For now, we leave the maximum sequence length, chunking, etc. to the user.
Additionally, there are quite a few possible extensions that are likely to improve the performance of this model, which we happily leave to other model authors. We are also open to collaborations:
- Hard Negatives Mining: Search for similar, but not quite relevant, texts to improve training data difficulty.
- Model Souping: Combining weights from multiple models trained in the same way with different seeds or data distributions.
- Curriculum Learning: Train on examples of increasing difficulties.
- Guided False In-Batch Negatives Filtering: Exclude false negatives via an efficient pre-trained embedding model.
- Seed Optimization for the Random Weight Initialization: Train the first steps with various seeds to find one with a useful weight initialization.
- Tokenizer Retraining: Retrain a tokenizer with modern texts and learnings.
- Gradient Caching: Applying GradCache via
CachedMultipleNegativesRankingLoss
allows for larger batches, which often result in superior performance. - Model Distillation: Rather than training exclusively using supervised training data, we can also feed unsupervised data through a larger embedding model and distil those embeddings into the static embedding-based student model.
Acknowledgements
I would like to thank Stéphan Tulkens and Thomas van Dongen of The Minish Lab for bringing Static Embedding models to my attention via their Model2Vec work. Additionally, I would like to thank Vaibhav Srivastav and Pedro Cuenca for their assistance with this blogpost, and Antoine Chaffin for brainstorming the release checkpoints.
Lastly, a big thanks to all researchers working on embedding models, datasets, and open source Python packages. You strengthen the industry, and I build on your shoulders. One day, I hope you build on mine.