const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const PER_PAGE = 30

const userPanel = document.querySelector('#user-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const userPaginator = document.querySelector('#user-paginator')
const users = []
let filteredUsers = []
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
        <div class="mt-1">`

    // 如果已在收藏清單，則顯示 "V"，否則顯示 "+"
    if (favoriteList.some(user => user.id === item.id)) {
      rawHTML += `
          <i class="fa-regular fa-square-plus click-like like" data-id="${item.id}" hidden></i>
          <i class="fa-solid fa-square-check click-like" data-id="${item.id}"></i>`
    } else {
      rawHTML += `
          <i class="fa-regular fa-square-plus click-like like" data-id="${item.id}"></i>
          <i class="fa-solid fa-square-check click-like" data-id="${item.id}" hidden></i>`
    }

    rawHTML += `
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

function addToFavorite(id) {
  // 如果已在收藏清單，則終止函式
  const isAdded = favoriteList.some(user => user.id === id)
  if (isAdded) return

  const user = users.find(user => user.id === id)
  favoriteList.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteList))
}

function removeFromFavorite(id) {
  // 如果收藏清單為 null 或 []，則終止函式
  if (!favoriteList || !favoriteList.length) return

  const removeIndex = favoriteList.findIndex(user => user.id === id)
  // 如果收藏清單沒有該電影，則終止函式
  if (removeIndex === -1) return

  favoriteList.splice(removeIndex, 1)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteList))
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
  // 宣告 data 為陣列來源，如果 filteredUsers 非空陣列，則 data = filteredUsers，否則 data = users
  const data = filteredUsers.length ? filteredUsers : users
  const startIndex = (page - 1) * PER_PAGE
  return data.slice(startIndex, startIndex + PER_PAGE)
}

// 設置監聽器
userPanel.addEventListener('click', event => {
  const target = event.target
  const id = Number(target.dataset.id)
  if (!id) return

  if (target.matches('.click-more')) {
    showUserModal(id)
  } else if (target.matches('.click-like')) {
    if (target.matches('.like')) {
      target.hidden = true
      target.nextElementSibling.hidden = false
      addToFavorite(id)
    } else {
      target.hidden = true
      target.previousElementSibling.hidden = false
      removeFromFavorite(id)
    }
  }
})

searchForm.addEventListener('submit', event => {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredUsers = users.filter(user => {
    const matchedName = user.name.toLowerCase().includes(keyword)
    const matchedSurname = user.surname.toLowerCase().includes(keyword)
    return matchedName || matchedSurname
  })
  if (filteredUsers.length === 0) {
    return alert('Cannot find a user with: ' + keyword)
  }
  renderUserPanel(getUsersByPages(1))
  renderPaginator(filteredUsers)
  searchInput.value = ''
})

userPaginator.addEventListener('click', event => {
  if (event.target.tagName === 'A') {
    const page = Number(event.target.dataset.page)
    renderUserPanel(getUsersByPages(page))
  }
})

// 渲染 user panel
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results)
    renderUserPanel(getUsersByPages(1))
    renderPaginator(users)
  })
  .catch((err) => console.log(err))