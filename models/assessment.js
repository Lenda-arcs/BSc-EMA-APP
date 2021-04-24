class Assessment {
    constructor(userId, userLoc, selection, time, skyImgBuffer, horizonImgBuffer) {
        this.user = userId[1]
        this.weather = undefined
        this.location = {coordinates: [userLoc.lng, userLoc.lat]}
        this.selection = selection
        this.images = [
            {description: "sky", data: skyImgBuffer},
            {description: "horizon", data: horizonImgBuffer}]
        this.timestamp = {assessmentStart: time.start, assessmentEnd: time.end}
    }
}


export default Assessment
