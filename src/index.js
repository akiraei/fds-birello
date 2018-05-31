import './index.scss';
import axios from 'axios';



//--------------------------variable--------------------------
//--------------------------variable--------------------------
//--------------------------variable--------------------------


let recentTask = 0;

const postAPI = axios.create({
  baseURL: process.env.API_URL
})


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
  footer : document.querySelector('#footer').content,
  radio : document.querySelector('#newTask-modal__labelList').content,
  radio__edit : document.querySelector('#edit-modal__labelList').content
  
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

function labelFilter(data, labelNum){
  if(labelNum === 0){
    return data
  }else{
    let arr = {data:[]}
    data.data.forEach( el => {
    if(parseInt(el.label) === labelNum){
      arr.data.push(el)
    }
  })
  return arr
}
}

function completationProject (task, fragment) {
  if (task.complete === 1) {
    fragment.querySelector(".task-project__content").classList.add('covering')
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
      return ""
    } else if (res){
    localStorage.setItem('token', res.data.token)
    token = localStorage.getItem('token')
    postAPI.defaults.headers['Authorization'] = `Bearer ${token}`
    indexPage()
    return ""
    }
  }
  
  function logout(){
    delete postAPI.defaults.headers['Authorization']
    localStorage.removeItem('token')
    loginPage()
  }

function swipe() {
  let arr = document.querySelectorAll(".anchor")
  arr.forEach( e => {
    e.textContent = ""
  })
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

  //login form 
  const form = fragment.querySelector('.login__form')
  form.addEventListener("submit", async e => {
    e.preventDefault()
    
    const res = await postAPI.post('./users/login', {
      username : e.target.elements.id.value,
      password: e.target.elements.pw.value
    }).catch(e =>{
      alert("invalid ID or PASSWORD")
    })
    
    e.target.elements.pw.value = ""
    login(res)
  })



  // sign up modal
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

  const signupForm = fragment.querySelector('.login-signup-modal__form')
  signupForm.addEventListener('submit', async e => {
    e.preventDefault()
    
    let id = e.target.elements.id.value
    let pw = e.target.elements.pw.value
    let rePw = e.target.elements.rePw.value
    
    let doubleId = 0;
    const resBefore = await postAPI.get('./users')
    resBefore.data.forEach( e => {
      if(e.username === id){
        doubleId++
      }
    })
    
    if(pw === rePw) {
      if(doubleId > 0) {
        alert("아이디가 이미 존재합니다.")

      } else {
        const res = await postAPI.post('./users/register', {
          username : id,
          password : pw,
          identity : "user"
        })
        const tempUserId = (await postAPI.get('./users')).data.filter( e => {
          return e.username === id
        })[0].id
        const resLogin = await postAPI.post('./users/login', {
          username : id,
          password: pw
        })
        const resInitCard = await postAPI.post('./projects', {
          "title": "Welcome birello!",
          "startDate": moment(),
          "dueDate": moment(),
          "orgDate": moment(),
          "update": moment(),
          "identity": "project",
          "userId": tempUserId,
          "complete": 0
        })
  
        id = ""
        pw = ""
        rePw = ""
        login(resLogin)
      }     
    } else {
      alert("please check again password input")
    }
  })

  document.querySelector('.login__anchor').appendChild(fragment)
}


//------------------- index  page--------------------------
//------------------- index  page--------------------------

