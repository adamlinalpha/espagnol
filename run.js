express = require('express')
path = require('path')
app = express()
const fs = require('fs');
const bodyParser = require('body-parser');
const CNG = require("@jirimracek/conjugate-esp");
const cng = new CNG.Conjugator();
cng.setOrthography('1999');
cng.useHighlight(use = false)


app.use(bodyParser.json());
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(__dirname + '/public'));
//#region
let oV = {}
let oP = {}
let oT = {}
let oTr = {}

let verbsA = fs.readFileSync('./public/verbs.json');
let verbs = JSON.parse(verbsA);
verbs.forEach(
  function (object) {
    const firstLetter = object.infinitive.charAt(0)
    const firstLetterCap = firstLetter.toUpperCase()
    const remainingLetters = object.infinitive.slice(1)
    let infinitive = `(${firstLetterCap + remainingLetters})`
    let perc = Math.pow(object.perc, 1 / 1)
    const firstLetter2 = object.translation.charAt(0)
    const firstLetterCap2 = firstLetter2.toUpperCase()
    const remainingLetters2 = object.translation.slice(1)
    let tran = `(${firstLetterCap2 + remainingLetters2})`
    oV[infinitive] = perc
    oTr[infinitive] = tran
  }
)

let tenses = {
  "Présent de l'indicatif": 14,
  "Passé simple": 13,
  "Imparfait": 12,
  "Présent progressif": 12,
  "Passé composé": 11,
  "Subjonctif présent": 9,
  "Futur de l'indicatif": 9,
  "Imperatif": 8.5,
  "Subjonctif imparfait": 8,
  "Conditionnel": 7.5
}
for (let i in tenses) {
  oT[i] = tenses[i]
}

let pronounA = fs.readFileSync('./public/pronoun.json');
let pronouns = JSON.parse(pronounA);
for (let i in pronouns) {
  oP[i] = Math.pow(pronouns[i], 1 / 3)
}

function weightedRand(spec) {
  var i, j, table = [];
  for (i in spec) {
    for (j = 0; j < spec[i] * 100000; j++) {
      table.push(i);
    }
  }
  return function () {
    return table[Math.floor(Math.random() * table.length)];
  }
}

function weightedRandLight(spec) {
  var i, j, table = [];
  for (i in spec) {
    for (j = 0; j < spec[i] * 100; j++) {
      table.push(i);
    }
  }
  return function () {
    return table[Math.floor(Math.random() * table.length)];
  }
}

let randTense = weightedRandLight(oT)
let randPronoun = weightedRandLight(oP)
let randVerb = weightedRand(oV)


//#endregion

app.listen(3000, function () {
  console.log('LISTENING ON 3000')
})

app.get('/', function (req, res) {
  for (let i in tenses) {
    oT[i] = tenses[i]
  }
  randTense = weightedRandLight(oT)
  res.render('Accueil.ejs')
})

app.get('/temps', function (req, res) {
  res.render('temps.ejs')
})

app.get('/randomTense', function (req, res) {
  let randomTense = randTense();
  res.json({ tense: randomTense });
})
app.get('/randomVerb', function (req, res) {
  let randomVerb = randVerb();
  let traduction = oTr[randomVerb]
  let conjugated
  cng.conjugate(randomVerb.replace('(', '').replace(')', '').toLowerCase())
    .then(function (table) {
      conjugated = JSON.stringify(table, null, 1)
      res.json({ verb: randomVerb, translation: traduction, conjugated: conjugated });
    })
    .catch(error => console.error(error));
});

app.get('/randomPronoun', function (req, res) {
  let randomPronoun = randPronoun();
  res.json({ pronoun: randomPronoun });
})

app.get('/randomPronoun', function (req, res) {
  let randomPronoun = randPronoun();
  res.json({ pronoun: randomPronoun });
})
app.get('/tense', function (req, res) {
  let activated = req.query;
  //#region

  if (activated.presentI == 'on') {
    tenses["Présent de l'indicatif"] = 14
  } else {
    tenses["Présent de l'indicatif"] = 0
  }
  if (activated.passeS == 'on') {
    tenses["Passé simple"] = 13
  } else {
    tenses["Passé simple"] = 0
  }
  if (activated.imparfait == 'on') {
    tenses["Imparfait"] = 12
  } else {
    tenses["Imparfait"] = 0
  }
  if (activated.presentP == 'on') {
    tenses["Présent progressif"] = 12
  } else {
    tenses["Présent progressif"] = 0
  }
  if (activated.passeP == 'on') {
    tenses["Passé composé"] = 11
  } else {
    tenses["Passé composé"] = 0
  }
  if (activated.subjonctifP == 'on') {
    tenses["Subjonctif présent"] = 9
  } else {
    tenses["Subjonctif présent"] = 0
  }
  if (activated.futurI == 'on') {
    tenses["Futur de l'indicatif"] = 9
  } else {
    tenses["Futur de l'indicatif"] = 0
  }
  if (activated.imperatif == 'on') {
    tenses["Imperatif"] = 8.5
  } else {
    tenses["Imperatif"] = 0
  }
  if (activated.subjonctifI == 'on') {
    tenses["Subjonctif imparfait"] = 8
  } else {
    tenses["Subjonctif imparfait"] = 0
  }
  if (activated.conditionnel == 'on') {
    tenses["Conditionnel"] = 7.5
  } else {
    tenses["Conditionnel"] = 0
  }
  //#endregion
  res.render('redirect.ejs')
})

