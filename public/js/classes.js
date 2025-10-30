class Question {
  constructor() {
    this.queNo = '';
    this.question_id = '';
    this.question_text = '';
    this.question_type = 1;
    this.general_feedback = '';
    this.answer_list = '';
    this.topic_name = '';
    this.is_partially_correct = false;
    this.options = {
      show_title: true
    };
    this.discusstion = '';
  }

  loadData(queData, queNo) {
    this.queNo = queNo;
    this.question_id = queData.question_id;
    this.question_text = queData.question_text;
    this.question_type = queData.question_type;
    this.general_feedback = queData.general_feedback;
    this.answer_list = queData.answer_list[0].answers;
    this.topic_name = queData.topic_name;
    this.is_partially_correct = queData.is_partially_correct;
    this.options = {
      show_title: true
    };
    this.discusstion = queData.discusstion;
  }

  renderQuestionHtml() {
    let html = '';

    let htmlStarIcon = `
      <div data-queno="${this.queNo}" class="starMarkToReview ${this.options.userMarked ? 'true' : 'false'}">
          <i class="fa-solid fa-star"></i>
      </div>
    `;

    html += `
      <div>Question: ${this.queNo + 1} (${this.question_id})</div>
      <div class="que-text">${this.getCleanQuestionText()}</div>
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
    options = {
      index: -1,
      showAnswer: false,
      showComment: false,
      isStar: false,
      userChoice: '',
      showAnswerBtn: true,
      showCommentBtn: true
    }
  ) {
    let html = '';
    let answerBtn = `
      <button type="button" class="btnShowAnswerQuestion btn btn-warning btn-sm" data-index=${options.index} data-hideshow=${options.showAnswer ? 'Hide' : 'Show'}>${options.showAnswer ? 'Hide Answer' : 'Show Answer'}</button>
    `;

    let discusstion_count = this.discusstion ? this.discusstion.length : 0;
    let commentBtn = `
      <button type="button" class="btnShowDisscussionQuestion btn btn-info btn-sm" data-index=${options.index} data-hideshow=${options.showComment ? 'Hide' : 'Show'}>${options.showComment ? `Hide Disscussion (${discusstion_count})` : `Show Disscussion (${discusstion_count})`}</button>
    `;

    let htmlStarIcon = `
      <div data-queno="${this.queNo}" class="starMarkToReview ${options.isStar ? 'true' : 'false'}">
          <i class="fa-solid fa-star"></i>
      </div>
    `;

    html += `
      <div class="que-title">Question:  ${options.index + 1} (${this.options.show_title ? this.question_id : '#____'})</div>
      <div class="que-text">${this.getCleanQuestionText()}</div>
      ${htmlStarIcon}
    `;

    let html_discusstion = '';
    if (options.showComment) {
      let discusstion = this.discusstion;
      if (discusstion) {
        //Sort by voted count
        discusstion.sort((a, b) => b.upvote_count - a.upvote_count);

        discusstion.forEach(function (comment, index) {
          let selected_answers = comment.selected_answers;
          let html_selected_answers = '';
          if (selected_answers !== undefined && selected_answers != '') {
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
        html_discusstion = 'Have not comments!';
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
    $('fieldset.que-list').html(this.loadQueAnswerHtml(false, choiceAnswer));

    //Mark Current Question
    this.markQuestion();

    // Load isMarked
    this.showMarkToReview(isMarked);

    // Clean
    $('.explanation-block').html('');
    $('.comment-block').html('');
    $('.btn-showAnswer').removeClass('show');
    $('.btn-showAnswer').text('Show Answer');
    $('.btn-showDiscussion').removeClass('show');
    $('.discussion-container').text('');
    if (this.discusstion !== undefined) {
      $('.btn-showDiscussion').text(`Show Discussion (${this.discusstion.length})`);
    } else {
      $('.btn-showDiscussion').text(`Show Discussion (0)`);
    }

    return 'Load Question Successfully!';
  }

  loadQueTextHtml() {
    $('.ExamQuestionsBlock .que-text').html(this.getCleanQuestionText());
    $('#queDomain').html(`<span class="fw-bold text-primary">${this.topic_name}</span>`);
  }

  // Get cleaned question text with image URLs cleaned
  getCleanQuestionText() {
    if (!this.question_text) {
      return this.question_text;
    }

    // Check if ImageUrlUtils is available
    if (typeof window.ImageUrlUtils !== 'undefined' && window.ImageUrlUtils.cleanImageUrlsInHtml) {
      return window.ImageUrlUtils.cleanImageUrlsInHtml(this.question_text);
    }

    // Fallback: simple URL cleaning if ImageUrlUtils is not available
    if (typeof this.question_text === 'string' && this.question_text.includes('<img')) {
      return this.question_text.replace(/src=["']([^"']*)\?[^"']*["']/gi, 'src="$1"');
    }

    return this.question_text;
  }

  // Get cleaned question text preview (strips HTML and cleans URLs)
  getCleanQuestionTextPreview(questionText, maxLength = null) {
    if (!questionText) {
      return questionText;
    }

    let cleanText = questionText;

    // Clean image URLs first
    if (typeof window.ImageUrlUtils !== 'undefined' && window.ImageUrlUtils.cleanImageUrlsInHtml) {
      cleanText = window.ImageUrlUtils.cleanImageUrlsInHtml(cleanText);
    } else if (typeof cleanText === 'string' && cleanText.includes('<img')) {
      cleanText = cleanText.replace(/src=["']([^"']*)\?[^"']*["']/gi, 'src="$1"');
    }

    // Strip HTML tags for preview
    cleanText = cleanText.replace(/<[^>]*>/g, '');

    // Truncate if maxLength is specified
    if (maxLength && cleanText.length > maxLength) {
      cleanText = cleanText.substring(0, maxLength);
    }

    return cleanText;
  }

  loadQueAnswerHtml(isShowAnswer = false, choiceAwswer) {
    let self = this;
    var htmlText = '';
    var SYMBOL_ANSWERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    self.answer_list.forEach(function (answer, index) {
      let queContentAwnswer = '';
      if (isShowAnswer) {
        queContentAwnswer = answer.correct ? 'true' : 'false';
      }

      let checked = '';
      if (choiceAwswer != '' && choiceAwswer.indexOf(SYMBOL_ANSWERS[index]) >= 0) {
        checked = 'checked';
      }

      let htmlRadioCheckbox = '';
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
    $('#attempts-que li').removeClass('current');
    $(`#attempts-que li[data-queno="${this.queNo}"]`).addClass('current');
  }

  markChoice(queNo, isChoice = true) {
    if (isChoice) {
      $(`#attempts-que li[data-queno="${queNo}"]`).addClass('choice');
    } else {
      $(`#attempts-que li[data-queno="${queNo}"]`).removeClass('choice');
    }
  }

  markToReview(queNo, isMarked = false) {
    if (isMarked) {
      $(`#attempts-que li[data-queno="${queNo}"]`).addClass('review');
    } else {
      $(`#attempts-que li[data-queno="${queNo}"]`).removeClass('review');
    }
  }

  showQueNumber(queNo = 0, totalCount = null) {
    // If totalCount is not provided, try to get it from the exam object
    if (totalCount === null && window.exam) {
      totalCount = window.exam.count;
    }
    // If still no totalCount, use a default value
    if (totalCount === null || totalCount === 0) {
      totalCount = '?';
    }

    $('.total-questions').text(`#${queNo + 1}/${totalCount}`);
  }

  showQueAnswerHtml(choiceAnswer, isShowAnswer = false) {
    if (isShowAnswer) {
      $('.explanation-block').html(`
        <h6>Explanation: </h6>
        ${this.general_feedback}
      `);
    } else {
      $('.explanation-block').html('');
    }

    $('fieldset.que-list').html(this.loadQueAnswerHtml(isShowAnswer, choiceAnswer));
  }

  showCommentHtml(myComment = '', isShowAnswer = false) {
    let htmlMyComment = `<h6>My Comment <a class="btnEditComment btn btn-sm btn-warning">Edit</a></h6>`;
    if (myComment != '' && isShowAnswer == true) {
      htmlMyComment += `
        <div class="textComment p-3 mb-2 bg-success text-white">
          ${myComment.replaceAll('\n', '<br>')}
        </div>
      `;
    }

    htmlMyComment += `
      <div class="edit-comment-block"></div>
    `;

    $('.comment-block').html(htmlMyComment);
  }

  showMarkToReview(isMarked) {
    if (isMarked) {
      $('#starMarkToReview').addClass('true');
    } else {
      $('#starMarkToReview').removeClass('true');
    }
  }

  showQueListNumber(count = 0) {
    var liQuestHtml = '';
    for (let i = 0; i < count; i++) {
      liQuestHtml += `
      <li data-queno="${i}" class="">${i + 1}</li>
      `;
    }
    $('#attempts-que ul').html(liQuestHtml);
  }

  editQuestionHtml() {
    // Edit question functionality
  }
  saveQuestion() {
    // Save question functionality
  }
}

