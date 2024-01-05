const signalCDNJS = await import('//cdn.skypack.dev/usignal@0.8.0/solid');
const uhtmlCDNJS = await import('//unpkg.com/uhtml');

const { createSignal, createEffect, createMemo } = signalCDNJS;
const { render, html, svg } = uhtmlCDNJS;

const [answers, setAnswers] = createSignal([]);
const [buttonDisabled, setButtonDisabled] = createSignal(true);
const [questionVisible, setQuestionVisible] = createSignal(0);
const [overlayVisible, setOverlayVisible] = createSignal(true);
const [popupVisible, setPopupVisible] = createSignal(true);
const [answersVisible, setAnswersVisible] = createSignal([
  false,
  false,
  false,
  false,
]);
const [tooltip, setTooltip] = createSignal(null);
const [questions] = createSignal([
  'What activities bring you joy and make you lose track of time?',
  'What are your favorite hobbies and passions?',
  'What experiences in your life have left you with a feeling of happiness and deep satisfaction?',
  'If money were no object, how would you spend most of your days?',
  'What natural skills or talents do you possess?',
  'In what areas do others recognize you as competent or gifted?',
  'What tasks or activities do you find easy to accomplish?',
  'What accomplishments are you most proud of in your life so far?',
  'What problems or challenges in the world particularly affect you?',
  'How would you like to help make the world a better place?',
  'What skills or resources do you have that could meet a need in society?',
  'If you had the power to solve a world problem, which one would you choose?',
  'What professional skills have you developed over time?',
  'In what area do you see yourself excelling professionally?',
  'What types of services or products could be valued on the market?',
  'If you could choose any job, what would it be?',
]);

const overlaps = {
  'overlap-delight': [0, 4, 'What you like:'],
  'overlap-excitement': [8, 12, 'What the world needs:'],
  'overlap-comfort': [12, 16, 'What you can get paid for:'],
  'overlap-satisfaction': [4, 8, 'What you are good at:'],
};

const TooltipElement = (() => {
  const map = new WeakMap();

  return (el) => {
    let tip = null;
    let arrow = null;
    let txt = null;
    let ul = null;

    if (!map.has(el)) {
      // tooltip text
      txt = document.getElementsByClassName(el.id)[0];
      // tooltip DOM obj
      tip = document.createElement('div');
      tip.classList.add('tooltip');
      tip.innerText = txt.getAttribute('data-tooltip');
      document.body.appendChild(tip);
      // tooltip-arrow DOM obj
      arrow = document.createElement('div');
      arrow.classList.add('tooltip-arrow');
      tip.appendChild(arrow);
      // tooltip-list DOM obj
      ul = document.createElement('ul');
      ul.setAttribute('title', overlaps[el.id].pop());
      tip.appendChild(ul);
      Array.prototype.slice
        .apply(answers(), overlaps[el.id])
        .forEach((answer) => {
          let li = document.createElement('li');
          ul.appendChild(li);
          li.innerText = `${answer}`.replace(/\n|\r/g, ' ');
        });
      map.set(el, [tip, arrow, txt, ul]);
    }

    let els = map.get(el);
    let visibility = answersVisible()[Object.keys(overlaps).indexOf(el.id)];

    els[els.length - 1][visibility ? 'setAttribute' : 'removeAttribute'](
      'visible',
      ''
    );

    return els;
  };
})();

const TooltipCallback = (tip, arrow, e) => {
  if (e) {
    tip.style.opacity = 1;
    arrow.style.visibility = tip.style.visibility = 'visible';
    e.stopPropagation();
  } else {
    tip.style.opacity = 0;
    arrow.style.visibility = tip.style.visibility = 'hidden';
  }
};

