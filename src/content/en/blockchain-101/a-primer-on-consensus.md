---
title: "Blockchain 101: A Primer on Consensus"
date: "2024-09-25"
author: "frank-mangone"
thumbnail: "/images/blockchain-101/a-primer-on-consensus/smaug.webp"
tags: ["blockchain", "bitcoin", "consensus", "proofOfWork", "mining"]
description: "Let’s shift our focus to how a decentralized system can agree on a single truth: through consensus."
readingTime: "10 min"
mediumUrl: "https://medium.com/@francomangone18/blockchain-101-a-primer-on-consensus-505388eaee80"
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

In theory, we have every component we need to build a Blockchain. We already know how [transactions](/en/blog/blockchain-101/transactions) are structured (in Bitcoin, at least), and how they are [bundled into blocks and chained together](/en/blog/blockchain-101/how-it-all-began/#a-chain-of-blocks) to form the structure we named so aptly.

Although we can piece the structure together, a Blockchain is **much more** than that. Recall that the whole point was to build a shared history of events — thus, the way data is stored is **just as important** as understanding how said story **evolves** or **grows** over time.

Since every participant in the network has a copy of the entire Blockchain, it’s crucial that everyone **agrees** on how these separate copies should evolve. But how do they even do that?

Strategies used by the peers in the network — or nodes — to agree on a shared history are known as **consensus mechanisms**, which will be the topic for today!

Consensus mechanisms come in different flavors. We’ll have plenty of time to look at some of them. For now, since we’ve only covered Bitcoin so far, let’s see how this particular Blockchain solves this problem.

Before we get into the good stuff, I want to reiterate this idea, for you guys to always keep in the back of your heads:

::: big-quote
A Blockchain is not only the actual data structure, but also the network of participants that communicate with each other and agree on how the system evolves over time.
:::

> Plus a couple more things.

With this in mind, let’s see what this is all about!

---

## A Toy Example

I guess we could start by asking ourselves: how do network participants (nodes) interact with one another? They do so through a **messaging protocol**. I don’t want to spoil the ending here — let’s start with a simpler example instead.

Staying true to our traditions, let’s suppose Alice, Bob, and Charlie want to set up a Blockchain network amongst themselves.

This time around though, they will not be on a group chat, and they will not have a spreadsheet. Instead, each one of them will just listen for messages from any of the other participants.

And for the time being, we can assume that these messages they send each other will be nothing other than **new blocks**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/block-transmission.webp" 
    alt="Alice sending blocks to other participants"
    title="[zoom]"
    className="bg-white"
    width="500"
  />
</figure>

> Some of you may be thinking — but wait, don’t we need transactions to build blocks? And you’re completely on point! Rest assured, we’ll soon learn about where transactions are stored, and how they are communicated to the network.

Of course, these blocks need to be **valid**. This means that they must point to the last block in the chain, and that they must have a **valid hash**. Remember that the hash is closely related to a [cryptographic puzzle](/en/blog/blockchain-101/how-it-all-began/#working-for-blocks), which doubles up as a measure to randomize both **who** finds a valid block, and **when** they find it.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/nonce-variation.webp" 
    alt="Hashing with a nonce"
    title="[zoom] The nonce is changed until a valid hash is found"
    className="bg-white"
    width="700"
  />
</figure>

Let’s suppose this randomness is enough to guarantee that valid blocks are **never produced at the same time**.

> I want to stress that this is not enough in a more general setting, but we’ll see why that is later in this article.

What could go wrong in such a simple system? Turns out... **Just about everything**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/eeek.webp" 
    alt="A hamster screeching in panic"
    title="Eeeek!"
    width="350"
  />
</figure>

Here, here, let me explain.

Remember that cryptographic puzzle we’ve been talking about? Well, it involves **calculating hashes**. The short version of the story is that if one person can calculate hashes **faster** than the other guys in the network, then that person always has a higher chance of finding the next valid block.

> To cement this idea, just take it to an extreme: Bob has a supercomputer in his backyard, while Alice and Charlie calculate hashes using their laptops. It’s pretty clear who will win this race.

Can you see the issue now? With enough computing power, Bob could always beat Alice and Charlie to the punch, and essentially be the **only block producer in the network**. A centralized system.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/you-swore.webp" 
    alt="Obi-Wan with the iconic 'You have become the very thing you swore to destroy'"
    title="Why Bob, why??"
  />
</figure>

This is a very well-known type of **attack** against Bitcoin — a [51% attack](https://hacken.io/discover/51-percent-attack/). In a system with just 3 nodes, it’s plausible for this to happen. But as we **scale the network** to thousands of nodes, it becomes harder and harder for a single node to be that powerful, or for a single entity to control so many nodes.

It seems that this first issue is only a matter of **scaling**. So let’s grow the network, and see what happens.

---

## A Bigger Network

As you’d expect, Bitcoin is a [big network](https://bitnodes.io/).

It may be no surprise that in this setting, nodes don’t communicate with every other one. It would be impractical, as the only way to do so would be to keep a list of **all** available nodes, which may change over time, and would be quite large.

Instead, what happens is that nodes keep a **short list** of other known nodes. Upon receiving a message, they **broadcast** it to those the nodes in that list. And then, each receiver broadcasts the message to its own list of known nodes. Rinse and repeat, and at some point, everyone in the network will receive the message. This is known as a **gossip protocol**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/gossiping.webp" 
    alt="Gossiping in action"
    title="[zoom] It’s easy to see how the number of receivers grows exponentially fast"
    className="bg-white"
    width="600"
  />
</figure>

> For a more interactive view, check out this [pretty cool simulator](https://ctufaro.github.io/GossipPlot/index.html) of how messages would be gossiped in a network.

Here’s a curveball: **gossiping takes time**. This is something we didn’t have to account for in our system with 3 participants.

Imagine this situation then:

- Node 1 (let’s call it Alice) finds a valid block $A$, and broadcasts it.
- A few moments later, node 2 (Bob) finds another valid block $B$, but hasn’t yet received Alice’s block. Because of this, he also broadcasts the new block.
- Node 3 (Charlie), who is somewhere in the middle, receives two valid blocks. Both are valid candidates to be the next block in the chain.

> Tip: another way this is referred to is as having two blocks at the same **height**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/two-valid-blocks.webp" 
    alt="Charlie receiving two valid blocks, and not knowing which one to accept"
    title="[zoom] Both the pink and purple blocks are valid — which one do we choose?"
    className="bg-white"
  />
</figure>

What now? Which one is the **correct one**?

Just by looking at the block, there’s **no way to tell**. Consequently, **both** need to be attached at the end of our chain. What’s clear is that this state must not last in time — the whole point of Blockchains is to settle on a **single shared history**.

This situation is known as a **temporary fork** or **chain split**.

> Not to be confused with soft forks or hard forks. We’ll look at those in the future.

### Fork Resolution

Believe it or not, all Charlie needs to do in this scenario is to **wait**. Yeah.

Some nodes in the network will append Alice’s block to their Blockchains, and some nodes will have appended Bob’s. Charlie is no exception — he will choose whichever he receives first, but also keep track of the other diverging fork.

They will start working on finding the next valid block immediately after — there’s no time to lose, as we’ll see in just a minute.

So this becomes a question of **which fork grows faster**. In similar fashion to the 51% attack, if the majority of the network has appended block $A$, then it’s highly likely that a new block will appear faster in that fork, and not in the one containing $B$.

And if the majority is working on a fork and not on the other one, then said fork will eventually be the only one that’s growing, and the stale fork will naturally die out.

::: big-quote
In short: one fork will grow faster.
:::

Another way to put this is that one fork has more **computational work** in it, because more effort has been put into finding the correct hashes. This is the reason why this consensus mechanism is called **Proof of Work**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/longer-chain.webp" 
    alt="The longer chain is the accepted one, because it has more work!"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Summarizing, after waiting for some time, Charlie will see that fork $A$ grows faster, and stick to it because it’s what the **majority of nodes** is working on. He sticks to what’s usually called the **canonical chain**.

If Charlie was working on finding the next block in fork $B$, he’ll want to **switch to fork** $A$, and discard fork $B$. This is called a [reorg](https://learnmeabitcoin.com/technical/blockchain/chain-reorganisation/) (short for **reorganization**).

> And in case you’re wondering, the transactions in fork $B$ are lost forever after a reorg. This can and **does** happen in Bitcoin.
>
> The good news is that all you have to do to remedy this situation is resubmit the transaction!

This has a negative consequence: there’s no guarantee that a transaction will be effectively included in the Blockchain once it lives on a block, because reorgs can happen. We have to wait for enough blocks to exist **after** the one where the transaction is included.

This is known as waiting for **block confirmations**, and it’s a very common pattern in some consensus mechanisms. We’ll probably come back to this when we discuss **block finality**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/confirmations.webp" 
    alt="A block is less likely to be reorganized if there are many blocks after it"
    title="[zoom] Once enough blocks are placed on top of our target block, the chances of reorgs become very dim!"
    className="bg-white"
  />
</figure>

---

Marvelous! This **Proof of Work** (PoW) strategy allows us to resolve temporary forks, and keep growing the network. It also proves useful against people trying to do nasty things like controlling which transactions are included in the Blockchain or not — they simply don’t have enough computing power to beat the rest of the nodes altogether.

But a question remains... Why would anyone want to spend their computing resources in finding new blocks? Why not use their powerful machines to play Fortnite in 4K?

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/shrek.webp" 
    alt="Shrek pointing with his finger and smiling"
    title="That's actually not a bad idea"
    width="600"
  />
</figure>

That’s where the last piece of the puzzle comes in: they must be able to **gain something** from doing this — they must have an **incentive**.

---

Incentives
Bitcoin does have such an incentive. Finding the next valid block gives you a small reward in the form of — you probably guessed it — **Bitcoin**!

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/smaug.webp" 
    alt="Smaug from The Hobbit, with lots of gold behind him"
    title="Noice"
    width="600"
  />
</figure>

At this point, you may wonder **where the heck** that reward comes from. There’s no central authority who can pay for it. What’s it then, does it just generate from thin air?

> At this point, you may wonder where the heck that reward comes from. There’s no central authority who can pay for it. What’s it then, does it just generate from thin air?

Blocks include a bunch of “normal” transactions. What we didn’t mention so far is that they also include a **special one**, called the **coinbase transaction**.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/coinbase.webp" 
    alt="Coinbase transaction in a block"
    title="[zoom]"
    className="bg-white"
    width="600"
  />
</figure>

The coinbase transaction simply credits some Bitcoin (in the form of UTXOs) to the block creator’s address (or addresses), as a reward for their hard work. Not any arbitrary amount of Bitcoin, though — the **block reward** is comprised of:

- A base amount called the **block subsidy**, which as of 2024, is [exactly 3.125 BTC](https://river.com/learn/terms/c/coinbase/#:~:text=which%20is%20currently%203.125%20BTC%20per%20block),
- A **fee** for the transactions included in the block. We’ll get back to this in future articles, but this amount is variable.

> By the way: BTC is short for Bitcoin. It’s often used as the currency symbol, in the same way USD is often used as the symbol for United States Dollars.

In other words: yes, new Bitcoin is **magically generated** for every produced block.

<figure>
  <img
    src="/images/blockchain-101/a-primer-on-consensus/stonks.webp" 
    alt="Stonks meme"
    width="600"
  />
</figure>

And this is why the process of finding new valid blocks is called **mining**. It’s as if you’re mining for new Bitcoin!

Notably, this doesn’t mean that the amount of Bitcoin will continue to grow boundlessly. At given moments in time, the subsidy is **halved**, in an event known as the [Bitcoin halving](https://www.coinbase.com/bitcoin-halving). This causes the total amount of Bitcoin that will ever be generated to be [capped at 21 million](https://www.kraken.com/learn/how-many-bitcoin-are-there-bitcoin-supply-explained).

> This is because, mathematically, this behavior corresponds to a [geometric series](https://en.wikipedia.org/wiki/Geometric_series). Under certain conditions, geometric series converge to a finite value — that’s the case of Bitcoin, and that value is the maximum issuance there will ever be.

---

## Summary

Okay, let’s recap real quick!

By now, we know:

- How the transactions are structured, how they are combined into blocks, and how blocks are linked to one another forming the Blockchain.
- How a network of participants are incentivized to continue growing the network, using a system that doesn’t rely on **trust me bro** vibes, but on a powerful consensus mechanism.
- What **mining** is: finding a new block and reaping its reward.

I’d say we’ve come a long way in these three first articles! All that remains cover some gaps in how Bitcoin operates, and we’ll mostly be done with this Blockchain.

It’s important to explain these missing details now, because these are all ideas that will mostly repeat in other systems. It’s a blessing that we can focus on these concepts now, before things become more complex.

And so, I’ll meet you in the next article for the [finishing touches on Bitcoin](/en/blog/blockchain-101/wrapping-up-bitcoin)!
