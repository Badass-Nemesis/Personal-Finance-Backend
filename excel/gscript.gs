// VERSION 2 of the gmail attachment downloader

async function doGet(e) {
    await saaraFilesDelete();
    await downloadToGDrive();
    await fixingShit();
    return;
}

async function saaraFilesDelete() {
    var folder = DriveApp.getFolderById("19MfwGpbRb17FcFrvzihnCZ9AnPbiIb9m");
    var files = folder.getFiles();
    while (files.hasNext()) {
        var file = files.next();
        file.setTrashed(true);
    }

    return;
}

async function fixingShit() {
    var xlsFileUrl = "";
    var folderId = "19MfwGpbRb17FcFrvzihnCZ9AnPbiIb9m";

    var fileName = "transactions.xlsx";
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.searchFiles('title = "' + fileName + '"');
    if (files.hasNext()) {
        var file = files.next();
        xlsFileUrl = file.getUrl();
    }

    var xlsFile = DriveApp.getFileById(xlsFileUrl.match(/[-\w]{25,}/));
    var xlsBlob = xlsFile.getBlob();
    var xlsxBlob = xlsBlob.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    var file = DriveApp.getFolderById(folderId).createFile(xlsxBlob);
    file.setName("fixedFile.xlsx");

    return;
}

async function downloadToGDrive() {
    var query = "label:inbox subject:/Paytm Payments Bank Statement from/";
    var threads = GmailApp.search(query);
    var folder = DriveApp.getFolderById("19MfwGpbRb17FcFrvzihnCZ9AnPbiIb9m");

    var thread = threads[0];
    var messages = thread.getMessages();
    var message = messages[0];
    var attachments = message.getAttachments();
    if (attachments.length > 0) {
        var attachment = attachments[0];
        folder.createFile(attachment.setName("transactions.xlsx"));
    }

    return;
}


// VERSION 1 of the gmail attachment downloader

// async function doGet(e) {
//     var link = '';

//     async function deleteFilesInFolder() {
//         var folder = DriveApp.getFolderById("19MfwGpbRb17FcFrvzihnCZ9AnPbiIb9m");
//         var files = folder.getFiles();
//         while (files.hasNext()) {
//             var file = files.next();
//             file.setTrashed(true);
//         }
//     }
//     deleteFilesInFolder();

//     async function downloadAttachments() {
//         var query = "label:inbox subject:/Paytm Payments Bank Statement from/";
//         var threads = GmailApp.search(query);
//         var folder = DriveApp.getFolderById("19MfwGpbRb17FcFrvzihnCZ9AnPbiIb9m");

//         for (var i = 0; i < 1; i++) {
//             var thread = threads[i];
//             var messages = thread.getMessages();
//             for (var j = 0; j < 1; j++) {
//                 var message = messages[j];
//                 var attachments = message.getAttachments();
//                 if (attachments.length > 0) {
//                     for (var k = 0; k < 1; k++) {
//                         var attachment = attachments[k];
//                         folder.createFile(attachment.setName("transactions.xls"));
//                         return;
//                     }
//                 }
//             }
//         }
//     }
//     downloadAttachments();
// }

