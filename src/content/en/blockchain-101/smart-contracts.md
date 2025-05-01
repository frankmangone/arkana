---
title: "Blockchain 101: Smart Contracts"
date: "2024-12-26"
author: "frank-mangone"
tags: ["Ethereum", "Blockchain", "EVM", "Solidity", "Smart Contracts"]
description: "A peek into the architecture that makes Smart Contracts possible in Ethereum"
readingTime: "12 min"
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

With [Ethereum’s storage](/en/blog/blockchain-101/storage) behind us, it’s now time to delve into one of the most central topics in any modern Blockchain: **Smart Contracts**.

As we’ve previously mentioned in the series, these are user-submitted programs that live directly **on the Blockchain** — in the case of Ethereum, they are stored in contract accounts.

Not only that, but they also manage an independent piece of state, which is alterable only by the rules defined in the contract itself.

Sounds amazing, right? However, implementing such a feature comes packed with a set of challenges: how do we model a **customizable**, **flexible state**? And how do we manage to define the **actions** — or state transitions — associated to a contract?

Our plan for today is to try and explain how Ethereum answers both these questions. Their solution has become very popular — so much so that many other blockchain strive to be compatible with their it.

> You may have heard about EVM-compatible blockchains. This is exactly what they mean: that they process Smart Contract state and logic the same way Ethereum does.

Fun stuff ahead!

---

## Modeling State

Let’s pick things up where we left off in the previous article. We talked about how state is stored in a simple key-value database, but it’s consolidated through the use of a (modified) Patricia Merkle trie.

Representing accounts is a fairly simple task, because the set of attributes needed to fully define an account is static. Smart Contracts are different — every single contract defines its own state, meaning that we no longer have a static set of attributes to work with.

The very first thing to do then, is to craft a mechanism to **organize** the state. In other words:

::: big-quote
We need some rules to properly define state
:::

Most programming languages have these “rules” as well — they are what we call **types**, or built-in constructions such as **arrays**. In order to deliver on the promise of programability, Smart Contracts need to provide some of these as well.

In essence, we just need to figure out three things:

- What types we want to support
- How we’re going to store that information in our key-value storage
- A strategy to deterministically calculate an identifier used to place the data in a Patricia Merkle trie

With this in mind, let’s see what types Ethereum can handle.

### Primitive Types

At the core of the type system, there’s a very fundamental building block: the **256-bit word**.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/microsoft-word.webp" 
    alt="Bill Gates rapping"
    title="Yo."
    width="450"
  />
</figure>

