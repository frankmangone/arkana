---
title: "Cryptography 101: STARKs"
date: "2024-08-20"
author: "frank-mangone"
thumbnail: "/images/cryptography-101/starks/pikachu.webp"
tags: ["Cryptography", "Zero Knowledge Proofs", "Mathematics", "Scalability"]
description: "Following from SNARKs, we now explore another type of knowledge proofs tailored for scalability"
readingTime: "17 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

We spent a whole four articles talking about [SNARKs](/en/blog/cryptography-101/zero-knowledge-proofs-part-2) — so by now, we should be very much familiar with the important ideas behind those frameworks. Mainly, the **succinctness** (colloquially, **shortness**) of the proofs is very attractive. There’s also the fact that they are **very general** because they rely on [arithmetic circuits](/en/blog/cryptography-101/arithmetic-circuits) to construct statements.

But, they have a couple tiny problems that we may need to worry about. Trying to avoid these problems is one of the motivations to delve into the topic for today’s article: **STARKs**.

### Disclaimer

I’ll avoid going into too much detail in some of the ideas behind STARKs here. It’s gonna be pretty wild as it stands... But I feel like it’s a good starting point. Think of this article as a solid foundation for you to continue exploring on your own, as always!

---

## What is a STARK?

This time, the acronym stands for **S**calable **T**ransparent **AR**guments of **K**nowledge.

**Scalable**? **Transparent**? What do those mean? Let’s do a quick comparison exercise to better understand these concepts.

### SNARKs vs STARKs

I guess there are two main points to consider here. First, there’s the fact that **SNARKs** require a **trusted setup**.

> As a reminder, a trusted setup is one where some actor needs to generate some public parameters, and discard a **secret value** in the process. If said secret value is not discarded, then they could craft false proofs at any time, which is certainly a big risk!

Trusted setups may be done with the utmost of cares, but still, there’s always the **lingering possibility** that the secret values **were not discarded**, which really undermines whatever protocol we’ve created. Because of this, they are sometimes even called **toxic waste**.
