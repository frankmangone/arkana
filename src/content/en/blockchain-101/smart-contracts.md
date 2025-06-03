---
title: 'Blockchain 101: Smart Contracts'
date: '2024-12-26'
author: frank-mangone
thumbnail: /images/blockchain-101/smart-contracts/dump-spongebob.webp
tags:
  - ethereum
  - blockchain
  - evm
  - solidity
  - smartContracts
description: A peek into the architecture that makes Smart Contracts possible in Ethereum
readingTime: 12 min
mediumUrl: >-
  https://medium.com/@francomangone18/blockchain-101-smart-contracts-8092253cbdfa
contentHash: 9179c48a157ea5050e08b4dcf5c5d7c46d24fdc4658fc0609cadf5e0cb103013
supabaseId: c165a12e-e99f-4083-9a1a-523fbca864b8
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

By doing this, each storage key (in the trie) is deterministic, but at the same time unlikely to collide with other locations. And we can allow reading an unexisting key — all we get is an empty value (zero).

> Mappings can also be nested. The keys are calculated normally for the innermost mapping, and then we use this value in place of the **slot** for the next mapping wrapping. Quite simple and effective!

### Structs

Lastly, we have **structs**, which look like this:

```solidity
contract StructExample {
    struct User {
        uint256 id;
        address wallet;
    }

    User owner;
}
```

Struct-typed variables take up as many slots as **keys** are in the struct. In the above example, `owner.id` would take slot $0$, and `owner.wallet` would occupy slot $1$.

---

All these types can be **combined** into different patterns, and the rules we described would apply to calculate Patricia Merkle paths. For instance:

```solidity
contract CompositionExample {
    struct Person {
        string name;
        uint256 age;
        address wallet;
    }

    mapping(address => Person[]) people;
}
```

> Can you figure out where `people[address][0].name` is stored? I’ll leave it as an exercise to you!

---

## Contract Logic

Marvelous! We have a rich system to represent simple and complex types alike, and calculate their paths in the storage trie. What this achieves is the ability to calculate a **state root**, which consolidates the entirety of a contract’s state into a single value.

However, contracts wouldn’t be as exciting if we couldn’t write rules to determine how state changes. Without this, all we’d have is just a very convoluted way to store some boring, static data.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/baby-yoda-sleeping.webp" 
    alt="Baby Yoda sleeping"
    title="Zzzzzz"
    width="600"
  />
</figure>

Recall that, before talking about storage, we mentioned how Ethereum works like a giant, distributed computer. Just like real computers, it needs a way to represent **programs**, that it understands and can execute.

Programs, really, are just **sequences of instructions**. And the language our virtual machine understands is expressed in **bytes**. Hence the fancy name you might have heard already: **bytecode**.

Our Solidity smart contracts will be compiled to this bytecode, which is of course not meant to be human-readable. For example, here’s a very simple contract:

```solidity
pragma solidity ^0.8.20;

contract Counter {
    uint256 count = 0;

    function increment() public {
        count = count + 1;
    }
}
```

Once compiled, we get this bytecode:

::: big-quote
0x60806040525f5f553480156011575f5ffd5b50609b80601d5f395ff3fe6080604052348015600e575f5ffd5b50600436106026575f3560e01c8063d09de08a14602a575b5f5ffd5b60306032565b005b5f54603d9060016041565b5f55565b80820180821115605f57634e487b7160e01b5f52601160045260245ffd5b9291505056fea2646970667358221220e272cd3048050835d3aef9a668053e3787a187208e24b8d32376b227e8a3fb7c64736f6c634300081c0033
:::

Luckily, we don’t need to be able to read this code, as it’s intended for the virtual machine to execute. However, it’s important that we understand its **building blocks**.

The bytecode is divided into three sections, each with a different purpose:

- **Creation Code**: The first part of the bytecode is meant to run **one time only**, when a contract is deployed (created). It’s a setup step — it handles the assignment of slots to variables, and stores necessary information during initialization. And importantly, it returns the next part, which is...
- **Runtime Code**: The actual logic of the contract, which is stored on the contract’s address. When someone calls the `increment` function, this is where the logic for said function lives. We’ll talk a bit more about this in just a moment.
- **Metadata**: Finally, there’s an extra section that contains some metadata that may be useful for different purposes. We’ll not focus on this section today.

> If you pay close attention, there’s a little block of instructions that repeats in the example bytecode: `6080604052`. I’ll leave it to your own curiosity and research to understand why this happens!

Cool! We understand the general structure of bytecode. But how does it work? Let’s focus on the **runtime code**, and hone into those **instructions** we’ve been talking about.

