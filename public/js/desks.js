// SHOW LIST EXAM
var examListHtml = "";
var examGroupHtml = "";

listExamGroup.filter((g) => g.active).forEach(function (item) {
  examGroupHtml += `<option value="${item.id}">${item.name}</option>`
});

$("#groupList").html(examGroupHtml);

function getExamId(key = "exam") {
  let searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has(key)) {
    let examId = searchParams.get(key);
    return examId;
  }
  return null;
}

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
