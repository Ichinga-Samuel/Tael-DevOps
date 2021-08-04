
let eye = document.querySelectorAll('.eye')
for(let i of eye){
    i.onclick = showPassword
}

let pwd = document.getElementById('pwd')
let cpwd = document.getElementById('cpwd')
if(cpwd){
    cpwd.addEventListener('blur', event => {
        if(pwd.value!==cpwd.value){
            event.target.classList.toggle('is-invalid')
        }
    })
}

let f = document.forms[0];
f.addEventListener('submit', event => {
    let err = document.getElementById('error')
    if (!f.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
    }
    else if(pwd.value!==cpwd.value){
        event.preventDefault()
        event.stopPropagation()
        err.textContent = "Password Confirmation Does not match password"
    }
})

function showPassword() {
    let pwd = this.previousElementSibling
    let type = pwd.getAttribute('type') === 'password' ? 'text' : 'password'
    pwd.setAttribute('type', type)
    this.textContent = this.textContent === 'visibility' ? 'visibility_off': 'visibility'
}