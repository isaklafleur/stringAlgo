const abbreviations = [
  { abbreviation: "d.", expansion: "CATd" },
  { abbreviation: "D.", expansion: "DOGd" },
  { abbreviation: "H.", expansion: "HORSE" },
  { abbreviation: "M.", expansion: "MUMMY" }
];
const testStringOriginal = "d., d. p";

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
  const filterPattern2 = /\b\w{1,3}\b/g; // find words that are less then three characters long.
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

console.time("Hello");
console.log(regexString(testStringOriginal, abbreviations));
console.timeEnd("Hello");
