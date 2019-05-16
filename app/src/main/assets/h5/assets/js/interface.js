const MD5_KEY_LOGIN = 'md5';
var URL_DEFAULT = 'http://www.baidu.com';
var currentURL = null;
var currentRequestPre = '/tv';
var currentLanguage = 'cn';

// Detect Update.
const URL_VERSION = '/version';
// Login.
const URL_LOGIN = '/login';
// Get user info.
const URL_USERINFO = '/userinfo';
// Deposit.
const URL_DEPOSIT = '/deposit';
// Click 'I have already transfer money' btn.
const URL_DEPOSIT_UPORDER = '/deposituporder';
// Cancel deposit order.
const URL_DEPOSIT_CANCEL = '/DepositDeOrder';
// Before withdraw.
const URL_WITHDRAW_BEFORE = '/withdrawpre';
const URL_WITHDRAW_SENDCODE = '/sendcode';
const URL_WITHDRAW = '/withdraw';
// Add bankcard.
const URL_WITHDRAW_ADDBANKCARDPRE = '/cardspre';
const URL_WITHDRAW_ADDBANKCARD = '/cardsadd';
const URL_WITHDRAW_EDITBANKCARD = '/cardsedit';
// Transfer.
const URL_TRANSFER_PRE = '/transferpre';
const URL_TRANSFER = '/transfer';
// Exchange.
const URL_EXCHANGE_PRE = '/exchangepre';
const URL_EXCHANGE = '/exchange';
// Record.
const URL_RECORD_DEPOSIT = '/historydeposit';
const URL_RECORD_WITHDRAW = '/historywithdraw';
const URL_RECORD_TRANSFER = '/historytransfer';
const URL_RECORD_EXCHANGE = '/historyexchange';
// Investment Management.
const URL_INVEST_INVESTADD = '/investadd';
const URL_INVEST_RECORD = '/investrecord';
const URL_INVEST_BACK = '/investback';
// Report.
const URL_REPORT = '/reportdayincome';
const URL_REPORT_BALANCE = '/reportbalance';
const URL_REPORT_CASH = '/reportcash';
const URL_REPORT_TEAM = '/reportteam';
// Team.
const URL_TEAM = '/team';
const URL_TEAM_DETAIL = '/teamdetail';
// Security.
const URL_SECURITY_LOGINPASS = '/securityepsw';
const URL_SECURITY_PASS = '/securityepsw2';
const URL_SECURITY_SETPASS = '/securitybpsw2';
// Chat.
const URL_CHAT_PRE = '/chatpre';
const URL_CHAT_RECEIVE = '/chatreceive';
const URL_CHAT_SEND = '/chatsend';
const URL_CHAT_MESSAGE = '/chatmessage';
const URL_CHAT_SORT = '/chatsort';

const LOCALSTORAGE_CURRENTURL = 'CurrentURL';
const LOCALSTORAGE_CURRENTLANGUAGE = 'CurrentLanguage';
const LOCALSTORAGE_USERINFO = 'UserInfo';
const LOCALSTORAGE_DEPOSITORDER = 'DepositOrder';
const LOCALSTORAGE_BANKCARD = 'BankCard';

function requestVersionHander(callbackFunc) {
  var param = {time: '1'};
  requestServer(URL_VERSION, param, function(rs){
    var jsonObj = JSON.parse(rs);
    callbackFunc(jsonObj);
  });
}

function requestLoginHander(_username, _password, callbackFunc) {
  var param = {
    username: _username,
    password: _password,
    lan: currentLanguage,
    pass: hex_md5(MD5_KEY_LOGIN + _username + _password)
  };
  requestServer(URL_LOGIN, param, function(rs){
    showToast(rs);
    var jsonObj = JSON.parse(rs);
    if(jsonObj.status == 1) {
      // Save to localstorage.
      if(jsonObj.obj != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj));
    }
    callbackFunc(jsonObj);
  });
}

function getUserInfoFromLocalStorage() {
  return getFromLocalStorage(LOCALSTORAGE_USERINFO);
}

