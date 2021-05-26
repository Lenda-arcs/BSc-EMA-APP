import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('test.db')

// Init table that can hold data
export const init = () => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS assessments (' +
                'id INTEGER PRIMARY KEY NOT NULL, ' +
                'assessment STRING NOT NULL);',
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

export const insertAssessmentToDB = (assessment) => {

    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(`
            INSERT INTO assessments (assessment)
            VALUES (?)`,
                [assessment],
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
            tx.executeSql('SELECT * FROM assessments',
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

export const deleteAssessmentFromDB = (ID) => {
    const promise = new Promise((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql('DELETE FROM assessments WHERE id = ID',
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
