---
title: 'Blockchain 101: How it All Began'
date: '2024-08-31'
author: frank-mangone
thumbnail: /images/blockchain-101/how-it-all-began/el-zorro.webp
tags:
  - blockchain
  - bitcoin
  - cryptocurrency
  - cryptography
description: >-
  We embark on a new journey, where we explore the amazing technology of
  Blockchains
readingTime: 10 min
mediumUrl: >-
  https://medium.com/@francomangone18/blockchain-101-how-it-all-began-f78a977cbe5b
contentHash: 80c2ef7e97dbd6e9a9bb2cdb823c8b7c571dc90f2db50bf069a1f5d0e41f7a81
---

I was very hesitant to write this first article about Blockchain. Mostly because it's one of those technologies that moves at **light speed**, with innovations popping out of nowhere very frequently. It's a world full of cool and diverse ideas — so it's really hard to do them justice in just a few short articles.

At the same time, this is **exactly** what prompted me to start writing: the sheer amount of information to absorb is **gigantic**, and it's easy to get lost in the abundance of specific and funky terms.

I know that was **my** case, at least.

Because of this, even though the [Cryptography 101](/en/reading-lists/cryptography-101/) series is not yet over, I decided to embark on this **new path**, where we explore the concepts and ideas behind **Blockchain** technologies. My hope is to give you some tools to better navigate this rocky terrain — but most of the **exploration** and **playing around** will be entirely up to you!

> And for the seasoned Blockchain veterans, a refresher is never a bad idea!

Without much more to add, let's set sail into this new adventure! Hope you enjoy!

---

## Context

Before we even mention what a Blockchain is or how it works, we shall take a minute to understand how we usually **handle money**, as there are a couple things that could potentially be problematic—and which were the initial motivation for the development of Blockchains.

How money works is in itself an **amazing topic**, and it's probably too soon for us to go down that rabbit hole. What we care about for now is that it can be either **physical** or **digital**.

Physical money has the interesting inherent property that it **cannot be spent twice** — unless you somehow recover the money after paying, which would probably be highly unethical.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/el-zorro.webp" 
    alt="El Zorro"
    title="Give that back, I want to spend it again!"
  />
</figure>

Conversely, going the digital route requires **someone** to **process** our transactions. This someone is also in charge of ensuring that money is **not spent twice**, and that both the amount of money that I have (called a **balance**) and the **receiver's balance** are updated correctly.

Since this someone — let's call them **processor** — handles all these operations, it means that we need to **trust them** to do a good job. Oh, and also pay them for their services.

> These processors are usually **banks** or are somehow associated with them.

Don't get me wrong, this works fine for the most part. But there are **some situations** that may be cumbersome for us users.

Just to name a few:

- What happens if the processor gets **hacked**? We could be left with no way to spend our money, or even see our accounts depleted.
- If the processor chooses to **disallow us from transacting**, we'd be locked out of our funds, with no ability to spend our money!
- The processor starts to **charge you more** for their services.
- The servers where the processor runs **suddenly explode**. Service is down, and your balance information is forever lost.

> Okay, that last one may be excessively extreme — but you can never count accidents out!

Security measures are usually adopted to avoid these kinds of situations. But what I want to focus on is the fact that all of the problems above stem from a single factor: the **centralized**, **trusted processor**.

We could ask ourselves: would **removing** this man-in-the-middle solve these problems? How would we even **go about doing that**?

