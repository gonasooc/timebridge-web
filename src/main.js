import "./styles.css";
import "./coaching.css";
import { PERSONA, TOPICS, CONCERNS, ERAS } from "./sample-data.js";

for (const slot of document.querySelectorAll("[data-current-year]")) {
  slot.textContent = String(new Date().getFullYear());
}

if (document.querySelector(".coaching-app")) initCoachingPreview();

function initCoachingPreview() {
  const directionForm = document.querySelector("#direction-form");
  const consultForm = document.querySelector("#consult-form");
  const summary = document.querySelector("#consult-summary");
  const storageKey = "timebridge:direction:v1";
  const allowed = {
    target: ["mother", "father"],
    birthEra: ERAS.map((era) => era.id),
    topic: [...TOPICS.map((topic) => topic.id), "unknown"],
    concerns: CONCERNS.map((concern) => concern.id),
  };
  let direction = readDirection();
  let directionAttempted = false;
  let consultAttempted = false;

  // 가장 먼저 기본 제출을 차단한다. 연락처 폼에는 전송 경로나 통신 처리를 두지 않는다.
  directionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    directionAttempted = true;
    if (validateForm(directionForm)) window.location.hash = "sample";
  });
  consultForm.addEventListener("submit", (event) => {
    event.preventDefault();
    consultAttempted = true;
    if (validateForm(consultForm)) showDraft();
  });

  buildChoices();
  restoreChoices();
  consultForm.reset();

  directionForm.addEventListener("change", () => {
    const data = new FormData(directionForm);
    direction = sanitizeDirection({
      target: data.get("target"),
      birthEra: data.get("birthEra"),
      topic: data.get("topic"),
      concerns: data.getAll("concerns"),
    });
    // 선택지의 열거 값만 저장한다. 이름과 이메일은 이 저장소에 넣지 않는다.
    try { sessionStorage.setItem(storageKey, JSON.stringify(direction)); } catch { /* 저장소가 꺼져 있어도 화면을 사용할 수 있다. */ }
    if (directionAttempted) validateForm(directionForm, false);
  });

  consultForm.addEventListener("input", () => {
    if (consultAttempted) validateForm(consultForm, false);
  });
  consultForm.addEventListener("change", () => {
    if (consultAttempted) validateForm(consultForm, false);
  });

  document.querySelector(".skip-link").addEventListener("click", (event) => {
    event.preventDefault();
    const main = document.querySelector("#main");
    main.focus({ preventScroll: true });
    main.scrollIntoView({ behavior: "instant", block: "start" });
  });

  document.querySelector("#edit-draft").addEventListener("click", () => {
    summary.hidden = true;
    consultForm.hidden = false;
    document.querySelector("#display-name").focus();
  });
  document.querySelector("#clear-draft").addEventListener("click", () => {
    clearDraft();
    document.querySelector("#display-name").focus();
  });
  // 브라우저가 이전 문서의 DOM을 복원하는 경우에도 연락처를 남기지 않는다.
  window.addEventListener("pagehide", clearDraft);
  window.addEventListener("pageshow", (event) => { if (event.persisted) clearDraft(); });

  for (const button of document.querySelectorAll('button[type="submit"]')) button.disabled = false;
  window.addEventListener("hashchange", () => renderRoute(true));
  renderRoute(false);

  function textNode(tag, content, className) {
    const node = document.createElement(tag);
    if (content != null) node.textContent = content;
    if (className) node.className = className;
    return node;
  }

  function makeChoice(name, value, title, description, checkbox = false) {
    const label = textNode("label", null, "choice " + (checkbox ? "concern-choice" : description ? "topic-choice" : "compact-choice"));
    const input = document.createElement("input");
    input.type = checkbox ? "checkbox" : "radio";
    input.name = name;
    input.value = value;
    input.required = !checkbox;
    if (!checkbox) input.setAttribute("aria-describedby", name + "-error");
    const content = textNode("span");
    content.append(textNode("span", title, description ? "choice-title" : ""));
    if (description) content.append(textNode("span", description, "choice-description"));
    label.append(input, content);
    return label;
  }

  function buildChoices() {
    const eras = document.querySelector("#era-choices");
    ERAS.forEach((era) => eras.append(makeChoice("birthEra", era.id, era.label)));
    const topics = document.querySelector("#topic-choices");
    TOPICS.forEach((topic) => topics.append(makeChoice("topic", topic.id, topic.title, topic.description)));
    topics.append(makeChoice("topic", "unknown", "아직 잘 모르겠어요", "익숙한 기억부터 가볍게 시작하는 질문을 보여드릴게요."));
    const concerns = document.querySelector("#concern-choices");
    CONCERNS.forEach((concern) => concerns.append(makeChoice("concerns", concern.id, concern.title, "", true)));
  }

  function sanitizeDirection(raw) {
    const result = { target: "", birthEra: "", topic: "", concerns: [] };
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return result;
    for (const field of ["target", "birthEra", "topic"]) {
      if (allowed[field].includes(raw[field])) result[field] = raw[field];
    }
    if (Array.isArray(raw.concerns)) result.concerns = allowed.concerns.filter((id) => raw.concerns.includes(id));
    return result;
  }

  function readDirection() {
    try { return sanitizeDirection(JSON.parse(sessionStorage.getItem(storageKey))); }
    catch { return sanitizeDirection(null); }
  }

  function restoreChoices() {
    for (const input of directionForm.querySelectorAll("input")) {
      input.checked = input.name === "concerns" ? direction.concerns.includes(input.value) : direction[input.name] === input.value;
    }
  }

  function hasDirection() {
    return ["target", "birthEra", "topic"].every((field) => allowed[field].includes(direction[field]));
  }

  function validateForm(form, focus = true) {
    const fields = [...new Set([...form.querySelectorAll("input[required]")].map((input) => input.name))];
    let firstInvalid;
    for (const name of fields) {
      const inputs = [...form.querySelectorAll('input[name="' + name + '"]')];
      const valid = inputs[0].type === "radio"
        ? inputs.some((input) => input.checked)
        : inputs[0].value.trim().length > 0 && inputs[0].validity.valid;
      const error = document.getElementById(name + "-error");
      error.hidden = valid;
      inputs.forEach((input) => {
        if (valid) input.removeAttribute("aria-invalid");
        else input.setAttribute("aria-invalid", "true");
      });
      if (!valid && !firstInvalid) firstInvalid = inputs[0];
    }
    if (firstInvalid && focus) firstInvalid.focus();
    return !firstInvalid;
  }

  function selectionLabel() {
    const era = ERAS.find((item) => item.id === direction.birthEra);
    const topic = TOPICS.find((item) => item.id === direction.topic);
    return [
      direction.target === "mother" ? "어머니" : "아버지",
      era?.id === "unknown" ? "출생 연대 미정" : era?.label,
      topic?.title || "주제 함께 고르기",
    ].join(" · ");
  }

  function renderSample() {
    const topic = TOPICS.find((item) => item.id === direction.topic) || TOPICS[0];
    const era = ERAS.find((item) => item.id === direction.birthEra);
    const parent = direction.target === "mother" ? "어머니" : "아버지";
    const headings = {
      childhood: parent + "가 자라던 동네로,\n첫 질문을 건네봐요.",
      work: parent + "의 처음을,\n조금 더 알아가요.",
      parenting: parent + "와 내가 기억하는,\n그때의 우리를 만나요.",
      unknown: parent + "의 익숙한 기억부터,\n천천히 시작해요.",
    };
    document.querySelector("#sample-heading").textContent = headings[direction.topic];
    document.querySelector("#sample-selection").textContent = selectionLabel();
    document.querySelector("#sample-context").textContent = direction.topic === "unknown"
      ? "아직 주제를 정하지 않아도 괜찮아요. 우선 어린 시절의 장소와 사람을 떠올리는 예시를 준비했어요."
      : "고른 주제를 바탕으로 만든 질문 미리보기예요. 실제 코칭에서는 상담을 통해 우리 가족에게 맞게 다듬어요.";
    document.querySelector("#sample-opener").textContent = "“" + topic.opener + "”";
    document.querySelector("#sample-questions").replaceChildren(...topic.questions.map((question) => textNode("li", question)));
    document.querySelector("#era-question").textContent = era.question;
    document.querySelector("#era-context").textContent = era.context;
    document.querySelector("#sample-disclosure").textContent = PERSONA.disclosure + " 선택한 부모님과는 별개의 고정 인물 예시예요.";
    document.querySelector("#persona-description").textContent = PERSONA.birthYear + "년생 · " + PERSONA.hometown + " · " + PERSONA.relationship;
    document.querySelector("#sample-coach-note").textContent = topic.coachNote;
    document.querySelector("#sample-excerpt").replaceChildren(...topic.excerpt.map((entry) => {
      const row = textNode("div", null, "transcript-entry" + (entry.speaker === "자녀" ? " is-child" : ""));
      const speaker = textNode("div", entry.speaker, "transcript-speaker");
      speaker.append(textNode("span", entry.time));
      row.append(speaker, textNode("p", entry.text));
      return row;
    }));
    document.querySelector("#sample-goals").replaceChildren(...topic.goals.map((goal, index) => {
      const li = textNode("li");
      li.append(textNode("span", (index + 1) + "번째 인터뷰"), textNode("h3", goal.title), textNode("p", goal.description));
      return li;
    }));
    const concerns = CONCERNS.filter((concern) => direction.concerns.includes(concern.id));
    const concernHelp = document.querySelector("#sample-concerns");
    concernHelp.hidden = concerns.length === 0;
    concernHelp.replaceChildren(...concerns.map((concern) => {
      const block = textNode("div");
      block.append(textNode("h3", concern.title), textNode("p", concern.help));
      return block;
    }));
  }

  function renderRoute(shouldFocus) {
    const hash = window.location.hash.slice(1) || "home";
    const anchor = ["process", "package", "faq", "main"].includes(hash) ? hash : null;
    let route = ["home", "direction", "sample", "consult"].includes(hash) ? hash : "home";
    if (["sample", "consult"].includes(route) && !hasDirection()) {
      route = "direction";
      history.replaceState(null, "", "#direction");
    }
    if (route === "sample") renderSample();
    if (route === "consult") {
      document.querySelector("#consult-selection").textContent = selectionLabel();
      if (!summary.hidden) renderDraftDetails();
    }
    for (const panel of document.querySelectorAll("[data-page]")) panel.hidden = panel.dataset.page !== route;
    document.querySelector("[data-journey]").hidden = route === "home";
    for (const step of document.querySelectorAll("[data-step]")) {
      if (step.dataset.step === route) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    }
    const titles = { home: "부모님의 이야기를 듣는 8주", direction: "인터뷰 방향 고르기", sample: "우리 부모님 인터뷰 샘플", consult: "상담 내용 준비하기" };
    document.title = "타임브릿지 — " + titles[route];
    if (anchor) {
      const target = document.getElementById(anchor);
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "instant", block: "start" });
        if (anchor === "main") target.focus({ preventScroll: true });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
      if (shouldFocus) document.getElementById(route + "-heading").focus({ preventScroll: true });
    }
  }

  function renderDraftDetails() {
    const data = new FormData(consultForm);
    const labelFor = (name) => consultForm.querySelector('input[name="' + name + '"]:checked')?.closest("label").textContent.trim() || "";
    const entries = [
      ["인터뷰 방향", selectionLabel()],
      ["이름 또는 별칭", data.get("displayName").trim()],
      ["이메일", data.get("email").trim()],
      ["시작 시기", labelFor("timing")],
      ["대화 방식", labelFor("interviewMethod")],
      ["부모님 의향", labelFor("parentReadiness")],
    ];
    // 입력 문자열은 HTML로 해석하지 않고 텍스트로만 표시한다.
    document.querySelector("#summary-details").replaceChildren(...entries.map(([label, value]) => {
      const row = textNode("div");
      row.append(textNode("dt", label), textNode("dd", value));
      return row;
    }));
  }

  function showDraft() {
    renderDraftDetails();
    consultForm.hidden = true;
    summary.hidden = false;
    document.querySelector("#summary-heading").focus({ preventScroll: true });
    summary.scrollIntoView({ behavior: "instant", block: "start" });
  }

  function clearDraft() {
    consultForm.reset();
    consultForm.hidden = false;
    summary.hidden = true;
    consultAttempted = false;
    document.querySelector("#summary-details").replaceChildren();
    for (const error of consultForm.querySelectorAll(".field-error")) error.hidden = true;
    for (const input of consultForm.querySelectorAll("[aria-invalid]")) input.removeAttribute("aria-invalid");
  }
}
