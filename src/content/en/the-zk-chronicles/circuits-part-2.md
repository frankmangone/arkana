---
title: 'The ZK Chronicles: Circuits (Part 2)'
author: frank-mangone
date: '2026-01-24'
readingTime: 17 min
thumbnail: /images/the-zk-chronicles/circuits-2/legos.webp
tags:
  - zeroKnowledgeProofs
  - arithmeticCircuits
  - sumCheck
  - gkr
description: >-
  We now move forward to our first truly general computation correctness proving
  mechanism!
mediumUrl: >-
  https://medium.com/@francomangone18/the-zk-chronicles-circuits-part-2-26e7d0ee1e87
contentHash: b6fe8d181e705d47d6387ff3f8c9691609b169b1407fef0cc0258d4ee7b79f5f
supabaseId: null
---

If you recall, a [couple articles back](/en/blog/the-zk-chronicles/circuits-part-1) we introduced the circuit satisfiability problem (both versions, CSAT and #SAT), which led us directly into a powerful extension of traditional circuits in the form of **arithmetic circuits**.

While these problems were interesting in concept, they probably still felt a little awkward. And back then, we claimed that a more intuitive alternative for our purposes was to somehow prove the correctness of a **circuit evaluation** — you know, proving that evaluating a circuit at a particular set of inputs yields a claimed result.

Our goal for today will be to present a mechanism to do just this.

I must warn you: this will be slightly more involved than previous articles. However, it will lead us to what feels like our very first **truly general** proving system.

> The first of many!

Don’t worry too much though! As always, we’ll take it step by step, piecing apart the important bits.

There’s much to cover, so grab your coffee and sit tight — this will be a long one!

---

## Proving Evaluation

Alright then! Given that we’ve already learned of arithmetic circuits, we can jump right into the problem at hand.

Given some arithmetic circuit $\varphi(X)$, our goal is to prove that for some input $x$, the output of the circuit has some value $y$:

$$
\varphi (x) = y
$$

I want us to take a moment to analyze how to approach this.

We don’t have any clear hints yet. With #SAT, the [hypercube sum made the connection to sum-check obvious](/en/blog/the-zk-chronicles/circuits-part-1/#circuit-satisfiability), but we don’t have the same luck here. We’re gonna need another angle of attack.

Maybe we should recollect our knowledge so far, and that will give us a direction to follow. Let’s see: we know arithmetic circuits are comprised of **addition** and **multiplication** gates. And whenever you feed some input to a circuit, it flows forward through the wires and into gates (remember, it’s a [DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph)), which perform **simple operations**.

Here’s a quick question: what happens if a gate is **miscalculated**?

We’re pretty much assuming the “happy path” so far, but what if that wasn’t the case? Any single incorrect calculation of a gate would cause a **ripple effect** through the circuit, rendering the entire calculation invalid.

Conversely, we can also say that in order for the result of the entire circuit to be correct, **each gate** must have been correctly computed.

> Yes, there’s a tiny chance the result accidentally stays correct due to modulo arithmetic. But with a properly sized field, this probability is **negligible**, so we can safely ignore it!

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/circuit-error.webp"
		alt="A circuit with a miscalculated gate" 
		title="[zoom] The red gate is incorrectly calculated, so gates depending on its result are also wrong"
	/>
</figure>

This gives us an **extremely powerful insight**: we can **decompose** the problem of checking circuit evaluation into checking the correct evaluation of **individual gates**.

And that’s mainly where the power of circuits as a computation model comes from! Gates are sort of the **Lego blocks** of verifiable computing: you can check their correctness, and you can chain them together to form richer structures!

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/legos.webp"
		alt="A bunch of legos" 
		title="Except you can’t step on a circuit"
	/>
</figure>

Good! This seems like a promising starting point. What we need now is a way to use this newfound knowledge.

### Relevant Information

In order to build a proving system, a verifier should be able to **probe** these gates to check if they are correctly calculated. This is usually done through an **encoding** **strategy**: the computation at a gate is somehow expressed in a form the verifier can use on their own.

So how do we do that?

Well, there are at least **three things** a verifier needs to successfully check whether a gate calculation is valid or not:

- The inputs
- The output
- The type of the gate (either addition or multiplication)

If a verifier can get ahold of these things, they can simply **compute the expected output**, and **compare** with the provided result!

That’s the theory, at least — but how would we encode this information?

### Encoding

The answer might be unsurprising at this point: **polynomials**!

> It’s always polynomials!

There’s no single way to do this. Different proving systems use different techniques — and that’s part of where the key differences between modern proving systems come from.

I want us to get our feet wet with an example. Let’s see what we can do with a small circuit:

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/circuit-wires.webp"
		alt="Circuit with its wiring" 
		title="[zoom] A simple circuit for (a + b).c"
	/>
</figure>

Here are a few ideas. First, we’d want to encode the **wire values**. We have a total of $5$ wires, so we could create a polynomial $W(X)$ such that:

$$
\forall i \in \{0,1,2,3,4\} : W(i) = w_i
$$

> Note that those are **evaluations** — we’ll say a bit more about how to get the actual polynomial $W(X)$ further ahead.

Then, we’d need to encode **gate information**. To do this, we can use **indicator polynomials** for each gate: one for addition gates, and one for multiplication gates.

In a similar fashion to [Lagrange bases](/en/blog/the-zk-chronicles/math-foundations/#lagrange-polynomials), we can choose a gate $g$, and craft a polynomial $A^g(X,Y,Z)$ that returns $1$ only when:

- The values of $X$, $Y$, and $Z$ correspond to the **correct wires** for the gate, with $X$ being the left input, and $Y$ being the right input, and $Z$ being the output.
- Gate $g$ is an **addition gate**.

> The same can be done with multiplication gates, and a polynomial $M^g(X,Y,Z)$.

With this, we can represent the statement “gate $g$ is correctly evaluated” with this expression here:

$$
W(k) = A^g(i, j, k)[W(i) + W(j)] + M^g(i, j, k)W(i)W(j)
$$

> The role of $A^g$ and $M^g$ is to sort of deactivate the checks if they do not correspond to the correct gate! Of course, we should ensure that $A^g$ and $M^g$ are not equal to $1$ at the same time!

Ok, pause. That was probably a lot of information!

Take a moment to let all this sink in. These kind of encoding strategies will be very important as we move further into the series, so it’s a good idea to get acquainted with them now!

> Seriously, take your time. If you skip ahead, I’ll know.

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/suspicious-chihuahua.webp"
		alt="A chihuahua with a suspicious look" 
		title="I’m watching you"
		width="500"
	/>
</figure>

Good? Okay, let’s move along!

---

Gate encoding, check.

Unfortunately... There’s a **very blatant problem** with this: in order to check the correctness of a circuit evaluation, a verifier would need to check **every single gate**. For large circuits (where the size $S$ is large), this would mean $O(S)$ verification time.

And this is pretty bad, because it’s **no better than simply running the circuit** — and the whole gist of verifiable computing is to allow verifiers to run faster than that!

We’ve stumbled upon a big hurdle on our plans... Can we do any better?

---

### Structured Circuits

Sometimes we can!

The secret lies in realizing that **not all circuits are made equal**. Indeed, all circuits have a different **overarching structure**. And in some cases, we can exploit it to achieve a better performance.

In particular, we’re interested in circuits where we can identify clear **layers**: groups of gates that are not directly connected to each other (they are **independent**), and instead depend only on a **previous layer**.

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/circuit-layers.webp"
		alt="A representation of circuit layers"
		title="[zoom]" 
	/>
</figure>

> We call the number of layers the **depth** ($d$) of the circuit, and the number of wires in each layer represent the layer’s **width** ($w$). For circuits with relatively uniform width, the total size of the circuit is roughly $S \approx d \cdot w$.

Now... What would happen if we could show that an **entire layer** is correctly calculated in a single go?

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/mathing.webp"
		alt="The classic meme of the lady seeing equations in the air" 
	/>
</figure>

If we can achieve this, we may be in for sizable time savings — especially for **shallow circuits**, whose depth is much smaller than their width.

Some protocols indeed take advantage of this structure. Such is the case of our next subject: the **GKR protocol**.

---

## The GKR Protocol

> GKR stands for the initials of the creators of the technique: Goldwasser, Kalai, and Rothblum. Several techniques in cryptography have adopted this way of naming.

Now, this will combine pretty much everything we’ve learned so far: structured circuits, polynomial encoding, multilinear extensions, and sum checks.

From personal experience, my suggestion is **not to rush this**. Circle back to the previous concepts if needed. This article is going nowhere — that much I can assure you!

### Circuit Layout

The GKR protocol assumes a very specific structure for the circuit. Not only is it layered, but every layer has a **predetermined number of gates**.

Let’s label each layer with an index $i$. Starting from the output layer with an index of $0$, and counting **backwards** towards the inputs, each layer will have a total of $S_i = 2^{k_i}$ gates.

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/circuit-layout.webp"
		alt="A layout of a layered circuit" 
		title="[zoom]"
	/>
</figure>

> Note that $k_i$ is a value associated with each layer!

Nothing is unintentional about this choice. But why exactly would we force layers to have such an oddly-specific number of gates?

The reason is one we have already exploited in the past: **indexing**!

Essentially, we can label each gate (or equivalently, each wire) of any given layer $i$ using our trusty boolean hypercube! We encode the **values** for each gate as **evaluations** of some function $W_i(X)$:

$$
W_i: \{0,1\}^{k_i} \rightarrow \mathbb{F}
$$

> Where $W_i(b)$ returns the value on wire $b$ in layer $i$ ($b$ is a $k_i$**-bit binary string** indexing the wire).

And you know what a boolean hypercube means: a **sum check** is coming!

### Connecting the Layers

Of course, the part we’re still missing is that **gate operation** encoding we talked about before. And to obtain this, we’ll need to do one more thing: specify **how gate are connected**.

This is referred to as the **wiring predicate**. It’s the only missing piece in today’s puzzle, and once we have this, we’ll finally be able to connect everything.

> Quite literally!

For this, let’s define the polynomials $A_i$ and $M_i$, which describe this wiring predicate:

$$
A_i: \{0,1\}^{k_i + 2k_{i+1}} \rightarrow \{0,1\}
$$

$$
M_i: \{0,1\}^{k_i + 2k_{i+1}} \rightarrow \{0,1\}
$$

These, as previously stated, will take three gate labels $a$, $b$, and $z$ — the first two from the input layer, and the last one from the output layer — , and return $1$ only when:

- The gates in the combination are truly **connected** in the circuit, meaning that gate $z$ has inputs $a$ and $b$.
- The **rightmost gate** ($z$) is of the correct type (addition or multiplication).

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/single-gate.webp"
		alt="A single gate with its inputs"
		title="[zoom]" 
	/>
</figure>

> Similarly, $M_i(a,b,z) = 1$ for multiplication gates.

While $W_i$ encodes the values of wires in layer $i$, $A_i$, $M_i$ describe which gates connect to which, and their types. Together, they constitute a **complete description** of the circuit, or a **full encoding**!

All that remains, as hinted earlier, is to somehow transform this into a sum check.

### Building the Sum Check

If you recall, the sum-check protocol had a very nice **recursive structure**: the original problem was **reduced** into a **smaller version** of the same problem, ultimately having something that’s almost trivial to check.

So, how about we try something along those lines?

The idea is simple: start at the output layer, with some **claimed output values**. There, we’ll try to transform the claim about the outputs, into a claim about the values of the **second-to-last layer**. Rinse and repeat, and after $d$ steps, we get to a claim about the **inputs**, which should be known by the verifier!

Simple, right?

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/dead-bart.webp"
		alt="An image of Bart Simpson with his spirit out of his body" 
		title="Hope you’re doing better than Bart!"
	/>
</figure>

> Stay strong folks!

To perform this reduction step, we’ll need to check **something** about each layer. And this is where our **encoding** becomes relevant, all thanks to this little trick here:

$$
W_i(X) = \sum_{a,b \in \{0,1\}^{k_{i+1}}} A_i(a,b,X)[W_{i+1}(a) + W_{i+1}(b)] + M_i(a,b,X)W_{i+1}(a)W_{i+1}(b)
$$

Before your head explodes, let’s just try to explain what the expression is doing:

- We’re summing over all the possible gate indexes at layer $i + 1$, which are the possible **inputs** at layer $i$ (the output layer in this step)
- Then, we’re asking: is this an addition gate or a multiplication gate? Remember, $A_i$ and $M_i$ return either $0$ or $1$, and they will only **activate** when a gate with inputs $a$ and $b$, and output $X$ exists on the layer, **and **when the gate is of the specified type.
- Lastly, $A_i$ and $M_i$ are multiplied by the desired operations.

The key point here is that despite summing over a boolean hypercube, **only one** of the possible combinations will activate $A_i$ or $M_i$ — so the entire sum reduces to only **one term**.

For example: if wire $5$ at layer $i$ gets inputs from wires $2$ and $3$ at layer $i + 1$ via an addition gate, then we have that:

- $A_i(2,3,5) = 1$
- $_i(anything else, 5) = 0$
- The entire sum reduces to just $W_{i+1}(2) + W_{i+1}(3)$!

Now, the similarities with the sum check are much more evident!

That crazy polynomial inside the sum? Let’s just call it $g_i(X,Y,Z)$:

$$
g_i(X,Y,Z) = A_i(X,Y,Z)[W_{i+1}(X) + W_{i+1}(Y)] + M_i(X,Y,Z)W_{i+1}(X)W_{i+1}(Y)
$$

And with it, we could fix $z$ to a particular value, and apply the sum-check to verify:

$$
W_i(z) = \sum_{a \in \{0,1\}^{k_{i+1}{}}, \ b \in \{0,1\}^{k_{i+1}}} g_i(a,b,z)
$$

> Note that we’re fixing $z$ so that the wiring predicate makes sense!

As you can see, at each layer, we need values from the **next layer** to build this polynomial we’re using. Unless the verifier is looking at the input layer, they would **not know these values**! Instead, the prover will provide them — so this sum check reduces the problem to a claim about the **next layer**!

Thus, we only need to apply this $d$ times (the depth of the circuit), and we’d be pretty much done.

---

## The Remaining Challenges

Okay, great! This is shaping up quite nicely. But to move forward, we’ll need to address two remaining problems, that become clear once we take a closer look at the sum-check we need to perform in any single layer.

So, let’s briefly recap how the sum-check protocol proceeds.

1. First, the prover sends a **claimed result** $C_1$ and a **univariate polynomial** $P_1(X_1)$ to the verifier, crafted from the original $g(X)$.
2. The verifier performs a simple check, and then selects a **random challenge** $r_1$ at which they evaluate $P_1(r_1)$. They also send this value to the prover.
3. The prover then proceeds to prove that $C_2 = P_1(r_1)$ is the new claimed result — and they do so by circling back to **(1.)**!

The process is repeated until all variables of the original $g(X)$ are used up, and the verifier closes the process by performing a single **oracle query**. Of course, in our case, $g(X)$ is the $g_i(X,Y)$ for each layer.

> For the full explanation, you can go back to [this article](/en/blog/the-zk-chronicles/sum-check)!

Now, this mechanism has **two problems**:

- We need to be able to evaluate $g_i(X,Y)$ in a point randomly selected from a large finite field... But by definition, this polynomial is defined over a **boolean hypercube**!
- The final oracle query can actually be computed by the verifier, so long as they know two special values: the evaluation of $W$ in the **previous layer** at the randomly selected points. But these values are not known by the verifier!

If we manage to solve these problems, then we’d have a fully functional proving system. Let’s tackle them one at a time.

### Going Multilinear

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/hyperspace.webp"
		alt="Han Solo and Chewbacca entering hyperspace"
		title="Here we go!"
	/>
</figure>

So, we need to apply the sum-check protocol on that long expression encoding the wiring predicate:

$$
g_i(X,Y) = A_i(X,Y,z)[W_{i+1}(X) + W_{i+1}(Y)] + M_i(X,Y,z)W_{i+1}(X)W_{i+1}(Y)
$$

During the sum-check, we need to be able to select **random values** selected from a **finite field** $\mathbb{F}$ for each component of the inputs. That means we’ll need to **extend** the domain of those polynomials!

While there are multiple ways to do this, there’s an elegantly simple and performant way to do it: [multilinear extensions](/en/blog/the-zk-chronicles/multilinear-extensions) (**MLEs**). If we take MLEs of every involved polynomial, we get an expression that’s suitable for our needs:

$$
\tilde{W}_i(z) = \sum_{a,b \in \{0,1\}^{k_{i+1}}} \tilde{A}_i(a,b,z)[\tilde{W}_{i+1}(a) + \tilde{W}_{i+1}(b)] + \tilde{M}_i(a,b,z)\tilde{W}_{i+1}(a)\tilde{W}_{i+1}(b)
$$

> Oh, by the way, we denote multilinear extension with the tilde ($\sim$) symbol, so $\tilde{W}$ is the multilinear extension of W (defined over a more constrained domain, like a boolean hypercube).
>
> Regarding the above equality, feel free to check if it holds if you’d like!

And with this, we’re able to perform a sum-check on each layer!

### Reducing Evaluations

Lastly, remember that the oracle query at the very end of each sum-check (for each layer) requires **two evaluations** of the previous layer, on some randomly-selected input:

$$
z_1 = \tilde{W}_{i+1}(a^*), z_2 = \tilde{W}_{i+1}(b^*)
$$

Now, if we had to perform two checks every time, the number of times we’d need to run the full sum-check would grow **exponentially**, making our strategy unusable. Therefore, the final touch in our mechanism is to try and **combine** those two checks into a single one!

> This will be a useful tool in other contexts, so I’ll link back to this section in the future. Don’t worry!

We can use a very clever trick for this. Define:

$$
\ell: \mathbb{F} \rightarrow \mathbb{F}^{k_{i+1}}
$$

This is simply a **line**. And we [already know](/en/blog/the-zk-chronicles/math-foundations/#interpolation) a line is defined by two **points**. We can set those to be $\ell(0) = a^*$, and $\ell(1) = b^*$.

Now this line **encodes both values**.

With this, we’ll define a little **subprotocol**. Here’s how it goes:

- The prover sends a univariate polynomial of degree at most $k_{i+1}$, claimed to equal:

$$
q(X) = \tilde{W}_{i+1} \circ \ell(X) = \tilde{W}_{i+1}(\ell(X))
$$

- The verifier then checks that $z_1 = q(0)$, and $z_2 = q(1)$. This validates that at the very least, this claimed polynomial $q(X)$ encodes the required values.
- Finally, the verifier chooses some random point $r^*$, and with this they calculate:

$$
q(r^*) = \tilde{W}_{i+1}(\ell (r^*))
$$

So, what’s happening here? The prover is essentially providing a way for the verifier to “safely” evaluate $W_{i+1}$ for the next layer’s sum-check:

$$
\tilde{W}_{i+1}(\ell(r^*)) = \sum_{a,b \in \{0,1\}^{k_{i+2}}} g_{i+1}(a,b,\ell(r^*))
$$

> Note that this check **does not** correspond to **selecting a random layer on the next layer**. Instead, we use some random value $\ell(r^*)$ which most probably won’t lie at a valid gate index, but rather on some other point!

The key idea is that the prover **does not know** $r^*$ **in advance**. Because of this, if $q(X)$ is actually **incorrect** (let’s call it $q’$), we know thanks to the [Schwartz-Zippel lemma](/en/blog/the-zk-chronicles/multilinear-extensions/#the-schwartz-zippel-lemma) that it’s very likely that:

$$
q’(r^*) \neq \tilde{W}_{i+1}(\ell (r^*))
$$

This will make life very hard for the prover, who has to continue with the next round of sum-check with a **wrong claimed sum**, for which they could not use the actual wire polynomials.

With these two considerations in mind, the protocol is completely defined!

The flow goes:

- The prover encodes circuit layers as polynomials, and calculates their multilinear extensions.
- Starting on the last layer, prover and verifier engage in a round of sum-check, using the output value as the initial claim.
- The prover reduces the two required $W$ evaluations to a single one via $q(X)$, which they send to the verifier. The verifier then calculates the claim for the next round of sum-check.
- Rinse and repeat until the input layer is reached, at which point the verifier can close the verifications on their own (no oracle access is needed!).

---

## Analysis

As always though, we need to assess a few key aspects about the protocol to determine whether it makes sense or not: namely **completeness**, **soundness**, and **cost analysis**.

> I know you guys might be tired at this point. This is already a knowledge bomb as it stands.
>
> **tl;dr**: GKR is sound with negligible error, verifier runs in roughly $O(d \cdot log S)$, but prover is expensive at $O(S^3)$. If you want the details, read on. Otherwise, skip to the summary!

### Soundness

Completeness does not need much explanation: as long as the prover is honest, all the expressions we presented should work. Soundness however does take some more work to show.

> Pretty much as always!

At each layer $i$, the prover could lie about:

- The polynomials sent during the sum-check. We know these to have degree $1$, so using the Schwartz-Zippel lemma, there’s a $1 / \left | \mathbb{F} \right |$ that the prover gets lucky over the random choice of the verifier — essentially the same logic we used [here](/en/blog/the-zk-chronicles/sum-check/#completeness-and-soundness).
- The line reduction $q(X)$. Because $q(X)$ is at most a $k_{i+1}$-degree polynomial, we can once again use the Schwartz-Zippel lemma, and calculate the probability of a random coincidence over the choice of $r^*$ to be at most $k_{i+1} / \left | \mathbb{F} \right |$.

Once caught in a lie on a given layer, the prover must continue to the next layer with an **incorrect claim**. They’d need to get lucky at **every subsequent layer** to avoid detection. Which means that for the full circuit, the total soundness error is the **sum** of the errors at each layer.

This results in $(d + log_2(S)) / \left | \mathbb{F} \right |$. What can we make out of this value? Essentially, that we can make this error **arbitrarily small** with an adequate selection of $\mathbb{F}$! In other words, the bigger the size of $\mathbb{F}$, the smaller the soundness error will be.

So the GKR protocol is sound!

### Costs

The other important aspect to discuss are the **computational costs** for the full protocol. This will determine if the protocol has any chance of being useful at all.

To explain the costs however, we’d need a couple lemmas and ideas we haven’t yet presented. I don’t think it wise to keep packing content onto this single article, and we might get a chance to talk about this in the future. So instead, again, I’ll summarize the costs for you guys:

- The prover runs in $O(S^3)$ time.
- The verifier, simplifying a bit, runs in $O(n + d.log_2(S))$, where $n$ is the cost to evaluate the input layer’s MLE.
- Total communication costs are $O(d.log_2(S))$ field elements.

> Of course, it’s important to understand where these numbers come from — but I promise we’ll continue improving our estimation logic as we go further into the series!

What’s most important now is to assess the verification time gains when applying the GKR protocol. Note that the prover is **really slow**: cubic time means that their runtime will grow quite large even for not-so-large circuits.

The verifier, however, benefits dramatically when the circuits are **shallow**, meaning their depth $d$ is small.

> Just to throw some numbers in: for a circuit of size $2^20$ (about 1 million gates) and depth $d = 20$, the prover will run in roughly $10^{18}$ operations (which is extremely expensive), but the verifier runtime will only be roughly $10^{6}$, which is much smaller!
>
> And the number of field elements that are communicated is even smaller: just $400$!

While this sounds good in principle, truth is that the GKR’s prover cost are still **prohibitively high** for large circuits. This becomes a bottleneck for its applicability, especially due to its interactive nature.

For this reason, practical implementations focus on certain optimizations, or preprocessing steps that bring down prover costs to a more manageable level — but that, my friends, will be a story for another time.

---

## Summary

Oh my God. That was a long one.

> But we did it!

<figure>
	<img
		src="/images/the-zk-chronicles/circuits-2/dora.webp"
		alt="Dora the Explorer" 
		title="No Dora. This wasn’t fun."
	/>
</figure>

We’ve just seen our first **truly general** circuit verification protocol. And despite its runtime limitations, GKR reveals something super important: that **fast verification** of **arbitrary computations** is possible.

> This is a crucial stepping stone in our journey towards more practical protocols. Our goal moving forward will be to find better ways to encode and verify computations, but at least we now know it **can be done**.

> I think this is a powerful moment in our journey. I invite you to take a moment to appreciate how much we’ve done with just a couple tools. Just imagine what crazy things we’ll get into later!

Speaking of which, we have solely focused on circuits as our general computation models for now. I don’t know about you, but for me, writing a circuit does not feel like the most natural thing to do when writing a program. We normally think of computation in other terms.

So, does that mean that our efforts are fundamentally flawed? This is a question that we’ll try to answer in our next encounter!

See you soon!
