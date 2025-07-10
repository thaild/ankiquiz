// Script loaded
const SPLIT_CARD = "#####";
const SPLIT_QUESTION = "\n\n\n";
$("#split_card").text(SPLIT_CARD);
$("#split_question").html("\\n\\n\\n");

class Question {
    constructor(questionNumber, questionBody, questionChoices, correctAnswer, votedAnswer, comments = [], topicName = "") {
        this.questionNumber = questionNumber;
        this.questionBody = questionBody;
        this.questionChoices = questionChoices;
        this.correctAnswer = correctAnswer;
        this.votedAnswer = votedAnswer;
        this.comments = comments;
        this.topicName = topicName;
    }

    getCorrectAnswer() {
        if(this.votedAnswer == "") {
            return this.correctAnswer;
        } else {
            return this.votedAnswer.replace(/[\s]*\([0-9]*\%\)/gm,"");
        }
    }

    exportCSV() {
        var csvTemplate = `${this.questionNumber}\n${this.questionBody}${this.questionChoices.join("\n")} ${SPLIT_CARD} ${this.getCorrectAnswer()}`
        return csvTemplate;
    }

    exportJson() {
        let answerText = [];
        let correctAnswer = this.getCorrectAnswer();
        let SYMBOL_ANSWER = ["A", "B", "C", "D", "E", "F", "G", "H"];
        this.questionChoices.forEach(function(choice, index) {
            let item = `
            {
                "choice": "<p>${choice}</p>",
                "correct": ${correctAnswer.indexOf(SYMBOL_ANSWER[index]) > -1 ? "true" : "false"},
                "feedback": ""
            }`;

            answerText = [...answerText, item];
        });

        answerText = `[
            ${answerText.join(",")}
        ]`
        var csvTemplate = `
        {
            "question_id": "${this.questionNumber}",
            "topic_id": 1,
            "course_id": 1,
            "case_study_id": null,
            "lab_id": 0,
            "question_text": "<p>${this.questionBody}</p>",
            "mark": 1,
            "is_partially_correct": ${correctAnswer.length >= 2 ? "true" : "false"},
            "question_type": "1",
            "difficulty_level": "0",
            "general_feedback": "<p>Correct Answer: ${correctAnswer}</p>",
            "is_active": true,
            "answer_list": [
              {
                "question_answer_id": 1,
                "question_id": "${this.questionNumber}",
                "answers": ${answerText}
              }
            ],
            "topic_name": "${this.topicName}",
            "discusstion": ${JSON.stringify(this.comments)}
        }
        `
        return csvTemplate;
    }
}

function commonReplace(text) {
    text = text.replaceAll('"', '\\"');
    text = text.replaceAll("’", "'");
    text = text.replaceAll('	', ' ');
    text = text.replaceAll('  ', '');
    text = text.replaceAll('\n\n\n', '');
    text = text.replaceAll('\n\n \n', '');
    text = text.replaceAll('\n \n', '');
    text = text.replaceAll('\n', '<br>');
    text = text.replaceAll('src="assets/media', 'src="https://examtopics.com/assets/media');
    text = text.replaceAll('<br>Most Voted<br>', '');

    text = text.replaceAll('A.', 'A. ');
    text = text.replaceAll('B.', 'B. ');
    text = text.replaceAll('C.', 'C. ');
    text = text.replaceAll('D.', 'D. ');
    text = text.replaceAll('E.', 'E. ');
    text = text.replaceAll('F.', 'F. ');

    text = text.replaceAll('<br>A.', 'A.');
    text = text.replaceAll('<br>B.', 'B.');
    text = text.replaceAll('<br>C.', 'C.');
    text = text.replaceAll('<br>D.', 'D.');
    text = text.replaceAll('<br>E.', 'E.');
    text = text.replaceAll('<br>F.', 'F.');

    return text;
}

