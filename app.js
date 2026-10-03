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
        var a = randInt(3, 12), m = randInt(2, 9); makeMathQuestion("A book costs $"+a+". A board game costs "+m+" times as much. How much does it cost?", a*m, "“Times as much” means multiply: "+a+" × "+m+" = <strong>$"+(a*m)+"</strong>.", "NY-4.OA.1");
    } else if (type === 2) {
        var x=randInt(1000,9000), y=randInt(100,900), z=randInt(20,300), ans=x-y+z; makeMathQuestion("A library has "+x+" books. It lends "+y+" and receives "+z+" new books. How many books now?", ans, "Solve in steps: "+x+" − "+y+" = "+(x-y)+"; then add "+z+" to get <strong>"+ans+"</strong>.", "NY-4.OA.3");
    } else if (type === 3) {
        var n=[12,18,20,24,28,30,36,40,42,48][randInt(0,9)], factors=[]; for(var f=2;f<=n;f++) if(n%f===0) factors.push(f); var factor=factors[randInt(0,factors.length-1)]; makeMathQuestion("Which number is a factor of "+n+"?", factor, factor+" divides "+n+" evenly because "+n+" ÷ "+factor+" = "+(n/factor)+".", "NY-4.OA.4");
    } else if (type === 4) {
        var prime=[2,3,5,7,11,13,17,19,23,29][randInt(0,9)]; makeMathQuestion("Is "+prime+" prime? Enter 1 for yes or 0 for no.", 1, prime+" has exactly two factors: 1 and "+prime+".", "NY-4.OA.4");
    } else if (type === 5) {
        var start=randInt(2,20), step=randInt(2,9), next=start+step*4; makeMathQuestion("A pattern starts "+start+", "+(start+step)+", "+(start+step*2)+", "+(start+step*3)+". What is next?", next, "The rule is add "+step+" each time, so the next number is <strong>"+next+"</strong>.", "NY-4.OA.5");
    } else if (type === 6) {
        var num=randInt(10000,999999), place=[1000,10000,100000][randInt(0,2)], rounded=Math.round(num/place)*place; makeMathQuestion("Round "+num.toLocaleString()+" to the nearest "+place.toLocaleString()+".", rounded, "Look at the digit to the right of the target place. A 5 or more rounds up.", "NY-4.NBT.3");
    } else if (type === 7) {
        var n1=randInt(1000,9999), n2=randInt(1000,9999); makeMathQuestion("Solve: "+n1.toLocaleString()+" + "+n2.toLocaleString(), n1+n2, "Add each place carefully from right to left. The sum is <strong>"+(n1+n2).toLocaleString()+"</strong>.", "NY-4.NBT.4");
    } else if (type === 8) {
        var s1=randInt(1000,9999), s2=randInt(100,9999); if(s2>s1){var sw=s1;s1=s2;s2=sw;} makeMathQuestion("Solve: "+s1.toLocaleString()+" − "+s2.toLocaleString(), s1-s2, "Subtract by place value, regrouping when needed.", "NY-4.NBT.4");
    } else if (type === 9) {
        var m1=randInt(10,99), m2=randInt(10,99); makeMathQuestion("Solve: "+m1+" × "+m2, m1*m2, "Use partial products: multiply tens and ones, then add the partial products.", "NY-4.NBT.5");
    } else if (type === 10) {
        var md=randInt(2,9), mq=randInt(20,100), mr=randInt(0,md-1), divd=md*mq+mr; makeMathQuestion("What is the whole-number quotient of "+divd+" ÷ "+md+"?", mq, "The quotient is "+mq+" because "+md+" × "+mq+" = "+(md*mq)+"; the remainder is "+mr+".", "NY-4.NBT.6");
    } else if (type === 11) {
        var den=[2,3,4,5,6,8,10,12][randInt(0,7)], nn=randInt(1,den-1), en=nn*2, ed=den*2; makeMathQuestion("What numerator makes an equivalent fraction? "+nn+"/"+den+" = ?/"+ed, en, "Multiply numerator and denominator by 2: "+nn+"/"+den+" = <strong>"+en+"/"+ed+"</strong>.", "NY-4.NF.1");
    } else if (type === 12) {
        var cd=[2,3,4,5,6,8,10,12][randInt(0,7)], p=randInt(1,cd-1), q=randInt(1,cd-1); makeMathQuestion("Add "+p+"/"+cd+" + "+q+"/"+cd+". Enter the numerator before simplifying.", p+q, "With like denominators, add the numerators: "+p+" + "+q+" = <strong>"+(p+q)+"</strong>.", "NY-4.NF.3");
    } else if (type === 13) {
        var fd=randInt(2,8), fn=randInt(1,fd-1), whole=randInt(2,6); makeMathQuestion("Find the numerator before simplifying: "+whole+" × "+fn+"/"+fd, whole*fn, "Multiply the whole number by the numerator: "+whole+" × "+fn+" = <strong>"+(whole*fn)+"</strong>.", "NY-4.NF.4");
    } else if (type === 14) {
        var den1=randInt(2,8), den2=randInt(2,8), a1=randInt(1,den1-1), a2=randInt(1,den2-1); var left=a1/den1, right=a2/den2; makeMathQuestion("Which fraction is greater? A: "+a1+"/"+den1+" or B: "+a2+"/"+den2+". Enter 1 for A or 2 for B.", left>right?1:2, "Compare the fractions using common denominators or benchmark fractions.", "NY-4.NF.2");
    } else if (type === 15) {
        var feet=randInt(2,8), inches=randInt(1,11); makeMathQuestion("How many inches are in "+feet+" feet "+inches+" inches?", feet*12+inches, "Each foot is 12 inches: "+feet+" × 12 + "+inches+" = <strong>"+(feet*12+inches)+" inches</strong>.", "NY-4.MD.1");
    } else if (type === 16) {
        var lengths=[2,3,4,5,6,7,8,9], vals=lengths.map(function(){return randInt(1,10);}); var total=vals.reduce(function(a,b){return a+b;},0); makeMathQuestion("A line plot has measurements: "+vals.join(", ")+" units. What is the total of all measurements?", total, "Add every measurement shown on the line plot: <strong>"+total+" units</strong>.", "NY-4.MD.2");
    } else if (type === 17) {
        var len=randInt(4,20), wid=randInt(3,12); makeMathQuestion("A rectangle is "+len+" units by "+wid+" units. What is its perimeter?", 2*(len+wid), "Perimeter = 2 × (length + width) = <strong>"+(2*(len+wid))+" units</strong>.", "NY-4.MD.3");
    } else if (type === 18) {
        var areaL=randInt(4,15), areaW=randInt(3,10); makeMathQuestion("A rectangle is "+areaL+" units by "+areaW+" units. What is its area?", areaL*areaW, "Area = length × width = <strong>"+(areaL*areaW)+" square units</strong>.", "NY-4.MD.3");
    } else if (type === 19) {
        var ang=randInt(10,170), code=ang<90?1:ang===90?2:3; makeMathQuestion("An angle measures "+ang+"°. Enter 1 for acute, 2 for right, or 3 for obtuse.", code, "Less than 90° is acute; exactly 90° is right; greater than 90° is obtuse.", "NY-4.MD.5");
    } else if (type === 20) {
        var aA=randInt(20,160), aB=180-aA; makeMathQuestion("Two angles form a straight angle. One measures "+aA+"°. What is the other angle?", aB, "A straight angle measures 180°. So 180 − "+aA+" = <strong>"+aB+"°</strong>.", "NY-4.MD.7");
    } else if (type === 21) {
        var sides=randInt(3,8); makeMathQuestion("A shape has "+sides+" equal sides. What is the total length if each side is 6 units?", sides*6, "Add the equal sides: "+sides+" × 6 = <strong>"+(sides*6)+" units</strong>.", "NY-4.G.1");
    } else {
        var q=randInt(1,3); var text=q===1?"A quadrilateral has four right angles and opposite sides equal.":q===2?"A quadrilateral has four equal sides and four right angles.":"A quadrilateral has four equal sides but does not need right angles."; var ans=q; makeMathQuestion(text+" Enter 1 for rectangle, 2 for square, or 3 for rhombus.", ans, "A rectangle has four right angles; a square has four equal sides and four right angles; a rhombus has four equal sides.", "NY-4.G.2");
    }
}