async function indexPage() {

  const recentUserId = (await postAPI.get('./me')).data.id
  const recentUserName = (await postAPI.get('./users')).data.filter( e => {return parseInt(e.id) === parseInt(recentUserId)})[0].username
  const recentUser =  {data: {
    id: recentUserId,
    username: recentUserName
  }}

  document.querySelector(".login").classList.add("hidden")
  document.querySelector(".index").classList.remove("hidden")
  document.querySelector(".project").classList.add("hidden")

  swipe() 

   //-------------------header--------------------------------
  const headerFrag = document.importNode(templates.header, true)

        headerFrag.querySelector(".header__logout-btn").addEventListener("click", e => {
          logout()
        })

        //new card box modal

        const newCardboxModal = headerFrag.querySelector(".newCardbox-modal")
        const newCardboxModalBtn = headerFrag.querySelector(".header__newCardbox-btn")
        const newCardboxModalCloseBtn = headerFrag.querySelector(".header__newCardbox-close-btn")
        const newCardboxModalTitle = headerFrag.querySelector(".newCardbox-modal__title-input")
        const newCardboxModalBegin = headerFrag.querySelector(".newCardbox-modal__startDate-input")
        const newcardboxModalDue = headerFrag.querySelector(".newCardbox-modal__dueDate-input")
        const newcardboxSubmitBtn = headerFrag.querySelector(".newCardbox-modal__submit-btn")
        const newCardboxModalForm= headerFrag.querySelector(".newCardbox-modal__form")
        
        
        newCardboxModalBtn.addEventListener("click", e => {
          e.preventDefault()    
          newCardboxModalBegin.value = moment().format("YYYY-MM-DD")
          newcardboxModalDue.value = moment().format("YYYY-MM-DD")
          newCardboxModal.classList.add("is-active")
        })
        
        newCardboxModalCloseBtn.addEventListener("click", e => {
          e.preventDefault()
          newCardboxModal.classList.remove("is-active")
        })
        
        newCardboxModalForm.addEventListener('submit', async e=> {
          e.preventDefault() 

          if(
            parseInt(moment(e.target.elements.begin.value).format('x'))
             > parseInt(moment(e.target.elements.due.value).format('x'))
          ){
            alert("Please set Dates correctly")
          } else {
            const res = await postAPI.post('./projects', {
              title : e.target.elements.title.value,
              startDate : moment(e.target.elements.begin.value),
              dueDate : moment(e.target.elements.due.value),
              orgDate : moment(),
              update : moment(),
              userId : recentUser.data.id
              ,identity : "project"
            })
            indexPage()
          }
          

        })
        
        //privacy modal
        const privacyModalBtn = headerFrag.querySelector(".header__privacy-btn")
        const privacyModal = headerFrag.querySelector(".privacy-modal")
        const privacyModalForm = headerFrag.querySelector(".privacy-modal__form")
        const privacyModalUsername = headerFrag.querySelector(".privacy-modal__username") 
        const privacyModalDeleteBtn = headerFrag.querySelector(".privacy-modal__delete-account")
        const privacyModalCloseBtn = headerFrag.querySelector(".pravacy-modal__close-btn")

        privacyModalUsername.textContent = recentUser.data.username

        privacyModalBtn.addEventListener("click", e=> {
          e.preventDefault()
          privacyModal.classList.add('is-active')
        })

        privacyModalCloseBtn.addEventListener("click", e=> {
          e.preventDefault()
          privacyModalUsername.textContent =""
          privacyModal.classList.remove('is-active')
        })

        privacyModalDeleteBtn.addEventListener("click", async e=> {
          const resPrivacyDelete = await postAPI.delete(`./users/${recentUser.data.id}`)
          localStorage.remove('token')
          logout()
        })

        privacyModalForm.addEventListener("submit", async e=> {
          e.preventDefault()

          const resPrivacyGet = await postAPI.post('./users/login', {
            username : privacyModalUsername.textContent,
            password : e.target.elements.pw.value
          }).catch( e => {alert("Wrong Password")})

          const samePw = e.target.elements.pw.value === e.target.elements.newPw.value
          
          if(resPrivacyGet.data && !samePw){
            const resPrivacyPatch = postAPI.patch(`./users/${recentUser.data.id}`, {
              username : privacyModalUsername.textContent,
              password : e.target.elements.newPw.value
            })
            indexPage()
          } else {
            alert("Same Password")
          }
        })

  document.querySelector('.index__anchor-header').appendChild(headerFrag)
  
  //----------------------index content ------------------
  
  
  const contentFrag = document.importNode(templates.content, true)

  //....body.....

  const contentBodyAnchor = contentFrag.querySelector(".content__body-anchor")
  
  const resCardbox = await postAPI.get('./projects')
  const resTaskIndex = await postAPI.get('./tasks')

  sortComplete(sortDate(resCardbox.data)).forEach( async cardbox => {
    
    if(parseInt(cardbox.userId) === parseInt(recentUser.data.id)){
      
      const cardboxFrag = document.importNode(templates.cardbox, true)

    const cardboxAnchor = cardboxFrag.querySelector(".cardbox__anchor")

    cardboxFrag.querySelector(".cardbox__title").textContent = cardbox.title 
    cardboxFrag.querySelector(".cardbox__update").textContent = "update " + moment(cardbox.update).format('YYYY-MM-DD')
    cardboxFrag.querySelector(".cardbox__dueDate").textContent = "due date " + moment(cardbox.dueDate).format('YYYY-MM-DD')

    cardboxFrag.querySelector(".cardbox__title").addEventListener("click", e => {
      e.preventDefault()

      //----///----- I Hate REST API ------///-----///
      // const processedArr = resTaskIndex.data.filter( e => {
      //   let k = e.projectId === cardbox.id
      //   return k
      // })
      // if(processedArr.length > 0){
      //   recentTask = processedArr[0].id
      // } else { recentTask = 0}
      //----///----- I Hate REST API ---///-------///

      projectPage(cardbox.id, 0)
    })

    // --- cardbox btn and cardbox edit modal---

    const cardboxEditRes = await postAPI.get(`./projects/${cardbox.id}`)

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
      const res = await postAPI.patch(`./projects/${cardbox.id}`,{
        complete : 1,
        update : moment()
      })
      indexPage()
    })

    cardboxBtnDelete.addEventListener("click", async e => {
      e.preventDefault()
      const res = await postAPI.delete(`./projects/${cardbox.id}`)
      indexPage()
    })
    
    
    //cardbox edit modal
    
    const cardboxEditForm = cardboxFrag.querySelector(".cardbox-edit-modal__form")
    const cardboxEditClose = cardboxFrag.querySelector(".cardbox-edit-modal__close-btn") 
     
    cardboxEditForm.addEventListener("submit", async e => {
      e.preventDefault()
      if(
        parseInt(moment(e.target.elements.startDate.value).format('x'))
         > parseInt(moment(e.target.elements.dueDate.value).format('x'))
      ){
        alert("Please set Dates correctly")
      } else {
      const res = await postAPI.patch(`./projects/${cardbox.id}`, {
        title : e.target.elements.title.value
        ,startDate : moment(e.target.elements.startDate.value)
        ,dueDate :moment(e.target.elements.dueDate.value)
        ,update : moment()
      })
      indexPage()
    }
    })

    cardboxEditClose.addEventListener("click", e => {
      e.preventDefault()
      cardboxEditModal.classList.remove("is-active")
    })


    // card box task only 3 

    let i = 0;
    sortOrgDate(resTaskIndex.data).forEach( taskIndex => {
      if(taskIndex.projectId === cardbox.id && i < 3) {

        const taskIndexFrag = document.importNode(templates.taskIndex, true)
        
        taskIndexFrag.querySelector(".task-index__title").textContent = taskIndex.title
        taskIndexFrag.querySelector(".task-index__update").textContent = "update: " + moment(taskIndex.update).format("YYYY-MM-DD")

        taskIndexFrag.querySelector(".task-index__content").addEventListener("click", e => {
          e.preventDefault()
          projectPage(cardbox.id, taskIndex.id)
        })

        cardboxAnchor.appendChild(taskIndexFrag)    
        i++
      }
    })
    completationIndex(cardbox, cardboxFrag)
    contentBodyAnchor.appendChild(cardboxFrag)
  }
  })

  document.querySelector('.index__anchor-content').appendChild(contentFrag)
}





 //------------------- project  page-----------------------
 //------------------- project  page-----------------------


