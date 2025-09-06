import re
import json

def parse_questions(text):
    # Tách từng khối câu hỏi
    question_blocks = re.split(r"(?=Question\s+#:?\s*\d+\s+[A-Z]+)", text.strip())
    all_questions = []

    for block in question_blocks:
        header = re.match(r"Question\s+#:?\s*(\d+)\s+([A-Z]+)", block)
        if not header:
            continue

        qid = header.group(1)
        correct_letters = set(header.group(2))

        # Trích nội dung câu hỏi
        question_text_match = re.search(r"\s+[A-Z]+\s+(.*?)(?=\nA\.)", block, re.DOTALL)
        question_text = question_text_match.group(1).strip() if question_text_match else ""

        # Trích xuất các lựa chọn (A-H), giữ lại chữ cái đầu
        choices = re.findall(r"([A-H])\. (.*?)(?=(?:\n[A-H]\. |\Z))", block, re.DOTALL)
        formatted_choices = []

        for letter, choice_text in choices:
            full_text = f"{letter}. {choice_text.strip()}"
            formatted_choices.append({
                "choice": f"<p>{full_text}</p>",
                "correct": letter in correct_letters,
                "feedback": ""
            })

        question_data = {
            "question_id": f"#{qid}",
            "topic_id": 1,
            "course_id": 1,
            "case_study_id": "null",
            "lab_id": 0,
            "question_text": f"<p>{question_text}</p>",
            "mark": 1,
            "is_partially_correct": False,
            "question_type": "1",
            "difficulty_level": "0",
            "general_feedback": [
                f"<p>Correct Answer: {','.join(sorted(correct_letters))}</p>"
            ],
            "is_active": True,
            "answer_list": [
                {
                    "question_answer_id": "",
                    "question_id": f"#{qid}",
                    "answers": formatted_choices
                }
            ],
            "topic_name": "Topic #1"
        }

        all_questions.append(question_data)

    return all_questions


# Example usage
if __name__ == "__main__":
    with open("questions_input.txt", "r", encoding="utf-8") as f:
        input_text = f.read()

    parsed = parse_questions(input_text)

    with open("parsed_questions.json", "w", encoding="utf-8") as out_file:
        json.dump(parsed, out_file, ensure_ascii=False, indent=2)

    print("✅ Done! File 'parsed_questions.json' is created.")