class Exam {
  constructor(listQuestions = [], cacheItemId = 'default') {
    // Clear any existing creation lock to prevent stuck locks
    window.examCreationInProgress = false;

    this.initializeExam(listQuestions, cacheItemId);
  }

  initializeExam(listQuestions, cacheItemId) {
    this.listQuestions = this.loadQuestions(listQuestions);
    // this.listQuestions = listQuestions;
    this.count = listQuestions.length;
    this.current = 0;
    this.choices = [];
    this.markedQuestion = [];
    this.cacheItemId = cacheItemId;
    this.comments = [];

    // Auto-submit functionality
    this.autoSubmitTimer = null;
    this.lastSubmittedChoices = null;
    this.autoSubmitInterval = 30 * 1000; // 30 seconds in milliseconds (for testing)
    this.hasNewChoices = false;
    this.autoSubmitEnabled = true;

    // Auto feedback functionality
    this.autoFeedbackEnabled = true;
    this.childExam = [];
    this.childExamChoice = [];
    this._isLoadingFromDatabase = false; // Flag to prevent multiple database loads
    this._lastDatabaseLoadTime = 0; // Track last database load time
    this._databaseLoadDebounceMs = 2000; // Debounce database loads by 2 seconds

    // Initialize auto-submit and auto-feedback status indicators
    setTimeout(() => {
      this.updateAutoSubmitStatus();
      this.updateAutoFeedbackStatus();
    }, 100);
    this._instanceId = Date.now() + Math.random(); // Unique instance ID

    // Database integration properties
    this.examId = null;
    this.examName = null;
    this.groupId = null;
    this.groupName = null;
    this.pendingResult = null;

    // Track this instance globally
    if (!window.examInstances) {
      window.examInstances = new Map();
    }

    // Cleanup old instances to prevent memory leaks
    if (window.examInstances.size > 5) {
      const firstKey = window.examInstances.keys().next().value;
      window.examInstances.delete(firstKey);
    }

    window.examInstances.set(this._instanceId, this);

    // Set this as the current active instance
    window.currentExamInstance = this;
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
    let elementIndex = this.choices.findIndex(obj => obj.queNo == queNo);
    let newElement = {
      queNo: queNo,
      choice: aws
    };
    if (elementIndex == -1) {
      this.choices = [...this.choices, newElement];
    } else {
      this.choices[elementIndex] = newElement;
    }

    // Mark that there are new choices for auto-submit
    this.hasNewChoices = true;

    // Start auto-submit timer if not already running
    this.startAutoSubmitTimer();

    // Update auto-submit status indicator
    this.updateAutoSubmitStatus();

    // Update visual feedback in attempts-que
    this.updateAnswerVisualFeedback(queNo, aws);
  }

