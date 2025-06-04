---
title: 'Cryptography 101: STARKs'
date: '2024-08-20'
author: frank-mangone
thumbnail: /images/cryptography-101/starks/state-transition.webp
tags:
  - cryptography
  - zeroKnowledgeProofs
  - mathematics
  - polynomials
  - scalability
  - stark
description: >-
  Following from SNARKs, we now explore another type of knowledge proofs
  tailored for scalability
readingTime: 17 min
mediumUrl: 'https://medium.com/@francomangone18/cryptography-101-starks-df79507f98ea'
contentHash: 5019f60c249497f8671bf69a053a7141193c67fb30f718d013869fb30bf8fbc5
supabaseId: df59d598-c001-4768-9f45-7ab3c7200ff2
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

In contrast, **Transparent** protocols require **no setup**. Consequently, they eliminate the silent threat posed by trusted setups. Sounds interesting, right?

On the other hand, there’s the matter of **scalability**, which is a term we haven’t even mentioned when talking about SNARKs. There’s something we didn’t discuss about them: how does a verifier know **what** to verify?

The answer is that they are allowed to **read the arithmetic circuit** being used. You can imagine how this takes **increasing time** as the circuit gets larger — in fact, it takes **linear time**. And circuits can get **really large**. So this can be a big **no no**.

<figure>
  <img
    src="/images/cryptography-101/starks/bugs-no.gif" 
    alt="Bugs bunny meme"
    width="220"
  />
</figure>

**STARKs** attempt to alleviate this problem by taking a different approach. Computations are not modeled as **arithmetic circuits**, but as a **state transition function** instead, and this allows **faster verification time** in the right circumstances. Let’s zoom in on that.

---

## State Transition Functions

All in all, arithmetic circuits are just one way to represent a **computation**. There are **other strategies** to achieve the same purpose.

Let’s imagine that we have some computation that can be represented as a series of **steps**. You start from some **initial state**, and apply a **single function** over and over, until you reach a **final state**. Like this:

<figure>
  <img
    src="/images/cryptography-101/starks/state-transition.webp" 
    alt="Depiction of state transitioning"
    title="[zoom]"
    className="bg-white"
  />
</figure>

The entire computation is driven by this single function — this is, a **state transition function**. Nothing stops us from writing an **arithmetic circuit** to represent the same computation — but notice that such a circuit would be much larger than the state transition function, which only represents a **step**. In consequence, reading the former takes **much more time** than reading the latter.

> And this is the reason why STARKs have **scalable** in their acronym: verifiers can run in **sublinear time**.

So, what is this state transition function, formally? It’s simply a function of this form:

$$
f: {\mathbb{F}_p}^w \rightarrow {\mathbb{F}_p}^w
$$

Where the state is represented by a **vector** of length $w$, which is of course made up of elements from some finite field. Each state is calculated from the previous one:

$$
S_{n+1} = f(S_n)
$$

