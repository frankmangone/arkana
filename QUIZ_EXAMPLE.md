---
title: "Blockchain Fundamentals Quiz Test"
date: "2025-11-18"
author: frank-mangone
thumbnail: /images/blockchain-101/a-primer-on-consensus/smaug.webp
tags:
  - blockchain
  - quiz
  - educational
description: "Test article to demonstrate the quiz component embedded in markdown content."
readingTime: 5 min
visible: true
---

# Blockchain Fundamentals Quiz

This is a test article that demonstrates the new quiz component functionality! You can now embed interactive quizzes directly into your markdown articles.

## How to Use Quizzes

Quizzes are embedded using the following syntax:

```
<quiz src="blockchain-basics.json" lang="en" />
```

Where:

- `src` is the filename of your JSON quiz file (stored in `/public/quizzes/`)
- `lang` (optional) is the language code, defaults to "en"

Each JSON file contains a **single question**, making it easy to reference specific questions throughout your content.

## Test Your Knowledge

Let's test what you know about blockchain fundamentals with these three questions:

### Question 1: Core Purpose

<quiz src="blockchain-basics.json" lang="en" />

### Question 2: Key Characteristics

<quiz src="blockchain-characteristics.json" lang="en" />

### Question 3: Block Contents

<quiz src="blockchain-block-contents.json" lang="en" />

## Quiz Features

The quiz component supports:

- **Single-choice questions** - Radio button style, select only one correct answer
- **Multiple-choice questions** - Checkbox style, select all correct answers
- **Instant feedback** - Get feedback immediately after submission
- **Visual indicators** - Correct and incorrect answers are highlighted
- **Client-side only** - Responses are not stored on the server

## Benefits of This Approach

1. **One Question Per File** - Each JSON file contains a single question for simplicity
2. **Granular Control** - Reference specific questions exactly where they're needed
3. **Reusability** - The same question file can be used in multiple articles
4. **Easy Maintenance** - Update questions without touching the markdown
5. **Clean Markdown** - Your article content stays focused and readable
6. **Flexible Placement** - Embed questions inline with relevant content

## Creating Your Own Questions

To create a question, add a JSON file to `/public/quizzes/` with the following structure:

```json
{
  "id": "q1",
  "type": "single",
  "en": {
    "question": "Your question here?",
    "options": [
      {
        "id": "opt1",
        "text": "Correct answer",
        "isCorrect": true
      },
      {
        "id": "opt2",
        "text": "Wrong answer",
        "isCorrect": false
      }
    ],
    "feedback": "Explanation for why this is correct/incorrect"
  }
}
```

### Key Properties

- **id** - Unique identifier for the question
- **type** - Either `"single"` (radio buttons) or `"multiple"` (checkboxes)
- **[lang]** - Language key (e.g., `"en"`, `"es"`, `"pt"`) containing:
  - **question** - The question text
  - **options** - Array of answer options with `id`, `text`, and `isCorrect` flag
  - **feedback** - Explanation shown after submission

### Multi-Language Support

You can add multiple language versions to a single question file:

```json
{
  "id": "q1",
  "type": "single",
  "en": {
    "question": "Your question in English?",
    "options": [...],
    "feedback": "English feedback"
  },
  "es": {
    "question": "Tu pregunta en español?",
    "options": [...],
    "feedback": "Retroalimentación en español"
  }
}
```

For `type: "multiple"`, you can mark multiple options as correct, and the user must select all correct options to get full marks.

Enjoy learning! 🎓
