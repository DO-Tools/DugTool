// ==UserScript==
// @name	DugTool
// @namespace	https://github.com/silviu-burcea/DugTool
// @version	1.7.1
// @author	Silviu Burcea
// @description	This is a useful tool for Dugout Online game
// @include	http://do*.dugout-online.com/*
// @require	http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require	http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js
// @resource	styleMain https://raw.github.com/silviu-burcea/DugTool/master/src/css/DugTool.css
// @copyright	2013, RaceSoft
// ==/UserScript==

// Helper functions
var formatNumber = function(nr) {
    var result = '';
    nr = nr.toString();
    while (nr.length > 3) {
        result = '.' + nr.substring(nr.length - 3) + result;
        nr = nr.slice(0, - 3);
    }
    return nr + result;
};

// globals
var $head = $("head");
var $body = $("body");
var $leftDT = $("<div/>").attr("id", "leftDT").attr("class", "dugtool left");
var $rightDT = $("<div/>").attr("id", "rightDT").attr("class", "dugtool right");
var heightPos = "10px";
var widthPos = "10px";
var width = "200px";
var $style = $("<style/>");
// DOM
$body.append($leftDT);
$body.append($rightDT);
$body.append($style);
// Draggable
$(".dugtool").draggable();

// Style
var styleMainSource = GM_getResourceText("styleMain");
$style.eq(0).html(styleMainSource);

// DugTool Functions
var clubDetails = function() {
    // TDs with values(without labels)
    var $clubDetTr = $('.forumline').last().children("tbody").children("tr").children("td").first().find("table").first().find("table tr").filter(function() {
        return $(this).children('td').size() == 3;
    }).find("td:eq(1)");
    var club = {};
    club.fullname = $clubDetTr.eq(0).text().trim();
    club.shortname = $clubDetTr.eq(1).text().trim();
    var stadium = $clubDetTr.eq(2).text().match(/(.+)\((\d+)\/(\d+)\)/);
    club.stadium = {
        name: stadium[1].trim(),
        total: +stadium[2],
        available: +stadium[3]
    };
    club.rating = +$clubDetTr.eq(3).text().trim();
    club.manager = {
        username: $clubDetTr.eq(4).text().trim(),
        id: $clubDetTr.eq(4).find("a").attr("href").match(/toid=(\d+)/)[1]
    };
    club.id = +$clubDetTr.eq(8).text().match(/\d+/)[0];
    var views = $clubDetTr.eq(9).text().match(/\*+/);
    club.views = !! views ? 0 : +$clubDetTr.eq(9).text().match(/\d+/)[0];
    club.viewsRank = !! views ? 0 : +$clubDetTr.eq(10).text().match(/\d+/)[0];
    console.log(club);
    // TODO v1.8 debug remove it and add sharing button
};

