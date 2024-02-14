class Question {
  constructor() {
    this.queNo = "";
    this.question_id = "";
    this.question_text = "";
    this.question_type = 1;
    this.general_feedback = "";
    this.answer_list = "";
    this.topic_name = "";
    this.is_partially_correct = false;
    this.options = {
      show_title: true,
    };
    this.discusstion = "";
  }

  loadData(queData, queNo) {
    this.queNo = queNo;
    this.question_id = queData.question_id;
    this.question_text =  queData.question_text;
    this.question_type = queData.question_type;
    this.general_feedback = queData.general_feedback;
    this.answer_list = queData.answer_list[0].answers;
    this.topic_name = queData.topic_name;
    this.is_partially_correct = queData.is_partially_correct;
    this.options = {
      show_title: true,
    };
    this.discusstion = queData.discusstion;
  }

  renderQuestionHtml() {
    let html = "";

    let htmlStarIcon = `
      <div data-queno="${this.queNo}" class="starMarkToReview ${this.options.userMarked ? 'true' : 'false'}">
          <i class="fa-solid fa-star"></i>
      </div>
    `;

    html += `
      <div>Question: ${this.queNo + 1} (${this.question_id})</div>
      <div class="que-text">${this.question_text}</div>
      ${htmlStarIcon}
    `;

    html += `
      ${this.loadQueAnswerHtml(this.options.isShowAnswer, this.options.userChoice)}
    `;

    html = `
      <div class="QuestionBlockItem">
        ${html}
      </div>
    `;

    return html;
    
  }

  renderQuestionHtml_v2(
    options={
      index: -1,
      showAnswer: false,
      showComment: false,
      isStar: false,
      userChoice: "",
      showAnswerBtn: true,
      showCommentBtn: true,
    }
  ) {
    let html = "";
    let answerBtn = `
      <button type="button" class="btnShowAnswerQuestion btn btn-warning btn-sm" data-index=${options.index} data-hideshow=${options.showAnswer ? "Hide" : "Show" }>${options.showAnswer ? "Hide Answer" : "Show Answer" }</button>
    `;
    
    let discusstion_count = this.discusstion ? this.discusstion.length : 0;
    let commentBtn = `
      <button type="button" class="btnShowDisscussionQuestion btn btn-info btn-sm" data-index=${options.index} data-hideshow=${options.showComment ? "Hide" : "Show" }>${options.showComment ? `Hide Disscussion (${discusstion_count})` : `Show Disscussion (${discusstion_count})` }</button>
    `;

    let htmlStarIcon = `
      <div data-queno="${this.queNo}" class="starMarkToReview ${options.isStar ? 'true' : 'false'}">
          <i class="fa-solid fa-star"></i>
      </div>
    `;

    html += `
      <div class="que-title">Question:  ${options.index + 1} (${this.options.show_title ? this.question_id : '#____'})</div>
      <div class="que-text">${this.question_text}</div>
      ${htmlStarIcon}
    `;

    let html_discusstion = "";
    if(options.showComment) {
      let discusstion = this.discusstion;
      if(discusstion) {
        //Sort by voted count
        discusstion.sort((a, b) => b.upvote_count - a.upvote_count);
              
        discusstion.forEach(function (comment, index) {
          let selected_answers = comment.selected_answers;
          let html_selected_answers = "";
          if(selected_answers !== undefined && selected_answers != "") {
            html_selected_answers = `<span class="comment-selected-answers">${comment.selected_answers}</span>`;
          }
          html_discusstion += `
            <li id="comment-${comment.id}" class="comment-container" data-comment-id="${comment.id}">
              <div class="pb-1">
                <span class="fw-bold">#${index + 1}</span> 
                ${html_selected_answers}
                (<span class="comment-voted">${comment.upvote_count}</span> Voted)
              </div>
              <div class="comment-content">${comment.content}</div>
              <div class="pt-1"><span class="comment-username">${comment.username}</span> (<span class="comment-date">${comment.date}</span>)</div>
            </li>
          `;
        });
        html_discusstion = `
          <ul class="comment-list">
            ${html_discusstion}
          </ul>
        `;
      } else {
        html_discusstion = "Have not comments!"
      }
      
    }

    html += `
      ${this.loadQueAnswerHtml(options.showAnswer, options.userChoice)}
      <div class="text-center">
        ${options.showAnswerBtn ? answerBtn : ''}
        ${options.showCommentBtn ? commentBtn : ''}
      </div>
      <div class="discussions-block">
        ${html_discusstion}
      </div>
    `;

    return html;
  }

  getQuestion(choiceAnswer, isMarked = false) {
    // Load Question Data
    // this.loadData(queData, queNo);

    // Show Question Number
    this.showQueNumber(this.queNo);

    // Load Quesion
    this.loadQueTextHtml();
    
    // Load Answer
    $("fieldset.que-list").html(this.loadQueAnswerHtml(false, choiceAnswer));

    //Mark Current Question
    this.markQuestion();

    // Load isMarked
    this.showMarkToReview(isMarked);

    // Clean
    $(".explanation-block").html("");
    $(".comment-block").html("");
    $(".btn-showAnswer").removeClass("show");
    $(".btn-showAnswer").text("Show Answer");
    $(".btn-showDiscussion").removeClass("show");
    $(".discussion-container").text("");
    if(this.discusstion !== undefined) {
      $(".btn-showDiscussion").text(`Show Discussion (${this.discusstion.length})`);
    } else {
      $(".btn-showDiscussion").text(`Show Discussion (0)`);
    }

    return "Load Question Successfully!";
  }

  loadQueTextHtml() {
    $(".ExamQuestionsBlock .que-text").html(this.question_text);
    $("#queDomain").html(`<span class="fw-bold text-primary">${this.question_id}</span> ${this.topic_name}`);
  }

  loadQueAnswerHtml(
    isShowAnswer = false,
    choiceAwswer
  ) {
    let self = this;
    var htmlText = "";
    var SYMBOL_ANSWERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
    
    self.answer_list.forEach(function (answer, index) {
      let queContentAwnswer = "";
      if (isShowAnswer) {
        queContentAwnswer = answer.correct ? "true" : "false";
      }

      let checked = "";
      if (
        choiceAwswer != "" &&
        choiceAwswer.indexOf(SYMBOL_ANSWERS[index]) >= 0
      ) {
        checked = "checked";
      }

      let htmlRadioCheckbox = "";
      if (!self.is_partially_correct) {
        // One Choice: radio input
        htmlRadioCheckbox = `<input class="ip-radio" type="radio" name="input_select_${self.queNo}" ${checked} value="${SYMBOL_ANSWERS[index]}">`;
      } else {
        // Multiple Choices: checkbox input
        htmlRadioCheckbox = `<input class="ip-radio" type="checkbox" name="input_select_${self.queNo}" ${checked} value="${SYMBOL_ANSWERS[index]}">`;
      }

      htmlText += `
      <label class="my-2 custom_label">
          ${htmlRadioCheckbox}
          <span class="que-content ${queContentAwnswer}">
              <span class="symbolAnswer hidden">${SYMBOL_ANSWERS[index]}.</span>
              ${answer.choice}
          </span>
      </label>
      `;
    });

    return htmlText;
  }

  markQuestion() {
    $("#attempts-que li").removeClass("current");
    $(`#attempts-que li[data-queno="${this.queNo}"]`).addClass("current");
  }

  markChoice(queNo, isChoice = true) {
    if (isChoice) {
      $(`#attempts-que li[data-queno="${queNo}"]`).addClass("choice");
    } else {
      $(`#attempts-que li[data-queno="${queNo}"]`).removeClass("choice");
    }
  }

  markToReview(queNo, isMarked = false) {
    if (isMarked) {
      $(`#attempts-que li[data-queno="${queNo}"]`).addClass("review");
    } else {
      $(`#attempts-que li[data-queno="${queNo}"]`).removeClass("review");
    }
  }

  showQueNumber(queNo = 0) {
    $(".total-questions").text(`Question ${queNo + 1} of ${queDataCount}`);
  }

  showQueAnswerHtml(choiceAnswer, isShowAnswer = false) {
    if (isShowAnswer) {
      $(".explanation-block").html(`
        <h6>Explanation: </h6>
        ${this.general_feedback}
      `);
    } else {
      $(".explanation-block").html("");
    }

    $("fieldset.que-list").html(this.loadQueAnswerHtml(isShowAnswer, choiceAnswer));
  }

  showCommentHtml(myComment = "", isShowAnswer = false) {
    let htmlMyComment = `<h6>My Comment <a class="btnEditComment btn btn-sm btn-warning">Edit</a></h6>`
    if(myComment != "" && isShowAnswer == true) {
      htmlMyComment += `
        <div class="textComment p-3 mb-2 bg-success text-white">
          ${myComment.replaceAll("\n", "<br>")}
        </div>
      `;
    }

    htmlMyComment += `
      <div class="edit-comment-block"></div>
    `

    $(".comment-block").html(htmlMyComment);
  }

  showMarkToReview(isMarked) {
    if(isMarked) {
      $("#starMarkToReview").addClass("true");
    } else {
      $("#starMarkToReview").removeClass("true");
    }
  }

  showQueListNumber(count = 0) {
    var liQuestHtml = "";
    for (let i = 0; i < count; i++) {
      liQuestHtml += `
      <li data-queno="${i}" class="">${i + 1}</li>
      `;
    }
    $("#attempts-que ul").html(liQuestHtml);
  }

  editQuestionHtml() {
    console.log("Edit Question");

  }
  saveQuestion() {
    console.log("save Question");

  }
}

