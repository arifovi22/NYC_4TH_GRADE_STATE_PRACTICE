// Quest Academy — Grade 4 NYC / NYS Math + ELA practice
// ELA is organized around Grade 4 NYS Next Generation ELA skills.

var score = 0, streak = 0, progress = 0;
var currentAnswer = null, currentQuestion = null, selectedOption = null;
var coachExplanationString = "";

var subjectSelect = document.getElementById("subjectSelect");
var gradeSelect = document.getElementById("gradeSelect");
var questionText = document.getElementById("questionText");
var userAnswer = document.getElementById("userAnswer");
var submitBtn = document.getElementById("submitBtn");
var feedback = document.getElementById("feedback");
var scoreDisplay = document.getElementById("score");
var streakDisplay = document.getElementById("streak");
var progressBar = document.getElementById("progressBar");
var explanationBox = document.getElementById("explanationBox");
var explanationText = document.getElementById("explanationText");
var understandBtn = document.getElementById("understandBtn");
var optionsBox = document.getElementById("optionsBox");
var canvas = document.getElementById("confetti-canvas");
var ctx = canvas ? canvas.getContext("2d") : null;
var particles = [];
var colors = ["#facc15", "#f43f5e", "#3b82f6", "#10b981", "#a855f7", "#f97316"];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy;
}

// A "shuffle bag" hands out every index 0..count-1 exactly once, in random
// order, before any index repeats — and it also makes sure the very first
// item of a new bag never matches the last item of the previous one. This is
// what stops the same question/problem type from showing up again and again.
function makeShuffleBag(count) {
    var bag = [];
    var lastIndex = -1;
    return function next() {
        if (bag.length === 0) {
            bag = shuffle(Array.from({ length: count }, function(_, i) { return i; }));
            if (bag.length > 1 && bag[0] === lastIndex) {
                var tmp = bag[0]; bag[0] = bag[1]; bag[1] = tmp;
            }
        }
        lastIndex = bag.shift();
        return lastIndex;
    };
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas); resizeCanvas();
function spawnConfetti() {
    if (!ctx || !canvas) return;
    for (var i = 0; i < 120; i++) particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4, d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)], tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * .07 + .02, tiltAngle: 0
    });
    animateConfetti();
}
function animateConfetti() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height); var active = false;
    particles.forEach(function(p, i) {
        p.tiltAngle += p.tiltAngleIncremental; p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle); p.tilt = Math.sin(p.tiltAngle - i / 3) * 15;
        if (p.y <= canvas.height) active = true;
        ctx.beginPath(); ctx.lineWidth = p.r; ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y); ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2); ctx.stroke();
    });
    if (active) requestAnimationFrame(animateConfetti); else particles = [];
}

function setQuestionUI(type) {
    selectedOption = null;
    feedback.textContent = ""; feedback.className = "";
    explanationBox.classList.add("hidden"); submitBtn.disabled = false;
    userAnswer.disabled = false; userAnswer.value = "";
    if (typeof clearWhiteboard === "function") clearWhiteboard(); // fresh scratch pad for each new question
    if (type === "mcq") {
        userAnswer.classList.add("hidden"); optionsBox.classList.remove("hidden");
    } else {
        userAnswer.classList.remove("hidden"); optionsBox.classList.add("hidden");
    }
}
function makeMathQuestion(question, answer, explanation, standard) {
    currentQuestion = { type: "number", standard: standard }; currentAnswer = answer;
    coachExplanationString = "<strong>" + standard + "</strong><br>" + explanation;
    questionText.innerHTML = question; setQuestionUI("number");
}
function makeELAQuestion(question, options, answer, explanation, standard, category) {
    currentQuestion = { type: "mcq", standard: standard, category: category || "Reading" };
    currentAnswer = answer; coachExplanationString = "<strong>" + standard + " • " + (category || "Reading") + "</strong><br>" + explanation;
    questionText.innerHTML = question; optionsBox.innerHTML = "";
    shuffle(options).forEach(function(option) {
        var btn = document.createElement("button"); btn.type = "button"; btn.className = "answer-option";
        btn.innerText = option; btn.dataset.answer = option;
        btn.addEventListener("click", function() {
            optionsBox.querySelectorAll(".answer-option").forEach(function(b) { b.classList.remove("selected"); });
            btn.classList.add("selected"); selectedOption = option;
        }); optionsBox.appendChild(btn);
    });
    setQuestionUI("mcq");
}

