import './index.scss';
import axios from 'axios';



//--------------------------variable--------------------------
//--------------------------variable--------------------------
//--------------------------variable--------------------------


const recentTask;


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
  taskIndex : document.querySelector('#task-index').content,
  projectheader : document.querySelector('#project__header').content,
  taskProject : document.querySelector('#task-project').content,
  comment : document.querySelector('#comment').content,
  commentContent : document.querySelector('#comment-content').content,
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



function sortOrgDate (arr) {
  let value =  arr.sort( function (a,b) {
    let k = b.orgDate - a.orgDate
    return k
  })
  return value
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
  console.log("render")
}

//----------------template section-----------------------------
//----------------template section-----------------------------
//----------------template section-----------------------------





//------------------- login  page--------------------------
//------------------- login  page--------------------------


async function loginPage() {

  swipe()

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

  render(anchor.login, fragment)
}


//------------------- index  page--------------------------
//------------------- index  page--------------------------

async function indexPage() {

  swipe() 

   //-------------------header--------------------------------
  const headerFrag = document.importNode(templates.header, true)

        //logOut Btn, New Project setting needed
  

  
  //----------------------content ---------------------------
  
  
  const contentFrag = document.importNode(templates.content, true)


  // .....................label......................
 
 
  const contentHeaderAnchor = contentFrag.querySelector(".content__header-anchor")

  const userid = 1

  const resLabel = await postAPI.get('./labels')

  resLabel.data.forEach( async label => {

    if (userid === label.userId) {

      const labelFrag = document.importNode(templates.label, true)

      const labelContent = labelFrag.querySelector(".label__content")

      labelContent.textContent = label.title

      contentHeaderAnchor.appendChild(labelContent)
    }
    
  })
  


  //................body...................
 
  const contentBodyAnchor = contentFrag.querySelector(".content__body-anchor")

  const resCardbox = await postAPI.get('./projects')
  const resTaskIndex = await postAPI.get('./tasks')

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



  render(anchor.indexHeader, headerFrag)
  render(anchor.indexContent, contentFrag)
 }





 //------------------- project  page-----------------------
 //------------------- project  page-----------------------


