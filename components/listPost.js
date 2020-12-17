
const style = `
  .list-posts {
    width: 60%;
    margin: auto;
    margin-top: 10px;
  }
`
import { getDataFromDocs, getDataFromDoc } from "../utils.js";
class ListPost extends HTMLElement {
  constructor() {
    super();
    this._shadowDom = this.attachShadow({mode: 'open'})
  }
  async connectedCallback() {
    const res = 
    await firebase
    .firestore()
    .collection('posts')
    .where('isShow', '==', true)
    .get()
    this.listenCollectionChange()
    const listPost = getDataFromDocs(res)
    let html = ''
    listPost.forEach(element => {
      html += `
        <post-item
          id="${element.id}"
          time="${element.createdAt}"
          author="${element.authorName}"
          content="${element.content}">
        </post-item>
      `
    })
    this._shadowDom.innerHTML = `
      <style>
        ${style}
      </style>
      <div class="list-posts">
        ${html}
      </div>
    `
  }
  listenCollectionChange() {
    let firstRun = true
    firebase
    .firestore()
    .collection('posts')
    .where('isShow', '==', true)
    .onSnapshot((snapShot) => {
      if(firstRun) {
        firstRun = false
        return
      }
      console.log('Snap shot', snapShot.docChanges())
      const docChanges = snapShot.docChanges()
      for(const change of docChanges) {
        const doc = getDataFromDoc(change.doc)
        if(change.type === 'added') {
          const newElm = document.createElement('post-item')
          newElm.setAttribute('time', doc.createdAt)
          newElm.setAttribute('author', doc.authorName)
          newElm.setAttribute('content', doc.content)
          newElm.setAttribute('id', doc.id)
          const elementToInsert = this._shadowDom.querySelector('.list-posts')
          elementToInsert.insertBefore(newElm, elementToInsert.firstChild)
        } else if(change.type === 'removed') {
          const elmRemove = this._shadowDom.getElementById(doc.id)
          elmRemove.remove()
        }

      }

    })
  }
}
window.customElements.define('list-post', ListPost)