var questionBlock;
var listQuestion = [];
var question;
function convert(html) {
    questionBlock = $(html);
    $("#tempHtml").html(questionBlock);

    $("#tempHtml .question-title-topic").remove();
    //Fix bug with dissucustion type
    $("#tempHtml .question-discussion-header div").addClass("card-header");

    var questionNumber = $("#tempHtml .card-header").text();
    questionNumber = questionNumber.replaceAll("#: ", "#");
    questionNumber = questionNumber.match(/#([0-9]{1,4})/g)[0];

    // TopicName
    $("#tempHtml .question-body i").remove();
    var topicName = $("#tempHtml .discussion-list-header > h1").text();
    
    // Question
    var questionBody = $("#tempHtml .question-body > p.card-text:first-child").html();
    questionBody = commonReplace(questionBody);

    // Answers
    var questionChoicesHtml = $("#tempHtml .question-body .question-choices-container ul li");
    var questionChoices = [];
    questionChoicesHtml.each((key, questionChoice) => {
        questionChoiceText = questionChoice.innerText;
        questionChoiceText = commonReplace(questionChoiceText);
        questionChoices.push(questionChoiceText);
    });
    
    // Correct Answer
    var correctAnswer = $("#tempHtml .correct-answer").text();
    var votedAnswer = $("#tempHtml .vote-distribution-bar .vote-bar.bg-primary").text();

    // Discustion
    var comments = [];
    var discussionsHtml = $("#tempHtml .discussion-container .media.comment-container");
    if (discussionsHtml != "") {
        discussionsHtml.each((key, commentHtml) => {
            $("#tempHtmlComment").html(commentHtml);
    
            let id = $("#tempHtmlComment .media.comment-container").data("comment-id");
            let date = $("#tempHtmlComment .comment-date").attr("title");
            let username = $("#tempHtmlComment .comment-username").first().text();
            let upvote_count = $("#tempHtmlComment .upvote-count").first().text();
            let selected_answers = $("#tempHtmlComment .comment-selected-answers").text();
            let content = $("#tempHtmlComment .comment-content").first().text();
            let sub_commnent = ""
            $("#tempHtmlComment .comment-content").each((key, item) => {
                if(key > 0) {
                    sub_commnent += `<li>${item.innerHTML.toString()}</li>`;
                }
            });
            if(sub_commnent != "") {
                content += `\n <div>\tReplies:</div> <ul style='list-style-type: disclosure-closed;'>${sub_commnent}</ul>`
            }
            username = username.replaceAll('  ', '').replaceAll('\n', '');
            content = commonReplace(content);
            
            let comment = {
                "id": id,
                "date": date,
                "username": username,
                "content": content,
                "upvote_count": upvote_count,
                "selected_answers": selected_answers
            };
    
            comments.push(comment);
        });
    }
    
    question = new Question(questionNumber, questionBody, questionChoices, correctAnswer, votedAnswer, comments, topicName);

    return question;
}

function convertFreeCam(html) {
    questionBlock = $(html);
    $("#tempHtml").html(questionBlock);

    $("#tempHtml .question-title-topic").remove();
    var questionNumber = $("#tempHtml h4 span.text-danger").text();

    var questionBody = $("#tempHtml .qa-question").html();
    questionBody = questionBody.replaceAll('"', '\\"');
    questionBody = questionBody.replaceAll('  ', '');
    questionBody = questionBody.replaceAll('\n\n\n', '');
    questionBody = questionBody.replaceAll('\n', '<br>');
    questionBody = questionBody.replaceAll('assets/media', 'https://examtopics.com/assets/media');

    var questionChoicesHtml = $("#tempHtml .qa-options > p");
    var questionChoices = [];
    questionChoicesHtml.each((key, questionChoice) => {
        questionChoiceText = questionChoice.innerText;
        questionChoiceText = questionChoiceText.replaceAll('  ', '');
        questionChoiceText = questionChoiceText.replaceAll('\n', '');
        questionChoiceText = questionChoiceText.replaceAll('A.', '');
        questionChoiceText = questionChoiceText.replaceAll('B.', '');
        questionChoiceText = questionChoiceText.replaceAll('C.', '');
        questionChoiceText = questionChoiceText.replaceAll('D.', '');
        questionChoiceText = questionChoiceText.replaceAll('E.', '');
        questionChoiceText = questionChoiceText.replaceAll('F.', '');
        questionChoiceText = questionChoiceText.replaceAll('"', '\\"');
        questionChoiceText = questionChoiceText.replaceAll('assets/media', 'https://examtopics.com/assets/media');
        questionChoices.push(questionChoiceText);
    });
    
    var correctAnswer = $("#tempHtml .qa-answerexp span").text();

    var votedAnswer = $("#tempHtml .qa-answerexp span").text()

    question = new Question(questionNumber, questionBody, questionChoices, correctAnswer, votedAnswer)

    return question;
}

function splitQuestionRaw(htmlRaw) {
    $("#tempHtml").html(htmlRaw);

    //Fix to discussion-header-container
    // $("#tempHtml .discussion-header-container").addClass("exam-question-card");
    $("#tempHtml .sec-spacer").addClass("exam-question-card");

    // return $("#tempHtml .discussion-header-container");
    return $("#tempHtml .exam-question-card");
}

function splitQuestionRawFreeCam(htmlRaw) {
    $("#tempHtml").html(htmlRaw);

    return $("#tempHtml .qa");
}

$("#btn-submit-json").on("click", function () {
    $("#csv-result").text("");
    var htmlRaw = $("#html-source").val();
    var listQuestionRawHtml = splitQuestionRaw(htmlRaw);

    var csvText = "";
    listQuestion = [];
    jsonText = [];
    listQuestionRawHtml.each((key, questionRaw) => {
        var question = convert(questionRaw);
        listQuestion.push(question);
        
        //convert jsonText
        jsonText = [...jsonText, question.exportJson()];
    });

    csvText = `
    {
        "msg": "Quiz Questions",
        "data": [${jsonText.join(",")}]
    }
    `;

    $("#csv-result").text(csvText);
});
