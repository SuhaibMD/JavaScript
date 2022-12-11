const it = document.getElementsByClassName("item");
const bt = document.getElementsByClassName("iconsOpen");
const hd = document.getElementsByClassName("hidden-box");

for (let i = 0; i < it.length; i++) {
    let el = it[i]; 
    el.addEventListener('click', () => {
       const result = el.classList.toggle('active');
       if(result){
        bt[i].style.rotate = "180deg";
    }
    else{
        bt[i].style.rotate = "0deg";
        
    }
    setTimeout(() => {
        el.classList.remove('active');
        bt[i].style.rotate = "0deg";

       }, 3000);
    })

}

// function open(element) {
//             console.log('sd');
//             if (element.className.includes('active')) {
//                 element.classList.remove('active')
//                 element.style.rotate = "180deg";
//             }
//             else {
//                 element.classList.add('active')
//                 element.style.rotate = "0deg";

//             }
//         }