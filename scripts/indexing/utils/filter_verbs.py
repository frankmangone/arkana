#!/usr/bin/env python3
import sys
import json
import spacy

def filter_verbs(text, language):
    """
    Filter out verbs from text, keeping only nouns, adjectives, and proper nouns.
    
    Args:
        text (str): The text to process
        language (str): Language code ('en', 'es', 'pt')
    
    Returns:
        list: Filtered words without verbs
    """
    try:
        # Map language codes to spacy models
        models = {
            'en': 'en_core_web_sm',
            'es': 'es_core_news_sm', 
            'pt': 'pt_core_news_sm'
        }
        
        # Default to English if language not supported
        model_name = models.get(language, 'en_core_web_sm')
        
        # Load the appropriate model
        nlp = spacy.load(model_name)
        
        # Process the text
        doc = nlp(text)
        
        # Keep only nouns, adjectives, and proper nouns
        filtered_words = []
        for token in doc:
            if token.pos_ in ["NOUN", "PROPN", "ADJ"]:
                # Convert to lowercase and add to list
                filtered_words.append(token.text.lower())
        
        return filtered_words
        
    except Exception as e:
        # If spacy fails, return original words as fallback
        print(f"Error processing with spacy: {e}", file=sys.stderr)
        # Simple fallback: split text into words
        words = text.lower().split()
        return [word for word in words if len(word) > 2]

def main():
    if len(sys.argv) != 3:
        print("Usage: python filter_verbs.py <text> <language>", file=sys.stderr)
        sys.exit(1)
    
    text = sys.argv[1]
    language = sys.argv[2]
    
    try:
        filtered_words = filter_verbs(text, language)
        # Output as JSON for easy parsing in Node.js
        print(json.dumps(filtered_words))
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 