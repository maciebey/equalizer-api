const { google } = require('googleapis');
const express = require('express');
const cors = require('cors');
const app = express();

// https://dustinpfister.github.io/2018/01/28/heroku-cors/
conf = {
  port: process.env.PORT || 8000,
  originUndefined: function (req, res, next) {
    if (!req.headers.origin) {
      res.json({
        mess: 'Hi you are visiting the service locally. If this was a CORS the origin header should not be undefined'
      })
    } else {
      next();
    }
  },

  // Cross Origin Resource Sharing Options
  cors: {
    origin: function (origin, cb) {
      // setup a white list
      let wl = ['http://eq.mbdv.io', 'https://eq.mbdv.io'];

      if (wl.indexOf(origin) != -1) {
        cb(null, true);
      } else {
        cb(new Error('invalid origin: ' + origin), false);
      }
    },
    optionsSuccessStatus: 200
  }

}

app.use(conf.originUndefined, cors(conf.cors));

const apiKey = process.env.GAPIKEY
const yt = google.youtube({ version: 'v3', auth: apiKey })

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

    request.then((data) => {
      resolve(data)
    }).catch((err) => {
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

app.listen(conf.port, () => console.log(`Server is running on PORT ${conf.port}`));
