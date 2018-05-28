import './index.scss';
import axios from 'axios';



//--------------------------variable--------------------------
//--------------------------variable--------------------------
//--------------------------variable--------------------------


let recentTask = 1;
let recentUserid;

const postAPI = axios.create({
  baseURL: process.env.API_URL
})


const anchor = {
  login : document.querySelector('.login__anchor'),
  indexHeader : document.querySelector('.index__anchor-header'),
  indexContent : document.querySelector('.index__anchor-content'),
  indexFooter : document.querySelector('.index__anchor-footer'),
  projectHeader : document.querySelector('.project__anchor-header'),
  projectTask : document.querySelector('.project__anchor-task'),
  projectComment : document.querySelector('.project__anchor-comment'),
  projectFooter : document.querySelector('.project__anchor-footer')
}


const templates = {
  login : document.querySelector('#login').content,
  header : document.querySelector('#header').content,
  content : document.querySelector('#content').content,
  label : document.querySelector('#label').content,
  cardbox : document.querySelector('#cardbox').content,
  cardboxLabel : document.querySelector('#cardbox__label').content,
  taskIndex : document.querySelector('#task-index').content,
  projectheader : document.querySelector('#project__header').content,
  taskProject : document.querySelector('#task-project').content,
  comment : document.querySelector('#comment').content,
  commentContent : document.querySelector('#comment-content').content,
  footer : document.querySelector('#footer').content
}

//-----------------------function-------------------------
//-----------------------function-------------------------
//-----------------------function-------------------------

function sortDate (arr) {
  let value =  arr.sort( function (a,b) {
    let k = moment(b.update).format('x') - moment(a.update).format('x')
    return k
  })
  return value
}



function sortOrgDate (arr) {
  let value =  arr.sort( function (a,b) {
    let k = moment(b.orgDate).format('x') - moment(a.orgDate).format('x')
    return k
  })
  return value
}

function sortComplete (arr) {
  let value =  arr.sort( function (a,b) {
    let k = a.complete - b.complete
    return k
  })
  return value
}

function sortLateTask (arr) {
  let value =  arr.sort( function (a,b) {
    let k = b.id - a.id
    return k
  })
  return value
}


function completationProject (task, fragment) {
  if (task.complete === 1) {

    fragment.querySelector(".task-project__content-container").classList.add('covering')
    
    fragment.querySelector(".task-project__option-btn").classList.add('hidden')
    
    fragment.querySelector(".task-project__delete-btn").classList.remove('hidden')
  }
}

function completationIndex (task, fragment) {
  if (task.complete === 1) {

    fragment.querySelector(".cardbox__container").classList.add('covering')
    
    fragment.querySelector(".cardbox__btn-edit").classList.add('hidden')
    
    fragment.querySelector(".cardbox__btn-complete").classList.add('hidden')
  }
}








function login(res) {
  let token;
    if(localStorage.getItem('token')) {
      token = localStorage.getItem('token')
      postAPI.defaults.headers['Authorization'] = `Bearer ${token}`
      indexPage()
      
    } else if (res){
    localStorage.setItem('token', res.data.token)
    token = localStorage.getItem('token')
    postAPI.defaults.headers['Authorization'] = `Bearer ${token}`
    indexPage()
    }
  }
  
  function logout(){
    delete postAPI.defaults.headers['Authorization']
    localStorage.removeItem('token')
    recentUserid = ""
    loginPage()
  }









function swipe() {
  
  let arr = document.querySelectorAll(".anchor")
  arr.forEach( e => {
    e.textContent = ""
  })
}



function render(anchor, fragment) {

  // anchor.textContent = ""; 
  
  anchor.appendChild(fragment);
}

//----------------template section-----------------------------
//----------------template section-----------------------------
//----------------template section-----------------------------





//------------------- login  page--------------------------
//------------------- login  page--------------------------


