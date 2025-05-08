---
title: "Blockchain 101: Smart Contracts (Part 2)"
date: "2025-02-24"
author: "frank-mangone"
thumbnail: "/images/blockchain-101/smart-contracts-part-2/destruction.webp"
tags: ["ethereum", "blockchain", "evm", "solidity", "smartContracts"]
description: "A more functional approach to Smart Contracts, exploring Solidity in further detail"
readingTime: "14 min"
---

> This is part of a larger series of articles about Blockchain. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/blockchain-101/how-it-all-began).

Quite frankly, I wasn’t planning on writing this particular article. I didn’t even know that I needed to write it. I thought that the [previous article](/en/blog/blockchain-101/smart-contracts) was enough.

Understanding the fundamentals of how Smart Contracts work at a low level seemed to be enough for me—to, you know, feel that bliss of having a functional understanding of a programming language you intend to use. In my mind, everything was fine.

Boy, was I wrong.

One of my coworkers posted a [Solidity Test](https://www.rareskills.io/test-yourself) (by [Rareskills](https://www.rareskills.io/), awesome guys by the way) on a channel, and I went in with jolly expectations. The test proceeded to mercilessly kick my ass — I just got a measly **35%** on my first attempt.

There were opcodes I didn’t quite understand, patterns I hadn’t had any experience with, and in general, details I wasn’t aware of.

And then it struck me: if I was to be any good at Smart Contract development, learning about these patterns and details was key to gain a real understanding of the language.

So today, I want to focus on those patterns and details that are so important to know about — a step further from our basic understanding of the language.

### Before We Start

I must clarify something. Smart Contracts and Solidity are **not the same thing**. Solidity is the language to develop applications for the Ethereum Virtual Machine (EVM). The EVM itself has become very popular, and several Blockchains have adopted its core ideas and support Solidity as their Smart Contract language.

The intent of this series is to cover general Blockchain concepts, but here we are, going deeper into Solidity. This is why I suggest to approach this article with a more comprehensive view of what might be possible in Smart Contracts in general, and not just focus on the particular nuances of Solidity.

> Unless of course you aim to be a Solidity developer, in which case this article should be quite helpful!

With this in mind, let’s get started!

---

## Call Patterns

Let’s begin by talking about something we’ve left on the sidelines until now: how one can interact with the Blockchain. As we’ve previously mentioned, the way to do this is by submitting **transactions**. These are on one hand **signed** as a means to prove their authenticity, by providing a way to verify the sender is who they claim to be.

But today, we want to forget about the signature part, and instead shift our focus to another pressing matter. Which is: we need a strategy to **encode information** into the transaction.

> For instance, transferring some token requires the transaction to specify an amount, and a receiver.

And to understand what information to encode, we first need to examine the structure of transactions themselves. They have a simple structure, comprised of a few fields: `to` and `from` are addresses, and then there’s a `value` which is an amount of Ether to send (well, actually, Wei to send). This is all we need for standard Ether transfers.

There are some extra fields in there, though. Of most interest to us is the `data` field: a simple hexadecimal data payload. This is where extra encoded information can be sent.

In terms of what information to encode, there’s a distinction that needs to be done from the get-go: transactions may be intended either to **deploy contracts**, to **call contract functions**. These two categories have a few key differences:

- **Contract deployment transactions** don’t specify a recipient address — the `to` field is empty (or is the [zero address](https://stackoverflow.com/questions/48219716/what-is-address0-in-solidity)). Their data field contains the contract’s bytecode, and any parameters needed for initialization.
- **Contract calls**, on the other hand, interact with **existing contracts**. They specify the contract’s address in the `to` field, and their data field contains the encoded information about what function to call and which parameters to use.

Let’s focus on the latter first.

### Encoding a Contract Call

As already mentioned, when trying to call a contract function, we need to tell the EVM which function to call, and what the arguments for the call are. Ethereum offers a standard way to do this.

The function itself is identified by a **selector**. We discussed this in the [previous article](/en/blog/blockchain-101/smart-contracts/#functions). The first $4$ bytes of the `data` field will then correspond to the function selector.

After that, come the parameters. Each parameter type has specific encoding rules — for instance, addresses are padded to $32$ bytes, and integers are encoded in [big-endian format](https://en.wikipedia.org/wiki/Endianness) (aka written from left to right).

> For a full explanation on how encoding works, check out this [article by Rareskills](https://www.rareskills.io/post/abi-encoding). There are several rules to cover, and I think that article covers them wonderfully.

Okay, great. Now, what else can we do?

### Static Calls

In simple terms, staticcall is like a **read-only** mode.

```solidity
(bool success, bytes memory data) = address.staticcall(
    abi.encodeWithSignature("justLooking()")
);
```

> Although the above example is Solidity code, static calls can be directly sent at RPC level. Instead of submitting a “normal” transaction, which uses the `eth_sendTransaction` RPC method, we use `eth_call`.

This is particularly useful when you want to be absolutely sure that a call **won’t modify state**.

Additionally, Solidity provides a set of **function modifiers**, among which we can find `view` and `pure`:

- Functions marked as `view` are not allowed to modify state.
- Function marked as `pure` are not even allowed to **read** state.

So then, why is staticcall needed?

The difference lies in how and when the enforcement happens. Both `view` and `pure` are Solidity-level modifiers that help developers write better code and perform compile-time checks. These checks work great when you’re working with trusted contracts and known implementations.

However, when dealing with contracts you don’t control or trust completely, stronger guarantees may be needed. Because, as always, there’s people that want to see the world burn — and those often find clever ways to bypass our so-carefully-crafted security measures.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/dr-evil.webp" 
    alt="Dr Evil"
    title="You’re the best evil son an evil dad could ever ask for"
    width="600"
  />
</figure>

Consider this scenario: you’re told to interact with a contract that claims to be read-only, but in fact isn’t. Sure, you could analyze its bytecode to verify its behavior, since `view` modifiers are bundled into it. But this is at the very least **impractical**, and becomes even more cumbersome with complex interaction patterns — delegate calls, proxies, or any kind of dynamic contract interactions.

So how do we handle these scenarios safely? Using staticcall, of course!

Using it makes the call truly read-only, with no surprises. It gives you a guarantee during execution that a call will not modify state, no matter what.

### Delegate Calls

Under normal circumstances, each contract handles its own storage — the only way to change it is through the contract’s functions.

Now, what if we could have a contract allow **another contract** to change its state? If we somehow trust this allowed contract to handle storage responsibly, then there shouldn’t be much to worry about!

This is exactly what the [DELEGATECALL opcode](https://www.evm.codes/?fork=cancun#f4) does.

> It was introduced in one of those early-days EIPs, [EIP-7](https://eips.ethereum.org/EIPS/eip-7).

Simply put, it **delegates** execution of a call to another contract, but using the original contract’s storage (and context, in general).

```solidity
interface ISharedStorage {
    function someValue() external view returns (uint256);
    function lastCaller() external view returns (address);
}

// This contract holds the state but delegates execution
contract Borrower is ISharedStorage {
    uint256 public someValue;
    address public lastCaller;

    event DelegateCallResult(bool success, uint256 newValue);

    function delegate(address lender, uint256 newValue) external {
        // Encode the function call with parameters
        (bool success, ) = lender.delegatecall(
            abi.encodeWithSignature("doSomething(uint256)", newValue)
        );

        emit DelegateCallResult(success, someValue);
    }
}

// This contract provides the logic but operates on Borrower's storage
contract Lender is ISharedStorage {
    uint256 public someValue;
    address public lastCaller;

    function doSomething(uint256 newValue) external {
        // These modifications will affect Borrower's storage
        someValue = newValue;
        lastCaller = msg.sender;  // This will be the EOA that called Borrower
    }
}
```

> If we **don’t** use delegatecall in the last example, then we can still refer to the original sender with `tx.origin`, but `msg.sender` will change.

Of course, the target contract needs to be aware of the storage layout in the source contract. Thus, it really defines the same storage, but it doesn’t keep anything in its trie — everything is stored in the source contract.

In a nutshell, it’s a **proxy pattern**, first proposed in [EIP-1967](https://eips.ethereum.org/EIPS/eip-1967). This type of proxy behavior allows for a useful instrument: **upgradable contracts**. The idea is that the state definition is unchanged in the source contract, but the execution rules can be switched by pointing to a different proxy contract, and requesting execution through the use of delegatecall.

> But this feature doesn’t come for free. If the new proxy implementation happens to wreak havok in the state, one may face irreversible damages. One must be very careful with rolling out new proxy contract implementations. As uncle Ben once said, “with great power comes great responsibility”.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/uncle-ben.webp" 
    alt="Uncle Ben from Spiderman"
    title="And then he said: 'don’t roll out proxy implementations without reviewing and testing first'"
    width="600"
  />
</figure>

---

## Contract Deployment Patterns

Alright! We’ve covered a couple ways to interact with existing contracts. It’s now time to talk about **contract creation**.

We already briefly discussed how to deploy a contract: all we need is to send a transaction to the zero address, with the `data` field containing all the necessary information to create the contract.

And actually, we already know what to put in that data field — we talked about it in the [previous article](/en/blog/blockchain-101/smart-contracts).

> One thing worth clarifying is that the creation code of the bytecode actually contains constructor parameters, so that part will vary for each deployment.

Fantastic! We have our transaction ready to send for contract deployment. What happens next?

Internally, the EVM will use the [CREATE opcode](https://www.evm.codes/?fork=cancun#f0). While doing so, it will assign the contract a deterministically calculated **address**. It does this is by calculating a hash, whose inputs are the deployer’s address, and the transaction nonce:

```solidity
address = keccak256(rlp.encode([deployer_address, nonce]))
```

This has a couple interesting consequences.

First, if we send the exact same deployment transaction (only changing the nonce), we’ll get exactly the same contract as before, but deployed in a **different address**. Secondly, the contract’s address is **predictable**, as long as you know the nonce.

And lastly, we **can’t choose** the resulting address. In some cases, having more control over this is desirable — for example, if we want to have a contract deployed in two (EVM-compatible) networks with the exact same address.

> If you happen to miss a nonce because of a simple transfer, your nonces could get out of sync, resulting in different contract addresses, and you’d end up having to redeploy stuff, spending more gas along the way, and ending up with “dead contracts”.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/not-again.webp" 
    alt="Robert Downey Junior rolling his eyes"
    title="Ugh"
    width="500"
  />
</figure>

Going the hash route seems unreliable at best, and tedious at the very least.

### Controlling the Address

This is where another opcode comes into play: [CREATE2](https://www.evm.codes/?fork=cancun#f5). Introduced in [EIP-1014](https://eips.ethereum.org/EIPS/eip-1014), what it does is very plain: instead of relying on an ever-changing nonce, it allows us to choose a **salt**.

With this simple adjustment, the address depends exclusively on things we can control! We can know exactly where a contract will be deployed in advance, irrespective of the nonce.

> This presents a set of cool possibilities. As I mentioned before, it allows you to easily deploy the same contract (with the same address) on different Blockchains. But it also helps if you need to coordinate complex deployments where contracts need to know each other’s addresses in advance.

---

## Contract Features

We’ve covered the various ways to deploy and interact with contracts. Let’s now switch gears, and talk about some special features that contracts can have.

> Most of this section will be about [modifiers](https://mdjamilkashemporosh.medium.com/modifiers-in-solidity-public-private-internal-and-external-764d0aae9c#:~:text=Modifiers%20in%20Solidity%20are%20special,variables%20within%20a%20smart%20contract.). They’re essentially like labels we put on functions to change how they behave. We can also build custom modifiers — but we’ll now focus on the ones provided by the language itself.

### Function Visibility

Our first topic relates to controlling function visibility — this is, **who can call a function**.

There are in total four visibility modifiers: `external`, `public`, `internal`, and `private`. From the lot, `external` is the most interesting one, so let’s leave it for last.

Really, `internal` functions behave like `protected` functions in regular Object-Oriented Programming (OOP). So then, we have `public` functions, visible to any caller. Next are `internal` functions, which can be called only from the contract itself or its **child** or **derived** contracts. And finally, `private` functions can only be called from the contract they are defined in.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/oop.webp" 
    alt="Object Oriented Programming"
    width="500"
  />
</figure>

With that out of the way, let’s talk about `external` functions. These are quite obviously meant to be be called only from outside the contract.

What’s so interesting about this, if we already have `public` functions? The answer is that this extra knowledge allows the EVM to make **optimizations**.

> I hate the word **optimizations**. They should be called **improvements**. [Optimizing something](https://en.wikipedia.org/wiki/Mathematical_optimization) refers to the act of finding extremes (minimums or maximums), which is **not** what we’re doing here. Just wanted to say that.

Whenever a function is called, its arguments are copied to **memory**. Just like any programming language out there, the memory is a temporary space that can hold information, and can be read and written to.

> There’s a lot to say about memory, but I won’t cover that this time. Here’s a [very detailed article about memory in EVM](https://medium.com/coinmonks/solidity-memory-how-does-it-work-d40e04b97cf0), if you’re interested!

Copying stuff to memory **consumes gas**, which means that it makes transactions a little more costly.

External calls can bypass this copying step, because the arguments are available in a special location: the **call data**! Because of this, adding this modifier saves us a little gas. Pretty neat!

### Virtual Functions

As it has already been suggested, contracts often times extend other contracts, in a similar fashion to class inheritance (OOP style).

In this kind of context, we sometimes just want to write a contract for other contracts to extend, and modify. This is where **virtual functions** come in: they’re like a marker that says “hey, you can override this!”.

The counterpart to the `virtual` modifier is the `override` modifier, which specifically (and obviously) states that a function overrides the target virtual function:

```solidity
contract Base {
  function someOperation() public virtual returns (uint) {
    return 42;
  }
}

contract Extended is Base {
  function someOperation() public override returns (uint) {
    return super.someOperation() * 2;
  }
}
```

Virtual functions can be left without an implementation — but in that case, they also need to have the `abstract` modifier, which means that a function definition **must** be provided by a child contract. If we don’t use `abstract`, however, providing an implementation is **optional**. If we don’t override a function, we’ll simply be using the default implementation in the `virtual` function’s definition.

### The Payable Flag

When we talked about what keys comprise a transaction, we mentioned that one of the things that can be specified is `value`, which determines an amount of Ether (or Wei, really) to transfer.

Usually, this value is used to transfer Ether from one EOA to another. Although nothing stops us from setting a value in a transaction that is meant to be a contract function call. What happens then?

Suppose we call some method `deposit` in a contract. By default, contracts are **not expected** to receive Ether. And so, a call to this method will fail if there’s an attached `value`.

> This is a safety feature — we don’t want contracts accidentally receiving Ether that they may not know how to handle.

The transaction reverts unless we mark the `deposit` function as `payable`:

```solidity
function deposit() external payable {
  // ...
}
```

The `payable` modifier simply tells the Solidity that an Ether value **is fair game** in a call to the marked function. And as developers, we have access to that value in the form of `msg.value`. For instance, this contract works as a **vault**, holding the transferred Ether from accounts, and keeping track of the different accounts’ balances through a mapping:

```solidity
contract Vault {
    mapping(address => uint256) balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdrawAll() external {
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;

        // Send the ether back to the caller
        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
```

Just a fun quick example — but here, you can already see how it makes sense for this contract to receive Ether, and actually do something with it.

> Payable also applies to the constructor, by the way. If you want your contract to be able to receive Ether during deployment, you just mark the constructor as payable!

Now, you may be wondering... But what if I call a method that **doesn’t exist**? Or even call a contract without a method! How does this even play with `payable`?

### Catching Unknown Calls

Solidity (and the EVM) provide two special functions to handle these border cases: the **fallback** and **receive** functions.

It’s very simple, really:

- The `fallback` function is called when someone calls a method that **doesn’t exist**, or the call data doesn’t match any function (meaning the provided inputs don’t match the expected ones).
- The `receive` function is even more specific: it’s only called when someone sends Ether to a contract address, without attaching any call data.

```solidity
function fallback() external {
  // Handle unknown calls
}

function receive() external payable {
 // Handle plain Ether transfers
}
```

> As you can see, `receive` is marked as `payable`, so that the transaction doesn’t revert, and the contract can receive Ether.

These are sort of a contract’s safety nets. They catch any unexpected interactions with it. And although this is their main purpose, they allow for some pretty interesting patterns, like this [Proxy contract](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/3bdc3a35c504396c7227cecc32f50ae07da7e5c1/contracts/proxy/Proxy.sol#L59) which delegates all calls to it to another contract, using a tool we’ve already covered: the delegatecall opcode!

> Oh, and if a contract doesn’t have an implementation for either function, it assumes its body is empty, but executes them nonetheless if needed.

It’s nice to see the pieces fitting together, isn’t it?

<video-embed src="https://www.youtube.com/watch?v=CpjH9M2SYsk" />

### Destroying a Contract

A good way to follow up on that Homelander meme is to talk about contract destruction. Yup.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/destruction.webp" 
    alt="Homelander laserin' things"
    width="600"
  />
</figure>

There’s a special opcode for this, called [SELFDESTRUCT](https://www.evm.codes/?fork=cancun#ff).

```solidity
function destroy() external {
  require(msg.sender == owner);
  selfdestruct(payable(someAddress));
}
```

When this opcode is called, three things happen:

- All remaining Ether in the contract is force-sent to the specified address, even if it doesn’t have a receive function.
- The contract’s code and storage are removed from the blockchain state.
- All future calls to the contract’s address will fail.

This functionality — cool as it may seem — is generally considered **dangerous**. In particular, when combined with **CREATE2**. Imagine someone destroys a contract you’ve been using, and replaces it with a malicious one with the same address. Not cool, bro.

<figure>
  <img
    src="/images/blockchain-101/smart-contracts-part-2/evil-woody.webp" 
    alt="Evil Woody meme"
    title="This is how I imagine someone looks like when doing these things."
    width="500"
  />
</figure>

The general recommendation is to use the proxy pattern we mentioned before for upgradable contract, or to use a simple boolean flag if your intention is to disable a contract. These patterns are generally safer for everyone involved.

> In fact, there have been [discussions in the Ethereum community](https://ethereum-magicians.org/t/eip-6780-deactivate-selfdestruct-except-where-it-occurs-in-the-same-transaction-in-which-a-contract-was-created/13539/19) to remove the selfdestruct code altogether.

---

## Summary

Well, that was a mouthful for sure.

We’ve covered various call patterns, different transaction deployment methods, and special functions and modifiers. This should serve as a good starting point, at the very least.

I reckon that after reading this article, you might recognize some of the questions from that [Rareskill test](https://www.rareskills.io/test-yourself) — and now, you’ll actually know how to answer some of them.

> Not all of them, though!

There’s really a lot to know about not only Solidity, but also about Ethereum as a whole, and its various standards (ERCs).

The community is always pushing to evolve the network, reviewing not only the accepted standards, but how the network works as a whole. So it’s important to stay updated on the latest developments.

I’m a firm believer that the best way to learn things is by doing — you know, getting your hands a little dirty. The theory is always good, but you’ll surely never forget a three-hour-long struggle trying to understand why your Smart Contract is not doing what it’s supposed to.

So get into it, play around with some ideas, and you’ll surely learn much more than what this article alone can provide.

---

After spending two articles covering quite a few things about the ins and outs of Solidity, it would be good for us to step back and look at the bigger picture. [Next time](/en/blog/blockchain-101/consensus-revisited), we’ll revisit a familiar topic — this time from Ethereum’s perspective: **consensus**.

See you soon!