const Tooltip = (stop) => {
  return (e) => {
    const [tip, arrow, txt] = TooltipElement(e.target);
    let elPos = txt.getBoundingClientRect();
    let tipPos = tip.getBoundingClientRect();
    tip.style.left = elPos.left + (elPos.width - tipPos.width) / 2 + 'px';
    tip.style.top = elPos.bottom + 5 + 'px';
    arrow.style.left = tipPos.width / 2 - 5 + 'px';
    tip.style.zIndex = stop ? '1' : '-1';
    TooltipCallback(tip, arrow, stop && e);
  };
};

const Popup = () => html`
  <div class="popup" ?visible=${popupVisible()}>
    <!--<button class="popup__close">&#x2715;</button>-->
    ${questions().map(
      (value, index) => html`
        <div class="popup__content" ?visible=${index === questionVisible()}>
          <h2 class="popup__title">${value}</h2>
          <p class="popup__subtitle">Take this 16 questions quiz and discover your Ikigai overlappings!</p>
          <div class="popup__progress">
          ${questions().map(
            (value2, index2) => html`
                <div class="popup__progress-item" ?active=${index2 === index}>
                ${
                  (0 === index2 && questionVisible() > 0) ||
                  (index2 > 0 && index > index2)
                    ? '🗸'
                    : index2 + 1
                }</div>
                <div class="popup__progress-line" ?visible=${
                  index2 < questions().length - 1
                }></div>
              `
          )}
          </div>
          <div class="quiz">
            <textarea onblur=${(e) =>
              setAnswers(answers().concat(e.target.value))} onkeyup=${(e) =>
        setButtonDisabled(/^\s*$/.test(e.target.value))} pattern=".*\S.*"
              id=${'textArea' + index}
              name=${'textArea' + index}
              class="popup__textarea" rows="12" cols="32"></textarea>
            <button class="popup__button" id=${'popupButton' + index}
              disabled=${buttonDisabled()}
              @click=${() =>
                setOverlayVisible(
                  questions().length - 1 !== questionVisible()
                ) ||
                setPopupVisible(questions().length - 1 !== questionVisible()) ||
                setButtonDisabled(true) ||
                setQuestionVisible(1 + questionVisible())}>Next</button>
          </div>
        </div>`
    )}
  </div>
`;

const Overlay = () => html`
  <div class="overlay" ?visible=${overlayVisible()}></div>
`;