async function loginPage() {
  
  document.querySelector(".login").classList.remove("hidden")
  document.querySelector(".index").classList.add("hidden")
  document.querySelector(".project").classList.add("hidden")

  swipe()

  const fragment = document.importNode(templates.login, true)

  const signupBtn = fragment.querySelector('.signup__btn')
  const signupModal = fragment.querySelector('.login-signup-modal__container')
  const signupId = fragment.querySelector('.login-signup-modal__id-input')
  const signupPw = fragment.querySelector('.login-signup-modal__pw-input')
  const signupRePw = fragment.querySelector('.login-signup-modal__rePw-input')
  const signupSubmitBtn = fragment.querySelector('.login-signup-modal__submit-btn')
  const signupCloseBtn = fragment.querySelector('.login-signup-modal__close-btn ')
  
  
  signupBtn.addEventListener('click', e => { 
    signupModal.classList.add('is-active')
  })

  signupCloseBtn.addEventListener('click', e => {
    signupModal.classList.remove('is-active')
  })
  
  const form = fragment.querySelector('.login__form')
  form.addEventListener("submit", async e => {
    const payload = {
      username : e.target.elements.id.value,
      password: e.target.elements.pw.value
    }
    
    e.preventDefault()
    
    const res = await postAPI.post('./users/login', payload)

    if(res) {
      const userRes = await postAPI.get('./users')

      recentUserid =  userRes.data.filter( el => {
        return el.username === payload.username
      })[0].id
    }
    
    e.target.elements.pw.value = ""
    
    login(res)
  })
  
  const signupForm = fragment.querySelector('.login-signup-modal__form')
  signupForm.addEventListener('submit', async e => {
    e.preventDefault()

    let id = e.target.elements.id.value
    let pw = e.target.elements.pw.value
    let rePw = e.target.elements.rePw.value

    if(pw === rePw) {
      const payload = {
        username : id,
        password : pw,
        identity : "user"
      }

      const res = await postAPI.post('./users', payload)

      id = ""
      pw = ""
      rePw = ""
    }
  })

  render(anchor.login, fragment)
}


//------------------- index  page--------------------------
//------------------- index  page--------------------------

