/**
 * TODO 4자리 /3자리 & 메뉴 변경 & 더치페이 추가
 * @type {*}
 */
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var mongoDB = require('../public/javascripts/database');

// TODO -> multi user에 대한 처리 필요
var count;
var tempAry = new Array(4);
var tempStr;
var strike;
var ball;
var out;
var difficulty;
var tempPrice = new Array(2);
var tempPerson;
var totalMan;

var isDutch = false;
var isFair = true;
var isEntered = false;
// server쪽 난수 저장
var ranNum;

const keyboard_numSelectBtn = {
    "type": "buttons",
    "buttons": ["쉬움", "어려움", "매우 어려움"]
};

const keyboard_startBtn = {
    "type": "buttons",
    "buttons": ["숫자 야구 게임", "더치 페이"]
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
/* test 용도 */
router.get('/', function (req, res, next) {
    console.log(isCorrectNumber("123", "easy"))
    res.json(dutchPay_start());
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

    // isNumber 체크
    // TODO 숫자 앞에 0 사라지는거
    // 숫자야구
    if (!isDutch) {
        tempStr = parseInt(selected.replace(/[^0-9]/g, ""));
        if (tempStr >= 0 && tempStr < 100000) {
            for (var i = 0; i < tempAry.length; i++) {
                tempAry[i] = Math.floor(tempStr / Math.pow(10, tempAry.length - 1 - i));
            }
            tempAry.sort();
            for (var i = 1; i < tempAry.length; i++) {
                // 같은 숫자 반복
                if (parseInt(tempAry[i]) === parseInt(tempAry[i - 1])) {
                    break;
                }
                if (i === tempAry.length - 1) {
                    isNumber = true;
                }
            }
        }
    }
    // 금액 체크 더치페이 인 경우 isDutch true
    else {
        // n빵
        if (isFair) {
            tempPrice = selected.replace(/[^0-9/]/g, "");
            tempPrice = tempPrice.split("/");
            tempPrice = tempPrice.splice(0, 2);
            for (var i = 0; i < tempPrice.length; i++) {
                // 숫자가 아니면
                if (isNaN(tempPrice[i])) {
                    isNumber = false;
                    break;
                }
                else isNumber = true;
            }
        }
        // 복불복 이름 배열이나 숫자가 들어옴
        else if (!isFair) {
            var confirmed = selected.split(' ');
            if (confirmed.length > 1) {
                // 사람이름이란거
                isNumber = false;
                isEntered = false;
                isDutch = true;
            }
            else {
                tempPrice[0] = parseInt(selected);
                isEntered = true;
                isNumber = true;
                isDutch = true;
                // 가격이란거
            }
            // totalMan = dutchPay_peopleCount(selected);
            // // totalMan = parseInt(selected);
            // if (!isNaN(totalMan)) { // 사람수가 숫자인거 -> selected str
            //     isNumber = true;
            //     isEntered = true;
            // } else {    // 숫자가 들어온거
            //     isNumber = false;
            //     // isEntered = false;
            // }

            // res.json({
            //     "message": {
            //         "text":totalMan + "|" + (typeof totalMan)
            //     }
            // });
        }
        // else{
        //     tempPrice[0] = parseInt(selected);
        //     if (isNaN(tempPrice[0])) {
        //         isNumber = false;
        //     }
        // }
    }

    // 숫자 입력이 아닌 경우
    if (!isNumber) {
        if (!isFair && isDutch && !isEntered) {
            tempPerson = selected.split(" ");
            tempPerson.forEach(function (item, index) {
                if (tempPerson[index] === "") {
                    tempPerson.splice(index, 1);
                }
            });
            totalMan = tempPerson.length;
            res.json({
                "message": {
                    "text": totalMan + "이시군요\n" +
                    "총 금액을 입력해주세요"
                }
            });
        }
        else{
            if (selected === "숫자 야구 게임") {
                mongoDB.delete(userKey);
                mongoDB.save(userKey, ["계속하기"]);
                res.json({
                    "message": message_numHello,
                    "keyboard": keyboard_numSelectBtn
                });
            } else if (selected === "처음으로 돌아가기" || selected === "처음으로") {
                isDutch = false;
                isEntered = false;
                isFair = false;
                res.json({
                    "message": {
                        "text": "메뉴 선택 화면으로 돌아갑니다"
                    },
                    "keyboard": keyboard_startBtn
                })
            } else if (selected === "쉬움") {
                ranNum = makeRandomNumber(3);
                count = strike = ball = out = 0;
                difficulty = "easy";
                res.json({
                    "message": {
                        "text": "3자리 야구게임을 시작하셨네요.\n" + message_gameRule,
                        "message_button": messageBtn_homeLink
                    }
                })
            } else if (selected === "어려움") {
                ranNum = makeRandomNumber(4);
                count = strike = ball = out = 0;
                difficulty = "hard";
                res.json({
                    "message": {
                        "text": "4자리 야구게임을 시작하셨네요.(놀람)\n" + message_gameRule,
                        "message_button": messageBtn_homeLink
                    }
                })
            } else if (selected === "매우 어려움") {
                ranNum = makeRandomNumber(5);
                count = strike = ball = out = 0;
                difficulty = "hell";
                res.json({
                    "message": {
                        "text": "5자리 야구게임을 시작하셨네요.(놀람)(놀람)\n" + message_gameRule,
                        "message_button": messageBtn_homeLink
                    }
                })
            } else if (selected === "기록") {
                checkMyScore(userKey).then(function (results) {
                    // var temp = results.toString().replace(/,/g, '');
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
            } else if (selected === "계속하기") {
                res.json({
                    "message": {
                        "text": "다음 숫자를 입력해주세요!"
                    }
                })
            }
            // dutchpay
            else if (selected === "더치 페이") {
                res.json(dutchPay_start());
            } else if (selected === "돈은 공정하게 나눠야죠") {
                isDutch = true;
                isFair = true;
                res.json(dutchPay_fair());
            } else if (selected === "복불복") {
                isEntered = false;
                isDutch = true;
                isFair = false;
                res.json(dutchPay_lotto());
            }

            // input error & comeback home menu
            else {
                if (selected === "포기") {
                    res.json({
                        "message": {
                            "text": "처음으로 돌아갑니다"
                        },
                        "keyboard": keyboard_startBtn
                    })
                } else {
                    res.json({
                        "message": {
                            "text": "잘못 입력하셨어요." + isNumber + " " + isDutch
                        }
                    })
                }
            }
        }
    }
    // 숫자 입력 isNumber === true
    else {
        if (isDutch) { // isNumber = t, isDutch = true
            // 공평하게
            if (isFair) {
                var people;
                var totalPrice;
                var mustPaid;
                var rest;
                var additionalText = "";

                totalPrice = tempPrice[0];
                people = tempPrice[1];
                rest = totalPrice % 100;
                totalPrice -= rest;
                mustPaid = totalPrice / people;
                if (rest !== 0) additionalText = "\n잔돈 " + rest + " 원은 나머지 한명이..(윙크)";
                isDutch = false;
                res.json({
                    "message": {
                        "text": "더치페이 결과는 아래와 같습니다.\n" +
                        "각자 " + mustPaid + " 원씩 지불하시면 돼요" + additionalText +
                        "\n" + isDutch
                    },
                    "keyboard": {
                        "type": "buttons",
                        "buttons": ["처음으로 돌아가기"]
                    }
                });
            }
            // isfair false
            else {
                if (isEntered) {
                    var results = dutchPay_lottoLogic(tempPrice[0], totalMan);
                    var resultFormat = "";
                    for (var i = 0; i < totalMan; i++) {
                        resultFormat += tempPerson[i] + " 님 " + results[i] + "원\n";
                    }
                    isDutch = false;
                    res.json({
                        "message": {
                            "text": "복불복 결과는 아래와 같습니다.\n" +
                            resultFormat
                        },
                        "keyboard":{
                            "type":"buttons",
                            "buttons": ["처음으로 돌아가기"]
                        }
                    });
                }
            }
        }
        // isDutch F / number T
        else {
            if (!isCorrectNumber(selected, difficulty)) {
                res.json({
                    "message": {
                        "text": "선택하신 " + difficulty + " 난이도랑 " +
                        "입력한 " + selected + " 자리가 맞지 않습니다!\n" +
                        "알맞게 입력해 주세요(찡긋)"
                    }
                })
            }
            if (difficulty === "easy") {
                var userAry = new Array(3);
                var aryLength = userAry.length;
                for (var i = 0; i < aryLength; i++) {
                    userAry[i] = Math.floor(tempStr / Math.pow(10, aryLength - 1 - i));
                    tempStr = (tempStr % Math.pow(10, aryLength - 1 - i));
                }
            }
            else if (difficulty === "hard") {
                var userAry = new Array(4);
                var aryLength = userAry.length;
                for (var i = 0; i < aryLength; i++) {
                    userAry[i] = Math.floor(tempStr / Math.pow(10, aryLength - 1 - i));
                    tempStr = (tempStr % Math.pow(10, aryLength - 1 - i));
                }
            }
            else if (difficulty === "hell") {
                var userAry = new Array(5);
                var aryLength = userAry.length;
                for (var i = 0; i < aryLength; i++) {
                    userAry[i] = Math.floor(tempStr / Math.pow(10, aryLength - 1 - i));
                    tempStr = (tempStr % Math.pow(10, aryLength - 1 - i));
                }
            }
            strike = ball = out = 0;
            // 중복
            if (isDuplicate(userAry)) {
                res.json({
                    "message": {
                        "text": "중복되는 수를 입력하면 안되는데...\n" +
                        "다시 한번만 입력해주세요 (제발)"
                    }
                })
            }
            // 중복아님
            else{
                // strike / ball / out
                for (var i = 0; i < aryLength; i++) {
                    if (ranNum.indexOf(userAry[i]) !== -1) {
                        if (ranNum[i] === userAry[i]) strike += 1;
                        else ball += 1;
                    }
                    else out += 1;
                }
                count += 1;
                // 정답
                if (strike === aryLength) {
                    mongoDB.delete(userKey).then(function (results) {
                    });
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
                    var temp = userAry.toString().replace(/,/g, '');
                    if (isCorrectNumber(selected, difficulty)) {
                        writeMyScore(userKey, temp + " " + "" + strike + "S " + ball + "B")
                            .then(function (results) {
                            });//TODO 나중에 필요한 logic
                        res.json({
                            "message": {
                                "text": strike + " S " + ball + " B"
                            }
                        })
                    }
                }    
            }
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
 * @param inputArray (Array)
 * @returns boolean
 */
function isDuplicate(inputArray) {
    var tempAry;
    tempAry = inputArray.slice(0, inputArray.length);
    tempAry.sort();
    for (var i = 1; i < tempAry.length; i++) {
        if (parseInt(tempAry[i]) === parseInt(tempAry[i - 1])) {
            return true;
        }
        if (i === (tempAry.length - 1)) {
            return false;
        }
    }
}
/**
 * isCorreceNumber
 *
 * Des
 * 난이도에 따른 입력 숫자 자리가 맞지 않는지 확인
 * @params inputString (String)
 *         difficulty (String)
 * @returns boolean
 */
function isCorrectNumber(inputString, difficulty) {
    if (difficulty === "easy") {
        if (inputString.length !== 3) {
            return false;
        }
        else return true;
    } else if (difficulty === "hard") {
        if (inputString.length !== 4) {
            return false;
        }
        else return true;
    } else {
        if (inputString.length !== 5) {
            return false;
        }
        else return true;
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
    if (type === 4) var output = new Array(4);
    else if (type === 3) var output = new Array(3);
    else var output = new Array(5);
    for (var i = 0; i < output.length; i++) {
        output[i] = getRandomIntInclusive(0, 9);
    }
    console.log("raw output : " + output);
    temp = output.slice(output.begin, output.end);
    temp.sort();
    console.log("why sorted : " + output);
    for (var i = 1; i < temp.length; i++) {
        // 같은 숫자 반복
        if (temp[i] === temp[i - 1]) {
            console.log("temp  " + i + "와 i-1 중복 발생: " + temp);
            return makeRandomNumber(temp.length);
        }
        if (i === (temp.length - 1)) return output;
    }
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 *  req의 user_key을 이용해서 DB의 해당 user 기록 retrieve
 */
function checkMyScore(user_key) {
    return new Promise(function (res) {
        var userKey = user_key;
        mongoDB.getLogs(userKey).then(function (results) {
            res(results);
        })
    });
}

/**
 * req user_key 이용해서 DB에 해당 user의 기록 create
 * @type {string}
 */
function writeMyScore(userKey, data) {
    return new Promise(function (res) {
        mongoDB.getLogs(userKey).then(function (results) {
            if (results === "not exist") {
                mongoDB.save(userKey, data);
            }
            else {
                mongoDB.update(userKey, data).then(function (results) {
                    console.log("writeMyScore's results " + results);
                })
            }
        })
    })
}

// flag 필요
function dutchPay_start() {
    const dutchPay_startMessage = {
        "text": "더치페이 기능을 시작합니다.\n" +
        "아래에서 메뉴를 선택해주세요"
    };

    const dutchPay_buttons = {
        "type": "buttons",
        "buttons": ["돈은 공정하게 나눠야죠", "복불복"]
    };
    return {
        "message": dutchPay_startMessage,
        "keyboard": dutchPay_buttons
    };
}

function dutchPay_fair() {
    var messageForm = {
        "text": "나눌 총 금액과 인원수를 적어주세요\n" +
        "예시) 15000/4"
    };
    return {
        "message": messageForm
    };
}

function dutchPay_lotto() {
    const messageForm = {
        "text": "참석자 이름을 스페이스로 구분해서 " +
        "적어주세요\n" +
        "예시) 정우성 고수 장동건 "
    };
    return {
        "message": messageForm
    };
}
function dutchPay_peopleCount(inputString) {
    var peopleAry = inputString.split(" ");
    var peopleNum = peopleAry.length;
    return peopleNum;
}
function dutchPay_lottoLogic(amount, peopleNum) {
    var rest = amount % 1000;
    var total = amount - rest;
    var rest2 = (total / peopleNum) % 1000;
    var mustPaid = (total - rest2 * peopleNum) / peopleNum;
    var remain = rest2 * peopleNum;
    var returnAry = new Array(peopleNum);
    console.log(rest + " | " + rest2);
    console.log(mustPaid + " | " + total);

    for (var i = 0; i < returnAry.length; i++) {
        returnAry[i] = mustPaid;
    }
    if (remain > mustPaid / 3) {
        // peoplenum -1까지 나눔
        var luckyMan = getRandomIntInclusive(0, peopleNum - 1);
        for (var i = 0; i < returnAry.length; i++) {
            if (i === luckyMan) continue;
            else {
                returnAry[i] += (remain / (peopleNum - 1));
                returnAry[i] += (rest / (peopleNum - 1));
            }
        }

    } else {
        returnAry[getRandomIntInclusive(0, peopleNum - 1)] += (remain + rest);
    }
    return returnAry;
}

const message_gameRule = "\n[게임설명]\n" +
    "- 숫자야구는 정한 난이도에 맞는 숫자조합을 맞추는 게임입니다.\n" +
    "- 숫자와 자리가 일치 시에는 1Strike 증가, 숫자만 일치하고 자리는 불일치시 1Ball증가합니다.\n\n" +
    "[주의 & 참고사항]\n" +
    "- 중복된 숫자조합은 불가능합니다.\n" +
    "- 이때까지 시도한 숫자와 결과를 보고 싶을 시 [기록]을 입력하시면 됩니다.\n" +
    "- 게임을 종료하고 싶을 시 [포기]를 입력하시면 됩니다.";

module.exports = router;
