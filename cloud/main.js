var twilioAccountSid = 'ACc2daa663d17a30fd612c545813ad6d93';
var twilioAuthToken = '36bf94549eb757ada7da481c42e11a7a';
var twilioPhoneNumber = '+12564948811';
var secretPasswordToken = 'Something-Random-Here';
var secretTOTP = 'Something-Random-Here';

var twilio = require('twilio')(twilioAccountSid, twilioAuthToken);
var totp = require('notp').totp;

Parse.Cloud.define("register", function (req, res) {
    var phoneNumber = req.params.phoneNumber.replace(/\D/g, '');

    if (!phoneNumber || phoneNumber.length <= 9) return res.error('Invalid Parameters');
    var query = new Parse.Query(Parse.User);
    query.equalTo('username', phoneNumber + "");
    query.first({useMasterKey: true}).then(function (result) {
        var token = totp.gen(secretTOTP + "" + phoneNumber, {time: 900});

        if (result) {
            if ((Date.now() - (result.get("lastSmsSentAt") || 0)) > 900000) {
                sendCodeSms(phoneNumber, token).then(function () {
                    result.set("lastSmsSentAt", new Date());
                    result.setPassword(secretPasswordToken + token + phoneNumber);
                    result.save(null, {useMasterKey: true}).then(function () {
                        return res.success({"created": 0, "sent": 1});
                    }, function (err) {
                        return res.error(err);
                    });
                }, function (err) {
                    return res.error(err);
                });

            } else return res.error("you cant send more than one message with in 15 minute")

        } else {
            var user = new Parse.User();
            user.setUsername(phoneNumber);
            user.setPassword(secretPasswordToken + token + phoneNumber);
            user.set("lastSmsSentAt", new Date());

            user.save(null, {useMasterKey: true}).then(function (a) {
                return sendCodeSms(phoneNumber, token);
            }).then(function () {
                return res.success({"created": 1, "sent": 1});
            }, function (err) {
                res.error(err);
            });
        }
    }, function (err) {
        res.error(err);
    });
});

Parse.Cloud.define("logIn", function (req, res) {
    var phoneNumber = req.params.phoneNumber.replace(/\D/g, '');
    var token = req.params.token;

    if (!phoneNumber && token.length != 6)
        res.error('Invalid parameters.');
    var object = totp.verify(token, secretTOTP + "" + phoneNumber, {time: 900});
    console.log(object.delta);
    if (object == null || object.delta < -1)
        return res.error('token expired.');

    Parse.User.logIn(phoneNumber, secretPasswordToken + token + phoneNumber, {useMasterKey: true}).then(function (user) {
        console.log(Math.random() * Date.now() * 100 + secretPasswordToken);
        user.setPassword(Math.random() * Date.now() * 100 + secretPasswordToken);
        user.set("lastSmsSentAt", new Date());
        user.save(null, {useMasterKey: true});

        res.success(user.getSessionToken());
    }, function (err) {
        res.error(err);
    });
});


function sendCodeSms(phoneNumber, code) {
    var promise = new Parse.Promise();
    // twilio.sendSms({
    //     to: "+" + phoneNumber.replace(/\D/g, ''),
    //     from: twilioPhoneNumber.replace(/\D/g, ''),
    //     body: 'Your code is ' + code
    // }, function (err, responseData) {
    //     if (err) {
    //         console.log(err);
    //         promise.reject(err.message);
    //     } else {
    //         promise.resolve();
    //     }
    // });
    promise.resolve();
    console.log(code);
    return promise;
}