async function projectPage(num) {
    
  swipe()

  //---------------------project header----------------
  
  
  const resProject = await postAPI.get(`./projects/${num}`)
  
  const projectheaderFrag = document.importNode(templates.projectheader, true)
  
  // projectheaderFrag.querySelector(".project__newTask").addEventListener("click", e => {})

  projectheaderFrag.querySelector(".project__goBack").addEventListener("click", indexPage())

  projectheaderFrag.querySelector(".project__title").textContent = resProject.data.title

  projectheaderFrag.querySelector(".project__duedate").textContent = "Due date" + resProject.data.dueDate
  
  
  
  //------------------project task --------------------------


  
  const resTaskProject = await postAPI.get('./tasks?_expand=user')

  // recentTask = sortOrgDate(resTaskProject.data)[0].id
  
  sortOrgDate(resTaskProject.data).forEach( task => {
    
    if (task.projectId === num) {

      const taskProjectFrag = document.importNode(templates.taskProject, true)

      taskProjectFrag.querySelector(".task-project__content").addEventListener("click", e => {
        recentTask = task.id
        projectPage(num)
      })
        
        taskProjectFrag.querySelector(".task-project__title").textContent = task.title
        taskProjectFrag.querySelector(".task-project__body").textContent = task.body
        taskProjectFrag.querySelector(".task-project__username").textContent = task.user.username
        taskProjectFrag.querySelector(".task-project__update").textContent = task.update
        
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
        }) //need async?
        
        completeBtn.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.patch(`./tasks/${task.id}`, {complete:1})
          projectPage(num)                                 
        })      
        
        deleteBtn.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.delete(`./tasks/${task.id}`)
          projectPage(num)
        })
        
        
        //-------------modal---------------------------
        
        
        taskProjectFrag.querySelector(".edit-modal__username").textContent = task.user.username
        
        taskProjectFrag.querySelector(".edit-modal__update").textContent = task.update
        
        taskProjectFrag.querySelector(".edit-modal__title-input").value = task.title
        
        taskProjectFrag.querySelector(".edit-modal__body-input").value = task.body
        
        taskProjectFrag.querySelector(".edit-modal__delete").addEventListener("click", e=> {
          e.preventDefault();
          editModal.classList.remove("is-active")


        render(anchor.projectTask, taskProjectFrag)
        })
      }
    }

  //-----------------project comment-------------------


  //---project comment input
  const commentFrag = document.importNode(templates.comment, true)

  commentFrag.querySelector(".comment__form").addEventListener("submit", async e=> {
    const res = await postAPI.post("./comment", {
      userId : userid,
      taskId : recentTask,
      body : e.target.elements.body.value
    })
    anchor.projectComment.appendChild(commentFrag)
    projectPage(num)
  })


  
  //---project comment list
  const resCommentContent = await postAPI.get('./comments?_expand=user')
   sortOrgDate(resCommentContent.data).forEach( comment => {
    if (comment.taskId === recentTask) {        
     const commentContentFrag = document.importNode(templates.commentContent, true)

     commentContentFrag.querySelector(".comment-content__body").textContent = comment.body
     commentContentFrag.querySelector(".comment-content__username").textContent = comment.user.username
     commentContentFrag.querySelector(".comment-content__originDate").textContent = comment.orgDate

     anchor.projectComment.appendChild(commentFrag)
    }
  })




  console.log("project comment2")


  // commentAttach(recentTask)





        
        
        
        
        projectpageAnchorTask.appendChild(taskProjectFrag)












     
      if(task.complete === 0) {
        
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
        const editModal = taskProjectFrag.querySelector(".projectPage-edit-modal__container")
        
        
        
        
        editBtn.addEventListener("click", async e => {
          e.preventDefault();
          editModal.classList.add("is-active")
        })
        
        completeBtn.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.patch(`./tasks/${task.id}`, {complete:1})
          projectPage(num)               
        })
        
        
        deleteBtn.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.delete(`./tasks/${task.id}`)
          projectPage(num)
        })
        
        
        //-------------modal---------------------------
        
        
        taskProjectFrag.querySelector(".edit-modal__username").textContent = task.user.username
        
        taskProjectFrag.querySelector(".edit-modal__update").textContent = task.update
        
        taskProjectFrag.querySelector(".edit-modal__title-input").value = task.title
        
        taskProjectFrag.querySelector(".edit-modal__body-input").value = task.body
        
        taskProjectFrag.querySelector(".edit-modal__delete").addEventListener("click", e=> {
          e.preventDefault();
          editModal.classList.remove("is-active")
        })




















          //-------------------project comment ----------------------
  console.log("project comment")

  async function  commentAttach (taskNum) {

    const resComment = await postAPI.get('./comments?_expand=user')
  
    sortOrgDate(resComment.data).forEach( comment => {
      if (comment.taskId === taskNum) {
        
        const commentFrag = document.importNode(templates.comment, true)
        
        commentFrag.querySelector(".comment__username").textContent = comment.user.username      
        commentFrag.querySelector(".comment__content").textContent = comment.body
        commentFrag.querySelector(".comment__originDate").textContent = comment.orgDate
        
        
        projectpageAnchorComment.appendChild(commentFrag)
      }
      projectPage(num)
    })

  }

  console.log("project comment2")


  // commentAttach(recentTask)

  taskProjectFrag.querySelector(".task-project__content").addEventListener("click", e => {
    recentTask = task.id
    commentAttach(task.id)
  })










        



        
        
        
        
        projectpageAnchorTask.appendChild(taskProjectFrag)
        
        

      } else {
        
        
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
        
        
        opBtn.classList.add("hidden")
        containerDelete.classList.remove("hidden")
        container.classList.add("covering")
        
        containerDelete.addEventListener("click", async e => {
          e.preventDefault();
          const res = await postAPI.delete(`./tasks/${task.id}`)
          projectPage(num)
          
        })
        





        
        projectpageAnchorTask.appendChild(taskProjectFrag)
        
        
      }
      


      //--------------comment submit-----------------------
    
      const commentForm = projectpageFrag.querySelector('.comment__from')
      commentForm.addEventListener("submit", async e => {
        e.preventDefault();
        console.log(e.target.elements)
        const res = await postAPI.post('./comments', {
          userId: task.userId,
          taskId: recentTask,
          body : e.target.elements.body.value,
          orgDate: 0
        })
        e.target.elements.body.value = ''
        render(projectpageFrag)
     })
      
    }
    
    
    
    
  }) //forEach task end
  
  

  render(projectpageFrag)
  }






//----------------  task edit-modal  -----------------
//----------------  task edit-modal  -----------------




















//--------------------action----------------------
//--------------------action----------------------
//--------------------action----------------------


// loginPage()
// indexPage()
projectPage(1)




// document.querySelector('h1').addEventListener('click', e => {
//   alert('Hello World!');
// });
