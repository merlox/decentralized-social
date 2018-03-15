// Remember that we are using ropsten for this application. Once completed we may deploy it to the mainnet for public use
window.web3 = new Web3(window.web3 ? window.web3.currentProvider : new Web3.providers.HttpProvider('https://ropsten.infura.io'));

const contractABI = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"messages","outputs":[{"name":"content","type":"string"},{"name":"writtenBy","type":"address"},{"name":"timestamp","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"userInfo","outputs":[{"name":"name","type":"bytes32"},{"name":"occupation","type":"bytes32"},{"name":"bio","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_occupation","type":"bytes32"},{"name":"_bio","type":"string"}],"name":"setProfile","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"lastMessageId","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"userFollowers","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"userMessages","outputs":[{"name":"content","type":"string"},{"name":"writtenBy","type":"address"},{"name":"timestamp","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_user","type":"address"}],"name":"followUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_content","type":"string"}],"name":"writeMessage","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getMyFollows","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_user","type":"address"}],"name":"unfollowUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}]
const contractAddress = '0x8f38df8b478c225ca2fce3c65b8abe7e49d0116b'
const contractInstance = web3.eth.contract(contractABI).at(contractAddress)

function start() {
    initMyProfile()
    initMessages()
    initPeopleFollow()
}

function initMyProfile() {
    // The userInfo is a public variable, which allows us to execute it as a function with the right parameters to get its value
    contractInstance.userInfo(web3.eth.accounts[0], (err, myProfile) => {
        if(err) return alert(err)

        let profileContent = ''
        let myName = web3.toUtf8(myProfile[0])
        let myOccupation = web3.toUtf8(myProfile[1])
        let myBio = myProfile[2]

        profileContent += `
            Name: <span id="my-name">${myName}</span> <br/>
            Occupation: <span id="my-occupation">${myOccupation}</span> <br/>
            Bio: <span id="my-bio">${myBio}</span> <br/>
            <button id="set-profile-button" class="align-center" onclick="setProfile()">Set Profile</button>`
        document.querySelector('#profile-content').innerHTML = profileContent
    })
}

function setProfile() {
    let profileContent = `Name: <input type="text" id="set-profile-name" placeholder="Type your name..."/> <br/><br/>
        Occupation: <input type="text" id="set-profile-occupation" placeholder="Type your occupation..."/> <br/><br/>
        Bio: <input type="text" id="set-profile-bio" placeholder="Type your bio..."/> <br/><br/>
        <button onclick="saveSetProfile(
            document.querySelector('#set-profile-name').value,
            document.querySelector('#set-profile-occupation').value,
            document.querySelector('#set-profile-bio').value
        )">Save Changes</button>
        <button onclick="cancelSetProfile()">Cancel Changes</button>`

    document.querySelector('#profile-content').innerHTML = profileContent
}

function saveSetProfile(name, occupation, bio) {
    contractInstance.setProfile(name, occupation, bio, (err, result) => {
        console.log(err, result)
        initMyProfile()
    })
}

function cancelSetProfile() {
    start()
}

function initDummyPeopleToFollow() {
    let users = [
        {
            name: "John",
            occupation: "Web App Developer",
            bio: "Suspendisse tempus, felis non convallis elementum, lectus urna eleifend augue, quis tristique felis ante sit amet elit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.",
            isFollowing: false
        }, {
            name: "Jessica",
            occupation: "Graphic Designer",
            bio: "Quisque sapien mauris, rhoncus quis odio sed, ultrices molestie massa. Sed eu lorem quis velit egestas lobortis. In aliquam mauris eros, id varius turpis sagittis et.",
            isFollowing: true
        }, {
            name: "Veronica",
            occupation: "Blockchain Developer",
            bio: "Aenean egestas at tellus tempor faucibus. Morbi mattis metus in ex malesuada, faucibus eleifend ante interdum.",
            isFollowing: false
        }, {
            name: "Randy",
            occupation: "Youtuber",
            bio: "Phasellus nibh massa, sagittis nec odio sit amet, porttitor vestibulum urna. Nam lorem justo, pretium et nisl ac, ullamcorper tempus leo.",
            isFollowing: false
        }, {
            name: "Rick",
            occupation: "Backend Developer",
            bio: "Curabitur eros ante, tempor sit amet sagittis ac, tincidunt quis quam. Aenean vitae diam sodales, maximus dolor at, posuere odio. Phasellus id tortor faucibus, sagittis leo a, egestas metus.",
            isFollowing: true
        }
    ]
    localStorage.users = JSON.stringify(users)
}

function initPeopleFollow() {
    contractInstance.getMyFollows((err, followerAddresses) => {
        let sectionContent = ''
        for(let i = 0; i < followerAddresses.length; i++) {
            contractInstance.userInfo(followerAddresses[i], (err, userInfo) => {
                sectionContent += `<div id="people-to-follow-${i}" class="user-box">
                    Name: <span>${web3.toUtf8(userInfo[0])}</span> <br/>
                    Occupation: <span>${web3.toUtf8(userInfo[1])}</span> <br/>
                    Bio: <span>${users[3]}</span> <br/>
                    <button class="following-button" onclick="unfollowUser(${i})">Following</button>
                </div>`

                document.querySelector('#people-to-follow').innerHTML = sectionContent
            })
        }
    })
}

function unfollowUser(id) {
    let users = JSON.parse(localStorage.users)
    users[id].isFollowing = false
    localStorage.users = JSON.stringify(users)
    initPeopleFollow()
}

function followUser(id) {
    let users = JSON.parse(localStorage.users)
    users[id].isFollowing = true
    localStorage.users = JSON.stringify(users)
    initPeopleFollow()
}

function sendMessage(message) {
    contractInstance.writeMessage(message, (err, result) => {
        console.log(err, result)
    })
    initMessages()
}

function initMessages() {
    contractInstance.lastMessageId((err, maxMessages) => {
        let sectionContent = ''
        maxMessages = maxMessages.toNumber()
        for(let i = 0; i < maxMessages; i++) {
            contractInstance.messages(i, (err, message) => {
                sectionContent += `<div class="message-box">
                    <div>${message[1]} says:</div>
                    <div>${message[0]}</div>
                </div>`

                if(i === maxMessages - 1) document.querySelector('#messages').innerHTML = sectionContent
            })
        }
    })
}

function initDummyProfile() {
    localStorage.myProfile = JSON.stringify({
        name: "Anonymous",
        occupation: "Beep",
        bio: "I'm just a bot"
    })
    initMyProfile()
}

start()
