/**
 * TODO 4자리 /3자리 & 메뉴 변경 & 더치페이 추가
 * @type {*}
 */
var express = require('express');
var router = express.Router();
var mongoDB = require('../public/javascripts/database');
var model = require('../public/javascripts/userSchema');
var uri = 'mongodb://root:0000@ds046267.mlab.com:46267/chatbot';

/**
 * dbconnect
 * @type {*}
 */
var mongoose = require('mongoose');

// TODO -> multi user에 대한 처리 필요
var count;
var tempAry = [, , , ,];
var tempStr;
var strike;
var ball;
var out;
var difficulty;

// server쪽 난수 저장
var ranNum;

const keyboard_numSelectBtn = {
    "type": "buttons",
    "buttons": ["쉬움", "어려움", "매우 어려움"]
};

// TODO
const keyboard_startBtn = {
    "type": "buttons",
    "buttons": ["숫자 야구 게임", "더치 페이"]
};

const keyboard_text = {
    "type": "text"
};

const message_numHello = {
    "text": "숫자 야구 게임을 시작하겠습니다." + "\n" +
    "아래 버튼에서 원하시는 난이도를 선택해주세요" + "\n" +
    "쉬움은 3자리, 어려움은 4자리, 아주 어려움은 5자리 입니다. (찡긋)"
};

const messageBtn_homeLink = {
    "label": "자세한 규칙 확인하기",
    "url": "http://pf.kakao.com/_ZQpzC"
};
/* GET home page. */
router.get('/', function (req, res, next) {
    // console.log(mongoDB.getLogs());
    // res.render('index', {title: 'Express'});
    // mongoDB.getLogs("12345673").then(function (result) {
    //     res.send(result);
    // });
    checkMyScore("1234567").then(function (result) {
        res.send(result);
    });
    // console.log(checkMyScore("1234567"));
    // mongoDB.getLogs("1234567").then(function (results) {
    //     res.json(checkMyScore("1234567"));
    // });
    // mongoDB.save("1234567", "dmddd");
    // mongoDB.update("1234567", "ddddd");

    // mongoDB.delete("1234567").then(function(res){
    //     console.log(res)
    // });
    // mongoDB.getLogs("1234567").then(function(res){
    //     console.log(res)
    // })
});

// keyboard init
router.get('/keyboard', function (req, res) {
    res.json(keyboard_startBtn);
});