var nextMathType = makeShuffleBag(22); // 22 question templates for Grade 4 math
function generateMathGrade4() {
    var type = nextMathType() + 1; // bag gives 0..21, templates below are numbered 1..22
    if (type === 1) {
        var a = randInt(3, 12), m = randInt(2, 9); makeMathQuestion("A book costs $"+a+". A board game costs "+m+" times as much. How much does it cost?", a*m, "“Times as much” means multiply...", "NY-4.NBT.2");
    } else if (type === 2) {
        var x=randInt(1000,9000), y=randInt(100,900), z=randInt(20,300), ans=x-y+z; makeMathQuestion("A library has "+x+" books. It lends "+y+" and receives "+z+" new books. How many books now?", ans, "Add and subtract the numbers to find the current total.", "NY-4.OA.1");
    } else if (type === 3) {
        var n=[12,18,20,24,28,30,36,40,42,48][randInt(0,9)], factors=[]; for(var f=2;f<=n;f++) if(n%f===0) factors.push(f); var factor=factors[randInt(0,factors.length-1)]; makeMathQuestion("Which factor divides evenly into "+n+"?", factor, "Factors are numbers that divide evenly without remainder.", "NY-4.NBT.4");
    } else if (type === 4) {
        var prime=[2,3,5,7,11,13,17,19,23,29][randInt(0,9)]; makeMathQuestion("Is "+prime+" prime? Enter 1 for yes or 0 for no.", 1, prime+" has exactly two factors: 1 and "+prime+".", "NY-4.OA.4");
    } else if (type === 5) {
        var start=randInt(2,20), step=randInt(2,9), next=start+step*4; makeMathQuestion("A pattern starts "+start+", "+(start+step)+", "+(start+step*2)+", "+(start+step*3)+". What is next?", next, "Find the common difference and add it to the last shown term.", "NY-4.OA.2");
    } else if (type === 6) {
        var num=randInt(10000,999999), place=[1000,10000,100000][randInt(0,2)], rounded=Math.round(num/place)*place; makeMathQuestion("Round "+num.toLocaleString()+" to the nearest "+place+".", rounded, "Look at the digits to the right of the place value to decide rounding.", "NY-4.NBT.3");
    } else if (type === 7) {
        var n1=randInt(1000,9999), n2=randInt(1000,9999); makeMathQuestion("Solve: "+n1.toLocaleString()+" + "+n2.toLocaleString(), n1+n2, "Add each place carefully from right to left. The sum is the total.", "NY-4.NBT.4");
    } else if (type === 8) {
        var s1=randInt(1000,9999), s2=randInt(100,9999); if(s2>s1){var sw=s1;s1=s2;s2=sw;} makeMathQuestion("Solve: "+s1.toLocaleString()+" − "+s2.toLocaleString(), s1-s2, "Subtract by place value borrowing where needed.", "NY-4.NBT.4");
    } else if (type === 9) {
        var m1=randInt(10,99), m2=randInt(10,99); makeMathQuestion("Solve: "+m1+" × "+m2, m1*m2, "Use partial products: multiply tens and ones, then add the partial products.", "NY-4.NBT.5");
    } else if (type === 10) {
        var md=randInt(2,9), mq=randInt(20,100), mr=randInt(0,md-1), divd=md*mq+mr; makeMathQuestion("What is the whole-number quotient of "+divd+" ÷ "+md+"?", mq, "The quotient is "+mq+" because dividing gives the whole number part.", "NY-4.NBT.6");
    } else if (type === 11) {
        var den=[2,3,4,5,6,8,10,12][randInt(0,7)], nn=randInt(1,den-1), en=nn*2, ed=den*2; makeMathQuestion("What numerator makes an equivalent fraction? "+nn+"/"+den+" = ?/"+ed, en, "Multiply numerator and denominator by the same factor to get an equivalent fraction.", "NY-4.NF.1");
    } else if (type === 12) {
        var cd=[2,3,4,5,6,8,10,12][randInt(0,7)], p=randInt(1,cd-1), q=randInt(1,cd-1); makeMathQuestion("Add "+p+"/"+cd+" + "+q+"/"+cd+". Enter the numerator before simplifying.", p+q, "Add the numerators when denominators are the same.", "NY-4.NF.2");
    } else if (type === 13) {
        var fd=randInt(2,8), fn=randInt(1,fd-1), whole=randInt(2,6); makeMathQuestion("Find the numerator before simplifying: "+whole+" × "+fn+"/"+fd, whole*fn, "Multiply the whole number by the numerator and keep the denominator.", "NY-4.NF.3");
    } else if (type === 14) {
        var den1=randInt(2,8), den2=randInt(2,8), a1=randInt(1,den1-1), a2=randInt(1,den2-1); var left=a1/den1, right=a2/den2; makeMathQuestion("Which fraction is greater? A: "+a1+"/"+den1+" or B: "+a2+"/"+den2+"?", left>right?"A":"B", "Compare fractions by converting to common denominators or comparing decimal values.", "NY-4.NF.2");
    } else if (type === 15) {
        var feet=randInt(2,8), inches=randInt(1,11); makeMathQuestion("How many inches are in "+feet+" feet "+inches+" inches?", feet*12+inches, "Each foot is 12 inches: "+feet+" × 12 + "+inches+".", "NY-4.MD.1");
    } else if (type === 16) {
        var lengths=[2,3,4,5,6,7,8,9], vals=lengths.map(function(){return randInt(1,10);}); var total=vals.reduce(function(a,b){return a+b;},0); makeMathQuestion("A line plot has measurements: "+vals.join(", ")+". What is the total?", total, "Add the values shown on the line plot.", "NY-4.MD.2");
    } else if (type === 17) {
        var len=randInt(4,20), wid=randInt(3,12); makeMathQuestion("A rectangle is "+len+" units by "+wid+" units. What is its perimeter?", 2*(len+wid), "Perimeter = 2 × (length + width).", "NY-4.MD.3");
    } else if (type === 18) {
        var areaL=randInt(4,15), areaW=randInt(3,10); makeMathQuestion("A rectangle is "+areaL+" units by "+areaW+" units. What is its area?", areaL*areaW, "Area = length × width.", "NY-4.MD.4");
    } else if (type === 19) {
        var ang=randInt(10,170), code=ang<90?1:ang===90?2:3; makeMathQuestion("An angle measures "+ang+"°. Enter 1 for acute, 2 for right, or 3 for obtuse.", code, "Less than 90° is acute; exactly 90° is right; greater is obtuse.", "NY-4.G.1");
    } else if (type === 20) {
        var aA=randInt(20,160), aB=180-aA; makeMathQuestion("Two angles form a straight angle. One measures "+aA+"°. What is the other angle?", aB, "A straight angle measures 180°. So 180 − the given angle.", "NY-4.G.2");
    } else if (type === 21) {
        var sides=randInt(3,8); makeMathQuestion("A shape has "+sides+" equal sides. What is the total length if each side is 6 units?", sides*6, "Add equal sides: number of sides × side length.", "NY-4.G.3");
    } else {
        var q=randInt(1,3); var text=q===1?"A quadrilateral has four right angles and opposite sides equal.":q===2?"A quadrilateral has four equal sides and four right angles.":"A quadrilateral has four sides that are not parallel or equal."; makeMathQuestion(text, 0, "Review quadrilateral properties.", "NY-4.G.4");
    }
}

