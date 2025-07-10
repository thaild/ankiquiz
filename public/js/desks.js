// Global utility functions
var setSearchParam = function(key, value) {
  if (!window.history.pushState) {
      return;
  }

  if (!key) {
      return;
  }

  var url = new URL(window.location.href);
  var params = new window.URLSearchParams(window.location.search);
  if (value === undefined || value === null) {
      params.delete(key);
  } else {
      params.set(key, value);
  }

  url.search = params;
  url = url.toString();
  window.history.replaceState({url: url}, null, url);
}

function getExamId(key = "exam") {
  let searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has(key)) {
    let examId = searchParams.get(key);
    return examId;
  }
  return null;
}

// SHOW LIST EXAM
var examListHtml = "";
var examGroupHtml = "";
var examGroupsInitialized = false;

// Function to initialize the exam group list
function initializeExamGroups() {
  if (examGroupsInitialized) {
    return; // Already initialized
  }
  
  if (typeof window.listExamGroup !== 'undefined' && window.listExamGroup && window.listExamGroup.length > 0) {
    window.listExamGroup.filter((g) => g.active).forEach(function (item) {
      examGroupHtml += `<option value="${item.id}">${item.name}</option>`
    });
    
    $("#groupList").html(examGroupHtml);
    examGroupsInitialized = true;
  } else {
    // If listExamGroup is not available yet, retry after a short delay
    setTimeout(initializeExamGroups, 100);
  }
}

// Listen for listExamGroup ready event
document.addEventListener('listExamGroupReady', function(event) {
  setTimeout(initializeExamGroups, 50);
});

// Listen for exam data loaded event
document.addEventListener('examDataLoaded', function(event) {
  setTimeout(initializeExamGroups, 100); // Small delay to ensure index.js is processed
});

// Listen for application ready event
document.addEventListener('applicationReady', function(event) {
  setTimeout(initializeExamGroups, 150);
});

// Start initialization immediately (fallback)
setTimeout(initializeExamGroups, 300);
