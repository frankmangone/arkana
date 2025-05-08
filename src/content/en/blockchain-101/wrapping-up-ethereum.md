---
title: "Blockchain 101: Wrapping Up Ethereum"
date: "2025-04-07"
author: "frank-mangone"
thumbnail: "/images/blockchain-101/wrapping-up-ethereum/ethereum-coin.webp"
tags: ["blockchain", "ethereum", "hardFork", "ether", "gas"]
description: "A few last comments on important architectural aspects of Ethereum, rounding up the section on this Blockchain!"
readingTime: "11 min"
mediumUrl: "https://medium.com/@francomangone18/blockchain-101-ro-ethereum-8493b8072862"
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

Since we’ve already covered quite a few key concepts of Ethereum, I believe we should start this one off with a quick recap.

- We started by presenting some of the biggest and most revolutionary [ideas introduced by Ethereum](/en/blog/blockchain-101/enter-ethereum) – and crucially, **Smart Contracts**.
- Then, we took a nosedive into the inner workings of these Smart Contract thingies, exploring how they handle [storage](/en/blog/blockchain-101/storage), and how they’re able to [execute complex user-defined logic](/en/blog/blockchain-101/smart-contracts).
- Finally, we briefly talked about the current [consensus mechanism](/en/blog/blockchain-101/consensus-revisited) that’s responsible for securing the history of the network.

Naturally, there’s much more to say about Ethereum. Today, we’ll tackle some of the missing aspects that we’ve left uncovered so far – but again, this won’t be the full story.

> Think of this as a not-so-shallow introduction!

With this in mind, let’s get straight to business!

---

## Updating Ethereum

In the previous article, we mentioned how there was **an event** in which Ethereum stopped using Proof of Work as its consensus mechanism of choice, and switched to Proof of Stake.

What was this event, exactly? And how did it even work?

> I mean, it sounds simple, but of course, it isn’t.

Let’s try to ponder the implications of this kind of change.

Blockchains are, at their very heart, **distributed systems**. Switching the consensus mechanism essentially means changing the **rules** of the game — this is, the rules that nodes in this system need to follow in order to participate in the network, and help grow the Blockchain.

And as we’ve already mentioned, these rules are **programmed** into the nodes of the network. So, summarizing:

::: big-quote
Upgrades to the network mean changing the source code of nodes
:::

And there’s a catch — and a very important one: Blockchains are, as we already mentioned, **distributed systems**.