function getUserInfo(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_USERINFO, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestDepositHander(paymentValue, amountValue, remarkValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + amountValue + paymentValue + remarkValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + amountValue + paymentValue + remarkValue),
      username: userLoginInfo.username,
      amount: amountValue,
      payment: paymentValue,
      remark: remarkValue
    };
    requestServer(URL_DEPOSIT, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
        saveToLocalStorage(LOCALSTORAGE_DEPOSITORDER, JSON.stringify(jsonObj.obj));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestDepositUpOrderHander(orderId, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + orderId),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + orderId),
      username: userLoginInfo.username,
      oid: orderId,
    };
    requestServer(URL_DEPOSIT_UPORDER, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function getDepositOrderInfoFromLocalstorage(orderId) {
  var orderInfo = getFromLocalStorage(LOCALSTORAGE_DEPOSITORDER);
  if (orderInfo == null) return null;
  else {
    orderInfo = JSON.parse(orderInfo);
    return (orderInfo.deposit.id == orderId) ? orderInfo : null;
  }
}

function requestDepositCancelHander(orderId, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + orderId),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + orderId),
      username: userLoginInfo.username,
      oid: orderId,
    };
    requestServer(URL_DEPOSIT_CANCEL, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function saveToLocalStorage(key, value){
  localStorage.setItem(key, value);
}

function getFromLocalStorage(key) {
  return localStorage.getItem(key);
}

function removeFromLocalStorage(key) {
  return localStorage.removeItem(key);
}

function requestWithdrawPre(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_WITHDRAW_BEFORE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
        if(jsonObj.obj.bankcard != null) {
          saveToLocalStorage(LOCALSTORAGE_BANKCARD + jsonObj.obj.user.username, JSON.stringify(jsonObj.obj.bankcard));
        }else{
          removeFromLocalStorage(LOCALSTORAGE_BANKCARD + jsonObj.obj.user.username);
        }
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestSendCode(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_WITHDRAW_SENDCODE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestWithdrawHandler(_amount, _payment, _vcode, _password, _address, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + _amount + _payment + _password + _address + _vcode),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + _amount + _payment + _password + _address + _vcode),
      username: userLoginInfo.username,
      amount: _amount,
      payment: _payment,
      password: _password, 
      address: _address, 
      vcode: _vcode
    };
    requestServer(URL_WITHDRAW, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestAddBankCardPreHandler(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_WITHDRAW_ADDBANKCARDPRE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestAddBankcardHandler(bankcodeValue, cardnameValue, cardnoValue, addressValue, branchValue, vcodeValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + bankcodeValue + cardnameValue + cardnoValue + addressValue + branchValue + vcodeValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + bankcodeValue + cardnameValue + cardnoValue + addressValue + branchValue + vcodeValue),
      username: userLoginInfo.username,
      bankcode: bankcodeValue,
      cardname: cardnameValue,
      cardno: cardnoValue, 
      address: addressValue, 
      branch: branchValue,
      vcode: vcodeValue
    };
    requestServer(URL_WITHDRAW_ADDBANKCARD, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestEditBankcardHandler(bankcodeValue, cardnoValue, addressValue, branchValue, passwordValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + bankcodeValue + cardnoValue + addressValue + branchValue + passwordValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + bankcodeValue + cardnoValue + addressValue + branchValue + passwordValue),
      username: userLoginInfo.username,
      bankcode: bankcodeValue,
      cardno: cardnoValue, 
      address: addressValue, 
      branch: branchValue,
      password: passwordValue
    };
    requestServer(URL_WITHDRAW_EDITBANKCARD, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestTransferPreHandler(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_TRANSFER_PRE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestTransferHandler(amountValue, accountValue, vcodeValue, passwordValue, remarkValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + amountValue + accountValue + vcodeValue + passwordValue + remarkValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + amountValue + accountValue + vcodeValue + passwordValue + remarkValue),
      username: userLoginInfo.username,
      amount: amountValue,
      account: accountValue,
      vcode: vcodeValue,
      password: passwordValue,
      remark: remarkValue
    };
    requestServer(URL_TRANSFER, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestExchangePreHandler(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_EXCHANGE_PRE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestExchangeHandler(amountValue, vcodeValue, passwordValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + amountValue + vcodeValue + passwordValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + amountValue + vcodeValue + passwordValue),
      username: userLoginInfo.username,
      amount: amountValue,
      vcode: vcodeValue,
      password: passwordValue
    };
    requestServer(URL_EXCHANGE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestDepositRecordHandler(pageValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + pageValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + pageValue),
      username: userLoginInfo.username,
      page: pageValue
    };
    requestServer(URL_RECORD_DEPOSIT, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestWithdrawRecordHandler(pageValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + pageValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + pageValue),
      username: userLoginInfo.username,
      page: pageValue
    };
    requestServer(URL_RECORD_WITHDRAW, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestTransferRecordHandler(pageValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + pageValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + pageValue),
      username: userLoginInfo.username,
      page: pageValue
    };
    requestServer(URL_RECORD_TRANSFER, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestExchangeRecordHandler(pageValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + pageValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + pageValue),
      username: userLoginInfo.username,
      page: pageValue
    };
    requestServer(URL_RECORD_EXCHANGE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestInvestmentAddHandler(amountValue, typeValue, passwordValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + amountValue + typeValue + passwordValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + amountValue + typeValue + passwordValue),
      username: userLoginInfo.username,
      amount: amountValue,
      type: typeValue,
      password: passwordValue
    };
    requestServer(URL_INVEST_INVESTADD, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestInvestRecordHandler(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_INVEST_RECORD, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestInvestBackHandler(idValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + idValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + idValue),
      username: userLoginInfo.username,
      oid: idValue
    };
    requestServer(URL_INVEST_BACK, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestReportHandler(pageValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + pageValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + pageValue),
      username: userLoginInfo.username,
      page: pageValue
    };
    requestServer(URL_REPORT, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestReportBalanceHandler(pageValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + pageValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + pageValue),
      username: userLoginInfo.username,
      page: pageValue
    };
    requestServer(URL_REPORT_BALANCE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestReportCashHandler(pageValue, typeValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {};
    if(typeValue != -1) {
      param = {
        lan: currentLanguage,
        pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + pageValue + typeValue),
        sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + pageValue + typeValue),
        username: userLoginInfo.username,
        type: typeValue,
        page: pageValue
      };
    }else{
      param = {
        lan: currentLanguage,
        pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + pageValue),
        sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + pageValue),
        username: userLoginInfo.username,
        page: pageValue
      };
    }
    requestServer(URL_REPORT_CASH, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestReportTeamHandler(pageValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + pageValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + pageValue),
      username: userLoginInfo.username,
      page: pageValue
    };
    requestServer(URL_REPORT_TEAM, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestTeamHandler(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_TEAM, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestTeamDetailHandler(geneValue, pageValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + geneValue + pageValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + geneValue + pageValue),
      username: userLoginInfo.username,
      page: pageValue,
      gene: geneValue
    };
    requestServer(URL_TEAM_DETAIL, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
        // Save to localstorage.
        if(jsonObj.obj.user != null) saveToLocalStorage(LOCALSTORAGE_USERINFO, JSON.stringify(jsonObj.obj.user));
      }
      callbackFunc(jsonObj);
    });
  }
}

