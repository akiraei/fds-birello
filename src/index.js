import './index.scss';
import axios from 'axios';



//--------------------------variable--------------------------
//--------------------------variable--------------------------
//--------------------------variable--------------------------



const postAPI = axios.create({
  baseURL: process.env.API_URL
})

const templates = {
  anchor : document.querySelector('.anchor'),
  login : document.querySelector('#login').content,
  header : document.querySelector('#header'),
  newCardbox : document.querySelector('#newCardbox-modal').content,
  content : document.querySelector('#content').content,
  cardbox : document.querySelector('#cardbox').content,
  taskIndex : document.querySelector('#task-index').content,
  project : document.querySelector('#project').content,
  taskProject : document.querySelector('#task-project').content,
  comment : document.querySelector('#comment').content,
  edit : document.querySelector('#edit-modal').content,
  footer : document.querySelector('#footer').content
}

//-----------------------function----------------------------------
//-----------------------function----------------------------------
//-----------------------function----------------------------------

function sortDate (arr) {
  let value =  arr.sort( function (a,b) {
    let k = b.update - a.update
    return k
  })
  return value
}
















function render(anchor, fragment) {
  anchor.textContent = ""; 
  anchor.appendChild(fragment);
  console.log("render")
}



//----------------template section-----------------------------
//----------------template section-----------------------------
//----------------template section-----------------------------





//------------------- login  page--------------------------
//------------------- login  page--------------------------


async function loginPage() {

  const fragment = document.importNode(templates.login, true)
  const form = fragment.querySelector('.login__form')
  form.addEventListener("submit", async e => {
    const payload = {
      username : e.target.elements.id.value,
      password: e.target.elements.pw.value
    }

    e.preventDefault()

    const res = await postAPI.post('./users/login', payload)

    e.target.elements.pw.value = ""
  })

  render(templates.anchor, fragment)
}


//------------------- index  page--------------------------
//------------------- index  page--------------------------

async function indexPage() {

  const headerFrag = document.importNode(templates.header, true)

  const logoutBtn = headerFrag.querySelector(".header__logout-btn")

  // logoutBtn.addEventListener("click", e => {
  
  // })
  

  const contentFrag = document.importNode(templates.content, true)

  const contentBodyAnchor = contentFrag.querySelector(".content__body-anchor")

  const resCardbox = await postAPI.get('./projects')

  console.log("log1", sortDate(resCardbox.data))


  sortDate(resCardbox.data).forEach( async cardbox => {
    
    const cardboxId = cardbox.id

    const cardboxFrag = document.importNode(templates.cardbox, true)

    const cardboxAnchor = cardboxFrag.querySelector(".cardbox__anchor")

    cardboxFrag.querySelector(".cardbox__title").textContent = cardbox.title 
    cardboxFrag.querySelector(".cardbox__update").textContent = cardbox.update



    const taskIndexFrag = document.importNode(templates.taskIndex, true)


    const resTaskIndex = await postAPI.get('./tasks')
    sortDate(resTaskIndex.data).forEach( async taskIndex => {
      if(taskIndex.projectId === cardbox.id) {
        taskIndexFrag.querySelector(".task-index__title").textContent = taskIndex.title
        cardboxAnchor.appendChild(taskIndexFrag)
      }
    })
 
    contentBodyAnchor.appendChild(headerFrag)
   
  })
  render(templates.anchor, headerFrag)
  render(templates.anchor, contentFrag)
 }















//--------------------action----------------------
//--------------------action----------------------
//--------------------action----------------------


// loginPage()
indexPage()




// document.querySelector('h1').addEventListener('click', e => {
//   alert('Hello World!');
// });
