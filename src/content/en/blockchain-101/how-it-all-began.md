---
title: "Blockchain 101: How it All Began"
date: "2024-08-31"
author: "frank-mangone"
tags: ["Blockchain", "Bitcoin", "Cryptocurrency", "Cryptography"]
description: "We embark on a new journey, where we explore the amazing technology of Blockchains"
readingTime: "10 min"
---

I was very hesitant to write this first article about Blockchain. Mostly because it’s one of those technologies that moves at **light speed**, with innovations popping out of nowhere very frequently. It’s a world full of cool and diverse ideas — so it’s really hard to do them justice in just a few short articles.

At the same time, this is **exactly** what prompted me to start writing: the sheer amount of information to absorb is **gigantic**, and it’s easy to get lost in the abundance of specific and funky terms.

I know that was **my** case, at least.

Because of this, even though the [Cryptography 101](/en/reading-lists/cryptography-101/) series is not yet over, I decided to embark on this **new path**, where we explore the concepts and ideas behind **Blockchain** technologies. My hope is to give you some tools to better navigate this rocky terrain — but most of the **exploration** and **playing around** will be entirely up to you!

> And for the seasoned Blockchain veterans, a refresher is never a bad idea!

Without much more to add, let’s set sail into this new adventure! Hope you enjoy!

---

## Context

Before we even mention what a Blockchain is or how it works, we shall take a minute to understand how we usually **handle money**, as there are a couple things that could potentially be problematic—and which were the initial motivation for the development of Blockchains.

How money works is in itself an **amazing topic**, and it’s probably too soon for us to go down that rabbit hole. What we care about for now is that it can be either **physical** or **digital**.

Physical money has the interesting inherent property that it **cannot be spent twice** — unless you somehow recover the money after paying, which would probably be highly unethical.

<figure>
  <img
    src="/images/blockchain-101/how-it-all-began/el-zorro.webp" 
    alt="El Zorro"
    title="Give that back, I want to spend it again!"
  />
</figure>

Conversely, going the digital route requires **someone** to **process** our transactions. This someone is also in charge of ensuring that money is **not spent twice**, and that both the amount of money that I have (called a **balance**) and the **receiver’s balance** are updated correctly.

Since this someone — let’s call them **processor** — handles all these operations, it means that we need to **trust them** to do a good job. Oh, and also pay them for their services.

> These processors are usually **banks** or are somehow associated with them.

Don’t get me wrong, this works fine for the most part. But there are **some situations** that may be cumbersome for us users.

Just to name a few:

- What happens if the processor gets **hacked**? We could be left with no way to spend our money, or even see our accounts depleted.
- If the processor chooses to **disallow us from transacting**, we’d be locked out of our funds, with no ability to spend our money!
- The processor starts to **charge you more** for their services.
- The servers where the processor runs **suddenly explode**. Service is down, and your balance information is forever lost.

> Okay, that last one may be excessively extreme — but you can never count accidents out!

Security measures are usually adopted to avoid these kinds of situations. But what I want to focus on is the fact that all of the problems above stem from a single factor: the **centralized**, **trusted processor**.

We could ask ourselves: would **removing** this man-in-the-middle solve these problems? How would we even **go about doing that**?

And so, one [fateful day in 2008](https://www.onthisday.com/date/2008/october/31), a paper was published out of nowhere — his author, Satoshi Nakamoto, still unknown to this day — , that would forever change the game: the [Bitcoin paper](https://bitcoin.org/bitcoin.pdf).

At its core, what **Bitcoin** proposes is fairly simple: as long as many people can agree on a **history** of transactions, then everyone knows the current state of things.

To picture this, let’s do a little exercise.

---

## A Toy Example

Say Alice, Bob, and Charlie want to create a cash system **without** an **intermediary processor**. They decide that everyone starts off with some money — maybe **100 coins** — , and all they want to do is **transact amongst themselves**.
