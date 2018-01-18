/**
 * TODO 4자리 /3자리 & 메뉴 변경 & 더치페이 추가
 * @type {*}
 */
var express = require('express');
var router = express.Router();

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
    "buttons": ["쉬움", "어려움", "숫자야구가 뭐죠?"]
};

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
    "쉬움은 3자리, 어려움은 4자립니다 (찡긋)"
};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

// keyboard init
router.get('/keyboard', function (req, res) {
    res.json(keyboard_startBtn);
});

// autoreply imp
router.post('/message', function (req, res) {
    var selected = req.body.content;
    var isNumber = false;

    tempStr = parseInt(selected.replace(/[^0-9]/g, ''));

    if (tempStr >= 0 && tempStr < 10000) {
        // tempstr = 4자리 숫자 string
        for (var i = 0; i < tempAry.length; i++) {
            tempAry[i] = Math.floor(tempStr / Math.pow(10, 3 - i));
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
            res.json({
                "message": message_numHello,
                "keyboard": keyboard_numSelectBtn
            });
        }
        else if (selected == "더치 페이") {
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
                    "text": "3자리 야구게임을 시작하셨네요.\n" +
                    "숫자를 입력해주세요!"
                },
                "keyboard": keyboard_text
            })
        }
        else if (selected == "어려움") {
            ranNum = makeRandomNumber(4);
            count = strike = ball = out = 0;
            difficulty = "hard";
            res.json({
                "message": {
                    "text": "4자리 야구게임을 시작하셨네요.(놀람)\n" +
                    "숫자를 입력해주세요!"
                },
                "keyboard": keyboard_text
            })
        }
        else if (selected == "숫자야구가 뭐죠??") {
            res.json({
                "message": {
                    "text": "1. 아래 난이도를 선택해 주세요. 쉬움은 3자리, 어려움은 4자리 숫자입니다. \n" +
                    "2. 입력하시는 숫자는 0에서 9까지 서로 '다른' 숫자에요.\n" +
                    "3. 숫자와 위치가 전부 맞으면 스트라이크!(굿).\n" +
                    "4. 숫자는 맞지만 위치가 틀렸을 때는 볼(씨익)",
                    "message_button": {
                        "label": "규칙 1도 모를땐 누르세요",
                        "url": "https://namu.wiki/w/%EC%88%AB%EC%9E%90%EC%95%BC%EA%B5%AC"
                    }
                },
                "keyboard": keyboard_numSelectBtn
            })
        }
        else {
            if (selected == "포기하기") {
                /**
                 * 포기해도 그냥 ranNum 지우게
                 */
                ranNum = makeRandomNumber();
                res.json({
                    "message": {
                        "text": "처음으로 돌아갑니다"
                    },
                    "keyboard": keyboard_text
                })
            } else {
                res.json({
                    "message": {
                        "text": "잘못 입력하셨어요."
                    },
                    "keyboard": keyboard_btn
                })
            }
        }
    }
    // 숫자 입력
    else {
        if (difficulty == "easy"){
            var userAry = [, , ,];
            for (var i = 0; i < userAry.length; i++) {
                userAry[i] = Math.floor(tempStr / Math.pow(10, 2 - i));
                tempStr = (tempStr % Math.pow(10, 2 - i));
            }
        }
        else if (difficulty == "hard"){
            var userAry = [, , , ,];
            for (var i = 0; i < userAry.length; i++) {
                userAry[i] = Math.floor(tempStr / Math.pow(10, 3 - i));
                tempStr = (tempStr % Math.pow(10, 3 - i));
            }
        }
        strike = ball = out = 0;
        if (isDuplicate(userAry)) {
            res.json({
                "message": {
                    "text": "중복되는 수를 입력하면 안되는데...\n"+
                        "다시 한번만 입력해주세요 (제발)"
                },
                "keyboard": keyboard_text
            })
        }
        // strike / ball / out
        for (var i = 0; i < userAry.length; i++) {
            if (ranNum.indexOf(userAry[i]) != -1) {
                if (ranNum[i] == userAry[i]) strike += 1;
                else ball += 1;
            }
            else out += 1;
        }
        count += 1;
        // 정답
        if (strike == userAry.length) {
            res.json({
                "message": {
                    "text": "(우와)" + "정답입니다!! " + ranNum + " \n총 " + count + "번 만에 맞추셨네요"
                },
                "keyboard": {
                    "type": "buttons",
                    "buttons": ["처음으로 돌아가기", "자랑하기"]
                }
            })
        }
        // 오답
        else {
            res.json({
                "message": {
                    "text": // ranNum + " | " + userAry \n+
                    "현재 " + count + "번째 도전!\n"
                    + strike + " :Strike\n"
                    + ball + ": Ball\n"
                    // + out + "Out 입니다."
                },
                "keyboard": keyboard_text
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
 *        (3 or 4) 둘 중 하나의 랜덤 배열
 * @returns output
 *          4개의 서로 다른 숫자 배열
 */
function makeRandomNumber(type) {
    var temp;
    if (type == 4) var output = [, , , ,];
    else if (type == 3) var output = [, , ,];
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
            return makeRandomNumber();
        }
        if (i == (temp.length - 1)) return output;
    }
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;