class Exam {
  constructor(listQuestions = [], cacheItemId = "default") {
    this.listQuestions = this.loadQuestions(listQuestions);
    // this.listQuestions = listQuestions;
    this.count = listQuestions.length;
    this.current = 0;
    this.choices = [];
    this.markedQuestion = [];
    this.cacheItemId = cacheItemId;
    this.comments = [];
    this.childExam = [];
    this.childExamChoice = [];
  }

  //Load all question from list
  loadQuestions(questions) {
    let list = [];
    questions.forEach(function (question, index) {
      let quesObj = new Question();
      quesObj.loadData(question, index);
      list = [...list, quesObj];
    });

    return list;
  }

  currentQuestion() {
    return this.listQuestions[this.current];
  }

  nextQuestion() {
    this.current += 1;
    if (this.current >= this.count) {
      this.current = 0;
    }

    return this.current;
  }

  prevQuestion() {
    this.current -= 1;
    if (this.current < 0) {
      this.current = this.count - 1;
    }

    return this.current;
  }

  getQuestion(queNo = 0) {   
    return this.listQuestions[queNo];
  }

  // getQuestion(queNo = 0) {
  //   return this.listQuestions[queNo];
  // }

  saveChoice(queNo, aws) {
    let elementIndex = this.choices.findIndex((obj) => obj.queNo == queNo);
    let newElement = {
      queNo: queNo,
      choice: aws,
    };
    if (elementIndex == -1) {
      this.choices = [...this.choices, newElement];
    } else {
      this.choices[elementIndex] = newElement;
    }
  }

