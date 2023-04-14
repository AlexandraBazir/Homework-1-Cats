const container = document.querySelector(".container");

const user = "AlexandraBazir";
const path = `https://cats.petiteweb.dev/api/single/${user}`;

function createCard(cat, el = container) {
    const card = document.createElement("div");
    card.className = "card";
    if (!cat.image) {
        card.classList.add("default");
    } else {
        card.style.backgroundImage = `url(${cat.image})`;
    }
    const name = document.createElement("h3");
    name.innerText = cat.name;
    const like = document.createElement("i");
    like.className = "fa-heart card__like";
    like.classList.add(cat.favorite ? "fa-solid" : "fa-regular")
    like.addEventListener("click", e => {
        e.stopPropagation();
        if (cat.id) {
            fetch(`${path}/update/${cat.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ favorite: !cat.favorite })
            })
                .then(res => {
                    if (res.status === 200) {
                        like.classList.toggle("fa-solid");
                        like.classList.toggle("fa-regular");
                    }
                })
        }
    })
    const trash = document.createElement("i");
    trash.className = "fa-solid fa-trash-can card__trash";
    trash.title = "Удалить котика =(";
    trash.addEventListener("click", e => {
        e.stopPropagation();
        deleteCard(cat.id, e.currentTarget.parentElement);
    })
    const info = document.createElement("i");
    info.className = "fa-solid fa-circle-info card__info";
    info.addEventListener("click", e => {
        e.stopPropagation();
        modalInfo.style.display = "block";
        showCard(cat.id);
    })
    const edit = document.createElement("i");
    edit.className = "fa-solid fa-pencil card__edit";
    edit.title = "Редактировать котика";
    edit.addEventListener("click", e => {
        e.stopPropagation();
        modalEdit.style.display = "block";
        editCard(cat.id);
    })
    card.append(like, name, trash, info, edit);
    if (typeof cat.age === "number") {
        const age = document.createElement("span");
        age.innerText = setAge(cat.age);
        card.append(age);
    }
    el.append(card);
}

function deleteCard(id, el) {
    if (id) {
        fetch(`${path}/delete/${id}`, {
            method: "delete"
        })
            .then(res => {
                if (res.status === 200) {
                    el.remove();
                }
            })
    }
}

fetch(path + "/show")
    .then(function (res) {
        if (res.statusText === "OK") {
            return res.json();
        }
    })
    .then(function (data) {
        if (!data.length) {
            container.innerHTML = "<div class=\"empty\">У вас пока еще нет питомцев</div>"
        } else {
            for (let c of data) {
                createCard(c, container);
            }
        }
    })

const modalBox = document.querySelector(".modal-container");
const addButton = document.querySelector(".add-button");
const closeAdd = modalBox.querySelector(".close-add");
const addForm = document.forms.add;

addButton.addEventListener("click", e => {
    modalBox.style.display = "flex";
})

closeAdd.addEventListener("click", e => {
    modalBox.style = null;
})

addForm.addEventListener("submit", e => {
    const body = {};
    for (let i = 0; i < addForm.elements.length; i++) {
        const inp = addForm.elements[i];
        if (inp.name) {
            if (inp.type === "checkbox") {
                body[inp.name] = inp.checked
            } else {
                body[inp.name] = inp.value
            }
        }
    }
    fetch(path + "/add", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(res => {
            if (res.ok) {
                addForm.reset();
                modalBox.style = null;
                createCard(body);
            } else {
                return res.json();
            }
        })
        .then(err => {
            if (err && err.message) {
                alert(err.message);
            }
        });
})

let modalInfo = document.querySelector(".modal-info");
let modalContent = document.querySelector(".modal-content");
let closeInfo = modalInfo.querySelector(".close-info");

function showCard(id) {
    if (id) {
        fetch(`${path}/show/${id}`)
            .then(function (res) {
                if (res.statusText === "OK") {
                    return res.json();
                }
            })
            .then(function (data) {
                modalContent.lastElementChild.innerHTML = `
                <h2>${data.name}</h2>
                <h3>${typeof data.age === "number" ? setAge(data.age) : "Возраст не указан"}</h3>
                <p>${data.description || "Информации о котике пока нет..."}</p>
                <p class="rate">${setRate(data.rate)}</p>
            <img src=${data.image || "img/cats.png"} alt="${data.name}" class="modal-img">
            `;
            })
    }
}

closeInfo.onclick = function (event) {
    event.stopImmediatePropagation();
    modalInfo.style.display = "none";
}

function setRate(n) {
    let fill = "<img src='img/star-solid.png' alt='star-solid'>"
    let stroke = "<img src='img/star-regular.png' alt='star-regular'>"
    let rate = "", cnt = 5;
    for (let i = 0; i < cnt; i++) {
        rate += i < n ? fill : stroke;
    }
    return rate;
}

function setAge(n) {
    if (n % 100 < 11 || n % 100 > 14) {
        if (n % 10 === 1) {
            return n + " год";
        } else if (n % 10 >= 2 && n % 10 <= 4) {
            return n + " года";
        }
        return n + " лет";
    }
    return n + " лет";
}

let modalEdit = document.querySelector(".modal-edit");
let modalEditContent = document.querySelector(".modal-edit-content");
let closeEdit = modalEdit.querySelector(".close-edit");

function editCard(id) {
    if (id) {
        fetch(`${path}/show/${id}`)
            .then(function (res) {
                if (res.statusText === "OK") {
                    return res.json();
                }
            })
            .then(function (data) {
                modalEditContent.lastElementChild.innerHTML = `<h2>Изменить котика</h2>
                <label for="upd1">id котика</label>
                <input type="number" id="upd1" name="id" value="${data.id}" readonly>
                <label for="upd2">Имя котика</label>
                <input type="text" id="upd2" name="name" value="${data.name}" required>
                <label for="upd3">Возраст</label>
                <input type="number" id="upd3" name="age" value="${data.age}">
                <label for="upd4">Изображение</label>
                <input type="url" name="image" id="upd4" value="${data.image || ""}">  
                <label for="upd5">Рейтинг</label>
                <input type="number" name="rate" id="upd5" value="${data.rate}" min="0" max="5">
                <label>
                <input type="checkbox" name="favorite" ${data.favorite ? "checked" : ""}>
                Любимчик</label>
                <label for="upd7">Описание</label>
                <textarea name="description" id="upd7">${data.description || ""}</textarea>
                <button type="submit">Обновить</button>`;
            })
    }
}

closeEdit.onclick = function (event) {
    event.stopImmediatePropagation();
    modalEdit.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modalEdit || event.target == modalInfo || event.target == modalBox) {
        modalEdit.style.display = "none";
        modalInfo.style.display = "none";
        modalBox.style.display = "none";
    }
}

const updateForm = document.forms.update;


updateForm.addEventListener("submit", e => {
    const body = {};
    for (let i = 0; i < updateForm.elements.length; i++) {
        const inp = updateForm.elements[i];
        if (inp.name) {
            if (inp.type === "checkbox") {
                body[inp.name] = inp.checked
            } else {
                body[inp.name] = inp.value
            }
        }
    }
    console.log("upd", body);
    fetch(`${path}/update/${body.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(res => {
            if (res.ok) {
                updateForm.reset();
                modalEdit.style = null;


            } else {
                return res.json();
            }
        })
        .then(err => {
            if (err && err.message) {
                alert(err.message);
            }
        });
})