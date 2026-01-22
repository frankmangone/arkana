---
title: 'Blockchain 101: Evolving a Blockchain'
author: frank-mangone
date: '2026-01-16'
readingTime: 12 min
thumbnail: /images/blockchain-101/evolving-a-blockchain/cheers.webp
tags:
  - blockchain
  - ethereum
  - theMerge
  - danksharding
description: >-
  To close things off, we look at a few important guidelines to upgrading an
  already-running Blockchain!
mediumUrl: >-
  https://medium.com/@francomangone18/blockchain-101-evolving-a-blockchain-8382873a7f93?source=rss-52f727507bbd------2
contentHash: 98306a3bd3e3545094ce8fd90d315ddfa378519d2387d25a222b3d2b4d5dbd75
supabaseId: null
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

Throughout the series, we have covered several Blockchain paradigms. Or to be more precise, we studied systems that achieve similar goals, but don’t need to be a Blockchain to do so: for example, we had [DAG-based systems](/en/blog/blockchain-101/beyond-the-blockchain-part-2), plain old [Distributed Ledger Technologies](/en/blog/blockchain-101/blockchain-safari) (DLTs), and more exotic stuff like [Mina’s recursive proofs](/en/blog/blockchain-101/zk-in-blockchain/#hybrid-approaches).

This is a testament that Blockchain as a concept has grown out of its shell, even if the naming has remained. The main takeaway should be that this is a broad area of study, with a vibrant and diverse ecosystem trying its best to develop an alternative for traditional systems, attempting to improve upon some critical problems we’ve already talked about at length.

Despite this multiplicity of solutions and distributed systems, there’s one model that, at least today, still dominates the industry. You know what they say: **he who hits first, hits hardest**.

Of course, I’m talking about **Ethereum**.

This Blockchain has spearheaded many advancements in the field, and has since held its place as sort of a role model for other Blockchains, or at the very least, a reference to compare against.

So today, I want to close the series talking about some particularities in how such a complex system **continues evolving**. Of course, much like any other production system, updates are not trivial, and uptime is of the utmost importance. But there’s also the fact that some of these updates didn’t even have **any precedent** in Blockchain history, and the fact they were so flawlessly executed that if you don’t know the details, you may as well **not even have noticed it**, is very remarkable.

Time for the grand finale then! Ready or not, here we go!

---

## Modifying Consensus

During its early days, Ethereum chose to use a consensus mechanism very similar to Bitcoin’s: an implementation of [Proof of Work](/en/blog/blockchain-101/a-primer-on-consensus) (PoW). At the time, Bitcoin was the big success story in the Blockchain space, and almost every new kid in the block (pun intended) mimicked their consensus algorithm, perhaps for lack of other strong references.

You already know that this is [no longer the case](/en/blog/blockchain-101/consensus-revisited). Ethereum now runs a **Proof of Stake** (PoS) algorithm to reach consensus, and everything seems to work pretty well. Unless you’re following improvement proposals, there aren’t many questions to ask, I guess.

Okay, great... But have you stopped to think how the switch **actually happened**?

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/switch.webp"
		alt="An on-off switch" 
		title="It’s not that easy"
	/>
</figure>

Let’s try to gauge the complexity of such an enterprise.

- First, consider that the network is **already running**: users expect it to keep processing their transactions, and to preserve their balances and stuff. This pretty much rules out starting a new Blockchain from scratch to replace the original one.
- Secondly, the new PoS algorithm **wasn’t really tested at scale** at the time. Even if switching was easy, nothing guarantees the algorithm to be robust, and not to break out of the blue.

These constitute two important restrictions for the switching process: to preserve the state, and to guarantee stability.

It’s a tough problem to solve. Think about it for a moment: if it was up to you, what strategy would you come up with to **migrate safely**?

Ethereum truly styled out on this one. Let’s see how they did it.

### Client Separation

We must start by looking at how **miners** used to operate in PoW.

The mining process can be divided into two (very) coarse steps: **block building**, and **block mining**. This is, miners first need to build a block with valid transactions, execute them to make sure gas limits are met, and only then would they start mining.

> Recall that [mining](/en/blog/blockchain-101/a-primer-on-consensus) was the process of finding a valid hash for the block!

And here’s the key observation: when moving to PoS, we’d only need to sort of **replace** block mining by the validation process of PoS.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/fair-enough.webp"
		alt="Jim from The Office with text 'Fair enough'" 
	/>
</figure>

I know — it may not seem like much. I mean, it even feels somewhat obvious, right?

Believe it or not, this little detail allows for one of the most important architectural changes in Blockchain history. We’ve just identified that there are two separate and independent concerns at play here: **block execution**, and **consensus**.

So, can we not modularize them? How about we **split the node program** into an execution program, and a consensus program? This way:

- The **execution program** (or client) would be in charge of building blocks.
- The **consensus program** (or client) would receive those blocks, and talk to other consensus clients to validate and ultimately accept the block.

This separation has **two main consequences**, one very important for the switch, and another one that’s kind of a **nice side effect**. We’ll focus on the former first.

### The Beacon Chain

Evidently, consensus clients only need to focus on consensus!

They just need to validate **something** created by execution clients, and the rest is a matter of coordination between validators — the actual consensus mechanism in action.

What Ethereum proposed is the following: just run **another Blockchain**, which includes these things produced by execution clients — called **execution payloads** — inside its own blocks.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/execution-payloads.webp"
        alt="Execution payloads inside Beacon chain blocks"
		title="[zoom]" 
	/>
</figure>

If you’re still scratching your head after reading that, that’s fine — it’s not immediately evident why this is a good decision. The point of this is to have consensus nodes start their operation with **empty execution payloads**:

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/empty-payloads.webp"
        alt="Empty execution payloads"
		title="[zoom]" 
	/>
</figure>

The genius of this is that we now have a way to **test** the new PoS consensus mechanism in isolation, without having to touch the already-running network.

And so, prior to the switch, this new Blockchain came to life, independent from the old Ethereum users were transacting on, which continued to use PoW.

The result? At that point, two completely separate Blockchains existed. All that remained was to have this new system, called the [Beacon chain](https://ethereum.org/roadmap/beacon-chain/), start receiving **actual execution payloads**.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/the-merge.webp"
        alt="The moment of the switch"
		title="[zoom]" 
	/>
</figure>

After the switch, old clients would only need to stop their mining activities, and instead receive validated blocks from consensus clients. Consequently, the Ethereum users see (what came to be known as the **execution layer**) is sort of a mirror of the “real” Blockchain (where consensus is happening), which we now refer to as the **consensus layer**.

How the switch was made does not really matter too much for us today. What does matter is that users didn’t have any downtime, nor did they see any change in their assets: everything continued working as if **nothing had ever happened**.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/magic.webp"
        alt="Spongebob with text 'magic'"
	/>
</figure>

### The Side Effect

Now, I mentioned there was a second, “nice” consequence.

The Ethereum Virtual Machine is a (turing) complete execution model, meaning it can operate with any consensus mechanism, as long as transactions are ordered correctly. The separation of execution and consensus clients made this quite evident: nothing stops us from running an entirely different consensus client (say, a Proof of Work one), and still use the EVM (defined in the execution client).

And the EVM itself has a lot of value. Since it was the first “framework” for programmability in Blockchain, many developers chose to specialize in the technology, investing hours on end to perfect the craft. And also, several important applications were designed with EVM in mind.

We’ve come a long way from that point, and new execution models have emerged. However, there’s **friction** in migrating to them: developers need to learn new languages, and applications need to be refactored to fit the new model.

On the polar opposite, consensus is almost always **completely transparent** to the Smart Contract developer.

This leads to a very natural consequence: new Blockchains have emerged that choose to **change the consensus mechanism**, but **preserve the execution model**. As long as this is done correctly, preexisting applications on Ethereum are easier to migrate to these new systems, and developers are not required to re-learn everything, so it’s a win-win.

There are many ways to look at this. In a way, Ethereum opened the door for “competitors” to piggy back on their successes. But I’d argue this is not a bad thing: it made the ecosystem more dynamic, and empowered other actors to continue pushing the research on the consensus side.

Crazy things have come forth from this, some of which we’ve mentioned in the series already. If anything, this kind of move is for the broader benefit of society — and I believe that’s a very beautiful thing.

---

## Smaller Steps

If the Beacon Chain transition taught us anything, it’s that taking a measured, pragmatic approach to complex upgrades is a good practice. Mainly because we reduce the risks of rushed features breaking everything.

> This is pretty much true for any producion systems, but it is **especially** true for Blockchains, which hold so much tangible value for users.
>
> You know, just don’t test in prod. Ever.

Naturally, this translates into first testing any changes in test networks, aptly called **testnets**. But the philosophy itself has another dimension to it: changes need not be pushed in a single update, and can sometimes be disaggregated into **smaller**, **incremental updates**.

This is exactly the strategy Ethereum is taking with one of the most ambitious proposals in their roadmap.

### Danksharding

Ethereum’s strategy for scalability has everything to do with making data more efficiently available.

> Our previous encounter went full deep into the problems behind this, so go check that out if needed!

In its conception, the network was not very well-prepared to process big volumes of data. Even worse, the entire [rollup-centric roadmap](https://ethereum-magicians.org/t/a-rollup-centric-ethereum-roadmap/4698) requires this data availability problem to be solved gracefully. Otherwise, network costs would explode.

So, one of the big milestones proposed for the network was the addition of blobs. And the full realization of this view has been dubbed [Danksharding](https://ethereum.org/roadmap/danksharding/).

> Seriously, check the previous article if you need a refresher.

The problem is that adding lots of blobs still isn’t exactly an easy task. For example, as more blobs are accepted in a single block, communication and validation overhead for validators spikes, which can hurt essential things like block time.

It’s a delicate matter. And on top of that, it’s a titanic task.

How do we tackle this then? We take the **measured approach**.

So did the Ethereum community, as they divided the implementation in several smaller milestones, each building upon the foundations laid by the previous one.

### The First Step

As you can probably expect, things started relatively small.

The initial milestone came along with EIP-4844, and was colloquially named [Proto-Danksharding](https://eips.ethereum.org/EIPS/eip-4844). The idea was to already introduce blobs to the network, albeit in a controlled, limited, and manageable way.

Each block could include a **small number of blobs**, and every single consensus node was required to download and verify every single blob. In other words, consensus kept working normally, but with blobs now in the mix.

This was intentionally conservative. The goal wasn’t to immediately achieve massive scalability, but rather to:

- Test the infrastructure for handling blob data in production
- Validate the fee market mechanisms for blobs
- Give rollups time to integrate this new data type
- Identify any unforeseen issues at a manageable scale

All without putting too much strain on validators.

It worked wonderfully. Transaction costs for rollups dropped by a sizable margin, and the entire network gained very valuable operational experience with blob handling.

And perhaps most importantly, it **proved the concept was viable**, setting the stage for the upcoming milestones.

---

I don’t want to bore you with the rest of the story though. There are very interesting things to mention, like how the recent [PeerDAS](https://ethereum.org/roadmap/fusaka/peerdas/) upgrade works (with the [KZG commitments](/en/blog/cryptography-101/commitment-schemes-revisited) and everything) and how it helps move Ethereum closer to Dankshadring, or why [Proposer-Builder Separation](https://ethereum.org/roadmap/pbs/) is fundamental to fully realize this scalability vision.

We might talk about those in future articles. My point here is just this:

::: big-quote
Smaller, controlled updates are a good idea in high-traffic, high-value systems
:::

And again, this is pretty much true for any production system with these characteristics.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/cheers.webp"
		title="Cheers to that"
	/>
</figure>

---

## Into the Future

There’s one more long-term challenge worth mentioning before we close: [quantum computers](/en/blog/wtf-is/quantum-computing).

Right now, Ethereum relies heavily on [elliptic curve cryptography](/en/reading-lists/elliptic-curves-in-depth). To this date, this has provided strong security, ensuring the network cannot be attacked via cryptographic exploits.

Quantum computers change this, as they could break our long-standing trusty cryptographic primitives. Things like [Shor’s algorithm](https://en.wikipedia.org/wiki/Shor%27s_algorithm) could really, really screw things over. And once these cryptographic walls fall, the entire network will soon follow.

> To be fair and put things into perspective though, Blockchains are not the only systems affected by this looming threat. The “secure Internet” itself could be jeopardized.

Now, this isn’t an immediate threat. We’re likely still years away from quantum computers breaking signatures at scale. However, the world does not have the luxury to wait until the very last moment.

Neither does Ethereum. They aren’t just waiting to scramble at the last minute. And so, work has already begun.

### The Challenge

The tricky part is that most post-quantum signature schemes are chunky boys: signatures **tens of times larger** in size than what we use today.

<figure>
	<img
		src="/images/blockchain-101/evolving-a-blockchain/chunky.webp"
        alt="A chunky asian kid. No offense intended, just a mere description."
		title="Yeah bro I’m post-quantum"
	/>
</figure>

We already know from the [previous article](/en/blog/blockchain-101/handling-data) that every byte counts in Blockchains. Blockspace is a precious resource, and large signatures take away from that — so this is a real problem.

So, again, what’s the right tactic to take this problem on? You probably guessed it: calm and collected, taking the measured approach.

The problem with this particular matter though is that new cryptographic primitives take **years of research**, the consequence of this being there’s no clear roadmap yet.

But this is totally fine. The best we can do is put the effort where it matters. As long as that’s the case, the shift to post-quantum cryptography will be as methodical, controlled, and pragmatic as any other.

Better be prepared!

---

## Summary

The idea for today was simple: to show that evolving these Blockchain systems is not trivial, and that it takes a great deal of planning and foresight.

Blockchain as a technology is still fairly new: not so young that everything is a huge breakthrough, and not so old that there’s no room for improvement. Since these systems are in constant development, it is crucial to understand where they are lacking, in order to plan ahead carefully.

As a final nugget of wisdom, I’ll say that no system is perfect. We must always ponder the tradeoffs, be conscious of the possible flaws, and know under which circumstances it breaks down entirely. This is the mindset with which these giant distributed systems must be designed. In my opinion, everything else — all the different structures, mechanisms, and decisions we’ve explored during the series — must stem from this simple consideration.

---

Well, that’s gonna be it!

There are several topics I haven’t had the chance to cover in this series: private blockchains, cross-chain interoperability, hell, even common Smart Contract applications!

> I’d never see the end of this series if I wanted to cover everything!

What’s more, by the time you finish learning about a technology, it’s very likely that new updates are coming to it soon, so you need to learn about those, and all the while, other technologies keep evolving as well — so it’s virtually impossible to know everything there’s to know about Blockchain. It’s just a reality we have to live with.

It is because of this that my goal in this series was to give you guys a bird’s eye view of the landscape. It is through critical thinking and knowledge of important patterns and common shortcomings that you’ll be able to more easily navigate the space.

And I truly hope, as we reach the end of the series, that you’ll be leaving this article with a good deal of tools to continue discovering this amazing world!

Thank you for reading, and I’ll see you on my next project!
