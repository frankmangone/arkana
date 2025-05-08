---
title: "Blockchain 101: Enter Ethereum"
date: "2024-11-09"
author: "frank-mangone"
thumbnail: "/images/blockchain-101/enter-ethereum/galaxy-brain.webp"
tags: ["ethereum", "blockchain", "smartContracts"]
description: "Time to move on to the second big milestone in Blockchain’s history: Ethereum"
readingTime: "8 min"
mediumUrl: "https://medium.com/@francomangone18/blockchain-101-enter-ethereum-e24f5f6453ac"
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

We have [Bitcoin](/en/blog/blockchain-101/wrapping-up-bitcoin) to thank for introducing the world to the foundational concepts in Blockchain technology. Transactions and blocks, incentives and consensus — these are ubiquitous ideas that manifest in different forms in different Blockchains, but the core concepts remain roughly the same.

Yet, there’s only so much Bitcoin can do. It was conceived as a **digital cash system**, after all — and cannot cater for other needs.

I wasn’t there to see it, but I assume it must have felt like the technology had a lot of **untapped potential** at the time. If only the features and security guarantees of Bitcoin could be translated into other types of applications...

Oh, the possibilities!

It would take around 7 years for the next quantum leap in Blockchain’s history to materialize into **Ethereum**, which [went live on 2015](https://en.wikipedia.org/wiki/Ethereum#:~:text=went%20live%20on-,30%20July%202015,-.%5B6), bringing with it a huge paradigm shift in terms of functionality.

> Fun fact: the development of Ethereum was [crowdfunded in Bitcoin](<https://cryptopotato.com/ethereums-history-from-whitepaper-to-hardforks-and-the-eth-merge/#:~:text=The%20Foundation%20created%2060%20million%20ether%20(ETH)%2C%20the%20native%20cryptocurrency%20of%20the%20Ethereum%20ecosystem%2C%20for%20public%20sale.%20The%20company%20sold%202%2C000%20ether%20per%20bitcoin%20(BTC)%20for%20the%20first%20two%20weeks%20of%20the%20ICO%20and%201%2C399%20ETH%20per%20BTC%20for%20the%20remainder%20of%20the%20token%20sale%20event.>)!

What was so important about this new technology? To better understand this, we need to zoom out a little, and try to change our mental model a bit.

Grab a cup o’ coffee, and let’s get into it!

---

## Rethinking the Blockchain

What is a **Blockchain**?

Simply put, a Blockchain is a sequence of blocks containing transactions, agreed upon by all participants in a network. This sequence establishes a **shared history of changes**.

If you think about it, the entire Blockchain is just a recipe on how to get from an **initial state** to some **final state** — a prescription on how to get from $A$ to $B$.

> For instance, in Bitcoin, the Blockchain establishes how we got from the initial state of the network (some users having an initial balance), to the current state, which is a lot of users having a lot of UTXOs.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/state-evolution.webp" 
    alt="State evolving as the blockchain grows"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Of course, as we already know, transactions in Bitcoin are purely related to **cash transfers**. So the possible **states** are just user balances, in the form of multiple **UTXOs**.

But what if there was a way to represent **other types of states**? We’d begin with some initial state, and then transactions would flow in and mutate it over time. This is how a [state machine](https://stately.ai/blog/2023-10-05-what-is-a-state-machine) works, and transactions in this context represent **state transitions**: valid ways to get from one state to another. Here’s a very simple example:

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/state-machine.webp" 
    alt="A simple example of a state machine"
    title="[zoom] States depicted in grey, and transitions in purple"
    className="bg-white"
  />
</figure>

> In the above example, there are no “balances”!
>
> Also, there’s no way for us to get from the **Asleep** state into the **Working** state directly. Only after we take a couple of valid steps is that we can get from one state to another.

And here’s the galaxy brain idea: how about we let users submit **custom states** and define their own **rules** for state transitions? Then, the network just needs to provide a set of base functionalities — like handling consensus — , while users can **build** smaller state machines to fit their needs.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/galaxy-brain.webp" 
    alt="Brain expansion meme, galaxy edition"
    title="Damn. That’s clever."
  />
</figure>

::: big-quote
That’s the main innovation of Ethereum: empowering its users by allowing them to define custom behavior.
:::

The importance of achieving this **cannot be understated**. It gives users the freedom to build whatever type of program they want, while harnessing all the power the Blockchain provides — state immutability, censorship-resistance, you know, all the good stuff.

**But how**? How can it manage all this? We’ll have to defer the details to a later discussin in the series. For now, it’s enough to keep in mind that Ethereum was the first Blockchain to put **customizability** at the fingertips of its users.

Let’s focus on a few other aspects of Ethereum that also represent an important shift in how we should think about this Blockchain.

---

## The Account Model

Unlike Bitcoin’s UTXO model, Ethereum uses an account-based model. This is probably more familiar to us: as a user, we own an account, and all our assets are associated to it. It’s a more **natural** way to think about state.

> Your account is kinda like your Blockchain “user”, if you will.

The first consequence of this is that an account’s balance is stored as a **single value**. In Bitcoin, this is not the case — your total balance is the sum of all your available UTXOs.

This balance is measured in Ethereum’s **native currency** or **token**, called **Ether**. Being stored in a single place means that reading is more efficient than reading a Bitcoin balance, which is distributed across many UTXOs.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/accounts.webp" 
    alt="Accounts with balances"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Now, I promised a **flexible** and **customizable** state a few paragraphs ago. Keeping track of a single user’s balance simply won’t do. How do we represent other states different than the users’ native balances?

This is made possible thanks to a **special type of account**.

### Account Types

The accounts we’ve been talking about so far are actually called **Externally Owned Accounts** (EOAs). External, because they belong to users “outside” of the Blockchain, who hold a **private key** (associated with an **address**), and have the ability to sign transactions with it.

Then, we have **Contract Accounts** — and this is where the magic happens.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/interested-snape.webp" 
    alt="Snape from Harry Potter, interested in learning more"
    title="Tell me more"
    width="600"
  />
</figure>

These accounts hold **programs** created by users — programs which define a custom state, and custom state transitions. They enforce a set of rules which users must abide by — in this sense, they are like our physical-world contracts, but a little better: rules are enforced by code, and not by authorities or just people, who are prone to making mistakes. For this reason, these programs are called **Smart Contracts**.

> Importantly, they are not “owned” by anyone in the traditional sense. Although contract accounts have addresses that identify them, they don’t have an associated private key.

Contract accounts work fundamentally differently from EOAs: they are controlled by their **associated program**, or **code**. Their sole purpose is to define and handle some **custom state**.

> Nevertheless, Smart Contracts can call other small contracts, but the initial call must be done by an EOA.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/contract-call-flow.webp" 
    alt="The flow of smart contract execution"
    title="[zoom]"
    className="bg-white"
  />
</figure>

We’re barely scratching the surface here, but these high-level concepts are a good way to get us started. As I’ve mentioned before, we’ll have time to get to the finer details.

---

Regardless of **how** Smart Contracts are executed, what we know so far is that they are **programs** that can be executed on the Blockchain. In this sense, the Blockchain works as a giant distributed computer — often referred to as the **Ethereum Virtual Machine** (or **EVM** for short).

Since anyone can submit any arbitrary code, there’s one particular problem we have to deal with. Imagine someone submits an **infinite loop**, something like:

```javascript
while (true) {
  // Do something
}
```

> The language is not important here — just the idea of an infinite loop. Although, of course, there are special languages to develop Smart Contracts, like [Solidity](https://soliditylang.org/).

Every state transition needs to be **verified** to ensure its validity, and to calculate the next state. The only way to do so is by running the Smart Contract code.

Any node trying to run this code would **get stuck on this loop**, rendering it effectively frozen. Clearly, the network cannot be halted by such a small and simple oopsie in our code. Just imagine: you had a small bug in the program you just submitted, and the entire Blockchain goes “can’t handle that, gonna stop working, k thanks bye”.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/kill-yourself.webp" 
    alt="Kill yourself meme"
    title="Yeah, nah, thanks."
    width="350"
  />
</figure>

There **must** be a way to protect against this, right?

---

## Gas

Indeed, there is! And it’s also another fundamental aspect of how Ethereum works.

Our goal is to avoid excessive execution, or infinite loops in Smart Contract code. One thing that may solve this is limiting the amount of code that can be executed by a transaction. Simple, but effective!

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/borat.webp" 
    alt="Borat meme, with legend 'Great success'"
    width="500"
  />
</figure>

Ethereum’s approach is best explained by means of an analogy.

Imagine each transaction is a **car**, to which you’ll load some **fuel**, and then hit the road. If your destination is close-by, the fuel you loaded will probably be enough. But naturally, if for some reason you need to drive farther away, you’ll run out of fuel at some point!

**Gas** works just like the fuel in the analogy, and it’s consumed with each line of code executed in a Smart Contract. If you ever encounter an infinite loop, execution will proceed as normal, while burning up gas — and at some point, it will run out, and your transaction will fail.

This means that every transaction should specify what’s the maximum amount of gas it’s willing to burn.

And finally, users must **pay** for this gas! There are multiple reasons why paying for gas is important — but now’s not the time to ponder those. All I want to discuss for the moment is **how** you pay for gas.

Yeah, you probably guessed it: you pay with **Ether**, the native currency. There’s a catch, though: gas units measure utilized computational resources. To transform the total amount of used gas units into the amount of Ether to be paid as a transaction fee, we need a **price**:

$$
\textrm{Gas fee} \ = \ \textrm{Gas units} \ \times \ \textrm{Gas price}
$$

This price is measured in **Ether per gas unit** (actually, in [wei](<https://www.investopedia.com/terms/w/wei.asp#:~:text=Wei%20is%20the%20smallest%20unit,1%2C000%2C000%2C000%2C000%2C000%2C000%20wei%20(1018).>) per gas unit). Interestingly, this price **changes** over time, depending on factors that we’ll discuss in future articles. The consequence of this is obvious, though: the same operation may have different gas fees at different times.

---

And that’s just about enough for this short, high-level introduction, folks! Trust me, we’ll have **plenty of time** to expand on each and every one of these new ideas!

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/gandalf.webp" 
    alt="Gandalf smiling"
    title="Okay!"
    width="600"
  />
</figure>

---

## Summary

A wise teacher of mine once told me that the best way to approach a new topic is to go from the simple concepts to the complex ones, and from generality to particularity.

This is exactly what we did today: we just had a general overview of some of the key differences between Ethereum and Bitcoin.

Although, this short introduction certainly packs a punch of new ideas: user and contract accounts, on-chain programs, and a new way to think about fees. And the best part is, we haven’t even began to understand **how the hell this all works**!

To do so, **we have to go deeper**.

<figure>
  <img
    src="/images/blockchain-101/enter-ethereum/deeper-inception.webp" 
    alt="Leo DiCaprio shocked in an Inception scene"
    width="600"
  />
</figure>

So in the [next article](/en/blog/blockchain-101/storage), we’ll start diving into the inner workings of Ethereum that make this all possible. See you soon!
