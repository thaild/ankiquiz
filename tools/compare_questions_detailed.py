#!/usr/bin/env python3
import json
import re
import os

def clean_html_text(text):
    """Remove HTML tags and clean the text using regex"""
    if not text:
        return ""
    
    # Remove HTML tags using regex
    clean_text = re.sub(r'<[^>]+>', '', text)
    
    # Decode HTML entities
    html_entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&apos;': "'",
        '&nbsp;': ' ',
        '&#39;': "'",
        '&rsquo;': "'",
        '&lsquo;': "'",
        '&rdquo;': '"',
        '&ldquo;': '"',
        '&hellip;': '...',
        '&mdash;': '—',
        '&ndash;': '–'
    }
    
    for entity, replacement in html_entities.items():
        clean_text = clean_text.replace(entity, replacement)
    
    # Remove special characters and normalize whitespace
    # Remove tabs, newlines, and multiple spaces
    clean_text = re.sub(r'\t+', ' ', clean_text)  # Replace tabs with space
    clean_text = re.sub(r'\n+', ' ', clean_text)  # Replace newlines with space
    clean_text = re.sub(r'\r+', ' ', clean_text)  # Replace carriage returns with space
    clean_text = re.sub(r'\s+', ' ', clean_text)  # Replace multiple spaces with single space
    clean_text = clean_text.strip()
    
    return clean_text

def extract_question_texts_from_js_files():
    """Extract question texts from all part JS files"""
    existing_texts = {}
    
    # Process all part files
    for i in range(1, 9):
        filename = f"public/data/examtopics/PMI-PMP/pmi_pmp_part{i}.js"
        if os.path.exists(filename):
            print(f"Processing {filename}...")
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extract question_text values using regex
            pattern = r'"question_text":\s*"([^"]+)"'
            matches = re.findall(pattern, content)
            
            for match in matches:
                # Clean HTML tags from the question text
                clean_text = clean_html_text(match)
                if clean_text:
                    existing_texts[clean_text] = {
                        'original': match,
                        'file': filename
                    }
                
            print(f"Found {len(matches)} questions in {filename}")
    
    return existing_texts

def extract_question_texts_from_pmp_json():
    """Extract question texts from pmp.json file"""
    new_texts = {}
    
    print("Processing pmp.json...")
    with open("public/data/pmp.json", 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    questions = data.get('questions', [])
    for question in questions:
        question_text = question.get('question_text', '')
        if question_text:
            # Clean HTML tags from the question text
            clean_text = clean_html_text(question_text)
            if clean_text:
                new_texts[clean_text] = {
                    'id': question.get('id'),
                    'original': question_text,
                    'question': question
                }
    
    print(f"Found {len(new_texts)} unique question texts in pmp.json")
    return new_texts

def find_overlapping_questions():
    """Find questions that exist in both old and new files"""
    existing_texts = extract_question_texts_from_js_files()
    new_texts = extract_question_texts_from_pmp_json()
    
    # Find overlapping questions
    overlapping = set(existing_texts.keys()) & set(new_texts.keys())
    
    print(f"\n=== DETAILED COMPARISON ===")
    print(f"Total existing question texts: {len(existing_texts)}")
    print(f"Total unique question texts in pmp.json: {len(new_texts)}")
    print(f"Overlapping questions found: {len(overlapping)}")
    
    if overlapping:
        print(f"\nOverlapping questions (first 5 examples):")
        count = 0
        for text in sorted(overlapping):
            if count < 5:
                print(f"  {text[:100]}...")
                print(f"    From old file: {existing_texts[text]['file']}")
                print(f"    From new file: {new_texts[text]['id']}")
                count += 1
            else:
                break
    
    # Find truly new questions
    new_only = set(new_texts.keys()) - set(existing_texts.keys())
    print(f"\nTruly new questions: {len(new_only)}")
    
    return new_only, new_texts

def extract_new_questions_data(new_only, new_texts):
    """Extract full data for new questions"""
    print(f"\nExtracting data for {len(new_only)} new questions...")
    
    new_questions_data = []
    for clean_text in new_only:
        new_questions_data.append(new_texts[clean_text]['question'])
    
    # Save new questions to a file
    output_data = {
        "generatedExam": {
            "uid": "new_pmp_questions",
            "name": "PMP New Questions",
            "provider": "Pmi",
            "examId": 131,
            "displayAnswer": True,
            "displayDiscussion": True
        },
        "questions": new_questions_data
    }
    
    with open("public/data/new_pmp_questions_final.json", 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"New questions data saved to public/data/new_pmp_questions_final.json")
    return new_questions_data

if __name__ == "__main__":
    new_only, new_texts = find_overlapping_questions()
    if new_only:
        extract_new_questions_data(new_only, new_texts)
    else:
        print("No new questions found!") 