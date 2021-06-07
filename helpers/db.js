import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('test.db')

// Init table that can hold data
export const init = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS pendingAssessments (' +
                'id INTEGER PRIMARY KEY NOT NULL, ' +
                'imageSkyUri STRING NOT NULL, ' +
                'imageHorizonUri STRING NOT NULL, ' +
                'assessmentStr STRING NOT NULL);',
                [],
                // Success call
                () => {
                    resolve()
                }, // Failure call
                (_, err) => {
                    reject(err)
                })
        })
    })
    return promise;

}

export const insertAssessmentToDB = (assessmentStr, imageSkyUri, imageHorizonUri) => {

    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(`
            INSERT INTO pendingAssessments (assessmentStr, imageSkyUri, imageHorizonUri)
            VALUES (?, ?, ?)`,
                [assessmentStr, imageSkyUri, imageHorizonUri],
                // Success call
                (_, result) => {
                    resolve(result)
                }, // Failure call
                (_, err) => {
                    reject(err)
                })
        })
    })
    return promise;
}

export const fetchAssessmentsFromDB = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM pendingAssessments',
                [],
                // Success call
                (_, result) => {
                    resolve(result)
                }, // Failure call
                (_, err) => {
                    reject(err)
                })
        })
    })
    return promise;
}

export const deleteAssessmentFromDB = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql('DELETE FROM pendingAssessments',
                [],
                // Success call
                (_, result) => {
                    resolve(result)
                }, // Failure call
                (_, err) => {
                    reject(err)
                })
        })
    })
    return promise;
}
