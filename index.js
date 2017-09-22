const WordNet = require("node-wordnet");
var natural = require("natural");
const npl = require("compromise");
const wordnet = new WordNet();
const tokenizer = new natural.WordTokenizer();

/* wordnet.lookup("bearing", function(results) {
  results.forEach(function(result) {
    console.log("------------------------------------");
    console.log("Id: ", result.synsetOffset);
    console.log("Part of Speech: ", result.pos);
    // n: noun, a: adjective, s: adjective (satellite), v: verb, r: adverb
    // adjective satellite is something Wordnet came up with - it refers to adjectives that always occur in instances relating to some other object - the canonical example is "atomic bomb"
    console.log("Lemma: ", result.lemma);
    console.log("Synonyms: ", result.synonyms);
    console.log("Description: ", result.gloss);
  });
}); */

var lexicon = {
  bearing: "Noun"
};

strings = [
  "screw,cap ff",
  "angular contact (rolling) bearing",
  "Thrust bearings",
  "Thrust bear.",
  "Tensioner bearing",
  "END bearing, call me maybe",
  "Tapped base bearing",
  "Load bearing element 1",
  "end bracket, testing",
  "Hanger bearings",
  "Flanged bearings",
  "screw,cap",
  "Angular contact bearing",
  "double-row (rolling) bearing",
  "screw,cap",
  "end bracket, bearing bracket (US)",
  "external-aligning (rolling) bearing",
  "filling slot (ball) bearing",
  "screw,cap",
  "#2 Heating fuel oil",
  "#4 or #6 Residual heavy fuel oils",
  "Aluminum SAE 6000 series hot rolled coil",
  "Aluminum, Reroll, Capacitor Foil Alloy 1145",
  "Aluminum, Sheet, Coiled Coated, Except Conductor & Decorative For Stamping",
  "700-R NEMA sealed industrial control relay",
  "802R NEMA 13 sealed contact",
  "802XR NEMA 7/9 hazardous location sealed contact",
  "Diaphragm seals",
  "Die cut seal kit",
  "V ring seal",
  "lip seal",
  "rotary shaft lip-type seal",
  "rubber-covered rotary shaft lip-type seal",
  "seal, O-ring",
  "seal kit",
  "motor with standardized mounting dimensions",
  "Connector to screw",
  "Earthing lug for cable screw gland",
  "Orthodontic expansion screws",
  "Self drilling tapping screw",
  "screw assembly",
  "screw",
  "screw and washer assembly (sems)",
  "BOLT,M6-1.0",
  "BOLT,HEX METRIC M6",
  "BOLT M6X25MM",
  "BOLT,M6X25MM HF",
  "NUT HEX FLG M6 1.0",
  "NUT HEX LOCK M6X1.0.00",
  "NUT,JAM,M6-1",
  "SCREW;CAP",
  "SCREW.CAP",
  "MOUNT,CALIBER,50,M6"
];

const synonyms = [
  { master: "radial shaft seal", synonym: "lip seal" },
  { master: "motor", synonym: "engine" }
];

const specialWords = ["o-ring", "v ring", "v-ring"];

const abbreviations = [
  { abbreviation: "ASSY", expansion: "ASSEMBLY" },
  { abbreviation: "ASSY.", expansion: "ASSEMBLY" },
  { abbreviation: "ASSY.", expansion: "ASSEMBLY" },
  { abbreviation: "BEAR.", expansion: "BEARING" },
  { abbreviation: "ATTACH.", expansion: "ATTACHMENT" },
  { abbreviation: "COMPL.", expansion: "COMPLETE" },
  { abbreviation: "CPLG", expansion: "COUPLING" },
  { abbreviation: "CYL.", expansion: "CYLINDER" },
  { abbreviation: "CYLIND", expansion: "CYLINDER" },
  { abbreviation: "CYLIND.", expansion: "CYLINDER" },
  { abbreviation: "CYLINDE", expansion: "CYLINDER" },
  { abbreviation: "FILT.", expansion: "FILTER" },
  { abbreviation: "FRICT.", expansion: "FRICTION" },
  { abbreviation: "HD", expansion: "HEAD" },
  { abbreviation: "HD.", expansion: "HEAD" },
  { abbreviation: "CART.", expansion: "CARTRIDGE" },
  { abbreviation: "CARTR.", expansion: "CARTRIDGE" },
  { abbreviation: "HYD.", expansion: "HYDRAULIC" },
  { abbreviation: "HYDR.", expansion: "HYDRAULIC" },
  { abbreviation: "REDUC.", expansion: "REDUCER" },
  { abbreviation: "REGUL.", expansion: "REGULATOR" }
];

