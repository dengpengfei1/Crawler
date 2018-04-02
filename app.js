const url = require('url')
const express = require('express')
const cheerio = require('cheerio')
const superagent = require('superagent')

let app = express()
let cnodeUrl = 'https://cnodejs.org/'
let resToShow = []

function getHtml(cnodeUrl) {
  return new Promise((resolve, reject) => {
    superagent.get(cnodeUrl)
    .end((err, data) => {
      if (err) {
        return reject(err)
      }
      let $ = cheerio.load(data.text)
      resolve($)
    })
  })
}

app.get('/', async (req, res, next) => {
  let urlResult = []
  await getHtml(cnodeUrl).then(($) => {
    $('#topic_list .topic_title').each((i, item) => {
      item = $(item)
      urlResult.push(url.resolve(cnodeUrl, item.attr('href')))
    })
  }).catch(err => {
    res.send(err.message)
  })

  urlResult = urlResult.slice(0, 10)

  let proArr = []
  urlResult.forEach(item => {
    proArr.push(getHtml(item))
  })

  await Promise.all(proArr).then(results => {
    results.forEach((item, i) => {
      resToShow.push({
        title: item('.topic_full_title').text().trim(),
        href: urlResult[i],
        comment1: item('.reply_content').eq(0).text().trim()
      })
    })
  })
  res.send(resToShow)
})

app.listen(process.env.PORT || 3000)
