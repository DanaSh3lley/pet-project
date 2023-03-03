const wordPart = document.querySelector('.word');
const listPart = document.querySelector('.list');
const previewPart = document.querySelector('.preview');
const inputSubmit = document.querySelector('.input-submit');
const inputText = document.querySelector('.input');
const outputText = document.querySelector('.output');
const copy = document.querySelector('.copy');
const topicSelect = document.querySelector('.topic-select');
topicSelect.value = localStorage.getItem('topic');

topicSelect.addEventListener('change', () => {
  localStorage.setItem('topic', topicSelect.value);
})

inputText.focus();

let list = [];

let counter = 0;
let focusIndex = 0;
let checkboxes = [];
let finish = false

let isPos = false;
let isDef = false;
let currentPos = '';
let currentElement = null;
const result = [];

const currTopic = topicSelect.value

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function showPos() {
  let value = list[counter];
  listPart.innerHTML = '';
  wordPart.innerHTML = `<h3>${list[counter].query}\t${list[counter]?.queryPos ||
                                                      ''}\t${list[counter]?.queryLevel ||
                                                             ''}\t${counter +
                                                                    1} / ${list.length}</h3>`;
  value.result.forEach((el, i) => {
    listPart.innerHTML += `
    <label>
            <input class="radio" name="pos" type="checkbox" value=${i}>
            <b>${el._header._word}</b>, ${colorRed(el._header._mainInfo._pos,
                                                   `${value?.queryPos}`,
                                                   true) ||
                                          (el._header._mainInfo._pos)}, ${el._header?._mainInfo?._labels ||
                                                                          ''}, ${el._header?._mainInfo?._variants ||
                                                                                 ''}, ${el._header?._mainInfo?._level ||
                                                                                        ''}
    </label><br>`;
  });
  checkboxes = [...document.querySelectorAll('.radio')];
  checkboxes[0]?.focus();
  previewElement();

  const redRadio = [...listPart.querySelectorAll('label')].find(
      (el) => el.querySelector('[style="color: red;"]'))
                                                          ?.querySelector(
                                                              '.radio');
  if (redRadio)
    redRadio.checked = true;
  isPos = true;

  previewElement();
}

function previewElement() {
  if (isPos) {
    const checkedElement = document.querySelector('.radio:focus')?.value;
    // previewPart.innerHTML =
    // `<pre>${JSON.stringify(list[counter].result[checkedElement], null,
    // 2)}</pre>`

    previewPart.innerHTML =
        `${list[counter]?.result[checkedElement]?._main?._sense?.map(
            sense => {
              const topic = sense?._mainInfo?._topics?.match(
                  /<span class="topic_name">.+?<\/span>/gmis)?.join(', ') || '';
              return `${sense._def}<b>(${colorRed(topic, currTopic)})</b>`;
            }).join('<br>')}`;
    previewPart.innerHTML +=
        `<hr>${list[counter].result[checkedElement]?._other?._idioms?.map(
            el => {
              return `${colorRed(el?._idm,
                                 list[counter].query,
                                 true) || el._idm} - ${el?._senses.map(
                  el => {
                    const topic = `${el?._mainInfo?._topics?.match(
                        /<span class="topic_name">.+?<\/span>/gmis)?.join(', ') || ''}`;
                    return `${el._def} <b>(${colorRed(topic, currTopic)})</b>`;
                  })
                                                         .join(', ')}`;
            }).join('<br>') || ''}`;

  }
}

function selectPos() {
  const posElements = [...document.querySelectorAll('.radio')];
  currentPos = posElements.find(el => el.checked)?.value;
  if (currentPos) {
    isPos = false;

    return JSON.parse(JSON.stringify(list[counter].result[currentPos]));
  }
}

function showDefinitions() {
  focusIndex = 0;
  previewPart.innerHTML = '';
  isDef = true;
  currentElement = selectPos();
  if (currentElement) {
    listPart.innerHTML = '';
    wordPart.innerHTML =
        `<h3>${list[counter].query}\t${list[counter]?.queryPos ||
                                       ''}\t${list[counter]?.queryLevel ||
                                              ''}\t(${counter +
                                                      1} / ${list.length})</h3>`;
    listPart.innerHTML += `<h4>Definition</h4>`;
    currentElement?._main?._sense?.forEach((el, i) => {
      const topic = el?._mainInfo?._topics?.match(
          /<span class="topic_name">.+?<\/span>/gmis)?.join(', ') || '';
      listPart.innerHTML += `
    <label>
        <input class="checkbox sense" name="sense" type="checkbox" value=${i}>
        ${el._def} <b>(${colorRed(topic, currTopic)})</b>
     </label><br>`;
    });

    listPart.innerHTML += `<h4>Idioms</h4>`;
    currentElement?._other?._idioms?.forEach((el, i) => {
      listPart.innerHTML += `
    <label>
        <input class="checkbox idiom" name="idiom" type="checkbox" value=${i}>
        <b>${colorRed(el?._idm, list[counter].query, true) || el?._idm}</b><br>
        ${el?._senses.map(
          el => {
            const topic = `${el?._mainInfo?._topics?.match(
                /<span class="topic_name">.+?<\/span>/gmis)?.join(', ') || ''}`;
            return `${el._def} <b>(${colorRed(topic, currTopic)})</b>`})
            .join('<br>')}
     </label><br>`;
    });

    checkboxes = [...document.querySelectorAll('.checkbox')];
    checkboxes[0]?.focus();

    [...listPart.querySelectorAll('label')].filter(
        (el) => el.querySelector('[style="color: red;"]'))
                                           .forEach(el => el.querySelector(
                                               'input').checked = true);

    isDef = true;
  }
}

