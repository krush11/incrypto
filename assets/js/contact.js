function defaultOption(option) {
    const selectElement = document.getElementById('subject');
    if (option == 'bug') selectElement.selectedIndex = 0
    else if (option == 'join-team') selectElement.selectedIndex = 1;
    else if (option == 'feature') selectElement.selectedIndex = 2;
    else selectElement.selectedIndex = 3;
}
