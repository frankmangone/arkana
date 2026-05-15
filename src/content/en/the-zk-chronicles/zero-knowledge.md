---
title: "The ZK Chronicles: Zero Knowledge"
author: frank-mangone
date: "2026-05-15"
readingTime: 12 min
thumbnail: /images/the-zk-chronicles/zero-knowledge/galaxy-brain.jpg
tags:
  - zeroKnowledgeProofs
  - honestVerifierZeroKnowledge
  - simulator
  - knowledgeSoundness
  - extractor
description: >-
  It's finally time to formalize what "zero knowledge" truly means
contentHash: a241e2c44b9024313a0e5e78b73cd72e45e9cf38921e140085b23af0cdaff940
---

Back in our [very first encounter](/en/blog/the-zk-chronicles/first-steps), I made a big effort to convey the importance of verifiable computing on its own. In my mind, that is truly a necessary first step. There’s a lot of value in building from the ground up, stripping away the hype, and really visualizing where zero knowledge sits in the universe of possibilities - so that we can clearly define when it matters, and crucially, when it **doesn’t**.

But there’s also another reason we didn’t jump straight into ZK: **we were not yet ready**.

> Honestly, it’s not even that it’s super complicated or anything, don’t be scared! It’s just that it wouldn’t have made much sense to get lost in formalisms, as they would probably have felt weird and confusing.

Alas, after going through all the hardships from the previous articles (especially that [last one](/en/blog/the-zk-chronicles/inner-product-arguments)), I think our understanding of this topic should be much more mature, and more than enough to fully appreciate what’s coming next.

So it’s finally time. We’re finally ready.

It’s time to talk about **zero knowledge**, and finally look at some formal definitions around one of the most counterintuitive ideas in all of computer science: that you can prove something is true without revealing **anything** about why it’s true.

---

## Intuition

Let’s start with the question we’d like to answer today: what does it actually mean to **reveal nothing**?

If we were to ask this question to most people (or at least, someone who’s never heard about ZK), then we’d get an intuitive answer: to reveal nothing means to **share no information at all**.

> Right? It doesn’t mean sharing **some** information - either you reveal, or you don't. It’s a rather binary matter.

<figure>
	<img
		src="/images/the-zk-chronicles/zero-knowledge/joker.jpg"
		alt="The Joker interrogation scene from Christopher Nolan's Batman" 
		title="Exaaaactly!"
	/>
</figure>

That’s not our case, though. After all, we’re trying to prove something about a computation. We can’t convince anyone of anything without exchanging at least **some** information with them. So we’re actually **always** revealing a little something.

