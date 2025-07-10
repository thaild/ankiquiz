function getTuvung(html) {
    $("#tempHtmlComment").html(html);
    let txtTuvung,tuvung,cachdoc;

    // get cachdoc raw
    txtTuvung = $("#tempHtmlComment .boxtv > .tuvung b").text();

    // get tuvung
    $("#tempHtmlComment .boxtv rp").remove();
    $("#tempHtmlComment .boxtv rt").remove();
    tuvung = $("#tempHtmlComment .boxtv > .tuvung b").text();
    let hantu = $("#tempHtmlComment .boxtv > .tuvung b ruby").text();

    cachdoc = txtTuvung.replaceAll('（', "");
    cachdoc = cachdoc.replaceAll('）', "");
    hantu.split("").forEach(item => {
        cachdoc = cachdoc.replaceAll(item, "");
    });

    return {
        tuvung: tuvung.trim(),
        cachdoc: cachdoc.trim()
    }
}

$("#btn-submit-json").on("click", function () {
    // Button clicked
    $("#csv-result").text("");
    var htmlRaw = $("#html-source").val();
    $("#tempHtml").html(htmlRaw);
    var boxtvs =  $("#tempHtml .boxtv");
    var list = [];
    boxtvs.each((index, boxtv) => {
        $("#tempHtmlComment").html(boxtv);
        $("#tempHtmlComment .vidubox").remove();

        let hanviet = $("#tempHtmlComment .boxtv > .hanviet").text() + $("#tempHtmlComment .boxtv > .hanviet1").text() + $("#tempHtmlComment .boxtv > .hanviet2").text();
        let nghia = $("#tempHtmlComment .boxtv > .nghia").text() + $("#tempHtmlComment .boxtv > .nghia1").text() + $("#tempHtmlComment .boxtv > .nghia2").text();
        let tuvung_cachdoc = getTuvung(boxtv);
        list = [...list, {
            "tuvung": tuvung_cachdoc.tuvung,
            "cachdoc": tuvung_cachdoc.cachdoc,
            "hanviet": hanviet.trim(),
            "nghia": nghia.trim(),
        }];
    });

    let result = "";
    list.forEach((words) => {
        result +=`${words.tuvung} (${words.cachdoc}) (${words.hanviet.toUpperCase()}): ${words.nghia}\n`;
    });
    $("#csv-result").html(result);
});
