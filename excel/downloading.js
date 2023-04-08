const fetch = require('node-fetch');
const fs = require('fs');
const { UtilsGDrive } = require('utils-google-drive');
require('dotenv').config();
const winston = require('winston');

module.exports = async function () {
    const scriptUrl = process.env.GSCRIPT_URL;
    await fetch(scriptUrl);
    await deleteFile('excel/essential_files/fixedFile.xlsx');
    await allAboutDownload();
    return;
}

async function allAboutDownload() {
    const utilsGDrive = new UtilsGDrive({
        pathCredentials: 'excel/essential_files/credentials.json',
        pathToken: 'excel/essential_files/token.json'
    });

    utilsGDrive.download({
        fileName: 'fixedFile.xlsx',
        // parentName: '/Paytm'
    }, 'excel/essential_files');

    // FOR TOKEN CREATION
    // const { getTokenGDrive } = require('utils-google-drive');
    // getTokenGDrive({ pathCredentials: 'excel/credentials.json' });
    return;
}

async function deleteFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err)
            return
        }
        console.log(`${filePath} was deleted`)
    });

    return;
}

