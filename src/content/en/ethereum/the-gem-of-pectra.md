---
title: 'The Gem of Pectra: EIP-7702, the SetCode Transaction'
date: '2025-03-31'
author: gonzalo-bustos
thumbnail: /images/ethereum/the-gem-of-pectra/7702.webp
tags:
  - ethereum
  - eip
  - setCode
  - pectra
description: >-
  Explore Ethereum’s Pectra update and EIP-7702, which enhances Account
  Abstraction by enabling EOAs to adopt smart contract functionality.
readingTime: 7 min
mediumUrl: >-
  https://medium.com/@bustosgonzalom/the-gem-of-pectra-eip-7702-the-setcode-transaction-e55593b0533a
contentHash: afafca9cb276d156cb452b088f489a8657e9c10050b1603df09e9b2864e26858
supabaseId: 7953d819-8edb-4709-a1ec-1b2b6cbbf7dc
---

I was hesitant to write this article at first.

I’ve always wanted my articles to be **interesting**, **useful**, and, above all, easy to **understand**. But with so many great articles out there, I couldn’t figure out whether this one would be any of those things. However, a great colleague of mine suggested I just go for it. So I thought, **why not**?

> This article covers concepts that should be accessible without deep knowledge of the **Ethereum Virtual Machine** (EVM) or **Solidity** development. However, while I aim to keep things as simple as possible, some fundamental **Ethereum terminology** and **functionality** will come up, so familiarity with the **ecosystem** and **EIPs** may be helpful.

This article will be an attempt to introduce one of the most sought-after features of Ethereum’s Pectra update: [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), aka the **Set Code Transaction**.

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/7702.webp" 
    alt="EIP 7702"
    width="600"
  />
</figure>

In order to do that, I feel like it might be necessary to provide a little context to the current state of Ethereum.

---

## A short story about Ethereum’s updates

