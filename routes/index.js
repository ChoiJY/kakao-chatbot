var express = require('express');
var router = express.Router();

// TODO -> multi user에 대한 처리 필요
var count;
var tempAry = [, , , ,];
var tempStr;
var strike;
var ball;
var out;
// server쪽 난수 저장
var ranNum;

const keyboard_btn = {
    "type": "buttons",
    "buttons": ["숫자 입력", "포기하기", "도움말"]
};

const keyboard_text = {
    "type": "text"
};

const message_hello = {
    "text": "안녕하세요 4자리 숫자 야구 게임을 시작하겠습니다."
};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

// keyboard init
router.get('/keyboard', function (req, res) {
    res.json(keyboard_text);
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
            if (parseInt(tempAry[i]) - parseInt(tempAry[i - 1]) == 0) {
                break;
            }
            if (i == tempAry.length - 1) {
                isNumber = true;
            }
        }
    }

    // 숫자 입력이 아닌 경우
    if (!isNumber) {
        if (selected == "나 숫자야구 게임 할래") {
            ranNum = makeRandomNumber();
            count = 0;
            strike = 0;
            ball = 0;
            out = 0;
            res.json({
                "message": message_hello,
                "keyboard": keyboard_btn
            });
        }
        else if (selected == "처음으로 돌아가기" || selected == "처음으로") {
            res.json({
                "message": {
                    "text": "처음으로 돌아갑니다"
                },
                "keyboard": keyboard_text
            })
        }
        else if (selected == "숫자 입력") {
            res.json({
                "message": {
                    "text": "숫자를 입력해주세요"
                },
                "keyboard": keyboard_text
            })
        }
        else if (selected == "도움말") {
            // wiki 백과 연결
            res.json({
                "message": {
                    "text": "도움말은 아래의 링크를 참조해주세요",
                    "message_button": {
                        "label": "규칙 보러 가기",
                        "url": "https://namu.wiki/w/%EC%88%AB%EC%9E%90%EC%95%BC%EA%B5%AC"
                    }
                },
                "keyboard": keyboard_btn
            })
        }
        else {
            if (selected == "포기하기") {
                // 생성된 random 지우고, 초기 flow로 타게
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
                        "text": "잘못 입력하셨어요. 아래의 메뉴를 선택해주세요"
                    },
                    "keyboard": keyboard_btn
                })
            }
        }
    }
    // 숫자 입력
    else {
        var userAry = [, , , ,];
        // 입력 숫자
        strike = 0;
        ball = 0;
        out = 0;
        for (var i = 0; i < 4; i++) {
            userAry[i] = Math.floor(tempStr / Math.pow(10, 3 - i));
            tempStr = (tempStr % Math.pow(10, 3 - i));
        }
        if(isDuplicate(userAry)){
            res.json({
                "message": {
                    "text": "중복된 수를 입력하셨어요. 아래의 메뉴를 선택해주세요"
                },
                "keyboard": keyboard_btn
            })
        }
        for (var i = 0; i < 4; i++) {
            // strike / ball
            if (ranNum.indexOf(userAry[i]) != -1) {
                if (ranNum[i] == userAry[i]) strike += 1;
                else ball += 1;
            }
            else out += 1;
        }
        count += 1;
        if (strike == 4) {
            res.json({
                "message": {
                    "text": "(우와)"+"정답입니다!! " + ranNum + " \n총 " + count + "번 만에 맞추셨네요"
                },
                "keyboard": {
                    "type": "buttons",
                    "buttons": ["처음으로 돌아가기", "자랑하기"]
                }
            })
        }
        else {
            /**
             * out / ranNum / userAry 빼야함
             */
            res.json({
                "message": {
                    "text":
                    // ranNum + " | " + userAry \n+
                    "현재 점수는, " + count + "회 도전\n"
                    + strike + " :Strike\n"
                    + ball + ":Ball\n"
                    // + out + "Out 입니다."
                },
                "keyboard": keyboard_btn
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
 * @returns output
 *          4개의 서로 다른 숫자 배열
 */
function makeRandomNumber() {
    var temp;
    var output = [, , , ,];
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
