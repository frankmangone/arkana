---
title: 'Blockchain 101: Solana'
date: '2025-05-13'
author: frank-mangone
thumbnail: /images/blockchain-101/solana/solana.webp
tags:
  - solana
  - blockchain
  - proofOfHistory
  - consensus
description: >-
  Our journey now leads us into another big player in the Blockchain space:
  Solana
readingTime: 10 min
mediumUrl: 'https://medium.com/@francomangone18/blockchain-101-solana-177128bf1501'
contentHash: d2472b30c0aa5ee50c073715d67363d700a55b6ceac0a582849c2559fffe77fd
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

Blockchain is still a very niche technology. Especially with how big AI is nowadays, and given how most developers lean towards more traditional systems.

Even among Blockchain developers, it’s common to see them focus on honing their skills in a particular technology — and usually, the choice happens to be [Ethereum](/en/blog/blockchain-101/wrapping-up-ethereum) (or EVM-compatible systems).

However, as we’ve hinted throughout the series, there’s much more to Blockchain than just Ethereum — other players have risen to the challenge of creating these distributed, programmable, and immutable registries. And one such example is **Solana**.

What’s interesting about Solana is that it takes a completely different approach in solving some of the characteristic problems we’ve discussed before — like [consensus](/en/blog/blockchain-101/consensus-revisited). In doing so, some things are gained, and some are lost — something we should come to expect now that we know about the [trilemma](/en/blog/blockchain-101/rollups/#the-blockchain-trilemma).

But perhaps more importantly, this is another wonderful piece of engineering in its own right, and as such, is very much worth exploring.

So much for introductions! Let’s see how this Blockchain gets things done!

<figure>
  <img
    src="/images/blockchain-101/solana/solana.webp" 
    alt="A depiction of a SOL token"
    title="Here we go!"
    width="600"
  />
</figure>

---

## Timestamping

We’ll begin our discussion by looking directly into the heart of the system: its **consensus mechanism**. I guess there’s no need for me to say this at this point, but without consensus, there can be no Blockchain — after all, it’s the ability for nodes to connect and agree on a sequence of events that justifies the existence of these technologies.

> The folks at Solana have [some great resources](https://solana.com/news/proof-of-history) that you can check for further reference — I’ll just try to put it the way I understand it, as always!

Back when we started talking about Bitcoin, we mentioned how one of our main goals was to [order transactions](/en/blog/blockchain-101/how-it-all-began/#transaction-ordering). Ordering is determined by blocks — a transaction in block $1$ must have happened before a transaction in block $2$. But also, at the time of creating a block, a **timestamp** is assigned to it — determining when the block was mined, and when a block “happened” in time.

I’m willing to bet that after going through the ringer of previous articles, you’re now thinking “**ok, but who determines that timestamp?**”

<figure>
  <img
    src="/images/blockchain-101/solana/sherlock.webp" 
    alt="Sherlock Holmes thinking"
    title="Elementary, my dear Watson"
    width="450"
  />
</figure>

In Bitcoin, for example, miners themselves assign a timestamp to blocks when they are produced. Miners cannot place any timestamp they want on a block — there are some **rules** to try to keep these values honest. But the rules are [quite lax](https://learnmeabitcoin.com/technical/block/time/), and there are even cases where a block has an older timestamp than some block that appears before in the chain.

> Which means that as a time-stamping system, Bitcoin isn’t that reliable.

Ethereum takes a similar but slightly more restrictive approach. Each timestamp must be greater than the one from the parent block, and must not be too far in the future. Validators check these constraints, and reject any blocks that violate these rules.

Although it sounds great, this solution has some problems. Apart from the possibility of local clocks of nodes drifting apart, there’s also the fact that validators need to communicate with each other in order to agree on these timestamps — which **takes time**, and directly impacts **scaling** and **block production time**.

Okay! This is a new problem we’re dealing with. The question is:

::: big-quote
How can we precisely agree on timestamps in a distributed way, without compromising scalability?
:::

And this is where Solana comes in with a clever solution.

### Verifiable Delay

What if I told you that the **passage of time itself** can be mathematically verified, and built into the Blockchain’s very structure?

<figure>
  <img
    src="/images/blockchain-101/solana/morpheus.webp" 
    alt="Morpheus from Matrix"
    title="What if I told you to leave a like and subscribe..."
    width="500"
  />
</figure>

What? How?

To achieve this, we must first find some construction that behaves like a **ticking clock**.

Solana uses a [hashing function](/en/blog/cryptography-101/hashing) for this purpose: [SHA-256](https://en.wikipedia.org/wiki/SHA-2).

> It’s actually the same one used for [Bitcoin mining](https://en.bitcoin.it/wiki/Block_hashing_algorithm)!

But wait... What? Hashing functions were designed to be these sort of cryptographic blenders — what do they have to do with **time**?

The key insight here is that executing this hashing function takes a **predictable amount of time**. Although, by “predictable”, I don’t mean to say that we know exactly how much time it will take (in milliseconds) to calculate a hash — this of course depends on the hardware. Predictability here must then mean **something different**.

To help us understand, let’s do a little mental exercise.

> Take some input data, and run it through the SHA256 hashing function.
>
> Now take the output, and run it through the SHA256 function **again** — you’ll get a new output. And then, repeat this **millions of times**.
>
> Each execution of SHA256 takes some somewhat predictable time — you could probably benchmark it, and you’d get some average time. In that sense, each execution of the function is like a **tick on a clock** — each tick taking that average time we mentioned before.

<figure>
  <img
    src="/images/blockchain-101/solana/hash-chain.webp" 
    alt="A chain of hashes"
    title="[zoom]"
  />
</figure>

To get to that last hash, you **must** go through the $N$ steps to get to the final hash — skipping just isn’t possible. Which means that if you’re able to obtain a valid **output** $N$, that is proof that you’ve spent the time of executing the hash function $N$ times!

This is the basis for what is known as a **Verifiable Delay Function**, or **VDF** for short. And it is exactly with this mechanism that Solana timestamps stuff.

> Well, strictly speaking, this **behaves** like Verifiable Delay Function, but technically it isn’t one. It really is just a sequential hash chain. If you’re interested, here’s [a paper](https://eprint.iacr.org/2018/601.pdf) that defines VDFs in their true form.

<figure>
  <img
    src="/images/blockchain-101/solana/fried-brain-patrick.webp" 
    alt="Patrick Star with a fried brain"
    width="500"
  />
</figure>

---

## Timestamping in Action

Okay, cool. We now have this kind of a cryptographic ticking clock at our disposal. How do we use that in a Blockchain?

Here, we need to make a couple observations:

- Well, first of all, our chain of hashes works like a **timeline** — and we’ll be using it in place of “standard time”. We won’t be timestamping things with real world time, but with some point in this cryptographic clock.
- Secondly, we need at least **someone** to be calculating new hashes all the time, for the clock to advance.
- And lastly, we need **something** to timestamp! Is it transactions? Is it blocks?

Alright, so let’s say you want to send a transaction in Solana. You submit it through RPC as usual, it travels through the network of nodes, until it reaches what’s called a **leader validator**. This validator does something quite interesting: they **embed** the received transaction in the hash chain. Something like this:

<figure>
  <img
    src="/images/blockchain-101/solana/transaction-embedding.webp" 
    alt="Transaction embedding into the chain of hashes"
    title="[zoom] Verifiable Delay Function construction"
  />
</figure>

By doing this, the transactions themselves are intertwined with Solana’s ticking clock — and this is what constitutes the so called **Proof of History**. Each transaction is timestamped precisely to its corresponding hash in the sequence!

Paying closer attention, we might notice that this isn’t really a **consensus mechanism** — it’s just a mechanism to build an ordered sequence of transactions.

> And we also have a leader validator, which sounds kinda... Centralized?

So where does consensus really live in all this?

---

## Consensus

The “real” consensus mechanism in Solana is **Proof of Stake** (PoS) system, that hooks onto the Proof of History (PoH) sequence.

<figure>
  <img
    src="/images/blockchain-101/solana/busted.webp" 
    alt="A cat against a wall"
    title="Busted"
    width="500"
  />
</figure>

Solana uses what they call **Tower BFT** (Byzantine Fault Tolerance), which combines PoS and PoH to create a complete consensus mechanism.

The validator selection works very similarly to other PoS systems — validators stake the native currency (SOL) as collateral. The more tokens they stake, the higher the chance of being selected as a **leader**.

> It’s not a completely random process as in Ethereum, though. You can read more about that [here](https://docs.anza.xyz/consensus/leader-rotation#leader-schedule-generation-algorithm).

Time is divided into [slots](/en/blog/blockchain-101/consensus-revisited/#finality-in-ethereum), and each slot has a leader. But in contrast to Ethereum, the slots are determined by the PoH sequence.

During their assigned slots, which spans [400 milliseconds](https://www.helius.dev/blog/solana-slots-blocks-and-epochs#defining-slots-in-solana), the leader has to maintain the PoH sequence (meaning it has to timestamp transactions), and they also have the ability to propose a **block**, which is broadcasted to the network for validation.

Then, in classic PoS fashion, other nodes then validate the block (basically, that the leader followed the rules), and vote to confirm it — with votes being weighted by stake. Once an absolute majority of votes is achieved, then the block becomes **finalized**.

### Why Proof of History?

I guess you’re wondering what value does Proof of History really bring into the mix, if the consensus mechanism is Proof of Stake. Am I right?

<figure>
  <img
    src="/images/blockchain-101/solana/pooh.webp" 
    alt="Winnie the Pooh seriously looking into a piece of paper"
    width="500"
  />
</figure>

Basically, what we said earlier: the timestamps of transactions are no longer something that validators need to spend time verifying. Because the transactions themselves are tied to the VDF clock, they have a unique, deterministic timestamp.

And in the words of [Anatoly Yakovenko](https://solana.com/news/proof-of-history#:~:text=Every%20block%20producer%20has%20to%20crank%20through%20the%20VDF%2C%20this%20proof%20of%20history%2C%20to%20get%20to%20their%20assigned%20slot%20and%20produce%20a%20block), the [mastermind behind PoH](https://solana.com/solana-whitepaper.pdf), and co-founder of Solana:

::: big-quote
Every block producer has to crank through the VDF, this proof of history, to get to their assigned slot and produce a block
:::

Which means that every validator only needs to **observe** the Verifiable Delay Function — the chain of hashes — to follow the network’s clock, and to be in sync when it’s their time to be the leader.

<figure>
  <img
    src="/images/blockchain-101/solana/validators-watching.webp" 
    alt="Validators observing the ordered chain of transactions & hashes"
    title="[zoom]"
  />
</figure>

---

## Consequences

It’s all cool with this cryptographic clock and everything, but what’s the real impact of doing things this way?

Let’s first talk about the **benefits**. The main benefit is **very high transaction processing speed**. By removing the overhead of timestamp validation, Solana can achieve [very good transaction per second (TPS) values](https://explorer.solana.com/). In theory, it could reach as high as [65,000 TPS](https://www.gemini.com/cryptopedia/solana-blockchain#:~:text=for%20blockchain%20projects.-,What%20Are%20Solana%E2%80%99s%20Key%20Features%3F,-What%20if%20there) — a very good number, considering that a well-established network such as Visa processes [roughly the same number of transactions per second](https://www.visa.co.uk/dam/VCOM/download/corporate/media/visanet-technology/aboutvisafactsheet.pdf).

> Of course, theoretical limits are great, but typically not a good depiction of the actual capacity of the operating network!
>
> Oh, and by the way, [network fees](https://solana.com/docs/core/fees) are also pretty low!

Not everything is upside, though. There’s always a downside. What could be the trade-off here?

As we’ve already hinted at the beginning of the article, we can’t escape the [Blockchain trilemma](/en/blog/blockchain-101/rollups/#the-blockchain-trilemma). Under this lens, let’s examine where Solana has made its compromises.

- To maintain the PoH sequence and process thousands of transactions per second, Solana validators need **high-end hardware** with powerful CPUs, large amounts of RAM, and very fast SSDs. These requirements are considerably higher than those of other Blockchains, creating a higher entry barrier for validators.
- Also, Solana’s architecture is fairly complex. While this can be said of other Blockchains as well, it’s also true that Solana has had occasional outages during periods of extreme load. Stability has been improved over time, but the complex architecture remains a potential source of vulnerabilities or unexpected behaviors.

Where do we place Solana on the trilemma triangle then?

Clearly, this network has been heavily optimized for **scalability**, but making compromises primarily on **decentralization** (because of the hardware requirements), and to some minor extent in **security** (through architectural complexity).

The design choices place this network in a place different than that of Bitcoin or Ethereum. Here, I must be very clear: this doesn’t mean that Solana is neither better nor worse than those networks — it’s just **different**.

For use cases where high throughput and low fees are of the utmost importance, then these tradeoffs may not only be acceptable, but **desirable**. But if decentralization is the priority, then other blockchains might be more suitable.

It’s your choice as a developer — and that’s part of the beauty!

<figure>
  <img
    src="/images/blockchain-101/solana/excited.webp" 
    alt="The fabled happy developer"
    title="Okay maybe you’re not THIS excited."
    width="450"
  />
</figure>

---

## Summary

All in all, Solana brings a very innovative idea to the table, with its cryptographic clock (the **Proof of History** — a **Verifiable Delay Function**), and how it integrates into its **Proof of Stake** mechanism.

I think learning about the ideas behind these systems is very nurturing, and ultimately gives us more tools as engineers and developers to shape the future of the Blockchain industry.

The focus for today was the innovations to consensus spearheaded by Solana — and I really hope I was able to explain them in an understandable way!

> But if you want another take on the topic, check out [this article](https://www.helius.dev/blog/solana-slots-blocks-and-epochs#defining-slots-in-solana).

Though we’ve covered quite a lot today, this is far from being the end of our journey through Solana. Because this network is also **programmable**, just like Ethereum — but it’s not **EVM compatible**!

This means that Solana has its own way to define executable programs, different from what we’ve seen so far. And we’ll cover how these programs work in the next article!
