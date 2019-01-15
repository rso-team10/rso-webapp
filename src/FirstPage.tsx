import * as React from 'react';

interface ITrack {
    id: number;
    genre: string;
    name: string;
    active: boolean;
    count?: number;
}

interface IUpload {
    trackId: number;
    uploadDate: string;
    trackUrl?: string;
}

interface IState {
    artists: string[],
    tracks: ITrack[],
    upload: IUpload[],
    isLoaded: boolean;
}

class FirstPage extends React.Component<{}, IState> {
    public state: IState = {
        artists: [],
        isLoaded: false,
        tracks: [],
        upload: []
    };

    public componentDidMount() {
        // console.log("start didMount");
        fetch('http://localhost:8081/v1/artists')
            .then(response => response.json())
            .then(json => {
                const data = json.map((val: any) => val.name);
                this.setState({artists: data})
            });

        fetch('http://localhost:8081/v1/tracks')
            .then(response => response.json())
            .then(json => {
                const data: ITrack[] = json.map((val: any) => {
                    return {id: val.id, name: val.name, genre: val.genre, active: val.active}
                });
                data.forEach(track => {
                    const listenUrl = "http://localhost:8082/v1/listen/" + track.id;
                    fetch(listenUrl)
                        .then(response2 => response2.json())
                        .then(json2 => {
                            track.count = json2.listenCount;
                            this.setState({tracks: data})
                        })
                });
            });

        fetch("http://localhost:8082/v1/upload/")
            .then(response => response.json())
            .then(json => {
                const data: IUpload[] = json.map((val: any) => {
                    return {trackId: val.trackId, uploadDate: val.uploadDate}
                });
                this.setState({upload: data, isLoaded: true})
            })
    }

    public listen(trackId: number) {
        fetch("http://localhost:8083/v1/storage/" + trackId).then(response => response.text()).then(text => {
            const track = this.state.upload.find(up => up.trackId === trackId);
            if (track != null) {
                track.trackUrl = text;
            }
        });
    }

    public printTracks() {
        const {tracks} = this.state;
        return (
            <div>
                <h3>All tracks in system:</h3>
                <ul>
                    {tracks.map(track =>
                        <li key={track.id}>
                            <b>{track.name}</b> (id:{track.id}) active
                            = <b>{track.active.toString()}</b> (listened: {track.count}) {this.printListenButton(track.id)}
                        </li>
                    )}
                </ul>
                <br/>
            </div>)
    }

    public getTrackName(trackId: number) {
        const foundTrack = this.state.tracks.find(track => track.id === trackId);
        if (foundTrack != null) {
            return foundTrack.name;
        } else {
            return "";
        }
    }

    public printDownload(url: any) {
        if (url == null) {
            return "";
        } else {
            return <a href={url}>Download</a>
        }
    }


    public printListenButton(trackId: number) {
        const found = this.state.upload.find(up => up.trackId === trackId);
        if (found == null) {
            return "";
        } else {
            return (<button onClick={() => this.listen(trackId)}>Listen song</button>)
        }
    }

    public printUpload() {
        const {upload} = this.state;
        return (
            <div>
                <h3>Uploaded files: </h3>
                <ul>
                    {upload.map(up =>
                        <li key={up.trackId}>
                            <b>{this.getTrackName(up.trackId)}</b> uploaded
                            = {up.uploadDate} {this.printDownload(up.trackUrl)}
                        </li>
                    )}
                </ul>
                <br/>
            </div>)
    }

    public render() {
        // console.log("start render");
        const {isLoaded} = this.state;
        if (!isLoaded) {
            return <div>Loading...</div>
        }
        return (
            <div>
                {this.printTracks()}
                <br/>
                <br/>
                {this.printUpload()}
            </div>
        )
    }
}

export default FirstPage