// lan, pass, sign, username, oldpsw, password
function requestSecurityLoginPassHandler(oldpswValue, passwordValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + oldpswValue + passwordValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + oldpswValue + passwordValue),
      username: userLoginInfo.username,
      oldpsw: oldpswValue,
      password: passwordValue
    };
    requestServer(URL_SECURITY_LOGINPASS, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestSecurityPassHandler(oldpswValue, passwordValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + oldpswValue + passwordValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + oldpswValue + passwordValue),
      username: userLoginInfo.username,
      oldpsw: oldpswValue,
      password: passwordValue
    };
    requestServer(URL_SECURITY_PASS, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
      }
      callbackFunc(jsonObj);
    });
  }
}

// lan, pass, sign, username, oldpsw, password
function requestSetSecurityPassHandler(passwordValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + passwordValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + passwordValue),
      username: userLoginInfo.username,
      password: passwordValue
    };
    requestServer(URL_SECURITY_SETPASS, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestChatPreHandler(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_CHAT_PRE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestChatSortHandler(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_CHAT_SORT, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestChatMessageHandler(callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username
    };
    requestServer(URL_CHAT_MESSAGE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestChatReceiveHandler(lastChatIdValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username + lastChatIdValue),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username + lastChatIdValue),
      username: userLoginInfo.username,
      lastChat: lastChatIdValue
    };
    requestServer(URL_CHAT_RECEIVE, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
      }
      callbackFunc(jsonObj);
    });
  }
}

function requestChatSendHandler(messageValue, callbackFunc) {
  var userLoginInfo = getFromLocalStorage(LOCALSTORAGE_USERINFO);
  if(userLoginInfo != null) {
    userLoginInfo = JSON.parse(userLoginInfo);
    var param = {
      lan: currentLanguage,
      pass: hex_md5(MD5_KEY_LOGIN + userLoginInfo.username),
      sign: hex_md5(userLoginInfo.signkey + userLoginInfo.username),
      username: userLoginInfo.username,
      message: messageValue
    };
    requestServer(URL_CHAT_SEND, param, function(rs){
      var jsonObj = JSON.parse(rs);
      if(jsonObj.status == 1) {
      }
      callbackFunc(jsonObj);
    });
  }
}

