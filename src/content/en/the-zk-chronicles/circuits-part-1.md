---
title: 'The ZK Chronicles: Circuits (Part 1)'
author: frank-mangone
date: '2025-12-08'
thumbnail: 'https://cdn-images-1.medium.com/max/640/0*sgS-5SnPV3A0P6gf.jpg'
tags:
  - zeroKnowledgeProofs
  - arithmeticCircuits
  - polynomials
  - sumCheck
description: >-
  As we get closer to general proving systems, we are required to look at
  computation models, which brings us to circuits!
mediumUrl: >-
  https://medium.com/@francomangone18/the-zk-chronicles-circuit-part-1-b3367ef443b3
contentHash: 136e4d0e54d723354d6957f4d48a71b860f323959b3fd3836fb4e7eff08acccf
supabaseId: null
---

After going through the [previous article](/en/blog/the-zk-chronicles/sum-check), we have learned about our first proving system in the form of the sum-check protocol.

Sum-checking is nice and all, but let’s face it: a sum over a boolean hypercube is not particularly compelling. We’re gonna need a more **general framework** to represent arbitrary computations, thus allowing us to prove a broader range of things.

To do so, we first need to figure out something that’s at the very crux of verifiable computing: how to **represent computations** themselves.

There are many ways to model computations, so today, we’ll just focus on a single construction to do just that: **circuits**.

Cool! With out goal clearly set, let’s go!

---

## Circuits 101

It’s no secret that circuits are a very general model for computation.

Your computer’s CPU is built from tens of millions of tiny **transistors**, which form logical circuits that let your computer perform an extremely wide range of operations — from executing a simple multiplication in your calculator app, to complex tasks like controlling the pixels of the screen you’re reading this on.

> Unless this text ever makes it to a paper version, in which case you wouldn’t be looking at pixels... But you get the point.

Amazing! But rather than thinking in terms of transistors and physical circuits, we’re talking math here. We’re gonna need a rigorous definition of a circuit — one we can work with in terms of our polynomials and protocols.

So, this is how we define them: a **boolean circuit** is a [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) (DAG) where:

- **Internal nodes** (called **gates**) represent operations ($\textrm{AND}$, $\textrm{OR}$, $\textrm{NOT}$, etc.)
- **Edges** (or **wires**) carry boolean values ($0$ or $1$) between gates
- **Input nodes** have no incoming wires — they’re where we feed our data
- **Output nodes** have no outgoing wires — they produce the final result(s)

Requiring circuits to be DAGs is essential: it establishes a flow from inputs to outputs, neatly representing a computation.

Here’s an example:

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/1024/1*-v8GYT0Y1pbn7zFKBT4rQQ.png"
		alt="A simple circuit"
		title="[zoom]" 
	/>
</figure>

> Some formulations put the negations as inputs, thus making the number of inputs a function of the original $n$ inputs. This only impacts cost analysis, but the formulation is completely equivalent!

Circuits can represent a lot of things. In this boolean form, they express **logical conditions** that we want to evaluate on a series of inputs. For instance: am I over 30, and am I male, and do I have a job or some other kind of source of income? That statement, we can express as a simple boolean circuit!

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/1024/1*j2J3glxpvTnRtllSh_FBcQ.png"
		alt="A representation of the above statement as a circuit"
		title="[zoom]" 
	/>
</figure>

All in all, a circuit is just a **static recipe** for a computation with some nice properties, like being **deterministic** (same inputs always return the same values), and being composable (circuits can be **chained together**, just like in computers).

Lastly, we measure the **size** ($S$) of a circuit by its number of gates, while the **depth** ($D$) is the longest path from any input to any output.

---

With that, we have our first way to prescribe some computation. Granted: we are only admitting boolean variables — but that doesn’t seem to stop computers to be used for almost any task.

However, I must remind you: our goal with this series is to **prove statements** about computations. Thus, now our focus should shift into trying to prove something about these circuits.

And that leads us to our next problem.

---

## Circuit Satisfiability

While we could try to prove if the output of a boolean circuit is correct given a set of inputs, that might not feel too interesting of a problem (at least for now). After all, the output is also a boolean value, meaning that we only have **two possible outputs**.

> It would be a different story if we could have **multiple possible outputs**. We’ll explore that idea in a few moments!

Perhaps we can think of something slightly more fun.

How about this then: given a circuit, what if we ask ourselves if there are **any inputs** that make the output $1$?

When this happens, we say the input **satisfies** the circuit. And determining whether a circuit has any satisfying inputs is known as the circuit satisfiability problem, or CSAT for short.

> This is actually a hugely important problem, as we’ll soon learn. Many other problems like **factorization** or **graph coloring** can be reduced to circuits. We won’t dive into those transformations today, though — but it’s definitely possible.
>
> We’ll pick this conversation up in a few articles!

CSAT is already a challenging problem in its own right, but today, I want us to take it even further. We’ll not only be asking if a solution exists: our goal for today will be to prove that we know **exactly how many solutions exist**. In other words, we want to count all the possible **combinations of inputs** whose output to the circuit is $1$.