### The Instruction Set

Bytecode is made up of instructions called **operation codes**, or **opcodes** for short. Each opcode is represented by a **byte** — which means we could have up to $2^8 = 256$ different instructions.

> You can find the full list of opcodes [here](https://www.evm.codes/). Notice that they also have associated gas costs.

These opcodes cover a wide variety of instructions, such as the logical **AND** ($16$) operation, or the **KECCAK256** ($20$) code to calculate a hash. Some of them, like **ADD** ($01$), use the **stack**.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/the-what.webp" 
    alt="The what"
    width="600"
  />
</figure>

The stack!

The EVM is actually a **stack machine**, meaning that it keeps track of a stack to perform operations. And a [stack](<https://en.wikipedia.org/wiki/Stack_(abstract_data_type)>) is a data structure, which abides by the **last in, first out** (**LIFO**) principle — the last element in is the one that will be processed first.

> Think of it like a stack of plates: you can only add plates to the top (push) or remove plates from the top (pop). Removing from the bottom, while possible, may result in a mess!

### Functions

Putting together opcodes in the right order allows us to build programs. Naturally, we normally don’t do this manually, and instead use the higher level of abstraction that Solidity provides. We then compile our contracts to bytecode.

A contract can have many **functions**. It seems like the only thing we’re missing is how to identify these functions in the bytecode, in the sense that we need to be able to tell where a function starts, and where it ends.

For this purpose, functions are identified by **selectors**. These are derived from function signatures: their “textual representation”, so to speak.

> For instance, the signature for our increment function is just `increment()`, while a function with arguments may look like `transfer(address, uint256)`.

The **selector** (or **identifier**) for the function in the bytecode, is just the first 4 bytes of the **hash of its signature**.

> Again, using our example, the signature is `increment()`, whose keccak256 is `d09de08ab1a874aadf0a76e6f99a2ec20e431f22bbc101a6c3f718e53646ed8dand`, and if we take just the first four bytes, then the selector is `d09de08a`. See if you can find that in the bytecode from before!

In order to execute a function, a user communicating with a contract must send an appropriate function selector. The EVM then needs to compare this selector with the known selectors in the bytecode — in our case, `d09de08a`. This is also done through opcodes: immediately after the selector in our bytecode, we can see that:

- There is an **EQ** operation ($14$), which pops the top two values of the stack, and compares them. It then pushes a $1$ if they match, or a $0$ if they don’t.
- Then, there’s a **PUSH1** opcode ($60$) with the value $2a$ (which is actually $42$). This pushes said value into the stack.
- Finally, we find a **JUMPI** instruction ($57$), which is a conditional jump. This pops two values from the stack, the first one being the **destination**, and the second one being the **condition**. If the condition is true (represented by a $1$), then we jump to the specified condition — if not, we just continue to the next instruction.

> It may feel like overkill, but this is actually how computer programs work!

Thinking in terms of the stack doesn’t come all that naturally to me. If you feel the same way, just remember — you typically won’t have to dig **this** deep, except perhaps in very specific use cases.

Finally, a function stops its execution one it reaches a **STOP** ($00$) or **RETURN** ($F3$) opcode.

And with that, we’ve covered most of the important ideas behind bytecode!

---

## Summary

There you have it! Those are Smart Contracts under the hood. Not that bad, wasn’t it?

<figure>
  <img
    src="/images/blockchain-101/smart-contracts/batman-holy.webp" 
    alt="Batman, in shock"
    title="Holy mother of God"
    width="400"
  />
</figure>

> If you had previous knowledge of how computer programs work, this may not be all that unfamiliar to you. But if this is your first time seeing this, I reckon this may be quite a lot. Take your time!

The good news is that, as I’ve hinted many times throughout the article, we usually don’t need to get **this much involved** — just like any other programing language, Solidity abstracts many of these complications away into a nicer, more manageable format.

Granted, you’ll need to learn Solidity to write Smart Contracts. We may cover it in the future.

But at least, you won’t use it blindly: now you have an idea of what happens in the background. With this, the world is your oyster. Go get em’, tiger.

---

Slowly but surely though, things are coming together. We’ve covered how storage is handled and the data structures used to check data consistency, and now we know how Smart Contracts work.

Just what can we do with Smart Contracts? [Next time](/en/blog/blockchain-101/smart-contracts-part-2), we’ll dive into some common programs that can be built with them. Knowing what’s possible is a good start into Smart Contract development, and might spark you interest to build amazing applications. See you soon!
