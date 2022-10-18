const {google} = require('googleapis');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 8000;

const apiKey = process.env.GAPIKEY
const yt = google.youtube({version: 'v3', auth: apiKey})

const searchRequest = (query, pageToken) => {
  return new Promise((resolve, reject) => {
    const params = {
      part: 'snippet',
      maxResults: 5,
      q: query,
      type: 'video',
      pageToken: pageToken,
      fields: 'items(id(kind,playlistId,videoId),snippet(thumbnails/default,title)),nextPageToken'
    }

    const request = yt.search.list(params)

    request.then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  })
}

app.get('/', (req, res) => {
  res.send({});
});

const tyQueryController = async (req, res) => {
  const YtQueryString = req.params.YtQueryString;
  const PageToken = req.params.PageToken;
  const r = await searchRequest(YtQueryString, PageToken)
  res.send(r.data);
}

app.get('/:YtQueryString', tyQueryController);
app.get('/:YtQueryString/:PageToken', tyQueryController);

app.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