  // Update visual feedback for answer correctness
  updateAnswerVisualFeedback(queNo, userChoice) {
    // Remove existing correct/incorrect classes
    $(`#attempts-que li[data-queno="${queNo}"]`).removeClass('correct incorrect');

    // Add choice class
    $(`#attempts-que li[data-queno="${queNo}"]`).addClass('choice');

    // Only show correct/incorrect feedback if auto feedback is enabled
    if (this.autoFeedbackEnabled && userChoice) {
      const isCorrect = this.checkAnswerCorrectness(queNo, userChoice);
      if (isCorrect) {
        $(`#attempts-que li[data-queno="${queNo}"]`).addClass('correct');
      } else {
        $(`#attempts-que li[data-queno="${queNo}"]`).addClass('incorrect');
      }
    }
  }

  getChoice(queNo = this.current) {
    let elementIndex = this.choices.findIndex(obj => obj.queNo == queNo);
    if (elementIndex == -1) {
      return '';
    } else {
      return this.choices[elementIndex].choice;
    }
  }

  saveMarkToReview(queNo, isMarked) {
    let elementIndex = this.markedQuestion.findIndex(obj => obj.queNo == queNo);

    let newElement = {
      queNo: queNo,
      isMarked: isMarked
    };

    if (elementIndex > -1) {
      if (isMarked) {
        this.markedQuestion[elementIndex] = newElement;
      } else {
        this.markedQuestion.splice(elementIndex, 1);
      }
    } else {
      this.markedQuestion = [...this.markedQuestion, newElement];
    }

    //Sort
    this.markedQuestion.sort((a, b) => a.queNo - b.queNo);

    // Save to LocalCache
    this.saveToLocalCache('ONLY_STAR');
  }

  getMarkToReview(queNo = this.current) {
    let elementIndex = this.markedQuestion.findIndex(obj => obj.queNo == queNo);
    if (elementIndex == -1) {
      return false;
    } else {
      return this.markedQuestion[elementIndex].isMarked;
    }
  }