// autoreply imp
router.post('/message', function (req, res) {
    var selected = req.body.content;
    var userKey = req.body.user_key;
    var isNumber = false;

    tempStr = parseInt(selected.replace(/[^0-9]/g, ''));

    if (tempStr >= 0 && tempStr < 10000) {
        for (var i = 0; i < tempAry.length; i++) {
            tempAry[i] = Math.floor(tempStr / Math.pow(10, tempAry - 1 - i));
        }
        tempAry.sort();
        for (var i = 1; i < tempAry.length; i++) {
            // 같은 숫자 반복
            if (parseInt(tempAry[i]) == parseInt(tempAry[i - 1])) {
                break;
            }
            if (i == tempAry.length - 1) {
                isNumber = true;
            }
        }
    }


    // 숫자 입력이 아닌 경우
    if (!isNumber) {
        if (selected == "숫자 야구 게임") {
            mongoDB.delete(userKey);
            mongoDB.save(userKey, ["계속하기"]);
            res.json({
                "message": message_numHello,
                "keyboard": keyboard_numSelectBtn
            });
        }
        else if (selected == "더치 페이") {
            res.json({
                "message": "아직 완성되지 않은 기능이에요.. TT \n" +
                "조금만 기다려 주세용(찡긋)\n" +
                "처음으로 돌아갑니다!",
                "keyboard": keyboard_startBtn
            })
            //TODO
        }
        else if (selected == "처음으로 돌아가기" || selected == "처음으로") {
            res.json({
                "message": {
                    "text": "메뉴 선택 화면으로 돌아갑니다"
                },
                "keyboard": keyboard_startBtn
            })
        }
        else if (selected == "쉬움") {
            ranNum = makeRandomNumber(3);
            count = strike = ball = out = 0;
            difficulty = "easy";
            res.json({
                "message": {
                    "text": "3자리 야구게임을 시작하셨네요.\n" + message_gameRule,
                    "message_button": messageBtn_homeLink
                }
            })
        }
        else if (selected == "어려움") {
            ranNum = makeRandomNumber(4);
            count = strike = ball = out = 0;
            difficulty = "hard";
            res.json({
                "message": {
                    "text": "4자리 야구게임을 시작하셨네요.(놀람)\n" + message_gameRule,
                    "message_button": messageBtn_homeLink
                }
            })
        }
        else if (selected == "아주 어려움") {
            ranNum = makeRandomNumber(5);
            count = strike = ball = out = 0;
            difficulty = "hell";
            res.json({
                "message": {
                    "text": "5자리 야구게임을 시작하셨네요.(놀람)(놀람)\n" + message_gameRule,
                    "message_button": messageBtn_homeLink
                }
            })
        } else if (selected == "기록") {
            checkMyScore(userKey).then(function (results) {
                res.json({
                    "message": {
                        "text": "지금까지의 기록은 아래 버튼을 확인하세요\n" +
                        "확인하신 후 계속하기를 눌러주세요"
                    },
                    "keyboard": {
                        "type": "buttons",
                        "buttons": results
                    }
                })
            })
            // res.json({
            //     "message": {
            //         "text": "지금까지의 기록은 아래 버튼을 확인하세요\n" +
            //         "확인하신 후 계속하기를 눌러주세요"
            //     },
            //     "keyboard": {
            //         "type": "buttons",
            //         "buttons": checkMyScore(userKey)
            //     }
            // })
        } else if (selected == "계속하기") {
            res.json({
                "message": {
                    "text": "다음 숫자를 입력해주세요!"
                }
            })
        }

        // else if (selected == "숫자야구가 뭐죠?") {
        //     res.json({
        //         "message": {
        //             "text": "1. 쉬움은 3자리, 어려움은 4자리, 아주 어려움은 5자리 입니다. \n" +
        //             "2. 입력하시는 숫자는 0에서 9까지 서로 '다른' 숫자에요.\n" +
        //             "3. 숫자와 위치가 전부 맞으면 스트라이크!(굿).\n" +
        //             "4. 숫자는 맞지만 위치가 틀렸을 때는 볼(씨익)",
        //             "message_button": {
        //                 "label": "규칙 1도 모를땐 누르세요",
        //                 "url": "https://namu.wiki/w/%EC%88%AB%EC%9E%90%EC%95%BC%EA%B5%AC"
        //             }
        //         },
        //         "keyboard": keyboard_numSelectBtn
        //     })
        // }
        else {
            if (selected == "포기") {
                res.json({
                    "message": {
                        "text": "처음으로 돌아갑니다"
                    }
                })
            } else {
                res.json({
                    "message": {
                        "text": "잘못 입력하셨어요."
                    }
                })
            }
        }
    }
    // 숫자 입력
    else {
        if (difficulty == "easy") {
            var userAry = [, , ,];
            var aryLength = userAry.length;
            for (var i = 0; i < aryLength; i++) {
                userAry[i] = Math.floor(tempStr / Math.pow(10, aryLength - 1 - i));
                tempStr = (tempStr % Math.pow(10, aryLength - 1 - i));
            }
        }
        else if (difficulty == "hard") {
            var userAry = [, , , ,];
            var aryLength = userAry.length;
            for (var i = 0; i < userAry.length; i++) {
                userAry[i] = Math.floor(tempStr / Math.pow(10, aryLength - 1 - i));
                tempStr = (tempStr % Math.pow(10, aryLength - 1 - i));
            }
        }
        else if (difficulty == "hell") {
            var userAry = [, , , , ,];
            var aryLength = userAry.length;
            for (var i = 0; i < userAry.length; i++) {
                userAry[i] = Math.floor(tempStr / Math.pow(10, aryLength - 1 - i));
                tempStr = (tempStr % Math.pow(10, aryLength - 1 - i));
            }
        }
        strike = ball = out = 0;
        if (isDuplicate(userAry)) {
            res.json({
                "message": {
                    "text": "중복되는 수를 입력하면 안되는데...\n" +
                    "다시 한번만 입력해주세요 (제발)"
                }
            })
        }
        // strike / ball / out
        for (var i = 0; i < aryLength; i++) {
            if (ranNum.indexOf(userAry[i]) != -1) {
                if (ranNum[i] == userAry[i]) strike += 1;
                else ball += 1;
            }
            else out += 1;
        }
        count += 1;
        // 정답
        if (strike == aryLength) {
            mongoDB.delete(userKey);
            res.json({
                "message": {
                    "text": "(우와)" + "홈런입니다!! " + count + "번 만에 맞추셨네요"
                },
                "keyboard": {
                    "type": "buttons",
                    "buttons": ["처음으로 돌아가기"]
                }
            })
        }
        // 오답
        else {
            writeMyScore(userKey, userAry.replace(/,/g, '') + " " + "" + strike + "S " + ball + "B");
            res.json({
                "message": {
                    "text": // ranNum + " | " + userAry \n+
                    // "현재 " + count + "번째 도전!\n"
                    // + Strike + " :Strike\n"
                    // + Ball + " :Ball\n"
                    "" + strike + "S " + ball + "B"
                    // + out + "Out 입니다."
                }
            })
        }
    }

    isNumber = false;
    tempStr = 0;
    selected = "";
});