async function indexPage() {
  
  const userid = recentUserid

  document.querySelector(".login").classList.add("hidden")
  document.querySelector(".index").classList.remove("hidden")
  document.querySelector(".project").classList.add("hidden")

  swipe() 

   //-------------------header--------------------------------
  const headerFrag = document.importNode(templates.header, true)

        headerFrag.querySelector(".header__logout-btn").addEventListener("click", e => {
          logout()
        })

        const newCardboxModal = headerFrag.querySelector(".newCardbox-modal")

        headerFrag.querySelector(".header__newCardbox-btn").addEventListener("click", e => {
          e.preventDefault()
          
          newCardboxModalBegin.value = moment().format("YYYY-MM-DD")
          newcardboxModalDue.value = moment().format("YYYY-MM-DD")

          newCardboxModal.classList.add("is-active")
        })

        headerFrag.querySelector(".header__newCardbox-close-btn").addEventListener("click", e => {
          e.preventDefault()
          newCardboxModal.classList.remove("is-active")
        })


        const newCardboxModalTitle = headerFrag.querySelector(".newCardbox-modal__title-input")
        const newCardboxModalBegin = headerFrag.querySelector(".newCardbox-modal__startDate-input")
        const newcardboxModalDue = headerFrag.querySelector(".newCardbox-modal__dueDate-input")
        const newcardboxSubmitBtn = headerFrag.querySelector(".newCardbox-modal__submit-btn")

        newcardboxSubmitBtn.addEventListener('click', async e=> {
          e.preventDefault()

          const res = await postAPI.post('./projects', {
            title : newCardboxModalTitle.value,
            startDate : newCardboxModalBegin.value,
            dueDate : moment(newcardboxModalDue.value),
            orgDate : moment(),
            update : moment(),
            userId : userid
            ,identity : "project"
          })
          indexPage()
        })


  render(anchor.indexHeader, headerFrag)
  

  
  //----------------------content ---------------------------
  
  
  const contentFrag = document.importNode(templates.content, true)


  // ....label.......
 
 
  const contentHeaderAnchor = contentFrag.querySelector(".content__header-anchor")


  const resLabel = await postAPI.get('./labels')

  resLabel.data.forEach( async label => {

    if (userid === label.userId) {

      const labelFrag = document.importNode(templates.label, true)

      const labelContent = labelFrag.querySelector(".label__content")

      labelContent.textContent = label.title

      contentHeaderAnchor.appendChild(labelContent)
    }
    
  })
  


  //....body.....

  
  const contentBodyAnchor = contentFrag.querySelector(".content__body-anchor")
  
  const resCardbox = await postAPI.get('./projects')
  const resTaskIndex = await postAPI.get('./tasks')

  sortComplete(sortDate(resCardbox.data)).forEach( async cardbox => {

    if(cardbox.userId === userid){ // project userId matching point
      
    let cardboxId = cardbox.id
    
    const cardboxFrag = document.importNode(templates.cardbox, true)


    cardboxFrag.querySelector(".cardbox__title").addEventListener("click", e => {


      e.preventDefault()


      //----///----- I Hate REST API ------///-----///

      const processedArr = resTaskIndex.data.filter( e => {
        let k = e.projectId === cardboxId
        return k
      })

      if(processedArr.length > 0){
        recentTask = processedArr[0].id
      } else { recentTask = 0}

      //----///----- I Hate REST API ---///-------///

      projectPage(cardboxId)
    })
 
    const cardboxAnchor = cardboxFrag.querySelector(".cardbox__anchor")

    cardboxFrag.querySelector(".cardbox__title").textContent = cardbox.title 
    cardboxFrag.querySelector(".cardbox__update").textContent = "update " + moment(cardbox.update).format('YYYY-MM-DD')
    cardboxFrag.querySelector(".cardbox__dueDate").textContent = "due date " + moment(cardbox.dueDate).format('YYYY-MM-DD')


    // --- cardbox btn ---



    const cardboxEditRes = await postAPI.get(`./projects/${cardboxId}`)

    const cardboxEditModal = cardboxFrag.querySelector(".cardbox-edit-modal")

    const cardboxBtnEdit = cardboxFrag.querySelector(".cardbox__btn-edit")
    const cardboxBtnComplete = cardboxFrag.querySelector(".cardbox__btn-complete")
    const cardboxBtnDelete = cardboxFrag.querySelector(".cardbox__btn-delete")


    const cardboxEditTitle = cardboxFrag.querySelector(".cardbox-edit-modal__title-input")
    const cardboxEditBegin = cardboxFrag.querySelector(".cardbox-edit-modal__startDate-input")
    const cardboxEditDue = cardboxFrag.querySelector
    (".cardbox-edit-modal__dueDate-input")

    cardboxBtnEdit.addEventListener("click", e => {
      e.preventDefault()
      cardboxEditTitle.value = cardboxEditRes.data.title
      cardboxEditBegin.value = moment(cardboxEditRes.data.startDate).format("YYYY-MM-DD")
      cardboxEditDue.value = moment(cardboxEditRes.data.dueDate).format("YYYY-MM-DD")
      cardboxEditModal.classList.add("is-active")
    })

    cardboxBtnComplete.addEventListener("click", async e => {
      e.preventDefault()
      const res = await postAPI.patch(`./projects/${cardboxId}`,{
        complete : 1,
        update : moment()
      })
      indexPage()
    })

    cardboxBtnDelete.addEventListener("click", async e => {
      e.preventDefault()
      const res = await postAPI.delete(`./projects/${cardboxId}`)
      indexPage()
    })
    


    
    
    
    
    
    // --- cardbox edit modal close and submit ---
    
    const cardboxEditForm = cardboxFrag.querySelector(".cardbox-edit-modal__form")
    const cardboxEditClose = cardboxFrag.querySelector(".cardbox-edit-modal__close-btn") 
     
    cardboxEditForm.addEventListener("submit", async e => {
      e.preventDefault()
      const res = await postAPI.patch(`./projects/${cardboxId}`, {
        title : e.target.elements.title.value
        ,startDate : e.target.elements.startDate.value
        ,dueDate :e.target.elements.dueDate.value
        ,update : moment()
      })
      indexPage()
    })

    cardboxEditClose.addEventListener("click", e => {
      e.preventDefault()
      cardboxEditModal.classList.remove("is-active")
    })



    // -- cardbox label --
    ////////////////// please  rest api ////////////////////

    const cardboxLabelAnchor = cardboxFrag.querySelector(".cardbox__label-anchor")

    const Thakky = resTaskIndex.data.filter( e => {return e.projectId === cardboxId})
    let processedLabelArr =[]
    Thakky.forEach( el => {
      processedLabelArr.push(resLabel.data.filter( e => {return e.taskId === el.id})[0])
    })
    
        processedLabelArr.forEach(label => {
      if(label) {
        const cardboxLabelFrag = document.importNode(templates.cardboxLabel, true)
        
        cardboxLabelFrag.querySelector('.cardbox__label').textContent = label.title
        
        render(cardboxLabelAnchor, cardboxLabelFrag)
      }
    })
    ////////////////// please  rest api ////////////////////




    if (sortOrgDate(resTaskIndex.data).lenght < 3){

      sortOrgDate(resTaskIndex.data).forEach( async taskIndex => {
      
        const taskIndexFrag = document.importNode(templates.taskIndex, true)

        if(taskIndex.projectId === cardbox.id) {
          taskIndexFrag.querySelector(".task-index__title").textContent = taskIndex.title
          cardboxAnchor.appendChild(taskIndexFrag)
        }
      })

    } else {
      for (let i = 0; i < 3; i++) {

        const taskIndexFrag = document.importNode(templates.taskIndex, true)
        


      if(
        (sortOrgDate(resTaskIndex.data).lenght === 0) &&
         (sortOrgDate(resTaskIndex.data)[i].projectId === cardbox.id)
        ){
        taskIndexFrag.querySelector(".task-index__title").textContent = sortOrgDate(resTaskIndex.data)[i].title
        cardboxAnchor.appendChild(taskIndexFrag)
      }

      }
    }
    


    // sortOrgDate(resTaskIndex.data).forEach( async taskIndex => {
      
    //   const taskIndexFrag = document.importNode(templates.taskIndex, true)

    //   if(taskIndex.projectId === cardbox.id) {
    //     taskIndexFrag.querySelector(".task-index__title").textContent = taskIndex.title
    //     cardboxAnchor.appendChild(taskIndexFrag)
    //   }
    // })

    completationIndex (cardbox, cardboxFrag)
    contentBodyAnchor.appendChild(cardboxFrag)
  }
  })

  
  render(anchor.indexContent, contentFrag)

}





 //------------------- project  page-----------------------
 //------------------- project  page-----------------------