Rap jokes aside, a [word](<https://en.wikipedia.org/wiki/Word_(computer_architecture)>) in computer science is the basic unit of data a computer processor can handle in a single operation. It’s usually also the maximum amount of data that can fit in a [register](https://en.wikipedia.org/wiki/Processor_register).

But we’re not dealing with a physical computer here. Why do we care about architectural decisions of physical hardware?

> Our Smart Contracts are essentially **computer programs**, so we need to design an architecture that can execute them.
>
> If we can build software that works exactly like a computer, and can run Smart Contracts on any piece of hardware, then we can make sure that the same program will produce the same results given the same inputs, no matter where it is executed.
>
> In this sense, Ethereum works like a giant, distributed computer — a **virtual machine**. That’s what EVM stands for: Ethereum Virtual Machine!

Deciding on a word size is important in the design of said virtual machine.

Choosing $256$ bits aligns well with the necessity to store big numbers (such as balances) and addresses. It also aligns well with the [hash function](/en/blog/cryptography-101/hashing) used in Ethereum: **Keccak-256**. We’ll talk more about this in a minute.

This choice also leads to a series of **primitive types**, based on that word size.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/primitive.webp" 
    alt="Primitive Spongebob"
    title="What I picture in my head when I read 'primitives'"
    width="500"
  />
</figure>

These primitives are:

- **Integers**: We can store both **signed** and **unsigned** integers in the 256 bits available. Signed integers use one bit to specify sign, while unsigned integers are always positive. The maximum integer that we can represent is $2^{256} - 1$. Values above that will be troublesome, and require clever solutions.
- **Addresses**: Since addresses occupy $160$ bits ($20$ bytes) in Ethereum, they can be fit into a single word!
- **Boolean**: A single $1$ or $0$, representing **true** or **false** respectively. They occupy a full word, despite only taking 1 bit of space.
- **Bytes**: Simply byte values, without any explicit meaning.

We can use these to define **variables**. They will represent part of a Smart Contract’s state — meaning that they need to be stored in the contract’s Patricia Merkle trie.

### Deciding Trie Location

The most popular Domain-Specific Language (DSL) for writing EVM Smart Contracts, at least to date, is [Solidity](https://soliditylang.org/). There are some alternatives such as [Vyper](https://docs.vyperlang.org/en/stable/) — but I’m gonna have to choose Solidity for comfort reasons for our examples moving forward.

Here’s a fragment of a simple contract:

```solidity
contract SimpleStorage {
    uint256 first;
    address second;
    bool third;

    // ...
}
```

As you can see, we have defined some variables (**first**, **second**, and **third**), each one of them **typed** to a primitive type.

> Types are crucial to correctly evaluate operations, but it’s important to keep in mind that these are just 256-bit-sized values.

We need to work out a trie structure out of this, meaning that each one of these variables needs to be associated with a path in the trie. And this calculation needs to be deterministic, and repeatable.

The strategy is to use **slots**. Each slot has the size of our word ($256$ bits), and is identified by a 256-bit key. In our simple case, the slots are assigned **sequentially**, starting from $0$. That is:

```solidity
contract SimpleStorage {
    uint256 first;  // This gets slot 0
    address second; // This gets slot 1
    bool third;     // This gets slot 2

    // ...
}
```

These identifiers will actually be the **key** for each of these storage spaces in the Patricia Merkle trie.

Simple, right?

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/dump-spongebob.webp" 
    alt="Dumb primitive Patrick and Spongebob"
    width="600"
  />
</figure>

---

## Composite Types

Primitive types occupy a **single slot**, but are limited in the possibilities they offer. They are important, but perhaps not very fun.

Often times, we need the ability to store **collections** of data, or organize data into more **complex structures**. For this purpose, Ethereum offers a few more types:

- **Arrays**: Ordered collections of elements of the same type. They come in two flavors: fixed-size arrays, and dynamic arrays that can grow or shrink as needed.
- **Mappings**: Known as **dictionaries** or **hash tables** in other languages, they are a collection of key-value pairs.
- **Structs**: Simply groups of related data clumped together into a single unit. They are good to represent record-like data — entities with multiple attributes.

Now, how are these stored?

### Arrays

Fixed-size arrays are quite easy to deal with, really. Since the length is known in advance (and it’s static), we can simply use **consecutive slots**. For instance:

```solidity
contract FixedSizeArrayExample {
    uint256[3] fixedArray;  // Takes slots 0, 1, and 2
    uint256 otherVar;       // Takes slot 3
}
```

But dynamic arrays are a different kind of beast — we can’t use consecutive slots, since that would mean that when the array **grows**, it would be stepping over another variable’s slot. A different strategy is needed.

Ethereum’s solution is very clever:

- We assign a slot to the array as if it was a primitive type, and use that slot to store its current length
- The actual elements are stored at a **different position**, calculated as: `keccak256(slot) + index`

As previously mentioned, [Keccak256](<https://www.nervos.org/knowledge-base/what_is_keccak256_(explainCKBot)>) is Ethereum’s [hash function](/en/blog/cryptography-101/hashing) of choice. Its output happens to be **256-bit long**.

> Sounds familiar? Of course — it’s the length of our word! And it’s also a perfectly valid Patricia Merkle trie path.

By using the hash function, we introduce some randomness into the process, reducing the probability of array item paths colliding with other existing variable paths. It’s kinda neat!

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/spiderman-neat.webp" 
    alt="Spiderman taking a picture, with the quote 'Neat!'"
    width="400"
  />
</figure>

> Solidity also has **strings**, which are actually dynamic byte arrays. This means they follow the same rules as dynamic arrays: the length is stored in the main slot, and the actual data is stored at `keccak256(slot)`.

### Mappings

These fellas here don’t have such a clear ordering — the keys can be just about any 256-bit long sequence. That means that our previous strategy of finding a starting point (hash) and then adding the index won’t work. A slightly different approach is used.

Just like dynamic arrays, mappings are assigned a **slot number**.

```solidity
contract MappingExample {
    mapping(address => uint256) balances; // This would take slot 0.
}
```

Then, for any **key** in the mapping, we find its Patricia Merkle path by simply concatenating (`||`) it with the **slot number**, and then hashing: `keccak256(key || slot)`.