/**
 * isDuplicate
 *
 * Des
 * 배열 내에 중복된 수가 있는지에 대한 검사
 * @param inputArray
 * @returns 중복 시 true,
 *          아닐 시 false
 */
function isDuplicate(inputArray) {
    var tempAry;
    tempAry = inputArray.slice(inputArray.begin, inputArray.end);
    tempAry.sort();
    for (var i = 1; i < tempAry.length; i++) {
        if (parseInt(tempAry[i]) == parseInt(tempAry[i - 1])) {
            return true;
        }
        if (i == (tempAry.length - 1)) {
            return false;
        }
    }
}

/**
 * makeRandomNumber
 *
 * Des
 * getRandomIntInclusive를 이용해서 랜덤 수 배열 생성,
 * 동일한 수가 반복되는 경우 서로 다른 수의 배열이 나올 때 까지 recursive call
 * @param type
 *        3 or 4 or 5
 * @returns output
 *         (3 or 4 or 5) 길이의 3개의 서로 다른 숫자 배열
 */
function makeRandomNumber(type) {
    var temp;
    if (type == 4) var output = [, , , ,];
    else if (type == 3) var output = [, , ,];
    else var output = [, , , , ,];
    for (var i = 0; i < output.length; i++) {
        output[i] = getRandomIntInclusive(0, 9);
    }
    console.log("raw output : " + output);
    temp = output.slice(output.begin, output.end);
    temp.sort();
    console.log("why sorted : " + output);
    for (var i = 1; i < temp.length; i++) {
        // 같은 숫자 반복
        if (temp[i] == temp[i - 1]) {
            console.log("temp  " + i + "와 i-1 중복 발생: " + temp);
            return makeRandomNumber(temp.length);
        }
        if (i == (temp.length - 1)) return output;
    }
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 *  req의 user_key을 이용해서 DB의 해당 user 기록 retrieve
 */
function checkMyScore(user_key) {
    return new Promise(function(res){
        var userKey = user_key;
        mongoDB.getLogs(userKey).then(function (results) {
            res(results);
        })
    });
    // var userKey = user_key;
    // var tempAry = [];
    // var test = 1;
    // var test2 = mongoDB.getLogs(userKey).then(function (results) {
    //     tempAry = results;
    //     console.log("1:" + test);
    //     test = 2;
    //     console.log("2:"+test);
    //     return test;
    // });
    // console.log("3 :"+test);
    // console.log("test2 : "+test2)
    // // if (mongoDB.getLogs(userKey) != "error") {
    // //     tempAry = tempAry.concat(mongoDB.getLogs(userKey));
    // //     return tempAry;
    // // }
    // // else {
    // //     tempAry = tempAry.concat("현재 기록이 없으시네요(멘붕)");
    // //     return tempAry;
    // // }
    // return tempAry;
}

/**
 * req user_key 이용해서 DB에 해당 user의 기록 create
 * @type {string}
 */
function writeMyScore(userKey, data) {
    mongoDB.getLogs(userKey).then(function (results) {
        if (results == "not exist") {
            mongoDB.save(userKey, data);
        }
        else {
            mongoDB.update(userKey, data).then(function (results) {
                console.log("writeMyScore's results " + results);
            })
        }
    });
    // if (mongoDB.getLogs(userKey) == "not exist") {
    //     mongoDB.save(userKey, data);
    // }
    // else mongoDB.update(userKey, data);
}

/**
 *
 * @type {string}
 */
const message_gameRule = "'[게임설명]\n" +
    "- 숫자야구는 정한 난이도에 맞는 숫자조합을 맞추는 게임입니다.\n" +
    "- 숫자와 자리가 일치 시에는 1Strike 증가, 숫자만 일치하고 자리는 불일치시 1Ball증가합니다.\n\n" +
    "[주의 & 참고사항]\n" +
    "- 중복된 숫자조합은 불가능합니다.\n" +
    "- 이때까지 시도한 숫자와 결과를 보고 싶을 시 [기록]을 입력하시면 됩니다.\n" +
    "- 게임을 종료하고 싶을 시 [포기]를 입력하시면 됩니다.";

module.exports = router;
