class Assessment {
    constructor(id, date, imgUriSky, imgUriHorizon, location, picks) {
        this.id = id
        this.date = date
        this.imageUriSky = imgUriSky
        this.imageUriHorizon = imgUriHorizon
        this.coords = {
            lat : location.lat,
            lng : location.lng
        }
        this.picks = picks
    }
}


export default Assessment