This is what we call the **counting** version of circuit satisfiability, written as #SAT (the # symbol denotes counting).

Once again, I’ll bet you’re wondering **why the heck would we care**. To be fair, that’s a reasonable question about today’s endeavors. It feels more natural to find a solution to a problem than to enumerate all possible solutions. And although there may be situations where this is desirable, I want to give you two different reasons to focus on #SAT:

- First, it’s a **strictly harder problem** than CSAT. Hence, if we can handle #SAT efficiently, we’re almost guaranteed to be able to handle CSAT efficiently as well — we just need to prove the number of satisfying inputs is greater than zero!
- Secondly, we choose this problem because of its mathematical representation, which happens to be very **convenient** given our current knowledge. There’s a very nice and concise way to represent this #SAT problem: if we interpret the circuit as a **function** $\phi (X)$ with $n$ boolean inputs, then we can express the number of satisfying combinations as:

$$
\sum_{x \in \{0,1\}^n} \phi(x)
$$

> It’s okay to sum over the entire set of possible combinations, because non-satisfying ones will result in $\phi (X) = 0$.

As you can imagine, finding this quantity (of satisfying combinations) is a **very hard problem**. The fastest known algorithms have a performance similar to a simple brute force approach, which is just churning through all possible combinations.

And about that **convenience** I talked about before, have you noticed how the #SAT expression looks **strikingly similar** to the sum-check one? We're just calculating the sum of a function over a set of inputs in a **boolean hypercube**. That's a clear hint — we just need to figure out how to apply a sum-check to our new problem, and we'll have a verification algorithm for free!

### Transforming the Circuit

Cool! So, let’s say we have some binary circuit $\phi (X)$.

Unfortunately, the **boolean nature** of the circuit becomes a limitation. To apply the sum-check protocol, we’d need to evaluate $\phi (X)$ in points other than $0$ or $1$, but our circuit can’t handle that...

For now!

We’d need to somehow **extend** this function to handle other input values. And since our circuit is made out of **gates**, all we’d need to do is figure out a way to extend those, so that they behave as you’d expect when inputs are binary, but still be able to process other values as inputs.

So, how do we do that?

Well, we don’t have many mathematical tools at our disposal yet — in fact, the only useful construction we’ve learned about are **polynomials**. But that’s plenty: how about we try expressing **gates as polynomials**?

> As a little exercise, you can try to come up with some expressions for this yourself. Here, I’m gonna throw in a little spoiler block in case you want to give it a go!

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/673/0*OE1jnhyk87I0ZedJ.jpg"
		alt="A spoiler block box" 
		title="Spoiler block"
	/>
</figure>

Here’s how the polynomial representation of an $\textrm{AND}$ gate looks like:

$$
\textrm{and}(X,Y) = X.Y
$$

This would be the $\textrm{OR}$ gate:

$$
\textrm{or}(X,Y) = X + Y — X.Y
$$

And negation would be:

$$
\textrm{neg}(X) = \bar{X} = 1 — X
$$

> Of course, other logical gates have their respective polynomial representations. For instance, the $\textrm{XOR}$ gate, which can be constructed by a combination of $\textrm{AND}$, $\textrm{OR}$, and **negation** gates, would result in a polynomial that would be the composition of the individual polynomials at play here.
>
> The resulting expression would be $\textrm{xor}(X,Y) = X(1 - Y) + (1 - X)Y$. If you're feeling a little edgy, try it yourself!

<quiz src="/the-zk-chronicles/circuits-part-1/nand-gate.json" lang="en" />

Marvelous! By replacing each gate by these polynomials, we are in fact **directly extending them**: the gates work just as you'd expect for boolean inputs, but do **other things** when fed other values in some **finite field**.

> Remember how I said having multiple possible outputs would be interesting? Well, there you go!

Effectively, we have **transformed** our initial boolean circuit $\phi (X)$ into a new type of construction, called an **arithmetic circuit**, which we'll denote $\varphi (X)$.

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/1024/0*izjJBjYkuP-Ovn4Z.jpg"
		alt="Mind = blown"
	/>
</figure>

### Arithmetization

Now, I want us to stop at one small detail. Look at the $\textrm{AND}$ gate for a moment:

$$
\textrm{and}(X,Y) = X.Y
$$

It wouldn’t be hard-pressed to call it a **multiplication gate** instead, now that we have extended it to inputs on a finite field. After all, multiplication is kind of a **primitive operation** in our field.

On the contrary, the $\textrm{OR}$ gate is not as primitive-looking. One might wonder if we need to preserve these gates as they are, or if we can **unwrap them** into simpler operations.

Well, the other primitive operation we have in finite fields is **addition**. So, how about we work with **addition** and **multiplication** gates alone? Is it possible?

Sure as hell, it’s **entirely possible** to do this!

