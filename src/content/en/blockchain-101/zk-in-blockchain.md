---
title: 'Blockchain 101: ZK in Blockchain'
author: frank-mangone
date: '2025-10-15'
thumbnail: /images/blockchain-101/zk-in-blockchain/0*4nlnW5cHm23lYgUp-3.jpg
tags:
  - zeroKnowledgeProofs
  - blockchain
  - rollup
  - alephZero
  - mina
description: >-
  Moving on from Polkadot, we now cover the intersection between two cutting
  edge technologies: blockchain and zero knowledge proofs
readingTime: 11 min
contentHash: 6aabc12c66613e4dfb779c706f0e85189cab55322147285118e76810add29ffc
supabaseId: 415faac9-b3dc-4d0a-816e-426f6176fa5e
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

After [four](/en/blog/blockchain-101/polkadot) [articles](/en/blog/blockchain-101/polkadot-consensus) [on](/en/blog/blockchain-101/coretime) [Polkadot](/en/blog/blockchain-101/jam), it’ll be good to decompress a bit by tackling a more general question, instead of committing so hard to a single technology once more.

> I presume it was quite a lot of information, after all. Sorry!

Today, I want us to explore one of the most advanced areas of research and development in cryptography in the past few years: [Zero Knowledge Proofs](/en/blog/cryptography-101/zero-knowledge-proofs-part-1), usually referred to as just **ZK**.