var matchLinking = function() {
    // livetext
    var $events = $("img").filter(function() {
        return $(this).attr("src").match(/(sodnikkonec|komentator)\.gif/);
    }).parent().next().children("table").children("tbody").children("tr");
    // add some classes and create target anchors
    var matchCls = "matchevent",
        goalCls = "goal",
        ycCls = "yellowcard",
        rcCls = "redcard";
    $events.filter(function() {
        return $(this).find('img').attr('src').match(/icon-(goal|yellowcard|redcard)\.gif/);
    }).each(function() {
        var evtType = $(this).find('img').attr('src').match(/icon-(goal|yellowcard|redcard)\.gif/)[1];
        $(this).addClass(matchCls).addClass(evtType);
        var scrollData = $(this).attr('class').replace(matchCls, "").replace("min-", "").replace(/\s*/g, "");
        scrollData += 1 + (+$(this).find("img").parent().next().text().match(/\[(\d+)/)[1]);
        var anc = $("<a></a>").attr("name", scrollData);
        $(this).children("td").prepend(anc);
    });
    // home and away
    var $highlights = $("table").filter(function() {
        return $(this).parent().attr("background") && $(this).parent().attr("background").match(/events-tile/);
    }).find("tr img");
    // create trigger anchors
    $highlights.each(function() {
        var min = $(this).parent().next().text().match(/\((\d+)/)[1];
        var evt = $(this).attr("src").match(/icon-(.+)\.gif/)[1];
        var anc = $("<a></a>").attr("href", "#" + evt + min);
        $(this).wrap(anc);
    });
    // scroll to top
    $("span.dotmenu").append("<a name='top'></a>");
    $("body").append("<a id='scrollToTop' class='anchor rounded' href='#top'>Scroll to top</a>");
};

var budgetEstimator = function() {
    var $budgetTR = $(".frmredtxt").parent().next().find("table").not(".forumline").find("tr");
    // 2nd column
    var budgetEntries = $budgetTR.find("td:eq(1)").map(function() {
        return +$(this).text().replace(/[,.]/g, "").match(/-?\d+/)[0];
    });
    // 3rd column, collect just current players and staff wages/week
    var expensesWeek = $budgetTR.find("td:eq(2)").map(function() {
        return +($(this).text().match(/\d+/g) || ["0"]).join("");
    }).splice(1, 2);
    // total wages/week
    expensesWeek = expensesWeek[0] + expensesWeek[1];
    // total wages paid this season
    var expensesTotal = -budgetEntries[1] - budgetEntries[2];
    // estimated week
    var currentWeek = Math.round(expensesTotal / expensesWeek);
    var weeksToPay = 20 - currentWeek;
    // tickets, maintenance & miscellaneous
    expensesWeek -= (budgetEntries[4] + budgetEntries[8] + budgetEntries[9]) / currentWeek;
    // 4% weekly sponsorship
    expensesWeek -= budgetEntries[6] / (1 + currentWeek * 0.04) * 0.04;
    var finalMoney = budgetEntries[10] - Math.round(expensesWeek) * weeksToPay;
    var $tr = $("<tr></tr>");
    $tr.append("<td class='fintbr'>Final Money:</td><td class='fintbr'>" + formatNumber(finalMoney) + " £</td><td class='fintbl'>(Powered by DugTool)</td>");
    $tr.find("td").css("background-color", "#53714D").css("font-weight", "bold").css("color", "#ffffff");
    $budgetTR.parent().append($tr);
};

var playersCount = function() {
    var i, j, $squad;
    $squad = $(".group").next(".forumline");
    // [ GKs, DFs, MFs, FWs ]
    if ($squad.length !== 0) { // standard view
        var counter = {
            "senior": [0, 0, 0, 0], // GK DF MF FW
            "junior": [0, 0, 0, 0],
            "totalAge": 0,
            "noPlayers": 0,
            "averageAge": 0
        };
        var filterFn = function() {
            return $(this).find(".row1").length !== 0;
        };
        for (i = 0; i < $squad.length; i++) {
            // select group
            var group = $squad.eq(i).find("tr").not(":first").filter(filterFn);
            counter.senior[i] = group.length;
            counter.noPlayers += group.length;
            for (j = 0; j < group.length; j++) {
                var yrs = +group.eq(j).find(".row1").eq(2).find(".tableText").text();
                if ( !! yrs) {
                    if (yrs <= 18) { // yrs is a number and is lower than 19
                        ++counter.junior[i];
                    }
                    counter.totalAge += yrs;
                }
            }
        }
        counter.averageAge = (counter.noPlayers !== 0) ? (counter.totalAge / counter.noPlayers).toFixed(2) : 0;
        var $grid = $("<table></table>").attr("id", "plCount").addClass("dugtooltable");
        var pos = ["GK", "DF", "MF", "FW"];
        $grid.append("<tr><th>Pos</th><th>Total</th><th>U18</th></tr>");
        for (i = 0; i < 4; i++) {
            $grid.append("<tr class='center " + (i % 2 === 0 ? "even" : "odd") + "'><td>" + pos[i] + "</td><td>" + counter.senior[i] + "</td><td>" + counter.junior[i] + "</td></tr>");
        }
        $rightDT.append("<div class='center'>Players count ( " + (counter.noPlayers >= 38 ? ("<span class='red'><b>" + counter.noPlayers + "</b></span>") : counter.noPlayers) + " )</div>");
        if (counter.averageAge !== 0) {
            $rightDT.append("<div class='center'>Average age : " + counter.averageAge + "</div>");
        }
        $rightDT.append($grid);
    } else {
        // TODO v1.8 no standard view, count only GK or DF or MF or FW
    }
};

var playerDetails = function() {
    // this is a tr
    var $player = $(".row4").parent().prev().children("td").children("table").children("tbody").children("tr").eq(1);
    var $nameId = $(".dataHeader1_profile > b").text();
    $nameId = ( !! $nameId) ? $nameId.trim() : undefined;
    $nameId = ( !! $nameId) ? $nameId.match(/^(.+)\s*-\s*\(ID\s*(\d+)\)$/) : undefined;
    var $ageCountry = $(".dataText_profile");
    var $skills = $player.find(".plnum, .plnumd").map(function() {
        return +this.innerHTML;
    }).splice(0, 21);
    var $plDetTables = $player.find("td").filter(function() {
        return $(this).children("table").size() == 4;
    }).find("table");
    var $contractValue = $plDetTables.eq(2).find("tr").slice(-2).find("td:eq(1)").map(function() {
        return parseInt($(this).text().replace(/[,.]/g, ""), 10) || 0;
    });
    var plDetails = {};
    plDetails.fullname = ( !! $nameId) ? $nameId[1].trim() : undefined;
    plDetails.id = ( !! $nameId) ? $nameId[2] : undefined;
    plDetails.age = +$ageCountry.eq(0).text().match(/\d+/)[0];
    plDetails.country = $ageCountry.eq(1).find("img").attr('src').match(/\/flags_small\/(\w+)\.gif/)[1].toUpperCase();
    plDetails.xp = +$("img").filter(function() {
        return this.src.match(/showbar\.php/);
    }).attr('src').match(/barValue=(\d+)/)[1];
    plDetails.skills = $skills;
    plDetails.salary = $contractValue[0];
    plDetails.estValue = $contractValue[1];
    var $positions = $('img').filter(function() {
        return $(this).attr('src').match(/showpos/);
    }).attr("src").match(/\d/g);
    plDetails.positions = $positions.map(function(el) {
        return +el;
    });
    plDetails.captain = ($skills[8] * 4 + $skills[14] * 2 + $skills[9]) / 14 + plDetails.xp / 40;
    plDetails.OPS = [{
        position: "GK",
        skill: $skills[0] + $skills[3] + $skills[6] + $skills[9] + $skills[5]
    }, {
        position: "DL/R",
        skill: $skills[15] + $skills[19] + $skills[4] + $skills[9] + $skills[5]
    }, {
        position: "DC",
        skill: $skills[15] + $skills[19] + $skills[16] + $skills[9] + $skills[5]
    }, {
        position: "DMC",
        skill: $skills[18] + $skills[2] + $skills[15] + $skills[19] + $skills[5]
    }, {
        position: "ML/R",
        skill: $skills[18] + $skills[2] + $skills[10] + $skills[4] + $skills[5]
    }, {
        position: "MC",
        skill: $skills[18] + $skills[2] + $skills[10] + $skills[13] + $skills[5]
    }, {
        position: "AM",
        skill: $skills[18] + $skills[2] + $skills[13] + $skills[1] + $skills[7]
    }, {
        position: "FL/R",
        skill: $skills[1] + $skills[7] + $skills[10] + $skills[4] + $skills[5]
    }, {
        position: "FC",
        skill: $skills[1] + $skills[7] + $skills[10] + $skills[16] + $skills[5]
    }];
    var i, $tableOPS = $("<table></table>").attr("id", "opsTable").addClass("dugtooltable");
    $tableOPS.append("<tr><th>Pos</th><th>OPS</th></tr>");
    var $row;
    for (i = 0; i < plDetails.OPS.length; i++) {
        $row = $("<tr></tr>").addClass(i % 2 === 0 ? "even" : "odd").addClass("center");
        $row.html("<td>" + plDetails.OPS[i].position + "</td><td>" + plDetails.OPS[i].skill + "</td>");
        $tableOPS.append($row);
    }
    $rightDT.append($tableOPS);
    $rightDT.append("<div class='center'>Captain : " + plDetails.captain.toFixed(1) + "</div>");
    $rightDT.append("<div class='center'>Experience : " + plDetails.xp + "</div>");
};

var transferValue = function() {
    var $cell = $('.doformslong').parent();
    var max = +$cell.prev().text().match(/[0-9.,]+/).join("").replace(/[,.]/g, "");
    $("<a></a>").addClass("anchor rounded").text("Set max value").on("click", function() {
        $cell.find("input").val(max);
    }).appendTo($cell);
};

var transferGraph = function() {
    var isIn = true;
    var $transferRows = $($(".forumline table tr").splice(1));
    // eliminate title
    var playersBought = 0,
        playersSold = 0,
        budgetReceived = 0,
        budgetSpent = 0;
    $transferRows.each(function() {
        var $row = $(this);
        var $tds = $row.find("td");
        if ($tds.length == 1) {
            isIn = false;
        } else if ($tds.length == 5) {
            // transfer here
            var sum = $tds.eq(4).text().match(/[0-9.,]/g) || [0];
            sum = +sum.join("").replace(/[,.]/g, "");
            if (isIn) {
                ++playersBought;
                budgetSpent += sum;
            } else {
                ++playersSold;
                budgetReceived += sum;
            }
        } else {
            // Do nothing
        }
    });
    var inRatio = 100 * budgetReceived / (budgetReceived + budgetSpent);
    var outRatio = 100 - inRatio;
    var width = 250,
        height = 100;
    var url = "https://chart.googleapis.com/chart?cht=p3&chs=" + width + "x" + height + "&chd=t:" + inRatio + "," + outRatio + "&chl=Received|Spent";
    var $img = $("<img id='budgetGraph' />").attr("src", url);
    inRatio = 100 * playersSold / (playersSold + playersBought);
    outRatio = 100 - inRatio;
    url = "https://chart.googleapis.com/chart?cht=p3&chs=" + width + "x" + height + "&chd=t:" + inRatio + "," + outRatio + "&chl=OUT|IN";
    var $img2 = $("<img id='playersGraph' />").attr('src', url);
    var $transferGrid = $("<table></table>").attr("id", "transferTable").addClass("dugtooltable");
    $transferGrid.append("<tr><th>Counter</th><th>Value</th></tr>");
    $transferGrid.append("<tr class='odd'><td>Players In</td><td class='center'>" + formatNumber(playersBought) + "</td></tr>");
    $transferGrid.append("<tr class='even'><td>Money spent</td><td class='center'>" + formatNumber(budgetSpent) + " £</td></tr>");
    $transferGrid.append("<tr class='odd'><td>Money spent / player </td><td class='center'>" + formatNumber(parseInt(budgetSpent / playersBought, 10)) + " £</td></tr>");
    $transferGrid.append("<tr class='even'><td>Players Out</td><td class='center'>" + formatNumber(playersSold) + "</td></tr>");
    $transferGrid.append("<tr class='odd'><td>Money received</td><td class='center'>" + formatNumber(budgetReceived) + " £</td></tr>");
    $transferGrid.append("<tr class='even'><td>Money received / player </td><td class='center'>" + formatNumber(parseInt(budgetReceived / playersSold, 10)) + " £</td></tr>");
    $rightDT.css("width", width + "px");
    $rightDT.append($transferGrid);
    $rightDT.append($img);
    $rightDT.append($img2);
    $rightDT.append("<div class='center'>Powered by DugTool</div>");
};

var page = document.URL;
$rightDT.append("<div class='center'><b>DugTool</b></div>");
if (page.match(/club\.php\?pg=clubinfo(&club_id=\d+)?$/)) {
    clubDetails();
    $rightDT.hide();
} else if (page.match(/club\.php\?pg=players(&youth=[01])?&club_id=\d+/)) {
    playersCount();
} else if (page.match(/club\.php\?pg=players&subpage=pldetails/)) {
    playerDetails();
} else if (page.match(/matches.php\?pg=livetext/)) {
    matchLinking();
    $rightDT.hide();
} else if (page.match(/management\.php\?pg=finances/)) {
    budgetEstimator();
    $rightDT.hide();
} else if (page.match(/club\.php\?pg=players&subpage=settransfer/)) {
    transferValue();
    $rightDT.hide();
} else if (page.match(/club\.php\?pg=clubinfo&subpage=transfers/)) {
    transferGraph();
} else {
    $rightDT.hide();
}

// Left DT
$leftDT.append("<h3 class='center'>Quick Links</h3>");
var $ul = $("<div/>").attr("id", "quickLinks");
$ul.append("<a href='https://github.com/silviu-burcea/DugTool'><div class='anchor'>DugTool GitHub page</div></a>");
$ul.append("<a href='/community.php?pg=forum&subpage=viewtopic&t=254714'><div class='anchor'>DugTool forum page</div></a>");
$ul.append("<a href='/management.php?pg=stadium&subpage=setticket'><div class='anchor'>Set ticket price</div></a>");
$ul.append("<a href='/management.php?pg=sponsors'><div class='anchor'>Sponsors</div></a>");
$ul.append("<a href='/management.php?pg=calendar'><div class='anchor'>Calendar</div></a>");
$leftDT.append($ul);