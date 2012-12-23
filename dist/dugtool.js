// ==UserScript==
// @name	DugTool
// @namespace	https://github.com/silviu-burcea/DugTool
// @version	1.6.1
// @description	This is a useful tool for Dugout Online game
// @include	http://do*.dugout-online.com/*
// @require	http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js
// @require	http://ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js
// @copyright	2012, RaceSoft
// ==/UserScript==

// globals
var $head = $("head");
var $body = $("body");
var $leftDT = $("<div/>").attr("id", "leftDT").attr("class", "dugtool left");
var $rightDT = $("<div/>").attr("id", "rightDT").attr("class", "dugtool right");
var heightPos = "10px",
    widthPos = "10px",
    width = "200px";
var $style = $("<style/>");
// DOM
$body.append($leftDT);
$body.append($rightDT);
$body.append($style);
// Draggable
$(".dugtool").draggable();

// Style
$.get("https://raw.github.com/silviu-burcea/DugTool/v1.6.1/src/css/DugTool.css").done(function(res) {
    $style[0].innerHTML = res;
});

// Functions
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
        var $grid = $("<table></table>").attr("id", "plCount");
        var pos = ["GK", "DF", "MF", "FW"];
        $grid.append("<tr><th>Pos</th><th>Total</th><th>U18</th></tr>");
        for (i = 0; i < 4; i++) {
            $grid.append("<tr><td>" + pos[i] + "</td><td>" + counter.senior[i] + "</td><td>" + counter.junior[i] + "</td></tr>");
        }
        $rightDT.append("<div>Players count ( " + (counter.noPlayers >= 38 ? ("<span class='red'><b>" + counter.noPlayers + "</b></span>") : counter.noPlayers) + " )</div>");
        if (counter.averageAge !== 0) {
            $rightDT.append("<div>Average age : " + counter.averageAge + "</div>");
        }
        $rightDT.append($grid);
    } else {
        // TODO v1.7 no standard view, count only GK or DF or MF or FW
    }
};

var page = document.URL;
$rightDT.append("<div style='text-align:center;'><b>DugTool</b></div>");
if (page.match(/\/club\.php\?pg=players(&youth=[01])?&club_id=\d+/)) {
    playersCount();
}

// Left DT
$leftDT.append("<h3>Quick Links</h3>");
var $ul = $("<div/>").attr("id", "quickLinks");
$ul.append("<a href='https://github.com/silviu-burcea/DugTool'><div class='anchor'>DugTool page</div></a>");
$ul.append("<a href='/community.php?pg=forum&subpage=viewtopic&t=254714'><div class='anchor'>DugTool forum page</div></a>");
$ul.append("<a href='/management.php?pg=stadium&subpage=setticket'><div class='anchor'>Set ticket price</div></a>");
$ul.append("<a href='/management.php?pg=sponsors'><div class='anchor'>Sponsors</div></a>");
$ul.append("<a href='/management.php?pg=calendar'><div class='anchor'>Calendar</div></a>");
$leftDT.append($ul);