'use strict'

// dont try this at home
// this code is 100% hacky bad news 
const debug = require('debug')('slugram:gallery-mock')
const Pic = require('../../model/pic.js')
const User = require('../../model/user.js')
const Gallery = require('../../model/gallery.js')
const lorem = require('lorem-ipsum')

// mock a bunch of users
// then a bunch of gallerys for each user
// then about of notes  for each gallery
module.exports = function(count, done){
  debug(`mock ${count}gallerys`)
  let userMocks = []
  let galleryMocks = []
  for(var i=0; i<count; i++){
    userMocks.push(mockAUser())
  }

  Promise.all(userMocks)
  .then( tempUsers => {
    this.tempUsers = tempUsers
    tempUsers.forEach( user => {
      for (let i=0; i<count; i++){
        let userID = user._id.toString()
        let username = user.username
        galleryMocks.push(mockAGallery(userID, username))
      }
    })
    return Promise.all(galleryMocks)
  })
  .then(gallerys => {
    this.tempPics = []
    let saveGals = []
    gallerys.forEach( gal => {
      let galpics = []
      let userID = gal.userID
      let username = gal.username
      for(let i=0; i<count; i++){
        galpics.push(mockAPic(userID, username))
      }
      Promise.all(galpics)
      .then( pics => {
        pics.forEach( pic => {
          gal.pics.push(pic._id.toString)
          this.tempPics.push(pic)
        })
      })
      saveGals.push(gal.save())
    })
    return Promise.all(saveGals) 
  })
  .then(gallerys => {
    this.tempGallerys = gallerys
  })
  .catch(done)
}

let count = 0
function mockAUser(){
  console.log('count', count++)
  let username = lorem({count: 3, units: 'word'}).split(' ').join('-')
  let password = lorem({count: 3, units: 'word'}).split(' ').join('-')
  let email= lorem({count: 2, units: 'word'}).split(' ').join('-')
  let exampleUser = {
    username,
    password,
    email: `${email}@slug.slug`,
  }
  let tempPassword = password
  let tempUser, tempToken
  return new User(exampleUser) 
  .generatePasswordHash(tempPassword)
  .then(user => user.generateFindHash())
  .then( user => user.save())
  .then( user => {
    tempUser = user
    return user.generateToken()
  })
  .then( token => {
    tempToken = token
    return {
      tempUser,
      tempToken,
      tempPassword,
    }
  })
}

function mockAGallery(userID, username){
  let name = lorem({count: 2, units: 'word'})
  let desc = lorem({count: 2, units: 'sentence'})
  let exampleGallery = { name, desc , userID, username}
  return new Gallery(exampleGallery).save()
}

function mockAPic(userID, username){
  let name = lorem({count: 2, units: 'word'})
  let desc = lorem({count: 2, units: 'sentence'})
  let uri = lorem({count: 5, units: 'word'}).split(' ').join('-')
  let objectKey = lorem({count: 5, units: 'word'}).split(' ').join('')
  let imageURI = `https://${uri}/${objectKey}`
  let examplePicData = {
    name,
    desc,
    userID,
    username,
    imageURI,
    objectKey,
    created: new Date(),
  }
  return new Pic(examplePicData).save()
}