This technology has been making noise in the Blockchain space for some time now. We’ve even covered it briefly on our [pass through rollups](/en/blog/blockchain-101/rollups/#zero-knowledge-rollups). So if you’ve been following the series, you most likely have an idea of what this is about.

But today, we’ll double click on what this buzzword means, how exactly it’s used, and then present some application examples — some of them more familiar, some of them quite wild and exotic.

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/0*_XfvNnoEqtc21OGU-1.jpg"
		alt="An extragavant guy with a tiger" 
		title="Oh yes"
	/>
</figure>

Make yourself comfortable, and let’s get to the action.

---

## What is ZK?

Before we get to the applications, we must be precise about what ZK is, and clarify a few common misconceptions — perhaps most interestingly, around the fact that the concept of “zero knowledge” is often **misunderstood**.

Zero-knowledge proofs are cryptographic protocols that allow a prover to convince a verifier about the validity of some **statement** while revealing no information besides the truth of the statement itself.

> A simple example would be to prove that my age is over 21, but without revealing my age.

When put like that, it sounds quite magical and esoteric. But I guess we’re really learning about it **backwards** — there’s a way to approach these ideas from a more familiar or down-to-earth perspective. That way is to talk about **verifiable computing**.

Imagine you have a program $P$, and you want to verify that it was **correctly executed** for a given set of inputs $x$, resulting in some output $y$. Something like:

$$
y = P(x)
$$

The trivial way to go about this is to just **churn through the computation**, and check if the results match — but that’s not the **only** way.

You see, some clever techniques allow us to encode information about the computation, so that we can verify its validity with **much less computational effort**, at the cost of admitting a very low chance of accepting a false proof.

Such systems are known as **arguments of knowledge**. They rely on several techniques we won’t have the luxury to talk about today, because that would take much longer than a single article.

> I’ve written some stuff about this in my [Cryptography 101 series](/en/reading-lists/cryptography-101), so you might want to check that out! Don’t worry though — we’ll cover what you need to know here.

However, what we just said is plenty enough to be more precise about this zero knowledge stuff: if your arguments of knowledge happen not to reveal any information about the **inputs** to the computation, then you get a zero knowledge proof. Which means that it’s a **property** that these arguments **can have **— and not a strict requirement.

Instead, arguments of knowledge are required to satisfy two other properties, called **completeness** and **soundness**: the first one means that valid proofs will always be accepted, and the second one means that false proofs are really, really hard to craft.

> There’s even the more precise notion of **knowledge soundness**, which roughly speaking means that it’s very unlikely that a proof could be crafted without knowledge of certain information. The definition itself is more involved, and it requires us to define an **efficient extractor**, so we’ll skip those technical details.

In light of this, one must wonder: when is zero knowledge something we should care about?

Truth be told, we don’t **always** care about ZK. In fact, we’re sometimes more interested in **other properties** of arguments of knowledge — particularly around how **small** proofs can get, or how fast they can be **verified**.

Only when data privacy is of the utmost importance will ZK be advantageous. In the context of Blockchain though, we’re **mostly** interested in the other properties we just mentioned. All this to say: the term ZK is usually **overused** (or even **misused**) because it helps with marketing efforts, but know that **verifiable computing** is more often than not the name of the game.

Alright! With that in mind, let’s find out how ZK (or verifiable computing) is used in Blockchain.

---

## Applications in Blockchain

Roughly speaking, ZK applications in the Blockchain space can be broken into three coarse categories:

- **Scaling**: Using verifiable computation to compress expensive on-chain operations.
- **Privacy**: Using actual zero knowledge to hide sensitive information.
- **Hybrid Approaches**: Combining both benefits for more complex use cases.

We’ll tackle applications in more or less this order, starting with the already somewhat familiar discussions around **scaling**.

---

## Scaling

As a short refresher, the whole discussion back when we talked about [ZK rollups](/en/blog/blockchain-101/rollups/#zero-knowledge-rollups) revolved around being able to accumulate transactions off-chain, then performing computations to advance some state, and have the layer 1 **verify** those computations on-chain.

So here’s a question for you: do you think we’re concerned with zero knowledge in this case?

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/0*4nlnW5cHm23lYgUp-3.jpg"
		alt="A squirrel raising its hands as if stopping the reader" 
		title="Pause and try to guess."
	/>
</figure>

Well, generally speaking, **no** — we care more about **fast (and cheap) verification**. Privacy could be important as long as the rollup has a **private state**, and wanted to keep it so — but that’s easier said than done.

Therefore, our focus will be on **fast verification**.

Blockchains are **stateful systems**. You know the drill: they have a global state, which evolves thanks to the network processing transactions (or similar entities, like in [JAM](/en/blog/blockchain-101/jam)). In other words, they can be described by a **function** that takes both the initial state and a set of transactions, and outputs the next state.

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/1*V92WpgX8jMADbvpVOQPg2A-4.png"
		alt="State transitions in action"
		title="[zoom]"
	/>
</figure>

Executing this function requires computation — and this is particularly important because each new state needs to be **validated** in order to be accepted. And how do we validate? Either by re-executing the whole thing, or by verifying some **proof** that the computation was correctly performed.

Clearly, we’re interested in the **latter option**. We’re after solutions that help us perform fast validation — so something along the lines of SNARKs or STARKs. And as we already know, the main appeal of this approach is **saving costs** when layer 1 validators check the state of a rollup.

Wait a second. We’re talking about rollups and validation here. But... Isn’t validation also needed in layer 1 Blockchains?

Exactly!

L1 Blockchains already have mechanisms in place to keep validation fast and lean. In fact, we discussed the methods available [a couple articles ago](/en/blog/blockchain-101/polkadot-consensus/#building-the-proofs). ZK proofs were part of the list of possibilities.

However, while extremely powerful and versatile, arguments of knowledge are **not foolproof**. A particularly annoying limitation they have is that while verification may be fast, the **proof generation** step is usually **computationally intensive**, taking a long time, and considerable resources.

Let’s think about the consequences of this for a second. Imagine a validator is proposing a block. They’d want to generate a proof for fast verification. What happens if they take too long to produce such proof?

You guessed it — they become a bottleneck for the entire process!

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/0*nWSSVVikXpaeZ6h3-5"
		alt="A turtle" 
		title="Hang on — I’m almost finished with the proof"
	/>
</figure>

All in all, the proof generation step is the main challenge to address if this is to gain adoption as a replacement for current validation strategies. While promising, technology isn’t there yet, with proof generation still being quite slow (at the time of writing this).

Some ambitious experimental ideas like Ethereum’s [Beam chain](https://leanroadmap.org/) initiative are exploring the possibility of incorporating ZK into the mix, and in more places than just state validation — for example, signature aggregation is another area where ZK proofs could be useful.

---

## Privacy

Now we turn our attention to the actual zero knowledge stuff.

Privacy in Blockchain is not that novel of a concept. Early examples such as [Monero](https://en.wikipedia.org/wiki/Monero) (2014) or [Zcash](https://en.wikipedia.org/wiki/Zcash) (2016) pioneered the area of **private **or** shielded transactions** to protect their users’ financial information.

> In fact, [Zcash](https://z.cash/) was an early adopter of zero knowledge proofs!

Importantly, both Monero and Zcash categorize as payment solutions: they work like Bitcoin, but they add privacy on top of it.

Almost ten years have gone by since the conception of those projects, and modern solutions have also explored adding privacy to general-purpose Blockchains — in other words, adding privacy to **Smart Contracts**.

One example of this is [Aleph Zero](https://alephzero.org/).

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/1*eGrPneuvB3RQ5lD-rA8lgg-6.png"
		alt="Aleph Zero logo" 
	/>
</figure>

> As a curiosity, it’s built on Substrate (now Polkadot SDK).

The core idea is relatively straightforward: Aleph Zero is a standard Smart Contract platform where everything is **public by default**, just like Ethereum. But when you need privacy, you can **opt into it**. Here’s a demo of how this looks like:

<video-embed src="https://www.youtube.com/watch?v=eD6TZUmgX3w" />

When you want to make a private transaction or interact with a private Smart Contract, the system uses zero knowledge proofs to **hide transaction details**, while still proving to the network that everything is valid.

> You’re effectively proving “I have the right to do this operation” without revealing what the operation actually is.

This is interesting on **two accounts**:

- First, it’s an **optional feature**, as we mentioned before. Not everything needs to be private. Having the ability to pick and choose which information we want to protect is great — because if there’s something we’ve stated quite firmly so far, is that zero knowledge proofs are expensive to generate. In the case of building and signing a private transaction, that stress is placed on the **end user**, which hurts the **user experience**.
- Secondly, privacy is **baked into the protocol**. General-purpose Blockchains may allow for some degree of custom privacy, but there are **limits** to what can be done. Examples such as [Confidential Wrapped Ether](https://ethresear.ch/t/confidential-wrapped-ethereum/22622) or [Zether](https://github.com/Consensys/anonymous-zether) are technically sound, but for instance, they lack the ability to shield the transactions themselves (as in, shield the sender) because the **protocol **(think Ethereum, Polkadot, etc.) doesn’t care about that.

The ZK proofs ensure that even though the private operations are hidden, validators can still **verify** certain things such as no tokens being created out of thin air, spending limits being respected, and more.

Aleph Zero is not alone in this game though — we can name other projects with similar properties, such as [Aztec](https://aztec.network/), [Penumbra](https://penumbra.zone/), [Secret Network](https://scrt.network/), and [Oasis](https://oasis.net/).

I know I’ve said this several times throughout the series, but it’s still too early to gauge the impact these solutions will have.

---

## Hybrid Approaches

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/1*cZJMaVfXeh_kICVqmRFKxA-7.png"
		alt="A zebra-horse hybrid" 
		title="Time to shine babyyy"
	/>
</figure>

Now we get to the more exotic stuff.

While there are some interesting things to talk about such as ZK-based identity or [ZK Machine Learning](https://0xparc.org/blog/zk-mnist) (ZKML), there’s one Blockchain in particular that has caught my attention in how it uses verifiable computing in an unconventional and innovative way: [Mina](https://minaprotocol.com/).

<figure>
	<img
		src="/images/blockchain-101/zk-in-blockchain/0*wj_87iQnuq4LAcy_-8.png"
		alt="Mina logo"
	/>
</figure>

The approach Mina takes for, well, **the entire foundation of what a Blockchain is** differs quite dramatically from the standard. We’ve seen some deviations from the Blockchain model in the form of [DAGs](/en/blog/blockchain-101/beyond-the-blockchain-part-2), but that’s about as crazy as things have gotten.

Mina proposes a whole new paradigm: what if the **entire Blockchain** was just a single ZK proof?

> Whaaaaaat?

Pretty mind-bending, huh? But how is this even possible?

The idea is to replace the Blockchain itself with a **recursive proof** that proves that the current state of the network is valid.

I know this will raise lots of questions, so let me try to address them preemptively.

First, what about transactions? Keeping just a small proof means that there’s no ledger book with every transaction ever made — something we’ve grown accustomed to. But if we want to keep things private... Do we really need that?

Thus, Mina keeps just a **tiny certificate** that proves the current balances are correct. Every time new transactions happen, they generate a **new certificate** that proves both the new transactions are valid **and** that the previous certificate was valid. With this, you have a **chain of proofs** that link to the very genesis of the network, and you can verify that the entire progression is valid.

> Instead of the chain of hashes you normally get in Blockchains. Though I suspect the pointer to the previous proof is some sort of hash as well.

What could be the advantages of adopting this strategy? Well, one really cool property of Mina is that the proofs being used are **very lean**, as they use [zkSNARKs](https://minaprotocol.com/blog/what-are-zk-snarks). And the implications are huge: anyone can download and validate the state of the network **even on their mobile phones**. This is made possible by not having to download enormous amounts of transaction data, and relying on ZK technology instead.

Lastly, I want to mention that Mina goes even further with their [zkApps](https://minaprotocol.com/zkapps): Smart Contracts that run off-chain, and only submit proofs to the Blockchain. Data never leaves your device, and you can still prove things about it to the network.

It’s just crazy. Mina likely represents the most radical reimagining of Blockchain architecture I’ve seen so far. And to me, this is exactly why ZK technology is so exciting.

::: big-quote
It’s not just about making existing systems faster or more private. It’s about opening up entirely new ways of thinking about what Blockchain can be.
:::

I’m confident that other wild applications of ZK and verifiable computing in general will pop up in the near future. The technology is still evolving, and as it gets better, it will surely enable things that were impossible a few years ago.

---

## Summary

ZK applications in Blockchain don’t end there.

> Just to name another one, we could mention something about [cross-chain bridges](https://zkbridge.com/) exploring ZK for extra safety.

But I think this is a good place to stop for now.

The key takeaway is that we’re witnessing ZK technology evolve before our eyes, going from niche privacy tooling into making actual impact in the space.

Thus, we can no longer ignore it. It really feels like ZK (and verifiable computing in general) is primed to change the Blockchain landscape at a fundamental level in the not-so-distant future.

And who knows — maybe the next breakthrough will make today’s “radical” ideas look like child’s play!

---

The Blockchain industry is not at all static, and boundaries will keep being pushed. ZK proofs are one of the latest toolkits, and they promise to be particularly helpful with **privacy** and **scalability**.

However, these are not the only long-standing problems to solve.

Another prominent one we’ve touched upon a few times throughout our journey together is **data availability**.

This will be one of our last stops in the series. I’ll see you there!