async function projectPage(num, labelNum) {

  const recentUser =  await postAPI.get('./me')

  document.querySelector(".login").classList.add("hidden")
  document.querySelector(".index").classList.add("hidden")
  document.querySelector(".project").classList.remove("hidden")

  swipe()

  //-------------project header and Btn------------


  // new task modal setting

  const resLabel = await postAPI.get('./labels')
  const resProject = await postAPI.get(`./projects/${num}`)

  const projectheaderFrag = document.importNode(templates.projectheader, true)
  const newTaskModal = projectheaderFrag.querySelector(".newTask-modal")
  const newTaskTitle = projectheaderFrag.querySelector('.newTask-modal__title-input')
  const newTaskBegin = projectheaderFrag.querySelector('.newTask-modal__startDate-input')
  const newTaskDue = projectheaderFrag.querySelector('.newTask-modal__dueDate-input')
  const newTaskbody = projectheaderFrag.querySelector('.newTask-modal__body-input')
  const newTaskForm = projectheaderFrag.querySelector('.newTask-modal__form')
  const newTaskCloseBtn = projectheaderFrag.querySelector('.newTask-modal__close-btn') 
  
  
  projectheaderFrag.querySelector(".project__newTask").addEventListener("click", e => {
    e.preventDefault()
    newTaskBegin.value = moment().format("YYYY-MM-DD")
    newTaskDue.value = moment().format("YYYY-MM-DD")
    newTaskModal.classList.add("is-active")
  })

  projectheaderFrag.querySelector(".project__goBack").addEventListener("click", e => {
    e.preventDefault()
    indexPage()})

  projectheaderFrag.querySelector(".project__title").textContent = resProject.data.title

  projectheaderFrag.querySelector(".project__duedate").textContent = "Due date" + moment(resProject.data.dueDate).format('YYYY-MM-DD')



  // new task modal -- radio template

  const newTaskRadioAnchor = projectheaderFrag.querySelector('.newTask-modal__radio-anchor')
  resLabel.data.forEach( e => {
    if(e.projectId === num) {
      const labelRadioFrag = document.importNode(templates.radio, true)
      labelRadioFrag.querySelector('.newTask-modal__labelList-radio').value = e.id
      labelRadioFrag.querySelector('.newTask-modal__labelList-title').textContent = e.title
      newTaskRadioAnchor.appendChild(labelRadioFrag)
    }
  })
    
  newTaskForm.addEventListener("submit", async e => {
  e.preventDefault()

  let tempLabelId;
  if(e.target.elements.radio){
    tempLabelId = e.target.elements.radio.value
  } else {
    tempLabelId = 0;
  }

  if(
    parseInt(moment(e.target.elements.begin.value).format('x'))
     > parseInt(moment(e.target.elements.due.value).format('x'))
  ){
    alert("Please set Dates correctly")
  } else {

    const res = await postAPI.post('./tasks', {
      projectId : num,
      title : e.target.elements.title.value,
      body : e.target.elements.body.value,
      orgDate : moment(),
      update : moment(),
      startDate : moment(e.target.elements.begin.value),
      dueDate : moment(e.target.elements.due.value,),
      complete : 0,
      userId : recentUser.data.id
      ,indentity : "task"
      ,label : tempLabelId
    })

    const resProjectUpdate = await postAPI.patch(`./projects/${num}`, {
      update: moment()
    })

    const resTaskWhole = await postAPI.get('./tasks') 
    const resTask = labelFilter(resTaskWhole, labelNum)
    recentTask = sortLateTask(resTask.data)[0].id

    projectPage(num, labelNum)
  }
  })
  
  newTaskCloseBtn.addEventListener("click", e => {
    e.preventDefault()
    newTaskModal.classList.remove("is-active")
    })


  // project header for label

    // new label modal
    const labelPlus = projectheaderFrag.querySelector(".project__header-label-plus")
    const newLabelModal = projectheaderFrag.querySelector(".newLabel-modal")
    const newLabelForm = projectheaderFrag.querySelector(".newLabel-modal__form")
    const newLabelClose = projectheaderFrag.querySelector(".newLabel-modal__close-btn")
    const labelWhole = projectheaderFrag.querySelector(".project__header-label-whole")
  
   labelPlus.addEventListener('click', e => {
      e.preventDefault()
      newLabelModal.classList.add("is-active")
    })

    labelWhole.addEventListener('click', e=> {
      e.preventDefault()
      projectPage(num, 0)
    })
  
    newLabelClose.addEventListener('click', e => {
      e.preventDefault()
      newLabelModal.classList.remove("is-active")
    })
  
    newLabelForm.addEventListener("submit", async e => {
      e.preventDefault()

      const res = await postAPI.post('./labels',{
        userId : recentUser.data.id,
        projectId : num,
        title : e.target.elements.title.value,
        identity : "label"
      })
      
      const resProjectUpdate = await postAPI.patch(`./projects/${num}`, {
        update: moment()
      })

      projectPage(num, labelNum)
    })


  const projectLabelAnchor = projectheaderFrag.querySelector(".project__header-label-anchor")
 
  resLabel.data.forEach( label => {
    if (parseInt(recentUser.data.id) === parseInt(label.userId) && parseInt(num) === parseInt(label.projectId)) {

      const labelFrag = document.importNode(templates.label, true)
      const labelContent = labelFrag.querySelector(".label__content")
      const labelDelete = labelFrag.querySelector(".label__delete-btn")

      labelContent.textContent = label.title
      labelContent.addEventListener("click", async e => {
        e.preventDefault()
        projectPage(num, label.id)
      })
      labelDelete.addEventListener("click", async e => {
        e.preventDefault()
        const res = await postAPI.delete(`./labels/${label.id}`)
        projectPage(num, 0)
      })
      projectLabelAnchor.appendChild(labelFrag)
    }
    
  })

  document.querySelector('.project__anchor-header').appendChild(projectheaderFrag) 
  
    //------------------project task --------------------------

  const resTaskProjectWhole = await postAPI.get('./tasks?_expand=user')
  let resTaskProject = labelFilter(resTaskProjectWhole, labelNum)
  
  sortOrgDate(resTaskProject.data).forEach( task => {
    
    if (task.projectId === num) {

      const taskProjectFrag = document.importNode(templates.taskProject, true)

      taskProjectFrag.querySelector(".task-project__content-container").addEventListener("click", e => {
        e.preventDefault()
        recentTask = task.id 
        projectPage(num, labelNum)
      })
        
        taskProjectFrag.querySelector(".task-project__title").textContent = task.title
        taskProjectFrag.querySelector(".task-project__body").textContent = task.body
        taskProjectFrag.querySelector(".task-project__username").textContent = task.user.username
        taskProjectFrag.querySelector(".task-project__due").textContent = "Due " + moment(task.dueDate).format("YYYY-MM-DD")
        taskProjectFrag.querySelector(".task-project__begin").textContent = "Begin " + moment(task.startDate).format("YYYY-MM-DD")
        taskProjectFrag.querySelector(".task-project__update").textContent = "update " + moment(task.update).format('YYYY-MM-DD')
        taskProjectFrag.querySelector(".task-project__label").textContent = 
        resLabel.data.filter( e => {
          return parseInt(e.id) === parseInt(task.label)
        })[0] 
        ? resLabel.data.filter( e => {
          return parseInt(e.id) === parseInt(task.label)
        })[0].title 
        : ""

        //------------- op Btn func --------------
        
        const container = taskProjectFrag.querySelector(".task-project__content-container")
        const containerDelete = taskProjectFrag.querySelector(".task-project__delete-btn")
        const opBtn = taskProjectFrag.querySelector(".task-project__option-btn")
        const editBtn = taskProjectFrag.querySelector(".task-project__option-btn-edit")
        const completeBtn = taskProjectFrag.querySelector(".task-project__option-btn-complete")
        const deleteBtn = taskProjectFrag.querySelector(".task-project__option-btn-delete")
        const editModal = taskProjectFrag.querySelector(".projectPage-edit-modal__container")

        editBtn.addEventListener("click", e => {
          e.preventDefault();
          editModal.classList.add("is-active")
        }) 
        
        completeBtn.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.patch(`./tasks/${task.id}`, {complete:1
            ,update : moment()
          })
          projectPage(num, labelNum)                                 
        })      
        
        deleteBtn.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.delete(`./tasks/${task.id}`)
          projectPage(num, labelNum)
        })

        containerDelete.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.delete(`./tasks/${task.id}`)
          projectPage(num, labelNum)
        })
        
        // edit modaled

        const updateModal = taskProjectFrag.querySelector(".edit-modal__update")
        const titleModal = taskProjectFrag.querySelector(".edit-modal__title-input")
        const bodyModal = taskProjectFrag.querySelector(".edit-modal__body-input")
        const begin = taskProjectFrag.querySelector(".edit-modal__begin-input")
        const due = taskProjectFrag.querySelector(".edit-modal__due-input")
        const taskEditModalForm = taskProjectFrag.querySelector(".edit-modal__form")  
        
        taskProjectFrag.querySelector(".edit-modal__username").textContent = task.user.username
        updateModal.textContent = "update " + moment(task.update).format('YYYY-MM-DD')
        titleModal.value = task.title
        bodyModal.value = task.body
        begin.value = moment(task.startDate).format("YYYY-MM-DD")
        due.value = moment(task.dueDate).format("YYYY-MM-DD")
       
        taskProjectFrag.querySelector(".edit-modal__close-btn").addEventListener("click", e=> {
          e.preventDefault();
          editModal.classList.remove("is-active")
        })


        // edit modal label list
        const editRadioAnchor =  taskProjectFrag.querySelector(".edit-modal__radio-anchor")

        resLabel.data.forEach( e => {
          if(e.projectId === num) {
            const labelRadioFrag = document.importNode(templates.radio__edit, true)
            const labelTitle = labelRadioFrag.querySelector('.edit-modal__labelList-title')
            const labelRadio = labelRadioFrag.querySelector('.edit-modal__labelList-radio')
            labelTitle.textContent = e.title
            labelRadio.value = e.id

            if(parseInt(e.id) === parseInt(task.label)){
              labelRadio.setAttribute("checked", "")
            }
            
            editRadioAnchor.appendChild(labelRadioFrag)
          }
        })



        taskEditModalForm.addEventListener("submit", async e=> {
          e.preventDefault();

          let tempLabelId;
          if(e.target.elements.radio){
            tempLabelId = e.target.elements.radio.value
          } else {
            tempLabelId = 0;
          }

          if(
            parseInt(moment(e.target.elements.begin.value).format('x'))
             > parseInt(moment(e.target.elements.due.value).format('x'))
          ){
            alert("Please set Dates correctly")
          } else {

          const res = await postAPI.patch(`./tasks/${task.id}`,
          { title: e.target.elements.title.value,
          body : e.target.elements.body.value,
          update : moment(),
          dueDate : moment(e.target.elements.due.value),
          startDate : moment(e.target.elements.begin.value),
          label : tempLabelId
          })

          editModal.classList.remove("is-active")
          projectPage(num, labelNum)
        }
        })

        completationProject (task, taskProjectFrag)
        document.querySelector('.project__anchor-task').appendChild(taskProjectFrag)
      }
    })

  //-----------------project comment-------------------


  // project comment input
  const commentFrag = document.importNode(templates.comment, true)
  const commentForm = commentFrag.querySelector(".comment__form")

  if(recentTask === 0){
    commentFrag.querySelector(".comment__submit-btn").classList.add('hidden')
  } else {
    commentFrag.querySelector(".comment__submit-btn").classList.remove('hidden')
  }

  commentForm.addEventListener("submit", async e=> {
    e.preventDefault()

    if(e.target.elements.body.value) {
      const res = await postAPI.post("./comments", {
        userId : recentUser.data.id,
        taskId : recentTask,
        body : e.target.elements.body.value,
        orgDate : moment()
        ,identity : "comment"
      })
      projectPage(num, labelNum)
    }

    const resProjectUpdate = await postAPI.patch(`./projects/${num}`, {
      update: moment()
    })

  })
  document.querySelector('.project__anchor-comment').appendChild(commentFrag)
  
  // project comment content list
  const resCommentContent = await postAPI.get('./comments?_expand=user')
   sortOrgDate(resCommentContent.data).forEach( comment => {

    if (comment.taskId === recentTask) {        
     const commentContentFrag = document.importNode(templates.commentContent, true)

     commentContentFrag.querySelector(".comment-content__body").textContent = comment.body
     commentContentFrag.querySelector(".comment-content__username").textContent = comment.user.username
     commentContentFrag.querySelector(".comment-content__originDate").textContent = "record date " + moment(comment.orgDate).format('YYYY-MM-DD')
     commentContentFrag.querySelector(".comment-content__delete-btn").addEventListener('click', async e => {
       e.preventDefault()
       const res = await postAPI.delete(`./comments/${comment.id}`)
       projectPage(num, labelNum)
     })

     document.querySelector('.project__anchor-comment').appendChild(commentContentFrag)
    }
  })

}

if(localStorage.getItem('token')){
  login()
} else {
  loginPage()
}