In other words, besides the actual [data structure](/en/blog/blockchain-101/how-it-all-began/#a-chain-of-blocks), the “Blockchain” is a bunch of nodes distributed across the globe, owned by different people or groups of people, and communicating with each other.

You can’t just shut down old nodes, and turn on new ones. **Coordination** is essential. Plus, there’s another aspect to consider: we have **no guarantee** that everybody will migrate to the new node version.

Which raises a question: what happens to those nodes that choose **not** to make the upgrade?

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/thinking-statue.webp" 
    alt="A statue in thinking position"
    title="Most intriguing, indeed."
    width="600"
  />
</figure>

### Hard Forks

Obviously, the older version was a perfectly valid implementation at some point, that was originally able to talk to other nodes. Depending on the type of change, old nodes may become incompatible with new nodes — but they’ll still be compatible with other old ones!

This leads to an interesting situation: existing old nodes that don’t want to switch to a newer version might be able to communicate with each other, and agree on new blocks. All the while, new nodes will do the same thing, but agree on **different blocks**. So the Blockchain **splits**.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/hard-fork.webp" 
    alt="A hard fork, showing how the blockchain splits"
    title="[zoom]"
  />
</figure>

This is what’s known as a **hard fork**.

As new, upgraded nodes start to put the new rules into action, new blocks start being generated, and as more upgraded nodes come into play, they peg on the new history. But old nodes can’t understand that — so they agree on a different story!

We normally expect everyone to make the upgrade at some point, so the old fork organically dies out. Although this may not happen fully!

> In fact, [Ethereum PoW](https://www.oklink.com/ethw) is still running, but we no longer identify it as “Ethereum”.

### Soft Forks

Not every change is made equal, though. Some are more extreme than others. For example, let’s imagine a situation where we keep the same old set of rules, but we only add a **few new ones**. The “upgrade” is just a slightly more restrictive version of the old code. What happens then?

Well, blocks produced by upgraded nodes will **look valid** to old nodes, but **not the other way around**.

This creates a situation of **partial backwards compatibility**. Old nodes might still participate in consensus — though they may miss out on some of the new features and restrictions. And they’ll accept blocks from upgraded nodes, because these blocks follow the old ruleset!

And there’s another interesting consequence: old nodes might **temporarily** agree on new blocks that are **invalid** in the eyes of new nodes. Meaning that they might temporarily follow a chain that’s invalid for new nodes, who will be looking at a different chain that conforms to the new rules.

So this is also a fork in the chain — alas, of a different type: a **soft fork**.

The difference is that, as long as most of the network is upgraded, any soft forks will naturally die out, as it will be ruled out by upgraded nodes. So the beauty is that we don’t risk splitting the network into **competing chains**.

### Update History

In Ethereum’s history, many upgrades have been soft forks. Unlike the dramatic switch to Proof of Stake (a hard fork), soft forks have introduced more subtle changes like new opcodes, gas cost adjustments, or security improvements — all while maintaining compatibility with older nodes.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/history.webp" 
    alt="A timeline showing the different updates of Ethereum"
    title="[zoom]"
  />
</figure>

> You can find the full history of changes [here](https://ethereum.org/en/history/).

You’ll notice that after The Merge, the upgrades started using these funky names — and there’s good reason for that. Nodes were split into two parts: an **execution client**, responsible for handling the logic of transactions, and a **consensus client**, which is responsible for well... Consensus!

> I don’t want to spoil all the fun, so for more information, check this [article out](https://medium.com/topic-crypto/how-ethereum-names-updates-why-its-confusing-b1a07f0de4d0).

The next upgrade in line is Pectra, which comes packed with some cool new features, like a novel way to handle [account abstraction](https://medium.com/@bustosgonzalom/the-gem-of-pectra-eip-7702-the-setcode-transaction-e55593b0533a).

---

## Evolving the Network

Okay! We now have a better idea of how upgrades to the network happen.

Upgrades are a good thing. After all, Blockchains are fairly young systems—and there’s a lot of room for improvement, be it through new features, better performance, or more powerful cryptographic primitives.

But who or what decides what new features to include into the network?

### Ethereum Improvement Proposals

Unlike more traditional software, there’s no single company or person who owns Ethereum directly. Instead, improvements need to follow a **process** centered around community proposals, called **Ethereum Improvement Proposals**, or **EIPs** for short.

An EIP is simply a document that proposes a new change or feature for the network. It states not only the reasons for the change, but also outlines how it should be implemented.

These documents have a standardized lifecycle:

1. **Idea**: Someone comes up with an idea to improve Ethereum.
2. **Draft**: The idea is formalized into a proper EIP document.
3. **Review**: The community discusses and provides feedback.
4. **Last Call**: Final chance for comments before moving forward.
5. **Final/Accepted**: The proposal is accepted and ready for implementation.
6. **Implementation**: Developers incorporate the changes into client software.

For an EIP to become part of Ethereum, it needs to gain approval from core developers, client teams, and more generally speaking, the broader community. In this sense, the system embraces **decentralization** in its evolution, ensuring that good ideas and merit drive progress, rather than authority.

### Testing Changes

Now, this is all good and dandy — until we remember that this is **software** we’re talking about. Written by us humans, who constantly make mistakes.

And Blockchains are these highly-coordinated systems that need to work in nothing short of a **perfect harmony** to operate properly. How do we ensure upgrades don’t break everything?

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/how-much-did-you-break.webp" 
    alt="Thanos & Gamora meme, with Thanos saying how he broke all the code"
    width="600"
  />
</figure>

We need a way to **test the changes** before they reach the network. Traditional software development solves this by having multiple environments — so why can’t we **do the same**?

This is where **devnets** come into play. **Devnets** are also conformed by nodes that communicate with each other, who share some history imprinted into the Blockchain, but that are **totally unrelated** to the main, canonical Blockchain we call “Ethereum” — the **mainnet**.

It’s in these devnets that upgrades are first tested. Essentially, it’s **the** place to mess things up, find bugs, solve them, and iterate.

Once the changes are stable enough, they **still don’t go into the mainnet**. There’s another intermediate step — the **testnet**.

Under normal circumstances, the **testnet** is the place where Smart Contract developers test their creations before they go live into the mainnet, where there’s **actual value**. Said differently: you don’t want to spend actual money deploying a faulty contract — it would be best to first test it in a controlled environment that simulates the mainnet, but where you’re still free to mess up.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/ok-statue.webp" 
    alt="A statue giving a thumbs up"
    title="Cool, bro."
    width="600"
  />
</figure>

Upgrades are promoted from devnets to testnets before they go live. The rationale here is that now, more developers have access to the new features, and may actually use them for real applications — so it’s the perfect scenario to find any sort of last-minute bug that needs to be fixed before there’s no turning back.

And I guess that’s it, in a nutshell!

Granted, there’s much more to say about the evolution of Ethereum — for instance, there’s an entire [roadmap](https://ethereum.org/en/roadmap/) of planned changes aimed at improving the network.

> There are even planned changes that have lost some traction or have been deferred to future updates, like [danksharding](https://ethereum.org/en/roadmap/danksharding/).

And there’s a lot to say about things that are built **on top of Ethereum** — the so-called **Layer 2** solutions. That will be a topic for [another time](/en/blog/blockchain-101/rollups). For now, let’s put a full stop on the Ethereum’s evolution, and instead focus on another crucial aspect.

---

## Ether and Gas

There’s no way I could end any serious discussion about Ethereum without talking about how it handles its **native currency**, **Ether**.

Importantly, the total issuance of Ether works very different than Bitcoin’s. We already talked about how there’s a cap to the [amount of Bitcoin that will ever exist](/en/blog/blockchain-101/a-primer-on-consensus/#incentives) — a limitation that does not hold in Ethereum.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/lambos.webp" 
    alt="I was told there would be lambos"
    title="I was told there would be lambos"
    width="600"
  />
</figure>

That doesn’t mean that the amount of Ether will grow uncontrollably. Mostly because it has **two purposes**: it’s a reserve of value (like Bitcoin), but it’s also the **fuel** for the network.

What do I mean by this, you may ask? That Ethereum literally **needs Ether to work**, unlike Bitcoin.

> It’s not just digital money — it’s the essential resource the system requires for its correct functioning.

And the Ether issuance has a tight relationship with another key concept: **gas**.

### Understanding Gas

We’ve talked about this “fuel” dynamic [earlier in the series](/en/blog/blockchain-101/enter-ethereum/#gas). In short, it’s a measure of computational effort, and allows us to put a limit to how much computation a single program can execute.

> Which in turn helps avoid infinite loops.

Every operation on Ethereum costs some gas. Like, literally, every single opcode has a [minimum gas cost](https://www.evm.codes/). Therefore, a simple transfer costs around [21,000 gas units](https://www.kucoin.com/learn/web3/understanding-ethereum-gas-fees#:~:text=A%20simple%20ETH%20transfer%20typically%20requires%2021%2C000%20gas%20units), while a Smart Contract call might cost hundreds of thousands or even millions of gas units.

The philosophy is then **pay as you go** — or at least, in proportion to your needs. The actual price you pay is calculated as:

$$
\textrm{Gas fee} \ = \ \textrm{Gas units} \ \times \ \textrm{Gas price}
$$

Now, the gas units are strictly related to how much computational work you require. Gas **price** however, is a different story.

Gas price is measured in **gwei** — 1 billionth of an Ether — , and fluctuates based on **network demand**.

When many people try to use Ethereum at the same time (another way to say this is **concurrently**, or **simultaneously**), gas prices rise.

> So you go “hey, why is my ten-dollar transfer costing 20 dollars in gas fees?” , causing you to rage quit.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/not-stonks.webp" 
    alt="Not stonks"
    width="600"
  />
</figure>

It works as a **negative incentive**. As transaction prices soar, fewer people will be willing to pay the high “tax”, and will therefore stop bombarding the network with requests.

But it’s not the network that decides the gas price — it’s the **users**. Or at least, that’s how it used to be.

### The Fee Market Reform

Before [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559), users would simply bid on how much they were willing to pay for gas in a **simple auction**. A competition of sorts — which resulted in unpredictable fee spikes and inefficiencies.

The current system uses a two-part fee structure:

- **Base Fee**: Automatically set by the network based on demand and completely **burned**. Or **destroyed**, we could say.
- **Priority Fee**: An optional tip to validators to incentivize them to include your transaction sooner.

This design makes fees more predictable while still allowing users to prioritize urgent transactions when needed.

If we put all these things together, we can see that there’s a complex **economic loop** happening as Ethereum operates:

- Users pay gas fees to use the network.
- Part of those fees gets burned, (potentially) reducing supply.
- Validators receive the remaining fees plus new issuance rewards (note that this is where new Ether is generated).
- This incentivizes more staking, increasing network security.
- Higher security and utility drives more adoption.
- More adoption means more network users, and we loop back to step $1$.

All in all, this is a more elaborate **economic model** than that of Bitcoin. We call this type of analysis the **tokenomics** of Ether, and they are a result of Ethereum’s role as a computational platform, rather than just a currency.

<figure>
  <img
    src="/images/blockchain-101/wrapping-up-ethereum/ethereum-coin.webp"
    alt="A coin with the Ethereum symbol"
    title="But it’s still a currency, of course"
    width="600"
  />
</figure>

### Block Gas Limits

Finally, Ethereum blocks have a **target gas limit** — a maximum amount of gas that can be used in a single block.

This sets a limit on how many transactions can be included in each block, which serves as a **protection mechanism**.

> Without it, validators could include so many transactions that other nodes couldn’t validate in a single [slot](/en/blog/blockchain-101/consensus-revisited/#finality-in-ethereum), potentially leading to network instability.

The gas limit can be adjusted slightly over time, allowing the network to gradually scale, as long as stability is not compromised.

---

## Summary

Okay, I feel like that’s a good place to stop!

It’s been quite the journey! Not that it was not to be expected — Ethereum is a very rich ecosystem, and a very solid piece of technology.

> And we’ve only barely scratched the surface!

But yeah, there’s no way I can cover everything in just a few articles. It’s not my intention, anyway — I want to keep this relatively friendly, and this is a really deep subject.

Still, I believe we’ve covered enough points to have a solid idea of what Ethereum is, how it works, and what new ideas it brought to the Blockchain table.

Now, I must admit... I lied when I said this would be a wrap on Ethereum. In a way, it is — but there’s something we still need to cover before we can move onto other Blockchains.

We need to talk about **rollups**, better known as **Layer 2** (L2) Blockchains. These sit **on top** of Ethereum — but the concept is more general, and extends to other ecosystems.

That will be the topic for our [next encounter](/en/blog/blockchain-101/rollups)!