  getChoice(queNo = this.current) {
    let elementIndex = this.choices.findIndex((obj) => obj.queNo == queNo);
    if (elementIndex == -1) {
      return "";
    } else {
      return this.choices[elementIndex].choice;
    }
  }

  saveMarkToReview(queNo, isMarked) {
    let elementIndex = this.markedQuestion.findIndex(
      (obj) => obj.queNo == queNo
    );

    let newElement = {
      queNo: queNo,
      isMarked: isMarked,
    };

    if (elementIndex > -1) {
      if(isMarked) {
        this.markedQuestion[elementIndex] = newElement;
      } else {
        this.markedQuestion.splice(elementIndex, 1);
      }
    } else {
      this.markedQuestion = [...this.markedQuestion, newElement];
    }

    //Sort
    this.markedQuestion.sort((a,b) => a.queNo - b.queNo)

    // Save to LocalCache
    this.saveToLocalCache("ONLY_STAR");
  }

  getMarkToReview(queNo = this.current) {
    let elementIndex = this.markedQuestion.findIndex(
      (obj) => obj.queNo == queNo
    );
    if (elementIndex == -1) {
      return false;
    } else {
      return this.markedQuestion[elementIndex].isMarked;
    }
  }

  showResult() {
    var resultBlock = "";
    let total_point = 0;
    resultBlock += `
    <table class="table table-sm">
      <thead class="thead-light">
        <tr>
          <th scope="col">#</th>
          <th scope="col">Question</th>
          <th scope="col">Commnet</th>
          <th scope="col">Point</th>
          <th scope="col">Correct</th>
          <th scope="col">Choice</th>
          <th scope="col">View</th>
        </tr>
      </thead>
    <tbody>
    `;

    var self = this;
    this.listQuestions.forEach(function (question, index) {
      let correctAnswers = self.getAnswer(question.answer_list);
      let choiceAnswerText = self.getChoice(index);
      let choiceAnswers = choiceAnswerText.split("").sort();
      let isMarkToReview = self.getMarkToReview(index);
      let point = 0;
      if (correctAnswers.toString() == choiceAnswers.toString()) {
        point = 1;
      }

      let pointText = "";
      if(choiceAnswerText != "") {
        if(point == 1) {
          pointText = `<span class="badge badge-pill bg-success">Correct</span>`;
        } else {
          pointText = `<span class="badge badge-pill bg-danger">InCorrect</span>`;
        }
      } else {
        pointText = "-";
      }

      resultBlock += `
      <tr>
        <td>${index + 1}</td>
        <td>${question.question_text.substring(0, 36)}...</td>
        <td><div class="multiline">${self.getComment(index)}</div></td>
        <td>${pointText}</td>
        <td>${correctAnswers.toString()}</td>
        <td>${
          choiceAnswerText != "" ? choiceAnswers.toString() : "-"
        }</td>
        <td>
          <a class="btn btn-sm btnViewQue ${isMarkToReview ? "mark" : ""}" data-queno="${index}" href="javascript:void(0)">View</a>
        </td>
      </tr>
      `;

      total_point += point;
    });

    resultBlock += `
      </tbody>
    </table>
    `;

    let percentPoint = Math.round((total_point / self.count) * 1000) / 10;
    let pointBlock = "";
    if (percentPoint >= 75) {
      pointBlock = `<h2 class="pointBlock text-center pass">${total_point}/${self.count} (${percentPoint})</h2>`;
    } else {
      pointBlock = `<h2 class="pointBlock text-center not-pass">${total_point}/${self.count} (${percentPoint}%)</h2>`;
    }

    resultBlock = `${pointBlock} ${resultBlock}`;
    $("#resultBlock").html(resultBlock);
  }