var elaQuestions = [
{cat:"Literary Reading",s:"NY-4R1",q:'<div class="passage"><b>Passage:</b> Lena had never spoken in front of the class. Her hands felt shaky, but she took a deep breath, walked to the front, and began her presentation.</div>What can the reader infer about Lena?',o:["She is willing to face a challenge.","She does not care about school.","She has forgotten her presentation.","She wants to leave school."],a:"She is willing to face a challenge.",e:"Lena is nervous, but she still presents. That evidence supports the inference that she is willing to face a challenge."},
{cat:"Literary Reading",s:"NY-4R2",q:'<div class="passage"><b>Passage:</b> Every Saturday, Omar repaired bicycles at the community center. He cleaned chains, tightened loose brakes, and taught younger children how to pump air into tires.</div>What is the main idea?',o:["Omar helps others by repairing and teaching about bicycles.","Omar dislikes bicycles.","The community center is closed on Saturdays.","Only adults can repair bicycles."],a:"Omar helps others by repairing and teaching about bicycles.",e:"The details about repairs and teaching all support the main idea that Omar helps others with bicycles."},
{cat:"Literary Reading",s:"NY-4RL3",q:'<div class="passage"><b>Passage:</b> At first, Priya wanted to give up when her tomato plant wilted. Her grandfather showed her how to check the soil. Priya began watering it carefully, and new leaves appeared.</div>How does Priya change?',o:["She becomes more patient and responsible.","She becomes afraid of plants.","She stops listening to her grandfather.","She decides never to garden again."],a:"She becomes more patient and responsible.",e:"Priya changes from wanting to give up to carefully caring for the plant."},
{cat:"Literary Reading",s:"NY-4RL2",q:'<div class="passage"><b>Passage:</b> Marcus returned the lost wallet even though no one had seen him find it. He knew the owner would need the money and cards inside.</div>What lesson does the passage suggest?',o:["Doing the right thing matters even when no one is watching.","You should keep things you find.","Money is more important than honesty.","People should never carry wallets."],a:"Doing the right thing matters even when no one is watching.",e:"Marcus returns the wallet without being watched, showing honesty and responsibility."},
{cat:"Literary Reading",s:"NY-4RL4",q:'<div class="passage"><b>Passage:</b> The hallway was <i>silent</i> after the final bell. Not a locker door slammed, and no footsteps echoed.</div>What does “silent” mean here?',o:["very quiet","very crowded","very bright","very warm"],a:"very quiet",e:"The details about no locker doors and no footsteps show that silent means very quiet."},
{cat:"Literary Reading",s:"NY-4RL5",q:'<div class="passage"><b>Passage:</b> First, Eli searched under the couch. Next, he checked the kitchen. Finally, he found his missing library book inside his backpack.</div>How is the passage organized?',o:["in sequence","as a comparison","as a problem with two unrelated characters","as a list of opinions"],a:"in sequence",e:"First, next, and finally signal events in chronological order."},
{cat:"Informational Reading",s:"NY-4RI2",q:'<div class="passage"><b>Passage:</b> Mangrove trees grow where land meets warm, shallow water. Their tangled roots slow waves, provide shelter for young fish, and help hold soil in place.</div>What is the main idea?',o:["Mangrove trees provide several important benefits in coastal areas.","Mangroves only grow in deserts.","Young fish damage mangrove roots.","Waves always destroy mangrove trees."],a:"Mangrove trees provide several important benefits in coastal areas.",e:"The passage lists several benefits: slowing waves, sheltering fish, and holding soil."},
{cat:"Informational Reading",s:"NY-4RI1",q:'<div class="passage"><b>Passage:</b> A school garden attracts bees because many flowers produce nectar. Bees carry pollen from one flower to another as they feed.</div>Which detail best supports the idea that bees help plants?',o:["Bees carry pollen from one flower to another.","The garden belongs to a school.","Some flowers are colorful.","Bees need food."],a:"Bees carry pollen from one flower to another.",e:"Moving pollen between flowers is the specific evidence that supports the idea."},
{cat:"Informational Reading",s:"NY-4RI3",q:'<div class="passage"><b>Passage:</b> During a thunderstorm, warm air rises quickly. As the air rises, water vapor cools and forms clouds. When the clouds become full of water droplets, rain may fall.</div>What causes the water vapor to form clouds?',o:["The water vapor cools as warm air rises.","Rain falls first.","The clouds become full of fish.","The sun stops shining forever."],a:"The water vapor cools as warm air rises.",e:"The passage directly connects rising warm air and cooling water vapor to cloud formation."},
{cat:"Informational Reading",s:"NY-4RI4",q:'<div class="passage"><b>Passage:</b> The scientist recorded that the river was <i>polluted</i> after a large amount of plastic was found along its banks.</div>What does “polluted” most likely mean?',o:["made dirty or unsafe by harmful materials","made wider","turned into drinking water","made colder"],a:"made dirty or unsafe by harmful materials",e:"The plastic along the river is evidence that polluted means contaminated or made dirty."},
{cat:"Informational Reading",s:"NY-4RI5",q:'<div class="passage"><b>Passage:</b> Many cities are planting trees along streets. Trees provide shade. They also absorb some air pollutants and can reduce stormwater runoff.</div>Why does the author organize the paragraph by listing several benefits?',o:["to explain different reasons cities plant trees","to tell a fictional story","to compare two characters","to give directions for planting a tree"],a:"to explain different reasons cities plant trees",e:"The author gives several benefits to explain why the practice is useful."},
{cat:"Informational Reading",s:"NY-4RI6",q:'<div class="passage"><b>Passage:</b> The article explains that bats eat insects at night and can reduce the number of insects near farms.</div>What is the author’s main purpose?',o:["to inform readers about a benefit of bats","to persuade readers to buy a bat","to entertain readers with a fantasy story","to give a recipe"],a:"to inform readers about a benefit of bats",e:"The article gives factual information about bats and their effect on insect populations."},
{cat:"Paired Texts",s:"NY-4R9",q:'<div class="passage"><b>Text A:</b> Solar panels use sunlight to make electricity.<br><b>Text B:</b> Wind turbines use moving air to make electricity.</div>How are the texts similar?',o:["Both describe renewable ways to make electricity.","Both explain how coal is mined.","Both say electricity cannot be stored.","Both describe only gasoline-powered machines."],a:"Both describe renewable ways to make electricity.",e:"Text A describes solar energy and Text B describes wind energy; both are renewable energy sources."},
{cat:"Paired Texts",s:"NY-4R9",q:'<div class="passage"><b>Text A:</b> A robin builds a nest in a tree to protect its eggs.<br><b>Text B:</b> A sea turtle digs a nest in sand and covers its eggs.</div>What is one difference?',o:["The robin uses a tree, while the turtle uses sand.","Both animals lay eggs in exactly the same place.","Only robins have eggs.","The turtle builds its nest in a tree."],a:"The robin uses a tree, while the turtle uses sand.",e:"The locations of the nests are different: tree versus sand."},
{cat:"Paired Texts",s:"NY-4R1 / NY-4W5",q:'<div class="passage"><b>Text A:</b> Bees visit flowers to collect nectar and pollen.<br><b>Text B:</b> Hummingbirds visit flowers for nectar and help move pollen.</div>Which statement is supported by both texts?',o:["Both animals visit flowers and can help with pollination.","Neither animal visits flowers.","Only bees need food.","Hummingbirds collect honey from bees."],a:"Both animals visit flowers and can help with pollination.",e:"Both passages explicitly connect the animal with flowers and pollen."},
{cat:"Vocabulary",s:"NY-4L4",q:'<div class="passage"><b>Sentence:</b> The hikers were <i>exhausted</i> after climbing the steep trail.</div>What does “exhausted” most likely mean?',o:["very tired","very excited","very young","very noisy"],a:"very tired",e:"The steep climb provides context showing that exhausted means very tired."},
{cat:"Vocabulary",s:"NY-4L5",q:'Which word is an antonym for <b>scarce</b>?',o:["abundant","rare","limited","few"],a:"abundant",e:"Scarce means hard to find or limited; abundant means plentiful."},
{cat:"Author’s Craft",s:"NY-4RI5",q:'<div class="passage"><b>Passage:</b> Imagine a city where every roof becomes a tiny garden. These gardens could cool buildings and give birds places to rest.</div>Why does the author begin with “Imagine a city…”?',o:["to help readers picture the idea","to give the exact temperature","to introduce a character named Imagine","to explain how to spell city"],a:"to help readers picture the idea",e:"The opening invites the reader to visualize the proposed rooftop gardens."},
{cat:"Author’s Craft",s:"NY-4RL5",q:'<div class="passage"><b>Passage:</b> “I heard the waves whisper against the shore,” Maya wrote in her journal.</div>Why might the author use “waves whisper” instead of simply “waves moved”?',o:["to create a vivid image and mood","to give a scientific measurement","to prove waves can speak","to make the sentence a question"],a:"to create a vivid image and mood",e:"The description gives the waves a human-like action and creates a calm, vivid image."},
{cat:"Language",s:"NY-4L1",q:'Which sentence has correct subject-verb agreement?',o:["The group of students walks to the library.","The group of students walk to the library.","The group of students walking to the library.","The group of students are walks to the library."],a:"The group of students walks to the library.",e:"The subject is “group,” which is singular, so the verb is “walks.”"},
{cat:"Language",s:"NY-4L2",q:'Which sentence correctly uses quotation marks?',o:['"Please bring your notebook," said Luis.','Please "bring your notebook, said Luis.','"Please bring your notebook, said Luis.','Please bring "your notebook," said Luis.'],a:'"Please bring your notebook," said Luis.',e:"Quotation marks surround the speaker’s exact words."},
{cat:"Language",s:"NY-4L2",q:'Which sentence uses a comma correctly after an introductory word?',o:["However, we finished the project on time.","However we, finished the project on time.","However we finished, the project on time.","However we finished the project, on time."],a:"However, we finished the project on time.",e:"A comma follows the introductory word “However.”"},
{cat:"Language",s:"NY-4L1",q:'Which is a complete sentence?',o:["The children explored the museum.","Because the museum was large.","Running through the hallway.","After the class ended."],a:"The children explored the museum.",e:"It contains a complete thought with a subject and predicate."},
{cat:"Writing",s:"NY-4W2",q:'Which is the strongest topic sentence for a paragraph about school gardens?',o:["School gardens can help students learn about plants and responsibility.","I saw a garden yesterday.","Gardens have dirt.","My favorite lunch is pizza."],a:"School gardens can help students learn about plants and responsibility.",e:"A strong topic sentence states the main idea the paragraph will develop."},
{cat:"Writing",s:"NY-4W3",q:'Which revision adds useful sensory detail to “The bread was good”?',o:["The warm bread smelled buttery and felt soft inside.","The bread was bread.","The bread existed on the table.","The bread was called bread."],a:"The warm bread smelled buttery and felt soft inside.",e:"Sensory details tell readers what something smells, feels, tastes, sounds, or looks like."},
{cat:"Writing",s:"NY-4W5",q:'Which response best uses evidence to support the claim that Ana is brave?',o:["Ana is brave because she enters the dark room even though she is scared.","Ana is brave because I like her.","Ana is brave because the book is blue.","Ana is brave because the story has ten pages."],a:"Ana is brave because she enters the dark room even though she is scared.",e:"The response makes a claim and gives a relevant detail from the text as evidence."},
{cat:"Writing",s:"NY-4W3c",q:'Which transition best shows the next step in a process?',o:["Next","However","Although","Instead"],a:"Next",e:"“Next” signals the following step in a sequence."},
{cat:"Research",s:"NY-4W6 / NY-4W7",q:'A student reads two reliable articles about the same animal and takes notes from both. What skill is being practiced?',o:["gathering and organizing information from sources","solving a multiplication problem","measuring an angle","identifying a factor"],a:"gathering and organizing information from sources",e:"Using multiple sources and organizing notes are important Grade 4 research skills."},
{cat:"Speaking & Listening",s:"NY-4SL1",q:'Which response best supports a respectful classroom discussion?',o:["I agree with your idea, and my evidence is…","You are wrong. Stop talking.","I do not need evidence.","Only my answer matters."],a:"I agree with your idea, and my evidence is…",e:"A strong discussion response acknowledges another speaker and supports an idea with evidence."},
{cat:"Inference",s:"NY-4R1",q:'<div class="passage"><b>Passage:</b> The playground was empty, and dark clouds gathered overhead. Jordan zipped his coat and hurried home.</div>What can the reader infer?',o:["Jordan thinks bad weather may be coming.","Jordan is going swimming.","The playground is crowded.","Jordan forgot where he lives."],a:"Jordan thinks bad weather may be coming.",e:"The empty playground, dark clouds, coat, and hurried walk are clues supporting this inference."},
{cat:"Main Idea",s:"NY-4R2",q:'<div class="passage"><b>Passage:</b> Some desert plants store water in thick stems. Their waxy surfaces reduce water loss, and their roots can spread widely to collect rain.</div>Which detail supports the main idea that desert plants have adaptations for dry conditions?',o:["Their waxy surfaces reduce water loss.","Some deserts have sand.","Plants need sunlight.","Rain falls in many places."],a:"Their waxy surfaces reduce water loss.",e:"Reducing water loss is a specific adaptation that helps a plant survive dry conditions."},
{cat:"Text Evidence",s:"NY-4R1",q:'<div class="passage"><b>Passage:</b> Nia practiced the violin every morning. When she made a mistake, she marked the measure and tried it again.</div>Which detail best shows that Nia is persistent?',o:["She tried difficult measures again after mistakes.","She owned a violin.","She practiced in the morning.","She marked the measure."],a:"She tried difficult measures again after mistakes.",e:"Trying again after mistakes is the strongest evidence of persistence."},
{cat:"Summarizing",s:"NY-4R2",q:'<div class="passage"><b>Passage:</b> Coral reefs provide homes for many sea animals. They also protect some coastlines by reducing the force of waves.</div>Which is the best summary?',o:["Coral reefs provide habitats and help protect coastlines.","Coral reefs are colorful.","Many animals live in the ocean.","Waves move toward the coast."],a:"Coral reefs provide habitats and help protect coastlines.",e:"The best summary includes both important ideas without adding minor details."},
{cat:"Compare Ideas",s:"NY-4R3",q:'<div class="passage"><b>Passage:</b> One paragraph explains that trees provide shade. Another explains that trees absorb some air pollutants.</div>How are the two ideas related?',o:["Both explain benefits trees provide to people and communities.","One says trees are harmful and the other says trees are useful.","They describe two kinds of rocks.","They have no relationship."],a:"Both explain benefits trees provide to people and communities.",e:"Both ideas describe positive effects of trees."},
{cat:"Author’s Purpose",s:"NY-4RI6",q:'<div class="passage"><b>Passage:</b> Wear a helmet every time you ride a bicycle. A helmet protects your head if you fall.</div>What is the author’s main purpose?',o:["to persuade readers to wear helmets","to tell a fantasy story","to describe a character","to compare two bicycles"],a:"to persuade readers to wear helmets",e:"The author gives advice and a reason to encourage a behavior."},
{cat:"Text Structure",s:"NY-4RI5",q:'<div class="passage"><b>Passage:</b> First, place the seed in moist soil. Next, put the pot near sunlight. Finally, water the seedling when the soil becomes dry.</div>What text structure is used?',o:["sequence / steps","compare and contrast","problem and solution","cause and effect only"],a:"sequence / steps",e:"First, next, and finally organize the information as steps."},
{cat:"Theme",s:"NY-4RL2",q:'<div class="passage"><b>Passage:</b> The tortoise moved slowly but never stopped. The hare napped along the way, sure he would still win. In the end, the tortoise crossed the finish line first.</div>What is the theme of this passage?',o:["Slow and steady effort can win in the end.","Hares are faster than tortoises.","Naps are always a bad idea.","Races should not have finish lines."],a:"Slow and steady effort can win in the end.",e:"The tortoise's steady effort, contrasted with the hare's overconfidence, points to a theme about persistence."},
{cat:"Point of View",s:"NY-4RL6",q:"<div class=\"passage\"><b>Passage:</b> \"I could not believe it,\" Sam said. \"I finally learned to ride without training wheels!\"</div>Who is telling this part of the story?",o:["Sam, in first person","A narrator who is not in the story","Sam's bicycle","The reader"],a:"Sam, in first person",e:"The words \"I\" and \"I finally learned\" show that Sam is narrating his own experience."},
{cat:"Figurative Language",s:"NY-4L5",q:'In the sentence \"The classroom was a zoo after the fire alarm,\" what does the phrase most likely mean?',o:["The classroom was noisy and chaotic.","The classroom had real animals in it.","The classroom was completely silent.","The classroom was very clean."],a:"The classroom was noisy and chaotic.",e:"This is a metaphor comparing the chaotic classroom to a zoo, meaning it was loud and disorderly."},
{cat:"Vocabulary",s:"NY-4L4a",q:'The word "unhappy" contains the prefix "un-." What does this prefix most likely mean?',o:["not","again","before","full of"],a:"not",e:"The prefix \"un-\" usually means \"not,\" as in unhappy meaning not happy."},
{cat:"Vocabulary",s:"NY-4L4b",q:'Which word means "full of joy," using the suffix "-ful"?',o:["joyful","joyless","joying","joyness"],a:"joyful",e:"The suffix \"-ful\" means \"full of,\" so joyful means full of joy."},
{cat:"Idioms",s:"NY-4L5b",q:"What does it mean if someone says, \"It's raining cats and dogs\"?",o:["It is raining very heavily.","Cats and dogs are falling from the sky.","It is a sunny day.","Pets are playing outside."],a:"It is raining very heavily.",e:"This idiom describes very heavy rain, not literal animals falling from the sky."},
{cat:"Informational Reading",s:"NY-4RI7",q:'<div class="passage"><b>Passage:</b> A diagram beside the text shows the water cycle, with arrows pointing from "evaporation" to "condensation" to "precipitation."</div>How does the diagram help the reader?',o:["It shows the order of the water cycle visually.","It replaces the need to read any text.","It proves the text is fictional.","It shows a totally unrelated process."],a:"It shows the order of the water cycle visually.",e:"Diagrams with labeled arrows help readers see the steps and order of a process."},
{cat:"Writing",s:"NY-4W1",q:'Which sentence best states an opinion with a reason, as in opinion writing?',o:["Recess should be longer because students focus better after exercise.","Recess happens every day.","The playground has a slide.","Some students play tag at recess."],a:"Recess should be longer because students focus better after exercise.",e:"Opinion writing states a claim (recess should be longer) and supports it with a reason."},
{cat:"Writing",s:"NY-4W1b",q:'Which sentence is the strongest concluding sentence for a paragraph arguing that libraries are important?',o:["For all these reasons, libraries are a valuable resource for every community.","Libraries have books.","I went to the library once.","Some libraries are big."],a:"For all these reasons, libraries are a valuable resource for every community.",e:"A strong conclusion restates the main claim and wraps up the argument."},
{cat:"Language",s:"NY-4L1b",q:'Which sentence uses a relative pronoun correctly?',o:["The book that I borrowed was about dinosaurs.","The book who I borrowed was about dinosaurs.","The book borrowed I was about dinosaurs.","The book, I borrowed, was about dinosaurs the."],a:"The book that I borrowed was about dinosaurs.",e:"\"That\" is a relative pronoun used correctly here to introduce a clause describing \"the book.\""},
{cat:"Language",s:"NY-4L1c",q:'Which sentence uses the progressive verb tense correctly?',o:["She is reading a new mystery novel.","She reading a new mystery novel.","She reads is a new mystery novel.","She read is a new mystery novel."],a:"She is reading a new mystery novel.",e:"The progressive tense uses a form of \"to be\" plus a verb ending in \"-ing,\" as in \"is reading.\""},
{cat:"Research",s:"NY-4W8",q:'A student wants to write about volcanoes and looks at a science textbook, an encyclopedia entry, and a video from a museum. What is this student doing?',o:["Gathering information from multiple sources","Writing a fictional story","Measuring an object","Practicing spelling words"],a:"Gathering information from multiple sources",e:"Using several sources on the same topic is a key Grade 4 research skill."},
{cat:"Speaking & Listening",s:"NY-4SL2",q:'A student watches a short video about recycling before a class discussion. What is the best reason to pay close attention to the video?',o:["To understand the topic well enough to contribute ideas in the discussion","To memorize every word spoken","To avoid answering any questions later","To find mistakes in the video's colors"],a:"To understand the topic well enough to contribute ideas in the discussion",e:"Grade 4 speaking and listening standards include using information from media to inform discussion."}
];