// const URL_CHAT_RECEIVE = '/chatreceive';
// const URL_CHAT_SEND = '/chatsend';

function requestServer(url, param, callbackFunc) {
  var xmlhttp;
  if (window.XMLHttpRequest)
  {
    // IE7+, Firefox, Chrome, Opera, Safari 浏览器执行代码
    xmlhttp=new XMLHttpRequest();
  }
  else
  {
    // IE6, IE5 浏览器执行代码
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
  xmlhttp.onreadystatechange=function()
  {
    if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
      console.log('【 Success 】' + url);
      callbackFunc(xmlhttp.responseText);
    }
  }
  currentURL = getFromLocalStorage(LOCALSTORAGE_CURRENTURL);
  if(currentURL == null || currentURL.startsWith("http") == false) currentURL = URL_DEFAULT;
  var urlWithParam = currentURL + currentRequestPre + url + '?' + parseParam(param)
  xmlhttp.open("GET", urlWithParam, true);
  xmlhttp.send();
}

// Parse param by join & inside.
function parseParam(param, key){
  var paramStr = "";
  if(param instanceof String||param instanceof Number||param instanceof Boolean){
    paramStr+="&"+key+"="+encodeURIComponent(param);
  }else{
    $.each(param,function(i){
      var k=key==null?i:key+(param instanceof Array?"["+i+"]":"."+i);
      paramStr+='&'+parseParam(this, k);
    });
  }
  return paramStr.substr(1);
}

// Get param value from url.
function getQueryVariable(variable)
{
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
          var pair = vars[i].split("=");
          if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

function notNull(content) {
  if(content == null) return false;
  else if(content.length == 0) return false;
  return true;
}

Date.prototype.format = function(format) {
/*
* eg:format="YYYY-MM-dd hh:mm:ss";
*/
var o = {
"M+" :this.getMonth() + 1, // month
"d+" :this.getDate(), // day
"h+" :this.getHours(), // hour
"m+" :this.getMinutes(), // minute
"s+" :this.getSeconds(), // second
"q+" :Math.floor((this.getMonth() + 3) / 3), // quarter
"S" :this.getMilliseconds()
}
if (/(y+)/.test(format)) {
format = format.replace(RegExp.$1, (this.getFullYear() + "")
.substr(4 - RegExp.$1.length));
}
for ( var k in o) {
if (new RegExp("(" + k + ")").test(format)) {
format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
: ("00" + o[k]).substr(("" + o[k]).length));
}
}
return format;
}  

/**** Register For APP START ****/
/*这段代码是固定的，必须要放到js中*/
function setupWebViewJavascriptBridge(callback) {

  if (window.WebViewJavascriptBridge) {
   callback(WebViewJavascriptBridge)
   }else {
           document.addEventListener(
               'WebViewJavascriptBridgeReady'
               , function() {
                   callback(WebViewJavascriptBridge)
               },
               false
           );
   }

  if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
  window.WVJBCallbacks = [callback];
  var WVJBIframe = document.createElement('iframe');
  WVJBIframe.style.display = 'none';
  WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
  document.documentElement.appendChild(WVJBIframe);
  setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
}

setupWebViewJavascriptBridge(function(bridge) {
 /* Initialize your app here */
 WebViewJavascriptBridge.init(function(message, responseCallback) {
      responseCallback(data);
  });
 bridge.registerHandler("setConfigInfo", setConfigInfo);
 console.log('Helloworld.');
});
/**** Register For APP END ****/

function saveQRCodeImgHandler(content) {
  setupWebViewJavascriptBridge(function(bridge) {
    var userInfoStr = getUserInfoFromLocalStorage();
    if(userInfoStr != null) {
      var userInfoObj = JSON.parse(userInfoStr);
      bridge.callHandler("saveQRCodeImg", content + ',' + userInfoObj.username, function(response) {
        alert('saveQRCodeImg:' + response);
      });
    }else{
      bridge.callHandler("saveQRCodeImg", content + ',superman', function(response) {
        alert('saveQRCodeImg:' + response);
      });
    }
  })
}

function showToast(content) {
  setupWebViewJavascriptBridge(function(bridge) {

    bridge.callHandler("showToast", content, function(response) {
      console.log('showToast:' + response);
    });
  })
}

function setConfigInfo(configStr) {
  var configArr = configStr.split(',');
  currentURL = configArr[0];
  currentLanguage = configArr[1];
  saveToLocalStorage(LOCALSTORAGE_CURRENTURL, currentURL);
  saveToLocalStorage(LOCALSTORAGE_CURRENTLANGUAGE, currentLanguage);
}