  calculateScore(listQuestion) {
    let self = this;
    let correctCount = 0;
    let inCorrectCount = 0;
    let notSelected = 0;
    listQuestion.forEach(function(question, index) {
      let userChoice = [];
      $(`#QuestionBlockItem_${index} .ip-radio:checked`).each((key, item) => {
        userChoice = [...userChoice, $(item).val()];
      });

      if (userChoice.sort().toString() != "") {
        if(userChoice.sort().toString() == self.getAnswer(question.answer_list).sort().toString()) {
          correctCount += 1;
        } else {
          inCorrectCount +=1;
        }
      } else {
         notSelected += 1;
      }
    });

    return {
      "correctCount": correctCount, 
      "inCorrectCount": inCorrectCount, 
      "notSelected": notSelected, 
      "total": listQuestion.length
    }
  }

  renderTestQuickView(scoreInfo, targetId = "#quickReviewContent") {
    let html = "";
    let xRate = (scoreInfo.notSelected != scoreInfo.total) ? (scoreInfo.correctCount + scoreInfo.inCorrectCount) : 1;
    let rateCorrect = Math.round((scoreInfo.correctCount / xRate) * 1000) / 10;
    let rateInCorrect = Math.round((scoreInfo.inCorrectCount / xRate) * 1000) / 10;
    html += `
     <div class="text-center">
      <span class="badge badge-pill badge-primary">${scoreInfo.correctCount}</span>
      <span class="badge badge-pill badge-danger">${scoreInfo.inCorrectCount}</span>
      <span class="badge badge-pill badge-warning">${scoreInfo.notSelected}</span>
      / <span class="badge badge-pill badge-info">${scoreInfo.total}</span>
     </div>
     <div class="text-center">
      <div>Correct (Correct/Answered): <span class="badge badge-pill badge-primary">${scoreInfo.correctCount} (${rateCorrect}%)</span></div>
      <div>InCorrect (InCorrect/Answered): <span class="badge badge-pill badge-danger">${scoreInfo.inCorrectCount} (${rateInCorrect}%)</span></div>
      <div>NotAnswer (NotAnswer/Total): <span class="badge badge-pill badge-warning">${scoreInfo.notSelected} (${Math.round((scoreInfo.notSelected / scoreInfo.total) * 1000) / 10}%)</span></div>
      <div>Total: <span class="badge badge-pill badge-info"> ${scoreInfo.total} (100%)</span></div>
     </div>
    `
    // let percentPoint = Math.round((total_point / self.count) * 1000) / 10;
    $(targetId).html(html);
  }

