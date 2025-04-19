---
title: "Cryptography 101: Zero Knowledge Proofs (Part 1)"
date: "2024-06-11"
author: "Frank Mangone"
tags:
  ["Cryptography", "Zero Knowledge Proofs", "Mathematics", "Commitment Scheme"]
description: "We take a leap into the world of zero-knowledge proofs by exploring one of the many ZKP protocols out there: Bulletproofs"
readingTime: "14 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

It’s finally time for some zero knowledge proofs!

Previously in this series, we outlined [what they are](/en/blog/cryptography-101/protocols-galore/#zero-knowledge-proofs). This time around though, we’ll be more thorough in our definition, and look at a more advanced example.

The general idea of a ZKP is to convince someone about the truth of a statement regarding some information, without **revealing** said information. Said statement could be of different natures. We could want to prove:

- knowledge of a discrete logarithm (the [Schnorr protocol](/en/blog/cryptography-101/protocols-galore/#the-schnorr-protocol))
- a number is in a certain range
- an element is a member of a set

among others. Normally, each of these statements requires a different **proof system**, which means that specific protocols are required. This is somewhat impractical — and it would be really nice if we could **generalize** knowledge proofs.

So our plan will be the following: we’ll look at a ZKP technique, called **Bulletproofs**. We’ll see how they solve a **very specific** problem, and in the next few articles, evaluate how almost the same thing can be achieved in a more general way.

We’ll just focus on the simple, unoptimized version (it’s complicated enough!). And if this article isn’t enough to satiate your curiousness, either the [original paper](https://eprint.iacr.org/2017/1066.pdf) or [this article](https://cathieyun.medium.com/building-on-bulletproofs-2faa58af0ba8) here might be what you’re looking for.

Let’s start with a soft introduction to the topic, before jumping into the math.

---

## Zero Knowledge Basics

When we talk about proving validity of statements, the broader family of techniques is called [proofs of knowledge](https://en.wikipedia.org/wiki/Proof_of_knowledge). In these types of protocols, there are usually two actors involved: a **prover**, and a **verifier**.

And there are also two key elements: a **statement** we want to prove, and a **witness**, which is a piece of information that allows to **efficiently check** that the statement is true. Something like this:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-1/verification.webp" 
    alt="Diagram of general verification process of ZKPs"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Only that this is not the full story!

If you recall from our brief look at the [Schnorr protocol](/en/blog/cryptography-101/protocols-galore/#the-schnorr-protocol), we saw how there was some back and forth communication between the prover and the verifier. And there’s good reason for this: the verifier provides an **unpredictable** piece of information to the prover. What this achieves is making it **extremely hard** to produce false proofs — and very simple to produce valid proofs, so long as the prover is **honest**. This “wildcard” factor is typically called a **challenge**.

### A Simple Example

To wrap our heads around this idea, here’s a very simple exercise: imagine Alice places a **secret sequence** of poker cards face down on a table. Bob, who is sitting across the table, wants to check that Alice knows said secret sequence. What can he do about it?

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-1/face-down-cards.webp" 
    alt="Face down cards"
    width="480"
  />
</figure>

Well, he could ask “**tell me what card is in the fourth position**”. If Alice indeed knows the sequence, she can confidently answer “7 of spades”, and Bob could simply look at the face down card and check that it matches. Bob has provided a **challenge** by selecting a card, and it’s only through **honest knowledge** of the sequence that Alice can provide correct information. Otherwise, she’d have to guess — and it’s **unlikely** that she’ll say the correct card.

> Granted, this is not **zero knowledge**, because parts of the sequence are revealed!

Adding this challenge into the mix, we get a more complete picture:

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-1/verification-2.webp" 
    alt="Updated diagram of general verification process of ZKPs"
    title="[zoom]"
    className="bg-white"
  />
</figure>

The idea is that the prover makes a **commitment** to their information, before knowing the verifier’s input (in our example, Alice commits by placing the cards face down)— and this sort of prevents them from cheating.

> Formally, the structure we just described is typical of [Sigma protocols](https://en.wikipedia.org/wiki/Proof_of_knowledge#Sigma_protocols). You may also see the term [Public Coin](https://en.wikipedia.org/wiki/Interactive_proof_system#:~:text=In%20a%20public%20coin%20protocol%2C%20the%20random%20choices%20made%20by%20the%20verifier%20are%20made%20public.%20They%20remain%20private%20in%20a%20private%20coin%20protocol.) verifier, which just means that the random choice of the verifier is made public. You know, just to avoid confusions!

To finish our brief introduction, here are the two key properties that proofs of knowledge should suffice:

- **Completeness**: An honest prover with an honest statement can convince a verifier about the validity of the statement.
- **Soundness**: A prover with a false statement should not be able to convince a verifier that the statement is true. Or really, there should be very low probability of this happening.

Now, if we add the condition that the proof reveals nothing about the statement, then we have ourselves a **zero knowledge proof**. We won’t go into formally defining what “revealing nothing” means, but there are [some resources](https://www.cs.cornell.edu/courses/cs6810/2009sp/scribe/lecture18.pdf) that explain the idea if you want to dig deeper.

With this, the intro is over. Turbulence ahead, hang tight.

---

## Range Proofs

As previously mentioned, a crucial element we need to decide upon is **what** we want to prove. For example, in the case of the [Schnorr protocol](/en/blog/cryptography-101/protocols-galore/#the-schnorr-protocol), we want to prove knowledge of the **discrete logarithm** of a value.

Another statement we could wish to prove is that some value lies in a **range**. This may be useful in systems with **private balances**, where it’s important to prove that after making a transaction, the remaining balance is **nonnegative** (positive, or zero). In that case, we only need to prove that said value lies in a **range**:

$$
b \in [0, 2^{n-1} - 1]
$$

And this is where techniques like **Bulletproofs** come into play. Now… How on Earth do we go about proving this?

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-1/hmmm.webp" 
    alt="Spongebob thinking"
    title="Hmmmmm..."
    width="625"
  />
</figure>

### Switching Perspectives

Think of a number $v$ represented by a **byte** (8 bits). Then, this number can only be in the range of $0$ to $255$ ($2^8 - 1$). So, if we can prove the statement:

::: big-quote
There’s a valid 8-bit representation of v
:::

Then we have constructed a knowledge proof that $v$ lies between $0$ and $255$. And that’s all we’ll be doing, at its core.

<figure>
  <img
    src="/images/cryptography-101/zero-knowledge-proofs-part-1/bit-representation.webp" 
    alt="Bit representation of the number 147: 10010011"
    title="[zoom] Binary representation of 147. It only takes 8 bits!"
    className="bg-white"
  />
</figure>

However, we must turn this idea into a set of **mathematical constraints** that represent our statement.

To get us started, let’s denote the bits of $v$ by the values $a_{l,0}$, $a_{l,1}$, $a_{l,2}$, and so on — with $a_{l,0}$ being the least significant bit. This means that the following equality holds:

$$
a_{l,0}2^0 + a_{l,1}2^1 + a_{l,2}2^2 + ... a_{l,n-1}2^{n-1} = v
$$

In order to avoid long and cumbersome expressions, let’s introduce some **new notation**. Think of our number $v$ represented as a **binary vector**, each component being a **bit**:

> Copy in progress!