async function projectPage(num) {

  const userid = recentUserid

  document.querySelector(".login").classList.add("hidden")
  document.querySelector(".index").classList.add("hidden")
  document.querySelector(".project").classList.remove("hidden")

  swipe()

  //-------------project header and Btn------------

  //---- const and variable --- 

  const resProject = await postAPI.get(`./projects/${num}`)
  const projectheaderFrag = document.importNode(templates.projectheader, true)
  const newTaskModal = projectheaderFrag.querySelector(".newTask-modal")

  const newTaskTitle = projectheaderFrag.querySelector('.newTask-modal__title-input')
  const newTaskBegin = projectheaderFrag.querySelector('.newTask-modal__startDate-input')
  const newTaskDue = projectheaderFrag.querySelector('.newTask-modal__dueDate-input')
  const newTaskbody = projectheaderFrag.querySelector('.newTask-modal__body-input')
  const newTaskSubmitBtn = projectheaderFrag.querySelector('.newTask-modal__submit-btn')
  const newTaskCloseBtn = projectheaderFrag.querySelector('.newTask-modal__close-btn') 
  
  
  projectheaderFrag.querySelector(".project__newTask").addEventListener("click", e => {
    newTaskBegin.value = moment().format("YYYY-MM-DD")
    newTaskDue.value = moment().format("YYYY-MM-DD")
    e.preventDefault()
    newTaskModal.classList.add("is-active")
  })

  projectheaderFrag.querySelector(".project__goBack").addEventListener("click", e => {
    e.preventDefault()
    indexPage()})

  projectheaderFrag.querySelector(".project__title").textContent = resProject.data.title

  projectheaderFrag.querySelector(".project__duedate").textContent = "Due date" + moment(resProject.data.dueDate).format('YYYY-MM-DD')

  
  //----new task modaled---
  
  
  newTaskSubmitBtn.addEventListener("click", async e => {
    e.preventDefault()

    const res = await postAPI.post('./tasks', {
      projectId : num,
      title : newTaskTitle.value,
      body : newTaskbody.value,
      orgDate : moment(),
      update : moment(),
      startDate : newTaskBegin,
      dueDate : moment(newTaskDue.value),
      complete : 0,
      userId : userid
      ,indentity : "task"
    })
    
    const resTask = await postAPI.get('./tasks') 

    recentTask = sortLateTask(resTask.data)[0].id
    projectPage(num)
  })
  
  newTaskCloseBtn.addEventListener("click", e => {
    e.preventDefault()
    newTaskModal.classList.remove("is-active")
    })
    
    anchor.projectHeader.appendChild(projectheaderFrag) //append project header!!!
  
  
  //------------------project task --------------------------


  
  const resTaskProject = await postAPI.get('./tasks?_expand=user')
  const resLabel = await postAPI.get('./labels')
  
  
  sortOrgDate(resTaskProject.data).forEach( task => {
    
    if (task.projectId === num) {

      const taskProjectFrag = document.importNode(templates.taskProject, true)

      taskProjectFrag.querySelector(".task-project__content-container").addEventListener("click", e => {

        e.preventDefault()
        recentTask = task.id 
        projectPage(num)
      })
        
        taskProjectFrag.querySelector(".task-project__title").textContent = task.title
        taskProjectFrag.querySelector(".task-project__body").textContent = task.body
        taskProjectFrag.querySelector(".task-project__username").textContent = task.user.username
        taskProjectFrag.querySelector(".task-project__update").textContent = "update " + moment(task.update).format('YYYY-MM-DD')

        


        //------------- op Btn func --------------
        
        const container = taskProjectFrag.querySelector(".task-project__content-container")
        const containerDelete = taskProjectFrag.querySelector(".task-project__delete-btn")
        const opBtn = taskProjectFrag.querySelector(".task-project__option-btn")
        const editBtn = taskProjectFrag.querySelector(".task-project__option-btn-edit")
        const completeBtn = taskProjectFrag.querySelector(".task-project__option-btn-complete")
        const deleteBtn = taskProjectFrag.querySelector(".task-project__option-btn-delete")


        const editModal = taskProjectFrag.querySelector(".projectPage-edit-modal__container")


        opBtn.addEventListener("click", async e=> {
          e.preventDefault();
        })
        
        
        editBtn.addEventListener("click", async e => {
          e.preventDefault();
          editModal.classList.add("is-active")
        }) //need async?
        
        completeBtn.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.patch(`./tasks/${task.id}`, {complete:1
            ,update : moment()
          })
          projectPage(num)                                 
        })      
        
        deleteBtn.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.delete(`./tasks/${task.id}`)
          projectPage(num)
        })

        containerDelete.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.delete(`./tasks/${task.id}`)
          projectPage(num)
        })



        
        //-------------edit modaled-------------------



        const updateModal = taskProjectFrag.querySelector(".edit-modal__update")
        const titleModal = taskProjectFrag.querySelector(".edit-modal__title-input")
        const bodyModal = taskProjectFrag.querySelector(".edit-modal__body-input")
        
        
        taskProjectFrag.querySelector(".edit-modal__username").textContent = task.user.username
        
        updateModal.textContent = "update " + moment(task.update).format('YYYY-MM-DD')
        
        titleModal.value = task.title
        
        bodyModal.value = task.body
        
        taskProjectFrag.querySelector(".edit-modal__close-btn").addEventListener("click", e=> {
          e.preventDefault();
          editModal.classList.remove("is-active")
        })


        taskProjectFrag.querySelector('.edit-modal__submit-btn').addEventListener("click", async e=> {
          e.preventDefault();

          const res = await postAPI.patch(`./tasks/${task.id}`,
          { title: titleModal.value,
          body : bodyModal.value,
          update : moment()       
          })

          editModal.classList.remove("is-active")
        
          projectPage(num)
        })


        completationProject (task, taskProjectFrag)
        render(anchor.projectTask, taskProjectFrag)
      }
    })

  //-----------------project comment-------------------


  //---project comment input
  const commentFrag = document.importNode(templates.comment, true)

  if(recentTask === 0){
    commentFrag.querySelector(".comment__submit-btn").classList.add('hidden')
  } else {
    commentFrag.querySelector(".comment__submit-btn").classList.remove('hidden')
  }

  commentFrag.querySelector(".comment__form").addEventListener("submit", async e=> {

    e.preventDefault()

    if(e.target.elements.body.value) {
      const res = await postAPI.post("./comments", {
        userId : userid,
        taskId : recentTask,
        body : e.target.elements.body.value,
        orgDate : moment()
        ,identity : "comment"
      })
      projectPage(num)
    }
  })
  anchor.projectComment.appendChild(commentFrag)
  

  
  //---project comment content list
  const resCommentContent = await postAPI.get('./comments?_expand=user')
   sortOrgDate(resCommentContent.data).forEach( comment => {

    if (comment.taskId === recentTask) {        
     const commentContentFrag = document.importNode(templates.commentContent, true)

     commentContentFrag.querySelector(".comment-content__body").textContent = comment.body
     commentContentFrag.querySelector(".comment-content__username").textContent = comment.user.username
     commentContentFrag.querySelector(".comment-content__originDate").textContent = "record date " + moment(comment.orgDate).format('YYYY-MM-DD')

     anchor.projectComment.appendChild(commentContentFrag)
    }
  })

}

if(localStorage.getItem('token')){
  indexPage()
} else {
  loginPage()
}
// indexPage()
// projectPage(2)