function selectDef() {
  isDef = false;

  const defElement = [...document.querySelectorAll('.sense')];
  let indexes = defElement.filter(el => el.checked).map(el => +el.value);
  if (!currentElement._main)
    currentElement._main = {};
  currentElement._main._sense =
      currentElement?._main?._sense?.filter((el, i) => indexes.includes(i)) ||
      [];

  const idiomsDef = [...document.querySelectorAll('.idiom')];
  let indexesIdiom = idiomsDef.filter(el => el.checked).map(el => +el.value);
  if (currentElement._other)
    currentElement._other._idioms =
        currentElement?._other?._idioms?.filter(
            (el, i) => indexesIdiom.includes(i)) || [];
}

function returnDefinitions() {
  selectDef();
  return currentElement;
}

inputSubmit.addEventListener('click', (event) => {
  submitInput()
});

function submitInput() {
  isPos = false;
  isDef = false;
  list = JSON.parse(inputText.value);
  counter = 0;
  showPos();
}

copy.addEventListener('click', (e) => {
  // e.preventDefault()
 copyResult()
});

function copyResult() {
  outputText.select();
  outputText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(outputText.value);
}

async function showNextCard() {
  counter++;
  if (counter >= list.length) {
    wordPart.innerHTML = '<h1>FINISHED</h1>';
    listPart.innerHTML = '';
    outputText.value = JSON.stringify(result, null, 2);
    finish = true
    return;
  }
  showPos();
}

window.addEventListener('keydown', async (event) => {
  if (!finish) {
    if (event.code === 'ArrowDown' && isDef && focusIndex < checkboxes.length -
        1) {
      event.preventDefault();
      focusIndex++;
      checkboxes[focusIndex]?.focus();
    }
    if (event.code === 'ArrowUp' && isDef && focusIndex > 0) {
      event.preventDefault();
      focusIndex--;
      checkboxes[focusIndex]?.focus();
    }
    if (event.code === 'ArrowDown' && isPos && focusIndex < checkboxes.length -
        1) {
      await sleep(10);
      focusIndex++;
      checkboxes[focusIndex]?.focus();
      checkboxes.forEach(el => el.checked = false);
      checkboxes[focusIndex].checked = true;
      previewElement();
    }
    if (event.code === 'ArrowUp' && isPos && focusIndex > 0) {
      await sleep(10);
      focusIndex--;
      checkboxes[focusIndex]?.focus();
      checkboxes.forEach(el => el.checked = false);
      checkboxes[focusIndex].checked = true;
      previewElement();
    }
    if (event.code === 'ArrowLeft' && isPos) {
      event.preventDefault();
      isDef = false;
      if (counter > 0) {
        counter--;
        counter--;
        result.pop();
        showNextCard();
      }
    } else if (event.code === 'ArrowLeft' && isDef) {
      isDef = false;
      showPos();
    }
    if (event.code === 'Enter' && isDef) {
      event.preventDefault();
      if ([...document.querySelectorAll('.checkbox')].filter(
          checkbox => checkbox.checked).length > 0) {
        isDef = false;
        isPos = false;
        result.push(returnDefinitions());
      }
    }
    if (event.code === 'Enter' && isPos) {
      event.preventDefault();
      isDef = false;
      showDefinitions();
    }
    if (event.code === 'Enter' && !isDef && !isPos) {
      showNextCard();
    }
  }
  if(event.code === 'KeyS') {
	submitInput()
  }
  if (event.code === 'KeyC') {
    copyResult()
  }
});

function colorRed(topic, needTopic, isIdm) {
  if (isIdm) {
    if (topic?.trim() === needTopic?.trim()) {
      return `<span style="color: red;">${topic}</span>`;
    }
  } else if (topic?.trim()?.match(`${needTopic?.trim()}`))
    return `<span style="color: red;">${topic}</span>`;
  return topic;
}