All we care about is checking that a computation is **correct**. Or, referring back to our [analysis on Plonk](/en/blog/cryptography-101/zero-knowledge-proofs-part-2/#revisiting-circuits), checking that a **computation trace** suffices a **set of constraints**. In this case, the constraint is always given by the same **state transition function**!

Our computation trace will look like a **table** with $w$ columns and $T$ rows, which represent all the states we go through:

|                       | $x_0$ | $x_1$ |
| --------------------- | ----- | ----- |
| initial state ($S_0$) | 1     | 1     |
| step 1 ($S_1$)        | 2     | 3     |
| step 2 ($S_2$)        | 5     | 8     |
| step 3 ($S_3$)        | 13    | 21    |
| step 4 ($S_4$)        | 34    | 55    |
| step 5 ($S_5$)        | 89    | 144   |

> You might recognize this — it’s the **Fibonacci sequence**! We can keep applying the same state transition function over and over to keep generating numbers in the sequence.

### Encoding the Computation

Of course, the next step has to do with **encoding** this trace, so that later a verifier can check that the constraints — given by the state transition function — hold. The process of doing so is called **arithmetization**.

> In Plonk, we also performed an arithmetization. The specific technique is actually called [PLONKish arithmetization](https://nmohnblatt.github.io/zk-jargon-decoder/definitions/plonkish_arithmetization.html).

To encode this transition of states, we’ll use a technique called **Arithmetic Intermediate Representation**, or **AIR** for short. This fancy-named algorithm works as a **two-step process**:

- Encoding each column of the trace as a polynomial.
- Constructing **constraint polynomials**.

At this point in the series, we’re very much acquainted with the first step. All it takes is for us to assign the values in each row to some **index** input value $t$ (that represents the step) like this:

$$
T_i(t) = S_i^{(t)}
$$

This is, the $i-th$ component of the state, at step $t$

> As in SNARKs, the step $t$ is not really an integer, but a **root of unity**! So, it really belongs to the set:

$$
t = \{1, \omega, \omega^2, \omega^3, ..., \omega^{k-1}\}
$$

Naturally, we’ll obtain $w$ polynomials, one for each column — they are called the **trace polynomials** (hence the use of $T$ to denote them). And of course, we obtain them via [interpolation](/en/blog/cryptography-101/polynomials/#interpolation).

The second part involves encoding the state transition function itself. Upon closer inspection, we’ll see that it’s composed of $w$ **individual functions**, one for each component of the state:

$$
S_{n+1} = f(S_n) = (f_1(S_n), f_2(S_n), f_3(S_n), ..., f_w(S_n))
$$

Each of these function components needs to be written as a **constraint**, using the **trace polynomials**. Let’s examine our Fibonacci example as an exercise. It’s easy to see that the function can be expressed as:

$$
\left\{\begin{matrix}
f_1(x_0, x_1) = x_0 + x_1
\\
\\ f_2(x_0, x_1) = x_0 + 2x_1
\end{matrix}\right.
$$

Based on this, we can define these polynomials, which should evaluate to $0$ at the **roots of unity**:

$$
\left\{\begin{matrix}
C_0(X) = T_0(\omega X) - T_1(X) - T_0(X)
\\
\\ C_1(X) = T_0(\omega X) - 2T_1(X) - T_0(X)
\end{matrix}\right.
$$

> Remember that multiplying by $\omega$ moves us to the next step!

So, if a verifier is able to query for the values of the trace polynomials at $t$ and $\omega t$, they should be able to check that the expressions really evaluate to $0$, which ensures that the computation **suffices the state transition function**!

If a verifier **had** these constraint polynomials, they could simply run the check mentioned above. But they **never really get** their hands on them, for reasons we’ll discuss later. What we know for now is that the constraint polynomials can be derived from the trace polynomials — so let’s imagine that this is done to reduce redundancy, for now.

Okay, we’ve got our encoded trace. There’s some extra manipulation that needs to happen — but we’ll talk about that later. Much like Plonk, the **encoding** is necessary for us to create a framework in which a verifier can query some values and do some checks.

Does this ring any bells? Yeah, we’ll need an [Interactive Oracle Proof](/en/blog/cryptography-101/zero-knowledge-proofs-part-2/#interactive-oracle-proofs).

<figure>
  <img
    src="/images/cryptography-101/starks/math-in-the-air.webp" 
    alt="Meme of numbers appearing in mid air"
    width="250"
  />
</figure>

---

## Back to IOPs

Back when we explored Plonk, we saw how [Interactive Oracle Proofs](/en/blog/cryptography-101/zero-knowledge-proofs-part-2/#interactive-oracle-proofs) (IOPs) were a way for a verifier to query for specific evaluations of polynomials — or requesting **openings** at specific points. With said openings, they can verify some type of statement around said polynomials.

> For instance, in Plonk, we saw how we could build IOPs for checking that a polynomial is zero on a given set.

We’ll do mostly the same process. The idea is that a verifier doesn’t need to check every transition constraint, but can be satisfied with just checking a **few random samples**, for which they will request openings.

Although, for STARKs, we won’t be using the same IOP as we did for Plonk. In its place, we’ll be using something called **Fast Reed-Solomon Interactive Oracle Proof of Proximity**, or **FRI** for short.

<figure>
  <img
    src="/images/cryptography-101/starks/profuse-sweating.webp" 
    alt="Key from Key & Peele sweating in one of their sketches"
    title="*Profuse sweating*"
  />
</figure>

Good news, though — this fancy-named technique uses one main ingredient, which we’ve already covered in the series: [Merkle trees](/en/blog/cryptography-101/hashing/#merkle-trees)!

Interactive Oracle Proofs usually require a **commitment scheme**. So we’ll first describe how the commitment scheme for FRI works.

Given some polynomial $P(X)$, we can choose some **evaluation domain** $D$, which is just a set of values of $X$ which we’ll use to produce values of $P$:

$$
D = \{d_0, d_1, d_2, d_3, ...\} \subset \mathbb{F}_p
$$

Evaluating $P(X)$ in $D$ simply yields another set of values, namely:

$$
P(D) = \{P(d_0), P(d_1), P(d_2), ...\} \subset \mathbb{F}_p
$$

This set is sometimes referred to as a **Reed-Solomon codeword**. And what we’ll do with it, is **put it into a Merkle tree**. By calculating the root of the tree, what we obtain is essentially a **commitment** to all these evaluations of $P(X)$. Neat!

Using a Merkle tree structure allows us to perform a back-and-forth (sigma) protocol that allows a verifier to ask for values of the secret polynomial, and check that they are correct (or at least, consistent with the commitment). This is done via [Merkle proofs](/en/blog/cryptography-101/hashing/#the-merkle-tree-solution), sometimes also referred to as **authentication paths**.

### Why Merkle Trees?

When comparing this to other commitment schemes, such as the [KZG scheme](/en/blog/cryptography-101/commitment-schemes-revisited), we can see that there are some key differences that align well with our necessities.

The first key difference relates to **transparency**. You see, Merkle-tree-based commitment schemes require **no setup**. When compared to other methods, it alleviates the possibility of secret parameters not being discarded, which is a threat to the security of any proof system.

Secondly, we must consider **scalability** and **efficiency**. Merkle trees are very efficient when handling **large amounts of data** — proofs are logarithmic in size due to the tree structure as [we’ve previously mentioned](/en/blog/cryptography-101/hashing/#the-merkle-tree-solution). Schemes such as KZG are **linear** to the number of inputs, making their scalability not so good. Plus, the committed data are simply polynomial evaluations on a finite field — which are inexpensive operations when compared with elliptic curve group operations, used by KZG.

We could also study the **cryptographic assumptions** around our method. Let’s just say that the main ingredient for Merkle-tree-based structures are **hashing functions**, in contrast to [pairings](/en/blog/cryptography-101/pairings) in the case of KZG. It’s not currently known how the security of pairing-based methods will evolve with the advent of quantum computing (more on this in [later articles](/en/blog/wtf-is/quantum-computing)!), while hashing functions are thought to be more robust in that setting.

Alright, sorry for the information dump! The **TL;DR** of this is:

::: big-quote
We use Merkle trees as our commitment scheme because its suitable for our use-case, for transparency, scalability, and efficiency reasons.
:::

There’s more to FRI, though. Merkle trees are just one piece of the puzzle. For now, let’s go back to our polynomials.

---

## Back to Encoding

Now that we know how a verifier would check the correctness of a computation in the context of **STARKs**, and how polynomial values are committed, we could devise a **first iteration** of a proof system with just these pieces. It would work like this:

- the prover commits to the trace polynomials
- the verifier reads the state transition function, and then requests openings (through the IOP) to check that the constraints hold

> Oh, if only it was that simple!

Let’s see how a prover might **cheat** in such a framework. Fun times ahead.

<figure>
  <img
    src="/images/cryptography-101/starks/hac.webp" 
    alt="Hac meme"
  />
</figure>

Suppose we’re a malicious prover, meaning that we want to convince a verifier that an **invalid trace** is correct. And let’s say our trace has $T$ steps.

For whatever reason, let’s say we manipulate the trace at some step $t$ — making it so there’s a **single invalid state transition**, while all the rest are correct. **How likely** is a verifier to query **that** particular state transition?

It’s pretty obvious that the answer is that they have a $1$ in $T$ probability of querying exactly the invalid state transition. Even if they make multiple queries, the odds don’t really add up to much, especially when $T$ is large.

This doesn’t seem very secure! What can we do to improve this situation?

### Enhancing Security

> Our strategy will be similar to the **zero test** we used in Plonk. So I recommend [checking that out](/en/blog/cryptography-101/zero-knowledge-proofs-part-2/#interactive-oracle-proofs) first, if you haven’t yet!

The trace polynomials themselves don’t encode the state transition constraint — the **constraint polynomials** do. What we need is to manipulate them in a way that allows us to check for **global consistency** throughout the trace. Sounds awesome, right?

So, we’ll first need to build the constraint polynomials. These depend on our **state transition function** — recalling our Fibonacci example, they looked like this:

$$
\left\{\begin{matrix}
C_0(X) = T_0(\omega X) - T_1(X) - T_0(X)
\\
\\ C_1(X) = T_0(\omega X) - 2T_1(X) - T_0(X)
\end{matrix}\right.
$$

> In this simple example, the constraint polynomials have degree at most $d$. But it’s entirely possible for them to have **degree higher than** $d$, because the state transition function may very well contain multiplications.

We’ve already mentioned how these polynomials have roots at the **roots of unity** — this is, the evaluation domain $D$. These values can be used to build a polynomial known as the **zerofier** or **vanishing polynomial**:

$$
Z(X) = \prod_{i=0}^{n-1} (X - \omega^i)
$$

Because we’re using **roots** of each $C_i(X)$, when we divide the $C_i(X)$ by $Z(X)$, we obtain another polynomial of **lower degree**, with **no remainder**:

$$
Q_i(X) = \frac{C_i(X)}{Z(X)}
$$

Naturally, we’ll call these the **quotient polynomials**.

What’s so interesting about them, you may ask? The answer is very elegant: if we tampered with the trace even just a little, then the original constraint polynomials **will not be divisible** by $Z(X)$, meaning that some **remainder** will be left. And in consequence, if we sample some random value $x$, and find that:

$$
Q_i(x).Z(x) = C_i(x)
$$

Then it’s highly likely that $C_i(x)$ is indeed divisible by $Z(X)$, meaning that it suffices the state transition constraints.

Don’t tell me that’s not nice!

<video-embed src="https://www.youtube.com/watch?v=lg5WKsVnEA4&t=5s" />

However, there’s one thing to consider: if we sample $x$ from the set $D$, then both $Z(X)$ and $C_i(X)$ will **always** yield $0$, meaning we’re left with:

$$
Q_i(x).0 = 0
$$

And in this case, $Q_i(X)$ could be just about anything. In consequence, we’re not really checking polynomial equality here.

STARKs overcome this problem by **expanding the evaluation domain**. This is, the verifier is allowed to sample from a larger domain $D’$. The ratio of the sizes of $D’$ and $D$ has a special name — it’s called the **blowup factor**. Its value is usually somewhere between $2$ and $8$.

When evaluating both $Z(X)$ and the $C_i(X)$ in the new points added in $D$’, **neither** will yield zero. And so, in this expanded domain, our original check really allows us to verify polynomial equality.

> By the way, I don’t think I mentioned this before, but this type of check has a name: it’s the [Schwartz-Zippel lemma](https://en.wikipedia.org/wiki/Schwartz%E2%80%93Zippel_lemma) in action. We used it without mention [in the Plonk article](/en/blog/cryptography-101/zero-knowledge-proofs-part-2/#the-last-sprinkles-of-cryptomagic) as well!

This is great progress! Sadly, it’s not enough.

<figure>
  <img
    src="/images/cryptography-101/starks/peter-parker-crying.webp" 
    alt="Peter Parker from Spiderman crying"
    title="Please make it stop already."
  />
</figure>

There are subtle ways to cheat our way through these new security measures — for which we’ll want to perform **another check**.

> I reckon this article is getting pretty long. Now’s a good time for a coffee pause!

### Breaking the System

Let’s try to cheat, again.

Suppose we modify the value of the trace at some step $t$. But instead of interpolating the trace alone, we **add some more** values to the interpolation.

When calculating the **constraint polynomials**, two things will happen:

- They will **not** evaluate to zero at the step(s) that were tampered with,
- They will have **higher degree** than expected.

Our strategy for detecting malicious activity is to evaluate:

$$
Q_i(x).Z(x) = C_i(x)
$$

Inside the evaluation domain $D$, this check will fail for the step(s) that was modified, but pass for all others. The problem is what happens outside of $D$, in the expanded domain $D’$.

There, the vanishing polynomial will evaluate to **some non-zero value**. So, as long as we can craft high-degree polynomials $Q_i(X)$ and $C_i(X)$ that match the condition above... We’re essentially back to square one.

The problem is similar to our original one, but slightly worse: there’s a $1$ in $|D’|$ (the size of $D’$) of sampling **exactly** the value where the check doesn’t hold. So arguably, it’s worse because $D’$ is larger than $D$.

In short: we’re screwed!

And that’s it! The system we’ve so carefully built so far has been fooled.

<figure>
  <img
    src="/images/cryptography-101/starks/hackerman.webp" 
    alt="Hackerman meme"
  />
</figure>

> Great (but extremely bizarre) [movie](https://www.youtube.com/watch?v=bS5P_LAqiVg), by the way.

Luckily, there’s a clever way to fend off this type of attack.

See, the only way a malicious prover can do the process we described is by crafting trace polynomials with **higher degree than expected**. And if we know the length of the trace, we know **what degree to expect**.

So that’s our solution: checking that some of these polynomials have **low degree**. And that will tie everything up.

> As a subtlety: in [KZG](/en/blog/cryptography-101/commitment-schemes-revisited), we don’t need this kind of check because the polynomial degree is **encoded into the public parameters**. Essentially, the degree is not a thing an attacker can play with.

---

## Checking Low Degree

Now, this is the **real** reason we chose FRI. Let’s see how it works.

We’ll be using the **quotient polynomials**. We want to check that their degree is at most $d$, where $d$ can be calculated by knowing both the state transition function, and the number of steps in the trace.

The strategy we’ll be applying is called **split-and-fold**. The rough idea behind this is to separate a **claim** (in this case, that the evaluations correspond to a low-degree polynomial) into **two claims of half the size**, which are combined with some **unpredictable verifier input**. The best way to understand this, is to see it in action.

Our polynomial has degree at most $d$, so we can represent it like this:

$$
P(X) = \sum_{i=0}^d p_iX^i
$$

The $p_i$ are just the coefficients of the polynomial. We can **split** this into its **odd** and **even** powers, like this:

$$
P(X) = P_E(X^2) + X.P_O(X^2)
$$

Where:

$$
P_E(X^2) = \frac{P(X) + P(-X)}{2} = \sum_{i=0}^{\frac{d + 1}{2} - 1} p_{2i}X^{2i}
$$

$$
P_O(X^2) = \frac{P(X) - P(-X)}{2X} = \sum_{i=0}^{\frac{d + 1}{2} - 1} p_{2i + 1}X^{2i + 1}
$$

It may take a moment to wrap you head around this. Take your time.

> If you payed close attention to the expressions above, you’ll notice that $(d + 1) / 2$ may not be an integer, which is a problem. The protocol makes use of an interesting trick to ensure that this is the case, but we’ll not cover that here.

These two polynomials have **half the degree** of the original one.

Next, the **verifier** is asked for a random integer $\alpha$. And the two polynomials are condensed into a new one, with **half the degree** (hence the **folding**, as in folding in half), like so:

$$
P^*(X) = P_E(X) + \alpha P_O(X)
$$

With knowledge of $P(X)$, we can build the **codeword** (aka **evaluations**) for this new polynomial $P^*(X)$. I won’t go into full detail on how this happens, but you can imagine that it’s just a matter of making some substitutions here and there. [This article](https://aszepieniec.github.io/stark-anatomy/fri#split-and-fold) goes into full detail if you’re interested.

The result of this process is a codeword (again, evaluations) of the **reduced polynomial**, in a domain that is **half the size**, which the prover commits to.

At this point, the verifier has both commitments to $P(X)$ and $P^*(X)$, and the sampled value $\alpha$. Their goal is to check that both polynomials are consistent — meaning that this relation here should hold:

$$
P^*(X) = \frac{(1 + \alpha X^{-1})P(X) + (1 - \alpha X^{-1})P(-X)}{2}
$$

I’ll leave it to you to check that this should hold! It’s pretty straightforward.

This is done through a [colinearity check](https://aszepieniec.github.io/stark-anatomy/fri#split-and-fold:~:text=This%20test%20is%20known%20as%20the%20colinearity%20check), which we’ll not cover this time around.

> Really, there are many nuances, optimizations, and details to cover for us to have a full understanding of STARKs. I’m content with capturing the main ideas of the protocol in this humble article, but know that there’s more for you to explore if you’re interested.

Once the verifier checks that the relation between polynomials is correct, the process is simply **repeated**, using $P^*(X)$ as the new starting point. And after enough rounds, the prover will end up with a **constant**, which they send to the verifier, making it clear that they’ve finished folding the original codeword!

<figure>
  <img
    src="/images/cryptography-101/starks/exhausted-cat.webp" 
    alt="Image of an exhausted cat"
  />
</figure>

That was a lot, and I feel like we barely scratched the surface. Still, it’s just enough to understand this: the **number of rounds** in this reduction process allows us to establish an **upper bound** to the degree of the polynomial we started with!

And so, this process allows us to prove that a polynomial has some **bounded degree**, which as we saw previously, is important to ensure both that the original trace was not tampered with, and that the consistency check is actually meaningful.

---

## Summary

We’ve taken a pretty deep dive into the inner workings of **STARKs**.

Putting all the pieces together, the protocol has roughly these steps:

- The prover arithmetizes the computation trace into **trace polynomials**, and computes the **constraint** and **quotient polynomials**,
- The prover then **commits** to the **trace** and **quotient polynomials** via **Merkle trees**,
- The verifier request some openings to check that the **quotient polynomials** are consistent,
- Finally, **FRI** is used to ensure that the quotient polynomials have **bounded degree**.

> The trace polynomials are necessary for **boundary constraint checks**, which I didn’t cover. Just know that they are needed to guarantee that the initial and final states of the computation are correct!

If everything checks out, then the verifier accepts the proof.

---

It’s hard to reduce the complexity of **STARKs** into a simple explanation. Some of the concepts we’ve covered are fairly complicated, but at its core, all we’re using are simple elements and techniques, orchestrated in a complex manner to produce amazing results.

And, as with any complex cryptographic system, there’s always more to explore. For additional introductory material, check out [this complementary article](https://www.cryptologie.net/article/601/how-starks-work-if-you-dont-care-about-fri/). Also, I strongly suggest reading [this series of articles](https://aszepieniec.github.io/stark-anatomy/) for a much deeper look into STARKs — but even then, you’ll find that some details are left out!

> It’s **that** complicated, yeah.

I really hope this article has provided some solid foundations of the general **STARK** framework. Cryptography continues to evolve, but learning the ideas behind these techniques is always a great exercise to better keep up with whatever is to come in the future!

Having said that, our next stop in the series will take us a step closer to a topic that’s very debated in today’s cryptographic scene: **Post-Quantum Cryptography**, or **PQC**. Most of the methods in this area are based on a mathematical structure we haven’t covered yet: **Rings**. And that will be the topic for [next encounter](/en/blog/cryptography-101/rings). See you soon!
