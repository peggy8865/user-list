const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const PER_PAGE = 30

const userPanel = document.querySelector('#user-panel')
const userPaginator = document.querySelector('#user-paginator')
const favoriteList = JSON.parse(localStorage.getItem('favoriteUsers')) || []

// 函式
function renderUserPanel(data) {
  let rawHTML = ''
  data.forEach(item => {
    rawHTML += `
    <div class="col">
      <div class="card border-0 m-4 bg-transparent" style="width: 8rem;">
        <div class="grow" type="button" data-bs-toggle="modal" data-bs-target="#user-modal">
          <img src="${item.avatar}" alt="user-image" class="card-img-top user-image click-more" data-id="${item.id}">
          <p class="card-text user-name click-more" data-id="${item.id}">${item.name} ${item.surname}</p>
        </div>
        <div class="mt-1">
          <i class="fa-regular fa-circle-xmark click-unlike" data-id="${item.id}"></i>
        </div>
      </div>
    </div>`
  })
  userPanel.innerHTML = rawHTML
}

function showUserModal(id) {
  const modalImage = document.querySelector('#user-modal-image')
  const modalName = document.querySelector('#user-modal-name')
  const modalDescription = document.querySelector('#user-modal-description')

  // 清除前一個 user 的殘影
  modalImage.src = ''
  modalName.textContent = ''
  modalDescription.innerHTML = ''

  axios.get(INDEX_URL + id).then(response => {
    const data = response.data
    modalImage.src = data.avatar
    modalName.textContent = data.name + ' ' + data.surname
    modalDescription.innerHTML = `
      Region : ${data.region} <br>
      Age : ${data.age} <br>
      Birthday : ${data.birthday} <br>
      Email : ${data.email}`
  })
    .catch(err => console.log(err))
}

function removeFromFavorite(id) {
  // 如果收藏清單為 null 或 []，則終止函式
  if (!favoriteList || !favoriteList.length) return

  const removeIndex = favoriteList.findIndex(user => user.id === id)
  // 如果收藏清單沒有該電影，則終止函式
  if (removeIndex === -1) return
  const pageOfRemoveIndex = Math.floor(removeIndex / PER_PAGE) + 1

  favoriteList.splice(removeIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteList))
  renderUserPanel(getUsersByPages(pageOfRemoveIndex))
}

function renderPaginator(data) {
  const numberOfPages = Math.ceil(data.length / PER_PAGE)
  let rawHTML = ''
  for (page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="link-dark m-3" href="#" data-page="${page}">${page}</a></li>`
  }
  userPaginator.innerHTML = rawHTML
}

function getUsersByPages(page) {
  const startIndex = (page - 1) * PER_PAGE
  return favoriteList.slice(startIndex, startIndex + PER_PAGE)
}

// 設置監聽器
userPanel.addEventListener('click', event => {
  const target = event.target
  const id = Number(target.dataset.id)
  if (!id) return

  if (target.matches('.click-more')) {
    showUserModal(id)
  } else if (target.matches('.click-unlike')) {
    removeFromFavorite(id)
  }
})

userPaginator.addEventListener('click', event => {
  if (event.target.tagName === 'A') {
    const page = Number(event.target.dataset.page)
    
    // 如果點擊的分頁沒有對應資料，則重新渲染分頁列
    if (!getUsersByPages(page).length) {
      renderPaginator(favoriteList)
    }
    renderUserPanel(getUsersByPages(page))
  }
})

// 渲染 user panel 和分頁列
renderUserPanel(getUsersByPages(1))
renderPaginator(favoriteList)