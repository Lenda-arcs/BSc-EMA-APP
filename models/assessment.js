class Assessment {
    constructor(userId, userLoc, answerArr, time, skyImgBuffer, horizonImgBuffer) {
        this.user = userId
        this.weather = undefined
        this.location = {coordinates: [userLoc.lng, userLoc.lat]}
        this.answers = answerArr
        this.images = [
            {description: "sky", data: skyImgBuffer},
            {description: "horizon", data: horizonImgBuffer}]
        this.timestamp = {assessmentStart: time.start, assessmentEnd: time.end}
    }
}


export default Assessment