  renderTestQuickViewTable(listQuestion, targetId = "#tableQuickReviewDetails") {
    let self = this;
    let htmlTableBody = "";
    $(targetId).html("");
    listQuestion.forEach(function(question, index) {
      let userChoice = [];
      $(`#QuestionBlockItem_${index} .ip-radio:checked`).each((key, item) => {
        userChoice = [...userChoice, $(item).val()];
      });

      let checkStatus = "";
      if (userChoice.sort().toString() != "") {
        if(userChoice.sort().toString() == self.getAnswer(question.answer_list).sort().toString()) {
          checkStatus = `<span class="badge badge-pill bg-success">Correct (${userChoice.sort().toString()})</span>`;
        } else {
          checkStatus = `<span class="badge badge-pill bg-danger">InCorrect (${userChoice.sort().toString()} <> ${self.getAnswer(question.answer_list).sort().toString()})</span>`;
        }
      } else {
        checkStatus = `<span class="badge badge-pill bg-secondary">No Choice</span>`;
      }

      htmlTableBody += `
      <tr>
        <td>${index + 1}</td>
        <td class="text-start">${question.question_text.substring(0, 60)}...</td>
        <td><div class="px-2 text-start bg-secondary text-warning multiline">${self.getComment(question.queNo)}</div></td>
        <td>${checkStatus}</td>
        <td><a class="btn btn-sm btn-warning btnScrollToQuestion" data-index="${index}" href="javascript:void(0)">View</a></td>
      </tr>
    `;
    });

    let html = `
      <table class="table table-sm">
        <thead>
          <tr>
            <th>#</th>  
            <th>Question</th>  
            <th>My Comments</th>  
            <th>Check</th>  
            <th>View</th>  
          </tr>
        </thead>
        <tbody>
          ${htmlTableBody}
        </tbody>
      </table>
    `;

    $(targetId).html(html);
  }

  getAnswer(queAnswers) {
    let SYMBOL_ANSWERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
    var correctAnswer = [];
    queAnswers.forEach(function (answer, index) {
      if (answer.correct) {
        correctAnswer = [...correctAnswer, SYMBOL_ANSWERS[index]];
      }
    });

    return correctAnswer;
  }

  setUserChoice(userChoice) {
    let choices = [];
    userChoice.forEach(function (item, index) {
      choices = [...choices, {
        "queNo": parseInt(item.name.replaceAll("input_select_", "")),
        "answer": item.value
      }];
    });

    this.childExamChoice = choices;
    return this.choices;
  }

  saveToLocalCache(type = "ALL") {
    let exam;
    let tmp_exam = localStorage.getItem(this.cacheItemId);
    if(!tmp_exam) {
      exam = {
        currentQuestion: 0,
        choices: [],
        markedQuestion: [],
        comments: []
      }
    } else {
      exam =  JSON.parse(tmp_exam);
    }

    // SAVE OPTIONS
    console.log(`Class Exam > saveToLocalCache > ${type}`);
    switch (type) {
      case "ONLY_STAR":
        exam.markedQuestion = this.markedQuestion;
        break;
      case "CURRENT_QUESTION":
          exam.currentQuestion = this.current;
          break;
      // ALL && default
      case "ALL":
      default:
        exam = {
          currentQuestion: this.current,
          choices: this.choices,
          markedQuestion: this.markedQuestion,
          comments: this.comments
        };
    }

    localStorage.setItem(this.cacheItemId, JSON.stringify(exam));

  }

  loadFromLocalCache() {
    let exam = localStorage.getItem(this.cacheItemId);
    if(!exam) return;
    
    exam = JSON.parse(exam);

    this.current = exam.currentQuestion ?? 0;
    this.choices = exam.choices;
    this.markedQuestion = exam.markedQuestion;
    this.comments = exam.comments ?? [];
  }

  clearLocalCache(type="ALL") {
    console.log(`Class Exam > clearLocalCache > ${type}`);
    
    if(type == "ONLY_ANSWER") {
      this.choices=[];
      this.saveToLocalCache();
    } else {
      localStorage.removeItem(this.cacheItemId, exam);
    }
  }

  loadQueListNumber() {
    let self = this;
    self.choices.forEach(function (choiceItem) {
      $(`#attempts-que li[data-queno="${choiceItem.queNo}"]`).addClass("choice");
    });
    self.markedQuestion.forEach(function (markedItem) {
      if(markedItem.isMarked) {
        $(`#attempts-que li[data-queno="${markedItem.queNo}"]`).addClass("review");
      } else {
        $(`#attempts-que li[data-queno="${markedItem.queNo}"]`).removeClass("review");
      }
    });
  }

