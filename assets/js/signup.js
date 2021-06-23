function checkIfUserExists(email_list, username_list) {
    var form = document.getElementById('signin');
    document.getElementById('email-msg').style.display = "none";
    document.getElementById('username-msg').style.display = "none";

    if (username_list.includes(form[1].value))
        document.getElementById('username-msg').style.display = 'block';
    else if (email_list.includes(form[2].value))
        document.getElementById('email-msg').style.display = 'block';
    else if (!form.terms.checked)
        document.getElementById('terms-msg').style.display = 'block';
    else if (form.terms.checked)
        form.submit();
}
