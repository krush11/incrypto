function checkPasswords(email_list, username_list) {
    var form = document.getElementById('resetPassword');
    if (form[0].value == form[1].value)
        form.submit();
    else
        document.getElementById('pass-not-matching').style.display = "block";
}

function checkIfEmailExists(emails) {
    emails = emails.split(',');
    var form = document.getElementById('reset-password');
    document.getElementById('err-msg').style.display = "none";
    if (!form[0].value) {
        document.getElementById('err-msg').style.display = "block";
        document.getElementById('err-msg').innerHTML = "Please enter this field";
    }
    else {
        var re = /^(([a-zA-Z0-9]+)|([a-zA-Z0-9]+((?:\_[a-zA-Z0-9]+)|(?:\.[a-zA-Z0-9]+))*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-zA-Z]{2,6}(?:\.[a-zA-Z]{2})?)$)/;
        if (!re.test(form[0].value)) {
            document.getElementById('err-msg').style.display = "block";
            document.getElementById('err-msg').innerHTML = "Please enter a valid email";
        }
        else if (emails.includes(form[0].value))
            form.submit();
        else {
            document.getElementById('err-msg').style.display = "block";
        }
    }
}
