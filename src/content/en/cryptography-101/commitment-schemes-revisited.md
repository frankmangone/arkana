---
title: "Cryptography 101: Commitment Schemes Revisited"
date: "2024-06-04"
author: "Frank Mangone"
tags: ["Cryptography", "Polynomial", "Mathematics", "Commitment Scheme"]
description: "An expansion upon the ideas behind simpler commitment schemes, providing important tools for more complex constructions down the road"
readingTime: "10 min"
---

> This is part of a larger series of articles about cryptography. If this is the first article you come across, I strongly recommend starting from the [beginning of the series](/en/blog/cryptography-101/where-to-start).

Alright! By now, we’ve seen [pairings](/en/blog/cryptography-101/pairings) in action, in the context of _identity-based cryptography_. But we’ve also seen that pairings are powerful on their own, enabling [other methods](/en/blog/cryptography-101/pairing-applications-and-more) that don’t rely on identity. In this article, I’d like to expand on that idea.

It’s time to revisit a concept from a few articles back: _commitment schemes_. We [previously defined what they are](/en/blog/cryptography-101/protocols-galore/#commitment-schemes): ways to commit to a value, without revealing it ahead of time.

> Kind of a cryptographic anti-cheating mechanism.

This time, we’ll look at a type of commitment scheme we haven’t mentioned yet: _polynomial commitments_. In particular, the method to be presented is the one described in [this paper](https://cacr.uwaterloo.ca/techreports/2010/cacr2010-10.pdf): the KZG (Kate-Zaverucha-Goldberg) commitment.

### A Short Disclaimer

I believe that, at this point in the series, it would be hard-pressed to label articles as being _101_ — as in, they are no longer _that_ introductory. Regardless, the spirit of these presentations is to make the somewhat cryptic content and notation of papers a little more accessible. In this sense, it’s true that I’ve stripped away some complex elements — and even then, this doesn’t mean these topics get any easier.

Still, if you’ve reached this point in the series, it probably means that you’re heavily invested in understanding complex cryptographic concepts. So congratulations for the effort, thank you for reading along, and I hope you still find the content useful!

---

## Committing to a Polynomial

Our description of commitment schemes so far really only covers the scenario where there’s a _secret value_ which we don’t want to reveal ahead of time. And _opening_ the commitment means _revealing_ the value.

But what if we could have an entire _factory_ of commitments?

That is, what if we could commit to a _function_? Then, what we could do is provide _evaluations_ of the function to a verifier, and they can check its _correct evaluation_ using our commitment.

<figure>
  <img
    src="/images/cryptography-101/commitment-schemes-revisited/what.webp" 
    alt="Confused face"
    title="What?"
  />
</figure>

To be fair, even though this sounds like an interesting idea to pursue, it’s not immediately clear whether if there are any suitable applications.

So to keep you guys motivated, I’ll say this: committing to a function is a key ingredient in some _Zero-Knowledge Proofs_ that we’ll be looking at in articles to come.

<figure>
  <img
    src="/images/cryptography-101/commitment-schemes-revisited/shut-up.webp" 
    alt="Shut up and take my money meme"
  />
</figure>

> Also, recall that when we talked about threshold cryptography, we mentioned that there were situations that require _verifiable secret sharing_. This is, not only the evaluations of a certain polynomial are required, but also a _proof of their correctness_.
>
> Polynomial commitment schemes can help in this regard.

The context is (kinda) set. Maybe a diagram will help clarify what I meant before:

<figure>
  <img
    src="/images/cryptography-101/commitment-schemes-revisited/commitment-diagram.webp" 
    alt="A schematic diagram of how polynomial commitments work"
    title="[zoom] Roughly what we’re planning to do"
    className="bg-white"
  />
</figure>

Notice that in the diagram above, the function $f$ is _secret_, and never really disclosed. And as you may be guessing by now, the _consistency check_ will be done with the aid of a _pairing_.

Having said this, let’s get right to business.

---

## Setting Things Up

Our commitment scheme will consist of at least _three steps_. The paper itself describes about six algorithms, but we can cut a few corners so as to make the explanation more digestible.

To get started, we’re going to require _two_ groups of order $n$: let’s call them $\mathbb{G}_1$ and $\mathbb{G}_3$. We’ll also need a generator for $\mathbb{G}_1$, which we’ll denote by $G$. These groups are generated in such a way that there exists a _symmetric pairing_ (or [self-pairing](/en/blog/cryptography-101/pairings/#elliptic-curves-and-pairings)) of the form:

$$
e: \mathbb{G}_1 \times \mathbb{G}_1 \rightarrow \mathbb{G}_3
$$

And this will be a crucial piece of the puzzle for us.

Also, since we’ll be dealing with _polynomials_, this time we’ll prefer the _multiplicative notation_ to represent the elements of $\mathbb{G}_1$; this is, the group will have the form:

$$
\mathbb{G}_1 = \{G^0, G^1, G^2, G^3, ..., G^{n-1}\}
$$

> An important note: since $G$ will be an input to a polynomial, and we usually present out examples with elliptic curve groups, we have a problem: points on an elliptic curve are multiplied by a scalar (i.e. $[s]G$), and not exponentiated.
>
> To alleviate this issue, we can make use of an isomorphism into a multiplicative group, with similar reasoning as the one [explained here](/en/blog/cryptography-101/homomorphisms-and-isomorphisms/#isomorphisms).

::: big-quote
So really, Gˢ will just mean [s]G.
:::

Cool, cool. With this we can really start setting things up.

## The Setup

Now, this process works with what is known as a _trusted setup_. In order to work, the system has to be _initialized_, in the sense that some _public parameters_ need to be calculated. These parameters will be important during the verification process.

We’re going to make a commitment to a polynomial of degree _at most_ $d$. And for that, this is the setup we need: a _trusted actor_ samples a random integer $\alpha$. They use this to calculate the following set of public parameters:

$$
p = (H_0 = G, H_1 = G^{\alpha}, H_2 = G^{\alpha^2}, ..., H_d = G^{\alpha^d}) \in \mathbb{G}^{d+1}
$$

And after obtaining these values, $\alpha$ _must be discarded_. Knowledge of $\alpha$ allows _false proofs_ to be forged — and this is why we need to _trust_ whoever performs this action. We’ll see how false proof could be produced further ahead.

---

## Committing to the Polynomial

Now that everybody has the public parameters $p$, we can create the actual commitment.

Interestingly, the commitment will be a _single functional value_:

$$
\tilde{f} = G^{f(\alpha)} \in \mathbb{G}
$$

> We’ll use the tilde notation ($~$) to denote commitments to functions. For instance, $\tilde{f}$ represents a commitment to $f$.

Upon closer inspection, we can see that $\alpha$ is required to compute the commitment. But in theory, α has been _discarded_ at this point! So how can we possibly calculate this?

Remember the _public parameters_ calculated during setup? This is where they come in handy. Given that our polynomial has the form:

$$
f(x) = a_0 + a_1x + a_2x^2 + ... + a_dx^d
$$

What we can do is produce the following product, using the public parameters:

$$
S = {H_0}^{a_0}.{H_1}^{a_1}.{H_2}^{a_2}....{H_d}^{a_d} = \prod_{i=0}^d {H_i}^{a_i}
$$

If we work out the expression a bit:

$$
S = G^{a_0}.G^{\alpha.a_1}.G^{\alpha^2.a_2}....G^{\alpha^d.a_d} = G^{a_0 + a_1.\alpha. + a_2\alpha^2 + ... + a_d.\alpha^d} = G^{f(\alpha)}
$$

And there you go! Without knowledge of $\alpha$, we’re still able to calculate our commitment. This value is calculated by the _prover_, and sent to the _verifier_, who will store this value, and later use it when they have to verify that further _evaluations_ of the polynomial are correct.

Let’s see how!

---

## Evaluation

With knowledge of the _commitment_, we can ask for _evaluations_ of the secret polynomial. Referring back to our original sketch of the process, this means that a verifier wants to know the value of the secret polynomial $f(x)$ at some certain integer $b$, so they really ask for the value $f(b)$:

$$
f(b) = a_0 + a_1b + a_2b^2 + ... + a_db^d
$$

The prover can simply calculate this and send it to the verifier, but the verifier needs to make sure that calculation is _correct_ and _consistent_, and that they are not receiving a random, meaningless value.

So, along with the value $f(b)$, the prover will need to produce a _short proof_ that the verifier can check _against the commitment_ they hold.

<figure>
  <img
    src="/images/cryptography-101/commitment-schemes-revisited/validation.webp" 
    alt="Diagram of the validation flow"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Let’s zoom into how the proof is produced.

### The Proof

Quickly reiterating the goal, we want to prove that $f(b)= v$. Rearranging things a bit, it’s also true that:

$$
f(b) - v = 0
$$

And this means that $b$ is a _root_ of this polynomial:

$$
\hat{g}(x) = f(x) - v
$$

With this simple shift of perspective is what will ultimately allow us to produce the required proof.

Thanks to the [factor theorem](https://en.wikipedia.org/wiki/Factor_theorem), we know that $\hat{g}$ can be _perfectly divided_ (with no remainder) by the polynomial $(x - b)$. We can calculate the _quotient polynomial_ $p(x)$, which is the polynomial that suffices:

$$
p(x)(x - b) = \hat{g}(x) = f(x) - v
$$

What happens next is that a _commitment_ to $p(x)$ is calculated; this is done exactly as we did with $f(x)$: by using the public parameters. And this commitment is going to be the _short proof_ that we needed. So our previous diagram can be updated like this:

<figure>
  <img
    src="/images/cryptography-101/commitment-schemes-revisited/validation-2.webp" 
    alt="Updated diagram of the validation flow"
    title="[zoom]"
    className="bg-white"
  />
</figure>

Upon receiving the polynomial evaluation $v$ and the commitment to $p(x)$, the verifier can check that these two values make sense. And this is where things get interesting.

> So far, so good? This took me a couple reads to fully grasp the idea — I recommend taking it slow if needed.
>
> And spoilers: this next part might be a little heavier than usual. Oh boy. Buckle up.

<figure>
  <img
    src="/images/cryptography-101/commitment-schemes-revisited/free-of-this-pain.webp" 
    alt="Kylo Ren stabbing Han Solo scene"
    title="Yeah, I know. Sorry for that. Glad you’re here though!"
  />
</figure>

---

## Verification

Simply put, the verifier will only accept the evaluation if the following validation happens to be true:

$$
\tilde{p}^{\alpha - b} = \tilde{f}.G^{-v}
$$

There’s an obvious problem here: $\alpha$ _was discarded_, so it is unknown. We’ll see how to circumvent this issue in a moment. But first, let’s make sure that this expression makes sense.

Recall what the commitments are: given a polynomial $f$, it’s just the value:

$$
\tilde{f} = G^{f(\alpha)} \in \mathbb{G}
$$

And we already saw how to calculate this using the public parameters. If we input this onto the validation expression, we obtain:

$$
{\left ( G^{p(\alpha)} \right )}^{\alpha - b} = G^{f(\alpha)}.G^{-v}
$$

Checking only the exponents we see that:

$$
p(\alpha)(\alpha - b) = f(\alpha) - v
$$

Of course, if $p(x)$ was correctly calculated and evaluated, we know that the expressions $(\alpha - b).p(\alpha)$ and $(f(\alpha) — v)$ should match. So the verification procedure makes sense!

> It’s here that we can clearly visualize why knowledge of $\alpha$ allows for false proofs to be forged.
>
> You see, I could send you some arbitrary number $A$ instead of $f(\alpha)$ as the initial commitment, and you’d have no way to tell it isn’t legitimate. Then, because I know $\alpha$, I could choose some arbitrary $v$, and convince you that $f(b) = v$ by just directly calculating and sending you the value $P$:

$$
P = \frac{A - v}{\alpha - b}
$$

> And the worst part is, you’d never even have the slightest hint that the proofs are false. So yeah, it’s important that $\alpha$ is discarded!

In conclusion, $\alpha$ _remains unknown_. What can we do about this?

### Pairing Magic

And here, my friends, is where pairings come in. I’ll just present how the process works, and we’ll check that it makes sense. No need to have much further motivation than that!

To introduce some terminology that we’ll be using hereon, let’s call the commitment to $p(x)$ — which is related to the value $b$ — , a _witness_. And let’s denote it by $w(b)$:

$$
w(b) = G^{p(\alpha)} = G^{\frac{f(\alpha) - f(b)}{\alpha - b}}
$$

Now, the idea is that we need to check that this value is consistent with the commitment to $f$. And for this, we’ll need to evaluate our pairing, and check:

$$
e(w(b), G^{\alpha}.G^{-b}).e(G,G)^{f(b)} = e(\tilde{f}, G)
$$

Woah woah woah. Hold it right there, Toretto. _What_?

<figure>
  <img
    src="/images/cryptography-101/commitment-schemes-revisited/toretto.webp" 
    alt="Dominic Toretto from Fast & Furious smiling"
    title="The power of family won’t be of much help here."
  />
</figure>

Okay. Let’s try to make sense out of this.

The gist of the matter is that both evaluations will yield the same result only if $w(b)$ is _correctly calculated_. And it can only be correctly calculated if the prover _really knows_ the secret polynomial.

> Remember that the exponential notation for elements of the group really means elliptic curve point (scalar) multiplication.

Formally, we can see that the equality holds because, using the bilinearity property of a pairing:

$$
e(w(b), G^{\alpha}.G^{-b}).e(G,G)^{f(b)} = e(G^{p(\alpha)}, G^{\alpha - b}).e(G,G)^{f(b)}
$$

$$
e(G,G)^{p(\alpha)(\alpha - b)}.e(G,G)^{f(b)} = e(G,G)^{p(\alpha)(\alpha - b) + f(b)}
$$

$$
e(G,G)^{f(\alpha)} = e(G^{f(\alpha)},G) = e(\tilde{f}, G)
$$

<figure>
  <img
    src="/images/cryptography-101/commitment-schemes-revisited/hell-no.webp" 
    alt="Jackie Chan Hell No meme"
  />
</figure>

> Take a minute. Read it again. Let it sink in.

If you check all the parameters in the above expansion, you’ll see that the elements in the “simpler” explanation that we first saw are blended into the pairing evaluation mix.

Also, notice that we make use of $G$ and $G^{\alpha}$. These values are provided in the _public parameters_, and are in fact the first two values: $H_0$ and $H_1$. So that’s all the public parameters we’re going to need to perform validation!

Fantastic, isn’t it?

---

## Summary

I reckon this article was by no means simple to follow. The estimated 10 minutes of length probably felt like a scam. Sorry for that. I tried my best to keep it simple!

For a different and more interactive view, I suggest checking out [this lecture](https://zkhack.dev/whiteboard/module-two/) by Dan Boneh. It doesn’t cover the pairing verification, but pretty much everything else is included in there.

<video-embed src="https://www.youtube.com/watch?v=J4pVTamUBvU" />

So, as mentioned at the beginning of the article, this construction on its own does not seem to offer interesting applications out of the box. Nevertheless, we’re going to use this as a basis for other constructions — in particular, to build a family of powerful (zero) knowledge proofs: _SNARKs_.

However, that’s _not_ going to be our next stop in the series. Instead, we’ll be talking about a different kind of zero knowledge proofs in the next article: [Bulletproofs](/en/blog/cryptography-101/zero-knowledge-proofs-part-1). This will naturally set us up to later move onto SNARKs. Until [next time](/en/blog/cryptography-101/zero-knowledge-proofs-part-1)!