> Before you ask: subtraction of some number $b$ is achieved by multiplying it by the **additive inverse** of $1$, which is $p - 1$ (in the field $\mathbb{F}_p$). This is, to get $a - b$, we compute $a + (-b)$ instead, where $-b = (p-1)·b$.
>
> It's exactly like multiplying by $-1$!

This process is so important, it even has a name of its own: **arithmetization**.

---

Wonderful! We now have a way to extend boolean circuits into arithmetic ones, making it so that they can process any input on a given field $\mathbb{F}$.

Note that our arithmetic circuit $\varphi(X)$ is basically equivalent to a polynomial $g(X)$, obtained via **composition** of gate functions.

> More often than not, it’s a non-linear polynomial.

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/1024/1*epCteoiYvfwK6rFXHT86Pg.png"
		alt="A circuit interpreted as a polynomial"
		title="[zoom] This would result in g(X,Y,Z) = YZ² + X² + YX + 3YZ"
	/>
</figure>

And since $\varphi(X)$ is a polynomial over some field $\mathbb{F}$, we can directly apply our trusty sum-check protocol to evaluate satisfiability!

<figure>
	<img
		src="https://cdn-images-1.medium.com/max/640/0*sgS-5SnPV3A0P6gf.jpg"
		alt="Bender from Futurama on its 'Nice' meme" 
	/>
</figure>

So there you go — we've now seen a problem (#SAT) that can be **transformed** into an instance of the sum-check protocol.

There are some other nuances we need to address, like figuring out how big $\mathbb{F}$ needs to be for the soundness error to be small — but we need not care too much for that now. My goal is to try and convey core ideas for now, of which **arithmetization** is an important one.

### Computational Costs

> I think it’s safe to skip this part if you’re here for the core concepts. If that’s your case, then skip ahead!

While it’s not really necessary to dive into a completeness and soundness analysis (because it would be very similar to the one we already did for the sum-check!), it does make sense to talk about **computational costs**.

Here, rather than thinking of $\varphi(X)$ as a **polynomial**, we need to think of it as a **recipe for computation**. After all, we don’t have the coefficients of the resulting polynomial, but a set of addition and multiplication gates.

And we ask ourselves: does this have any tangible consequences? Thus, we need to look at the impact on **execution time** for each actor in the protocol.

Let’s start with the **prover**. They will need to evaluate the circuit on every input in $\{0,1\}^n$. Each evaluation requires each of the $S$ gates to be evaluated individually, so the full cost is $O(S \cdot 2^n)$. The partial sums in each round get less and less expensive, so the total prover time is just $O(S \cdot 2^n)$.

So yeah, it’s more expensive than plain sum-checking. And the larger the circuit, the worse the situation gets. But remember: the prover is still the one with the powerful hardware!

In contrast, the verifier performs a total of $O(n)$ rounds of sum-check (one per variable), only checking simple polynomial equations in each round.

Furthermore, the verifier costs remain at $O(n)$ if we assume oracle access. However, in practice, the verifier can just **run the circuit themselves** (if they have knowledge of it, of course), and thus don’t have to trust some external source (the oracle). If they do, then we need to include the circuit evaluation costs, and the verifier runtime becomes $O(n + S)$.

Lastly, we have a communication cost of $O(n)$ field elements, since we exchange a fixed number of field elements on each round.

> Strictly speaking, the number of field elements depends on the size of the largest univariate polynomial sent by the prover — but let's not worry too much about that, and assume these are going to be low-degree polynomials.

<quiz src="/the-zk-chronicles/circuits-part-1/extension-purpose.json" lang="en" />

Okay, sorry for the information dump! All this is to finally say: at the very least, #SAT's performance is **strictly worse** than the sum-check runtime.

The new ingredient in the mix is the **circuit size**, $S$. It would be very cool if verification time was **sublinear** in circuit size rather than linear, as is our current case. That way, we could still verify computations on large circuits fast — but linear time in circuit size essentially places a heavy burden on execution time for large circuits.

And some circuits (even for simple things) can get **really large**. So, at the very least, it’s gonna be really important to keep this in mind.

---

## Summary

Slowly but surely, we’re making some progress.

Today’s advancements might not seem like much. After all, the problem we looked at feels yet again rather constrained in its applicability.

At the very least, #SAT has guided us through some techniques to represent general computations, ultimately getting us to the super important concept of **arithmetic circuits**.

As we already mentioned, circuits can represent a lot of things. However, by expanding them to allow for more than just boolean operations, we have gained a lot in terms of expressivity, because now these circuits can represent just about **any arbitrary computation using integers**, rather than just $0$s and $1$s.

Ideally though, what we’d like to do is take some circuit, and instead of worrying about circuit-satisfying inputs, we’d want to simply evaluate it on some given inputs, and be able to show that the circuit has been **correctly evaluated**, efficiently.

> This is very different from #SAT, but not that different from the CSAT problem we also looked at today!

If we manage to do that, then we would have found our first **truly general** framework for proving statements.

But to get there, my friends, we’ll first need to learn about a **new tool**. That will be our next destination!
