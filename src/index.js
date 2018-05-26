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
  indexpage : document.querySelector('#indexpage').content,
  header : document.querySelector('#header').content,
  newCardbox : document.querySelector('#newCardbox-modal').content,
  content : document.querySelector('#content').content,
  label : document.querySelector('#label').content,
  cardbox : document.querySelector('#cardbox').content,
  taskIndex : document.querySelector('#task-index').content,
  projectpage: document.querySelector('#projectpage').content,
  projectheader : document.querySelector('#project__header').content,
  taskProject : document.querySelector('#task-project').content,
  comment : document.querySelector('#comment').content,
  // edit : document.querySelector('#edit-modal').content,
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



function render(fragment) {
  templates.anchor.textContent = ""; 
  templates.anchor.appendChild(fragment);
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

  render(fragment)
}


//------------------- index  page--------------------------
//------------------- index  page--------------------------

async function indexPage() {

  const indexpageFrag = document.importNode(templates.indexpage, true)
  const indexpageAnchor = indexpageFrag.querySelector(".indexpage__anchor")

 
  //-------------------header--------------------------------
  const headerFrag = document.importNode(templates.header, true)
  const logoutBtn = headerFrag.querySelector(".header__logout-btn")  
  


  
  
  //----------------------content ---------------------------
  
  const resCardbox = await postAPI.get('./projects')
  const resTaskIndex = await postAPI.get('./tasks')
  const resLabel = await postAPI.get('./labels')
  
  const contentFrag = document.importNode(templates.content, true)



  //-------------------------label----------------------------
 
 
  const contentHeaderAnchor = contentFrag.querySelector(".content__header-anchor")

  const userid = 1

  resLabel.data.forEach( async label => {

    // console.log(label)

    if (userid === label.userId) {

      const labelFrag = document.importNode(templates.label, true)

      const labelContent = labelFrag.querySelector(".label__content")

      labelContent.textContent = label.title

      contentHeaderAnchor.appendChild(labelContent)
    }
    
  })
  



  //--------------------body---------------------------------
 
  const contentBodyAnchor = contentFrag.querySelector(".content__body-anchor")


  sortDate(resCardbox.data).forEach( async cardbox => {

    
    let cardboxId = cardbox.id

    const cardboxFrag = document.importNode(templates.cardbox, true)

    const cardboxAnchor = cardboxFrag.querySelector(".cardbox__anchor")

    cardboxFrag.querySelector(".cardbox__title").textContent = cardbox.title 
    cardboxFrag.querySelector(".cardbox__update").textContent = "updata " + cardbox.update
    
    sortDate(resTaskIndex.data).forEach( async taskIndex => {
      
      const taskIndexFrag = document.importNode(templates.taskIndex, true)
      
      // console.log("log5", taskIndex)

      if(taskIndex.projectId === cardbox.id) {
        taskIndexFrag.querySelector(".task-index__title").textContent = taskIndex.title
        cardboxAnchor.appendChild(taskIndexFrag)
      }
    })
 
    contentBodyAnchor.appendChild(cardboxFrag)
   
  })

  indexpageAnchor.appendChild(headerFrag)
  indexpageAnchor.appendChild(contentFrag)


  render(indexpageAnchor)
 }








 //------------------- project  page-----------------------
 //------------------- project  page-----------------------


async function projectPage(num) {

  const projectpageFrag = document.importNode(templates.projectpage, true)
  const projectpageAnchorHeader = projectpageFrag.querySelector(".projectpage__anchor-header")
  const projectpageAnchorTask = projectpageFrag.querySelector(".projectpage__anchor-task")
  const projectpageAnchorComment = projectpageFrag.querySelector(".projectpage__anchor-comment")

  //---------------------project header----------------
  console.log("project header")


  const resProject = await postAPI.get(`./projects/${num}`)
  
  const projectheaderFrag = document.importNode(templates.projectheader, true)

  // projectheaderFrag.querySelector(".project__newTask").addEventListener("click", e => {})
  // projectheaderFrag.querySelector(".project__goBack").addEventListener("click", indexPage())
  projectheaderFrag.querySelector(".project__title").textContent = resProject.data.title
  projectheaderFrag.querySelector(".project__duedate").textContent = resProject.data.dueDate

  projectpageAnchorHeader.appendChild(projectheaderFrag)



  //------------------project task --------------------------
  console.log("project task")
  
  const resTaskProject = await postAPI.get('./tasks')
   
  resTaskProject.data.forEach( task => {
    
    if (task.projectId === num) {
      
      const taskProjectFrag = document.importNode(templates.taskProject, true)

      taskProjectFrag.querySelector(".task-project__title").textContent = task.title
      taskProjectFrag.querySelector(".task-project__body").textContent = task.body
      taskProjectFrag.querySelector(".task-project__username").textContent = task.username
      taskProjectFrag.querySelector(".task-project__update").textContent = task.update

      const container = taskProjectFrag.querySelector(".task-project__content-container")
      const containerDelete = taskProjectFrag.querySelector(".task-project__delete-btn")
      const opBtn = taskProjectFrag.querySelector(".task-project__option-btn")
      const editBtn = taskProjectFrag.querySelector(".task-project__option-btn-edit")
      const completeBtn = taskProjectFrag.querySelector(".task-project__option-btn-complete")
      const deleteBtn = taskProjectFrag.querySelector(".task-project__option-btn-delete")


      editBtn.addEventListener("click", e => {
        taskProjectFrag.querySelector(".projectPage-edit-modal__container").classList.add("is-active")
      })

      completeBtn.addEventListener("click", e => {
        container.classList.add('is-grey-dark')
        opBtn.classList.add('hidden')
        containerDelete.remove('hidden')
      })

      deleteBtn.addEventListener("click", async e => {

        const res = await postAPI.delete(`./tasks/${task.id}`)
        projectPage(num)

      })













      projectpageAnchorTask.appendChild(taskProjectFrag)
    }
  })


  //-------------------project comment ----------------------
  console.log("project comment")

  const resComment = await postAPI.get('./comments?_expand=user')

  resComment.data.forEach( comment => {
    if (comment.taskId === num) {
      
      const commentFrag = document.importNode(templates.comment, true)
      
      commentFrag.querySelector(".comment__username").textContent = comment.user.username      
      commentFrag.querySelector(".comment__content").textContent = comment.body
      commentFrag.querySelector(".comment__originDate").textContent = comment.orgDate

      projectpageAnchorComment.appendChild(commentFrag)
    }
  })

render(projectpageFrag)
}



//----------------  task edit-modal  -----------------
//----------------  task edit-modal  -----------------




















//--------------------action----------------------
//--------------------action----------------------
//--------------------action----------------------


// loginPage()
// indexPage()
projectPage(2)



// document.querySelector('h1').addEventListener('click', e => {
//   alert('Hello World!');
// });