var elaQuestions = [
{cat:"Literary Reading",s:"NY-4R1",q:'<div class="passage"><b>Passage:</b> Lena had never spoken in front of the class. Her hands felt shaky, but she took a deep breath, walked to the front, and delivered her report clearly.</div>What is the best inference?',o:["She likes public speaking.","She prepared and practiced.","She was bored.","She didn't complete the report."],a:"She prepared and practiced.",e:"Her nervousness followed by a clear delivery suggests preparation."},
{cat:"Literary Reading",s:"NY-4R2",q:'<div class="passage"><b>Passage:</b> Every Saturday, Omar repaired bicycles at the community center. He cleaned chains, tightened loose brakes, and taught young riders how to shift gears.</div>What skill is Omar practicing?',o:["Community service","Cooking","Painting","Swimming"],a:"Community service",e:"Repairing bicycles for the community is an example of community service."},
/* ... many ELA items omitted for brevity in this snippet ... */
];

var nextElaQuestion = makeShuffleBag(elaQuestions.length);
function generateELA() {
    var item = elaQuestions[nextElaQuestion()];
    makeELAQuestion(item.q, item.o, item.a, item.e, item.s, item.cat);
}

function generateLegacyMath(grade) {
    var n1,n2,op;
    if(grade==="1"){n1=randInt(1,10);n2=randInt(1,10);op=Math.random()>.5?"+":"-";if(op==="-"&&n1<n2){var t=n1;n1=n2;n2=t;}makeMathQuestion(n1+" "+op+" "+n2+" = ?",op==="+"?n1+n2:n1-n2,"Count for basic addition or subtraction.","Grade 1");}
    else if(grade==="2"){n1=randInt(10,49);n2=randInt(10,49);op=Math.random()>.5?"+":"-";if(op==="-"&&n1<n2){var t2=n1;n1=n2;n2=t2;}makeMathQuestion(n1+" "+op+" "+n2+" = ?",op==="+"?n1+n2:n1-n2,"Use place value and counting strategies.","Grade 2");}
    else if(grade==="3"){n1=randInt(2,10);n2=randInt(2,10);makeMathQuestion(n1+" × "+n2+" = ?",n1*n2,"Think of equal groups or an array.","Grade 3");}
    else{n1=randInt(10,49)/10;n2=randInt(10,49)/10;var ans=parseFloat((n1+n2).toFixed(1));makeMathQuestion(n1.toFixed(1)+" + "+n2.toFixed(1)+" = ?",ans,"Align the decimal points before adding.","Grade 4");}
}
// If you run the included server.js, unlimited AI-generated questions are
// available at this path. If no server answers here (e.g. this is being
// served as plain static files), the app falls back to the built-in bank.
//
// Hosting on GitHub Pages: Pages can only serve static files, so server.js
// must run somewhere else (Render, Railway, Fly.io, a VPS, etc). Once it's
// deployed, change the line below to that server's full URL, e.g.:
//   var AI_ENDPOINT = "https://your-server.onrender.com/api/generate-question";
// Leave it as the relative path below only if app.js is served BY that same
// Node server (i.e. you're not using GitHub Pages at all).
var AI_ENDPOINT = "/api/generate-question";
var aiModeToggle = document.getElementById("aiModeToggle");

