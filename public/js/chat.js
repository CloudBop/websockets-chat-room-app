const socket = io();

// server (emit) -> client (receieve) -- acknowldgement --> server
// client (emit) -> server (receieve) -- acknowldgement --> client

// socket.on('countUpdated', (count)=>{
//     console.log('countupdated', count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     // console.log('clicked')
//     socket.emit('increment')
// });

// elements
const $messageForm = document.querySelector(`#message-form`)
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
// message container
const $messages = document.querySelector('#messages')
// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix:true} )
//
const autoscroll = ()=>{
    // newest msg el created
    const $newMessage = $messages.lastElementChild

    // height of new message
    // `````````````````````
    // - get currently applied styles
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //
    // - Visible height
    const visibleHeight = $messages.offsetHeight
    //
    // - height of msg container
    const containerHeight = $messages.scrollHeight
    //
    // - How far currently scrolled
    const scrollOffset = $messages.scrollTop +visibleHeight
    //
    // - (msgcont - newmsg) <= scrollOffset
    if ( containerHeight - newMessageHeight <= scrollOffset ) {
        $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on('message', (message) => {
    // console.log(message)
    const html= Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message) => {

    const html= Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})

socket.on('roomData', ({room, users})=>{
    // console.log(room)
    // console.log(users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });

    //console.log(sidebarTemplate)

    document.querySelector('#sidebar').innerHTML = html
} )

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '';
        $messageFormInput.focus();
        // acknowledgement has to be last argument of emit
        if (error){
            return console.log(error)
        }

        // console.log(`Message Delivered`)
    })
})


$sendLocation.addEventListener('click', ()=>{
    
    if (!navigator.geolocation) {
        return alert('geolocation is not supported in your browser');
    }
    $sendLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition( (position)=>{
        // console.log(position);

        socket.emit('sendLocation', {
            lat: position.coords.latitude,
            lon: position.coords.longitude
        },
        // acknowledgement
        (msg)=>{
            if (msg) console.log(msg);

            $sendLocation.removeAttribute('disabled')
        });

    })

})

socket.emit('join', {username, room}, (error)=>{

    if(error) {
        alert(error)
        location.href = '/'
    }
})