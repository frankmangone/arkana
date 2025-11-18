---
title: 'The ZK Chronicles: First Steps'
author: frank-mangone
date: '2025-11-10'
thumbnail: /images/the-zk-chronicles/first-steps/0*bcbfQCO0n1pbsyXD-1.jpg
tags:
  - zeroKnowledgeProofs
  - verifiableComputing
description: We embark on a new journey solely dedicated to ZK technology!
readingTime: 10 min
contentHash: 0db6e99ef3fc85b57884dae9c287c4d301fdbd3e0f32ed6558d46af6b621c1ae
supabaseId: 57aacf37-551c-4c1c-abd5-6a6bbcdbf277
---

I’ve been toying around with the idea of starting this series for quite some time now.

This story starts a few months ago, when having a conversation with a colleague at a conference. At one point, we started talking about zero knowledge proofs (ZK proofs), and particularly, where to learn about them.

Some good material was mentioned: for instance, the [Rareskills Book of Zero Knowledge](https://rareskills.io/zk-book), and the [ZK-DL Camp by Distributed Labs](https://zkdl-camp.github.io/).

> Great resources, by the way. Feel free to give them a go!

But my colleague was particularly adamant about one book: [Justin Thaler’s "Proofs, Arguments, and Zero Knowledge"](https://people.cs.georgetown.edu/jthaler/ProofsArgsAndZK.pdf).

I guess I was up for a challenge at the time, so I bought the book online the next day, and proceeded to start reading it as soon as it got delivered to my door.

Oh boy. I thought it would be a breeze, since I had previous knowledge of the subject. Needless to say, I was very, very wrong.

It was immediately clear there were many things I had yet to learn. I had no shortage of those **ahá!** moments during my read through, and I found myself at many times contemplating how I would have **absolutely loved** to have been introduced to some concepts earlier in my journey.

That’s what motivates me to write this series: to try and guide you through this wonderful topic in the way I would have wanted it to be presented to me when I first learned about it.

Before we start, a quick disclaimer: **it’s not gonna be easy**. It’s a challenging topic, after all. But hey, let’s try to keep it as fun and engaging as humanly possible!

Alright! I guess the first question to answer is **what exactly are we getting into**? So before jumping into any fancy math, let’s begin by looking at a few key concepts.

---

## Setting Expectations

I’ll start by claiming that the idea itself of zero knowledge is in equal parts **confusing** and **misleading**.

It is confusing in the sense that the **simple definition** is quite perplexing on its own. Here, take a look for yourself:

::: big-quote
Proving something in zero knowledge means that we convince someone of the truth of a statement without revealing any information except the truth of said statement.
:::

Like... **What**?

<figure>
	<img
		src="/images/the-zk-chronicles/first-steps/0*bcbfQCO0n1pbsyXD-1.jpg"
		alt="Ken Jeong squinting at a small paper" 
	/>
</figure>

We’ll have plenty of time to unpack that, but as a couple quick examples, imagine:

- Proving to the security guy at a local pub entrance that you’re over 21, without giving him your ID. Sounds quite magical — how would you do this without actually giving them your ID and revealing your date of birth? Plus, other information they don’t need to know, like your name or country of birth!
- In the same vein, imagine you can prove you’re a member of a select group, thus gaining access to the VIP of the bar — but, again, without showing your ID.
- Once you’re there, you go to the bar, and can prove to the bartender that you have some free vouchers to your name, once more without revealing your identity.

These examples are a bit overkill, but they help conceptualize what we’re after: **privacy**. Protection of **sensitive data**, while using it to **prove stuff** about it.

Still, it feels weird, doesn’t it? Like, **how on earth would we do that**?

We’ll get there, I promise. Through some weird math, but we’ll get there.

> There are other classical examples you’ll find out there that may help cement the core ideas. I particularly love this video here — hope it helps!

<video-embed src="https://www.youtube.com/watch?v=fOGdb1CTu5c" />

---

## The Misleading Bit

My second claim has to do with the fact that zero knowledge itself is not really a family of cryptographic methods, but rather a **property**.

A property of what, you may ask. Well... I don’t want to spoil it yet.

Instead, I want us to talk about a powerful idea, where zero knowledge will later fit nicely.

### Checking Computations

Here’s a question for you: how do you know that some computation was **performed correctly**?

At first, it may sound like a silly question. I mean, suppose we write some program. When we run it (even if it has bugs), we’ll get some output, which is the **correct output** for that particular program. So why would we wonder about **correct execution**?

Okay then, let’s kick it up a notch. Suppose our task is to implement some complex algorithm.

> Just pick your favorite one! Dijkstra’s algorithm, FFT, matrix multiplication... Whatever floats your boat.

Now we **do care** about bugs. A faulty implementation will lead to incorrect results, even if the result does correspond to the executed program.

It would be awesome for us to have some way to **probe** our program to determine if it works correctly — and that’s usually what **testing** is. We can infer whether our program has bugs or not by checking if it correctly handles some known cases, just by looking at the **result** of said computation.

Note that in both these scenarios, **it is us** who are running the program.

<figure>
	<img
		width="500"
		src="/images/the-zk-chronicles/first-steps/1*tKfD7-ClozJG0045AYvMWQ-2.png"
		alt="A boy with a tedious expression"
		title="Well, duh"
	/>
</figure>

I know, that might seem like an obvious thing to say at first. But now imagine you have to run some **huge program** — something along the lines of training a Large Language Model, or running a really complex physics simulation, or even solving a [huge sudoku](https://en.wikipedia.org/wiki/Generalized_game).

Unless you have a very powerful computer (or at least, you have a better one than the toaster I’m using to write this), you’d most likely avoid running those, because it would take **too damn long** to get to a solution.

Can you see where this is going? You might not be able to execute these programs, but **somebody else might**, and they might just **hand you the result**.

So now, how do you know the **result** is correct?

### Verifiable Computing

Depending on the problem we’re dealing with, and depending on how the result should look like, we might be able to perform **some checks** on the received value.

Take sudoku, for example.

<figure>
	<img
		src="/images/the-zk-chronicles/first-steps/0*HBcJUxG5LG_X6N3M-3.jpg"
		alt="A sudoku"
	/>
</figure>

Someone might **claim** they have a solution for a given puzzle. How do you check that the solution is actually **valid**?

Easy — just check that every row, column, and square in the puzzle **sums up** to the correct value. As **verifiers**, we don’t care how the puzzle was solved, and only check that results match expectations.

It might not seem like much, but this is actually **very powerful**. The key insight at play here is that **executing some computation** and **verifying its results** can be wildly different things.

> Not only that, but verification can be much faster than the original execution.

Sure, solving sudokus isn’t particularly exciting. But I promise you — this simple decoupling does enable all kinds of cool behaviors.

This is just a glimpse of what’s possible. I’d really like to give you more examples, but it’s simply **too early** in our journey. We’ll first have to go over some mathematical foundations to really start digging into the good stuff.

Still, there are a couple more things we can say before moving onto that.

---

## Proving Systems

I know I said we’d leave the math foundations for later — but we’ll need **some** math for the remainder of the article. So I lied a bit. Sorry!

<figure>
	<img
		src="/images/the-zk-chronicles/first-steps/0*U0K3ONLxPYfavwEp-4.jpg"
		alt="Plankton from Spongebob with an evil grin & laugh" 
		title="Muehehehe"
	/>
</figure>

Let’s imagine this “program” we’ve been talking about is represented by some function $f$. Our goal then can be described as follows: a **prover** (who will compute $f$) will attempt to convince a **verifier** (who will receive the output of the computation) that the **correct result** for some input $x$ is some **claimed value** $y$, as in:

$$
y = f(x)
$$

The first thing to say here is that there are two very distinct roles. We’ll always talk about a **prover** and a **verifier** — and some other times, other roles might pop up.

Secondly, we might ask how the “convincing” happens. You see, not all programs are as simple to check as sudoku, and sometimes, the result alone will **not be enough**.

What we’ll do is allow the prover and the verifier to **talk to each other**. By exchanging some very specific messages — which we’ll see in more detail in upcoming articles — , the verifier can gather key information that will ultimately allow them to perform these checks.

This is what’s known as an **Interactive Proof System** (or simply **IP**), and is the kind of protocol we’ll be studying in this series. The sequence of exchanged messages is called a **transcript**, and we can think of the full transcript as a **proof of the correctness** of the computation $f(x) = y$.

> I know this is a bit abstract at this point, but we’ll soon see how this works in practice, I promise.

### Properties

If you scroll up to the beginning of this section, you’ll note that I explicitly said that $y$ is the **claimed result** of evaluating $f(x)$. This is extremely important to understand right from the get go: now that the verifier does not perform the actual computation, it means that the prover **can attempt to lie**.

Let’s say that again:

::: big-quote
The prover might be dishonest
:::

It’s crucial that whatever system we come up with to **convince** the verifier can **catch provers in a lie**. This is formalized as **two properties** we need our Interactive Proofs to have:

- **Completeness**: if the prover is **honest**, the verifier will **almost always accept** our proof.
- **Soundness**: if the prover is **dishonest**, then it will be **almost impossible** to craft a convincing proof.

Yeah, I said **almost**: there’s a small possibility that a valid proof might be rejected, or that a dishonest prover might be able to cheat. We call these probabilities the **completeness** and **soundness** **errors**, and of course, our goal will be to make these probabilities as small as possible.

> This is essentially the **cost** the verifier has for not executing the computation themselves: a sprinkle of non-determinism.

Generally speaking though, we’ll try to make this probability **very very small** — so much so that it will be **virtually impossible** for the prover to cheat. And sometimes, the completeness error can even be **zero**, so a verifier will **always accept** proofs from an honest prover.

### Where’s the Zero Knowledge?

Did you notice that in the previous two sections, we said **nothing** about zero knowledge?

That’s the misleading bit I was talking about: verifiable computing can be very powerful on its own, **without zero knowledge**. Many applications don’t even care about the zero knowledge bit, and instead leverage other nice properties of these proving systems, like the fact that proofs can be **small** and **fast to verify**.

Zero knowledge is, as I already mentioned, an **extra property** that these proofs might have.

It has to do with sort of **hiding** some of the inputs to the function $f$. And the role of this function is to perform some type of **check** on the inputs.

> Remember our pub example from earlier? Let’s say my age is some value $x$, and I have some function that outputs $1$ if $x > 21$, and $0$ otherwise. What I want is to show that $f(x) = 1$, but without revealing $x$.

This zero knowledge property will be important when we want to keep some sensitive information **private** — for example, in applications where we need private transactions, anonymous credentials, or confidential voting.

The way we do that though, will be a story for another time.

---

## Summary

Alright, I think that’s enough for our first steps into zero knowledge!

Flash recap: we saw how execution and verification are not the same thing, which allows us to offload the stress of execution from a **verifier**, and place it on a **prover**, at the cost of having to craft a **proving system**. This is desirable because verification can be **much faster** than execution.

We also mentioned these proving system will be **interactive**: messages are sent back and forth between the prover and the verifier until the verifier is **convinced** that the computation was correctly executed.

> There are some things we can do to **remove** the need for this interaction, but we’ll talk about that later.

<quiz src="/the-zk-chronicles/first-steps/validation.json" lang="en" />

Then, we mentioned the two key properties we need to guarantee for these proofs to make sense: **completeness** and **soundness**. In a nutshell, these mean that it should be easy to prove that the result of a computation is correct **when it actually is**, and that cheating is hard.

Zero knowledge is analogous to the cherry on top of all this. It’s not a strict requirement, but it can be added into the mix. And when it is, we can create this privacy-preserving proving systems, which can be very useful in the right context.

I reckon that by this point, this will still sound quite abstract and honestly, kinda magical.

> And to be completely transparent here, it will remain so for a few articles — please be patient!

To remove this veil of mysticism, we’ll need to dive into the **basic math** that powers this cryptographic machinery.

We'll do so in the [next one](/en/blog/the-zk-chronicles/math-foundations)!
