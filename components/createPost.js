const style = `
  #create-post {
    width: 60%;
    margin: auto;
    margin-top: 20px;
    text-align: right;
  }
  #create-post textarea {
    width: 100%;
    border: 1px solid #dbdbdb;
    border-radius: 10px;
    outline: none;
  }
  .post {
    background-color: #1976D1;
    color: #fff;
    padding: 10px 15px;
    border-radius: 5px;
  }
  .post-image{
    background: transparent;
    border: none; 
    cursor: pointer;
    font-size: 20px;
    margin-right: 20px;
    outline: none;
  }
  .list-media{
    text-align: left;
  }
  .list-media img{
    width: 100px;
    max-height: 100px;
    object-fit: cover;
    margin-right: 10px;
  }
  .list-media video{
    width: 150px;
    max-height: 100px;

  }
`
import { getItemLocalStorage, uploadFile } from "../utils.js";
class CreatePost extends HTMLElement{
  listFile;
  constructor() {
    super();
    this.listFile = []
    this._shadowDom = this.attachShadow({ mode: 'open' })
  }
  connectedCallback() {
    this._shadowDom.innerHTML = `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <style>
        ${style}
      </style>
      <form id="create-post">
        <textarea name="content" rows="6"></textarea>
        <div class="list-media">
        </div>
        <input multiple type="file" id="file" style="display:none;" />
        <button class="post-image" type="button"><i class="fa fa-picture-o" aria-hidden="true"></i></button>
        <button class="post">Post</button>
      </form>
    `
    const postForm = this._shadowDom.getElementById('create-post')
    const uploadElm = this._shadowDom.querySelector('#file')
    postForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const content = postForm.content.value
      if(content.trim() === '') {
        alert('Vui lòng nhập nội dung bài viết')
      }
      const user = getItemLocalStorage('currentUser')
      
      const data = {
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        content: content,
        comments: [],
        authorName: user.fullName,
        isShow: true
      }
      firebase.firestore().collection('posts').add(data).then(res => {
        this.listFile.forEach(element => {
          uploadFile(element)
        });
      })
      
      postForm.content.value = ''
    })
    this._shadowDom.querySelector('.post-image').addEventListener('click', () => {
      uploadElm.click()
    })
    uploadElm.addEventListener('change', (e) => {
      console.log(uploadElm.files)
      for (const elm of uploadElm.files) {
        this.listFile.push(elm)
        this.showFile(elm)
      }
    })
  }
  showFile(file) {
    if (file.type.startsWith('image')) {
      var reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const elm = document.createElement('img')
        elm.setAttribute('src', e.target.result)
        this._shadowDom.querySelector('.list-media').appendChild(elm)
      }
    } else if (file.type.startsWith('video')) {
      var reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (e) => {
        const elm = document.createElement('video')
        elm.setAttribute('controls', true)
        elm.innerHTML = `
          <source src="${e.target.result}" >
        `
        this._shadowDom.querySelector('.list-media').appendChild(elm)
      }
    }
  }
}
window.customElements.define('create-post', CreatePost)