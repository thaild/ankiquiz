import json

input_file = 'mock/mock_17.json'

# Đọc dữ liệu từ file JSON
with open(input_file, 'r') as infile:
    input_data = json.load(infile)

# Mảng để chứa các câu hỏi đã chuyển đổi
output_data_list = []

# Duyệt qua danh sách câu hỏi trong 'data'
for question_data in input_data:
    # Kiểm tra nếu có hình ảnh trong dữ liệu
    image_html = ""
    if question_data.get("image"):
        image_html = f'<img src="{question_data["image"]}" alt="Image for the question" />'
    
    # Xử lý cho câu hỏi Multiple Choice (MCQ), Multiple Response (MRQ) hoặc Fill in the Blank
    is_mcq = question_data['type'] == "mcq"
    is_mrq = question_data['type'] == "mrq"
    
    # Xử lý answer cho từng loại câu hỏi
    if is_mcq:
        # MCQ: answer là một string (ví dụ: "B")
        answer_index = ord(question_data['data']['answer'].upper()) - ord('A')
    elif is_mrq:
        # MRQ: answer là một array (ví dụ: ["B", "D"])
        answer_indices = [ord(ans.upper()) - ord('A') for ans in question_data['data']['answer']]
    else:
        # Fill in the Blank: answer là string để so sánh trực tiếp
        answer_index = None
        answer_indices = None

    # Tạo dữ liệu cho từng câu hỏi
    output_data = {
        "question_id": f"#{question_data['id']}",
        "topic_id": 1,
        "course_id": 1,
        "case_study_id": "null",
        "lab_id": 0,
        "question_text": question_data["data"]["question"] + image_html,  # Chèn hình ảnh vào question_text nếu có
        "mark": 1,
        "is_partially_correct": True if is_mrq else False,
        "question_type": question_data['type'],
        "difficulty_level": "0",
        "general_feedback": [
            f"<p>Correct Answer: {question_data['data']['answer']}</p>"
        ],
        "is_active": True,
        "answer_list": [
            {
                "question_answer_id": "",
                "question_id": f"#{question_data['id']}",
                "answers": [
                    {
                        "choice": choice,
                        "correct": (
                            index == answer_index if is_mcq 
                            else index in answer_indices if is_mrq 
                            else choice == question_data['data']['answer']
                        )
                    }
                    for index, choice in enumerate(question_data["data"]["options"]) if choice
                ]
            }
        ],
        "topic_name": question_data["name"]
    }

    # Thêm câu hỏi đã chuyển đổi vào danh sách
    output_data_list.append(output_data)

# Ghi dữ liệu vào file JSON mới
# with open('output_data.json', 'w') as outfile:
#     json.dump(output_data_list, outfile, indent=4)

# print("Output has been written to 'output_data.json'")

# Chia danh sách thành 3 phần, mỗi phần chứa 60 câu hỏi
chunk_size = 60
chunks = [output_data_list[i:i + chunk_size] for i in range(0, len(output_data_list), chunk_size)]

# Ghi từng phần vào một file JSON riêng biệt
for i, chunk in enumerate(chunks, start=1):
    filename = f'output_{i}.json'
    with open(filename, 'w') as outfile:
        json.dump(chunk, outfile, indent=4)
    print(f"Output part {i} has been written to '{filename}'")