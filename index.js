const fs = require('fs').promises;
const concurrently = require('concurrently');
const chalk = require('chalk');
const shell = require('shelljs');


// I am using an empty line as a delimiter for the URLs
// So, whenever the porogram encounters a new group, it will open all the URLs in the 
// group in a new browser window.

// Earlier I was using this regex to match URLs: /^(?:(?:https?|file):\/\/)?[^\s$.?#].[^\s]*/gm
// But this was giving me false positives so, not going ahead with it.

// The ?: in the following regex are to not capture groups.
// Read about it here: https://www.ocpsoft.org/tutorials/regular-expressions/or-in-regex/
const URLRegex =/(?:(?:https?|file):\/\/)(?:[a-z0-9\-]+\.)+[a-z0-9]+[\/#a-zA-Z0-9#+-?&_%]*/gm;
const URLGrouperRegex = /^\s*$/gm; // This is a sort of delimiter to group together sets of URLs.

const args = process.argv.slice(2);

/**
 * 
 * @param {String} baseString The entire data from the file.
 * @param {Number} startIndex The start index of the current group
 * @param {Number} endIndex The end index of the current group
 * 
 * @returns Array
 * 
 * Returns an array containing the URLs found in the current group
 */
function getURLsFromGroup(baseString, startIndex, endIndex) {

    if (baseString === undefined || startIndex === undefined ) {
        console.log(chalk.red('getURLsFromGroup: No base string provided'));
        return [];
    }

    if (startIndex < endIndex && endIndex <= baseString.length) {
        const substring = baseString.substring(startIndex, endIndex);
        const urlMatches = [...substring.matchAll(URLRegex)];

        return urlMatches;
    }
    return [];
}

const getGroupsURLsArr = fs.readFile(args[0], 'utf-8').then((data) => {
    const grouperMatches = data.matchAll(URLGrouperRegex);
    const groupIndices = [];

    let startIndex = 0;
    const urlGroupsArray = [];

    for (let match of grouperMatches) {
        groupIndices.push(match.index);
    }

    groupIndices.push(data.length);
    
    for (let groupIndex of groupIndices) {
        const urlsFromGroup = getURLsFromGroup(data, startIndex, groupIndex);
        const urlArr = [];
        
        for(let urlMatch of urlsFromGroup) {

            // The following code is to check if the URL is valid but it considers
            // www.google.com to be an invalid URL because of the missing protocol.
            // Unblock later.

            // try {
            //     const validURL = new URL(urlMatch[0]);
            // }
            // catch(err) {
            //     console.error(`${urlMatch[0]} is not a valid URL`);
            //     continue;
            // }
            urlArr.push(urlMatch[0]);
        }

        if (urlArr.length > 0) {
            urlGroupsArray.push(urlArr);
        }

        startIndex = groupIndex;
    }

    return urlGroupsArray;

}).catch((err) => {
    if (err.code === 'ERR_INVALID_ARG_TYPE') {
        console.log(chalk.red('Please enter a path to a file.'));
    }
    else {
        console.log(chalk.red(err));
    }
    return [];
})

const getGroupsParams = getGroupsURLsArr.then((groupsURLsArr) => {
    const groupParams = [];
    for (let groupURLs of groupsURLsArr) {
        groupParams.push(groupURLs.join(" "));
    }
    return groupParams;
})

const firefoxPath = (shell.which('firefox')).stdout;

// The way the firefox command seems to work is that, for example if you input
// firefox <url>
// Since it is a single URL, it will be opened up in an existing window.
// On the other hand, if you have multiple URLs like
// firefox <url> <url> ...
// then Firefox seems to spawn a new window.
// Which is why, if the number of URLs in a group is only one, then we add
// the --new-window option to it.
getGroupsParams.then((groupsParams) => {
    const commandArray = [];
    groupsParams.forEach((groupParams, index) => {
        const hasSingleURL = groupParams.match(" ") === null;
        const command = "firefox"+ (hasSingleURL ? " --new-window " : " ") +groupParams;
        commandArray[index] = {command};
    })

    commandArray.length > 0 && concurrently(commandArray);
}).catch((err) => {
    console.log(chalk.red(err));
})