And so, one [fateful day in 2008](https://www.onthisday.com/date/2008/october/31), a paper was published out of nowhere — his author, Satoshi Nakamoto, still unknown to this day — , that would forever change the game: the [Bitcoin paper](https://bitcoin.org/bitcoin.pdf).

At its core, what **Bitcoin** proposes is fairly simple: as long as many people can agree on a **history** of transactions, then everyone knows the current state of things.

To picture this, let's do a little exercise.

---

## A Toy Example

Say Alice, Bob, and Charlie want to create a cash system **without** an **intermediary processor**. They decide that everyone starts off with some money — maybe $100$ **coins** — , and all they want to do is **transact amongst themselves**.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/alice-bob-charlie-balance.webp" 
    alt="Alice, Bob, and Charlie, each with 100 as initial balance"
    title="[zoom]"
    className="bg-white"
  />
</figure>

These coins only have value to **them**.

> For example, Alice may pay Bob $10$ coins for him to fix her printer, and Bob may choose to spend $15$ coins to have Alice teach him yoga basic. Whatever they agree upon, really.

Their approach is to keep their balances in a shared excel sheet, and modify them when they want to send money to one another. Super safe, right?

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/smart.webp" 
    alt="Intelligence meme"
  />
</figure>

Of course, there are a couple problems here. Say Alice wants to cheat, and she writes in the sheet that Bob sent her $20$ coins. Bob did not consent to this. Bob is not happy about it.

A fierce discussion ensues between them, and to calm things down, Charlie suggests an idea: what if everyone **signs** their transactions?

> By signing, I mean [digitally signing](/en/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures).

This way, everyone would make transactions **only** when they explicitly **consent** to them. Digital signatures have the nice property of being **verifiable** — meaning that only Bob can sign for Bob, but everyone can verify that Bob signed a transaction.

With this, anyone could go into the excel sheet and place their **transactions**, which would be structured like so:

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/basic-transaction.webp" 
    alt="A basic transaction, with origin, destination, amount, and signature"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Anyone could verify the transaction to be valid by checking the signature, and so, balances can be safely updated.

### Transaction Ordering

That's one problem down! But there are others — for example, trying to spend **more than you have**. This is easily avoided by rejecting any transactions that try to move more coins than what we have in our balance.

However, there's one in particular that's **very tricky**. Let's suppose Alice has $10$ coins. She submits two transactions: one to Bob for $6$ coins, and one to Charlie for $5$ coins. She doesn't have enough money to perform **both** transactions — how should we resolve this situation?

The answer is very simple: whichever transaction **happens first** will be the **valid one**, and the next one **won't be**. It seems that all we have to do is attach a **timestamp** to the transaction:

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/timestamp.webp" 
    alt="Transactions with timestamps"
    title="[zoom] The second one will be invalid since Alice doesn't have enough funds"
    className="bg-white"
  />
</figure>

---

Now... A single spreadsheet is still a **unique point of failure**. On a bad day, Bob could simply wipe the information on the sheet, and their mini-economy would be destroyed in an instant.

> Charlie seems to be the only good guy in this example.

We're after something **more robust**, if the plan is to create a **cash system** for everyone to use. With that, let's see what Bitcoin proposes.

---

## The Bitcoin Solution

To remove intermediaries and make the system more robust, Bitcoin proposes the use of a **network**, made up of **nodes**, which have a way to agree on a **shared transaction history**, thus defining the current **state** of the network.

We'll have time to better understand what a **node** is later. What we need to focus on is how they agree on the transaction history — how they achieve what we call **consensus**.

> Spoiler: it's a little more complicated than a spreadsheet.

To agree on a history, we first need to have a **model** for it. Bitcoin proposed to represent it as **blocks**.

### A Chain of Blocks

At first glance, this will feel weird. All we really want is to put a **timestamp** on each transaction, in order to determine which one comes first.

The problem is that it's very inefficient for a network with multiple actors to agree on timestamps **one at a time**. And we also need to decide how to **store** this information — we know it's not gonna be on a spreadsheet, but... Where?

Let's split this into two parts. First instead of agreeing on individual transactions, we could agree on **groups** of transactions — let's call said group a **block**. Like this one:

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/block.webp" 
    alt="A simple block with some transactions"
    title="[zoom] Our first approach to a block"
    className="bg-white"
    width="500"
  />
</figure>

> Remember that each transaction is **digitally signed** by the sender!

Next, we need to establish a **block order**. This is simple to do: we need to add a **reference** to the previous block. This way, we can check what happened in the previous block, and in the one before that, and so on, until we reach the **beginning of time**. **Woah**.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/woah.webp" 
    alt="Colorful caricature of an impressed individual"
    width="250"
  />
</figure>

Just kidding — we can only go back to the **first block**, which is commonly referred to as the **genesis block**. So our **chain** (hence the name **blockchain**) of blocks would look like this:

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/block-chain.webp" 
    alt="A simple chain of blocks"
    title="[zoom]"
    className="bg-white"
    width="500"
  />
</figure>

Just like that, we have established a mechanism to **order transactions** — they may not have an explicit timestamp associated to them, but they have a relative order.

> That is, transaction in **block #2** surely happened after the ones in **block #1**. But, you know, we could also throw in a timestamp for good measure!

We're off to a good start with our basic model! We don't really know what that **block ID** is, but we'll find out very soon — because the next question we have to answer is how does everyone agree on **what the correct order of blocks** is?

---

## Collective Agreement

Recapping, we mentioned how these **nodes** want to communicate amongst themselves, and **somehow** agree on a shared history. Let's simplify, and just imagine for a moment that these nodes are **people**, talking on a group chat.

Alice wants to add a block to the chain. So she grabs some transactions (**where from** is a matter we'll discuss in upcoming articles), builds a block pointing to the **current end** of the chain, and sends it do the group chat.

Naturally, everyone would need to check that the **proposed transactions** are valid — but I want to focus on another problem. Say Bob wants revenge on Alice, and he sends **another block** at the same time.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/conversation.webp" 
    alt="A conversation simulating the asynchronous nature of block proposals"
    title="[zoom] Always the peaceful bunch of people"
    className="bg-white"
    width="600"
  />
</figure>

We're faced with a **conundrum**: should we include Alice's or Bob's block? They are **both valid**, and both point to the end of the chain. And how do we **all agree** on choosing one of the two?

---

Bitcoin proposed an interesting solution, now called **Proof of Work** (or **PoW** for short). Simplifying a bit, the idea is that proposing a block is **not as trivial** as our previous example. We'll lock the ability to propose a block behind a **mathematical puzzle**.

### Working for Blocks

Here's an idea: if we could somehow **randomize** who is able to propose a valid block, then we could avoid these kind of **concurrency** problems (aka Bob being a pest). And there's a tool in cryptography that has this kind of pseudo-random behavior: **hashing functions**! So how about we try to leverage that for our purposes?

> I'm assuming you understand what a hashing function is. If not, I strongly recommend reading [this article](/en/blog/cryptography-101/hashing)!

So now, proposing a block has two steps: selecting a set of transactions, and then **hashing** the block's contents.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/hashing.webp" 
    alt="Hashing of a block's contents"
    title="[zoom]"
    className="bg-white"
    width="700"
  />
</figure>

**Hashes** are just a **fixed-size sequence of bits**, that (again, simplifying) looks random. One nice puzzle we could pose is to require the hash to start with **some number of zeros**.

> Something like 0$00000000001011010101110$...

**Hashing functions** are not reversible, which means we cannot propose a hash value, and try to recover the original inputs — so all we can do is **trial and error**. This is, modifying the inputs, and hoping for the required output. The difficulty of this puzzle depends on the **number of zeros** at the beginning of the hash — or **leading zeros**. The puzzle is solved when we find such a **winning hash**.

> It's like winning the lottery.

But this is somewhat impractical, isn't it? If we want to change the input, we need to select a **different set of transactions** to include in the block. Someone creating a block **may not want to do that**. Isn't there anything we can do about it?

**There sure is**! We can include a special value in our blocks, called a **nonce**, which we can modify to our heart's content, until we get the hash we need:

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/with-nonce.webp" 
    alt="Hashing with a nonce"
    title="[zoom]"
    className="bg-white"
    width="700"
  />
</figure>

With this, we've made the process of generating valid blocks **random**, and we've effectively thwarted Bob's plans. This process of changing the nonce until we find a valid hash is what we refer to as **mining** — we'll get back to this in the future.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/savage.webp" 
    alt="The meme of the guy clapping in the crowd, impressed"
    title="Savage"
    width="600"
  />
</figure>

Wrapping things up, this enables everyone to keep a copy of the **entire blockchain**, and they can grow it by **accepting valid blocks**, which are only ever produced in a **random fashion** by a user that happens to find a **winning hash**. This answers the question of **where** the information is stored: **everywhere**.

One more small tweak is in order: the **block ID**, which we intentionally avoided talking about until now, is set to be the **calculated hash**. This will have interesting implications, which we'll discuss later.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/full-blockchain.webp" 
    alt="Blockchain, with ID pointers"
    title="[zoom]"
    className="bg-white"
  />
</figure>

---

## Summary

Now's a good time to stop, for now. There are **many** more details that we need to cover to fully understand **Bitcoin** — which is just the **first of many** Blockchains we'll cover in this series, and the simplest one to understand.

Importantly, we've already introduced some important concepts and terms, that will be crucial in our journey. We know what a **Blockchain** represents — a shared history of transactions — , and we've noted that some cryptographic components are important, namely [digital signatures](/en/blog/cryptography-101/encryption-and-digital-signatures/#digital-signatures) and [hashing functions](/en/blog/cryptography-101/hashing).

And we also started to understand how the network **agrees** on **how the Blockchain evolves**. This is just the tip of the iceberg though, as our hash mechanism solves some problems, but leaves other unattended.

Before we learn about the agreement mechanism, we'll want to focus on the lifeblood of a Blockchain: **transactions**. That will be the topic for our [next encounter](/en/blog/blockchain-101/transactions)!
