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
        card.append(like, name, trash, info);
        if (cat.age >= 0) {
            const age = document.createElement("span");
            age.innerText = cat.age;
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
const modalClose = modalBox.querySelector(".modal-close");
const addForm = document.forms.add;

addButton.addEventListener("click", e => {
    modalBox.style.display = "flex";
})

modalClose.addEventListener("click", e => {
    modalBox.style = null;
})

addForm.addEventListener("submit", e => {
    e.preventDefault(); // остановить действие по умолчанию
    const body = {};
    console.log(addForm.children); // дочерние теги (прямые потомки)
    console.log(addForm.elements); // все элементы формы (input и т.д.)

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

    // коммент

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
            <img src=${data.image || "img/cat3.png"} alt="${data.name}" class="modal-img">
            `;  
            })
    }
}

let modalInfo = document.querySelector(".modal-info");
let modalContent = document.querySelector(".modal-content");
let closeInfo = modalInfo.querySelector(".close-info");

closeInfo.onclick = function (event) {
    event.stopImmediatePropagation();
    console.log(event.currentTarget);
    modalInfo.style.display = "none";
}

window.onclick = function (event) {
    if (event.target == modalInfo) {
        console.log(event.currentTarget);
        modalInfo.style.display = "none";
    }
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

    