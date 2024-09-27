const fs = require("fs");

// Read the SARIF file
const sarifFilePath = "/home/runner/work/Schedules-App/Schedules-App/eslint-results.sarif";
const sarifData = JSON.parse(fs.readFileSync(sarifFilePath, "utf8"));

// Function to replace file names
const replaceFileNames = data => {
  if(Array.isArray(data)) {
    return data.map(replaceFileNames);
  } else if(typeof data === "object" && data !== null) {
    for(const key in data) {
      if(key === "uri" && typeof data[key] === "string") {
        data[key] = data[key].replace(/\.js\.html\.js$/, ".js.html");
      } else {
        data[key] = replaceFileNames(data[key]);
      }
    }
  }
  return data;
};

// Replace file names in the SARIF data
const updatedSarifData = replaceFileNames(sarifData);

// Write the updated SARIF data back to the file
fs.writeFileSync(sarifFilePath, JSON.stringify(updatedSarifData, null, 2), "utf8");

console.log("File names updated successfully.");