  showResult() {
    var resultBlock = '';
    let total_point = 0;
    resultBlock += `
    <table class="table table-sm">
      <thead class="thead-light">
        <tr>
          <th scope="col">#</th>
          <th scope="col">Question</th>
          <th scope="col">Comment</th>
          <th scope="col">Point</th>
          <th scope="col">Correct</th>
          <th scope="col">Choice</th>
          <th scope="col">View</th>
        </tr>
      </thead>
    <tbody>
    `;

    let quesObj = new Question();
    var self = this;
    this.listQuestions.forEach(function (question, index) {
      let correctAnswers = self.getAnswer(question.answer_list);
      let choiceAnswerText = self.getChoice(index);
      let choiceAnswers =
        choiceAnswerText &&
        choiceAnswerText
          .split('')
          .filter(item => item !== '' && item !== ',')
          .sort();
      let isMarkToReview = self.getMarkToReview(index);
      let point = 0;
      if (correctAnswers.toString() == choiceAnswers.toString()) {
        point = 1;
      }

      let pointText = '';
      if (choiceAnswerText != '') {
        if (point == 1) {
          pointText = `<span class="badge badge-pill bg-success">Correct</span>`;
        } else {
          pointText = `<span class="badge badge-pill bg-danger">InCorrect</span>`;
        }
      } else {
        pointText = '-';
      }

      resultBlock += `
      <tr>
        <td>${index + 1}</td>
        <td>${quesObj.getCleanQuestionTextPreview(question.question_text, 36)}...</td>
        <td><div class="multiline">${self.getComment(index)}</div></td>
        <td>${pointText}</td>
        <td>${correctAnswers.toString()}</td>
        <td>${choiceAnswerText != '' ? choiceAnswers.toString() : '-'}</td>
        <td>
          <a class="btn btn-sm btnViewQue ${isMarkToReview ? 'mark' : ''}" data-queno="${index}" href="javascript:void(0)">View</a>
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
    let pointBlock = '';
    if (percentPoint >= 75) {
      pointBlock = `<h2 class="pointBlock text-center pass">${total_point}/${self.count} (${percentPoint})</h2>`;
    } else {
      pointBlock = `<h2 class="pointBlock text-center not-pass">${total_point}/${self.count} (${percentPoint}%)</h2>`;
    }

    // Set the result content without the buttons
    resultBlock = `${pointBlock} ${resultBlock}`;
    $('#resultBlock').html(resultBlock);

    // Store result data for later submission
    this.pendingResult = {
      totalPoints: total_point,
      percentScore: percentPoint
    };

    // Bind submit button event (prevent duplicate bindings and double-click submits)
    $('#submitExamResult')
      .off('click.saveResult')
      .on('click.saveResult', async e => {
        e.preventDefault();
        if (this.isSubmittingResult) {
          return; // Guard against double clicks/parallel calls
        }
        this.isSubmittingResult = true;
        const $btn = $('#submitExamResult');
        const originalHtml = $btn.html();
        $btn
          .prop('disabled', true)
          .html(
            '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...'
          );
        try {
          await this.saveResultToDatabase(total_point, percentPoint);
        } finally {
          this.isSubmittingResult = false;
          $btn.prop('disabled', false).html(originalHtml);
        }
      });

    // Bind delete button event (prevent duplicate bindings)
    $('#deleteOldResults')
      .off('click.deleteOld')
      .on('click.deleteOld', () => {
        this.deleteOldResults();
      });
  }

  // Save exam result to database
  async saveResultToDatabase(totalPoints, percentScore) {
    try {
      if (!window.databaseClient) {
        console.warn('Database client not available');
        return;
      }

      // Stop auto-submit timer when manually submitting
      this.stopAutoSubmitTimer();

      const examData = {
        examId: this.examId || 'unknown',
        examName: this.examName || 'Unknown Exam',
        groupId: this.groupId || '',
        groupName: this.groupName || '',
        score: Math.round(percentScore), // Round to integer
        totalQuestions: this.count,
        correctAnswers: totalPoints,
        incorrectAnswers: this.count - totalPoints,
        unansweredQuestions: 0,
        timeTaken: 0,
        answersData: this.getAllChoices(),
        reviewMarks: this.getAllReviewMarks(),
        comments: this.getAllComments(),
        isAutoSubmitted: false // Flag to indicate this was manually submitted
      };

      const result = await window.databaseClient.saveExamResult(examData);
      console.log('Exam result saved to database:', result);

      // Clear cache for this exam to ensure fresh data
      window.databaseClient.clearExamCache(this.examId);

      // Clear session storage to allow reloading from database
      if (this.examId) {
        sessionStorage.removeItem(`exam_loaded_${this.examId}`);
      }

      // Show success message
      this.showSaveSuccessMessage();
    } catch (error) {
      console.error('Failed to save exam result to database:', error);
      this.showSaveErrorMessage(error.message);
    }
  }

  // Show save success message
  showSaveSuccessMessage() {
    const message = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle"></i> Exam result saved to database successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    $('#resultBlock').prepend(message);
  }

  // Show save error message
  showSaveErrorMessage(errorMsg) {
    const message = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle"></i> Failed to save exam result: ${errorMsg}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    $('#resultBlock').prepend(message);
  }

  // Delete old exam results
  async deleteOldResults() {
    try {
      if (!window.databaseClient) {
        console.warn('Database client not available');
        return;
      }

      // Show confirmation dialog
      if (
        !confirm(
          'Are you sure you want to delete all exam results? This will permanently delete your results from the database and clear all cached data. This action cannot be undone.'
        )
      ) {
        return;
      }

      // Get current user ID
      const userId = window.databaseClient.getCurrentUserId();
      if (!userId) {
        this.showDeleteErrorMessage('User not authenticated');
        return;
      }

      let dbDeleted = false;
      try {
        // Try to delete from database first
        const result = await window.databaseClient.deleteUserExamResults(userId);
        console.log('Old exam results deleted from database:', result);
        dbDeleted = true;
      } catch (dbError) {
        console.warn('Database delete not available, clearing local cache only:', dbError.message);
      }

      // Clear all local cache and session storage
      this.clearLocalCache('ALL');

      // Clear all session storage for exam loading
      try {
        if (window.databaseClient && window.databaseClient.clearAllSessionStorage) {
          window.databaseClient.clearAllSessionStorage();
        } else {
          // Fallback: clear session storage manually
          const keys = Object.keys(sessionStorage);
          keys.forEach(key => {
            if (key.startsWith('exam_loaded_') || key.startsWith('exam_loading_')) {
              sessionStorage.removeItem(key);
            }
          });
        }
      } catch (error) {
        console.warn('Failed to clear session storage:', error);
      }

      // Clear cache for this exam to ensure fresh data
      if (this.examId) {
        try {
          if (window.databaseClient && window.databaseClient.clearExamCache) {
            window.databaseClient.clearExamCache(this.examId);
          }
          sessionStorage.removeItem(`exam_loaded_${this.examId}`);
        } catch (error) {
          console.warn('Failed to clear exam cache:', error);
        }
      }

      // Show success message
      this.showDeleteSuccessMessage(dbDeleted);
    } catch (error) {
      console.error('Failed to clear exam data:', error);
      this.showDeleteErrorMessage(error.message);
    }
  }

  // Show delete success message
  showDeleteSuccessMessage(dbDeleted = false) {
    const message = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle"></i> ${dbDeleted ? 'Exam results deleted from database and cache cleared!' : 'Exam cache cleared successfully!'} Your progress has been reset.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    $('#resultBlock').prepend(message);
  }

  // Show delete error message
  showDeleteErrorMessage(errorMsg) {
    const message = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle"></i> Failed to clear exam cache: ${errorMsg}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
    $('#resultBlock').prepend(message);
  }

  calculateScore(listQuestion) {
    let self = this;
    let correctCount = 0;
    let inCorrectCount = 0;
    let notSelected = 0;

    // Safety check for listQuestion
    if (!listQuestion || !Array.isArray(listQuestion)) {
      console.warn('⚠️ calculateScore: listQuestion is not a valid array', listQuestion);
      return {
        correctCount: 0,
        inCorrectCount: 0,
        notSelected: 0,
        total: 0
      };
    }

    listQuestion.forEach(function (question, index) {
      let userChoice = [];
      $(`#QuestionBlockItem_${index} .ip-radio:checked`).each((key, item) => {
        userChoice = [...userChoice, $(item).val()];
      });

      if (userChoice.sort().toString() != '') {
        if (
          userChoice.sort().toString() == self.getAnswer(question.answer_list).sort().toString()
        ) {
          correctCount += 1;
        } else {
          inCorrectCount += 1;
        }
      } else {
        notSelected += 1;
      }
    });

    return {
      correctCount: correctCount,
      inCorrectCount: inCorrectCount,
      notSelected: notSelected,
      total: listQuestion.length
    };
  }

  renderTestQuickView(scoreInfo, targetId = '#quickReviewContent') {
    let html = '';
    let xRate =
      scoreInfo.notSelected != scoreInfo.total
        ? scoreInfo.correctCount + scoreInfo.inCorrectCount
        : 1;
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
    `;
    // let percentPoint = Math.round((total_point / self.count) * 1000) / 10;
    $(targetId).html(html);
  }

  renderTestQuickViewTable(listQuestion, targetId = '#tableQuickReviewDetails') {
    let self = this;
    let htmlTableBody = '';
    $(targetId).html('');
    listQuestion.forEach(function (question, index) {
      let userChoice = [];
      $(`#QuestionBlockItem_${index} .ip-radio:checked`).each((key, item) => {
        userChoice = [...userChoice, $(item).val()];
      });

      let checkStatus = '';
      if (userChoice.sort().toString() != '') {
        if (
          userChoice.sort().toString() == self.getAnswer(question.answer_list).sort().toString()
        ) {
          checkStatus = `<span class="badge badge-pill bg-success">Correct (${userChoice.sort().toString()})</span>`;
        } else {
          checkStatus = `<span class="badge badge-pill bg-danger">InCorrect (${userChoice.sort().toString()} <> ${self.getAnswer(question.answer_list).sort().toString()})</span>`;
        }
      } else {
        checkStatus = `<span class="badge badge-pill bg-secondary">No Choice</span>`;
      }

      let quesObj = new Question();
      htmlTableBody += `
      <tr>
        <td>${index + 1}</td>
        <td class="text-start">${quesObj.getCleanQuestionTextPreview(question.question_text, 60)}...</td>
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
    let SYMBOL_ANSWERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
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
      choices = [
        ...choices,
        {
          queNo: parseInt(item.name.replaceAll('input_select_', '')),
          answer: item.value
        }
      ];
    });

    this.childExamChoice = choices;
    return this.choices;
  }

  saveToLocalCache(type = 'ALL') {
    let exam;
    let tmp_exam = localStorage.getItem(this.cacheItemId);
    if (!tmp_exam) {
      exam = {
        currentQuestion: 0,
        choices: [],
        markedQuestion: [],
        comments: []
      };
    } else {
      exam = JSON.parse(tmp_exam);
    }

    // SAVE OPTIONS
    switch (type) {
      case 'ONLY_STAR':
        exam.markedQuestion = this.markedQuestion;
        break;
      case 'CURRENT_QUESTION':
        exam.currentQuestion = this.current;
        break;
      // ALL && default
      case 'ALL':
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

  // Load from database first, then local cache as fallback
  async loadFromCache() {
    try {
      // Try to load from database first
      if (window.databaseClient && this.examId) {
        const dbResult = await window.databaseClient.getExamResultForUser(this.examId);
        if (dbResult) {
          this.loadFromDatabaseResult(dbResult);
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load from database, falling back to local storage:', error);
    }

    // Fallback to local storage
    this.loadFromLocalCache();
  }

  // Load from cache synchronously (for backward compatibility)
  loadFromCacheSync() {
    // Only run on the current active instance
    if (window.currentExamInstance && window.currentExamInstance._instanceId !== this._instanceId) {
      return;
    }

    // Check global database load lock
    if (window.globalDatabaseLoadInProgress) {
      return;
    }

    // Try local storage first for immediate loading
    this.loadFromLocalCache();

    // Then try database in background (only if not already loading for this exam)
    if (
      window.databaseClient &&
      this.examId &&
      !this._isLoadingFromDatabase &&
      this.examId !== 'undefined'
    ) {
      // Check if we've already loaded this exam from database
      const cacheKey = `exam_loaded_${this.examId}`;
      const loadingKey = `exam_loading_${this.examId}`;

      if (sessionStorage.getItem(cacheKey)) {
        return;
      }

      // Check if we're already in the process of loading this exam
      if (sessionStorage.getItem(loadingKey)) {
        return;
      }

      // Check debounce time to prevent rapid successive calls
      const now = Date.now();
      if (now - this._lastDatabaseLoadTime < this._databaseLoadDebounceMs) {
        return;
      }

      // Ensure exam is properly initialized
      if (!this.examId || this.examId === 'undefined' || this.examId === 'null') {
        return;
      }

      // Set global database load lock
      window.globalDatabaseLoadInProgress = true;

      // Mark as loading
      sessionStorage.setItem(loadingKey, 'true');
      this._isLoadingFromDatabase = true;
      this._lastDatabaseLoadTime = now;

      window.databaseClient
        .getExamResultForUser(this.examId)
        .then(dbResult => {
          if (dbResult) {
            this.loadFromDatabaseResult(dbResult);
            // Refresh the current question display without triggering auto-select
            this.refreshCurrentQuestionDisplay(false);
            // Mark as loaded
            sessionStorage.setItem(cacheKey, 'true');
          }
        })
        .catch(error => {
          console.warn('Failed to load from database:', error);
        })
        .finally(() => {
          this._isLoadingFromDatabase = false;
          // Remove loading flag
          sessionStorage.removeItem(loadingKey);
          // Release global database load lock
          window.globalDatabaseLoadInProgress = false;
        });
    }
  }

  // Load from database result
  loadFromDatabaseResult(dbResult) {
    if (dbResult.answers_data) {
      this.choices = [];
      Object.keys(dbResult.answers_data).forEach(questionIndex => {
        this.choices.push({
          queNo: parseInt(questionIndex),
          choice: dbResult.answers_data[questionIndex]
        });
      });
    }

    if (dbResult.review_marks) {
      this.markedQuestion = [];
      Object.keys(dbResult.review_marks).forEach(questionIndex => {
        this.markedQuestion.push({
          queNo: parseInt(questionIndex),
          isMarked: dbResult.review_marks[questionIndex]
        });
      });
    }

    if (dbResult.comments) {
      this.comments = [];
      Object.keys(dbResult.comments).forEach(questionIndex => {
        this.comments.push({
          queNo: parseInt(questionIndex),
          content: dbResult.comments[questionIndex]
        });
      });
    }

    // Set current question to first question
    this.current = 0;

    // Update visual feedback for loaded answers
    this.updateVisualFeedbackForAllAnswers();
  }

  // Update visual feedback for all loaded answers
  updateVisualFeedbackForAllAnswers() {
    this.choices.forEach(choiceItem => {
      this.updateAnswerVisualFeedback(choiceItem.queNo, choiceItem.choice);
    });
  }

  // Refresh current question display with loaded data
  refreshCurrentQuestionDisplay(enableAutoSelect = true) {
    if (this.currentQuestion()) {
      const currentQuestion = this.currentQuestion();
      const currentChoice = this.getChoice(this.current);
      const currentMarked = this.getMarkToReview(this.current);

      // Update question display
      currentQuestion.getQuestion(currentChoice, currentMarked);

      // Update question list display
      this.loadQueListNumber();

      // Auto-select answers based on loaded data (only if enabled)
      if (enableAutoSelect) {
        this.autoSelectAnswers();
      }
    }
  }

  // Auto-select answers based on loaded choices
  autoSelectAnswers() {
    this.choices.forEach(choiceItem => {
      const questionIndex = choiceItem.queNo;
      const selectedAnswers = choiceItem.choice;

      if (selectedAnswers && selectedAnswers !== '') {
        // Split multiple answers (e.g., "A,B" -> ["A", "B"])
        const answers = selectedAnswers.split(',').map(a => a.trim());

        answers.forEach(answer => {
          // Find and check the corresponding radio/checkbox
          const selector = `input[name="que-${questionIndex}"][value="${answer}"]`;
          const element = $(selector);

          if (element.length > 0) {
            element.prop('checked', true);
          }
        });
      }
    });
  }

  // Load from local cache (original method)
  loadFromLocalCache() {
    let exam = localStorage.getItem(this.cacheItemId);
    if (!exam) return;

    exam = JSON.parse(exam);

    this.current = exam.currentQuestion ?? 0;
    this.choices = exam.choices;
    this.markedQuestion = exam.markedQuestion;
    this.comments = exam.comments ?? [];

    // Auto-select answers after loading from local storage
    setTimeout(() => {
      this.autoSelectAnswers();
    }, 100); // Small delay to ensure DOM is ready
  }

  // Cleanup method to remove this instance from tracking
  destroy() {
    if (window.examInstances) {
      window.examInstances.delete(this._instanceId);
    }
    if (window.currentExamInstance && window.currentExamInstance._instanceId === this._instanceId) {
      window.currentExamInstance = null;
    }

    // Clear any stuck creation locks
    window.examCreationInProgress = false;
  }

  clearLocalCache(type = 'ALL') {
    if (type == 'ONLY_ANSWER') {
      this.choices = [];
      this.saveToLocalCache();

      // Clear visual feedback classes
      $('#attempts-que li').removeClass('choice correct incorrect');
    } else {
      localStorage.removeItem(this.cacheItemId, exam);

      // Clear all visual feedback classes
      $('#attempts-que li').removeClass('choice correct incorrect review');
    }
  }

  loadQueListNumber() {
    let self = this;
    self.choices.forEach(function (choiceItem) {
      $(`#attempts-que li[data-queno="${choiceItem.queNo}"]`).addClass('choice');

      // Check if answer is correct or incorrect
      const question = self.listQuestions[choiceItem.queNo];
      if (question && choiceItem.choice) {
        const isCorrect = self.checkAnswerCorrectness(choiceItem.queNo, choiceItem.choice);
        if (!isCorrect) {
          $(`#attempts-que li[data-queno="${choiceItem.queNo}"]`).addClass('incorrect');
        } else {
          $(`#attempts-que li[data-queno="${choiceItem.queNo}"]`).addClass('correct');
        }
      }
    });
    self.markedQuestion.forEach(function (markedItem) {
      if (markedItem.isMarked) {
        $(`#attempts-que li[data-queno="${markedItem.queNo}"]`).addClass('review');
      } else {
        $(`#attempts-que li[data-queno="${markedItem.queNo}"]`).removeClass('review');
      }
    });
  }

  // Check if user's answer is correct
  checkAnswerCorrectness(queNo, userChoice) {
    const question = this.listQuestions[queNo];
    if (!question || !userChoice) return false;

    // Get correct answers
    const correctAnswers = this.getAnswer(question.answer_list);
    const userAnswers = userChoice
      .split(',')
      .map(a => a.trim())
      .sort();

    // Compare answers
    return JSON.stringify(correctAnswers) === JSON.stringify(userAnswers);
  }

  renderQuestion(markedQue, index) {
    var SYMBOL_ANSWERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let question = this.listQuestions[markedQue['queNo']];

    let queAnswers = question['answer_list'][0]['answers'];
    let answer_text = '';

    let htmlRadioCheckbox = '';
    if (!question['is_partially_correct']) {
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
      answer_text += `
      <label class="my-2 custom_label">
        ${htmlRadioCheckbox}
        <span class="que-content hiddenColor ${answer['correct'] == true ? 'true' : 'false'}">
            <span class="symbolAnswer">${SYMBOL_ANSWERS[index]}.</span>
            ${answer['choice']}
        </span>
      </label>
      `;
    });

    let quesObj = new Question();
    let html_starBlock = `
    <div class="starQuestionBlock">
      ${htmlStarIcon}
      Question: ${markedQue['queNo'] + 1}.
      ${quesObj.getCleanQuestionTextPreview(question.question_text)}
      ${answer_text}
    </div>
    <br>
    `;

    return html_starBlock;
  }

  renderQuestion2(queData, index, isShowAnswer) {
    let html = `This question ${index} <br>`;
    let question = new Question();
    question.loadData(queData, index);

    //Set show answer or not
    question.options.isShowAnswer = isShowAnswer;

    html = question.renderQuestionHtml();

    return html;
  }

  renderContent(listQuestion, htmlSelection = '#starBlock', isShowAnswer) {
    var self = this;
    var htmlText = '';
    listQuestion.forEach(function (markedQue, index) {
      let question = self.listQuestions[markedQue['queNo']];
      let userChoice = self.childExamChoice
        .filter(item => item.queNo == markedQue['queNo'])
        .map(item => item.answer)
        .toString();
      question.options.userMarked = markedQue['isMarked'];
      question.options.isShowAnswer = isShowAnswer;
      if (isShowAnswer) {
        question.options.userChoice = userChoice;
      } else {
        question.options.userChoice = '';
      }

      htmlText += question.renderQuestionHtml();
    });

    $(`${htmlSelection}`).html(htmlText);
  }

  renderContent_v2(listQuestion, htmlSelection = '#starBlock') {
    var htmlText = '';
    //Get list star questions
    let star_ques = this.markedQuestion.map(item => item.queNo);

    listQuestion.forEach(function (question, index) {
      let questionText = question.renderQuestionHtml_v2({
        index: index,
        showAnswer: false,
        showComment: false,
        isStar: star_ques.includes(question.queNo),
        userChoice: '',
        showAnswerBtn: true,
        showCommentBtn: true
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
    let to = self.count < TO_QUESTION ? self.count : parseInt(TO_QUESTION);
    for (let i = from; i <= to; i++) {
      list = [...list, {queNo: i - 1, isMarked: false}];
    }

    // Set STAR if have
    for (let i = 0; i < self.markedQuestion.length; i++) {
      let elementIndex = list.findIndex(obj => obj.queNo == self.markedQuestion[i].queNo);
      if (elementIndex == -1) {
      } else {
        list[elementIndex].isMarked = self.markedQuestion[i].isMarked;
      }
    }

    // STAR
    if (EXAM_TYPE == 'STAR') {
      list = list.filter(item => item.isMarked == true);
    }

    // MAX_QUESTION
    if (MAX_QUESTION != 'ALL') {
      list = list.splice(0, MAX_QUESTION);
    }

    // RAMDOM
    if (RAMDOM == 'RANDOM') {
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
    let to = self.count < TO_QUESTION ? self.count : parseInt(TO_QUESTION);
    let que = null;
    // let star_ques = self.markedQuestion.map(item => item.queNo);
    switch (EXAM_TYPE) {
      case 'STAR':
        self.markedQuestion.forEach(item => {
          que = self.listQuestions[item.queNo];
          que.options = QUESTION_OPTIONS;
          // if(star_ques.includes(item.queNo)) {
          //   que.options.userMarked = true;
          // }
          list2 = [...list2, que];
        });
        break;
      default:
        //Normal
        for (let i = from; i <= to; i++) {
          que = self.listQuestions[i - 1];
          que.options = QUESTION_OPTIONS;
          // if(star_ques.includes(i-1)) {
          //   que.options.userMarked = true;
          // }
          list2 = [...list2, que];
        }
    }

    // RAMDOM
    if (RAMDOM == 'RANDOM') {
      this.shuffleArray(list2);
    }

    // MAX_QUESTION
    if (MAX_QUESTION != 'ALL') {
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

  getFilterQuestion(type = 'STAR', from = 0, to = 20, random = 'RANDOM', max = 100) {
    //FILTER OPTIONS
    let listQuestion = this.filterQuestion({
      exam_type: type,
      from_question: from,
      to_question: to,
      max_question: max,
      random: random
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

    $('#modals').html(html);
    $('#exportModal').modal('show');
  }

  copyText(eleIndex = '#exportContent pre') {
    let copyText = JSON.stringify(this.listQuestions, null, 2);
    navigator.clipboard.writeText(copyText);
  }

  getComment(queNo = this.current) {
    let elementIndex = this.comments.findIndex(obj => obj.queNo == queNo);
    if (elementIndex == -1) {
      return '';
    } else {
      return this.comments[elementIndex].content;
    }
  }

  setComment(queNo, content) {
    let elementIndex = this.comments.findIndex(obj => obj.queNo == queNo);
    let newElement = {
      queNo: queNo,
      content: content
    };
    if (elementIndex == -1) {
      this.comments = [...this.comments, newElement];
    } else {
      this.comments[elementIndex] = newElement;
    }

    this.saveToLocalCache();

    return 'Success';
  }

  // Get all choices for all questions
  getAllChoices() {
    const allChoices = {};
    for (let i = 0; i < this.count; i++) {
      const choice = this.getChoice(i);
      if (choice && choice !== '') {
        allChoices[i] = choice;
      }
    }
    return allChoices;
  }

  // Auto-submit functionality
  startAutoSubmitTimer() {
    if (!this.autoSubmitEnabled || this.autoSubmitTimer) {
      return; // Timer already running or disabled
    }

    console.log('🔄 Starting auto-submit timer (30 seconds)');
    this.autoSubmitTimer = setTimeout(() => {
      this.handleAutoSubmit();
    }, this.autoSubmitInterval);

    this.updateAutoSubmitStatus();
  }

  stopAutoSubmitTimer() {
    if (this.autoSubmitTimer) {
      clearTimeout(this.autoSubmitTimer);
      this.autoSubmitTimer = null;
      console.log('⏹️ Auto-submit timer stopped');
      this.updateAutoSubmitStatus();
    }
  }

  async handleAutoSubmit() {
    // The previous timeout has just fired; clear the handle so we can schedule the next one
    // without being blocked by the guard in startAutoSubmitTimer
    this.autoSubmitTimer = null;
    this.updateAutoSubmitStatus && this.updateAutoSubmitStatus();
    if (!this.hasNewChoices) {
      console.log('📝 No new choices detected, skipping auto-submit');
      this.startAutoSubmitTimer(); // Restart timer
      return;
    }

    console.log('💾 Auto-submitting exam progress...');

    try {
      // Safety check for listQuestions
      if (!this.listQuestions || !Array.isArray(this.listQuestions)) {
        console.warn('⚠️ handleAutoSubmit: listQuestions is not available', this.listQuestions);
        this.startAutoSubmitTimer(); // Restart timer
        return;
      }

      // Calculate current score
      const totalPoints = this.calculateScore(this.listQuestions);
      const percentPoint = (totalPoints / this.count) * 100;

      // Save progress to database
      await this.saveProgressToDatabase(totalPoints, percentPoint);

      // Update last submitted choices
      this.lastSubmittedChoices = JSON.stringify(this.getAllChoices());
      this.hasNewChoices = false;

      console.log('✅ Auto-submit completed successfully');

      // Update status indicator
      this.updateAutoSubmitStatus();

      // Show notification to user
      this.showAutoSubmitNotification();
    } catch (error) {
      console.error('❌ Auto-submit failed:', error);
      this.showAutoSubmitNotification('error');
    }

    // Restart timer for next cycle
    this.startAutoSubmitTimer();
  }

  async saveProgressToDatabase(totalPoints, percentScore) {
    if (!window.databaseClient) {
      throw new Error('Database client not available');
    }

    const examData = {
      examId: this.examId || 'unknown',
      examName: this.examName || 'Unknown Exam',
      groupId: this.groupId || '',
      groupName: this.groupName || '',
      score: Math.round(percentScore),
      totalQuestions: this.count,
      correctAnswers: totalPoints,
      incorrectAnswers: this.count - totalPoints,
      unansweredQuestions: 0,
      timeTaken: 0,
      answersData: this.getAllChoices(),
      reviewMarks: this.getAllReviewMarks(),
      comments: this.getAllComments(),
      isAutoSubmitted: true // Flag to indicate this was auto-submitted
    };

    return await window.databaseClient.saveExamResult(examData);
  }

  showAutoSubmitNotification(type = 'success') {
    const message =
      type === 'success'
        ? '📝 Progress auto-saved successfully'
        : '❌ Auto-save failed - please save manually';

    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'info' : 'warning'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'save' : 'exclamation-triangle'}"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // Enable/disable auto-submit
  setAutoSubmitEnabled(enabled) {
    this.autoSubmitEnabled = enabled;
    if (!enabled) {
      this.stopAutoSubmitTimer();
    } else if (this.hasNewChoices) {
      this.startAutoSubmitTimer();
    }
    this.updateAutoSubmitStatus();
    console.log(`🔄 Auto-submit ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Enable/disable auto feedback for correct/incorrect answers
  setAutoFeedbackEnabled(enabled) {
    this.autoFeedbackEnabled = enabled;
    this.updateAutoFeedbackStatus();

    // Refresh visual feedback for all current answers
    this.updateVisualFeedbackForAllAnswers();

    console.log(`🎯 Auto feedback ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Get current auto feedback status
  isAutoFeedbackEnabled() {
    return this.autoFeedbackEnabled;
  }

  // Show correct/incorrect feedback for all answers (useful when auto feedback is disabled)
  showAllAnswerFeedback() {
    this.choices.forEach(choiceItem => {
      const queNo = choiceItem.queNo;
      const userChoice = choiceItem.choice;

      if (userChoice) {
        const isCorrect = this.checkAnswerCorrectness(queNo, userChoice);
        $(`#attempts-que li[data-queno="${queNo}"]`).removeClass('correct incorrect');
        if (isCorrect) {
          $(`#attempts-que li[data-queno="${queNo}"]`).addClass('correct');
        } else {
          $(`#attempts-que li[data-queno="${queNo}"]`).addClass('incorrect');
        }
      }
    });
  }

  // Hide correct/incorrect feedback for all answers
  hideAllAnswerFeedback() {
    this.choices.forEach(choiceItem => {
      const queNo = choiceItem.queNo;
      $(`#attempts-que li[data-queno="${queNo}"]`).removeClass('correct incorrect');
    });
  }

  // Update auto-submit status indicator in UI
  updateAutoSubmitStatus() {
    const statusElement = document.getElementById('auto-submit-status');
    const textElement = document.getElementById('auto-submit-text');

    if (!statusElement || !textElement) return;

    if (this.autoSubmitEnabled) {
      statusElement.style.display = 'block';
      if (this.autoSubmitTimer) {
        textElement.textContent = 'Auto-save active (30s)';
        textElement.className = 'text-success';
      } else if (this.hasNewChoices) {
        textElement.textContent = 'Auto-save pending...';
        textElement.className = 'text-warning';
      } else {
        textElement.textContent = 'Auto-save enabled';
        textElement.className = 'text-info';
      }
    } else {
      statusElement.style.display = 'none';
    }
  }

  // Update auto feedback status indicator in UI
  updateAutoFeedbackStatus() {
    const feedbackStatusElement = document.getElementById('auto-feedback-status');
    const feedbackTextElement = document.getElementById('auto-feedback-text');

    if (!feedbackStatusElement || !feedbackTextElement) return;

    if (this.autoFeedbackEnabled) {
      feedbackStatusElement.style.display = 'block';
      feedbackTextElement.textContent = 'Auto feedback enabled';
      feedbackTextElement.className = 'text-success';
    } else {
      feedbackStatusElement.style.display = 'block';
      feedbackTextElement.textContent = 'Auto feedback disabled';
      feedbackTextElement.className = 'text-muted';
    }
  }

  // Get all review marks for all questions
  getAllReviewMarks() {
    const allReviewMarks = {};
    for (let i = 0; i < this.count; i++) {
      const isMarked = this.getMarkToReview(i);
      if (isMarked) {
        allReviewMarks[i] = true;
      }
    }
    return allReviewMarks;
  }

  // Get all comments for all questions
  getAllComments() {
    const allComments = {};
    for (let i = 0; i < this.count; i++) {
      const comment = this.getComment(i);
      if (comment && comment !== '') {
        allComments[i] = comment;
      }
    }
    return allComments;
  }

  createTestHtml() {}
}

// Make classes available globally
window.Question = Question;
window.Exam = Exam;

// Notify that classes are loaded and ready
document.dispatchEvent(
  new CustomEvent('classesReady', {
    detail: {
      timestamp: new Date().toISOString()
    }
  })
);
