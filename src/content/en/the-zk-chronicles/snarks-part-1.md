---
title: "The ZK Chronicles: SNARKs (Part 1)"
author: frank-mangone
date: '2026-07-10'
readingTime: 14 min
thumbnail: /images/the-zk-chronicles/snarks-part-1/barrels.jpg
tags:
  - zeroKnowledgeProofs
  - snark
  - groth16
  - pairings
  - trustedSetup
description: All the pieces are finally in place. Time to build our first real zk-SNARK.
---

Looking back at our journey so far, we've slowly assembled a pretty respectable toolkit over the past many articles: [arithmetic circuits](/en/blog/the-zk-chronicles/circuits-part-1) to represent computations, a way to [convert those circuits into polynomial language](/en/blog/the-zk-chronicles/arithmetization), [commitment schemes](/en/blog/the-zk-chronicles/commitment-schemes-part-1) to bind provers to values (and [polynomials](/en/blog/the-zk-chronicles/commitment-schemes-part-2)) without revealing them, a formal definition of what [zero knowledge](/en/blog/the-zk-chronicles/zero-knowledge) actually means, and the [random oracle model](/en/blog/the-zk-chronicles/the-random-oracle-model) to safely flip interactive arguments into non-interactive ones.

It was a lot of effort, but we've earned every step along the way.

> So if you've made it this far, congratulations! It must not have been an easy ride.

To celebrate this, we'll do something that has been a long time coming: for the very first time, we plug all of these things together into a single, fully-formed proof system. The result belongs to a family cryptographers call **SNARKs**.

It's definitely a moment worth savoring, so I recommend taking it slow, and really appreciate every step of the process.

Exciting stuff ahead. Let's dive in!

---

## SNARKs in a Nutshell

It's worth unpacking what this SNARK thing means right from the get-go. It's an acronym, which stands for **S**uccinct **N**on-interactive **AR**guments of **K**nowledge, and every single one of those words carries a lot of weight:

- **Succinct** means the proof we'll be constructing is **tiny**. Not just small, but **genuinely tiny**, as in a small (constant) number of group elements, no matter how large the circuit size. That's pretty much the **holy grail** of verifiable computing: a verifier who does **far less work** than re-running the computation from scratch.
- **Non-interactive** is just what you would expect: no interaction between parties. The prover computes a proof, sends it once, and the verifier checks it independently. And we know how to make this happen: it's exactly what the [Fiat-Shamir Transform](/en/blog/the-zk-chronicles/the-random-oracle-model) is designed for. Although today, we'll be doing things slightly differently.
- Finally, an **Argument of Knowledge** is the claim that a prover can convince a verifier not just about the fact that some statement is true, but that they actually **know a witness** that makes the statement true. That is, we require [knowledge soundness](/en/blog/the-zk-chronicles/zero-knowledge/#knowledge-soundness) to hold, which is a very strong guarantee.

Those are essentially our goals for today.

> A subtlety here: the difference between an **argument** and a **proof** has to do with whether the system satisfies either **computational soundness** or **statistical soundness** respectively. And even though we haven't really covered those, it's a small enough difference for our current intents and purposes that we can safely ignore it!

To build such a thing, we'll be studying a specific SNARK construction today, due to [Jens Groth](https://www.linkedin.com/in/jens-groth-a95672/), published in 2016, and has been known ever since simply as **Groth16**. And it is, without exaggeration, one of the most elegant pieces we'll encounter in this entire series.

---

## Quick Recap

Our story today begins right where we left things off in our [previous stop](/en/blog/the-zk-chronicles/arithmetization). We saw how we could transform a circuit into an **intermediate representation** in the form of R1CS, and then further recast it into a **polynomial divisibility** condition in the form of a QAP, which looked like this:

$$
A(X) \cdot B(X) - C(X) = V(X) \cdot Q(X)
$$

Which, when unraveled, shows us what's happening a little more clearly:

$$
\left(\sum_j w_j \cdot A_j(X)\right) \cdot \left(\sum_j w_j \cdot B_j(X)\right) - \sum_j w_j \cdot C_j(X) = V(X) \cdot Q(X)
$$

Recall that these polynomials were obtained by processing **three selector matrices**, and bundling them together with the witness vector $\textbf{w}$, which holds the set of wire values that are claimed to be the result of a circuit evaluation. The catch is that, in order for an assignment to be valid, the above polynomial relation had to be satisfied, for some polynomial $Q(X)$.

In other words, a valid witness produces a left-hand side that is **perfectly divisible** by $V(X)$, a **vanishing polynomial**. Any cheating prover trying to fake a satisfied circuit will almost inevitably leave a messy remainder, which is easy to catch after a few evaluations, thanks to the [Schwartz-Zippel lemma](/en/blog/the-zk-chronicles/multilinear-extensions/#the-schwartz-zippel-lemma).

> Think of $V(X)$ as a mathematical **constraint enforcer**. Its roots are exactly the evaluation points that correspond to circuit constraints. A valid witness clears all of them; an invalid one doesn't.

This is the relation we want to prove in zero knowledge. The prover knows the witness $\textbf{w}$ and the corresponding $Q(X)$, and must convince the verifier that this relation holds, all without disclosing the private wire values.

<figure>
	<img
		src="/images/the-zk-chronicles/snarks-part-1/patrick.jpg"
		alt="Patrick with a Huh face"
	/>
</figure>

If it sounds challenging, it's because **it is**. I mean, how the hell are we even supposed to tackle this? It's gonna have to do with polynomials for sure, so maybe throw a PCS in there? Still, the way forward is not super clear...

And here, my friends, is where Groth16 comes in to save the day.

---

## A More Elaborate Setup

Okay so, as I mentioned before, since we're dealing with polynomials, we'll almost surely need to provide the verifier with **oracle access** using some polynomial commitment scheme.

> Or at least something similar in nature!

We've seen a couple so far, of which perhaps the most prominent one is the [KZG](/en/blog/the-zk-chronicles/commitment-schemes-part-2/#kzg) scheme from a few articles ago. As a swift refresher, this mechanism relied on the selection of a secret value $\tau$, which we then used to derive powers of a generator. And crucially, the value $\tau$ had to be discarded, treated like toxic waste because of how easily it could break the entire construction.

<figure>
	<img
	src="/images/the-zk-chronicles/snarks-part-1/barrels.jpg"
	alt="Toxic waste barrels"
	/>
</figure>

Groth16 does not rely on KZG, but has a similar preprocessing step. In comparison though, it's a considerably more involved setup than KZG's.

There's good reason for that, though. We'll not only be committing to polynomials, but we'll be **simultaneously** encoding the circuit structure itself, enforcing the divisibility relation, and separating public inputs from private ones - all in one fell swoop, and with just a few group elements.

> That's part of the reason I said this was such an elegant solution: it does not compose elements together, but rather solves everything in a single pass.

And to do this, there are **two gadgets** we're gonna need to build during the setup.

### The Proving Key

This time, we're gonna need not one, but **five** secret values:

$$
\tau, \ \alpha, \ \beta, \ \gamma, \ \delta \in \mathbb{F}_p^*
$$

Yup. Five pieces of **toxic waste**.

Of course, these need the same careful treatment we'd give any such secret. You either guard them very carefully, or mindfully get rid of them. Or if you want to be super safe, run a multi-party ceremony that ensures no single participant ever sees the fully assembled secrets.

> This is very much standard practice, actually.

These values will be our starting point. With them, the first thing we'll is to create what's called a **proving key**.

It essentially works like the prover's toolbox. It's a **structured reference string** (like the one we used in [KZG](/en/blog/the-zk-chronicles/commitment-schemes-part-2/#a-trusted-setup)). If you recall, an SRS is just a structured collection of elements, derived once, published, and used by anyone trying to generate proofs.

In this case however, the process of creating a proving key is not **universal**, like KZG's SRS. Groth16 produces a **circuit-specific SRS**, which can be used to prove statements around a **single circuit**.

That's right: every single circuit will require its own setup. That implies that changing the circuit will require a fresh proving key to be produced - and as you may imagine, this is actually one of Groth16's most significant practical drawbacks, and definitely something worth keeping tabs on.

> Nevertheless, the setup for a circuit can be **reused** multiple times to prove statements about **different evaluations** of the same circuit, so at least we have that! As long as the toxic waste is appropriately discarded, we're good.

Alright then, let's see how we build that proving key. We'll first need the usual powers of $\tau$, needed to evaluate polynomials at a hidden point:

$$
g^{\tau^0}, \ g^{\tau^1}, \ \ldots, \ g^{\tau^n}
$$

In addition (and this is the new part), we'll also need a set of **cross-terms** involving $\alpha$ and $\beta$. Specifically, for each wire $j$, the setup encodes the combined expression:

$$
\beta \cdot A_j(\tau) + \alpha \cdot B_j(\tau) + V_j(\tau)
$$

as a group element. For **private** wires, this expression is further divided by $\delta$; for **public** wires, by $\gamma$.

This is the point where we normally go **what the actual fudge**. There are of course two ways to go about this: we could go for the actual derivation, or I can give you the elements in advance, and we can see how everything fits together nicely in a big reveal moment. As per usual, I'll pick the latter approach, not because I'm a suspense junky, but because I think the "ohhh so that's why" moment helps the concepts stick. So I'll just ask you to bear with me for now, as all this will make more sense in just a moment.

> I'll say this already though: the $\gamma$ and $\delta$ in the denominators ensure that private and public wire contributions are **strictly separated**: a malicious prover can't "re-label" private values as public ones to cheat the check. It's a subtle point, but a most relevant one nonetheless!

### The Verification Key

The second part of the setup is actually not for the prover, but for the **verifier**. If the proving key was the prover's toolbox, the verification key is essentially the **verifier's toolbox**.

> And crucially, we want this key to **stay small**. This asymmetry is deliberate, as we want the prover to do most of the heavy lifting, while the verifier gets to check everything cheaply, regardless of how large the circuit was.

So, what does it look like? Well, using two generators $g_1 \in \mathbb{G}_1$ and $g_2 \in \mathbb{G}_2$, we just calculate:

$$
g_1^{\alpha}​, \ g_1^{\beta}​, \ g_2^{\beta}​, \ g_2^{\gamma}​, \ g_2^{\delta}​
$$

Plus, for each **public** wire $j$, we also throw their corresponding input contribution in there:

$$
g_1^{\frac{1}{\gamma}(\beta \cdot A_j​(\tau) + \alpha \cdot B_j​(\tau)+ C_j​(\tau))}​​
$$

That's it! Just a handful of group elements, encoding the secrets and public inputs.

We can already observe a few things about this setup, namely:

- First, notice that all the toxic waste values are buried behind a [discrete logarithm problem](/en/blog/the-zk-chronicles/groups/#the-discrete-logarithm-problem), which makes it safe to pass the verification key around.
- Secondly, the verification key is much smaller than the proving key, because it does not contain all the encoded powers of $\tau$.
- And lastly, the fact that we have two groups should already give you a hint of where this is headed: [pairings](/en/blog/the-zk-chronicles/commitment-schemes-part-2/#pairings)!

On this account, it's a good moment to introduce some useful notation to keep the equations more manageable. We'll write the encoding of some finite field element using a generator for group $i$ as:

$$
[v]_i = {g_i}^v
$$

This notation is a bit more compact, at the cost of making the particular group generator implicit. A small price to pay for much cleaner equations ahead, so we'll roll with this!

> Plus, it's always good to exercise our minds a little!

---

## Crafting the Proof

Time for the main act then.

As we discussed earlier, the prover will hold a valid witness $\textbf{w}$ (which you may also see denoted as the shorthand set notation $\{w_j\}$), and the quotient polynomial $Q(X)$ satisfying the QAP relation we saw earlier:

$$
\left(\sum_j w_j \cdot A_j(X)\right) \cdot \left(\sum_j w_j \cdot B_j(X)\right) - \sum_j w_j \cdot C_j(X) = V(X) \cdot Q(X)
$$

Using the proving key, the prover will build a proof that consists of exactly **three group elements**:

$$
\pi = (a, \ b, \ c)
$$

The first two, as you would expect, encode the $A_j(X)$ and $B_j(X)$ polynomials respectively. To ensure zero knowledge, the encoding uses two random **blinding factors** $r$ and $s$, and in sum, the values are calculated as:

$$
a = [\alpha \, + \, \sum_j w_j A_j(\tau) \, + \, r \cdot \delta]_1
$$

$$
b = [\beta \, + \, \sum_j w_j B_j(\tau) \, + \, s \cdot \delta]_2
$$

> Note that $a$ and $b$ are group elements in $\mathbb{G}_1$ and $\mathbb{G}_2$ respectively.

Nothing out of the ordinary so far. The secret sauce of this mechanism has to do with how that last element $c$ is calculated:

$$
 c = \left [ s \cdot a \; + \; r \cdot b \; - \; r \cdot s \cdot \delta + \frac{1}{\delta} \left ( \sum_{j \in \textrm{priv}} w_j(\beta \cdot A_j(\tau) + \alpha \cdot B_j(\tau) + C_j(\tau)) +  V(\tau) \cdot Q(\tau) \right ) \right]_1
$$

I know. Take a breath.

> Also, I reckon notation may not help much here, but once again, keep in mind $a$ and $b$ are group elements, while $s$ and $r$ are field elements.

At first glance, it seems like a lot to unpack. But in reality, we can boil this expression down to just three things: we're encoding the private inputs, the product $V(\tau) \cdot Q(\tau)$, and then we have some cross-terms in there, whose only purpose is to elegantly cancel some stuff out during verification.

More importantly, even though that formula for $c$ looks quite gnarly, notice that it results in a **single group element**. It's worth repeating this so that it sticks:

::: big-quote
The full proof is just three group elements
:::

So with that, all that remains is to **validate the proof**.

---

## The Check

Upon receiving the proof $\pi = (a, b, c)$ and the public inputs $\{w_j\}_{j \in \text{pub}}$, the verifier just has to run a **single check** to accept and reject the proof:

$$
e(a, \, b) \overset{?}{=} e([\alpha]_1, [\beta]_2) \cdot e\!\left( \left [ \sum_{j \in \text{pub}} w_j \cdot \frac{\beta \cdot A_j(\tau) + \alpha \cdot B_j(\tau) + C_j(\tau)}{\gamma} \right ]_1, [\gamma]_2 \right) \cdot e(c, \, [\delta]_2)
$$

First, we can see that the verifier has everything they need thanks to the verification key: all the encodings of the originally sampled secrets, and all the public input contributions:

$$
[\alpha]_1, [\beta]_1, [\beta]_2, [\gamma]_2, [\delta]_2, \textrm{and} \ \left \{ \left [ \frac{1}{\gamma}(\beta \cdot A_j​(\tau) + \alpha \cdot B_j​(\tau)+ C_j​(\tau) \right ]_1 \right \}_{j \ \in \ \text{pub}}
$$

What they **don't have** are the private inputs, which are baked into $c$.

However, in similar fashion to [KZG](/en/blog/the-zk-chronicles/commitment-schemes-part-2/#kzg), the verification is again based on a **pairing identity**, which allows us to leverage bilinearity to move things around, and check a relation that would otherwise require knowing $\tau$.

Showing that this works (that is, that the protocol satisfies correctness) takes some careful work. You can safely skip this part, but I think it's a good exercise to go through the process of checking for completeness to fully cement what's happening here.

> I promise that once the dust settles, we'll be left with something quite familiar!

Let's first expand the left-hand side of that expression. This results in:

$$
e(a, b) = e\left( \left [ \alpha \, + \, \sum_j w_j \cdot A_j(\tau) \, + \, r \cdot \delta \right ]_1, \left [ \beta \, + \, \sum_j w_j \cdot B_j(\tau) \, + \, s  \cdot \delta \right ]_2 \right)
$$

Using [bilinearity](/en/blog/the-zk-chronicles/commitment-schemes-part-2/#definition-and-properties), we can move those bracketed expressions to the exponent of the pairing evaluation itself, so we get to work with this massive product:

$$
\left [ \alpha \, + \, \sum_j w_j \cdot A_j(\tau) \, + \, r \cdot \delta \right ] \cdot \left [ \beta \, + \, \sum_j w_j \cdot B_j(\tau) \, + \, s \cdot \delta \right ]
$$

And naturally, this will result in a whole bunch of cross-terms. If we patiently untangle them though, we get:

$$
\alpha \cdot \beta + \alpha \cdot s \cdot \delta + \beta \cdot r \cdot \delta + r \cdot s \cdot \delta^2 + (\beta + s \cdot \delta)\sum_j w_j \cdot A_j(\tau) + (\alpha + r \cdot \delta)\sum_j w_j \cdot B_j(\tau) + \left ( \sum_j w_j \cdot A_j(\tau) \right ) \left ( \sum_j w_j \cdot B_j(\tau) \right )
$$

Next, we do the same with the right-hand side of the check:

$$
e([\alpha]_1, [\beta]_2) \cdot e\!\left( \left [ \sum_{j \in \text{pub}} w_j \cdot \frac{\beta \cdot A_j(\tau) + \alpha \cdot B_j(\tau) + C_j(\tau)}{\gamma} \right ]_1, [\gamma]_2 \right) \cdot e(c, \, [\delta]_2)
$$

Once again, we can use bilinearity to move everything to the exponents, which results in this long expression:

$$
\alpha\beta + \sum_{j \in \text{pub}} w_j (\beta \cdot A_j(\tau) + \alpha \cdot B_j(\tau) + C_j(\tau)) + \delta \left ( s \cdot \alpha  + s \sum_j w_j \cdot A_j(\tau) + r \cdot \beta + r \sum_j w_j \cdot B_j(\tau) + s \cdot r \cdot \delta +\frac{1}{\delta} \sum_{j \in \textrm{priv}} w_j(\beta \cdot A_j(\tau) + \alpha \cdot B_j(\tau) + C_j(\tau)) + V(\tau) \cdot Q(\tau) \right)
$$

Even though that looks like a big mess at first glance, we can already start seeing some similarities between the expanded expressions. For example, the constants $\alpha \cdot  \beta$, $\alpha \cdot s \cdot \delta$, $\beta \cdot s \cdot \delta$, and $s \cdot r \cdot \delta^2$ appear on both expressions, so we could **cancel** those out. Another couple expressions that are repeated are the sums over $w_j \cdot A_j(\tau)$ and $w_j \cdot B_j(\tau)$, multiplied by $s \cdot \delta$ and $r \cdot \delta$ respectively. We can also cancel those out.

And lastly, we can group the private and public contributions of the wires on the left-hand side to produce a single sum for all wires:

$$
\sum_j w_j (\beta \cdot A_j(\tau) + \alpha \cdot B_j(\tau) + C_j(\tau))
$$

After those simplifications, we're left with this exponent equality:

$$
\beta \sum_j w_j \cdot A_j(\tau) + \alpha \sum_j w_j \cdot B_j(\tau) + \left ( \sum_j w_j \cdot A_j(\tau) \right ) \left ( \sum_j w_j \cdot B_j(\tau) \right ) = \sum_j w_j (\beta \cdot A_j(\tau) + \alpha \cdot B_j(\tau) + C_j(\tau)) + V(\tau) \cdot Q(\tau)
$$

And the final nail in the coffin is to split the first sum on the right-hand side, and we'll see we get the exact same two terms from the left! So if we cancel those out as well:

$$
\left ( \sum_j w_j \cdot A_j(\tau) \right ) \left ( \sum_j w_j \cdot B_j(\tau) \right ) = \sum_j w_j \cdot C_j(\tau) + V(\tau) \cdot Q(\tau)
$$

Would you look at that! As if led by some invisible mathematical helping hand, we've arrived at our original QAP relation!

<figure>
	<img
	src="/images/the-zk-chronicles/snarks-part-1/kakashi.jpg"
	alt="Kakashi giving the thumbs up"
	 title="Kakashi approves"
	/>
</figure>

> And if you've been paying close attention, you may have noticed that the verifier never had to send any challenges to the prover. The entire protocol is **truly non-interactive** from its very conception: there's no back-and-forth, and we don't need to Fiat-Shamir at all.
>
> This is different from protocols like [Schnorr's protocol](/en/blog/the-zk-chronicles/zero-knowledge/#the-schnorr-protocol), where we needed the [Fiat-Shamir transform](/en/blog/the-zk-chronicles/enter-hashing/#the-fiat-shamir-transform) to remove interaction. Here, the interaction is **baked into the setup itself**. The verifier's randomness is sort of "pre-committed" in the SRS (it's those toxic waste thingies), and the prover responds to it implicitly when they build the proof.

It's not magic, of course. Everything was finely-tuned for all those cancellations to happen. That's exactly the reason the proving key and verification key included those cross-terms in the first place, all leading up to this moment!

So, when we look at the bigger picture, all of the trouble we went through to define the proving key, verification key, and what originally looked like a mysterious checking step was ultimately in order to **evaluate the QAP relation**, in such a way that the private inputs are kept private!

Finally, notice that we're also checking correctness via a **single pairing equation**. No matter how complex the circuit, the verifier evaluates **one equation** and decides whether to accept or not.

> This "one-shot verification" property has deep roots, as it's the spiritual descendant of a long theoretical tradition rooted in **Probabilistically Checkable Proofs** (PCPs). The original path to SNARKs went through the [PCP theorem](https://en.wikipedia.org/wiki/PCP_theorem): the insight that any proof can be encoded so that a verifier only needs to query a few positions to catch cheating. Groth16 doesn't use a PCP explicitly, but the pairing check has very much that same spirit: one compact query that catches any invalid witness with overwhelming probability.
>
> On the practical side, Groth16 is itself the polished descendant of [Pinocchio](https://eprint.iacr.org/2013/279) (2013), the first practical QAP-based SNARK. Pinocchio proved the idea could run, and then Groth16 came in and compressed it down to only **three group elements**.

How cool is that?

### The Result

I know the math is very contrived, and that can make it a little confusing.

> Sorry for that, but it's just how it is!

Despite that, and if I've (hopefully) done enough to convince you that the math does work indeed, what we can do is be a little more concrete about what Groth16 has achieved for us. There are three things we can say at this point:

- **Proof size**: just three group elements. On the [BN254 pairing-friendly curve](/en/blog/elliptic-curves-in-depth/part-10/#pairing-friendly-curves) - the most popular choice for Groth16 in practice -, a proof is roughly **192 bytes**. For **any** circuit. That's pretty small!
- **Verification time**: a fixed number of pairings (essentially four) need to be calculated, plus one multi-scalar multiplication over the public inputs. The pairing count is constant, and while the public input work scales linearly, the public inputs tend to be small. Thus, verification is fast.
- **Proving time**: This is where things get a little costly. Computing $a$, $b$, and $c$ requires large multi-scalar multiplications over vectors of size proportional to the circuit. In practice, this means that proving time will scale **linearly** with circuit time. But in part, this is the real beauty of the SNARK paradigm: offloading complexity from the many verifiers to the few provers.

Overall, Groth16 manages to check a lot of the boxes we had defined at the start of the article.

---

## Is This Zero Knowledge?

So! We've confirmed the mechanism is **correct** (an honest prover always passes the check), and though we haven't really said much about soundness yet, I'd like us to skip directly to another pressing question: **is this zero knowledge**?

From our previous exposition on the topic, we know that there are actually **two things** that we need to analyze to answer this: one is a question about not revealing information ([zero knowledge](/en/blog/the-zk-chronicles/zero-knowledge)) and the other is about the prover actually knowing the secret ([knowledge soundness](/en/blog/the-zk-chronicles/zero-knowledge/#knowledge-soundness)).

> And of course, covering knowledge soundness also means we cover a flavor of soundness!

Let's take a quick look at both. And to work through this precisely, I'd like for us to go back to a framing we've already explored, but with a little change in notation and perspective.

SNARKs, as the proving systems that they are, are built around an NP relation $\mathcal{R}$: a set of pairs $(x, w)$ where $x$ is the public statement, $w$ is the private witness, and $(x, w) \in \mathcal{R}$ means that $w$ is valid proof to certify the validity of $x$.

This is nothing more than the [witness framing](/en/blog/the-zk-chronicles/computation-models/#witnesses) from all those articles ago in disguise. All we're really doing is actually putting a label on the NP relation. And as you can imagine, the whole point is that finding such pairs that belong to the relation is incredibly hard without knowledge of the secret.

Why am I saying this only now? Because zero knowledge and knowledge soundness are both **statements about this relation**.

<figure>
	<img
	src="/images/the-zk-chronicles/snarks-part-1/pooh.jpg"
	alt="Winnie the Pooh squinting at a piece of paper"
	 title="Huh?"
	/>
</figure>
> It's not that bad, I promise!

Zero knowledge is actually the easier property to check here. Recall that the question boils down to whether a [simulator](/en/blog/the-zk-chronicles/zero-knowledge/#simulators) could produce valid-looking proofs that are indistinguishable from real ones, all the while without knowing the secret witness. In our new language of relations, this means the simulator must be able to do this for **any valid pair** $(x, w) \in \mathcal{R}$, which means producing a fake proof for $x$ without ever seeing $w$.

This already looks like trouble, because the element $c$ explicitly encodes **private** wire values. So how could any simulator fake that?

The answer lies in a somewhat unexpected place: the blinding factors $r$ and $s$. Because they're sampled uniformly at random, both $a$ and $b$ are uniformly distributed group elements, completely independent of the witness. So a simulator can simply pick $a$ and $b$ at random (just as a real prover would, because of the blinding factors), and then work backwards from the verification equation to solve for a value of $c$ that makes the check pass.

> The only caveat is that knowledge of the toxic waste values is needed for that backwards computation to be possible possible, but this is something we can admit in this simulator argument.

With that, the resulting triple $(a, b, c)$ is **perfectly indistinguishable** from a real proof: $a$ and $b$ look identical either way, and $c$ was crafted to pass the check. Zero knowledge holds!

> By the way, if you strip out $r$ and $s$, then $a$ **immediately starts leaking information** about the witness through the $\sum_j w_j \cdot A_j(\tau)$ term. So the blinding factors aren't cosmetic: they're what makes the entire ZK argument go through.

---

Knowledge soundness is a bit more complicated. The claim is that any prover who convinces the verifier on input $x$ must know a $w$ such that $(x, w) \in \mathcal{R}$. Or what's equivalent, they need to hold the **actual values of the private wires**.

> In other words, there must exist an extractor that, given oracle access to such a prover, could in principle recover $w$.

So I'll just give you the intuition here. If you check the equation for $c$, you'll see it encodes those private contributions behind a $1 / \delta$ factor in the exponent. That means constructing a valid $c$ without knowing the $w_j$ values would require computing a **discrete logarithm**, which we assume is hard.

> Making this precise requires working in something called the **algebraic group model**, where adversaries can only produce group elements by taking linear combinations of ones they already know. Under that assumption, knowledge soundness follows neatly.
>
> But that might be a story for another day!

That's it! Two strong guarantees, baked into one hell of a compact construction.

---

## Summary

And boom! Just like that, we've seen our first zkSNARK!

Building on [QAP arithmetization](/en/blog/the-zk-chronicles/arithmetization), [pairing machinery](/en/blog/the-zk-chronicles/commitment-schemes-part-2), and the [formal definitions of zero knowledge](/en/blog/the-zk-chronicles/zero-knowledge), Groth16 delivers something remarkable: a proof of circuit satisfiability that fits in a **couple hundred bytes** and verifies in **milliseconds**, regardless of circuit complexity.

Is it perfect? Of course not. But is it good enough? Depending on the application, it just might be.

> In fact, this technique has seen widespread application: Groth16 saw its first major real-world application in [Zcash](https://z.cash/), and has since become a staple of the ZK ecosystem. A typical flow is to use a domain-specific language like [Circom](https://docs.circom.io/) or [Noir](https://noir-lang.org/) to specify circuits, which then compile down to R1CS and QAP, which in turn are fed directly into Groth16. It also remains the proving system of choice for many [layer 2 blockchains](/en/blog/blockchain-101/rollups) and cross-chain bridges, where constant proof size and fast verification make the system very attractive.

The elephant in the room is of course the per-circuit trusted setup we mentioned earlier. It's a a practical constraint that we must take into consideration, and it begs the question: **can we do any better**? Can we get rid of the per-circuit setup?

Of course, the answer is yes. As long as we can work with a more flexible **universal setup**.

> Which should [ring a bell](/en/blog/the-zk-chronicles/commitment-schemes-part-2/#kzg)!

We'll start pulling on that thread in the [next-installment](/en/blog/the-zk-chronicles/snarks-part-2). See you there!
