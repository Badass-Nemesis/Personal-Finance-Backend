var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { default: axios } = require("axios");
const fs = require('fs');
require('dotenv').config();
const XLSX = require('xlsx');

const filePath = 'excel/essential_files/fixedFile.xlsx';
if (fs.existsSync(filePath)) {
    console.log('The file exists. You may continue');
} else {
    console.log('The file doesnt exist');
    return;
}

const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

const range = XLSX.utils.decode_range(worksheet['!ref']);
const firstRow = 14;
const lastRow = range.e.r - 13;
const firstColumn = 1;
const lastColumn = range.e.c;

module.exports = async function () {
    for (let i = firstRow; i <= lastRow; i++) {
        let tempObject = {
            "dateAndTime": "",
            "narration": "",
            "amount": "",
            "transactionType": "",
            "referenceNumber": "",
            "availableBalance": "",
            "beneficiaryAccountNumber": "",
            "beneficiaryName": "",
            "remitterAccountNumber": "",
            "remitterName": ""
        }
        for (let j = firstColumn; j <= lastColumn; j++) {
            const cell_address = XLSX.utils.encode_cell({ c: j, r: i });
            const cell = worksheet[cell_address];

            if (cell) {
                if (j == 1) tempObject.dateAndTime = cell.v;
                if (j == 2) tempObject.narration = removeStuff(cell.v);
                if (j == 3) tempObject.amount = Number(cell.v);
                if (j == 4) tempObject.transactionType = debitOrCredit(cell.v);
                if (j == 5) tempObject.referenceNumber = cell.v;
                if (j == 6) tempObject.availableBalance = Number(cell.v);
                if (j == 7) tempObject.beneficiaryAccountNumber = cell.v;
                if (j == 8) tempObject.beneficiaryName = cell.v;
                if (j == 9) tempObject.remitterAccountNumber = cell.v;
                if (j == 10) tempObject.remitterName = cell.v;
            }
        }

        // console.log(validate(tempObject));
        puttingData(tempObject);
    }

    return 'Done uploading';
}

async function puttingData(jsonObject) {
    // var xhr = new XMLHttpRequest();
    // xhr.open("POST", `${process.env.BASE_URL}/api/transactions/`, true);
    // xhr.setRequestHeader("Content-Type", "application/json");
    // var data = JSON.stringify(jsonObject);
    // xhr.send(data);

    await axios.post(`${process.env.BASE_URL}/api/transactions/`, jsonObject, { headers: { 'x-auth-token': process.env.TOKEN } })
        .catch(error => {
            // console.log(error);
        })
    return;
}

function removeStuff(originalString) {
    const newString = originalString.split(/[\r\n+]/).join(" ");
    return newString;
}

function debitOrCredit(string) {
    if (string == 'D') {
        return 'Debit';
    } else {
        return 'Credit';
    }
}