  renderQuestion(markedQue, index) {
    var SYMBOL_ANSWERS = ["A", "B", "C", "D", "E", "F", "G", "H"];
    let question = this.listQuestions[markedQue["queNo"]];

    let queAnswers = question["answer_list"][0]["answers"];
    let answer_text = "";
    
    let htmlRadioCheckbox = "";
    if (!question["is_partially_correct"]) {
      // One Choice: radio input
      htmlRadioCheckbox = `<input class="ip-radio" type="radio" name="que-${markedQue['queNo']}" value="${SYMBOL_ANSWERS[index]}">`;
    } else {
      // Multiple Choices: checkbox input
      htmlRadioCheckbox = `<input class="ip-radio" type="checkbox" name="que-${markedQue['queNo']}" value="${SYMBOL_ANSWERS[index]}">`;
    }

    let htmlStarIcon = `
      <div data-queno="${markedQue['queNo']}" class="starMarkToReview ${markedQue['isMarked'] ? 'true' : 'false'}">
          <i class="fa-solid fa-star"></i>
      </div>
    `;

    queAnswers.forEach(function (answer, index) {
      answer_text +=`
      <label class="my-2 custom_label">
        ${htmlRadioCheckbox}
        <span class="que-content hiddenColor ${answer["correct"] == true ? 'true' : 'false'}">
            <span class="symbolAnswer">${SYMBOL_ANSWERS[index]}.</span>
            ${answer["choice"]}
        </span>
      </label>
      `;
    });
    
    let html_starBlock = `
    <div class="starQuestionBlock">
      ${htmlStarIcon}
      Question: ${markedQue["queNo"] + 1}.
      ${question.question_text}
      ${answer_text}
    </div>
    <br>
    `;

    return html_starBlock;
  }

  renderQuestion2(queData, index, isShowAnswer) {
    let html=`This question ${index} <br>`;
    let question = new Question();
    question.loadData(queData, index);
    
    //Set show answer or not 
    question.options.isShowAnswer = isShowAnswer;

    html = question.renderQuestionHtml();

    return html;
  }

  renderContent(listQuestion, htmlSelection = "#starBlock", isShowAnswer) {
    var self = this;
    var htmlText = "";
    listQuestion.forEach(function (markedQue, index) {
      let question = self.listQuestions[markedQue["queNo"]];
      let userChoice = self.childExamChoice.filter(item => item.queNo == markedQue["queNo"]).map(item => item.answer).toString();
      question.options.userMarked = markedQue["isMarked"];
      question.options.isShowAnswer = isShowAnswer;
      if(isShowAnswer) {
        question.options.userChoice = userChoice;
      } else {
        question.options.userChoice = "";
      }
      
      htmlText += question.renderQuestionHtml();
    });

    $(`${htmlSelection}`).html(htmlText);
  }

  renderContent_v2(listQuestion, htmlSelection = "#starBlock") {
    var htmlText = "";
    //Get list star questions
    let star_ques = this.markedQuestion.map(item => item.queNo);

    listQuestion.forEach(function (question, index) {      
      let questionText = question.renderQuestionHtml_v2({
        index: index,
        showAnswer: false,
        showComment: false,
        isStar: star_ques.includes(question.queNo),
        userChoice: "",
        showAnswerBtn: true,
        showCommentBtn: true,
      });

      htmlText += `
      <div class="QuestionBlockItem" id="QuestionBlockItem_${index}">
        ${questionText}
      </div>
    `;
    });

    $(`${htmlSelection}`).html(htmlText);
  }

  filterQuestion(options) {
    let self = this;
    let list = [];
    let EXAM_TYPE = options.exam_type;
    let FROM_QUESTION = options.from_question;
    let TO_QUESTION = options.to_question;
    let MAX_QUESTION = options.max_question;
    let RAMDOM = options.random;
    
    let from = FROM_QUESTION < 1 ? parseInt(1) : parseInt(FROM_QUESTION);
    let to = (self.count < TO_QUESTION) ? self.count : parseInt(TO_QUESTION);
    for (let i = from; i <= to; i++) {
      list = [...list, {queNo: (i - 1), isMarked: false}];
    }

    // Set STAR if have
    for (let i = 0; i < self.markedQuestion.length; i++) {
      let elementIndex = list.findIndex((obj) => obj.queNo == self.markedQuestion[i].queNo);
      if (elementIndex == -1) {
      } else {
        list[elementIndex].isMarked = self.markedQuestion[i].isMarked;
      }
    }

    // STAR
    if(EXAM_TYPE == "STAR") {
      list = list.filter(item => (item.isMarked == true));
    }

    // MAX_QUESTION
    if (MAX_QUESTION != "ALL") {
      list = list.splice(0, MAX_QUESTION);
    }

    // RAMDOM
    if(RAMDOM == "RANDOM") {
      this.shuffleArray(list);
    }

    return list;
  }

