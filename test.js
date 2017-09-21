const abbreviations = [
  { abbreviation: "d", expansion: "dog" },
  { abbreviation: "c", expansion: "cat" },
  { abbreviation: "h", expansion: "horse" }
];

const testStringOriginal = "      blablablalbla,  / c  coOL @ d p  233c    ";

const filterPattern1 = /[^a-zA-Z]+/g; // find all non English alphabetic characters.
const filterPattern2 = /\b\w{1,3}\b/g; // find words that are less then three characters long.
const filterPattern3 = /\s\s+/g; // find multiple whitespace, tabs, newlines, etc.

const filteredString = testStringOriginal
  .replace(filterPattern1, " ")
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
  .replace(filterPattern2, match => {
    let abbr = abbreviations.find(x => x.abbreviation === match);
    return abbr ? abbr.expansion : "";
  })
  .replace(filterPattern3, " ")
  .trim() // remove leading and trailing whitespace.
  .toUpperCase(); // change string to upper case.
console.log("ORGINAL STRING:" + testStringOriginal);
console.log("CONVERTED STRING:" + filteredString);
