---
title: 'Blockchain 101: Wrapping Up Bitcoin'
date: '2024-10-15'
author: frank-mangone
thumbnail: /images/blockchain-101/wrapping-up-bitcoin/inception.webp
tags:
  - blockchain
  - bitcoin
  - transactions
  - consensus
description: >-
  With this fourth article, we finish our brief pass through Bitcoin by looking
  at a couple missing key points.
readingTime: 10 min
mediumUrl: >-
  https://medium.com/@francomangone18/blockchain-101-wrapping-up-bitcoin-c01cb572021e
contentHash: 639ae43d0b90b26d686e82778de371f9b42fa783adc59c4ef5385fc9ff73080e
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

A few years ago, back when I didn’t know much about Blockchain, I remember feeling like the knowledge was shrouded in somewhat of a veil of mystery. I suppose the reason for this was that a basic understanding involved a lot of new concepts and terms, and I had to wrap my head around some ideas that didn’t feel all that natural as a user of more traditional systems.

But by now, we’ve already covered most of the basic stuff. We know what [transactions](/en/blog/blockchain-101/transactions) are, how they are [signed](/en/blog/blockchain-101/transactions/#private-and-public-keys) and [grouped into blocks](/en/blog/blockchain-101/how-it-all-began/#a-chain-of-blocks), which are then [distributed through the network](/en/blog/blockchain-101/a-primer-on-consensus/#a-bigger-network), and thanks to a [consensus mechanism](/en/blog/blockchain-101/a-primer-on-consensus), everyone can grow their separate copy of the Blockchain knowing that it will be consistent with their peers’.

With these tools, we should now understand just about enough of the jargon (aka specific language) to move along into other Blockchain systems.

Still, there are many holes we need to address for this Bitcoin story to be complete. Before moving on to other technologies, I want to dedicate this article to (hopefully) covering these remaining questions. And so, this article will be sort of a **potpourri** of concepts and discussions, to wrap things up with Bitcoin.

As a short disclaimer — I’m of course not covering **everything** there’s to know about Bitcoin here. You will most likely still have some questions after reading these first four articles, and that’s totally fine. Again, Blockchains are complex systems — there’s a lot to learn. All I can say is that there’s no better way to learn than to follow your own curiosity!

> But hey, I’m here to help too! Shoot me any questions you have!

Alright, that was quite the long intro. Let’s get to work!

---

## Submitting a Transaction

The theory is fantastic — nodes, consensus, all the good stuff. But how do we actually **use** Bitcoin? This is a network that should be usable by anyone, as long as they have a [wallet](/en/blog/blockchain-101/transactions/#addresses-and-wallets).

In order for a transaction to be processed, it has to be received by a node in the network, and then **broadcasted around** through the gossiping protocol we’ve already talked about.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/gossiping.webp" 
    alt="The gossiping mechanism in action"
    title="[zoom]"
    className="bg-white"
  />
</figure>

There are two options here:

- if we have a **Bitcoin node** running on our computer, we can submit the transaction directly using a command; imagine something like this:

```bash
$ bitcoin-cli sendrawtransaction "0x123ce9819addce1878144fae..."
```

- otherwise, we need a way to **announce** our signed transaction to a node — this means that the node needs to expose some way for users to communicate with it.

> Most people just want to use Bitcoin, and are not running a node themselves. The second scenario is the most common one.

And how do we expose a program to the internet? Through an [API](https://en.wikipedia.org/wiki/Web_API), of course!

Bitcoin nodes can be configured to expose what’s called a [Remote Procedure Call](https://mobterest.medium.com/demystifying-remote-procedure-calls-rpc-for-beginners-a-comprehensive-guide-7e639c92ea17) (or **RPC**) API. Through this API, users can submit a **call** (for instance, “send transaction”), which will then be executed by the node.

> Some platforms such as [Quicknode](https://www.quicknode.com/docs/bitcoin) even expose this API as a service.

### A Transaction’s Journey

So, you just announced your transaction to a **single node**. At this point, this is the only node in the network that knows about your transaction.

But remember, the chances of said node finding a valid block are similar to the odds of **winning the lottery**. In other words, it’s unlikely that under these conditions, your transaction will be included in a block any time soon.

Then... How does Bitcoin manage to include our transactions? Aliens?

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/aliens.webp" 
    alt="I'm not saying it was us... But it was us"
    title="Of course it’s always aliens"
    width="600"
  />
</figure>

Solving this is as simple as **gossiping transactions around**, just like blocks. And once a node receives a transaction, it places it in a sort of **bag**, called the **transaction pool** or the **mempool**.

This is kind of a **waiting area**. Each node will decide which transactions they want to include in a block, and then they start mining.

> Usually, they select the transactions that give them a better incentive — remember there’s a reward attached to each transaction.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/transaction-pool.webp" 
    alt="Transactions flowing into the transaction pool"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Finally, upon receiving a block, each node will **verify** and **process** the transactions in it, to get to the **new state** of the network. In doing so, it will check if any of the included transactions are present in the mempool, and clear any duplicates.

> It’s an important cleanup process that avoids unnecessary memory usage.

And, as they say, the rest is history.

---

## A Closer Look at Blocks

Up until now, our mental model for **blocks** has been that of a **box** containing a bunch of **transactions**, a **nonce**, and a **hash** pointing to the previous block. While this is not far from the actual model, we’ve been quite loose in defining some points.

Let’s take a closer look. For example, what more can we say about that **hash** in our blocks?

From our current perspective, all we care about is being able to **point to the previous block**, thus forming the Blockchain itself. We’re thinking of this hash as an **identifier** (which it is), which should be uniquely determined by the transactions included in a block.

What we’re not thinking about is **reading efficiency**. Picture this: you want to check whether a transaction you published a while ago is included in the Blockchain. It’s as easy as reading blocks, and checking whether if your transaction is there or not, right?

Well, yes — but considering that blocks can have up to a **couple thousands** transactions per block, you might be spending some unnecessary time reading through a long list of transactions you don’t care about!

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/spongebob-scroll.webp" 
    alt="Spongebob reading a really long scroll"
    width="450"
  />
</figure>

There’s a very special way we can organize transactions to provide a more efficient way to read them: using [Merkle trees](/en/blog/cryptography-101/hashing/#merkle-trees).

> I’ve already talked about those in the [Cryptography 101](/en/reading-lists/cryptography-101) series, specifically in [this article](/en/blog/cryptography-101/hashing). For a better understanding of the structure, I suggest checking that out!

With Merkle trees, what we can do is generate a **short proof** of the fact that a transaction is included in a block. For this, we first need to calculate what’s called a **Merkle root** from all the transactions:

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/merkle-tree.webp" 
    alt="A merkle tree"
    title="[zoom] The Merkle root is calculated by hashing two leaves at a time, until we get a single hash"
  />
</figure>

The Merkle root works as a kind of **fingerprint** for the transactions we started from — change a **single transaction**, and the root changes completely. But this isn’t the only neat thing it brings to the table: it also allows us to create a **proof** that a transaction is associated to a **root**, without providing all the starting transactions.

> Again, the details about the process are [here](/en/blog/cryptography-101/hashing/#merkle-trees)!

I’m not sure if this is enough to convince you, but yeah, the Merkle root is indeed important for efficient block reading. It’s also important for efficient memory management of nodes.

Let’s include it, then! But **where**?

### Organizing Blocks

How about we organize the information contained in a block a little? There are at least **two obvious types** of data that we want to store in a block:

- **Transactions**, which are what drive the system forward,
- **Other data** that’s used for different purposes, but mainly, **verification**.

And so, we can separate blocks into two parts: the **header**, where this other data lives, and the **body**, containing the transactions.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/block-structure.webp" 
    alt="A block, divided into body and header"
    title="[zoom] Now this is closer to how a block looks"
    className="bg-white"
    width="600"
  />
</figure>

> Notice that there are a couple more things in the headers. Don’t mind those — just remember that they are needed for a correct functioning of the network!

That just about rounds up the technical details that I want to present in this short introduction to Bitcoin. For a twist, let’s now lean towards more philosophical aspects of the technology.

---

## Is Bitcoin Good?

As a technology, Bitcoin was groundbreaking for sure, and paved the path for a myriad of new technologies to surge, bringing new, diverse paradigms to the table.

But there were certainly doubts. Heck, there **still** are lots of doubts around it.

And I guess, the question **“is Bitcoin good?”** can be interpreted in various ways: has the technology withheld the test of time throughout these first 15 years since its conception? Is it efficient enough in comparison to other technologies? Is it **really** worth it as an alternative for traditional centralized approaches?

I’ll try to address some of those, but these are just my thoughts and opinions (and occasionally, some facts). These questions don’t have a single answer, of course — just take the remainder of this article with a grain of salt.

### Energy Consumption

One of the main points of debate around Blockchains (and particularly, **Proof of Work** Blockchains) is that maintaining the network consumes a lot of energy. Enormous computational effort goes into solving a puzzle by **trial and error**, which means that most energy is simply wasted into **failed attempts**.

This translates into a **lot** of electricity being consumed by Bitcoin. How much, you may wonder? According to some sources [here](https://digiconomist.net/bitcoin-energy-consumption) and [here](https://ccaf.io/cbnsi/cbeci), enough to power a country roughly the size of Poland. Generating this energy also contributes with **carbon emissions**, which are thought to be harmful for the environment.

> It’s important to never lose perspective though — global aviation has a carbon footprint at least [ten times higher](https://www.sustainabilitybynumbers.com/p/aviation-climate-part-one#:~:text=This%20is%20shown%20in%20the%20chart%20%E2%80%93%20one%20line%20shows%20CO2%20emissions%20only%2C%20and%20the%20other%20is%20shown%20in%20CO2%2Dequivalents%2C%20with%20altitude%20impacts%20included.), and still only accounts for around 3% of global carbon emissions. So if it’s the environment we care about, maybe there are other things we should focus on!

Whether you care about the things I pointed out before or not, what’s clear is that Bitcoin is **inefficient** in how it allocates computing resources. Hell, there’s even a bathhouse in New York that [uses residual heat from Bitcoin mining to heat their water](https://www.reddit.com/r/Bitcoin/comments/14gtlzl/new_yorks_bath_house_spa_uses_bitcoin_miners_to/)!

It’s only natural to ask ourselves: **can we do better**? Other Blockchains have switched paradigms to try and make their networks more efficient, as we’ll see in future articles.

### Speed

Blocks in Bitcoin are produced around [every 10 minutes](https://www.coinbase.com/learn/crypto-basics/bitcoin-block-reward-block-size-block-time-whats-the-difference#:~:text=process%20larger%20blocks.-,What%20is%20Bitcoin%20Block%20Time%3F,-Block%20time%20refers). This was chosen to try and strike a good balance between how fast new blocks are created, and the time needed for validators to receive new blocks, validate them, and append them to their Blockchains.

> The wait can be even longer if we want a certain number of **confirmations** on top of the block including our transactions.

I suppose the right question is: is Bitcoin **fast enough**? And honestly, the answer is that it **depends**.

When paying for your morning Starbucks coffee, where you need to use your card at a POS and wait for the “approved” message. This should take no longer than a few seconds. Bitcoin is most certainly **not suitable** for that.

But what about cross border payments, or operations that may take days? Waiting for half an hour doesn’t look **half bad** compared to those, eh?

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/inception.webp" 
    alt="Suspicious Leo DiCaprio from Inception"
    title="I see what you did there"
    width="600"
  />
</figure>

And let’s not forget: this delay, even though it can be viewed as a cost, comes with the benefit of an **immutable**, **unstoppable** transaction. Which brings me to the next point.

### Centralization vs Decentralization

Finally, the question is... Do we even care about immutability? Do we care that no one can stop us from sending a transaction? Do we want that kind of power?

Again... It depends. Sometimes, it’s good to have a bank that can take care of a situation involving thievery, or we want to be able to give them a phone call and kindly ask to revert a transfer that was sent to a wrong account.

In Bitcoin, this is just not possible. You misspelled the receiver of your transaction? Tough luck, boy. Your keys got stolen? Say goodbye to your funds.

Having so much power over your finances comes at a cost, like Spiderman once learned from Uncle Ben:

::: big-quote
With great power, comes great responsibility
:::

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-bitcoin/crying-peter.webp" 
    alt="Peter Parker crying"
    width="600"
  />
</figure>

> There’s even a guy who had 7500 BTC and lost them, because his key was in a hard drive that he [threw away](https://news.bitcoin.com/british-man-who-lost-7500-btc-sues-for-right-to-search-council-landfill/). And there’s just not much to do about it.

In short: the decision of using Bitcoin depends on whether you’re willing to handle your money at your own peril. Some people thrive in doing this, while others would prefer a solution that offers other guarantees. And there are also middle grounds, like having some money in banks, and some money in Bitcoin.

But some banks don’t really like cryptocurrencies like Bitcoin (we’ll talk about others in future articles), and they may choose to close your account if suspicious (crypto) activity is detected.

Regulation around this stuff has been kind of a rollercoaster of emotions over the years, and varies from country to country. It’s hard to say where everything will wind up. Only time can tell!

---

## Summary

With this, we’ve covered pretty much everything I wanted to touch upon about Bitcoin. There’s still more to learn of course, but I think this is a good place for us to stop. If you want a **full dive** into Bitcoin, I suggest reading [Mastering Bitcoin](https://www.amazon.com/Mastering-Bitcoin-Programming-Open-Blockchain/dp/1098150090).

---

Originally, Bitcoin set out to solve a **single problem**: creating a decentralized **digital cash** system. At that, it succeeded.

In reality, we may want to create other types of **decentralized applications**. In this sense, Bitcoin lacks diversity, as it’s designed to only represent cash.

What if we want to, for example, create a decentralized voting system? Or if we want to have multiple currencies? Or if we want to do on-chain loans?

We could design another type of transaction system tailored for any one of those purposes. But as we’re required to build more and more different types of applications, such an approach quickly becomes impractical.

To accommodate our needs, we’d need something like a **programmable Blockchain**. A system that solves consensus, but allows us to create diverse applications depending on our use-case. A system that can handle a **generalized state**.

This is what the creators of [Ethereum](https://ethereum.org/en/) set out to solve [back in 2013](https://en.wikipedia.org/wiki/Ethereum#:~:text=Ethereum%20was%20conceived%20in%202013%20by%20programmer%20Vitalik%20Buterin) — and we’ll learn how they did it, and how they took the world by storm, starting in the [next article](/en/blog/blockchain-101/enter-ethereum)!
