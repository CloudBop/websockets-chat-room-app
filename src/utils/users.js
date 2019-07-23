const users = []

const addUser = ({id, username, room}) => {
    // clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    // validate data
    if(!room || !username){
        return{
            error: "Username and room are required!"
        }
    }
    // check for existing user in this room
    const existingUser= users.find((user)=>{
        return user.room === room && user.username === username
    })
    // validate username
    if ( existingUser ){
        return {
            error: 'Username is in use'
        }
    }

    // store user
    const user= { id, username, room }
    users.push(user);
    // console.log(user)
    // console.log(users)
    return { user };
}

const removeUser = (id) => {
    // find index of user -1 if not found
    const index = users.findIndex((user)=>{
        return user.id === id;
    });


    if (index !== -1){
        return users.splice(index,1)[0]
    }
    
}

const getUser = (id) => {
    return users.find( (user) => user.id===id)
}

const getUsersInRoom = (room) => {
    // sanitise data
    // room = room.trim().toLowercase()
    // returns all users with in this room
    return users.filter((user)=> user.room ===room)
}

module.exports = {
    getUser,
    getUsersInRoom,
    removeUser,
    addUser
}