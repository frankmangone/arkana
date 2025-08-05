---
title: "Blockchain 101: Polkadot"
author: frank-mangone
date: "2025-08-05"
thumbnail: "/images/blockchain-101/polkadot/0*2X_pmsJZlxGr-E_N-8.jpg"
tags:
  - polkadot
  - blockchain
  - rollup
description: >-
  It’s finally time to uncover the secrets of a personal favorite: Polkadot
readingTime: 11 min
contentHash: # TODO: Add content hash
supabaseId: # TODO: Add supabase ID
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

This is a very special one for me.

I’m a former [Polkadot Blockchain Academy](https://polkadot.academy/) alumni myself. I attended the academy back when it was fully on-site, and back when the rough edges were still being ironed out.

<figure>
	<img
		src="/images/blockchain-101/polkadot/1*U3dp-7w_-KNgESLridUBCw-1.png"
		alt="A picture of me with a couple friends from the academy" 
		title="That’s me in the middle, desperately needing a haircut, along with my fellow warriors Emiliano and Ernesto"
	/>
</figure>

It was an incredible time. I remember being mesmerized by the technology. And even though it was one of the toughest experiences in my life, the challenge was truly enjoyable.

> I wholeheartedly recommend anyone wanting to learn or cement their knowledge in Blockchain to enroll!

Some students continued working in the Polkadot ecosystem after the academy, but not me. Initially, the product I was working on at the time was meant to be onboarded into Polkadot, but it ended up not working out commercially. So over time, the details I had learned started fading from my memory. Plus, Polkadot itself kept evolving, and I just couldn’t keep up back then.

But now I can. So these articles are as much for you, dear reader, as they are for me: this is my effort to catch up to speed, while telling you all about this fantastic Blockchain.

---

Polkadot is a **behemoth**. This will take more than a single article for a comprehensive covering, so we’ll start with an introduction to the cool features this Blockchain has to offer.

Enough of this long intro! Let’s not waste any more of your precious time, and jump right into business!

---

## Revisiting Rollups

Not too long ago, we explored the definition of [Rollups](/en/blog/blockchain-101/rollups), also referred to as layer 2s, or L2s. As a refresher, a **Rollup** is a distributed ledger technology that delegates the consensus workload to a parent Blockchain, often called the layer 1 (L1).

> And as I’ve [mentioned before](/en/blog/blockchain-101/blockchain-safari/#sidechains), this is usually phrased as the L2 **inheriting** the L1’s security.

Maybe it’s just me, but I feel like most people would immediately associate the idea of **Rollups** with the **Ethereum ecosystem**. I mean, it wouldn’t be such a wrong assumption, given that the list of Rollups in Ethereum is quite lengthy.

However, a Rollup is in reality a **more general concept**. Bitcoin even has some L2 solutions like [Rootstock](https://rootstock.io/) or [Lightning Network](https://lightning.network/), and I read not too long ago that some L2 systems [are also popping up in the Solana ecosystem](https://solanacompass.com/projects/category/infrastructure/scaling).

It seems like the Blockchain community nowadays acknowledges that L2s are useful solutions... But it wasn’t always like this.

You see, neither of the L1 technologies I’ve mentioned so far were designed **with Rollups in mind**. They were conceived as isolated, one-stop-solution systems. And that’s fine — the idea just wasn’t around when they were first created.

This has led to some complications, the most important one being what’s called **state fragmentation**. In a nutshell, this means that the **global state** of all the L2s in an ecosystem is **scattered**, with each L2 having its own independent state.

What’s more, moving assets from one L2 to another L2 is quite a problem. This is what we generally call **interoperability — **allowing different systems to understand each other, and transfer assets between one another. But because most Rollups were also conceived as isolated systems, interoperability was simply not part of the plan, and in consequence, state fragmentation remained a problem.

I know [a lot of effort](https://cointelegraph.com/magazine/ethereum-l2s-interoperability-roadmap-complete-guide/) is being put into achieving this interoperability, and it’s really commendable. Still, I can’t help but to ask: if we had known the preponderance Rollups would have today, wouldn’t we have wanted to create a Blockchain designed to **fully support them** from the get go, with full interoperability and everything?

Luckily, that question **does have an answer**. [Gavin Wood](https://en.wikipedia.org/wiki/Gavin_Wood), one of the creators of [Ethereum](/en/blog/blockchain-101/ethereum), had this same foresight back in the early days of Blockchain, and decided to leave his original team to pursue his ideas on how to build a system capable of fully sustaining these satellite Rollups, and giving them the infrastructure needed for seamless interoperability.

And those ideas became Polkadot.

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*jOoz3YYCD0qIAhjQ-2.png"
		alt="The Polkadot logo" 
	/>
</figure>

---

## Starting From Scratch

So how do we design this system from the ground up?

First things first: we want Rollups to be the **protagonists**. We’ll be building a base layer, but it’s not meant directly for users. Our intention is for Rollups to be the consumers of this base layer, and users to use the Rollups. Thus, the base layer focuses on solving **consensus**, so that the Rollups can implement custom logic.

In other words:

> The base layer doesn’t need to support Smart Contracts

Yeah, I know — it sounds a bit daunting. The ability to create programs is what made Ethereum so revolutionary, and here I am, telling you that Polkadot’s foundations **deliberately avoid them**. But that’s exactly the point: we won’t be discarding the ability to define custom logic entirely — we’ll just place it somewhere else.

> Kinda as if Ethereum didn’t support Smart Contracts, and only the Rollups did.

Okay, that’s an interesting thought. However, it doesn’t solve the other fundamental problem: **state fragmentation**.

The second piece of the puzzle is that we should devise some way for Rollups to communicate with each other **natively**. That is, there should exist some sort of **protocol** that’s understood by both the base layer and the Rollups, and which allows stuff to be moved from one Rollup to another.

We won’t go any further in our thought experiment, as we already have some important guidelines for our design (and we don’t have the time to invent a Blockchain in this post!), namely:

- Minimal base layer
- Native cross-chain (or cross-rollup) communication

All that remains is to see how Polkadot brings these ideas to life.

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*SQMSBMpGYE6rM8Tl-3.jpg"
		alt="An image from the movie Frankenstein, with caption 'it's alive!'" 
	/>
</figure>

---

## A Blockchain of Blockchains

In Polkadot, the base layer we’ve been talking about is called the **Relay chain**.

It’s exactly what you would expect: intentionally minimal, focusing solely on **consensus** and **coordination**. It has no support for Smart Contracts nor complex application logic — just the essentials for keeping the entire network secure and synchronized.

We’ll talk about the Relay chain in the next article. For now, let’s just focus on the other components: the Rollups, which is **where logic lives.**

We\*\* \*\*can divide them into two categories:

- The [System chains](https://docs.polkadot.com/polkadot-protocol/architecture/system-chains/), which provide essential functionality.
- And the other **custom** Rollups, originally called [Parachains](https://docs.polkadot.com/polkadot-protocol/architecture/parachains/).

> By the way, the Polkadot community is slowly replacing the term **Parachain** by simply **Rollup**. This has a reason to be, but it will make more sense once we talk about [JAM](https://wiki.polkadot.network/learn/learn-jam-chain/) in future articles.

Two key aspects must be discussed here: first, we need to understand how logic is **expressed**. Secondly — and not of less importance — , we also need to understand how the Relay chain **provides consensus** to these Rollups.

Let’s answer one at a time. The remainder of this article will be dedicated to the former question, and we’ll have an **entire delivery** to answer the latter one.

---

## Logic in Rollups

Normally, we think of logic in terms of **Smart Contracts**, or similar artifacts — such as [Programs in Solana](/en/blog/blockchain-101/solana-programs), or [Validation Scripts in Cardano](/en/blog/blockchain-101/blockchain-safari/#cardano). There’s a clear pattern here: the user is able to define any custom logic, and the Blockchain is prepared to interpret and execute these instructions.

But seldom do we stop to think about the implications. If you recall our brief passage of [storage](/en/blog/blockchain-101/storage) and [contracts](/en/blog/blockchain-101/smart-contracts) in Ethereum, we had to come up with lots of gadgets to allow things to be neatly stored, and processed via a list of instructions (opcodes). Without a doubt, the machinery is impressive, but its **tailored for generality**.

> Which is kind of an oxymoron, now that I think about it.

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*-87c1cRlv30RmeId-4.jpg"
		alt="Like a gentleman meme" 
		title="Ah yes, most accurate"
	/>
</figure>

Think about it. It means that every single node in an EVM or SVM network needs to speak the language of their respective virtual machine — it must flawlessly execute every possible instruction, manage virtual stacks, handle arbitrary memory layouts, and deal with the unpredictable resource consumption of any code someone might deploy.

And all this generality **comes at a cost**. Both these systems suffer from being on the slower and more expensive end of execution, because they have to be **prepared for anything**, and this often leads to inefficiencies.

In some scenarios though, this might not be necessary. Let’s imagine for a moment we want to design a Blockchain where you can only create and transfer fungible tokens (fancy word for coins).

> Something like Bitcoin, but with multi-token support.

You don’t need the ability to execute **any** kind of instruction — just **a few simple functionalities** will do the job. You wouldn’t need to communicate with a general `sendTransaction` call — instead, simple instructions like `mintTokens` could focus on specific tasks.

Again, another unfamiliar and curious idea. But how do we do that?

### Runtime

In Polkadot, instead of deploying individual Smart Contracts or Programs to a general-purpose VM, you define your **entire Blockchain logic** as a single program, called the [Runtime](https://docs.polkadot.com/polkadot-protocol/parachain-basics/node-and-runtime/#runtime).

A Runtime defines **every single rule** your Blockchain should follow. It specifies the allowed operations, how to process them, how to manage accounts, how fees are calculated — everything. So it’s essentially your **entire state transition logic!**

Naturally, you may be wondering how to even** begin** writing that kind of code.

Don’t worry, you don’t have to start from scratch — there’s an entire suite of tools to do this, called the [Polkadot SDK](https://polkadot.com/platform/sdk/) (previously known as [Substrate](https://github.com/paritytech/substrate)). In there, you’ll find modular building blocks called **pallets** — pre-built, carefully crafted and optimized (but opinionated) components ready to use in your Blockchain logic.

> For example, there’s a pallet for account management. And one for multisignatures. And if you want to build something more complex like a DEX, you need only combine a few existing pallets, and add some custom logic on top — through a set of utilities called [FRAME](https://docs.polkadot.com/develop/parachains/customize-parachain/overview/) (Framework for Runtime Aggregation of Modularized Entities).Interestingly, there are pallets to **add Smart Contract functionality** into a Rollup. Although counter-intuitive at first, the idea is that developers can **opt into** the behavior if they wish to do so.There was a push for a new Rust-based Smart Contract language called [Ink!](https://use.ink/), which only required the addition of [pallet-contracts](https://use.ink/docs/v5/how-it-works). And while Ink! it’s still under active development, I believe as of late the community’s focus has shifted to [PolkaVM](https://docs.polkadot.com/polkadot-protocol/smart-contract-basics/polkavm-design/), which promises a more streamlined experience through some other specialized pallets. Don’t worry, we’ll talk about this later!

Finally, this Runtime gets compiled into binary code. Traditionally, the compilation target was [WebAssembly](https://webassembly.org/), though the ecosystem is slowly evolving toward [RISC-V](https://riscv.org/) architectures for better performance.

But we’re not even **halfway** done yet. Let’s say we’ve managed to craft the binary for our Blockchain. Cool stuff. But how does the story continue? Who executes this code, and how?

---

## Node Architecture

We already know full well that a Blockchain is conformed by **nodes** that understand state transition logic. And so, it will be the job of a node of our Parachain (or Rollup) to interpret and execute Runtime code!

Parachain nodes consists of a **client** (or **host**) that can communicate with and execute a Runtime. It’s essentially an execution environment for our compiled binary — a **mini VM**, if you will.

In other words, it handles all the **infrastructure**, while the Runtime is in charge of the **logic**. It manages things such as:

- a **database **for storage
- **networking** with other nodes
- the **transaction pool**

> You know, standard node stuff.

But in place of the static execution logic you’d find in other Blockchains, these nodes have sort of a **socket** where **any Runtime** can be inserted. Through [Runtime APIs](https://paritytech.github.io/polkadot-sdk/book/runtime-api/index.html?highlight=host+function#runtime-apis), the host can call Runtime functions, and through **host functions**, the Runtime can communicate with the host to use some of its functionalities, like accessing database storage.

<figure>
	<img
		src="/images/blockchain-101/polkadot/1*i6Yd6Uj19juEzCX86fQ04Q-5.png"
		alt="Node architecture"
	/>
</figure>

This is a cool concept, because it allows us to **reuse nodes** for all kinds of Runtimes. Speaking of which... Where’s the Runtime stored?

### Storing the Runtime

In principle, the Runtime could be stored anywhere. A simple solution would be to distribute it alongside the source code of a node. For each Parachain, you’d simply say “hey, use the standard client code, and use this particular Runtime”.

But the folks at Polkadot had yet another trick up their sleeves — and a very clever one: how about storing the Runtime **directly on the Blockchain**?

> Don’t tell me your first thought wasn’t “why the heck would I even do that”?

It’s a weird thought, yes, but there’s good reason for it: **forkless updates.**

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*GgYFTs-u6hK-iIXO-6.jpg"
		alt="Steven He in his classic what the hell meme" 
		title="What the heeeeell?"
	/>
</figure>

You see, as we mentioned before, logic is traditionally baked directly into the node software. This means that when you want to upgrade how transactions are processed, you need either a **hard** or **soft fork** — a complex and risky process that requires every node operator to **manually upgrade** the software they are running.

Now, because of how node architecture is designed in the Polkadot SDK, we can do something quite remarkable and frankly very disruptive here: we can update the Runtime code **without changing the node’s architecture**.

Still, we would need to make sure everyone changes to the correct version of the Runtime **at the same time**, because otherwise we could still have fork situations. However, by storing the entire Runtime code **directly on the Blockchain’s state** (in a reserved location), everyone can simply use whatever Runtime is the current one, and no forks would form — a **forkless update**!

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*pnKp1id1YOp0Fo6X-7.jpg"
		alt="Mind blown meme" 
		title="Beautiful"
	/>
</figure>

> No coordination needed!

**But** — there’s **always** a but — it also has some risks. For instance, we have one problem that also plagues other Blockchains: if we don’t thoroughly test the new Runtime, we could be introducing vulnerabilities or errors into the **entire Blockchain**.

In addition to that, other **new** problems appear. What if the new Runtime is not compatible with the **old state**? In that situation, we’d need to perform some sort of migration — and this may not be a simple feat at all! It needs extensive simulation and testing, so that we’re 100% sure everything will go smoothly when executed.

Potential problems aside, it’s an undeniably interesting concept. I guess time will tell if it is a genius architectural decision or an operational nightmare, but at least the possibility is there!

---

## Summary

I think this is a good place to stop for now.

Things are flowing quite nicely after our initial questions. We covered a good deal of how **logic** is handled in Polkadot Rollups, with nodes working like those old-school gaming consoles with a socket for cartridges, where we can insert our custom Runtime.

<figure>
	<img
		src="/images/blockchain-101/polkadot/0*2X_pmsJZlxGr-E_N-8.jpg"
		alt="A family gaming console" 
		title="Ah... The good old days"
	/>
</figure>

It was certainly a lot... But believe it or not, we’re **barely scratching the surface**. This is just the warm-up!

> And I’m not even counting all the specifics behind node architecture. To be fair though... I guess this is true for most of the Blockchains I’ve covered!

Many questions are still unanswered. In particular we haven’t talked about the role of the **Relay chain**. We said earlier that it provides **consensus** — but how? What kind of communication needs to happen between Rollups and the Relay chain? What information needs to be shared?

I’ll try to answer these questions and more on our next encounter. See you again soon!