const Ikigai = () => svg`
  <svg class="ikigai" viewBox="0 0 185.5 185.5" xmlns="http://www.w3.org/2000/svg">
  <g class="lvl-1">
    <path
      class="love"
      d="M92.75,47.34A57.49,57.49,0,0,1,147,38.48a57.51,57.51,0,0,0-108.54,0,57.49,57.49,0,0,1,54.27,8.86Z"
    />
    <text x="50%" y="11%" class="small">What you</text>
    <text x="50%" y="14%">Love</text>
    <path
      class="needs"
      d="M185.5,92.75A57.53,57.53,0,0,0,147,38.48a57.49,57.49,0,0,1-8.86,54.27A57.49,57.49,0,0,1,147,147,57.53,57.53,0,0,0,185.5,92.75Z"
    />
    <text x="88%" y="48.5%" class="small">What the world</text>
    <text x="88%" y="51.5%">Needs</text>
    <path
      class="money"
      d="M92.75,138.16A57.49,57.49,0,0,1,38.48,147,57.51,57.51,0,0,0,147,147a57.49,57.49,0,0,1-54.27-8.86Z"
    />
    <text x="50%" y="86%" class="small">What you can be</text>
    <text x="50%" y="89%">paid for</text>
    <path
      class="skills"
      d="M47.34,92.75a57.49,57.49,0,0,1-8.86-54.27,57.51,57.51,0,0,0,0,108.54,57.49,57.49,0,0,1,8.86-54.27Z"
    />
    <text x="12%" y="48.5%" class="small">What you're</text>
    <text x="12%" y="51.5%">good at</text>
  </g>
  <g class="lvl-2">
    <path
      class="mission"
      d="M92.75,47.34a57.61,57.61,0,0,1,19,26.39,57.61,57.61,0,0,1,26.39,19A57.49,57.49,0,0,0,147,38.48a57.49,57.49,0,0,0-54.27,8.86Z"
    />
    <text x="69%" y="31%">Mission</text>
    <path
      class="vocation"
      d="M138.16,92.75a57.61,57.61,0,0,1-26.39,19,57.61,57.61,0,0,1-19,26.39A57.49,57.49,0,0,0,147,147a57.49,57.49,0,0,0-8.86-54.27Z"
    />
    <text x="69%" y="69%">Vocation</text>
    <path
      class="profession"
      d="M92.75,138.16a57.61,57.61,0,0,1-19-26.39,57.61,57.61,0,0,1-26.39-19A57.49,57.49,0,0,0,38.48,147a57.49,57.49,0,0,0,54.27-8.86Z"
    />
    <text x="31%" y="69%">Profession</text>
    <path
      class="passion"
      d="M47.34,92.75a57.61,57.61,0,0,1,26.39-19,57.61,57.61,0,0,1,19-26.39,57.49,57.49,0,0,0-54.27-8.86,57.49,57.49,0,0,0,8.86,54.27Z"
    />
    <text x="31%" y="31%">Passion</text>
  </g>
  <g class="lvl-3" @mouseout=${Tooltip()} @mouseover=${Tooltip(true)}
  @click=${(e) => {
    setAnswersVisible([
      ...answersVisible().slice(0, Object.keys(overlaps).indexOf(e.target.id)),
      !answersVisible()[Object.keys(overlaps).indexOf(e.target.id)],
      ...answersVisible().slice(Object.keys(overlaps).indexOf(e.target.id) + 1),
    ]);

    e.target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  }}>
    <path
      class="delight"
      d="M111.77,73.73a57.61,57.61,0,0,0-19-26.39,57.61,57.61,0,0,0-19,26.39,57.62,57.62,0,0,1,38,0Z"
      id="overlap-delight"
    >
    </path>
    <text x="50%" y="33%" id="overlap-01" class="overlap-delight" data-tooltip="Delight and fullness, but no wealth">click</text>
    <path
      class="excitement"
      d="M111.77,73.73a57.62,57.62,0,0,1,0,38,57.61,57.61,0,0,0,26.39-19A57.61,57.61,0,0,0,111.77,73.73Z"
      id="overlap-excitement"
    >
    </path>
    <text x="67%" y="50%" id="overlap-02" class="overlap-excitement" data-tooltip="Excitement and complacency, but sense of uncertainty">click</text>
    <path
      class="comfort"
      d="M73.73,111.77a57.61,57.61,0,0,0,19,26.39,57.61,57.61,0,0,0,19-26.39,57.62,57.62,0,0,1-38,0Z"
      id="overlap-comfort"
    >
    </path>
    <text x="50%" y="67%" id="overlap-03" class="overlap-comfort" data-tooltip="Comfortable, but feeling of emptiness">click</text>
    <path
      class="satisfaction"
      d="M73.73,73.73a57.61,57.61,0,0,0-26.39,19,57.61,57.61,0,0,0,26.39,19,57.62,57.62,0,0,1,0-38Z"
      id="overlap-satisfaction"
    >
    </path>
    <text x="33%" y="50%" id="overlap-04" class="overlap-satisfaction" data-tooltip="Satisfaction, but feeling of uselessness">click</text>
  </g>
  <g class="lvl-4">
    <path
      class="ikigai"
      d="M111.77,73.73a57.62,57.62,0,0,0-38,0,57.62,57.62,0,0,0,0,38,57.62,57.62,0,0,0,38,0,57.62,57.62,0,0,0,0-38Z"
    />
    <text x="50%" y="50%">Ikigai</text>
  </g>
  </svg>
`;

createEffect(() => {
  render(
    document.body,
    html`
      ${Ikigai()}
      ${Overlay()}
      ${Popup()}
    `
  );
});