function generateQuestion() {
    var subject = subjectSelect.value, grade = gradeSelect.value;
    if (subject === "ela") { gradeSelect.value = "4"; gradeSelect.disabled = true; }
    else { gradeSelect.disabled = false; }

    if (aiModeToggle && aiModeToggle.checked) {
        fetchAIQuestion(subject, grade);
        return;
    }
    generateFromLocalBank(subject, grade);
}

function generateFromLocalBank(subject, grade) {
    if (subject === "ela") generateELA();
    else if (grade === "4") generateMathGrade4();
    else generateLegacyMath(grade);
}

function fetchAIQuestion(subject, grade) {
    questionText.textContent = "🤖 Thinking of a new question...";
    fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subject, grade: grade })
    })
        .then(function(res) {
            if (!res.ok) throw new Error("Server responded with " + res.status);
            return res.json();
        })
        .then(function(data) {
            if (data.error) throw new Error(data.error);
            if (data.type === "mcq" && Array.isArray(data.options)) {
                makeELAQuestion(data.question, data.options, data.answer, data.explanation, data.standard || "AI-generated");
            } else {
                makeMathQuestion(data.question, Number(data.answer), data.explanation, data.standard || "AI-generated");
            }
        })
        .catch(function(err) {
            // No server running, no API key configured, or a bad response —
            // fall back quietly rather than leaving the student stuck.
            console.warn("AI question generator unavailable, using the built-in question bank instead:", err.message);
            if (aiModeToggle) aiModeToggle.checked = false;
            generateFromLocalBank(subject, grade);
        });
}
function checkAnswer() {
    if (!currentQuestion) return;

    var isCorrect = false;
    var raw = userAnswer.value.trim();

    if (currentQuestion.type === "mcq") {
        if (selectedOption === null) {
            feedback.textContent = "👆 Choose an answer first!";
            feedback.className = "wrong-text";
            feedback.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }
        isCorrect = selectedOption === currentAnswer;
    } else {
        if (raw === "") return;
        var parsed = parseFloat(raw);
        isCorrect = Number.isFinite(parsed) && parsed === currentAnswer;
    }

    submitBtn.disabled = true;
    userAnswer.disabled = true;
    var buttons = optionsBox.querySelectorAll(".answer-option");
    buttons.forEach(function(b) { b.disabled = true; });

    if (isCorrect) {
        feedback.textContent = "🎉 Way to go! Correct! 🌟";
        feedback.className = "correct-text";
        score += 10;
        streak++;
        progress = Math.min(progress + 20, 100);
        progressBar.style.width = progress + "%";

        if (progress >= 100) {
            feedback.textContent = "🏆 AMAZING! LEVEL UP! 🚀";
            spawnConfetti();
            progress = 0;
            setTimeout(function() { progressBar.style.width = "0%"; }, 1200);
        }

        scoreDisplay.textContent = score;
        streakDisplay.textContent = streak;
        feedback.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(generateQuestion, 1500);
    } else {
        feedback.textContent = currentQuestion.type === "mcq"
            ? "❌ Not quite. Check the passage and evidence."
            : "❌ Not quite. Let's use Coach Help.";
        feedback.className = "wrong-text";
        streak = 0;
        progress = Math.max(progress - 10, 0);
        progressBar.style.width = progress + "%";
        explanationText.innerHTML = coachExplanationString;
        explanationBox.classList.remove("hidden");
        scoreDisplay.textContent = score;
        streakDisplay.textContent = streak;

        buttons.forEach(function(b) {
            if (b.dataset.answer === currentAnswer) b.classList.add("correct-option");
        });

        explanationBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

// --- Scratch pad / whiteboard -------------------------------------------
// A simple canvas kids can use for working out math problems or jotting
// notes on an ELA passage. Supports mouse, touch, and stylus via Pointer
// Events, with a few pen colors and an eraser. It clears automatically when
// a new question loads, so scratch work never lingers in the wrong context.
var whiteboardToggleBtn = document.getElementById("whiteboardToggleBtn");
var whiteboardPanel = document.getElementById("whiteboardPanel");
var whiteboardCanvas = document.getElementById("whiteboardCanvas");
var wbEraserBtn = document.getElementById("wbEraserBtn");
var wbClearBtn = document.getElementById("wbClearBtn");
var wbColorButtons = document.querySelectorAll(".wb-color");
var wbCtx = whiteboardCanvas ? whiteboardCanvas.getContext("2d") : null;
var wbDrawing = false;
var wbLastX = 0, wbLastY = 0;
var wbColor = "#1e3a8a";
var wbErasing = false;
var wbSized = false;

function sizeWhiteboardCanvas() {
    if (!whiteboardCanvas || !wbCtx) return;
    var ratio = window.devicePixelRatio || 1;
    var cssWidth = whiteboardCanvas.clientWidth;
    var cssHeight = whiteboardCanvas.clientHeight;
    if (cssWidth === 0 || cssHeight === 0) return; // panel is hidden; size it once it's shown instead

    // Preserve whatever was already drawn when resizing (e.g. on orientation change).
    var prev = (whiteboardCanvas.width > 0 && whiteboardCanvas.height > 0)
        ? wbCtx.getImageData(0, 0, whiteboardCanvas.width, whiteboardCanvas.height)
        : null;

    whiteboardCanvas.width = cssWidth * ratio;
    whiteboardCanvas.height = cssHeight * ratio;
    wbCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    wbCtx.lineCap = "round";
    wbCtx.lineJoin = "round";
    wbCtx.lineWidth = 3;

    if (prev) {
        // Draw the previous bitmap back in at its old pixel size (best-effort on resize).
        var tmp = document.createElement("canvas");
        tmp.width = prev.width; tmp.height = prev.height;
        tmp.getContext("2d").putImageData(prev, 0, 0);
        wbCtx.drawImage(tmp, 0, 0, prev.width / ratio, prev.height / ratio);
    }
    wbSized = true;
}

function clearWhiteboard() {
    if (!wbCtx || !whiteboardCanvas) return;
    wbCtx.clearRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
}

function wbPointerPos(e) {
    var rect = whiteboardCanvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

if (whiteboardCanvas && wbCtx) {
    whiteboardCanvas.addEventListener("pointerdown", function(e) {
        wbDrawing = true;
        if (whiteboardCanvas.setPointerCapture) {
            try { whiteboardCanvas.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        }
        var p = wbPointerPos(e);
        wbLastX = p.x; wbLastY = p.y;
        // Draw a dot for a single tap/click, not just drags.
        wbCtx.beginPath();
        wbCtx.fillStyle = wbErasing ? "#ffffff" : wbColor;
        wbCtx.arc(p.x, p.y, (wbErasing ? 10 : 1.5), 0, Math.PI * 2);
        wbCtx.fill();
    });
    whiteboardCanvas.addEventListener("pointermove", function(e) {
        if (!wbDrawing) return;
        var p = wbPointerPos(e);
        wbCtx.strokeStyle = wbErasing ? "#ffffff" : wbColor;
        wbCtx.lineWidth = wbErasing ? 20 : 3;
        wbCtx.beginPath();
        wbCtx.moveTo(wbLastX, wbLastY);
        wbCtx.lineTo(p.x, p.y);
        wbCtx.stroke();
        wbLastX = p.x; wbLastY = p.y;
    });
    function wbStopDrawing(e) {
        wbDrawing = false;
        if (whiteboardCanvas.hasPointerCapture && e && e.pointerId !== undefined) {
            try { whiteboardCanvas.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
        }
    }
    whiteboardCanvas.addEventListener("pointerup", wbStopDrawing);
    whiteboardCanvas.addEventListener("pointercancel", wbStopDrawing);
    whiteboardCanvas.addEventListener("pointerleave", wbStopDrawing);
}

if (whiteboardToggleBtn && whiteboardPanel) {
    whiteboardToggleBtn.addEventListener("click", function() {
        var opening = whiteboardPanel.classList.contains("hidden");
        whiteboardPanel.classList.toggle("hidden");
        whiteboardToggleBtn.textContent = opening
            ? "✏️ Hide Scratch Pad"
            : "✏️ Open Scratch Pad (for working out problems)";
        if (opening && !wbSized) sizeWhiteboardCanvas();
    });
}

wbColorButtons.forEach(function(btn) {
    btn.addEventListener("click", function() {
        wbColor = btn.dataset.color;
        wbErasing = false;
        wbColorButtons.forEach(function(b) { b.classList.remove("active"); });
        btn.classList.add("active");
        if (wbEraserBtn) wbEraserBtn.classList.remove("active");
    });
});

if (wbEraserBtn) {
    wbEraserBtn.addEventListener("click", function() {
        wbErasing = !wbErasing;
        wbEraserBtn.classList.toggle("active", wbErasing);
        if (wbErasing) wbColorButtons.forEach(function(b) { b.classList.remove("active"); });
    });
}

if (wbClearBtn) wbClearBtn.addEventListener("click", clearWhiteboard);

window.addEventListener("resize", function() {
    if (whiteboardPanel && !whiteboardPanel.classList.contains("hidden")) sizeWhiteboardCanvas();
});
// -------------------------------------------------------------------------

// Robust loader for external extras (keeps original local bank if loading fails)
(function(){
  // Ensure global arrays exist so the loader doesn't crash if other scripts haven't run yet.
  window.elaQuestions = window.elaQuestions || window.elaQuestions === undefined ? window.elaQuestions || [] : [];
  window.scienceQuestions = window.scienceQuestions || [];

  // Provide a minimal fallback for makeShuffleBag used elsewhere so we don't get ReferenceError.
  window.makeShuffleBag = window.makeShuffleBag || (function(){
    return function(n){
      var arr = [];
      for (var i = 0; i < n; i++) arr.push(i);
      var idx = 0;
      return function(){ if(idx>=arr.length) idx=0; return arr[idx++]; };
    };
  })();

  var paths = [
    'questions_grade4_extra.json',
    '/NYC_4TH_GRADE_STATE_PRACTICE/questions_grade4_extra.json',
    '/questions_grade4_extra.json'
  ];

  function tryLoad(index){
    if (index >= paths.length) {
      console.error('Quest loader: could not load questions_grade4_extra.json from any known path.');
      return;
    }
    var p = paths[index];
    console.log('Quest loader: attempting to fetch', p);

    fetch(p).then(function(res){
      if (!res.ok) {
        console.warn('Quest loader: fetch failed for', p, res.status, res.statusText);
        return tryLoad(index + 1);
      }
      return res.json().then(function(data){
        console.log('Quest loader: loaded data from', p, '—', Array.isArray(data) ? 'array' : 'object', data && data.length ? data.length : Object.keys(data || {}).length);

        if (Array.isArray(data)) {
          window.elaQuestions = window.elaQuestions.concat(data);
        } else {
          if (data.ela && Array.isArray(data.ela)) window.elaQuestions = window.elaQuestions.concat(data.ela);
          if (data.science && Array.isArray(data.science)) window.scienceQuestions = data.science;
        }

        try {
          window.nextElaQuestion = makeShuffleBag(window.elaQuestions.length);
        } catch (e) {
          console.warn('Quest loader: makeShuffleBag failed for ela', e);
          window.nextElaQuestion = (function(){return function(){return 0;};})();
        }
        try {
          window.nextScienceQuestion = makeShuffleBag(Math.max(1, window.scienceQuestions.length));
        } catch (e) {
          console.warn('Quest loader: makeShuffleBag failed for science', e);
          window.nextScienceQuestion = (function(){return function(){return 0;};})();
        }

        if (typeof window.generateQuestion === 'function') {
          try { window.generateQuestion(); } catch (e) { console.warn('Quest loader: generateQuestion errored', e); }
        }

      }).catch(function(err){
        console.error('Quest loader: JSON parse error for', p, err);
        tryLoad(index + 1);
      });
    }).catch(function(err){
      console.error('Quest loader: network error fetching', p, err);
      tryLoad(index + 1);
    });
  }

  tryLoad(0);
})();


document.addEventListener("DOMContentLoaded",function(){
    subjectSelect.addEventListener("change",generateQuestion);
    gradeSelect.addEventListener("change",generateQuestion);
    submitBtn.addEventListener("click",checkAnswer);
    understandBtn.addEventListener("click",generateQuestion);
    userAnswer.addEventListener("keydown",function(e){if(e.key==="Enter"&&!submitBtn.disabled)checkAnswer();});
    generateQuestion();
});
