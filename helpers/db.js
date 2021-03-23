// import * as SQLite from 'expo-sqlite';
//
// const db = SQLite.openDatabase('test.db')
//
// // Init table that can hold data
// export const init = () => {
//     const promise = new Promise((resolve, reject) => {
//         db.transaction((tx) => {
//             tx.executeSql('CREATE TABLE IF NOT EXISTS assessment (' +
//                 'id INTEGER PRIMARY KEY NOT NULL, ' +
//                 'imageSkyUri TEXT NOT NULL, ' +
//                 'imageHorizonUri TEXT NOT NULL);',
//                 [],
//                 // Success call
//                 () => {
//                     resolve()
//                 }, // Failure call
//                 (_, err) => {
//                     reject(err)
//                 })
//         })
//     })
//     return promise;
//
// }
//
// export const insertAssessment = (imageSkyUri, imageHorizonUri) => {
//
//     const promise = new Promise((resolve, reject) => {
//         db.transaction((tx) => {
//             tx.executeSql(`
//             INSERT INTO assessment (imageSkyUri, imageHorizonUri)
//             VALUES (?, ?)`,
//                 [imageSkyUri, imageHorizonUri],
//                 // Success call
//                 (_, result) => {
//                     resolve(result)
//                 }, // Failure call
//                 (_, err) => {
//                     reject(err)
//                 })
//         })
//     })
//     return promise;
// }
//
// export const fetchAssessments = () => {
//     const promise = new Promise((resolve, reject) => {
//         db.transaction((tx) => {
//             tx.executeSql('SELECT * FROM assessment',
//                 [],
//                 // Success call
//                 (_, result) => {
//                     resolve(result)
//                 }, // Failure call
//                 (_, err) => {
//                     reject(err)
//                 })
//         })
//     })
//     return promise;
// }