// https://en.wikipedia.org/wiki/Delimiter
const _stringSplit = stringToSplit => {
  // check if the delimiter is a comma (the string most likely starts with a NOUN)
  if (stringToSplit.indexOf(",") >= 0) {
    return stringToSplit
      .replace(",", " ")
      .toUpperCase()
      .split(" ");
    // check if the delimiter is a semicolon (the string most likely starts with a NOUN)
  } else if (stringToSplit.indexOf(";") >= 0) {
    return stringToSplit
      .replace(";", " ")
      .toUpperCase()
      .split(" ");
  } else {
    // The string most likely ends with a NOUN
    return stringToSplit.toUpperCase().split(" ");
  }
};

const _findAbbreviations = (string, abbreviationExpensionArray) => {
  const stringArray = _stringSplit(string);

  const abbreviationMatches = [];
  abbreviationExpensionArray.forEach(item => {
    if (stringArray.indexOf(item.abbreviation) >= 0) {
      abbreviationMatches.push({
        abbreviation: item.abbreviation.toUpperCase(),
        expansion: item.expansion.toUpperCase()
      });
    }
  });
  return abbreviationMatches;
};

const _replaceAbbreviationsWithExpansions = (
  string,
  abbreviationExpensionArray
) => {
  if (_findAbbreviations.length > 0) {
    const abbreviationMatches = _findAbbreviations(
      string,
      abbreviationExpensionArray
    );
    let newString = string.toUpperCase();
    abbreviationMatches.forEach(item => {
      item.abbreviation[item.abbreviation.length - 1] === "."
        ? (abb = item.abbreviation.replace(/.$/, "\\."))
        : (abb = item.abbreviation);
      re = new RegExp(abb);
      newString = newString.replace(re, item.expansion);
    });
    return newString;
  } else {
    return string;
  }
};

const regexString = (string, abbreviationExpensionArray) => {
  const filterPattern1 = /[^a-zA-Z]+/g; // find all non English alphabetic characters.
  const filterPattern2 = /\b\w{1,2}\b/g; // find words that are less then three characters long.
  const filterPattern3 = /\s\s+/g; // find multiple whitespace, tabs, newlines, etc.
  const filteredString = _replaceAbbreviationsWithExpansions(
    string,
    abbreviationExpensionArray
  )
    .toUpperCase()
    .replace(filterPattern1, " ")
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
    .replace(filterPattern2, match => {
      let abbr = abbreviationExpensionArray.find(x => x.abbreviation === match);
      return abbr ? abbr.expansion : "";
    })
    .replace(filterPattern3, " ")
    .trim(); // remove leading and trailing whitespace.
  return filteredString;
};

const stringOrganizer = (stringArray, abbreviationExpensionArray) => {
  const fixedStrings = [];
  stringArray.forEach(string => {
    const regStr = regexString(string, abbreviations).split(" ");
    if (string.indexOf(",") >= 0) {
      // exist a comma in the string
      const cleanedString = _replaceAbbreviationsWithExpansions(
        string,
        abbreviations
      );
      const textAfterComma = cleanedString
        .substring(cleanedString.indexOf(",") + 1)
        .trim();
      const textBeforeComma = cleanedString.replace(textAfterComma, "").trim();

      console.log(
        textAfterComma.length
          ? `${textBeforeComma} ${textAfterComma}`
          : textBeforeComma
      );
    } else if (string.indexOf(";") >= 0) {
      // exist a semicolon in the string
      console.log("semicolon");
    } else {
      // no comma or semicolon in the string;
      console.log("only spaces found");
    }
    /*
    fixedStrings.push({
      oldString: string,
      newString: regStr.join(" "),
      noun:
        string.indexOf(",") >= 0 || string.indexOf(";") >= 0
          ? regStr[0]
          : regStr[regStr.length - 1]
    }); */
  });
  //return fixedStrings;
};

console.log(stringOrganizer(strings, abbreviations));

/* console.time("Hello");
console.log(regexString(testStringOriginal, abbreviations));
console.timeEnd("Hello"); */
/* function partOfSpeech(document) {
  let obj = {};
  obj.nouns = document
    .terms()
    .nouns()
    .data();

  console.log("nouns", document.nouns().out("array"));
  console.log("values: ", document.values().out("array"));
  console.log("verbs: ", document.verbs().out("array"));
  console.log("adjectives: ", document.adjectives().out("array"));
  console.log(testStringOriginal);
}

// partOfSpeech(doc) */