  filterQuestion_v2(options) {
    let self = this;
    let list2 = [];
    let EXAM_TYPE = options.exam_type;
    let FROM_QUESTION = options.from_question;
    let TO_QUESTION = options.to_question;
    let MAX_QUESTION = options.max_question;
    let RAMDOM = options.random;
    let QUESTION_OPTIONS = options.question_options;
    
    let from = FROM_QUESTION < 1 ? parseInt(1) : parseInt(FROM_QUESTION);
    let to = (self.count < TO_QUESTION) ? self.count : parseInt(TO_QUESTION);
    let que = null;
    // let star_ques = self.markedQuestion.map(item => item.queNo);
    switch(EXAM_TYPE){
      case "STAR":
        self.markedQuestion.forEach(item => {
          que = self.listQuestions[item.queNo];
          que.options = QUESTION_OPTIONS;
          // if(star_ques.includes(item.queNo)) {
          //   que.options.userMarked = true;
          // }
          list2 = [...list2, que]
        });
        break;
      default:
        //Normal
        for (let i = from; i <= to; i++) {
          que = self.listQuestions[i-1];
          que.options = QUESTION_OPTIONS;
          // if(star_ques.includes(i-1)) {
          //   que.options.userMarked = true;
          // }
          list2 = [...list2, que]
        }
    }

    // RAMDOM
    if(RAMDOM == "RANDOM") {
      this.shuffleArray(list2);
    }

    // MAX_QUESTION
    if (MAX_QUESTION != "ALL") {
      list2 = list2.splice(0, MAX_QUESTION);
    }

    return list2;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
  }

  getFilterQuestion(type = "STAR", from = 0, to = 20, random = "RANDOM", max = 100) {
    //FILTER OPTIONS
    let listQuestion = this.filterQuestion({
      "exam_type": type,
      "from_question": from,
      "to_question": to,
      "max_question": max,
      "random": random
    });

    this.renderContent(listQuestion);
    this.childExam = listQuestion;

    return listQuestion;
  }

  createExam(
    options = {
      type: type,
      from: from,
      to: to,
      random: random,
      max: max,
      question_options: {
        show_title: true
      }
    }
  ) {
    return this.filterQuestion_v2({
      exam_type: options.type,
      from_question: options.from,
      to_question: options.to,
      random: options.random,
      max_question: options.max,
      question_options: options.question_options
    });
  }

  export() {
    let listQuestion = this.listQuestions;
    let html = `
      <div id="exportModal" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg">
          <div class="modal-content m-3 p-3">
            <h5>
              Content
              <a id="btnCopyExportContent" style="width: 100px" class="btn btn-warning btn-sm">Copy</a>
            </h5>
            <div id="exportContent" style="max-height: 350px; overflow: scroll;">
              <code><pre>${JSON.stringify(listQuestion, null, 2)}</pre></code>
            </div>
          </div>
        </div>
      </div>
    `;

    $("#modals").html(html);
    $('#exportModal').modal('show');
  }

  copyText(eleIndex="#exportContent pre") {
    let copyText = JSON.stringify(this.listQuestions, null, 2);
    navigator.clipboard.writeText(copyText);
  }

  getComment(queNo = this.current) {
    let elementIndex = this.comments.findIndex((obj) => obj.queNo == queNo);
    if (elementIndex == -1) {
      return "";
    } else {
      return this.comments[elementIndex].content;
    }
  }
  
  setComment(queNo, content) {
    let elementIndex = this.comments.findIndex((obj) => obj.queNo == queNo);
    let newElement = {
      queNo: queNo,
      content: content,
    };
    if (elementIndex == -1) {
      this.comments = [...this.comments, newElement];
    } else {
      this.comments[elementIndex] = newElement;
    }
    
    this.saveToLocalCache();
    
    return "Success"
  }

  createTestHtml() {

  }
}