var nextElaQuestion = makeShuffleBag(elaQuestions.length);
function generateELA() {
    var item = elaQuestions[nextElaQuestion()];
    makeELAQuestion(item.q, item.o, item.a, item.e, item.s, item.cat);
}

function generateLegacyMath(grade) {
    var n1,n2,op;
    if(grade==="1"){n1=randInt(1,10);n2=randInt(1,10);op=Math.random()>.5?"+":"-";if(op==="-"&&n1<n2){var t=n1;n1=n2;n2=t;}makeMathQuestion(n1+" "+op+" "+n2+" = ?",op==="+"?n1+n2:n1-n2,"Count forward or backward to solve.","Grade 1 practice");}
    else if(grade==="2"){n1=randInt(10,49);n2=randInt(10,49);op=Math.random()>.5?"+":"-";if(op==="-"&&n1<n2){var t2=n1;n1=n2;n2=t2;}makeMathQuestion(n1+" "+op+" "+n2+" = ?",op==="+"?n1+n2:n1-n2,"Line up place values before calculating.","Grade 2 practice");}
    else if(grade==="3"){n1=randInt(2,10);n2=randInt(2,10);makeMathQuestion(n1+" × "+n2+" = ?",n1*n2,"Think of equal groups or an array.","Grade 3 practice");}
    else{n1=randInt(10,49)/10;n2=randInt(10,49)/10;var ans=parseFloat((n1+n2).toFixed(1));makeMathQuestion(n1.toFixed(1)+" + "+n2.toFixed(1)+" = ?",ans,"Align the decimal points before adding.","Grade 5 practice");}
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

document.addEventListener("DOMContentLoaded",function(){
    subjectSelect.addEventListener("change",generateQuestion);
    gradeSelect.addEventListener("change",generateQuestion);
    submitBtn.addEventListener("click",checkAnswer);
    understandBtn.addEventListener("click",generateQuestion);
    userAnswer.addEventListener("keydown",function(e){if(e.key==="Enter"&&!submitBtn.disabled)checkAnswer();});
    generateQuestion();
});
