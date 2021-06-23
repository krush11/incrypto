let asideState = false;
let curr_form = 'first';
function toggleAside() {
    const aside = document.getElementsByTagName('aside')[0];
    if (asideState) {
        aside.style.display = 'none';
        asideState = false
    } else {
        aside.style.display = 'block';
        asideState = true;
    }
}

function showForm(formId) {
    if (curr_form != 'first')
        document.getElementById(curr_form).style.display = "none";
    curr_form = formId;
    document.getElementById(formId).style.display = "block";
}

function openFolder(folderID, username) {
    location.replace(`/portal/${username}/${folderID}`);
}

function showFile(file) {
    location.replace(`/assets/uploads/${file}`);
}
