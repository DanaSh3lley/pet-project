const wordPart = document.querySelector('.word')
const listPart = document.querySelector('.list')
const inputSubmit = document.querySelector('.input-submit')
const inputText = document.querySelector('.input')
const outputText = document.querySelector('.output')
const copy = document.querySelector('.copy')

let list = []
let final = []

let counter = 0

let checkboxes = []
let focusIndex = 0

function showNextList() {
    if (counter < list.length) {
        let value = list[counter];
        listPart.innerHTML = ''
        wordPart.innerHTML = list[counter].word
        value.translation.forEach((el, i) => {
            listPart.innerHTML += `
    <label>
            <input class="check" type="checkbox" value=${i}>
            ${el}
    </label><br>`
        })
        focusIndex = 0;
        checkboxes = document.querySelectorAll('.check');
        checkboxes[focusIndex].focus();
        counter++
    } else {
        listPart.innerHTML = 'Congratulation!'
        wordPart.innerHTML = 'Final!'
        outputText.value = JSON.stringify(final, null, 2)
    }
}

function submitItem() {
    let translation = [...checkboxes].filter(el => el.checked).map(el => list[counter - 1].translation[+el.value])
    if (translation.length >= 1) {
        let res = {
            word: list[counter - 1].word,
            translation: translation
        }
        final.push(res)
        showNextList()
    }
}


inputSubmit.addEventListener('click', (event) => {
    list = JSON.parse(inputText.value)
    counter = 0
    showNextList()
})

copy.addEventListener('click', (e) => {
    // e.preventDefault()
    outputText.select();
    outputText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(outputText.value);
})

window.addEventListener('keydown', (event) => {
    if (event.code === 'Enter') {
        event.preventDefault()
        submitItem()
    }
    if (event.code === 'ArrowDown') {
        event.preventDefault()
        focusIndex++
        checkboxes[focusIndex].focus();
    }
    if (event.code === 'ArrowUp') {
        event.preventDefault()
        focusIndex--
        checkboxes[focusIndex].focus();
    }
    if (event.code === 'ArrowLeft') {
        counter--
        counter--
        final.pop()
        showNextList()
    }
})