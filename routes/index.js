var express = require('express');
var router = express.Router();

// 일단 테스트니깐 multiuser x
var count = 0;
var isNumber = false;
// user 사용
var tempAry = [, , ,];
var tempStr;
var strike;
var ball;
var out;
//server 보관
var ranNum = [, , ,];

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
        // 입력 문자열에 숫자가 포함이면 숫자라고 전제
        // "31안녕42 313145" 같은 경우 3142313145로 가정
        tempStr = parseInt(selected.replace(/[^0-9]/g, ''));
        if (tempStr >= 0 && tempStr < 10000) {
            // tempstr = 4자리 숫자 string
            for (var i = 0; i < tempAry.length; i++) {
                tempAry[i] = Math.floor(tempStr / Math.pow(10, 3 - i));
            }
            tempAry.sort();
            for (var i = 1; i < tempAry.length; i++) {
                // 같은 숫자 반복
                if (tempAry[i] - tempAry[i - 1] == 0) {
                    break;
                }
                if (i == tempAry.length - 1) {
                    isNumber = true;
                }
            }
        }

        // 숫자입력 아님
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
                    res.json({
                        "message": {
                            "text": "처음으로 돌아갑니다"
                        },
                        "keyboard": keyboard_text
                    })
                } else {
                    res.json({
                        "message": {
                            "text": "잘못 입력하셨어요"
                        },
                        "keyboard": keyboard_text
                    })
                }
            }
        }
        // 숫자 입력
        else {
            var userAry = [, , ,];
            // 입력 숫자
            for (var i = 0; i < 4; i++) {
                userAry[i] = Math.floor(tempStr / Math.pow(10, 4 - i));
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
                        "text": "정답입니다!! 총 " + count + "번 만에 맞추셨네요"
                    },
                    "keyboard": {
                        "type": "buttons",
                        "buttons": ["처음으로 돌아가기", "자랑하기"]
                    }
                })
            }
            else {
                res.json({
                    "message": {
                        "text": "숫자를 입력해주세요"
                    },
                    "keyboard": keyboard_btn
                })
            }
        }

        isNumber = false;
        tempStr = 0;

    }
);

function makeRandomNumber() {
    var temp;
    var output = [, , ,];
    for (var i = 0; i < output.length; i++) {
        output[i] = getRandomIntInclusive(0, 9);
    }
    temp = output;
    temp.sort();
    for (var i = 1; i < temp.length; i++) {
        // 같은 숫자 반복
        if (temp[i] - temp[i - 1] == 0) {
            break;
        }
        if (i == temp.length - 1) {
            return output;
        }
    }
    makeRandomNumber();
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;