Vitalik Buterin formally presented the **rollup-centric [roadmap](https://ethroadmap.com/)** in October 2020, stating that Ethereum would no longer focus on handling anything and everything as an L1, but rather on being the best chain for [rollups](https://medium.com/@onlylayer/ethereum-rollups-optimistic-and-zero-knowledge-rollups-explained-247607b43193), keeping the L1 chain as secure and robust as possible while also allowing L2s to [handle the network’s scalability](https://polynya.medium.com/understanding-ethereums-rollup-centric-roadmap-1c60d30c060f).

> Remember that [rollups](/en/blog/blockchain-101/rollups/) bundle (or ‘roll up’) transactions into batches that are executed off-chain, essentially maintaining an on-chain record that each of those transactions occurred without having to send them separately.
>
> This reduces the amount of data that needs to be posted to the blockchain, therefore increasing scalability.

This shift in perspective has greatly impacted the course of the updates and upgrades made to the Ethereum ecosystem (and how L2s, libraries, and tools operate).

Alongside the rollup-centric roadmap, Ethereum’s updates were greatly influenced by the biggest upgrade of its existence: **The Merge** (September 15, 2022).

The Merge allowed for the complete transition from a **Proof-of-Work** distributed system (as proposed initially by Bitcoin’s whitepaper) to a **Proof-of-Stake** system that introduced the idea of two separate layers:

- One that takes care of the **execution** of transactions and [state changes](https://ethereum.org/en/developers/docs/evm/#from-ledger-to-state-machine), which we can call the “**Execution client**” (like Geth, Reth, Besu, etc),
- and another one that implements the proof-of-stake **consensus algorithm** which can be called the “**Consensus client**” (like Lighthouse, Lodestar, Prysm, etc).

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/clients.webp" 
    alt="Diagram of clients after the Merge"
    title="[zoom] Clients diagram from Ethereum’s Documentation"
  />
</figure>

> Each new Ethereum update is described by a list of **EIPs** (**Ethereum Improvement Proposals**), which detail the **proposed changes**, their **rationale**, and how they should be implemented in the new chain version and clients. For example, introducing new **opcodes** to the EVM in one EIP and modifying existing **data structures** in another.

Is all this relevant? Well, **of course it is**! But besides its inherent importance in how Ethereum works at a low level, this separation into two layers also dictates the **naming** of the general updates.

They consist of changes to both the **EL** and **CL**, each with its own name:

- The EL updates are named after the **cities that host the Devcon conference**,
- The CL ones are named after **alphabetically ordered stars** (that’s right, stars 🌟).

To represent the entire hard-fork, both names are **combined**.

The EIP we’ll be talking about today is part of the **Pectra** Update, named after the **Prague Devcon** conference and the **Electra star**.

If you want to understand more about how the naming of Ethereum updates work, I suggest you review the following article: [How Ethereum Names Updates & Why It’s Confusing](https://medium.com/topic-crypto/how-ethereum-names-updates-why-its-confusing-b1a07f0de4d0).

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/pectra.webp" 
    alt="Prague + Electra = Pectra"
    width="500"
  />
</figure>

---

Now that we understand a little bit better where we’re standing, we should be aware of the concept that has **driven** the EIP’s existence: [Account Abstraction](https://ethereum.org/en/roadmap/account-abstraction/).

When we talk about account abstraction, we are mostly referring to **abstracting away** the need for users to use an [Externally Owned Account](/en/blog/blockchain-101/enter-ethereum/#account-types) (EOA) to interact with the blockchain.

Currently, the only way to “do things” in Ethereum is through EOAs, which can lead to a **frustrating** onboarding experience of Web2 users into Web3, who **don’t know** or **don’t care** about handling wallets and private keys, and to non-standardized solutions that tend to be overly complex.

However, if we managed to implement a good Account Abstraction solution, we would be able to:

- **sponsor transactions** (for example allowing Web2 users to be onboarded without ever having to pay to transact),
- **batch transactions** (a feature so useful that Solana implemented it natively in their SVM design),
- handle **privilege de-escalation** (allowing other users to access an account’s resources if needed),

and unlock many more interesting features!

That’s why Account Abstraction has been such a **hot topic** over the last few years. Imagine finding a way to keep all of Ethereum’s **security** and **robustness** features while also easily onboarding new users (and extending the capabilities of EOAs as a bonus).

> Bear in mind that, through the years, there have been many proposals (like [EIP-3074](https://eips.ethereum.org/EIPS/eip-3074), [EIP-4337](https://eips.ethereum.org/EIPS/eip-4337), etc) trying to tackle this issue, but there’s currently **no one-EIP** that solves everything.

The history of Account Abstraction EIPs and discussions in Ethereum is quite interesting and might be a nice topic for another article, but for now let’s present the latest addition to the list of contributions (and a great one at that!).

[EIP-7702](https://eips.ethereum.org/EIPS/eip-7702), also known as the EIP for the **SetCode Transaction**, proposes a change to how EOAs operate at a **native** level.

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/ollivander.webp" 
    alt="Ollivander from Harry Potter with the legend 'that much has always been clear to those of us who sudy Ethereum'"
    width="600"
  />
</figure>

> As Ollivander said to Harry: “The wand chooses the wizard, Mr. Potter. That much has always been clear to those of us who have studied wandlore”.

Well, to those of us who study Ethereum, the [difference between EOAs and Smart Contract Accounts](https://info.etherscan.com/understanding-ethereum-accounts/) has always been clear: **EOAs can’t store code but can trigger transactions and Smart Contract Accounts can store code but can’t trigger transactions by themselves**.

The SetCode Transaction is here to change that by **allowing EOAs to store code**.

---

Okay, I lied — they won’t actually **store** code, but after 7702, they will store what is called a **delegation designator**, which you can think of basically as a **pointer** to the Smart Contract that stores the code you want to execute.

> This is a huge change, you’re basically **transforming** your EOA into a Smart Account by just sending a transaction!

The process a user has to follow to do this is **fairly simple**, as explained in the following diagram (based on [@tinchoabbate](https://x.com/tinchoabbate)’s diagram, which he presented so clearly that I found it hard not to use the entire diagram).

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/set-code.webp" 
    alt="The SetCode transation in action"
    title="[zoom]"
  />
</figure>

As the diagram shows, if a regular user wanted to **transform** their EOA into a Smart Account, they would need to **pick which contract is going to provide the logic to their account** (goes without saying that the contract must already be deployed on-chain), **sign a new type-4 transaction** (following the [EIP-2718](https://eips.ethereum.org/EIPS/eip-2718) standard), and they can either send it themselves or simply **get someone else to send it**.

There’s not much more to do after that, if the transaction went through, then they should have successfully transformed their EOA into a Smart Account which can execute code as complex as its Smart Contract allows.

<figure>
  <img
    src="/images/ethereum/the-gem-of-pectra/happy-anakin.webp" 
    alt="Happy Anakin Skywalker, with legend 'this is where the fun begins'"
    width="500"
  />
</figure>

Doesn’t that sound **wonderfully easy**?

But let’s not get carried away just yet, this was just a **high level** presentation of what EIP-7702 will allow once the Pectra HardFork is live, but there’s a lot more to go through if we want to use it in real life...

If you’re as curious as I am, you may still have some lingering questions:

- Can **anyone** send this transaction and transform my account into a Smart Account?
- Where does the **state** of the new Smart Account live?
- Can I transform my Smart Account **back to an EOA**?
- What if the Smart Contract my EOA is pointing to is vulnerable? **Can I update it**?
- What happens to the **nonce** of my account once I transform it into a Smart Account?
- How can I start using it? Can I try it out before the Pectra Update is live?
- How is this any **different** from all of the other Account Abstraction EIPs, like 4337?
- What about using my EOA in **multiple chains**?
- The wallet providers and applications will most likely **determine** which Smart Contracts are safe enough for regular users to use as delegation contracts, since most of them won’t be able to decide for themselves. Does this go against decentralization? **Does this pose any risks**?
- Is this the **Deus ex machina** of Account Abstraction? (Spoiler, it’s not).

Don’t worry, I intend to go over all of these and more questions in the following articles.

---

## Quick recap!

In this article we’ve talked about how the **Pectra update** (named after the Prague Devcon event and the Electra star), the latest in a long list of Ethereum upgrades, will introduce the **setCode transaction** as specified in **EIP-7702**, among other features.

This new transaction allows an **EOA** to leverage a **Smart Contract** to **extend its functionality** beyond simply triggering transactions — enabling features such as **transaction sponsorship**, **batching**, and **privilege de-escalation** — effectively turning it into what we’d call a Smart Account. This is a significant contribution to the concept of **Account Abstraction**, which has been a major talking point in the Ethereum ecosystem.

Although transforming an EOA into a Smart Account seems straightforward, we still need to analyze exactly how the setCode transaction utilizes a Smart Contract’s code within the context of a user account to understand its limitations and potential risks.
