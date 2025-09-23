---
title: 'Blockchain 101: Coretime'
date: '2025-09-01'
author: frank-mangone
thumbnail: /images/blockchain-101/coretime/0*5hVpbbmaF_GTFVIK-7.jpg
tags:
  - polkadot
  - blockchain
  - validation
  - coretime
description: >-
  Accessing Polkadot’s validation resources can be done through a novel way to
  pay for Blockchain usage: Coretime.
readingTime: 10 min
contentHash: e49e03bba5535ad73dc7a8062824ffc57c1e2f27f8b0126027c4aa3c8eb9db63
supabaseId: 34369fdb-9a10-449a-bee4-7af6195c0078
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

So far, we’ve covered the general [Polkadot architecture](/en/blog/blockchain-101/polkadot), and its [consensus mechanism](/en/blog/blockchain-101/polkadot-consensus).

It’s important to clarify that we haven’t covered **all there’s to know** about these topics. As an example, we said nothing about the [requirements to run a validator](https://docs.polkadot.com/infrastructure/running-a-validator/requirements/), or about how finality is achieved through [GRANDPA](https://arxiv.org/pdf/2007.01560), or how [BABE](https://polkadot.com/blog/polkadot-consensus-part-3-babe/) (or its evolution, [SAFROLE](https://wiki.polkadot.com/learn/learn-safrole/)) handles the pseudorandom assignment of validators. I’ll leave these things for you to investigate, so we can focus on the bigger picture.

The [previous installment](/en/blog/blockchain-101/polkadot-consensus) was closed off with sort of a cliffhanger question: how do Rollups **gain access** to Relay chain validation?

Validating an entire block is much more expensive than simply checking if a single transaction is fair game. Plus, Relay chain validators need to load and execute the Rollup’s specific Runtime, which also means that it needs to have been **registered** into the chain at some point.

> We can perhaps make the parallel with a Smart Contract being deployed and then accepting transactions — the main difference being that with Smart Contracts, the L1 validators have direct access to **all the state** they need for validation. With Rollups though, validators need to understand entirely different Runtimes and manage separate state systems.

And then there’s the question of how many validators we allocate to each chain, and why — remember that [ELVES](/en/blog/blockchain-101/polkadot-consensus/#elves-protocol), the consensus algorithm, assigns validators dynamically to different rollups.

This is driven by a fundamental resource allocation problem: validators are expensive and limited, but Rollups have vastly different requirements. Some need constant validation — others only occasionally. How do we fairly and efficiently distribute this precious resource that is **validator compute time**?

The solution comes in the shape of [Agile Coretime](https://polkadot.com/agile-coretime/). But this wasn’t always how things worked, and the journey from Polkadot’s original design to today’s flexible system reveals a lot about the challenges of building a scalable Blockchain infrastructure.

With that, the context is set! Let’s dive in!

---

## The Original Solution

When Polkadot first launched — the version we now refer to as [Polkadot 1.0](https://wiki.polkadot.com/general/polkadot-v1/) — , it did so with an [auction system](https://polkadot.com/blog/obtaining-a-parachain-slot-on-polkadot/).

Simplifying a bit, there were auction periods in which you could place bids (in DOT, Polkadot’s native currency), and the winning bid would secure a lease on a **Parachain slot** for exactly 96 weeks (around two years).

> I’ll refer to Rollups as Parachains for now, since it was the jargon at the time!

Securing a slot was essentially the same as buying yourself a guaranteed spot in Polkadot’s validation schedule. That is, your Parachain would be assigned validators for every single Relay chain block, ensuring consistent 12-second block times. In exchange, the DOTs you bid would be **locked up** for the entire lease duration. You’d lose access to those DOTs completely during that period — it was a massive capital commitment.

<figure>
	<img
		src="/images/blockchain-101/coretime/0*tx2_EuavD1HxOXhm-1.jpg"
		alt="Locked-up money" 
	/>
</figure>

After reading that, I’m willing to bet you have some doubts popping up in your mind. Indeed, this system has some problems. Questions like:

- How long do auctions take?
- Just how much DOT do I need to bid and lock up?
- What happens if I don’t win the auction? Do I get left out of Polkadot’s validation schedule?
- If my Parachain is not producing blocks, am I not wasting network resources?

Well... Yeah. While auctions [weren’t very long](https://polkadot.com/auctions/#auctions-timetable), the bids could escalate to [absurd amounts](https://coinmarketcap.com/polkadot-parachains/polkadot/auction/), often exceeding millions of DOTs — we’re talking **tens of millions of dollars** locked away for two full years. Which of course, were not liquid during the lease periods.

Auctions ran around every 15 days, and if you didn’t win your slot, you were **completely shut out** of Polkadot. Period. No validation, no interoperability, no shared security — nothing.

Lastly, some Parachains had periods of low activity or plain inactivity, in which Polkadot was essentially **validating nothing**. A slot could be allocated to a chain that was doing nothing.

> These were often called **ghost chains**. “Expensive” slots producing empty blocks while other projects sat on the sidelines, unable to access the network at all.

So yes, the situation was kind of a big mess. The bidding process was not very appealing, and if your Parachain had low traffic, it would simply contribute to making resource allocation more inefficient.

<figure>
	<img
		src="/images/blockchain-101/coretime/1*g1fwMIAJjjsMIIBvDEg4Gg-2.png"
		alt="'This is fine' meme" 
	/>
</figure>

It was obvious this **couldn’t scale**. I guess this is why only [20 auctions](https://coinmarketcap.com/polkadot-parachains/polkadot/auction/) were ever held before the system was scrapped, in favor of a more scalable solution that had been set into motion months ago: **Agile Coretime**.

---

## Redesigning the System

One thing was super clear: if Polkadot was to be a scalable Blockchain, it needed a better strategy to allocate validation resources.

Let’s start by addressing the elephant in the room: why the heck do we need **2-year leases**? That’s a really long-term commitment, and nothing guarantees that Parachains will have consistent traffic and activity over that period.

Okay, scratch that then. But now... How do we choose which Parachain to validate on each block? We need a flexible way to allow these systems to pay for **validation time** as they need it.

That kinda sounds like a **resource** you can sell. And a scarce one at that — you only have so many validators, and Relay chain blocks have a limited space, so you can only validate a set amount of Rollup blocks per cycle.

> Yes, I’m gonna start calling them Rollups from this point onwards. I believe this is how the community wants them to be called, so let’s stick with that!

Thus, the concept of [blockspace](https://polkadot.com/blockspace/) as a (commodity) resource was born. When you need the Relay chain to validate your Rollup, you simply buy the blockspace you need, when you need it.

All that remains is to determine how blockspace is offered and consumed.

The solution that emerged from these new ideas is called **Agile Coretime**. It’s built around this simple but powerful insight that different projects may have vastly different needs.

Coretime revolves around the idea of **cores**.

<figure>
	<img
		src="/images/blockchain-101/coretime/0*JAylL9NHVCOlJ46w-3.jpg"
		alt="Jack Sparrow with a confused grin"
		title="A what?"
	/>
</figure>

Yeah, a core.

It’s nothing more than an abstract concept, that can be thought of as a guaranteed validation slot in Polkadot’s scheduling system. Essentially, when you purchase Coretime, you’re reserving a spot in the validation queue.

Polkadot has a **limited number** of these cores (currently around 80, with plans to scale higher). Each core represents the **capacity to validate one Rollup block per Relay chain block**. When it’s time to validate blocks, the consensus algorithm (ELVES) looks at which Rollups have purchased Coretime, and assigns validators accordingly.

> In the old system, renting a slot meant exactly the same as renting a core for two years — ensuring validation resources for your Rollup.

Speaking of, these assembles of validators in charge of checking a Rollup block are doing **actual computational work**. So in each round of consensus, every group of validators is what **really** comprises a core.

<figure>
	<img
		src="/images/blockchain-101/coretime/1*wjBkwSPk6Sd529pIynja_g-4.png"
		alt="A block being validated by multiple validators, representing a core"
		title="[zoom]"
	/>
</figure>

Thus, we can think of a core as a **virtual CPU** of the Polkadot network, which runs a **single program** at each block — and these “programs” are simply the validation of a single Rollup.

> Note that this **core** concept is naturally scarce — each core represents the capacity to validate **one Rollup block per Relay chain block**, so you can only validate as many rollups simultaneously as cores you have available.

And so, Polkadot itself can be thought of as a **giant multi-core distributed** **computer**, capable of running all these Rollup programs in parallel!

That’s pretty cool, if you ask me.

---

## Purchasing Coretime

Now that we understand what cores are, the next question is obvious: how do you **actually buy Coretime**?

And here, Agile Coretime has a couple of super clever tricks. There are **two ways** to purchase Coretime: **bulk**, and **on-demand**. Let’s break them down.

The first model works similarly to a monthly subscription, like the one you have for Netflix.

<figure>
	<img
		src="/images/blockchain-101/coretime/0*DKqdvKN96rr_zKW6-5.jpg"
		alt="Netflix account representing how we share the system to an extreme" 
		title="Unless... You know"
	/>
</figure>

You pay upfront for a fixed period, and in exchange, get predictable access to the service.

What you actually purchase are 28-day chunks of a core’s time, called **regions**. During those 28 days, that core is yours to use however you want — you get guaranteed validation for **every single Relay chain block**.

This is of course perfect for **well-established projects** that need consistent validation. Maybe a busy [DEX](https://www.coinbase.com/learn/crypto-basics/what-is-a-dex) processing thousands of trades daily, or maybe a bridge handling regular cross-chain transfers — these are the kinds of applications that benefit from bulk Coretime.

But it doesn’t end there. These regions aren’t just simple subscriptions. They’re actually **NFTs** that exist on the [Coretime chain](https://docs.polkadot.com/polkadot-protocol/architecture/system-chains/coretime/) — a dedicated System Rollup. These NFTs can be split, shared, and traded on secondary markets, allowing for some very cool behaviors like:

- **Interlacing**: if you want to share the costs of a core with another project, you can use [interlacing](https://docs.polkadot.com/develop/parachains/deployment/manage-coretime/#interlace), and schedule who uses the core at each block. For example, there could be two projects using a core, and they could get alternating blocks (one gets even blocks, the other gets odd blocks).
- **Partitioning**: instead of defining a block schedule using interlacing, another option is to use [partitioning](https://docs.polkadot.com/develop/parachains/deployment/manage-coretime/#partition) to split a region in two smaller chunks. This creates two disjoint regions whose total time equals the original region. And the cool part: you can split it wherever you want!
- **Pooling**: if you have unused bulk regions, you can [place them on a pool](https://docs.polkadot.com/develop/parachains/deployment/manage-coretime/#pool) for other services to consume, while earning rewards.
- **Pipelining**: while interlacing and partitioning are techniques for sharing Coretime, [pipelining](https://wiki.polkadot.com/learn/learn-async-backing/) (or async backing) is a way to make the most out of cores. By not waiting for inclusion of blocks in the Relay chain before starting backing of a new one, validation can happen faster.

<figure>
	<img
		src="/images/blockchain-101/coretime/1*mso91iKh30-JEY1bGoH63g-6.png"
		alt="Interlacing diagram"
		title="[zoom] Interlacing in action"
	/>
</figure>

> Another cool feature is that if you assign your entire region to a single Rollup without splitting or interlacing it, you get **renewal rights** with price protection. This means you can renew your core for the next 28-day period at a capped price increase, protecting you from sudden price spikes.

It’s a very flexible model, pretty much **unprecedented** in Blockchain systems. And it has the potential to create entirely new economic models for sharing infrastructure costs!

On the other end of the spectrum, we have on-demand Coretime.

> To continue with the app analogies, think of it as the Uber of block validation — you only pay for it when you need it!

Instead of buying a whole month upfront, you **bid for validation** on a block-by-block basis. Need your Rollup validated right now? Place a bid, and if it’s high enough, you get the next available slot.

This is perfect for:

- New projects testing their rollups
- Applications with irregular usage patterns
- Governance chains that only activate during voting periods
- Anyone who wants to experiment without a massive upfront commitment

Of course, you need **cores** for any validation activity. So where do these cores come from? Well, the [pooling](https://docs.polkadot.com/develop/parachains/deployment/manage-coretime/#pool) action we described a moment ago actually accounts for this computing time availability, and these “excess” resources are made available through on-demand Coretime!

The pricing is dynamic — the more demand there is, the higher the price goes. But when the network is quiet, validation is cheaper.

---

Overall, this system solves the **ghost chain problem** we saw earlier. Cores won’t stay idle anymore — or at least, if they are, it will take deliberate action from a Coretime buyer.

---

## Summary

Polkadot has come a long way from those rigid 2-year auctions, evolving into this flexible, market-driven Coretime system.

Agile Coretime is a big shift in how we think about Blockchain resources. It focuses on **efficient allocation**, which is key for scalability. And as we know, scalability is one of the big pillars in Blockchain design.

And this is still just the beginning. The Coretime model is relatively new, and we’re already seeing the emergence of secondary markets like [RegionX](https://hub.regionx.tech/?network=polkadot), and creative cost-sharing arrangements.

> It’s a very different value proposition, that’s for sure!

Systems like these have the tendency to develop in surprising and unexpected ways. So I guess that, as with many things in the Polkadot sphere, we’ll have to wait and see what the future holds!

---

Plus, Polkadot isn’t stopping there. The next major evolution is **already in the works**.

Because, hell, if we have the ability to efficiently assign computational resources... Should we limit ourselves to **Rollups**? Can we not generalize to **any kind of computation**?

<figure>
	<img
		src="/images/blockchain-101/coretime/0*5hVpbbmaF_GTFVIK-7.jpg"
		alt="Galaxy brain meme" 
		title="Galaxy brain moment"
	/>
</figure>

We’ll cover that and more in the [next article](/en/blog/blockchain-101/jam). See you there!
