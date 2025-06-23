---
title: "LeMaterial: an open source initiative to accelerate materials discovery and research"
description: ""
summary: ""
pubDate: "Tue, 10 Dec 2024 00:00:00 GMT"
source: "Hugging Face Blog"
url: "https://huggingface.co/blog/lematerial"
thumbnail: ""
---

LeMaterial: an open source initiative to accelerate materials discovery and research
Today, we are thrilled to announce the launch of LeMaterial, an open-source collaborative project led by Entalpic and Hugging Face. LeMaterial aims to simplify and accelerate materials research, making it easier to train ML models, identify novel materials and explore chemical spaces. ⚛️🤗
As a first step, we are releasing a dataset called LeMat-Bulk
, which unifies, cleans and standardizes the most prominent material datasets, including Materials Project, Alexandria and OQMD — giving rise to a single harmonized data format with 6.7M entries and 7 materials properties.
LeMaterial is standing on the shoulders of giants and we are building upon incredible projects which have been instrumental in the development of this initiative: Optimade, Materials Project, Alexandria and OQMD, and more to come. Please credit them accordingly when using LeMaterial.
Why LeMaterial?
The world of materials science, at the intersection of quantum chemistry and machine learning, is brimming with opportunity — from brighter LEDs, to electro-chemical batteries, more efficient photovoltaic cells and recyclable plastics, the applications are endless. By leveraging machine learning (ML) on large, structured datasets, researchers can perform high-throughput screening and testing of new materials at unprecedented scales, significantly accelerating the discovery cycle of novel compounds with desired properties. In this paradigm, data becomes the essential fuel powering ML models that can guide experiments, reduce costs, and unlock breakthroughs faster than ever before.
This field is fueled by very complete datasets such as Materials Project, Alexandria and OQMD, all open-source and under a CC-BY-4.0 license. However, those datasets vary in format, parameters, and scope, presenting the following challenges:
- Dataset integration issues (eg. inconsistent formats or field definitions, incompatible calculations)
- Biases in dataset composition (for eg. Materials Project's focus on oxides and battery materials)
- Limited scope (eg. NOMADs focus on quantum chemistry calculations rather than material properties)
- Lack of clear connections or identifiers between similar materials across different databases
This fragmented landscape makes it challenging for researchers in AI4Science and materials informatics to leverage existing data effectively. Whether the application involves training foundational ML models, constructing accurate phase diagrams, identifying novel materials or exploring the chemical space effectively, there is no simple solution. While efforts like Optimade standardize structural data, they don't address discrepancies in material properties or biases in dataset scopes.
LeMaterial addresses these challenges by unifying and standardizing data from three major databases — Materials Project, Alexandria and OQMD — into a high-quality resource with consistent and systematic properties. The elemental composition treemap below highlights the value of this integration, showcasing how we increase the scope of existing datasets, like Materials Project, which are focused on specific material types, such as battery materials (Li, O, P) or oxides.
Materials Project and LeMat-BulkUnique treemap
Achieving a clean, unified and standardized dataset
LeMat-Bulk
is more than a large-scale merged dataset with a permissive license (CC-BY-4.0). With its 6.7M entries with consistent properties, it represents a foundational step towards creating a curated and standardized open ecosystem for material science, designed to simplify research workflows and improve data quality. Below is a closer view of what is looks like. To interactively browse through our materials, check out the Materials Explorer space, built using MP Dash components.
| Release | Description & Value | Date |
|---|---|---|
| v.1.0 |
|
Dec. 10, 2024 |
| v.1.1 |
|
Q1 2025 |
| Future releases | Q2 2025 |
We offer different datasets and subsets, enabling tailored workflows for researchers depending on their needs (consistent calculations, deduplicating materials, or comprehensive exploration):
- Compatibility: these subsets only provides calculations which are compatible to mix. This is available in 3 functionals today (PBE, PBESol and SCAN)
- Non-compatible: this subset provides all materials not included in the compatibility subsets.
- LeMat-BulkUnique : this dataset split provides de-duplicated material using our structure fingerprint algorithm. It is available in 3 subsets, for PBE, PBESol, and SCAN functionals. More Details on the dataset can be found on 🤗Hugging Face
Integrating a well-benchmarked materials fingerprint
Beside building this standardized dataset, one of the key contribution of LeMaterial is to propose a definition of a material fingerprint through a hashing function that assigns a unique identifier to each material.
Current approaches to identifying a material as novel relative to a database have predominantly relied on similarity metrics, which necessitate a combinatorial effort to screen the existing database for novelty. To provide faster novelty detection in a dataset, Entalpic introduces a hashing method to compute the fingerprint of a material.
Above is a breakdown of the fingerprinting. We use a bonding algorithm (e.g. EconNN) on the crystal structure to extract a graph, on which we then compute the Weisfeiler-Lehman algorithm to get a hash. This hash is combined with composition and space group information to create the material fingerprint.
Our fingerprinting approach offers several benefits:
- Quickly identifying whether a material is novel or already catalogued.
- Ensuring the dataset is free from duplicates and inconsistencies.
- Allowing to connect materials between datasets.
- Supporting more efficient calculations for thermodynamic properties, such as energy above the hull.
Below lies a comparison of our hash function with the StructureMatcher of Pymatgen, to find all duplicates of a dataset. The experiment was run on two datasets having very different structures.
When using our method, almost all of the task time was dedicated to calculating material hashes; the follow-up comparison step is negligible time-wise. When using StructureMatcher
, the vast majority of the task time was spent comparing pairs of structures; building said structures is negligible time-wise.
| Dataset | Number of structures | Task time for the hash function (parallelized on 12 CPUs) | Task time for StructureMatcher (parallelized on 64 CPUs) |
|---|---|---|---|
| Carbon-24 | 10,153 | 100 seconds | 17 hours |
| MPTS-52 | 40,476 | 330 seconds | 4.9 hours |
Additionally, we are planning on releasing a set of well-curated benchmarks to evaluate the validity of our hashing function. For instance, we investigated:
- If distinct materials lead to different hashes based on material identification tags across existing databases
- Whether adding small noises or applying symmetry operations to a material leads to the same hash
- If materials sharing the same hash, across or within databases, could indeed be the same material — with manual and DFT checks
- How fast and accurate our hash is compared to Pymatgen's StructureMatcher on existing databases
🤗 Call to the community: our aim is not to position this fingerprint method as the single solution to de-duplicate materials databases and find novel materials, but rather to foster discussion around this question. One current limitation of this hashing technique is that it does not cover disordered structures; we would like to push the community towards finding a consensus, while proposing a relatively simple and efficient fingerprint method in the meantime.
LeMaterial in Action: applications and impact
In the longer term, LeMaterial aims to be a community-driven initiative that gathers large & curated datasets, machine learning models, handy toolkits, etc. It is designed to be practical and flexible, enabling a wide range of applications, such as:
- Exploring extended phase diagrams (Link to our phase diagram explorer, built thanks to various open-source tools from Materials Project), constructed with a broader dataset, to analyze chemical spaces in greater detail. Combining larger datasets means that we can provide a finer resolution of material stability in a given compositional space:
Experimental phase diagram of Ti, Bb, Sn from this research paper
LeMat-Bulk phase diagram for Sn, Ti, Nb, built thanks to Pymatgen, Crystal Toolkit (Materials Project tools)
Compare materials properties across databases and functionals: by providing researchers with data across DFT functionals, and by linking materials via our materials fingerprint algorithm we are able to establish and connect materials properties calculated via different parameters. This gives researchers insight into how functionals might behave and differ across compositional space.
Determining if a material is novel. Our hashing function allows researchers to quickly assess whether a material is unique or a duplicate, streamlining the discovery process and avoiding redundant calculations.
Example 1: Our fingerprint method identified the following Alexandria entries (
agm002153972
,agm002153975
) as potentially being the same material — having the same hash. When we did a relaxation on the higher energy entry, the material relaxed to the lower energy configuration.Lower energy structure
Higher energy structure
Example 2: applying our hash to another dataset (AIRSS) that is often used in training generative models, we found the following materials with the same hash.
Unit cells of materials sharing the same fingerprint
To an untrained eye these visually appear like very different materials. However when we replicate the lattice we quickly identify that they are quite similar:
It is important to note here that Pymatgen's StructureMatcher identified these two unit cells as different materials, when they are indeed the exact same structures. Here, our hashing algorithm was able to identify them as indeed the same.Supercells of materials sharing the same fingerprint
Training predictive ML models. We can also train machine learning interatomic potentials like EquiformerV2 on
LeMat-Bulk
. These models should benefits from its scale and data quality and the removal of bias across compositional space, and it would be interesting to assess the benefits of this new dataset. An example of how to incorporate LeMaterial with Fairchem can be found in Colab. We are currently in process of training an EquiformerV2 model using this dataset — stay tuned 💫
Take-aways
As a community, we often place a lot of value in the quality of these large-scale open-source databases. However the lack of standardization makes utilizing multiple dataset a huge challenge. LeMaterial offers a solution that unifies, standardizes, performs extra cleaning and validation efforts on existing major data sources. This new open-science project is designed to accelerate research, improve quality of ML models, and make materials discovery more efficient and accessible.
We are just getting started — we know there are still flaws and improvements to be made — and would thus love to hear your feedback! So please reach out if you are interested to contribute to this open-source initiative. We would be excited to continue expanding LeMaterial with new datasets, tools, and applications — alongside the community! ⚛️🤗
We extend our heartfelt thanks to Zachary Ulissi and Luis Barroso-Luque (Meta), and Matt McDermott (Newfound Materials, Inc.) for their valuable feedback regarding is initiative.
Citations
By downloading content from LeMaterial, you agree to accept the Creative Commons Attribution 4.0 license implying that content may be copied, distributed, transmitted, and adapted, without obtaining specific permission from LeMaterial, provided proper attribution is given to LeMaterial.
If you use the LeMaterial as a resource in your research, please cite the citation section from our data-card (paper to come).
CC-BY-4.0 (license used for Materials Project, Alexandria, OQMD) requires proper acknowledgement. Thus, if you use materials data which include (”mp-”) in the immutable_id, please cite the Materials Project. If you use materials data which include (”agm-”) in the immutable_id, please cite Alexandria, PBE or Alexandria PBESol, SCAN. If you use materials data which include (”oqmd-”) in the immutable_id, please cite OQMD. Finally, if you make use of the Phase Diagram for visualization purposes, or the crystal viewer in the Materials Explorer, please acknowledge Crystal Toolkit.
To learn more about LeMaterial and get involved: