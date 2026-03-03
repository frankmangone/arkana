---
title: 'The ZK Chronicles: Groups'
author: frank-mangone
date: '2026-03-02'
thumbnail: /images/the-zk-chronicles/groups/judge-judy.webp
tags:
  - zeroKnowledgeProofs
  - groups
  - ellipticCurves
description: >-
  After stocking up with hashes, now's time for another big protagonist of this
  ZK story!
mediumUrl: 'https://medium.com/@francomangone18/the-zk-chronicles-groups-4b8ab3d4d823'
contentHash: c61f0094b8d980c02eab0452cb4f78d00f74a7fe7586cd145238965f36410cce
---

Our last encounter saw us introducing a crucial tool in the form of [hashes](/en/blog/the-zk-chronicles/enter-hashing).

It’s incredible how much potential a single new cryptographic primitive unlocked for us. But to continue moving forward, hashing alone won’t make the cut!

We’ll need a couple more tools, which will finally clear the path forward (almost) completely, allowing us to tackle the most sophisticated ZK techniques out there.

Today’s topic then will be mathematical groups. It’s an abstract concept, but don’t let that intimidate you: we’ll rapidly bring things onto familiar territory.

We’ll have to cover some more complicated stuff, but again, no need to worry too much about that. We won’t be diving super deep into the finer details, and only the most important ideas will be enough for now. Plus, there’s plenty of material out there to help guide you through the nuances of today’s constructions.

> Of course, I’ve written a lot about them as well, so I’ll take the liberty of linking to relevant blogposts as we go!

That’s all I have for today’s intro! Time to get down to business.

---

## Groups

The first concept we need to talk about today is that of a **group**.

Names can be a little deceiving here. Talking about a group probably leads us to imagine something along the lines of a bunch of elements clumped together. And while there’s some truth to that statement, it’s far from the full story.

In fact, the above definition is better suited to describe a mathematical [set](https://en.wikipedia.org/wiki/Set_(mathematics)).

> Which is exactly that: a bunch of elements forming a single entity!
>
> To be fair though, [set theory](https://en.wikipedia.org/wiki/Set_(mathematics)) is a very important area of math, with rich expressiveness and very deep theorems (like the [Well-Ordering theorem](https://en.wikipedia.org/wiki/Well-ordering_theorem)). That will be a topic for another time though!

A [group](https://en.wikipedia.org/wiki/Group_(mathematics)) is actually comprised of **two things**: a set, and a single **binary operation**: a function which takes two inputs in said set, and outputs another element also belonging in the same bag.

Yeah, I know. Smells of abstract math, and that gets scary real fast.

The good news though is that we won’t be needing to focus on the whole universe of possible weird groups. We need only know of a couple groups of interest (or families of groups), and that should be enough to cover for the remainder of the series!

<figure>
	<img
		src="/images/the-zk-chronicles/groups/star-wars.webp"
		alt="Maz Kanata with a serious look"
		title="I don’t know if I trust you anymore"
	/>
</figure>

So before we even look into the nice properties that actually make groups useful for cryptography, let’s hone into our two protagonists, which are the workhorses of modern techniques.

---

## Integers, Revisited

Wait, **integers?** Haven’t we covered those already?

No, your memory is not betraying you. The positive integers (modulo $p$) were the prime example (pun intended) of [finite fields](/en/blog/the-zk-chronicles/math-foundations/#finite-fields), a construction we defined right at the beginning of the series.

As you might recall, a finite field was a **set** coupled with **four operations** rather than a single one. A finite field sort of “works” as a group as long as we only take into account one operation, but we’d be cheating: most of the interesting properties of groups are heavily focused on the guarantee that there’s a single valid way to combine two group elements, effectively ruling out other **shortcuts**.

That adds even more weight to our question: how come integers are a valid candidate at all? Well, consider what happens when we **remove zero** out of the original set:

$$
{\mathbb{Z}_p}^* = \{1,2,3,...,p-1\}
$$

It feels like an inconsequential change, sure. But here’s the thing:

::: big-quote
Can we add any two elements in this set?
:::

Take a moment to consider the options. Adding two random elements seems plausible. $2 + 3$ is still $5$. If we go out of bounds, we apply the modulo operation, and we’re still good.

But what happens when we add $1$ and $p - 1$? The result would of course be zero. But... **Zero is no longer in the set**! Because of this, addition **does not qualify as a valid operation** now. Or, more formally, we say that the set is **not closed under addition**.

Multiplication is a different story though. See, all elements in the set are smaller than $p$. And if $p$ is a prime number, then you can never multiply two set elements to produce $p$, because that would mean $p$ **is not prime to begin with**!

> Maybe take a moment to absorb that information!

In fact, you can’t even multiply two set elements to obtain any multiple of $p$ (a number of the form $k.p$). These are the only numbers that would result in $0$ once we apply the modulo operation:

$$
k.p \ \textrm{mod} \ p = 0 \ / \ \forall k \in \mathbb{Z}
$$

In other words, we can **never get zero** as the result of multiplying two set elements! Meaning the integers modulo $p$, when stripped of the zero element, are only closed under multiplication — they form a **multiplicative group**!

<figure>
	<img
		src="/images/the-zk-chronicles/groups/turn-the-lights.webp"
		alt="Turn The Lights Off meme"
		title="I said ooh-ooh"
	/>
</figure>

> Also worth mentioning, if we include zero again ($\mathbb{Z}_p$), we’d have a problem with multiplication. Zero would not have a well-defined multiplicative inverse. This is, you can’t **undo** multiplication by $0$ because $0 \times \text{anything} = 0$!
>
> And this disqualifies this set as a group!

Indeed, this version of the integers is called the [multiplicative group of integers modulo](https://en.wikipedia.org/wiki/Multiplicative_group_of_integers_modulo_n) $p$. It’s extremely useful for a number of reasons, and it’s also as easy as things can get.

The next one, although very well-known, hides a lot more complexity.

---

## Elliptic Curves

The other group that’s supremely important in cryptography is the one emerging from **elliptic curves**. You know, these guys:

<figure>
	<img
		src="/images/the-zk-chronicles/groups/elliptic-curve.webp"
		alt="An elliptic curve" 
		title="[zoom] Oh hey there!"
	/>
</figure>

What we’re seeing up there is a curve that satisfies the following expression:

$$
E: y^2 = x^3 + ax + b
$$

Naturally, one can’t help but wonder **how the heck** you build a group out of that. To that question, there are two answers I can offer: the short and pragmatic one with just what we need, or a full and lengthy disclosure.

I’ll let you decide.

If you choose to stay in this article, we’ll cover exactly what you need for ZK: the essential structure and properties. That’s our focus here, nothing more.

> But if you want to take the red pill, I can also show you [how deep the rabbit hole goes](/en/reading-lists/elliptic-curves-in-depth/)!

<figure>
	<img
		src="/images/the-zk-chronicles/groups/pills.webp"
		alt="Pill selection scene from Matrix" 
		title="What a scene"
	/>
</figure>

### Building The Group

The simple version of the story is quite straightforward, actually: the group elements will be **points on the curve**. To construct the group though, we need a mechanism to **add points together**.

Thus, we’ll give a rather contrived definition for what **adding points on the curve** means.

> I want to stress out this might feel a little forced because we don’t want to explore the deeper theory here, but in reality, the operation makes perfect sense!

Adding two points proceeds as follows:

1. First, draw a line passing through the two points we’re trying to add, say, $P$ and $Q$.
2. Said line will intersect the curve at yet another point (because elliptic curves have degree 3!).
3. Flip this point over the x-axis. Because the curve is symmetric, the mirror image will also land on the curve.
4. You have arrived at $R = P + Q$.
5. Profit!

The whole process looks like this:

<figure>
	<img
		src="/images/the-zk-chronicles/groups/point-addition.webp"
		alt="Point addition on an elliptic curve"
		title="[zoom]" 
	/>
</figure>

Of course, there are some **special cases**. For instance, how do you add $P$ to **itself**? Or how do you add $P$ and $-P$ (its mirror image), when the vertical line passing through them does not intersect the curve a third time?

The former situation is solved by using the tangent of the curve at $P$ in the first step. The latter, however, demands a little more creativity. But we’ll leave that for another time!

Lastly, we must understand that these curves are **not continuous**. The images we just saw are merely illustrative, because in cryptography, we always need to operate on a **discrete**, **precise** world. Therefore, the “true” elliptic curves we’re gonna be using in all our constructions actually look like this:

<figure>
	<img
		src="/images/the-zk-chronicles/groups/elliptic-curve-group.webp"
		alt="An elliptic curve group" 
		title="[zoom]"
	/>
</figure>

Chill. If you’ve chosen the pragmatic path, the good news is we don’t need to worry too much about the finer details of how elliptic curve point addition works.

> Although, if you’re curious, you can get a little peek into this topic [here](/en/blog/elliptic-curves-in-depth/part-1/#defining-operations),

All we need to know is that these points do have a group structure, induced by the operation we just defined.

And with that in mind, we can focus on what matters for us today: group properties.

---

## Properties

Truth be told, I wasn’t very precise before. For a group to be a group, we need a little more than just a set and an operation: these two components need to follow a certain **set of rules** (or have some particular properties).

For a group to be a group then, we require it to have some **special elements**, and we also need the operation (which we’ll denote $\oplus$ for now) to **behave in a certain way**.

Let’s talk about the operation first, which has **two simple requirements**, one of which you already know about:

- **Closure:** For any two elements $a$ and $b$ in the group, the result of combining them $(a \oplus b)$ must also be in the group.
- **Associativity:** How we group sequential operations is irrelevant. This is, $(a \oplus b) \oplus c = a \oplus (b \oplus c)$.

That’s all!

<figure>
	<img
		src="/images/the-zk-chronicles/groups/homelander.webp"
		alt="Happy Homelander" 
		title="Oh nice!"
	/>
</figure>

> Note that we don’t require commutativity ($a \cdot b = b \cdot a$) to hold. Groups where commutativity also happens to hold are called [Abelian groups](https://en.wikipedia.org/wiki/Abelian_group).

The other thing we need to talk about are a couple requirements for group elements, which are again quite simple:

- **Identity element:** There must exist a special element $e$ where $a \oplus e = e \oplus a = a$ for any element $a$.
- **Inverses:** For every element $a$, there exists another element $b$ such that $a \oplus b = b\oplus a = e$ (the identity).

> It’s quite obvious what these elements are in $\mathbb{Z}_p$. But can you guess what they are on [elliptic curve groups](/en/blog/elliptic-curves-in-depth/part-1/#an-edge-case)?

When working with groups, we automatically get all these guarantees, and this has some interesting consequences.

### Group Generators

Now, some groups have a special property: by selecting a single element, and applying the group operation repeatedly **on itself**, you can recover the **entire group**, eventually cycling back to where you started.

<figure>
	<img
		src="/images/the-zk-chronicles/groups/cyclic-group.webp"
		title="[zoom] A small 4-element cyclic group with generator G"
	/>
</figure>

Fortunately, mathematicians were quite descriptive with the naming conventions they chose for these next couple concepts: the “seed” element (in this case, $G$) is called the **generator**, and it produces a **cyclic group** (generated by $G$).

> To make the notation a bit more concise, we generally use $G^k$ to represent “apply the group operation $k$ times to $G$”.

Now, not every element in a group is a generator.

Take for example $\mathbb{Z}_7$ (multiplicative group), and let’s start with the element $G_1 = 3$. If you do the math (remember to apply the modulo operation), you’ll see it seems to work, as we obtain the sequence $3 \rightarrow 2 \rightarrow 6 \rightarrow 4 \rightarrow 5 \rightarrow 1 \rightarrow 3$, so $G_1 = 3$ is indeed a generator. However, $G_2 = 2$ gets stuck on a smaller loop: $2 \rightarrow 4 \rightarrow 1 \rightarrow 2$.

While we’re not able to generate the full group, we still did generate something: a smaller group, **included** in the original one. This is what we call a **cyclic subgroup**.

> We also say that the **order** of the generator (and of the generated subgroup) is the number of times we need to apply the operation to get back to the identity element.

Simple, right?

We’d probably be forgiven to think cyclic groups are just some fancy math definitions belonging on a shelf, but they are in fact the **key** to building cryptographic systems!

### The Discrete Logarithm Problem

Imagine we have a cyclic group $\mathbb{G}$, generated by some element $G$, which is usually denoted:

$$
\mathbb{G} = \langle G \rangle
$$

Now, imagine we want to calculate $G^k$. Calculating this value in the group of integers modulo $p$ is super simple: we can just use standard exponentiation rules.

> Just imagine this: if you want to calculate $G^8$, you first calculate $G^2$, then you square that value to get $G^4$, and then you square again to get to the final result! A total of **three** operations instead of **seven**!

The same can be said about elliptic curve groups: there are fast algorithms (square-and-add style) to apply the group operation $k$ times.

No problem so far. But what about the **other direction**? What if we’re asked to find how many times the group operation was applied to reach a given result $H$?

$$
G^k = H
$$

Naturally, $k$ is called the **discrete logarithm** of $H$. And contrary to what we might expect from our experience calculating logarithms in continuous settings, finding $k$ in this situation can be **extremely challenging**.

The reason for this asymmetry has to do with the “jumpy” nature of finite groups: because of their cyclic behavior, we don’t get bigger and bigger values as we repeatedly apply the group operation, and instead we cycle **back to the beginning multiple times** throughout the process.

> Take $\mathbb{Z}_7$ as an example. The result of $3^2$ is not $9$ — it’s actually $2$!

Which also means that there’s **no standard recipe** for finding a discrete logarithm. The best you can do under normal circumstances is **trial and error**, and depending on the **order** of the generator, this can be relatively easy or **absurdly hard** (for larger groups).

This is known as the **Discrete Logarithm Problem**, or DLP for short. From a cryptographic standpoint, this is **super attractive**, as we’re usually interested in these kinds of problems that are impossibly hard to reverse to protect sensitive information.

> So much so, that a good portion of modern cryptography is founded on the hardness of this problem. Several key exchange, signature, and encryption techniques rely on this single assumption!

Cyclic subgroups and the DLP are unquestionably important, but there’s **one particular type** of cyclic group that we need to focus on, because of how crucial it is for ZK systems.

Without these special elements, many algorithms and protocols just wouldn’t work.

> Or at least, they wouldn’t be **fast**, which would also make them **impractical**.

Let’s talk about them.

### Roots of Unity

Here’s the raw definition: an **n-th root of unity** is an element $\omega$ such that when you apply the group operation $n$ times, you get back to the identity:

$$
\omega^n = e
$$

> To be completely transparent here, the concept of an n-th root of unity is **not exclusive to groups**.
>
> Take for example the complex numbers! They are a complete field, and yet the imaginary unit $i$ is a 4th root of unity!

Any integer power of a root of unity is also a root of unity, because we can decompose them like so:

$$
(\omega^k)^n = \omega^{k.n} = (\omega^n)^k = e^k = e
$$

> Some n-th roots of unity are special in that they can generate all other n-th roots of unity. These are called **primitive** n-th roots of unity!

Interestingly, roots of unity also exist in **finite fields**. You probably already spotted this from everything we’ve gone through so far, but every (prime) finite field becomes a multiplicative group when we strip the element $0$. And such a group has **generators** and possibly even **cyclic subgroups** — the roots of unity for the prime field!

Ok... And? Cool story bro, but why are roots of unity useful?

<figure>
	<img
		src="/images/the-zk-chronicles/groups/judge-judy.webp"
		alt="Judge Judy with an eyeroll" 
		title="You again with the weird definitions..."
	/>
</figure>

One reason: the **Fast Fourier Transform**, or **FFT** for short.

We won’t be diving into the details right now, but without FFT, most of the techniques we’ll be exploring further down the line would be useless. And coincidentally, FFT exploits the **special structure** of roots of unity to provide us with a very fast way to interpolate polynomials!

### Group Equivalence

Before we go, there’s one more tiny detail I’d like to mention. It’s just a little trick that we might need to tap into to make our life easier in the future.

As we’ve already stated, every group comes equipped with its own binary operation. This operation can be of wildly different natures: sometimes, it’s as simple as addition and multiplication, but there are more complex examples like the operations we saw for elliptic curves.

> There are even more abstract examples, like the group operation of the group used to model a [Rubik’s cube](https://en.wikipedia.org/wiki/Rubik%27s_Cube_group).

Using said operation can make the mathematical treatment of some proofs quite cumbersome.

However, you may have noticed that our focus today has not been on the specifics of each group operation, but on the properties of groups in general. I even suggested we use the exponential notation $G^k$ even when we’re not dealing with multiplicative groups. And that’s no coincidence, really: there’s something deeper going on here.

The reason is that even when two groups can look completely different at face value, they can behave **exactly in the same way**.

> For example, take $\{0, 1\}$ under addition mod 2, and $\{1, 2\}$ under multiplication mod 3. They clearly have different elements, and different operations.
>
> But now, map $0 \rightarrow 1$ and $1 \rightarrow 2$. Suddenly, every operation in the first group has a **perfect match** in the second: $0 + 0 = 0$ corresponds to $1 \times 1 = 1$, $0 + 1 = 1$ corresponds to $1 \times 2 = 2$, $1 + 1 = 0$ corresponds to $2 \times 2 = 1$.
>
> They are **the same group**, just wearing different labels!

Indeed, two groups can share the **same structure**. Without going into much detail, what this means is that we can find a **one-to-one correspondence** (a [bijection](https://en.wikipedia.org/wiki/Bijection)) from elements in the first group to elements in the second one, and that the group operation essentially behaves exactly the same on both groups.

When this happens, we say that the groups are **isomorphic**.

> An isomorphism is actually a more constrained version of an **homomorphism**, which only requires the operation to behave the same, but not the one-to-one correspondence!

As a consequence, when presented with a group with a complex operation, we can do something very clever to make working with it a simpler task: find a **convenient isomorphism**.

And here, I’ll simply drop a couple facts to make our lives easier. First:

> Every single cyclic group of order $n$ is isomorphic to the additive group of integers modulo $n$.
>
> In a way, this is only saying that there’s always a **natural ordering** to the elements of any cyclic group!

Secondly, for any cyclic group, we can always find **some** multiplicative group to which it is isomorphic. The construction isn’t as clean as the additive case though: we need to look at multiplicative groups in carefully chosen fields, or consider subgroups. But the point is that such a group **always exists**!

It might sound like a simple technical detail, but that’s really the reason we can always use exponential notation: because we can always leverage that isomorphism to a simple multiplicative group.

How cool is that?

---

## Summary

Alright, that was probably more than enough for a single article!

Groups are **the** mathematical backbone of modern cryptography.

> Although, this may change soon with the advent of [post-quantum cryptography](/en/blog/cryptography-101/post-quantum-cryptography).

Their structure is behind the security of a great deal of techniques out there, and we also mentioned how they enable some crucial optimizations, as they are a prerequisite for FFT.

With this, we’re closing in on finishing with the foundational concepts we’ll need throughout our journey. While there are still a couple concepts we’re missing (looking at you, pairings), we’re mostly covered.

All that remains is to start building more complex gadgets and techniques with our new toys, as we start making our way into more sophisticated protocols, and closer into ZK terrain.

Let’s waste no time then! Next issue, we’ll talk about [commitment schemes](/en/blog/the-zk-chronicles/commitment-schemes-part-1), and we’ll see how we can start building interesting stuff out of groups.

See you soon!