Therefore, we need to zoom into the exchanged data itself. Here, we can find a whole spectrum of possibilities: the smallest explicit piece of information we could send is a **single bit**, while the maximum amount of information to share is the [entire witness](/en/blog/the-zk-chronicles/computation-models/#witnesses) to the statement we want to prove.

> Fun fact: the true minimum amount of information you can share according to [information theory](https://en.wikipedia.org/wiki/Information_theory) is actually **zero bits**!

A single bit is as close we can get to **truly revealing nothing**. I mean, it’s easy to imagine this amount of information will probably not be very **meaningful** to a verifier, as they would have a hard time deriving any relation between our prover’s statement, and the shared bit.

Okay, so how about **two bits** of information? Or **three**? Or **four**? Clearly, there must be a limit. When does the data actually become **meaningful** for the verifier? When does it start giving them insights into the original statement?

And therein lies the true essence of zero knowledge:

> How much information can we share without it being **useful** for the verifier, except for convincing themselves about the truth of what we want to prove?

**Useful information**. That’s the key idea here. So let’s try to think of a way to determine when information becomes useful!

---

## Measuring Usefulness

Ok, that’s nice and all, but how do we even begin to go about this?

Well, here’s an idea: if a proof received by the verifier is **indistinguishable** from something they could have generated on their own, then that means they learn nothing new from the received information!

Let’s pause on that idea for a second. What do we mean by having the verifier **generate the proof on their own**? After all, they don’t really know the secret information that the prover is supposedly demonstrating knowledge of.

For this purpose then, a new gadget will be required: the **simulator**.

### Simulators

First, let’s try to visualize what we mean by **simulating**.

In an interactive protocol, a prover and a verifier will exchange a sequence of messages, which as you already know, we call a **transcript**. The whole point of the interaction is for the verifier to **challenge** the prover, and get responses that ultimately work as a proof.

With this in mind, we can now describe what a **simulator** is: a **hypothetical algorithm** that has the single responsibility to fabricate **accepting transcripts** for whatever protocol we’re studying, but it does so **without interacting with a prover**.

> In other words, it does so **without knowledge** of the secret witness behind the statement being proven.

I know all of this sounds weird, especially when we don’t really know how to build such a simulator yet. I’ll ask you to bear with me and assume such a simulator exists for now, so we can try to piece this apart **conceptually** before we look at an example.

Assuming it exists then, note that we require the simulator to produce not just any kind of transcript, but specifically **accepting transcripts**. This is a crucial observation: any transcript produced by the simulator will look like a **valid proof**.

With this in mind, we can do a little thought experiment. Let’s try building a **pool** of accepting transcripts.

We’ll do so in two steps: first, we'll run the real protocol many times, and collect all the results. Then, we’ll run the simulator many times as well, and collect its outputs into the same pool.

From the constructed pool, the verifier will pick one of these transcripts **at random**. We already know it’s an accepting transcript, so it would naturally pass verifier validation, but we oughta ask ourselves another question here:

::: big-quote
Can the verifier determine whether the selected transcript was simulated?
:::

If the verifier has no efficient way to tell reals from fakes apart, then these transcripts are **truly indistinguishable** from each other.

> If we wanted to get super technical here, what we require is that the **distribution** of real transcripts produced by the protocol is indistinguishable from the distribution produced by the simulator.
>
> We can formalize this by denoting a prover as $P$, the view of the verifier as $\text{View}$, and the simulator by $S$. Then, we just write this distribution indistinguishability as:

$$
\text{View}_V​(P(x,w)) \approx S(x)
$$

And that’s the core intuition at play: whatever the verifier sees could just as well have been generated through a simulation, which bears **no relation** to the secret information!

<figure>
	<img
		src="/images/the-zk-chronicles/zero-knowledge/galaxy-brain.jpg"
		alt="Galaxy brain meme" 
		title="Galaxy brain moment unlocked"
	/>
</figure>

Alright, that sounds promising! Alas, there’s an obvious blocker for this entire line of reasoning: how can a simulator fabricate a transcript **if it doesn’t know the secret**?

### Shifting Perspectives

Yeah. At best, that feels a little sus, and at worst, **downright impossible**. After all, if the simulator can produce valid proofs without the witness, doesn’t that mean the proof system itself is broken?

Quite the paradox, huh? And although we’ll see that it’s indeed possible to build these simulators, there’s a key to resolving this matter conceptually, and it has to do with a slight adjustment in our perspective.

Instead of thinking of the simulator as some sort of mystical machine that magically produces fake proofs, we can think of it as a **test**. And what we'll be testing is whether the protocol **leaks any knowledge**.

The idea is that if everything the verifier sees could have been produced by a simulator without the witness, then interacting with the prover cannot possibly give them any new information about that secret. In other words, whatever the verifier learns from the interaction **could have been produced by the simulator anyway**.

> And **that** is precisely what we mean when we say that a protocol reveals zero knowledge.

---

## Honest Verifier Zero Knowledge

There’s yet another catch we should mention. When we informally defined a simulator, we actually said that they need to reproduce accepting transcripts. In other words, it has to reproduce the view of a verifier - but who said the verifier plays by the expected rules?

<figure>
	<img
		src="/images/the-zk-chronicles/zero-knowledge/him.jpg"
		alt="Him from Powerpuff Girls" 
		title="I like the sound of that!"
	/>
</figure>

Indeed, a simulator needs to be able to produce the view of **any** verifier, including one that behaves unexpectedly, or deviates from the protocol in clever ways.

It’s a subtle distinction, but it complicates things quite a bit. And so, in order to start getting our feet wet, perhaps we should avoid this general case and instead focus on a simplified scenario: assuming the verifier will **behave nicely**.

> In other words, we’re saying that whenever they are required to send a random challenge, they will actually do so, and that the challenge will actually be random!

If a protocol can be simulated under this assumption, we can say that it satisfies **Honest Verifier Zero Knowledge**, or **HVZK** for short. This is a weaker notion than full zero knowledge, but it’s still a very useful one, because many classical protocols satisfy HVZK.

Assuming that the verifier behaves honestly will allow us to see how simulation can **actually work in practice**. And to do this, we’ll be using a type of protocol we already know about.

### Simulating a Sigma Protocol

A few articles back, we introduced [sigma protocols](/en/blog/the-zk-chronicles/sigma-protocols) (or Σ-protocols for short), of which the simplest one was the [Schnorr protocol](/en/blog/the-zk-chronicles/sigma-protocols/#schnorr-protocol).

If you recall, it’s a protocol we can use to prove knowledge of a discrete logarithm for the public value $y$ (so $y = g^x$, and the claim is that the prover knows $x$). As a brief recap, it works in three steps, namely:

1. The prover first sends a commitment to a random blinding factor $t = g^r$.
2. The verifier replies with a random challenge $c$.
3. The prover answers with $s = r + cx$.

At the very end, the verifier checks:

$$
g^s = t \cdot y^c
$$

And the **transcript** of this entire interaction is just the vector $(t, c, s)$.

Good! Now all we need to do is come up with a way to simulate this. It might seem like a daunting task at first, but there’s actually a very nice trick we can use for this particular protocol. We can **rearrange** the verification step to get:

$$
t = g^s \cdot y^{-c}
$$

It’s not that big of a change, and still, it enables a simple simulation strategy for the protocol:

1. Choose random values for $c$ and $s$.
2. Compute $t$.
3. Output the transcript $(t, c, s)$.

And just like that, we’ve obtained a transcript that the verifier will accept, without any knowledge of the secret $x$! Remarkably, our transcript is **indistinguishable** from one generated through the actual interaction. Therefore, the Schnorr protocol satisfies HVZK - it’s zero knowledge as long as the verifier is honest!

Cool, huh?

---

## Knowledge Soundness

Even though the last example works perfectly well in practice, you probably have a lingering question at this point:

::: big-quote
If transcripts can be simulated without knowing the secret, how can the verifier trust that the prover actually knows it?
:::

Just when we were making some progress... it seems we’re suddenly back to square one? Or at least, that we’re missing something important.

<figure>
	<img
		src="/images/the-zk-chronicles/zero-knowledge/stressed.jpg"
		alt="Stressed developer meme" 
	/>
</figure>

Indeed, the simulation argument is only **half the story**. For zero knowledge to fully make sense, we must also somehow ensure that the prover **knows the secret**.

Thus, coupled with the simulator argument, we must introduce another concept: that of **knowledge soundness**, and the ability to **extract information** from the prover.

### The Extractor

Ok so, if real transcripts are indistinguishable from simulated transcripts, how do we even go about showing that the prover really knows the secret witness?

First of all, we must focus on what happens during actual interactions between prover and a verifier this time, not the simulations. True, one transcript doesn’t leak information... but how about **multiple transcripts for the same commitment**?

Intuitively, we can imagine that if the prover truly knows the witness, then they should be ready to respond to multiple challenges, consistently outputting accepting responses.

> Or, conversely, if they didn’t have knowledge of the secret, then it’s highly likely that they are not ready to respond to a barrage of challenges!
>
> Notice that this naturally rules out simulation, where we were calculating the original commitment. In this scenario, we’re **fixing** that initial commitment!

We can imagine that as more and more challenges are answered correctly, our confidence in the prover having the necessary knowledge increases.

While this might make sense, we should try to be a little more precise here. To do that, we’ll take this to an extreme: imagine that we are able to interact as many times as we want with the prover. With enough interactions, perhaps we can do a little more than being convinced of the truth of the statement: we can maybe **recover the witness**!

This is the idea behind an **extractor**: an efficient algorithm that interacts with the prover, and uses multiple accepting responses to recover the witness. If such an algorithm happens to exist for a protocol, then we can say the protocol **satisfies knowledge soundness**: any prover capable of producing accepting proofs must actually **know the witness**.

And as always, I think the best way to cement these ideas is through an example!

### A Simple Extractor

Once more, let’s turn our attention to our good ol’ Σ-protocols, of which we’ll again choose the simplest we can find — the Schnorr protocol!

<figure>
	<img
		src="/images/the-zk-chronicles/zero-knowledge/you-again.png"
		alt="Oh, you again?" 
	/>
</figure>

Yeah! This one has a very nice extractor strategy. In fact... we’ve [already seen this in action](/en/blog/the-zk-chronicles/sigma-protocols/#special-soundness)!

Back when we talked about Σ-protocols, we took a brief look at the idea of **special soundness**: the ability to extract the secret from just two accepting transcripts (for the same commitment). This is actually a characteristic every Σ-protocol shares, and is in part what makes them so simple to probe for zero knowledge and knowledge soundness.

Since this has already been covered, let’s just look at a brief recap. From two interactions producing accepting transcripts in the form of $(t, c, s)$ and $(t, c’, s’)$, we get:

$$
g^s = t \cdot y^c, \ g^{s’} = t \cdot y^{c’}
$$

If we **combine** these expressions by dividing them together, we’d get this:

$$
g^{s-s’} = y^{c-c’} = g^{x(c-c’)}
$$

And then, simply by comparing the exponents of the first and last member of that expression, we can write a very nice equation that allows us to find $x$ pretty easily.

---

Naturally, not every protocol provides such an easy way to analyze knowledge soundness - which prompts us to give a slightly more general definition of how the process would work.

> Put more precisely: if a prover can produce accepting transcripts with non-negligible probability, we can imagine an extractor $E$ - an algorithm with **oracle access** to the prover, free to send as many challenges as it wants, and expecting an **valid response** every time.
>
> If such an algorithm can **always recover** $x$, then the protocol is knowledge-sound: any prover convincing enough to pass must actually know the secret.

To summarize, in a nutshell: **knowledge soundness** means that any prover that can answer challenges convincingly must contain enough information for us to extract the witness - so in other words, they must know the secret information!

---

## Summary

And with that, we’ve successfully removed the veil of mysticism around zero knowledge!

<figure>
	<img
		src="/images/the-zk-chronicles/zero-knowledge/yeaaa.jpg"
		alt="Jack Black with a 'Yeah!'" 
		title="Yeeeeeaaa"
	/>
</figure>

It wasn’t that bad either, was it? Once the intuition clicks in, I think it can even feel quite natural.

The concept of zero knowledge has grown to have many interpretations in a pragmatic sense. In a way, it has become intertwined with the idea of verifiable computing  -  that’s why we started the series with the distinction. When we talk about the popular understanding, it has been associated with this idea of “revealing nothing”. But the **true essence** of zero knowledge (and its counterpart, knowledge soundness) is what we’ve presented today, and is defined in terms of **simulators** and **extractors**.

And remember, one of the main takeaways for today is that zero knowledge alone is **not enough**: we must also make sure the secret witness is **actually known** to the prover.

---

While we have a bunch of methods and techniques yet to look at, there’s a pressing little matter we should address as an immediate followup to the definitions we saw today.

Our arguments today were all based on interactions between prover and verifier. However, most proofs are converted to their **non-interactive versions**. What happens then? Do all of the concepts we covered become irrelevant?

We’ll find out in the [next installment](/en/blog/the-zk-chronicles/the-random-oracle-model)!
